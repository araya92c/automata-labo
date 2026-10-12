const state = {
  view: "panel",
  mode: "config",
  power: true,
  estop: false,
  auto: false,
  temp: 24,
  onAt: 30,
  offAt: 27,
  sensorHigh: false,
  output: false,
  latch: false,
  compiled: false,
  inputs: { start: false, stop: false },
  wires: { supply: true, sensor: true, output: true },
  trace: Array.from({length: 44}, () => ({temp: 24, out: 0})),
  fault: null,
  diagActive: false,
  readings: [],
  diagSolved: false,
  feedback: "",
  feedbackType: "",
  missions: JSON.parse(localStorage.getItem("automata-lab-progress") || "{}")
};

const faults = {
  noSupply: { label: "Ausencia de alimentación", hint: "Comprueba primero la fuente de 24 V." },
  sensorOpen: { label: "Sensor desconectado", hint: "La fuente está bien, pero la señal no llega a la entrada." },
  outputOpen: { label: "Conductor de salida interrumpido", hint: "La salida del controlador cambia, pero el actuador no recibe tensión." },
  estopActive: { label: "Parada de emergencia activada", hint: "La seguridad inhibe la salida aun cuando la lógica solicita marcha." }
};

const views = {
  panel: { title: "Panel de operación", kicker: "Sistema de ventilación", desc: "Observa cómo fluye la información desde el sensor hasta el actuador." },
  config: { title: "Controlador configurable", kicker: "Unidad 1", desc: "Ajusta el encendido, el apagado y la histéresis sin escribir un programa." },
  program: { title: "Controlador programable", kicker: "Unidad 2", desc: "Compila una rutina Ladder de marcha, parada, sensor y enclavamiento." },
  diagnose: { title: "Diagnóstico de fallas", kicker: "Taller práctico", desc: "Mide antes de intervenir: observa, compara y fundamenta tu diagnóstico." }
};

function effectivePower() { return state.power && !(state.diagActive && state.fault === "noSupply"); }
function effectiveSensorWire() { return state.wires.sensor && !(state.diagActive && state.fault === "sensorOpen"); }
function effectiveOutputWire() { return state.wires.output && !(state.diagActive && state.fault === "outputOpen"); }
function safetyOpen() { return state.estop || (state.diagActive && state.fault === "estopActive"); }

function updateLogic() {
  if (state.temp >= state.onAt) state.sensorHigh = true;
  if (state.temp <= state.offAt) state.sensorHigh = false;

  const ready = effectivePower() && state.wires.supply && effectiveSensorWire() && !safetyOpen();
  if (!ready) {
    state.output = false;
    state.latch = false;
    return;
  }

  if (state.mode === "config") {
    state.output = state.sensorHigh && effectiveOutputWire();
  } else {
    if (!state.compiled || state.inputs.stop || !state.sensorHigh) state.latch = false;
    if (state.compiled && state.inputs.start && !state.inputs.stop && state.sensorHigh) state.latch = true;
    state.output = state.latch && effectiveOutputWire();
  }
}

function saveProgress() {
  localStorage.setItem("automata-lab-progress", JSON.stringify(state.missions));
}

function missionCheck() {
  state.missions.wiring = state.wires.supply && state.wires.sensor && state.wires.output;
  if (state.onAt === 30 && state.offAt === 27 && state.output && state.temp >= 30) state.missions.hysteresis = true;
  if (state.compiled && state.mode === "program" && state.output) state.missions.program = true;
  if (state.diagSolved) state.missions.diagnose = true;
  saveProgress();
}

function setView(view) {
  state.view = view;
  if (view === "config") state.mode = "config";
  if (view === "program") state.mode = "program";
  state.feedback = "";
  updateLogic();
  render();
}

function statusText() {
  if (!effectivePower()) return "SIN ENERGÍA";
  if (safetyOpen()) return "SEGURIDAD ACTIVA";
  return state.output ? "ACTUADOR ENCENDIDO" : "SISTEMA LISTO";
}

function processDiagram() {
  const powerActive = effectivePower() && state.wires.supply;
  const sensorActive = powerActive && effectiveSensorWire();
  const controllerActive = sensorActive && !safetyOpen();
  const actuatorActive = state.output;
  return `
    <div class="training-bench" aria-label="Panel didáctico con componentes industriales">
      <div class="bench-title"><span>PANEL DIDÁCTICO · 24 VDC</span><span>${state.mode === "config" ? "CONTROL ON/OFF" : "PLC · RUN"}</span></div>
      <div class="din-rail"></div>
      <div class="bench-grid">
        <article class="real-device ${powerActive ? "active" : "fault"}" data-kind="power">
          <span class="status-led" aria-hidden="true"></span><img class="component-img" src="./assets/power-supply.webp" alt="Fuente de alimentación industrial de 24 voltios">
          <div class="component-label"><b>Fuente 24 VDC</b><span>PS1 · ${powerActive ? "24.0 V" : "0.0 V"}</span></div>
        </article>
        <article class="real-device ${sensorActive ? "active" : "fault"}" data-kind="sensor">
          <span class="status-led" aria-hidden="true"></span><img class="component-img" src="./assets/temperature-sensor.webp" alt="Sensor industrial de temperatura">
          <div class="component-label"><b>Sensor de temperatura</b><span>AI0 · ${state.temp.toFixed(1)} °C</span></div>
        </article>
        <article class="real-device ${controllerActive ? "active" : "fault"}" data-kind="plc">
          <span class="status-led" aria-hidden="true"></span><img class="component-img" src="./assets/plc.webp" alt="Controlador lógico programable compacto">
          <div class="component-label"><b>${state.mode === "config" ? "Relé configurable" : "PLC compacto"}</b><span>${state.mode === "config" ? `ON ${state.onAt}° · OFF ${state.offAt}°` : state.compiled ? "PROGRAMA COMPILADO" : "STOP"}</span></div>
        </article>
        <article class="real-device ${actuatorActive ? "active" : effectiveOutputWire() ? "" : "fault"}" data-kind="fan">
          <span class="status-led" aria-hidden="true"></span><span class="fan-motion" aria-hidden="true"></span><img class="component-img" src="./assets/fan.webp" alt="Ventilador axial industrial de 24 voltios">
          <div class="component-label"><b>Ventilador 24 VDC</b><span>Q0.0 · ${actuatorActive ? "EN MARCHA" : "DETENIDO"}</span></div>
        </article>
      </div>
      <div class="cable-bank" aria-label="Conductores del panel">
        <div class="cable-run"><span>+24V / 0V</span><i class="cable ${powerActive ? "live" : ""}"></i><b class="cable-state">${powerActive ? "24V" : "0V"}</b></div>
        <div class="cable-run"><span>AI0 · SENSOR</span><i class="cable signal ${sensorActive ? "live" : ""}"></i><b class="cable-state">${sensorActive ? "0–10V" : "0V"}</b></div>
        <div class="cable-run"><span>Q0.0 · MOTOR</span><i class="cable output ${actuatorActive ? "live" : ""}"></i><b class="cable-state">${actuatorActive ? "24V" : "0V"}</b></div>
      </div>
    </div>
    <div class="io-strip">
      <div class="io ${effectivePower() ? "on" : ""}"><b>PS · 24 VDC</b><span>${effectivePower() ? "Alimentación correcta" : "0 V"}</span></div>
      <div class="io ${state.sensorHigh ? "on" : ""}"><b>I0.2 · TEMP_ALTA</b><span>${state.sensorHigh ? "1 lógico" : "0 lógico"}</span></div>
      <div class="io ${!safetyOpen() ? "on" : ""}"><b>I0.1 · SEGURIDAD</b><span>${safetyOpen() ? "Circuito abierto" : "Circuito cerrado"}</span></div>
      <div class="io ${state.output ? "on" : ""}"><b>Q0.0 · VENTILADOR</b><span>${state.output ? "24 V" : "0 V"}</span></div>
    </div>`;
}

function chartSvg() {
  const w = 620, h = 170, min = 18, max = 42;
  const tPts = state.trace.map((d,i) => `${(i/(state.trace.length-1))*w},${h-((d.temp-min)/(max-min))*h}`).join(" ");
  const oPts = state.trace.map((d,i) => `${(i/(state.trace.length-1))*w},${d.out ? 18 : h-18}`).join(" ");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Tendencia de temperatura y estado de la salida">
    <line class="chart-grid" x1="0" y1="42" x2="620" y2="42"/><line class="chart-grid" x1="0" y1="85" x2="620" y2="85"/><line class="chart-grid" x1="0" y1="128" x2="620" y2="128"/>
    <polyline class="chart-output" points="${oPts}"/><polyline class="chart-line" points="${tPts}"/>
  </svg><div class="legend"><span><i class="dot" style="background:#17624d"></i>Temperatura</span><span><i class="dot" style="background:#d6a843"></i>Salida Q0.0</span></div>`;
}

function panelView() {
  return `<div class="grid-two">
    <section class="card panel"><div class="row"><div><h2>Lazo Entrada → Control → Salida</h2><p class="helper">La línea dorada indica circulación de señal o energía.</p></div><span class="mode-chip">${statusText()}</span></div>${processDiagram()}</section>
    <section class="card panel"><h2>Tendencia en tiempo real</h2><p class="helper">La salida enfría el tablero cuando se encuentra activa.</p><div style="margin-top:14px">${chartSvg()}</div></section>
  </div>`;
}

function configView() {
  const hyst = state.onAt - state.offAt;
  const posOff = Math.max(0,Math.min(100,((state.offAt-20)/20)*100));
  const posOn = Math.max(0,Math.min(100,((state.onAt-20)/20)*100));
  return `<div class="grid-two">
    <section class="card panel">
      <h2>Ajuste del control ON/OFF</h2><p class="helper">El ventilador enciende al alcanzar el límite superior y se mantiene encendido hasta bajar al límite inferior.</p>
      <div class="thresholds" style="margin-top:16px">
        <label class="value-box">Encender a<strong>${state.onAt} °C</strong><input id="onAt" type="range" min="24" max="38" step="1" value="${state.onAt}"></label>
        <label class="value-box">Apagar a<strong>${state.offAt} °C</strong><input id="offAt" type="range" min="20" max="35" step="1" value="${state.offAt}"></label>
      </div>
      <div class="band"><span class="marker" data-label="OFF ${state.offAt}°" style="left:${posOff}%"></span><span class="marker" data-label="ON ${state.onAt}°" style="left:${posOn}%"></span></div>
      <div class="notice"><strong>Histéresis: ${hyst} °C.</strong> ${hyst < 2 ? "Es muy pequeña: pueden ocurrir conmutaciones frecuentes." : hyst > 8 ? "Es amplia: el sistema reaccionará con mayor demora." : "El margen evita encendidos y apagados continuos."}</div>
      ${hyst <= 0 ? '<div class="feedback bad" style="margin-top:10px">El valor de apagado debe ser menor que el valor de encendido.</div>' : ''}
    </section>
    <section class="card panel">
      <h2>Comportamiento esperado</h2><table class="truth"><thead><tr><th>Condición</th><th>Salida</th></tr></thead><tbody>
      <tr class="${state.temp <= state.offAt ? "current" : ""}"><td>T° ≤ ${state.offAt} °C</td><td>Apagada</td></tr>
      <tr class="${state.temp > state.offAt && state.temp < state.onAt ? "current" : ""}"><td>${state.offAt}° &lt; T° &lt; ${state.onAt}°</td><td>Mantiene estado</td></tr>
      <tr class="${state.temp >= state.onAt ? "current" : ""}"><td>T° ≥ ${state.onAt} °C</td><td>Encendida</td></tr></tbody></table>
      <div class="divider"></div><h3>Prueba de puesta en operación</h3><p class="helper">Configura ON = 30 °C y OFF = 27 °C. Luego sube la temperatura sobre 30 °C y observa la salida.</p>
    </section>
  </div><section class="card panel" style="margin-top:16px">${processDiagram()}</section>`;
}

function programView() {
  const startActive = state.inputs.start || state.latch;
  return `<div class="grid-two">
    <section class="card panel">
      <div class="row"><div><h2>Rutina Ladder</h2><p class="helper">Una línea energizada debe recorrer todos los contactos antes de activar la bobina.</p></div><span class="mode-chip">RUNG 001</span></div>
      <div class="ladder-shell" style="margin-top:15px"><div class="ladder"><div class="rail"></div><div class="rung">
        <div class="contact ${startActive ? "active" : ""}"><div class="contact-name">I0.0 / Q0.0</div><div class="contact-symbol">OR</div><span class="helper">Marcha + sello</span></div>
        <div class="contact nc ${!state.inputs.stop ? "active" : ""}"><div class="contact-name">I0.1</div><div class="contact-symbol"></div><span class="helper">Parada NC</span></div>
        <div class="contact ${state.sensorHigh ? "active" : ""}"><div class="contact-name">I0.2</div><div class="contact-symbol">NO</div><span class="helper">Temp. alta</span></div>
        <div class="branch"></div><div class="coil ${state.output ? "active" : ""}">Q0.0</div>
      </div><div class="rail"></div></div></div>
      <div class="codebox"><em>Q0.0</em> := (I0.0 OR Q0.0) AND NOT I0.1 AND I0.2;</div>
      <div class="input-bank">
        <button class="input-btn ${state.inputs.start ? "on" : ""}" data-input="start">I0.0 · MARCHA</button>
        <button class="input-btn ${state.inputs.stop ? "on" : ""}" data-input="stop">I0.1 · PARADA</button>
        <button class="input-btn ${state.sensorHigh ? "on" : ""}" disabled>I0.2 · TEMP_ALTA</button>
      </div>
    </section>
    <section class="card panel">
      <img class="plc-portrait" src="./assets/plc.webp" alt="PLC compacto del simulador"><h2>Compilación y prueba</h2><p class="helper">1. Lleva la temperatura a 30 °C o más. 2. Compila. 3. Activa MARCHA. 4. Comprueba PARADA.</p>
      <div class="divider"></div>
      <div class="row"><span>Estado del programa</span><strong>${state.compiled ? "Compilado" : "Sin compilar"}</strong></div>
      <div class="row" style="margin-top:9px"><span>Bobina Q0.0</span><strong>${state.output ? "ENERGIZADA" : "DESENERGIZADA"}</strong></div>
      <button id="compile" class="btn primary full" style="margin-top:18px">${state.compiled ? "Volver a compilar" : "Compilar programa"}</button>
      <button id="resetPlc" class="btn full" style="margin-top:8px">Reiniciar PLC</button>
      ${state.feedback ? `<div class="feedback ${state.feedbackType}" style="margin-top:10px">${state.feedback}</div>` : ""}
    </section>
  </div>`;
}

function voltageAt(point) {
  const supply = effectivePower() && state.wires.supply ? 24 : 0;
  const sensorV = supply && effectiveSensorWire() ? Math.max(0,Math.min(10,(state.temp-20)/2)) : 0;
  const inputV = sensorV;
  const controlOut = supply && !safetyOpen() && state.sensorHigh ? 24 : 0;
  const actuatorV = controlOut && effectiveOutputWire() ? 24 : 0;
  return ({p1:supply,p2:sensorV,p3:inputV,p4:controlOut,p5:actuatorV})[point] ?? 0;
}

function diagnoseView() {
  const meter = state.readings.length ? state.readings[state.readings.length-1].value.toFixed(1) : "---";
  return `<div class="grid-two">
    <section class="card panel">
      <div class="row"><div><h2>Multímetro virtual</h2><p class="helper">Modo tensión continua. Selecciona puntos de prueba siguiendo el circuito.</p></div><span class="mode-chip">V⎓</span></div>
      <div class="meter-real"><img src="./assets/multimeter.png" alt="Multímetro digital con puntas de prueba"><div class="meter-screen">${meter} <small>V</small></div><div class="meter-mode">V⎓</div></div>
      <div class="testpoints">
        <button class="testpoint" data-point="p1"><b>P1 · Fuente</b>Salida 24 VDC</button>
        <button class="testpoint" data-point="p2"><b>P2 · Sensor</b>Señal analógica</button>
        <button class="testpoint" data-point="p3"><b>P3 · Entrada</b>Borne AI0</button>
        <button class="testpoint" data-point="p4"><b>P4 · Salida</b>Borne Q0.0</button>
        <button class="testpoint" data-point="p5"><b>P5 · Actuador</b>Bornes del motor</button>
      </div>
    </section>
    <section class="card panel">
      <h2>Orden de trabajo</h2><p class="helper">El sistema presenta una falla. Obtén evidencias antes de elegir el diagnóstico.</p>
      <button id="newFault" class="btn gold full">${state.diagActive ? "Generar otra falla" : "Iniciar diagnóstico"}</button>
      <div class="log" style="margin-top:12px">${state.readings.length ? state.readings.map(r=>`<p>${r.time} · ${r.name}: <strong>${r.value.toFixed(1)} V</strong></p>`).join("") : "Aún no hay mediciones registradas."}</div>
      <label style="margin-top:12px">Conclusión
        <select id="diagnosis" ${state.diagActive ? "" : "disabled"}><option value="">Selecciona una falla…</option>${Object.entries(faults).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("")}</select>
      </label>
      <button id="checkDiagnosis" class="btn primary full" style="margin-top:10px" ${state.diagActive ? "" : "disabled"}>Comprobar diagnóstico</button>
      ${state.feedback ? `<div class="feedback ${state.feedbackType}" style="margin-top:10px">${state.feedback}</div>` : ""}
    </section>
  </div>`;
}

function sidebar() {
  const wireParts = {
    supply: {label:"Fuente → Control", image:"./assets/power-supply.webp"},
    sensor: {label:"Sensor → Entrada", image:"./assets/temperature-sensor.webp"},
    output: {label:"Salida → Motor", image:"./assets/fan.webp"}
  };
  return `<aside class="sidebar">
    <section class="card side-card"><p class="eyebrow">Variable de proceso</p><div class="row"><span>Temperatura</span><span class="metric">${state.temp.toFixed(1)}<small> °C</small></span></div>
      <input id="temp" aria-label="Temperatura simulada" type="range" min="20" max="40" step="0.5" value="${state.temp}">
      <button id="auto" class="btn full ${state.auto ? "danger" : ""}" style="margin-top:10px">${state.auto ? "Detener proceso" : "Simular proceso"}</button>
    </section>
    <section class="card side-card"><p class="eyebrow">Cableado</p>
      ${Object.entries(wireParts).map(([k,part])=>`<div class="switch-row"><div class="wire-asset"><img class="wire-thumb" src="${part.image}" alt=""><span>${part.label}</span></div><button class="switch ${state.wires[k] ? "on" : ""}" data-wire="${k}" aria-label="${part.label}" aria-pressed="${state.wires[k]}"></button></div>`).join("")}
    </section>
    <section class="card side-card"><p class="eyebrow">Modo de control</p><div class="stack"><button class="btn ${state.mode === "config" ? "primary" : ""}" data-mode="config">Configurable ON/OFF</button><button class="btn ${state.mode === "program" ? "primary" : ""}" data-mode="program">Programable PLC</button></div></section>
  </aside>`;
}

function missionRail() {
  const items = [
    ["wiring","Cerrar el lazo","Conecta alimentación, sensor y actuador."],
    ["hysteresis","Ajustar histéresis","Usa ON 30 °C y OFF 27 °C; prueba la salida."],
    ["program","Ejecutar Ladder","Compila y energiza Q0.0 con la rutina."],
    ["diagnose","Diagnosticar","Identifica una falla usando mediciones."]
  ];
  const done = items.filter(i=>state.missions[i[0]]).length;
  return `<aside class="mission-rail"><div><p class="eyebrow">Ruta de aprendizaje</p><h2>Misiones</h2><div class="progress"><span style="width:${done/items.length*100}%"></span></div><p class="helper">${done} de ${items.length} completadas</p></div><div>${items.map(i=>`<div class="mission ${state.missions[i[0]] ? "done" : ""}"><span class="mission-check">✓</span><div><strong>${i[1]}</strong><p>${i[2]}</p></div></div>`).join("")}<button id="resetProgress" class="btn full" style="margin-top:12px">Reiniciar progreso</button></div></aside>`;
}

function render() {
  updateLogic();
  missionCheck();
  const v = views[state.view];
  document.getElementById("app").innerHTML = `
    <header class="topbar"><div class="brand"><div class="brand-mark">AL</div><div><strong>Autómata Lab</strong><span>Introducción a la Automatización y Robótica</span></div></div>
      <nav class="nav" aria-label="Módulos del simulador">${Object.entries({panel:"Operación",config:"Configurar",program:"Programar",diagnose:"Diagnosticar"}).map(([k,label])=>`<button data-view="${k}" class="${state.view===k?"active":""}">${label}</button>`).join("")}</nav>
      <div class="global-status"><span class="status-pill">24 VDC · <b>${statusText()}</b></span><button id="estop" class="estop ${state.estop?"on":""}">${state.estop?"REARMAR":"PARADA"}</button></div>
    </header>
    <div class="workspace">${sidebar()}<main class="content"><div class="page-head"><div><p class="eyebrow">${v.kicker}</p><h1>${v.title}</h1><p class="helper">${v.desc}</p></div><span class="mode-chip">${state.mode === "config" ? "CONTROL CONFIGURABLE" : "CONTROL PROGRAMABLE"}</span></div>
      ${state.view === "panel" ? panelView() : state.view === "config" ? configView() : state.view === "program" ? programView() : diagnoseView()}
    </main>${missionRail()}</div>`;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>setView(b.dataset.view));
  document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>setView(b.dataset.mode === "config" ? "config" : "program"));
  document.querySelectorAll("[data-wire]").forEach(b=>b.onclick=()=>{ state.wires[b.dataset.wire]=!state.wires[b.dataset.wire]; render(); });
  const temp = document.getElementById("temp"); if (temp) temp.oninput=e=>{ state.temp=+e.target.value; tickTrace(); render(); };
  const auto = document.getElementById("auto"); if (auto) auto.onclick=()=>{ state.auto=!state.auto; render(); };
  const estop = document.getElementById("estop"); if (estop) estop.onclick=()=>{ state.estop=!state.estop; state.latch=false; render(); };
  const onAt = document.getElementById("onAt"); if (onAt) onAt.oninput=e=>{ state.onAt=+e.target.value; if(state.offAt>=state.onAt) state.offAt=state.onAt-1; render(); };
  const offAt = document.getElementById("offAt"); if (offAt) offAt.oninput=e=>{ state.offAt=+e.target.value; if(state.offAt>=state.onAt) state.onAt=state.offAt+1; render(); };
  document.querySelectorAll("[data-input]").forEach(b=>b.onclick=()=>{ state.inputs[b.dataset.input]=!state.inputs[b.dataset.input]; if(b.dataset.input==="start" && state.inputs.start) state.inputs.stop=false; if(b.dataset.input==="stop" && state.inputs.stop) {state.inputs.start=false;state.latch=false;} render(); });
  const compile=document.getElementById("compile"); if(compile) compile.onclick=()=>{ state.compiled=true; state.feedback="Programa compilado sin errores. Prueba las entradas I0.0, I0.1 e I0.2."; state.feedbackType="ok"; render(); };
  const resetPlc=document.getElementById("resetPlc"); if(resetPlc) resetPlc.onclick=()=>{ state.compiled=false;state.latch=false;state.inputs={start:false,stop:false};state.feedback="PLC reiniciado.";state.feedbackType="ok";render(); };
  const newFault=document.getElementById("newFault"); if(newFault) newFault.onclick=()=>{ const keys=Object.keys(faults); state.fault=keys[Math.floor(Math.random()*keys.length)];state.diagActive=true;state.diagSolved=false;state.readings=[];state.feedback="Falla generada. Comienza comprobando la alimentación.";state.feedbackType="ok";state.temp=35;state.mode="config";render(); };
  document.querySelectorAll("[data-point]").forEach(b=>b.onclick=()=>{ if(!state.diagActive){state.feedback="Primero inicia un diagnóstico.";state.feedbackType="bad";render();return;} const names={p1:"Fuente",p2:"Salida sensor",p3:"Entrada AI0",p4:"Salida Q0.0",p5:"Bornes motor"}; const value=voltageAt(b.dataset.point);state.readings.push({name:names[b.dataset.point],value,time:new Date().toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit",second:"2-digit"})});render(); });
  const check=document.getElementById("checkDiagnosis"); if(check) check.onclick=()=>{ const choice=document.getElementById("diagnosis").value; if(!choice){state.feedback="Selecciona una conclusión antes de comprobar.";state.feedbackType="bad";} else if(choice===state.fault){state.feedback=`Diagnóstico correcto: ${faults[state.fault].label}. La decisión está respaldada por tus mediciones.`;state.feedbackType="ok";state.diagSolved=true;} else {state.feedback=`Aún no coincide. Pista: ${faults[state.fault].hint}`;state.feedbackType="bad";} render(); };
  const resetProgress=document.getElementById("resetProgress"); if(resetProgress) resetProgress.onclick=()=>{state.missions={};state.diagSolved=false;saveProgress();render();};
}

function tickTrace() {
  updateLogic();
  state.trace.push({temp: state.temp, out: state.output ? 1 : 0});
  if (state.trace.length > 44) state.trace.shift();
}

setInterval(()=>{
  if (!state.auto) return;
  updateLogic();
  const delta = state.output ? -0.32 : 0.22;
  state.temp = Math.max(20,Math.min(40,state.temp + delta));
  tickTrace();
  render();
}, 700);

render();
