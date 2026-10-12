const state = {
  view: "panel",
  mode: "config",
  power: true,
  estop: false,
  auto: false,
  systemEnabled: false,
  level: 0,
  lowLevel: 30,
  highLevel: 75,
  levelLow: false,
  levelHigh: false,
  fillDemand: false,
  pumpCommand: false,
  output: false,
  drainOpen: false,
  manualPump: false,
  alarm: false,
  alarmAck: false,
  relayPage: "run",
  relaySaved: false,
  scenario: 'level',
  missionOpen: false,
  latch: false,
  compiled: false,
  inputs: { start: false, stop: false },
  wires: { supply: true, sensor: true, output: true },
  chartOpen: false,
  ladderOpen: false,
  ladderProgram: [{a:null,b:null,coil:null},{a:null,b:null,coil:null},{a:null,coil:null}],
  ladderStructure: [null, null, null],
  ladderSave: {},
  hintIdx: -1,
  hintMsg: '',
  timerPT: 5,
  timerET: 0,
  timerQ: false,
  activeSlot: null,
  ladderErrors: null,
  trace: Array.from({length: 44}, () => ({level: 0, out: 0})),
  fault: null,
  diagActive: false,
  readings: [],
  diagSolved: false,
  feedback: "",
  feedbackType: "",
  workbench: loadWorkbench(),
  missions: JSON.parse(localStorage.getItem("automata-lab-progress-v3") || "{}"),
  paletteModalOpen: false,
  workbenchDiagramOpen: false,
  plcRunning: false,
  plcMonitor: false,
  plcVtOpen: true,
  plcFtOpen: false,
  plcScanMode: false,
  scanCount: 0,
  forced: {},
  xrefTag: null,
  tagNames: {},
  rungTitles: [],
};

const workbenchParts = {
  supply: {
    label: "Fuente LOGO! 24 VDC",
    short: "FUENTE 24 V",
    image: "./assets/immersive/power-supply-logo-v2.png",
    width: 140,
    height: 170,
    terminals: [
      { key: "lplus", label: "L+", x: 94, y: 31, kind: "positive", labelSide: "right" },
      { key: "m", label: "M", x: 94, y: 70, kind: "common", labelSide: "right" }
    ]
  },
  lplusBus: {
    label: "Bornera de distribución L+",
    short: "BORNERA L+",
    image: "./assets/immersive/terminal-block-lplus-v1.png",
    width: 155,
    height: 125,
    terminals: [
      { key: "in", label: "ENTRADA", x: 4, y: 42, kind: "positive", labelSide: "left" },
      { key: "out1", label: "L+ 1", x: 96, y: 22, kind: "positive", labelSide: "right" },
      { key: "out2", label: "L+ 2", x: 96, y: 49, kind: "positive", labelSide: "right" },
      { key: "out3", label: "L+ 3", x: 96, y: 76, kind: "positive", labelSide: "right" }
    ]
  },
  commonBus: {
    label: "Bornera de distribución M / 0 V",
    short: "BORNERA M",
    image: "./assets/immersive/terminal-block-m-v1.png",
    width: 155,
    height: 125,
    terminals: [
      { key: "in", label: "ENTRADA", x: 4, y: 42, kind: "common", labelSide: "left" },
      { key: "out1", label: "M 1", x: 96, y: 22, kind: "common", labelSide: "right" },
      { key: "out2", label: "M 2", x: 96, y: 49, kind: "common", labelSide: "right" },
      { key: "out3", label: "M 3", x: 96, y: 76, kind: "common", labelSide: "right" }
    ]
  },
  logo: {
    label: "Controlador LOGO!",
    short: "LOGO!",
    image: "./assets/immersive/relay.webp",
    width: 190,
    height: 200,
    terminals: [
      { key: "lplus",  label: "L+",     x:  4, y: 18, kind: "positive", labelSide: "left"  },
      { key: "m",      label: "M",      x:  4, y: 36, kind: "common",   labelSide: "left"  },
      { key: "ai0",    label: "AI0",    x:  4, y: 60, kind: "signal",   labelSide: "left"  },
      { key: "ai1",    label: "AI1",    x:  4, y: 76, kind: "signal",   labelSide: "left"  },
      { key: "i1",     label: "I1",     x: 22, y:  2, kind: "input",    labelSide: "up"    },
      { key: "i2",     label: "I2",     x: 37, y:  2, kind: "input",    labelSide: "up"    },
      { key: "i3",     label: "I3",     x: 52, y:  2, kind: "input",    labelSide: "up"    },
      { key: "i4",     label: "I4",     x: 67, y:  2, kind: "input",    labelSide: "up"    },
      { key: "q2com",  label: "Q2 COM", x: 96, y: 36, kind: "positive", labelSide: "right" },
      { key: "q2no",   label: "Q2 NO",  x: 96, y: 52, kind: "output",   labelSide: "right" },
      { key: "q1com",  label: "Q1 COM", x: 96, y: 68, kind: "positive", labelSide: "right" },
      { key: "q1no",   label: "Q1 NO",  x: 96, y: 84, kind: "output",   labelSide: "right" }
    ]
  },
  tank: {
    label: "Estanque y sensor",
    short: "SENSOR NIVEL",
    image: "./assets/immersive/tank.webp",
    width: 220,
    height: 150,
    terminals: [
      { key: "vplus", label: "+24", x: 4, y: 24, kind: "positive", labelSide: "left" },
      { key: "m", label: "M", x: 4, y: 49, kind: "common", labelSide: "left" },
      { key: "out", label: "OUT", x: 96, y: 32, kind: "signal", labelSide: "right" }
    ]
  },
  temperatureSensor: {
    label: "Sensor de temperatura",
    short: "TEMP. 0–10 V",
    image: "./assets/temperature-sensor.webp",
    width: 185,
    height: 135,
    terminals: [
      { key: "vplus", label: "+24", x: 4, y: 28, kind: "positive", labelSide: "left" },
      { key: "m", label: "M", x: 4, y: 60, kind: "common", labelSide: "left" },
      { key: "out", label: "OUT", x: 96, y: 34, kind: "signal", labelSide: "right" }
    ]
  },
  photoSensor: {
    label: "Sensor fotoeléctrico",
    short: "FOTOELÉCTRICO",
    image: "./assets/immersive/photoelectric-sensor-v1.png",
    width: 140,
    height: 155,
    terminals: [
      { key: "vplus", label: "+24", x: 4, y: 27, kind: "positive", labelSide: "left" },
      { key: "m", label: "M", x: 4, y: 58, kind: "common", labelSide: "left" },
      { key: "out", label: "OUT", x: 96, y: 34, kind: "signal", labelSide: "right" }
    ]
  },
  pushbuttons: {
    label: "Pulsadores START/STOP",
    short: "PULSADORES",
    image: "./assets/immersive/pushbuttons.webp",
    width: 112,
    height: 174,
    terminals: [
      { key: "lplus", label: "+24", x: 4, y: 50, kind: "positive", labelSide: "left" },
      { key: "start", label: "START", x: 96, y: 31, kind: "input", labelSide: "right" },
      { key: "stop", label: "STOP", x: 96, y: 68, kind: "input", labelSide: "right" }
    ]
  },
  pump: {
    label: "Bomba de llenado",
    short: "BOMBA",
    image: "./assets/immersive/pump.webp",
    width: 205,
    height: 130,
    terminals: [
      { key: "vplus", label: "+24", x: 4, y: 34, kind: "output", labelSide: "left" },
      { key: "m", label: "M", x: 4, y: 70, kind: "common", labelSide: "left" }
    ]
  },
  fan: {
    label: "Ventilador industrial",
    short: "VENTILADOR",
    image: "./assets/fan.webp",
    width: 150,
    height: 150,
    terminals: [
      { key: "vplus", label: "+24", x: 4, y: 34, kind: "output", labelSide: "left" },
      { key: "m", label: "M", x: 4, y: 70, kind: "common", labelSide: "left" }
    ]
  },
  conveyor: {
    label: "Correa transportadora",
    short: "TRANSPORTADOR",
    image: "./assets/immersive/conveyor-v1.png",
    width: 265,
    height: 145,
    terminals: [
      { key: "vplus", label: "+24", x: 84, y: 38, kind: "output", labelSide: "left" },
      { key: "m", label: "M", x: 84, y: 65, kind: "common", labelSide: "left" }
    ]
  },
  valve: {
    label: "Válvula de salida",
    short: "VÁLVULA",
    image: "./assets/immersive/valve.webp",
    width: 190,
    height: 112,
    terminals: [
      { key: "vplus", label: "+24", x: 4, y: 35, kind: "output", labelSide: "left" },
      { key: "m", label: "M", x: 4, y: 70, kind: "common", labelSide: "left" }
    ]
  },
  alarm: {
    label: "Baliza de alarma",
    short: "BALIZA",
    image: "./assets/immersive/alarm.webp",
    width: 115,
    height: 140,
    terminals: [
      { key: "vplus", label: "+24", x: 4, y: 35, kind: "output", labelSide: "left" },
      { key: "m", label: "M", x: 4, y: 70, kind: "common", labelSide: "left" }
    ]
  }
};

const workbenchScenarios = {
  level: {
    label: "Control de nivel",
    short: "NIVEL",
    description: "El sensor informa el nivel y Q1 acciona la bomba para mantener el estanque dentro del rango.",
    sensor: "tank",
    sensorLabel: "sensor de nivel",
    input: "ai0",
    inputLabel: "AI0",
    actuator: "pump",
    actuatorLabel: "bomba"
  },
  temperature: {
    label: "Control de temperatura",
    short: "TEMPERATURA",
    description: "El transmisor entrega una señal analógica y Q1 activa el ventilador cuando aumenta la temperatura.",
    sensor: "temperatureSensor",
    sensorLabel: "sensor de temperatura",
    input: "ai0",
    inputLabel: "AI0",
    actuator: "fan",
    actuatorLabel: "ventilador"
  },
  conveyor: {
    label: "Transporte automático",
    short: "TRANSPORTADOR",
    description: "El sensor fotoeléctrico detecta el producto en I1 y Q1 gobierna el motor de la correa.",
    sensor: "photoSensor",
    sensorLabel: "sensor fotoeléctrico",
    input: "i1",
    inputLabel: "I1",
    actuator: "conveyor",
    actuatorLabel: "correa transportadora"
  }
};

const SCENARIOS = {
  level: {
    label: 'Control de Nivel',
    variable: 'Nivel del estanque', unit: '%',
    defaultVar: 45, defaultLow: 30, defaultHigh: 75,
    controlMode: 'fill',
    io: { i00:'MARCHA', i01:'PARADA', i02:'NIV.BAJO', i03:'NIV.ALTO', q00:'BOMBA' },
    actuatorLabel: 'Bomba', actuatorImg: './assets/immersive/pump.webp',
    sensorImg: './assets/immersive/tank.webp', sensorAlt: 'Estanque con sensor de nivel',
    caption: 'SISTEMA DE CONTROL DE NIVEL · 24 VDC',
    hasValve: true,
    missionRelay: s => s.lowLevel===30 && s.highLevel===75 && s.relaySaved && s.systemEnabled,
    ladder: [{a:'I0.0',b:'I0.2',coil:'M0.0/S',struct:'series2'},{a:'I0.1',b:'I0.3',coil:'M0.0/R',struct:'parallel'},{a:'M0.0',coil:'Q0.0',struct:'series1'}],
    delta: (out, drain) => (out?1.7:0) + (drain?-0.48:0),
    flowSvg: (out, drain) => `<path class="pipe-base" d="M155 457 H300 V260"/><path id="d-flow-fill" class="flow-line ${out?'flowing':''}" d="M155 457 H300 V260"/><path class="pipe-base" d="M500 355 V455 H650"/><path id="d-flow-drain" class="flow-line drain ${drain?'flowing':''}" d="M500 355 V455 H650"/>`,
  },
  temperature: {
    label: 'Control de Temperatura',
    variable: 'Temperatura', unit: '%',
    defaultVar: 20, defaultLow: 30, defaultHigh: 70,
    controlMode: 'cool',
    io: { i00:'MARCHA', i01:'PARADA', i02:'T.BAJA', i03:'T.ALTA', q00:'VENTILADOR' },
    actuatorLabel: 'Ventilador', actuatorImg: './assets/fan.webp',
    sensorImg: './assets/temperature-sensor.webp', sensorAlt: 'Sensor de temperatura',
    caption: 'SISTEMA DE CONTROL DE TEMPERATURA · 24 VDC',
    hasValve: false,
    missionRelay: s => s.lowLevel===30 && s.highLevel===70 && s.relaySaved && s.systemEnabled,
    ladder: [{a:'I0.0',b:'I0.3',coil:'M0.0/S',struct:'series2'},{a:'I0.1',b:'I0.2',coil:'M0.0/R',struct:'parallel'},{a:'M0.0',coil:'Q0.0',struct:'series1'}],
    delta: (out) => out ? -1.5 : 0.6,
    flowSvg: out => `<path id="d-air1" class="air-line${out?' flowing':''}" d="M 95 455 Q 80 390 105 325 Q 130 260 110 195"/><path id="d-air2" class="air-line${out?' flowing':''}" d="M155 460 Q155 395 155 330 Q155 265 155 200"/><path id="d-air3" class="air-line${out?' flowing':''}" d="M215 455 Q230 390 210 325 Q190 260 210 195"/>`,
  },
  conveyor: {
    label: 'Transporte Automático',
    variable: 'Señal de detección', unit: '%',
    defaultVar: 0, defaultLow: 30, defaultHigh: 70,
    controlMode: 'detect',
    io: { i00:'MARCHA', i01:'PARADA', i02:'SENSOR', i03:'DETECCIÓN', q00:'MOTOR' },
    actuatorLabel: 'Motor correa', actuatorImg: './assets/immersive/conveyor-v1.png',
    sensorImg: './assets/immersive/photoelectric-sensor-v1.png', sensorAlt: 'Sensor fotoeléctrico',
    caption: 'SISTEMA DE TRANSPORTE AUTOMÁTICO · 24 VDC',
    hasValve: false,
    missionRelay: s => s.relaySaved && s.systemEnabled,
    ladder: [{a:'I0.0',b:'I0.2',coil:'M0.0/S',struct:'series2'},{a:'I0.1',b:null,coil:'M0.0/R',struct:'series1'},{a:'M0.0',coil:'Q0.0',struct:'series1'}],
    delta: () => 0,
    flowSvg: out => `<path id="d-belt1" class="belt-line${out?' moving':''}" d="M38 418 H262"/><path id="d-belt2" class="belt-line belt-return${out?' moving':''}" d="M38 440 H262"/>`,
  },
  sequence: {
    label: 'Llenado Temporizado',
    variable: 'Nivel del estanque', unit: '%',
    defaultVar: 0, defaultLow: 30, defaultHigh: 75,
    controlMode: 'sequence',
    rungs: 4,
    timerPT: 5,
    io: { i00:'MARCHA', i01:'PARADA', i02:'T0.0', i03:'–', q00:'BOMBA' },
    actuatorLabel: 'Bomba', actuatorImg: './assets/immersive/pump.webp',
    sensorImg: './assets/immersive/tank.webp', sensorAlt: 'Estanque temporizado',
    caption: 'LLENADO TEMPORIZADO · TON 5 s · 24 VDC',
    hasValve: true,
    missionRelay: s => s.relaySaved && s.systemEnabled,
    ladder: [
      {a:'I0.0', coil:'M0.0/S', struct:'series1'},
      {a:'T0.0', b:'I0.1', coil:'M0.0/R', struct:'parallel'},
      {a:'M0.0', coil:'T0.0/TON', struct:'series1'},
      {a:'M0.0', coil:'Q0.0', struct:'series1'},
    ],
    delta: (out, drain) => (out ? 5 : 0) + (drain ? -2 : 0),
    flowSvg: (out, drain) => `<path class="pipe-base" d="M155 457 H300 V260"/><path id="d-flow-fill" class="flow-line ${out?'flowing':''}" d="M155 457 H300 V260"/><path class="pipe-base" d="M500 355 V455 H650"/><path id="d-flow-drain" class="flow-line drain ${drain?'flowing':''}" d="M500 355 V455 H650"/>`,
  },
};

function loadWorkbench() {
  try {
    const saved = JSON.parse(localStorage.getItem("automata-lab-workbench-v1") || "null");
    if (saved && Array.isArray(saved.components) && Array.isArray(saved.connections)) {
      const scenario = saved.scenario || "level";
      const connections = saved.connections.map(connection => ({
        ...connection,
        from: { ...connection.from, terminalKey: connection.from.terminalKey === "q1" ? "q1no" : connection.from.terminalKey },
        to: { ...connection.to, terminalKey: connection.to.terminalKey === "q1" ? "q1no" : connection.to.terminalKey }
      }));
      return { components: saved.components, connections, scenario, completed: Array.isArray(saved.completed) ? saved.completed : [], selectedTerminal: null, feedback: "", feedbackType: "", test: defaultWorkbenchTest(scenario) };
    }
  } catch (_) {}
  return { components: [], connections: [], scenario: "level", completed: [], selectedTerminal: null, feedback: "", feedbackType: "", test: defaultWorkbenchTest("level") };
}

function defaultWorkbenchTest(scenario) {
  return { running: false, variable: scenario === "temperature" ? 24 : scenario === "conveyor" ? 0 : 45, output: false };
}

function stopWorkbenchTest() {
  if (!state.workbench.test) state.workbench.test = defaultWorkbenchTest(state.workbench.scenario);
  state.workbench.test.running = false;
  state.workbench.test.output = false;
}

function saveWorkbench() {
  localStorage.setItem("automata-lab-workbench-v1", JSON.stringify({
    components: state.workbench.components,
    connections: state.workbench.connections,
    scenario: state.workbench.scenario,
    completed: state.workbench.completed
  }));
}

const SCENARIO_FAULTS = {
  level: {
    noSupply:        { label: "Ausencia de alimentación 24 V",            hint: "Comprueba primero la fuente de 24 V." },
    sensorOpen:      { label: "Sensor de nivel desconectado",              hint: "La fuente está correcta, pero la señal analógica no llega al controlador." },
    outputOpen:      { label: "Conductor hacia la bomba interrumpido",     hint: "El controlador ordena llenar, pero el motor no recibe tensión." },
    estopActive:     { label: "Parada de emergencia activada",             hint: "La cadena de seguridad está inhibiendo la salida." },
    q1Fault:         { label: "Contacto de salida Q1 averiado",            hint: "El LOGO! ordena la salida (Q1=1 en pantalla), pero el contacto físico no conmuta. Compara el display con P4." },
    sensorSignalLow: { label: "Señal del sensor cortocircuitada a 0 V",    hint: "La fuente y el cableado están bien. P2 llega a 0 V: el controlador lee nivel mínimo y ordena la bomba continuamente." },
  },
  temperature: {
    noSupply:         { label: "Ausencia de alimentación 24 V",                 hint: "Comprueba primero la fuente de 24 V." },
    sensorOpen:       { label: "Sensor de temperatura desconectado",             hint: "La fuente está correcta, pero la señal del sensor no llega al controlador." },
    outputOpen:       { label: "Conductor hacia el ventilador interrumpido",     hint: "El controlador ordena enfriar, pero el ventilador no recibe tensión." },
    estopActive:      { label: "Parada de emergencia activada",                  hint: "La cadena de seguridad está inhibiendo la salida." },
    q1Fault:          { label: "Contacto de salida Q1 averiado",                 hint: "El LOGO! ordena la salida, pero el contacto físico no conmuta. Compara el display con P4." },
    sensorSignalHigh: { label: "Señal del sensor fijada en máximo (10 V)",       hint: "La fuente y el cableado están bien. P2 muestra 10 V constante: el controlador cree temperatura máxima y el ventilador no para." },
  },
  conveyor: {
    noSupply:    { label: "Ausencia de alimentación 24 V",                  hint: "Comprueba primero la fuente de 24 V." },
    sensorOpen:  { label: "Sensor fotoeléctrico desconectado",               hint: "La fuente está correcta, pero el sensor no entrega señal al controlador." },
    outputOpen:  { label: "Conductor hacia el motor interrumpido",           hint: "El controlador ordena marcha, pero el motor no recibe tensión." },
    estopActive: { label: "Parada de emergencia activada",                   hint: "La cadena de seguridad está inhibiendo la salida." },
    q1Fault:     { label: "Contacto de salida Q1 averiado",                  hint: "El LOGO! ordena la salida, pero el contacto físico no conmuta. Compara el display con P4." },
    sensorBlock: { label: "Sensor fotoeléctrico bloqueado permanentemente",  hint: "La fuente y el cableado están bien. P2 muestra 24 V constante: el controlador cree que siempre hay objeto y nunca activa el motor." },
  },
  sequence: {
    noSupply:        { label: "Ausencia de alimentación 24 V",            hint: "Comprueba primero la fuente de 24 V." },
    sensorOpen:      { label: "Sensor de nivel desconectado",              hint: "La fuente está correcta, pero la señal analógica no llega al controlador." },
    outputOpen:      { label: "Conductor hacia la bomba interrumpido",     hint: "El controlador ordena llenar, pero el motor no recibe tensión." },
    estopActive:     { label: "Parada de emergencia activada",             hint: "La cadena de seguridad está inhibiendo la salida." },
    q1Fault:         { label: "Contacto de salida Q1 averiado",            hint: "El LOGO! ordena la salida, pero el contacto físico no conmuta. Compara el display con P4." },
    sensorSignalLow: { label: "Señal del sensor cortocircuitada a 0 V",    hint: "P2 llega a 0 V: el controlador lee nivel mínimo." },
  },
};
function currentFaults() { return SCENARIO_FAULTS[state.scenario] || SCENARIO_FAULTS.level; }

const views = {
  panel:   { title: "Proceso en vivo",          kicker: "U1 · CE 1.1.6", desc: "Verifica la funcionalidad del lazo operando el controlador configurable." },
  config:  { title: "Controlador configurable",  kicker: "U1 · CE 1.1.4", desc: "Ajusta P1 y P2 para configurar el control on/off con histéresis adecuada." },
  program: { title: "Controlador programable",   kicker: "U2 · CE 2.1.2", desc: "Implementa la rutina de control on/off en lenguaje Ladder." },
  diagnose:{ title: "Diagnóstico de fallas",     kicker: "U1 · CE 1.1.3", desc: "Mide variables eléctricas con el multímetro y determina la causa de la falla." },
  builder: { title: "Montaje y cableado",        kicker: "U1 · CE 1.1.1", desc: "Conecta los componentes del lazo de control siguiendo el diagrama de montaje." }
};

function effectivePower() { return state.power && !(state.diagActive && state.fault === "noSupply"); }
function effectiveSensorWire() { return state.wires.sensor && !(state.diagActive && state.fault === "sensorOpen"); }
function effectiveOutputWire() { return state.wires.output && !(state.diagActive && state.fault === "outputOpen"); }
function safetyOpen() { return state.estop || (state.diagActive && state.fault === "estopActive"); }

function updateLogic() {
  const sc = SCENARIOS[state.scenario];
  state.levelLow = state.level <= state.lowLevel;
  state.levelHigh = state.level >= state.highLevel;
  if (sc.controlMode === 'fill') {
    if (state.levelLow) state.fillDemand = true;
    if (state.levelHigh) state.fillDemand = false;
  } else if (sc.controlMode === 'cool') {
    if (state.levelHigh) state.fillDemand = true;
    if (state.levelLow) state.fillDemand = false;
  } else if (sc.controlMode === 'sequence') {
    if (state.levelLow) state.fillDemand = true;
    if (state.levelHigh) state.fillDemand = false;
  } else {
    // detect (conveyor): motor demand when path is clear (signal low = no obstruction)
    state.fillDemand = state.levelLow;
  }
  const ready = effectivePower() && state.wires.supply && effectiveSensorWire() && !safetyOpen() && state.systemEnabled;
  if (!ready) {
    state.pumpCommand = false;
    state.output = false;
    if (!state.systemEnabled || safetyOpen()) state.latch = false;
  } else if (state.mode === "config") {
    const overrideOff = sc.controlMode === 'cool' ? state.levelLow : (sc.controlMode === 'fill' || sc.controlMode === 'sequence') ? state.levelHigh : false;
    state.pumpCommand = (state.fillDemand || state.manualPump) && !overrideOff;
    state.output = state.pumpCommand && effectiveOutputWire();
  } else {
    if (!state.compiled || (!state.plcRunning && !state.plcScanMode)) {
      if (!state.plcScanMode) { state.latch = false; state.pumpCommand = false; }
    } else {
      state.pumpCommand = false;
      for (let ri = 0; ri < state.ladderProgram.length; ri++) {
        const coil = state.ladderProgram[ri]?.coil;
        if (!coil || !state.ladderStructure[ri]) continue;
        const on = evaluateRung(ri);
        if      (coil === 'M0.0/S') { if (on) state.latch = true; }
        else if (coil === 'M0.0/R') { if (on) state.latch = false; }
        else if (coil === 'M0.0')   { state.latch = on; }
        else if (coil === 'Q0.0')   { state.pumpCommand = on; }
      }
      if ('M0.0' in state.forced) state.latch = state.forced['M0.0'];
      if ('Q0.0' in state.forced) state.pumpCommand = state.forced['Q0.0'];
    }
    state.output = state.pumpCommand && effectiveOutputWire();
  }
  state.alarm = state.level >= 92;
  if (!state.alarm) state.alarmAck = false;
}

function saveProgress() { localStorage.setItem("automata-lab-progress-v3", JSON.stringify(state.missions)); }
function scaleMark(lvl) { return Math.max(0, (lvl * 0.64 - 1) / 0.67).toFixed(1); }
function positionMarks() {
  const fill = document.getElementById('d-tank-fill');
  const scale = document.getElementById('d-level-scale');
  if (!fill || !scale || !state.level) return;
  const fillRect = fill.getBoundingClientRect();
  const scaleRect = scale.getBoundingClientRect();
  if (!fillRect.height || !scaleRect.height) return;
  const fillPct = Math.max(0.02, Math.min(0.64, state.level * 0.0064));
  const tankH = fillRect.height / fillPct;
  scale.querySelectorAll('i').forEach(mark => {
    const m = mark.textContent.match(/(\d+)%/);
    if (!m) return;
    const tFillH = tankH * Math.max(0.02, Math.min(0.64, parseFloat(m[1]) * 0.0064));
    const waterY = fillRect.bottom - tFillH;
    const markH = mark.getBoundingClientRect().height;
    const pct = (scaleRect.bottom - markH - waterY) / scaleRect.height * 100;
    mark.style.bottom = `${Math.max(0, pct).toFixed(1)}%`;
  });
}

function missionCheck() {
  if (!_prevMissions) _prevMissions = { ...state.missions };
  state.missions.wiring = state.wires.supply && state.wires.sensor && state.wires.output;
  if (SCENARIOS[state.scenario].missionRelay(state)) state.missions.relay = true;
  if (state.compiled && state.mode === "program" && state.output) state.missions.program = true;
  if (state.diagSolved) state.missions.diagnose = true;
  for (const key of ['wiring', 'relay', 'program', 'diagnose', 'builder']) {
    if (state.missions[key] && !_prevMissions[key]) showCelebration(key);
    _prevMissions[key] = state.missions[key];
  }
  saveProgress();
}

function setView(view) {
  state.view = view;
  if (view === "config") state.mode = "config";
  if (view === "program") state.mode = "program";
  if (view === "builder") state.auto = false;
  state.feedback = "";
  updateLogic();
  render();
}

function statusText() {
  if (!effectivePower()) return "SIN ENERGÍA";
  if (safetyOpen()) return "SEGURIDAD ACTIVA";
  if (!state.systemEnabled) return "SISTEMA DETENIDO";
  const _sc = SCENARIOS[state.scenario]; return state.output ? `${_sc.actuatorLabel.toUpperCase()} EN MARCHA` : "CONTROL AUTOMÁTICO";
}

function relayScreen() {
  if (!effectivePower() || !state.wires.supply) return `<b>SIN 24 V</b><strong>--</strong><small>REVISE FUENTE</small>`;
  const q = state.pumpCommand ? "Q1=1" : "Q1=0";
  if (state.relayPage === "low") return `<b>P1 · BAJO</b><strong>${state.lowLevel}%</strong><small>▲▼ · ► P2</small>`;
  if (state.relayPage === "high") return `<b>P2 · ALTO</b><strong>${state.highLevel}%</strong><small>▲▼ · OK</small>`;
  return `<b>${state.systemEnabled ? "RUN" : "STOP"} ${q}</b><strong>${state.level.toFixed(0)}${SCENARIOS[state.scenario].unit}</strong><small>OK · MENÚ</small>`;
}

function processDiagram() {
  const sc = SCENARIOS[state.scenario];
  const powerActive = effectivePower() && state.wires.supply;
  const sensorActive = powerActive && effectiveSensorWire();
  const controllerActive = sensorActive && !safetyOpen();
  const waterHeight = Math.max(2, Math.min(64, state.level * .64));
  const sensorVolts = sensorActive ? (state.level / 10).toFixed(1) : "0.0";
  return `
    <div class="immersive-loop" aria-label="Sistema interactivo de control de nivel">
      <svg class="loop-lines" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
        ${sc.flowSvg(state.output, state.drainOpen)}
        <path id="d-cable-supply-hot" class="cable cable-supply-hot${powerActive ? " live" : ""}${!state.wires.supply ? " broken" : ""}" d="M 130 144 H 615 V 112"/>
        <path id="d-cable-supply-com" class="cable cable-supply-com${powerActive ? " live" : ""}${!state.wires.supply ? " broken" : ""}" d="M 130 157 H 615 V 125"/>
        <path id="d-cable-sensor" class="cable cable-sensor${sensorActive ? " live" : ""}${!state.wires.sensor ? " broken" : ""}" d="M 432 82 H 615 V 202"/>
        <path id="d-cable-output" class="cable cable-output${state.output ? " live" : ""}${!state.wires.output ? " broken" : ""}" d="M 615 275 V 440 H 175"/>
        <path id="d-alarm-line" class="alarm-line ${state.alarm ? "live" : ""}" d="M 790 190 H 870 V 90"/>
        <g id="d-cut-supply" class="wire-cut-mark${state.wires.supply ? "" : " visible"}" transform="translate(375,150)"><circle r="9" fill="#3a1a1a" opacity=".9"/><line x1="-5" y1="-5" x2="5" y2="5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="-5" x2="-5" y2="5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>
        <g id="d-cut-sensor" class="wire-cut-mark${state.wires.sensor ? "" : " visible"}" transform="translate(524,82)"><circle r="9" fill="#3a1a1a" opacity=".9"/><line x1="-5" y1="-5" x2="5" y2="5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="-5" x2="-5" y2="5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>
        <g id="d-cut-output" class="wire-cut-mark${state.wires.output ? "" : " visible"}" transform="translate(615,357)"><circle r="9" fill="#3a1a1a" opacity=".9"/><line x1="-5" y1="-5" x2="5" y2="5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="-5" x2="-5" y2="5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>
      </svg>
      <svg class="wire-hits" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
        <path class="wire-hit" data-toggle-wire="supply" d="M 130 150 H 615 V 118"/>
        <path class="wire-hit" data-toggle-wire="sensor" d="M 432 82 H 615 V 202"/>
        <path class="wire-hit" data-toggle-wire="output" d="M 615 275 V 440 H 175"/>
      </svg>
      <div class="loop-caption">${sc.caption}</div>

      <div class="loop-component push-station">
        <img src="./assets/immersive/pushbuttons.webp" alt="Estación de pulsadores de marcha y parada">
        <button class="push-hotspot start" data-action="start" aria-label="Pulsar marcha"></button>
        <button class="push-hotspot stop" data-action="stop" aria-label="Pulsar parada"></button>
        <span class="component-tag">I0.0 START · I0.1 STOP</span>
      </div>

      <div class="loop-component tank-unit">
        ${sc.hasValve ? `<div id="d-tank-fill" class="tank-fill" style="height:${waterHeight}%"><span></span></div>` : ''}
        <img src="${sc.sensorImg}" alt="${sc.sensorAlt}">
        ${sc.hasValve ? `<div id="d-level-scale" class="level-scale"><i style="bottom:${scaleMark(state.lowLevel)}%">P1 ${state.lowLevel}%</i><i style="bottom:${scaleMark(state.highLevel)}%">P2 ${state.highLevel}%</i></div>` : ''}
        <span id="d-sensor-readout" class="sensor-readout ${sensorActive ? "active" : "fault"}">AI0 · ${sensorVolts} V · ${state.level.toFixed(0)}${sc.unit}</span>
      </div>

      <div id="d-relay-unit" class="loop-component relay-unit ${controllerActive ? "powered" : "fault"}">
        <img src="./assets/immersive/relay.webp" alt="Relé configurable con pantalla y teclado">
        <div id="d-relay-lcd" class="relay-lcd">${relayScreen()}</div>
        <button class="relay-key up" data-relay-key="up" aria-label="Tecla arriba"></button>
        <button class="relay-key down" data-relay-key="down" aria-label="Tecla abajo"></button>
        <button class="relay-key left" data-relay-key="left" aria-label="Tecla izquierda"></button>
        <button class="relay-key right" data-relay-key="right" aria-label="Tecla derecha"></button>
        <button class="relay-key ok" data-relay-key="ok" aria-label="Tecla aceptar"></button>
        <button class="relay-key back" data-relay-key="back" aria-label="Tecla volver"></button>
        <span class="component-tag">RELÉ CONFIGURABLE · ${controllerActive ? "POWER" : "SIN SEÑAL"}</span>
      </div>

      <button id="d-alarm-unit" class="loop-component alarm-unit ${state.alarm && !state.alarmAck ? "ringing" : ""}" data-action="alarm" aria-label="Reconocer alarma">
        <img src="./assets/immersive/alarm.webp" alt="Baliza roja de alarma"><span class="component-tag">Q0.1 ALARMA</span>
      </button>

      <button id="d-pump-unit" class="loop-component pump-unit ${state.output ? "running" : ""}" data-action="pump" aria-label="Prueba manual de la bomba">
        <img src="${sc.actuatorImg}" alt="${sc.actuatorLabel}"><span class="motor-motion"></span><span class="motor-ring2"></span><span id="d-pump-tag" class="component-tag">Q0.0 ${sc.io.q00} · ${state.output ? "ON" : "OFF"}</span>
      </button>

      ${sc.hasValve ? `<button id="d-valve-unit" class="loop-component valve-unit ${state.drainOpen ? "open" : "closed"}" data-action="valve" aria-label="Abrir o cerrar válvula de salida">
        <img src="./assets/immersive/valve.webp" alt="Válvula solenoide"><span id="d-valve-tag" class="component-tag">VÁLVULA · ${state.drainOpen ? "ABIERTA" : "CERRADA"}</span>
      </button>` : ''}
    </div>
    <div class="io-strip">
      <div id="d-io-ps" class="io ${powerActive ? "on" : ""}"><b>PS · 24 VDC</b><span>${powerActive ? "Alimentación correcta" : "0 V"}</span></div>
      <div id="d-io-low" class="io ${state.levelLow ? "on" : ""}"><b>I0.2 · ${sc.io.i02}</b><span>${state.levelLow ? "Activo" : "Inactivo"}</span></div>
      <div id="d-io-high" class="io ${state.levelHigh ? "on" : ""}"><b>I0.3 · ${sc.io.i03}</b><span>${state.levelHigh ? "Activo" : "Inactivo"}</span></div>
      <div id="d-io-pump" class="io ${state.output ? "on" : ""}"><b>Q0.0 · ${sc.io.q00}</b><span>${state.output ? "24 V" : "0 V"}</span></div>
    </div>`;
}

function chartSvg() {
  const w = 620, h = 170, n = state.trace.length;
  const levelPts = state.trace.map((d,i) => `${(i/(n-1))*w},${h-(d.level/100)*h}`).join(" ");
  const outPts = state.trace.map((d,i) => `${(i/(n-1))*w},${d.out ? 18 : h-18}`).join(" ");
  const lowY = h-(state.lowLevel/100)*h, highY = h-(state.highLevel/100)*h;
  const topPct = 0, lowPct = (1-state.lowLevel/100)*100, highPct = (1-state.highLevel/100)*100;
  const _sc = SCENARIOS[state.scenario];
  return `<div class="chart-wrap">
    <div class="chart-ylabels">
      <span style="top:${topPct}%">100${_sc.unit}</span>
      <span style="top:${highPct}%">P2 ${state.highLevel}${_sc.unit}</span>
      <span style="top:${lowPct}%">P1 ${state.lowLevel}${_sc.unit}</span>
      <span style="top:100%">0</span>
    </div>
    <svg class="chart" id="d-chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Tendencia de ${_sc.variable} y estado de Q0.0">
      <line class="chart-grid" x1="0" y1="${highY}" x2="${w}" y2="${highY}"/><line class="chart-grid" x1="0" y1="${lowY}" x2="${w}" y2="${lowY}"/>
      <polyline class="chart-output" points="${outPts}"/><polyline class="chart-line" points="${levelPts}"/>
    </svg>
  </div>
  <div class="legend"><span><i class="dot" style="background:#17624d"></i>${_sc.variable}</span><span><i class="dot" style="background:#d6a843"></i>Q0.0</span></div>`;
}

function panelView() {
  return `<section class="card panel"><div class="row"><div><h2>Lazo de control</h2></div><span class="mode-chip">${statusText()}</span></div>${processDiagram()}</section>
    <section class="card panel" style="margin-top:16px"><div class="row"><div><h2>Panel de operación</h2></div><button class="btn chart-toggle-btn" data-action="chart" aria-label="Ver tendencia del proceso">📈 Tendencia</button></div><div class="notice" style="margin-top:14px"><strong>Instrucciones:</strong> START / STOP controlan el proceso. Pulsa la válvula o la bomba para activarlas manualmente. Para ajustar parámetros, pulsa la tecla verde del relé y usa ▲▼ para cambiar valores.</div></section>`;
}

function configView() {
  const sc = SCENARIOS[state.scenario];
  const band = state.highLevel - state.lowLevel;
  const varLbl = sc.variable;
  const u = sc.unit;
  const actOn = sc.controlMode === 'fill' ? `Arranca ${sc.actuatorLabel}` : `Arranca ${sc.actuatorLabel}`;
  const actOff = `Detiene ${sc.actuatorLabel}`;
  const rowLow  = sc.controlMode === 'fill' ? actOn  : actOff;
  const rowHigh = sc.controlMode === 'fill' ? actOff : actOn;
  return `<section class="card panel"><div class="row"><div><h2>Configuración del controlador</h2></div><span class="mode-chip">Histéresis: ${band}${u}</span></div>${processDiagram()}</section>
    <div class="grid-two" style="margin-top:16px"><section class="card panel"><h2>Secuencia del teclado</h2><ol class="relay-steps"><li>Pulsa <b>OK</b> para abrir P1.</li><li>Usa <b>▲ y ▼</b> para ajustar el valor bajo.</li><li>Pulsa <b>►</b> para abrir P2 y ajusta el valor alto.</li><li>Pulsa <b>OK</b> para guardar y volver a RUN.</li></ol></section>
    <section class="card panel"><h2>Lógica configurada</h2><table class="truth"><thead><tr><th>${varLbl}</th><th>Respuesta</th></tr></thead><tbody><tr class="${state.levelLow?"current":""}"><td>≤ ${state.lowLevel}${u}</td><td>${rowLow}</td></tr><tr class="${!state.levelLow&&!state.levelHigh?"current":""}"><td>${state.lowLevel}${u} – ${state.highLevel}${u}</td><td>Mantiene estado</td></tr><tr class="${state.levelHigh?"current":""}"><td>≥ ${state.highLevel}${u}</td><td>${rowHigh}</td></tr></tbody></table></section></div>`;
}

function builderLadder() {
  const sc = SCENARIOS[state.scenario];
  const lp = state.ladderProgram;
  const ls = state.ladderStructure;
  const er = state.ladderErrors;
  const tn = state.tagNames;
  const n = t => tn[t] || t;
  const META = {
    'I0.0':{l:n('I0.0'),s:tn['I0.0']?'I0.0':sc.io.i00}, 'I0.1':{l:n('I0.1'),s:tn['I0.1']?'I0.1':sc.io.i01},
    'I0.2':{l:n('I0.2'),s:tn['I0.2']?'I0.2':sc.io.i02}, 'I0.3':{l:n('I0.3'),s:tn['I0.3']?'I0.3':sc.io.i03},
    'M0.0':{l:n('M0.0'),s:tn['M0.0']?'M0.0':'MEM'},      'M0.0/S':{l:n('M0.0'),s:'SET'},
    'M0.0/R':{l:n('M0.0'),s:'RST'},                       'Q0.0':{l:n('Q0.0'),s:tn['Q0.0']?'Q0.0':sc.io.q00},
    'I0.0/NC':{l:n('I0.0'),s:'NC'}, 'I0.1/NC':{l:n('I0.1'),s:'NC'},
    'I0.2/NC':{l:n('I0.2'),s:'NC'}, 'I0.3/NC':{l:n('I0.3'),s:'NC'},
    'M0.0/NC':{l:n('M0.0'),s:'NC'},
    'T0.0':{l:n('T0.0'),s:'TMR'}, 'T0.0/TON':{l:n('T0.0'),s:'TON'},
  };
  const COILS = new Set(['M0.0/S','M0.0/R','Q0.0','T0.0/TON']);
  const stCls = (ri,k) => { const v=lp[ri][k]; if(!er) return v?'ld-st-filled':'ld-st-empty'; const chk=er[`${ri}.${k}`]; return chk===true?'ld-st-ok':(chk===false?'ld-st-wrong':(v?'ld-st-filled':'ld-st-empty')); };
  const rungErrCls = ri => (er && er[`${ri}.struct`] === false) ? ' ld-rung-struct-err' : '';
  const ctcSvg = `<svg viewBox="0 0 52 28" width="52" height="28" aria-hidden="true"><line x1="0" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="3" x2="16" y2="25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="3" x2="36" y2="25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="14" x2="52" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  const ncSvg  = `<svg viewBox="0 0 52 28" width="52" height="28" aria-hidden="true"><line x1="0" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="3" x2="16" y2="25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="3" x2="36" y2="25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="14" x2="52" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="25" x2="36" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const tonSvg = `<svg viewBox="0 0 64 28" width="64" height="28" aria-hidden="true"><line x1="0" y1="14" x2="8" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><rect x="8" y="3" width="48" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><text x="32" y="18" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" font-weight="800" fill="currentColor">TON</text><line x1="56" y1="14" x2="64" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  const coilSvg = (tag) => { const ltr = tag==='M0.0/S'?'S':tag==='M0.0/R'?'R':''; return `<svg viewBox="0 0 52 28" width="52" height="28" aria-hidden="true"><line x1="0" y1="14" x2="8" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="26" cy="14" rx="18" ry="10" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="44" y1="14" x2="52" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>${ltr?`<text x="26" y="18.5" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" font-weight="800" fill="currentColor">${ltr}</text>`:''}</svg>`; };
  const sym = (tag) => { const m=META[tag]; const isNC=tag.endsWith('/NC'); const isTON=tag==='T0.0/TON'; return `<span class="ld-lbl">${m.l}</span>${isTON?tonSvg:COILS.has(tag)?coilSvg(tag):(isNC?ncSvg:ctcSvg)}<span class="ld-sub">${m.s}</span>`; };
  const palItem = (tag) => `<div class="ld-pal-item" draggable="true" data-drag-tag="${tag}" title="${META[tag].l} · ${META[tag].s}">${sym(tag)}</div>`;
  const genContactNA = `<div class="ld-pal-item ld-pal-gen" draggable="true" data-drag-tag="__NA__" title="Contacto NA — elige el tag al soltar"><span class="ld-lbl" style="opacity:.5">?</span>${ctcSvg}<span class="ld-sub">NA</span></div>`;
  const genContactNC = `<div class="ld-pal-item ld-pal-gen" draggable="true" data-drag-tag="__NC__" title="Contacto NC — elige el tag al soltar"><span class="ld-lbl" style="opacity:.5">?</span>${ncSvg}<span class="ld-sub">NC</span></div>`;
  const zone = (ri,k,isCoil) => {
    const tag=lp[ri][k]; const st=stCls(ri,k);
    if (!tag && !isCoil) {
      const allOpts = [...contactItems.map(t=>`<option value="${t}">${META[t].l} — ${META[t].s}</option>`), ...ncItems.map(t=>`<option value="${t}">${META[t].l} — NC</option>`)].join('');
      return `<div class="ld-zone ld-zone-contact ${st}" data-dz-ri="${ri}" data-dz-k="${k}"><select class="ld-tag-pick" data-pick-ri="${ri}" data-pick-k="${k}"><option value="">— tag —</option>${allOpts}</select></div>`;
    }
    const drag=tag?`draggable="true" data-drag-tag="${tag}"`:'';
    return `<div class="ld-zone ${isCoil?'ld-zone-coil':'ld-zone-contact'} ${st}" data-dz-ri="${ri}" data-dz-k="${k}" ${drag}>${tag?sym(tag):`<span class="ld-ph">( ? )</span>`}</div>`;
  };
  const rail = `<div class="ld-rail"></div>`;
  const w = (f='') => `<div class="ld-w${f}"></div>`;

  const rungSlot = (ri) => {
    const s = ls[ri];
    const netBar = `<div class="ld-net-bar"><span class="ld-net-num">Network ${ri+1}</span><input class="ld-net-inp" data-net-ri="${ri}" value="${(state.rungTitles[ri]||'').replace(/"/g,'&quot;')}" placeholder="Sin título"></div>`;
    const delBtn = rungs > 1 ? `<button class="ld-rn-del" data-remove-rung="${ri}" title="Eliminar peldaño">✕</button>` : '';
    const upBtn  = ri > 0        ? `<button class="ld-rn-mv" data-rung-up="${ri}" title="Subir">↑</button>` : `<span class="ld-rn-mv-ph"></span>`;
    const dnBtn  = ri < rungs-1  ? `<button class="ld-rn-mv" data-rung-dn="${ri}" title="Bajar">↓</button>` : `<span class="ld-rn-mv-ph"></span>`;
    const mvBtns = rungs > 1 ? `<span class="ld-rn-mvg">${upBtn}${dnBtn}</span>` : '';
    const rnNum = `<span class="ld-rn">${ri+1}</span>`;
    const rc = s ? rungErrCls(ri) : '';
    let rungBody;
    if (!s) {
      rungBody = `<div class="ld-rung ld-rung-empty">${delBtn}${mvBtns}${rail}${rnNum}<span class="ld-rung-empty-hint">↓ insertar elemento</span>${rail}</div>`;
    } else if (s === 'series1') {
      rungBody = `<div class="ld-rung${rc}">${delBtn}${mvBtns}${rail}${w()}${rnNum}${zone(ri,'a',false)}${w('f')}${zone(ri,'coil',true)}${w()}${rail}</div>`;
    } else if (s === 'series2') {
      rungBody = `<div class="ld-rung${rc}">${delBtn}${mvBtns}${rail}${w()}${rnNum}${zone(ri,'a',false)}${w()}${zone(ri,'b',false)}${w('f')}${zone(ri,'coil',true)}${w()}${rail}</div>`;
    } else if (s === 'parallel') {
      rungBody = `<div class="ld-rung ld-rung-par${rc}">${delBtn}${mvBtns}${rail}${w()}${rnNum}<div class="ld-par"><div class="ld-par-br">${w()}${zone(ri,'a',false)}${w()}</div><div class="ld-par-br">${w()}${zone(ri,'b',false)}${w()}</div></div>${w('f')}${zone(ri,'coil',true)}${w()}${rail}</div>`;
    } else { rungBody = ''; }
    return `<div class="ld-net-blk">${netBar}${rungBody}${toolbarHtml(ri)}</div>`;
  };

  const hints = state.scenario ? buildHints(state.scenario) : [];
  const allHintsShown = state.hintIdx >= hints.length - 1;
  const hintSection = `<div class="ld-hint-row">${!allHintsShown?`<button class="btn ld-hint-btn" data-action="hint">Pedir pista</button>`:`<span class="ld-hint-btn-done">Sin más pistas</span>`}${state.hintMsg?`<div class="ld-hint-box"><span class="ld-hint-icon">💡</span> ${state.hintMsg}</div>`:''}</div>`;

  const rungs = state.ladderProgram.length;
  const isSeq = sc.controlMode === 'sequence';
  const contactItems = isSeq ? ['I0.0','I0.1','M0.0','T0.0'] : ['I0.0','I0.1','I0.2','I0.3','M0.0'];
  const ncItems      = isSeq ? ['I0.0/NC','I0.1/NC','M0.0/NC'] : ['I0.0/NC','I0.1/NC','I0.2/NC','I0.3/NC','M0.0/NC'];
  const coilItems    = isSeq ? ['M0.0/S','M0.0/R','T0.0/TON','Q0.0'] : ['M0.0/S','M0.0/R','Q0.0'];

  const toolbarHtml = (ri) => {
    const s = ls[ri];
    const prog = lp[ri] || {a:null,b:null,coil:null};
    const canAddContact = !s || s === 'series1';
    const canBranch = s === 'series1';
    const curCoil = prog.coil;
    const mCtc = `<svg viewBox="0 0 36 22" width="26" height="16" style="display:block"><line x1="0" y1="11" x2="10" y2="11" stroke="currentColor" stroke-width="2"/><line x1="10" y1="2" x2="10" y2="20" stroke="currentColor" stroke-width="2"/><line x1="26" y1="2" x2="26" y2="20" stroke="currentColor" stroke-width="2"/><line x1="26" y1="11" x2="36" y2="11" stroke="currentColor" stroke-width="2"/></svg>`;
    const mNc  = `<svg viewBox="0 0 36 22" width="26" height="16" style="display:block"><line x1="0" y1="11" x2="10" y2="11" stroke="currentColor" stroke-width="2"/><line x1="10" y1="2" x2="10" y2="20" stroke="currentColor" stroke-width="2"/><line x1="26" y1="2" x2="26" y2="20" stroke="currentColor" stroke-width="2"/><line x1="26" y1="11" x2="36" y2="11" stroke="currentColor" stroke-width="2"/><line x1="10" y1="20" x2="26" y2="2" stroke="currentColor" stroke-width="1.5"/></svg>`;
    const mBr  = `<svg viewBox="0 0 24 22" width="18" height="16" style="display:block"><line x1="0" y1="1" x2="0" y2="21" stroke="currentColor" stroke-width="2"/><line x1="24" y1="1" x2="24" y2="21" stroke="currentColor" stroke-width="2"/><line x1="0" y1="6" x2="24" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="0" y1="16" x2="24" y2="16" stroke="currentColor" stroke-width="1.5"/></svg>`;
    const mCoil = (tag) => { const ltr=tag==='M0.0/S'?'S':tag==='M0.0/R'?'R':''; return `<svg viewBox="0 0 36 22" width="26" height="16" style="display:block"><line x1="0" y1="11" x2="5" y2="11" stroke="currentColor" stroke-width="2"/><ellipse cx="18" cy="11" rx="12" ry="7" fill="none" stroke="currentColor" stroke-width="2"/><line x1="31" y1="11" x2="36" y2="11" stroke="currentColor" stroke-width="2"/>${ltr?`<text x="18" y="14" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8" font-weight="800" fill="currentColor">${ltr}</text>`:''}</svg>`; };
    const mTon = `<svg viewBox="0 0 36 22" width="26" height="16" style="display:block"><line x1="0" y1="11" x2="5" y2="11" stroke="currentColor" stroke-width="2"/><rect x="5" y="3" width="26" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><text x="18" y="14" text-anchor="middle" font-family="ui-monospace,monospace" font-size="7" font-weight="800" fill="currentColor">TON</text><line x1="31" y1="11" x2="36" y2="11" stroke="currentColor" stroke-width="2"/></svg>`;
    const ctcBtns = canAddContact
      ? `<button class="ld-tb-el" data-tb-ri="${ri}" data-add-el="__NA__" title="Insertar contacto NA en serie">${mCtc}<span>NO</span></button><button class="ld-tb-el" data-tb-ri="${ri}" data-add-el="__NC__" title="Insertar contacto NC en serie">${mNc}<span>NC</span></button>${canBranch?`<button class="ld-tb-el" data-tb-ri="${ri}" data-add-el="__BRANCH__" title="Agregar rama paralela">${mBr}<span>Par</span></button>`:''}`
      : `<span class="ld-tb-full" title="Máximo 2 contactos por peldaño">2 max</span>`;
    const coilBtns = coilItems.map(t => { const on=curCoil===t; const sv=t==='T0.0/TON'?mTon:mCoil(t); return `<button class="ld-tb-el ld-tb-coil${on?' ld-tb-on':''}" data-tb-ri="${ri}" data-add-el="${t}" title="${META[t].l} — ${META[t].s}${on?' (clic para quitar)':''}">${sv}<span>${META[t].s}</span></button>`; }).join('');
    const clrBtn = s ? `<button class="ld-tb-el ld-tb-clr" data-tb-ri="${ri}" data-add-el="__CLEAR__" title="Vaciar peldaño">✕</button>` : '';
    return `<div class="ld-rung-tools"><div class="ld-tb-grp">${ctcBtns}</div><div class="ld-tb-vsep"></div><div class="ld-tb-grp">${coilBtns}</div>${clrBtn}</div>`;
  };

  const legTags = isSeq ? ['I0.0','I0.1','M0.0','T0.0','Q0.0'] : ['I0.0','I0.1','I0.2','I0.3','M0.0','Q0.0'];
  const legItems = legTags.map(t => `<span class="ld-leg-item"><code>${t}</code><span>${META[t].s}</span></span>`).join('');

  return `<div class="ld-builder">
<div class="ld-legend">${legItems}</div>
<p class="ld-hint">Pulsa <strong>NO / NC</strong> para insertar contacto &nbsp;·&nbsp; <strong>Par</strong> para bifurcación paralela &nbsp;·&nbsp; Elige el <strong>tag</strong> en el selector &nbsp;·&nbsp; Doble clic en un elemento para borrarlo</p>
<div class="ld-canvas">
${Array.from({length:rungs},(_,i)=>i).map(rungSlot).join('\n')}
</div>
<div class="ld-add-row"><button class="btn ld-add-btn" data-action="addRung">＋ Agregar peldaño</button></div>
${hintSection}
</div>`;
}

function buildHints(scenario) {
  const sc = SCENARIOS[scenario];
  const io = sc.io;
  const structLabels = { series1:'un contacto seguido de bobina', series2:'dos contactos en serie + bobina', parallel:'bifurcación paralela (2 ramas) + bobina' };
  const tagName = tag => {
    if (!tag && tag !== null) return null;
    if (tag === null) return 'celda vacía (no se usa)';
    const map = { 'I0.0':io.i00, 'I0.1':io.i01, 'I0.2':io.i02, 'I0.3':io.i03,
                  'M0.0':'bit de memoria M0.0', 'M0.0/S':'bobina SET de M0.0',
                  'M0.0/R':'bobina RESET de M0.0', 'Q0.0':io.q00,
                  'T0.0':'salida del temporizador T0.0', 'T0.0/TON':'bobina TON (temporizador retardo a conexión)' };
    return `${tag} — ${map[tag] || tag}`;
  };
  const hints = [];
  sc.ladder.forEach((r, i) => hints.push(`Peldaño ${i+1}: usa ${structLabels[r.struct]}.`));
  sc.ladder.forEach((r, i) => {
    if (r.a !== undefined) hints.push(`Peldaño ${i+1}, celda A: ${tagName(r.a)}.`);
    if ('b' in r && r.b !== undefined) hints.push(`Peldaño ${i+1}, celda B: ${tagName(r.b)}.`);
    hints.push(`Peldaño ${i+1}, bobina: ${tagName(r.coil)}.`);
  });
  return hints;
}

function evaluateContact(tag) {
  if (!tag) return false;
  const nc = tag.endsWith('/NC');
  const base = nc ? tag.slice(0, -3) : tag;
  const vals = { 'I0.0': state.inputs.start, 'I0.1': state.inputs.stop, 'I0.2': state.levelLow, 'I0.3': state.levelHigh, 'M0.0': state.latch, 'T0.0': state.timerQ };
  const raw = (base in state.forced) ? state.forced[base] : (vals[base] ?? false);
  return nc ? !raw : raw;
}

function evaluateRung(ri) {
  if (!state.ladderStructure[ri]) return false;
  const r = state.ladderProgram[ri], s = state.ladderStructure[ri];
  const a = evaluateContact(r.a), b = evaluateContact(r.b);
  return s === 'series1' ? a : s === 'series2' ? (a && b) : s === 'parallel' ? (a || b) : false;
}

function ladderSvg() {
  const sc = SCENARIOS[state.scenario];
  // Use student's compiled program if available, else scenario target
  const ld = (state.compiled && state.ladderProgram[0].a) ? state.ladderProgram : sc.ladder;
  const ls = (state.compiled && state.ladderStructure[0]) ? state.ladderStructure : sc.ladder.map(r => r.struct);
  const ev = tag => evaluateContact(tag);
  const L = '#1b8f63', D = '#607a72', RL = '#1d3028';
  const c = on => on ? L : D;
  const W = 2.5;
  const seg = (x1,y1,x2,y2,on) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c(on)}" stroke-width="${W}" stroke-linecap="round"/>`;
  const ctc = (cx,cy,tag,lbl,sub) => { const on=ev(tag); const nc=!!tag?.endsWith('/NC'); const col=c(on); const slash=nc?`<line x1="${cx-8}" y1="${cy+12}" x2="${cx+8}" y2="${cy-12}" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`:''; return `<line x1="${cx-8}" y1="${cy-12}" x2="${cx-8}" y2="${cy+12}" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/><line x1="${cx+8}" y1="${cy-12}" x2="${cx+8}" y2="${cy+12}" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>${slash}<text x="${cx}" y="${cy-18}" text-anchor="middle" font-size="10" font-weight="700" font-family="ui-monospace,monospace" fill="${col}">${lbl}</text><text x="${cx}" y="${cy+26}" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace" fill="${col}" opacity=".75">${sub||''}</text>`; };
  const coilEl = (cx,cy,on,lbl,type) => { const col = c(on); return `<circle cx="${cx}" cy="${cy}" r="13" fill="${on?'rgba(27,143,99,.14)':'none'}" stroke="${col}" stroke-width="2.5"/>${type?`<text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="11" font-weight="900" font-family="ui-monospace,monospace" fill="${col}">${type}</text>`:''}<text x="${cx}" y="${cy-20}" text-anchor="middle" font-size="10" font-weight="700" font-family="ui-monospace,monospace" fill="${col}">${lbl}</text>`; };
  const tonEl = (cx,cy,on) => { const col=c(on); const et=state.timerET.toFixed(1); const pt=state.timerPT; return `<rect x="${cx-24}" y="${cy-16}" width="48" height="32" rx="4" fill="${on?'rgba(27,143,99,.14)':'none'}" stroke="${col}" stroke-width="2.5"/><text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="10" font-weight="900" font-family="ui-monospace,monospace" fill="${col}">TON</text><text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="8" font-family="ui-monospace,monospace" fill="${col}">${et}/${pt}s</text><text x="${cx}" y="${cy-24}" text-anchor="middle" font-size="10" font-weight="700" font-family="ui-monospace,monospace" fill="${col}">T0.0</text>`; };
  const r1aTag = ld[0].a || 'I0.0';
  const r1bTag = ld[0].b || null;
  const r2aTag = ld[1].a || 'I0.1';
  const r2bTag = ld[1].b || null;
  const r1 = ls[0] === 'series2' ? (ev(r1aTag) && ev(r1bTag)) : ls[0] === 'parallel' ? (ev(r1aTag) || ev(r1bTag)) : ev(r1aTag);
  const r2hasParallel = ls[1] === 'parallel';
  const r2 = r2hasParallel ? (ev(r2aTag) || ev(r2bTag)) : ev(r2aTag);
  const r3 = state.latch;
  const LX=50,RX=570,FX=90,JX=340,CX=500;
  const Y1=72,Y2A=158,Y2B=220,Y3=272;
  const A1=140,B1=258,A2=200,A3=220;
  const r2aLbl = r2aTag?.replace('/NC','') || 'I0.1';
  const r2bLbl = r2bTag?.replace('/NC','') || '';
  const r2aSub = sc.io[r2aTag==='I0.1'||r2aTag==='I0.1/NC'?'i01':r2aTag==='I0.0'||r2aTag==='I0.0/NC'?'i00':'i01'] || '';
  const r2bSub = r2bTag ? (sc.io[r2bTag.replace('/NC','') === 'I0.3' ? 'i03' : 'i02'] || '') : '';
  const r1aLbl = r1aTag?.replace('/NC','') || 'I0.0';
  const r1bLbl = r1bTag?.replace('/NC','') || '';
  const r1bSub = r1bTag ? (sc.io[r1bTag.replace('/NC','') === 'I0.3' ? 'i03' : 'i02'] || '') : '';
  const rung2 = r2hasParallel
    ? `${seg(LX,Y2A,FX,Y2A,true)}<line x1="${FX}" y1="${Y2A}" x2="${FX}" y2="${Y2B}" stroke="${c(true)}" stroke-width="${W}" stroke-linecap="round"/>
${seg(FX,Y2A,A2-8,Y2A,true)}${ctc(A2,Y2A,r2aTag,r2aLbl,r2aSub)}${seg(A2+8,Y2A,JX,Y2A,ev(r2aTag))}
${seg(FX,Y2B,A2-8,Y2B,true)}${ctc(A2,Y2B,r2bTag,r2bLbl,r2bSub)}${seg(A2+8,Y2B,JX,Y2B,ev(r2bTag))}
<line x1="${JX}" y1="${Y2A}" x2="${JX}" y2="${Y2B}" stroke="${c(r2)}" stroke-width="${W}" stroke-linecap="round"/>
${seg(JX,Y2A,CX-13,Y2A,r2)}${coilEl(CX,Y2A,r2,'M0.0','R')}${seg(CX+13,Y2A,RX,Y2A,false)}`
    : `${seg(LX,Y2A,A2-8,Y2A,true)}${ctc(A2,Y2A,r2aTag,r2aLbl,r2aSub)}${seg(A2+8,Y2A,CX-13,Y2A,ev(r2aTag))}${coilEl(CX,Y2A,ev(r2aTag),'M0.0','R')}${seg(CX+13,Y2A,RX,Y2A,false)}`;
  // 4-rung sequence scenario
  if (sc.controlMode === 'sequence') {
    const sy1=58, sy2a=120, sy2b=170, sy3=230, sy4=290;
    const sHeight = 315;
    const r4ld = (state.compiled && state.ladderProgram[0].a) ? state.ladderProgram : sc.ladder;
    const r4ls = (state.compiled && state.ladderStructure[0]) ? state.ladderStructure : sc.ladder.map(r=>r.struct);
    const sr1 = ev(r4ld[0].a);
    const sr2 = r4ls[1]==='parallel' ? (ev(r4ld[1].a)||ev(r4ld[1].b)) : ev(r4ld[1].a);
    const sr3 = evaluateContact(r4ld[2]?.a || 'M0.0');
    const sr4 = evaluateContact(r4ld[3]?.a || 'M0.0');
    const r1lbl = (r4ld[0].a||'I0.0').replace('/NC','');
    const r2aTag = r4ld[1].a||'T0.0'; const r2bTag = r4ld[1].b||'I0.1';
    const r2aLbl = r2aTag.replace('/NC',''); const r2bLbl = r2bTag.replace('/NC','');
    return `<svg viewBox="0 0 620 ${sHeight}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
<line x1="${LX}" y1="18" x2="${LX}" y2="${sHeight-8}" stroke="${RL}" stroke-width="5" stroke-linecap="round"/>
<line x1="${RX}" y1="18" x2="${RX}" y2="${sHeight-8}" stroke="${RL}" stroke-width="5" stroke-linecap="round"/>
<text x="${LX}" y="13" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace" font-weight="700" fill="${RL}">L+</text>
<text x="${RX}" y="13" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace" font-weight="700" fill="${RL}">N</text>
<text x="25" y="${sy1+4}" text-anchor="middle" font-size="8" font-family="ui-monospace,monospace" fill="${D}">1</text>
<text x="25" y="${sy2a+4}" text-anchor="middle" font-size="8" font-family="ui-monospace,monospace" fill="${D}">2</text>
<text x="25" y="${sy3+4}" text-anchor="middle" font-size="8" font-family="ui-monospace,monospace" fill="${D}">3</text>
<text x="25" y="${sy4+4}" text-anchor="middle" font-size="8" font-family="ui-monospace,monospace" fill="${D}">4</text>
${seg(LX,sy1,A1-8,sy1,true)}${ctc(A1,sy1,r4ld[0].a||'I0.0',r1lbl,sc.io.i00)}${seg(A1+8,sy1,CX-13,sy1,sr1)}${coilEl(CX,sy1,sr1,'M0.0','S')}${seg(CX+13,sy1,RX,sy1,false)}
${seg(LX,sy2a,FX,sy2a,true)}<line x1="${FX}" y1="${sy2a}" x2="${FX}" y2="${sy2b}" stroke="${c(true)}" stroke-width="${W}" stroke-linecap="round"/>
${seg(FX,sy2a,A2-8,sy2a,true)}${ctc(A2,sy2a,r2aTag,r2aLbl,'TMR')}${seg(A2+8,sy2a,JX,sy2a,ev(r2aTag))}
${seg(FX,sy2b,A2-8,sy2b,true)}${ctc(A2,sy2b,r2bTag,r2bLbl,sc.io.i01)}${seg(A2+8,sy2b,JX,sy2b,ev(r2bTag))}
<line x1="${JX}" y1="${sy2a}" x2="${JX}" y2="${sy2b}" stroke="${c(sr2)}" stroke-width="${W}" stroke-linecap="round"/>
${seg(JX,sy2a,CX-13,sy2a,sr2)}${coilEl(CX,sy2a,sr2,'M0.0','R')}${seg(CX+13,sy2a,RX,sy2a,false)}
${seg(LX,sy3,A3-8,sy3,true)}${ctc(A3,sy3,'M0.0','M0.0','MEM')}${seg(A3+8,sy3,CX-24,sy3,sr3)}${tonEl(CX,sy3,sr3)}${seg(CX+24,sy3,RX,sy3,false)}
${seg(LX,sy4,A3-8,sy4,true)}${ctc(A3,sy4,'M0.0','M0.0','MEM')}${seg(A3+8,sy4,CX-13,sy4,sr4)}${coilEl(CX,sy4,sr4,'Q0.0','')}${seg(CX+13,sy4,RX,sy4,false)}
</svg>`;
  }

  return `<svg viewBox="0 0 620 ${r2hasParallel?305:272}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
<line x1="${LX}" y1="18" x2="${LX}" y2="${r2hasParallel?292:260}" stroke="${RL}" stroke-width="5" stroke-linecap="round"/>
<line x1="${RX}" y1="18" x2="${RX}" y2="${r2hasParallel?292:260}" stroke="${RL}" stroke-width="5" stroke-linecap="round"/>
<text x="${LX}" y="13" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace" font-weight="700" fill="${RL}">L+</text>
<text x="${RX}" y="13" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace" font-weight="700" fill="${RL}">N</text>
<text x="25" y="${Y1+4}" text-anchor="middle" font-size="8" font-family="ui-monospace,monospace" fill="${D}">1</text>
<text x="25" y="${Y2A+4}" text-anchor="middle" font-size="8" font-family="ui-monospace,monospace" fill="${D}">2</text>
<text x="25" y="${Y3+4}" text-anchor="middle" font-size="8" font-family="ui-monospace,monospace" fill="${D}">3</text>
${seg(LX,Y1,A1-8,Y1,true)}${ctc(A1,Y1,r1aTag,r1aLbl,sc.io.i00)}${seg(A1+8,Y1,B1-8,Y1,ev(r1aTag))}${r1bTag?ctc(B1,Y1,r1bTag,r1bLbl,r1bSub):''}${seg(r1bTag?B1+8:A1+8,Y1,CX-13,Y1,r1)}${coilEl(CX,Y1,r1,'M0.0','S')}${seg(CX+13,Y1,RX,Y1,false)}
${rung2}
${seg(LX,Y3,A3-8,Y3,true)}${ctc(A3,Y3,'M0.0','M0.0','MEM')}${seg(A3+8,Y3,CX-13,Y3,r3)}${coilEl(CX,Y3,r3,'Q0.0','')}${seg(CX+13,Y3,RX,Y3,false)}
</svg>`;
}

function symTableHtml() {
  const sc = SCENARIOS[state.scenario];
  const isSeq = sc.controlMode === 'sequence';
  const rows = [
    { tag:'I0.0', desc:sc.io.i00,  val:()=>state.inputs.start, type:'I', clickable:true  },
    { tag:'I0.1', desc:sc.io.i01,  val:()=>state.inputs.stop,  type:'I', clickable:true  },
    { tag:'I0.2', desc:sc.io.i02,  val:()=>state.levelLow,     type:'I', clickable:false },
    { tag:'I0.3', desc:sc.io.i03,  val:()=>state.levelHigh,    type:'I', clickable:false },
    { tag:'M0.0', desc:'Memoria',  val:()=>state.latch,        type:'M', clickable:false },
    ...(isSeq ? [{ tag:'T0.0', desc:`TON ${sc.timerPT||state.timerPT}s`, val:()=>state.timerQ, type:'T', clickable:false, et:()=>state.timerET }] : []),
    { tag:'Q0.0', desc:sc.io.q00,  val:()=>state.output,       type:'Q', clickable:false },
  ];
  const tn = state.tagNames;
  return `<table class="sym-table"><thead><tr><th>Tag</th><th>Nombre simbólico</th><th>Descripción</th><th>Tipo</th><th>Valor</th></tr></thead><tbody>
${rows.map(r => {
  const v = r.val();
  const etStr = r.et ? ` <small class="sym-et">${r.et().toFixed(1)}s</small>` : '';
  const inp = r.clickable ? ` data-input="${r.tag==='I0.0'?'start':'stop'}"` : '';
  const uc = tagUsageCount(r.tag);
  const ucBadge = uc > 0 ? `<span class="xref-use-badge" title="${uc} uso(s) en el programa">×${uc}</span>` : '';
  const xrefActive = state.xrefTag === r.tag ? ' xref-row-active' : '';
  return `<tr class="sym-row${r.clickable?' sym-clickable':''}${xrefActive}"${inp}>
    <td class="sym-tag sym-tag-${r.type.toLowerCase()}"><button class="xref-tag-btn" data-xref-tag="${r.tag}">${r.tag}</button>${ucBadge}</td>
    <td class="sym-name-cell"><input class="sym-name-inp" data-tag="${r.tag}" value="${tn[r.tag]||''}" placeholder="—" maxlength="12" spellcheck="false"></td>
    <td class="sym-desc">${r.desc}</td>
    <td class="sym-type">${r.type}</td>
    <td class="sym-val"><span id="sv-${r.tag.replace('.','').replace('/','')}" class="sym-bit ${v?'sym-on':'sym-off'}">${v?'1':'0'}</span>${etStr}</td>
  </tr>`;
}).join('')}
</tbody></table>`;
}

function forceTableHtml() {
  const sc = SCENARIOS[state.scenario];
  const tn = state.tagNames;
  const n = t => tn[t] || t;
  const frows = [
    { tag: 'I0.0', desc: sc.io.i00, type: 'BOOL' },
    { tag: 'I0.1', desc: sc.io.i01, type: 'BOOL' },
    { tag: 'I0.2', desc: sc.io.i02, type: 'BOOL' },
    { tag: 'I0.3', desc: sc.io.i03, type: 'BOOL' },
    { tag: 'M0.0', desc: 'Memoria/enclavamiento', type: 'BOOL' },
    { tag: 'Q0.0', desc: sc.io.q00, type: 'BOOL' },
  ];
  return `<table class="sym-table force-table"><thead><tr><th>Tag</th><th>Nombre</th><th>Descripción</th><th>Valor</th><th colspan="3">Forzar</th></tr></thead><tbody>
${frows.map(r => {
  const isF = r.tag in state.forced;
  const fval = state.forced[r.tag];
  const cur = evaluateContact(r.tag);
  return `<tr class="${isF?'ft-forced-row':''}">
    <td class="sym-tag sym-tag-${r.type.toLowerCase()}">${r.tag}</td>
    <td class="sym-name-cell" style="font:700 .78rem/1 ui-monospace,monospace">${n(r.tag)}</td>
    <td class="sym-desc">${r.desc}</td>
    <td class="sym-val"><span class="sym-bit ${cur?'sym-on':'sym-off'}">${cur?'1':'0'}${isF?'<sup title="Forzado">F</sup>':''}</span></td>
    <td><button class="ft-btn ft-btn-1${isF&&fval===true?' ft-active':''}" data-force-tag="${r.tag}" data-force-val="1" title="Forzar a 1">F=1</button></td>
    <td><button class="ft-btn ft-btn-0${isF&&fval===false?' ft-active':''}" data-force-tag="${r.tag}" data-force-val="0" title="Forzar a 0">F=0</button></td>
    <td><button class="ft-btn ft-btn-rel${!isF?' ft-rel-disabled':''}" data-force-tag="${r.tag}" data-force-val="release" title="Liberar">✕</button></td>
  </tr>`;
}).join('')}
</tbody></table>`;
}

function tagBaseOf(t) { return t ? t.replace(/\/(NC|S|R|TON)$/,'') : ''; }

function tagUsageCount(tag) {
  let c = 0;
  state.ladderProgram.forEach((r, ri) => {
    if (!state.ladderStructure[ri]) return;
    if (tagBaseOf(r.a) === tag) c++;
    if (tagBaseOf(r.b) === tag) c++;
    if (tagBaseOf(r.coil) === tag) c++;
  });
  return c;
}

function xrefHtml(tag) {
  const usages = [];
  const tn = state.tagNames;
  state.ladderProgram.forEach((r, ri) => {
    if (!state.ladderStructure[ri]) return;
    const netLbl = `Network ${ri+1}${state.rungTitles[ri] ? ' — ' + state.rungTitles[ri] : ''}`;
    const mod = t => { const m = t.match(/\/(NC|S|R|TON)$/); return m ? m[1] : (t.startsWith('Q')||t.startsWith('M')||t.startsWith('T') ? '(bobina)' : 'NO'); };
    if (tagBaseOf(r.a) === tag)    usages.push({net: netLbl, pos: 'Contacto A', mod: mod(r.a)});
    if (tagBaseOf(r.b) === tag)    usages.push({net: netLbl, pos: 'Contacto B', mod: mod(r.b)});
    if (tagBaseOf(r.coil) === tag) usages.push({net: netLbl, pos: 'Bobina',     mod: mod(r.coil)});
  });
  const symName = tn[tag] ? ` <span class="xref-sym">${tn[tag]}</span>` : '';
  if (!usages.length) return `<p class="xref-empty"><code>${tag}</code>${symName} no se usa en el programa actual.</p>`;
  return `<p class="xref-title"><code>${tag}</code>${symName} — ${usages.length} referencia(s)</p>
<table class="xref-table"><thead><tr><th>Red</th><th>Posición</th><th>Tipo / Modificador</th></tr></thead><tbody>
${usages.map(u=>`<tr><td class="xref-net">${u.net}</td><td class="xref-pos">${u.pos}</td><td class="xref-mod xref-mod-${u.mod.toLowerCase().replace('/','')}">${u.mod}</td></tr>`).join('')}
</tbody></table>`;
}

function programView() {
  const sc = SCENARIOS[state.scenario];
  const running = state.plcRunning && state.compiled;
  const modeText = running ? 'RUN' : (state.plcScanMode ? 'STEP' : (state.compiled ? 'STOP' : 'OFFLINE'));
  const modeClass = running ? 'tia-run' : (state.plcScanMode ? 'tia-step' : (state.compiled ? 'tia-stop' : 'tia-offline'));

  const toolbar = `<div class="tia-toolbar">
    <div class="tia-tbg">
      <button class="tia-tb-btn tia-tb-run${running?' tia-tb-active':''}" data-action="plcRun"${(running||!state.compiled)?' disabled':''}>▶ Arrancar</button>
      <button class="tia-tb-btn tia-tb-stop${!running&&state.compiled?' tia-tb-active':''}" data-action="plcStop"${!running?' disabled':''}>■ Detener</button>
    </div>
    <div class="tia-vsep"></div>
    <button id="compile" class="tia-tb-btn">🔨 Compilar</button>
    <button id="resetPlc" class="tia-tb-btn tia-tb-reset">↺ Reset</button>
    <div class="tia-vsep"></div>
    <button class="tia-tb-btn${state.plcMonitor?' tia-tb-mon-on':''}" data-action="plcMonitor"${!running?' disabled':''}>⬤ Monitor</button>
    <button class="tia-tb-btn" data-action="ladder" title="Ver Ladder en vivo">⚡ En vivo</button>
    <button class="tia-tb-btn${state.plcFtOpen?' tia-tb-mon-on':''}" data-action="plcFtToggle" title="Tabla de forzado">🔒 Forzado${Object.keys(state.forced).length?` <span class="ft-badge">${Object.keys(state.forced).length}</span>`:''}</button>
    <div class="tia-vsep"></div>
    <button class="tia-tb-btn${state.plcScanMode?' tia-tb-mon-on':''}" data-action="plcScanToggle" title="Modo paso a paso"${!state.compiled?' disabled':''}>⏩ Paso</button>
    <button class="tia-tb-btn" data-action="plcStep" title="Ejecutar un ciclo de scan"${!state.plcScanMode?' disabled':''}>⏭ Un ciclo${state.plcScanMode?` <span class="ft-badge">#${state.scanCount}</span>`:''}</button>
    <div class="tia-spacer"></div>
    <span class="tia-mode-chip ${modeClass}">${modeText}</span>
    <span class="tia-cpu-lbl">CPU 1212C DC/DC/DC</span>
  </div>`;

  const tree = `<div class="tia-tree">
    <p class="eyebrow" style="margin:0 0 8px;font-size:.68rem">Árbol del proyecto</p>
    <ul class="tia-ul">
      <li class="tia-li-root">📁 PLC_1 [S7-1200]
        <ul class="tia-ul">
          <li class="tia-li">📁 Bloques de programa
            <ul class="tia-ul">
              <li class="tia-li tia-li-sel">📋 OB1 — Main</li>
            </ul>
          </li>
          <li class="tia-li">📊 Variables de PLC</li>
          <li class="tia-li">⚙ Config. dispositivo</li>
          <li class="tia-li">🔍 Diagnósticos</li>
        </ul>
      </li>
    </ul>
    <div class="tia-tree-ft">
      <p class="helper" style="margin:0;font-size:.68rem;line-height:1.5">CE 2.1.2<br>S7-1200 · LAD<br>Enclavamiento M/P</p>
    </div>
  </div>`;

  const runColor  = running ? '#22c55e' : '#374151';
  const stopColor = !running && state.compiled ? '#f59e0b' : '#374151';
  const errColor  = state.alarm && running ? '#ef4444' : '#374151';
  const diVals    = [state.inputs.start, state.inputs.stop, state.levelLow, state.levelHigh];
  const dqVals    = [state.output, false, state.alarm && running];
  const diLeds    = diVals.map((on,i) =>
    `<circle id="plc-di-${i}" cx="${18+i*22}" cy="122" r="5.5" fill="${on&&running?'#22c55e':'#374151'}"/>` +
    `<text x="${18+i*22}" y="136" text-anchor="middle" font-size="6.5" fill="#6b7280">I0.${i}</text>`
  ).join('');
  const dqLeds    = dqVals.map((on,i) =>
    `<circle id="plc-dq-${i}" cx="${18+i*22}" cy="174" r="5.5" fill="${on?'#22c55e':'#374151'}"/>` +
    `<text x="${18+i*22}" y="188" text-anchor="middle" font-size="6.5" fill="#6b7280">Q0.${i}</text>`
  ).join('');

  const s7svg = `<svg id="s7-plc-svg" viewBox="0 0 170 242" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:164px;height:auto;display:block;margin:0 auto">
    <rect x="1" y="1" width="168" height="240" rx="6" fill="#1f2937" stroke="#374151" stroke-width="1.5"/>
    <rect x="1" y="1" width="168" height="34" rx="6" fill="#111827"/>
    <rect x="1" y="27" width="168" height="8" fill="#111827"/>
    <text x="9" y="16" font-size="9" font-weight="700" font-family="system-ui,sans-serif" fill="#d1d5db">SIMATIC S7-1200</text>
    <text x="9" y="28" font-size="7" font-family="system-ui,sans-serif" fill="#6b7280">CPU 1212C DC/DC/DC</text>
    <rect x="6" y="40" width="104" height="48" rx="3" fill="#0f172a" stroke="#374151" stroke-width="1"/>
    <text x="12" y="54" font-size="7" font-weight="600" font-family="system-ui,sans-serif" fill="#4b5563">ESTADO</text>
    <circle id="plc-led-run" cx="16" cy="64" r="5" fill="${runColor}"/>
    <text x="25" y="68" font-size="7" fill="#9ca3af" font-family="system-ui,sans-serif">RUN</text>
    <circle id="plc-led-stop" cx="16" cy="78" r="5" fill="${stopColor}"/>
    <text x="25" y="82" font-size="7" fill="#9ca3af" font-family="system-ui,sans-serif">STOP</text>
    <circle id="plc-led-err" cx="66" cy="64" r="5" fill="${errColor}"/>
    <text x="75" y="68" font-size="7" fill="#9ca3af" font-family="system-ui,sans-serif">ERR</text>
    <circle cx="66" cy="78" r="5" fill="#374151"/>
    <text x="75" y="82" font-size="7" fill="#9ca3af" font-family="system-ui,sans-serif">MAINT</text>
    <rect x="114" y="40" width="50" height="48" rx="3" fill="#0f172a" stroke="#374151" stroke-width="1"/>
    <text x="119" y="54" font-size="7" font-weight="600" font-family="system-ui,sans-serif" fill="#4b5563">PROFINET</text>
    <rect x="119" y="59" width="38" height="24" rx="2" fill="#0c1829" stroke="#1d4ed8" stroke-width="1"/>
    <rect x="123" y="63" width="30" height="16" rx="1" fill="#172554"/>
    <text x="138" y="74" text-anchor="middle" font-size="5.5" fill="#3b82f6" font-family="monospace">LNK/ACT</text>
    <rect x="6" y="95" width="158" height="46" rx="3" fill="#0f172a" stroke="#374151" stroke-width="1"/>
    <text x="12" y="109" font-size="7" font-weight="600" font-family="system-ui,sans-serif" fill="#4b5563">ENTRADAS DI 0.0–0.3</text>
    ${diLeds}
    <rect x="6" y="148" width="158" height="46" rx="3" fill="#0f172a" stroke="#374151" stroke-width="1"/>
    <text x="12" y="162" font-size="7" font-weight="600" font-family="system-ui,sans-serif" fill="#4b5563">SALIDAS DQ 0.0–0.2</text>
    ${dqLeds}
    <rect x="6" y="200" width="158" height="22" rx="3" fill="#0f172a" stroke="#374151" stroke-width="1"/>
    <text x="85" y="214" text-anchor="middle" font-size="6.5" fill="#4b5563" font-family="system-ui,sans-serif">50 KB · 8 DI / 6 DQ · PROFINET</text>
    <rect x="1" y="228" width="168" height="13" rx="0" fill="#374151"/>
    <rect x="8" y="231" width="154" height="7" rx="2" fill="#4b5563"/>
    <text x="85" y="237" text-anchor="middle" font-size="6" fill="#9ca3af" font-family="system-ui,sans-serif">SIEMENS</text>
  </svg>`;

  const pilotRow = `<div class="plc-pilots">
    <div id="plc-pilot-q00" class="plc-pilot${state.output?' plc-on':''}">
      <div class="plc-bulb plc-bulb-green"></div>
      <span class="plc-lbl">Q0.0<br>${sc.io.q00}</span>
    </div>
    <div id="plc-pilot-q01" class="plc-pilot">
      <div class="plc-bulb plc-bulb-amber"></div>
      <span class="plc-lbl">Q0.1<br>ÁMBAR</span>
    </div>
    <div id="plc-pilot-q02" class="plc-pilot${state.alarm&&running?' plc-on':''}">
      <div class="plc-bulb plc-bulb-red"></div>
      <span class="plc-lbl">Q0.2<br>ALARMA</span>
    </div>
  </div>`;

  const pushbtns = `<div class="plc-pushbtns">
    <button class="plc-pbtn plc-pbtn-start" data-action="plcStart">▶<br>START<br><small>I0.0</small></button>
    <button class="plc-pbtn plc-pbtn-stop" data-action="plcStopBtn">■<br>STOP<br><small>I0.1</small></button>
  </div>`;

  const devicePanel = `<div class="tia-device">
    <p class="eyebrow" style="margin:0 0 8px;font-size:.68rem">Dispositivo</p>
    ${s7svg}
    <div class="tia-dev-sec">
      <p class="eyebrow" style="margin:0 0 6px;font-size:.68rem">Pulsadores de campo</p>
      ${pushbtns}
      <p class="helper" style="margin:4px 0 0;font-size:.68rem">Pulsa START para arrancar, STOP para parar.</p>
    </div>
    <div class="tia-dev-sec">
      <p class="eyebrow" style="margin:0 0 6px;font-size:.68rem">Pilotos de señal</p>
      ${pilotRow}
    </div>
  </div>`;

  const vtOpen = state.plcVtOpen !== false;
  const vtable = `<div class="tia-vartable">
    <button class="tia-vt-hd" data-action="plcVtToggle">
      <span>📊 Tabla de variables PLC</span>
      <span class="tia-vt-arrow">${vtOpen?'▲':'▼'}</span>
    </button>
    ${vtOpen?`<div class="tia-vt-bd">${symTableHtml()}</div>`:''}
  </div>`;

  return `<div class="tia-shell card panel">
    ${toolbar}
    ${state.feedback?`<div class="feedback ${state.feedbackType} tia-fbk">${state.feedback}</div>`:''}
    <div class="tia-body">
      ${tree}
      <div class="tia-editor">
        <div class="tia-net-hd">Network 1 — OB1 · ${sc.label}</div>
        ${builderLadder()}
      </div>
      ${devicePanel}
    </div>
    ${vtable}
    <div class="tia-vartable">
      <button class="tia-vt-hd" data-action="plcFtToggle">
        <span>🔒 Tabla de forzado${Object.keys(state.forced).length?` <span class="ft-badge">${Object.keys(state.forced).length} activo(s)</span>`:''}</span>
        <span class="tia-vt-arrow">${state.plcFtOpen?'▲':'▼'}</span>
      </button>
      ${state.plcFtOpen?`<div class="tia-vt-bd">${forceTableHtml()}</div>`:''}
    </div>
    <div class="tia-vartable">
      <button class="tia-vt-hd" data-action="plcXrefToggle">
        <span>🔗 Referencias cruzadas${state.xrefTag?` — <code>${state.xrefTag}</code>`:''}</span>
        <span class="tia-vt-arrow">${state.xrefTag?'▲':'▼'}</span>
      </button>
      ${state.xrefTag?`<div class="tia-vt-bd xref-bd">${xrefHtml(state.xrefTag)}</div>`:''}
    </div>
  </div>`;
}

function voltageAt(point) {
  const sc = SCENARIOS[state.scenario];
  const supply = effectivePower() && state.wires.supply ? 24 : 0;
  const sensorV = supply && effectiveSensorWire()
    ? (sc.controlMode === 'detect' ? (state.levelLow ? 24 : 0) : state.level / 10)
    : 0;
  const controlOut = supply && !safetyOpen() && state.pumpCommand ? 24 : 0;
  const motorV = controlOut && effectiveOutputWire() ? 24 : 0;
  if (state.diagActive) {
    if (state.fault === 'q1Fault')          return ({p1:supply, p2:sensorV, p3:sensorV, p4:0,       p5:0     })[point] ?? 0;
    if (state.fault === 'sensorSignalLow')  return ({p1:supply, p2:0,       p3:0,       p4:controlOut, p5:motorV})[point] ?? 0;
    if (state.fault === 'sensorSignalHigh') return ({p1:supply, p2:10,      p3:10,      p4:controlOut, p5:motorV})[point] ?? 0;
    if (state.fault === 'sensorBlock')      return ({p1:supply, p2:24,      p3:24,      p4:controlOut, p5:motorV})[point] ?? 0;
  }
  return ({p1:supply, p2:sensorV, p3:sensorV, p4:controlOut, p5:motorV})[point] ?? 0;
}

function diagnoseView() {
  const sc = SCENARIOS[state.scenario];
  const sf = currentFaults();
  const tp = ({
    level:       { p2b:'Sensor nivel',  p2s:'0–10 V',  p5b:sc.io.q00, p5s:'Motor'  },
    temperature: { p2b:'Sensor temp.',  p2s:'0–10 V',  p5b:sc.io.q00, p5s:'Motor'  },
    conveyor:    { p2b:'Sensor foto.',  p2s:'0–24 V',  p5b:sc.io.q00, p5s:'Correa' },
    sequence:    { p2b:'Sensor nivel',  p2s:'0–10 V',  p5b:sc.io.q00, p5s:'Motor'  },
  })[state.scenario] || { p2b:'Sensor', p2s:'0–10 V', p5b:sc.io.q00, p5s:'Carga' };
  const meter = state.readings.length ? state.readings[state.readings.length-1].value.toFixed(1) : "---";
  return `<div class="grid-two"><section class="card panel"><div class="row"><div><h2>Multímetro virtual</h2></div><span class="mode-chip">V⎓</span></div><div class="meter-real"><img src="./assets/multimeter.png" alt="Multímetro digital"><div class="meter-screen">${meter} <small>V</small></div><div class="meter-mode">V⎓</div></div><div class="testpoints"><button class="testpoint" data-point="p1"><b>P1 · Fuente</b>24 VDC</button><button class="testpoint" data-point="p2"><b>P2 · ${tp.p2b}</b>${tp.p2s}</button><button class="testpoint" data-point="p3"><b>P3 · Entrada</b>AI0</button><button class="testpoint" data-point="p4"><b>P4 · Salida</b>Q0.0</button><button class="testpoint" data-point="p5"><b>P5 · ${tp.p5b}</b>${tp.p5s}</button></div></section>
    <section class="card panel"><h2>Diagnóstico</h2><p class="helper">Mide en cada punto del lazo y registra los valores antes de determinar la falla.</p><button id="newFault" class="btn gold full">${state.diagActive?"Generar otra falla":"Iniciar diagnóstico"}</button><div class="log" style="margin-top:12px">${state.readings.length?state.readings.map(r=>`<p>${r.time} · ${r.name}: <strong>${r.value.toFixed(1)} V</strong></p>`).join(""):"Aún no hay mediciones registradas."}</div><label style="margin-top:12px">Conclusión<select id="diagnosis" ${state.diagActive?"":"disabled"}><option value="">Selecciona una falla…</option>${Object.entries(sf).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("")}</select></label><button id="checkDiagnosis" class="btn primary full" style="margin-top:10px" ${state.diagActive?"":"disabled"}>Comprobar diagnóstico</button>${state.feedback?`<div class="feedback ${state.feedbackType}" style="margin-top:10px">${state.feedback}</div>`:""}</section></div>`;
}

function workbenchComponent(id) {
  return state.workbench.components.find(component => component.id === id);
}

function workbenchTerminal(componentId, terminalKey) {
  const component = workbenchComponent(componentId);
  const part = component ? workbenchParts[component.type] : null;
  const terminal = part?.terminals.find(item => item.key === terminalKey);
  return component && part && terminal ? { component, part, terminal } : null;
}

function workbenchTerminalPoint(endpoint) {
  const found = workbenchTerminal(endpoint.componentId, endpoint.terminalKey);
  if (!found) return null;
  const side = found.terminal.labelSide || (found.terminal.x > 50 ? 'right' : 'left');
  return {
    x: found.component.x + found.part.width  * found.terminal.x / 100,
    y: found.component.y + found.part.height * found.terminal.y / 100,
    kind: found.terminal.kind,
    side
  };
}

function workbenchWireColor(kind) {
  return ({ positive: "#d73f35", common: "#2777b8", signal: "#1b8f63", input: "#7a55b3", output: "#d18818" })[kind] || "#405149";
}

function workbenchLinkMatches(connection, typeA, terminalA, typeB, terminalB) {
  const from = workbenchTerminal(connection.from.componentId, connection.from.terminalKey);
  const to = workbenchTerminal(connection.to.componentId, connection.to.terminalKey);
  if (!from || !to) return false;
  return (from.component.type === typeA && from.terminal.key === terminalA && to.component.type === typeB && to.terminal.key === terminalB) ||
    (from.component.type === typeB && from.terminal.key === terminalB && to.component.type === typeA && to.terminal.key === terminalA);
}

function workbenchBusOutputKeys() {
  return ["out1", "out2", "out3"];
}

function workbenchBusFeeds(busType, destinationType, destinationTerminal) {
  return workbenchBusOutputKeys().some(output => workbenchHasLink(busType, output, destinationType, destinationTerminal));
}

function workbenchConnectionIsBusFeed(connection, busType, destinationType, destinationTerminal) {
  return workbenchBusOutputKeys().some(output => workbenchLinkMatches(connection, busType, output, destinationType, destinationTerminal));
}

function updateWorkbenchTest() {
  const test = state.workbench.test || (state.workbench.test = defaultWorkbenchTest(state.workbench.scenario));
  if (!test.running || !workbenchValidation().complete) {
    test.output = false;
    return;
  }
  if (state.workbench.scenario === "level") {
    if (test.variable <= 30) test.output = true;
    if (test.variable >= 75) test.output = false;
  } else if (state.workbench.scenario === "temperature") {
    if (test.variable >= 30) test.output = true;
    if (test.variable <= 26) test.output = false;
  } else {
    test.output = !Boolean(test.variable);
  }
}

function workbenchConnectionIsLive(connection) {
  const test = state.workbench.test;
  const validation = workbenchValidation();
  if (!test?.running || !validation.complete) return false;
  const scenario = validation.scenario;
  if (workbenchLinkMatches(connection, "logo", "q1no", scenario.actuator, "vplus")) return test.output;
  if (workbenchLinkMatches(connection, scenario.sensor, "out", "logo", scenario.input)) return state.workbench.scenario === "conveyor" ? Boolean(test.variable) : true;
  return workbenchLinkMatches(connection, "supply", "lplus", "lplusBus", "in") ||
    workbenchLinkMatches(connection, "supply", "m", "commonBus", "in") ||
    workbenchConnectionIsBusFeed(connection, "lplusBus", "logo", "lplus") ||
    workbenchConnectionIsBusFeed(connection, "commonBus", "logo", "m") ||
    workbenchConnectionIsBusFeed(connection, "lplusBus", scenario.sensor, "vplus") ||
    workbenchConnectionIsBusFeed(connection, "commonBus", scenario.sensor, "m") ||
    workbenchConnectionIsBusFeed(connection, "lplusBus", "logo", "q1com") ||
    workbenchConnectionIsBusFeed(connection, "commonBus", scenario.actuator, "m");
}

function workbenchDiagramMarkup() {
  const key = state.workbench.scenario;
  const D = ({
    level:       { sensor: 'Sensor nivel',   input: 'AI0', actuator: 'Bomba',        sig: '0–10 V' },
    temperature: { sensor: 'Sensor temp.',   input: 'AI0', actuator: 'Ventilador',   sig: '0–10 V' },
    conveyor:    { sensor: 'Sensor fotoel.', input: 'I1',  actuator: 'Motor correa', sig: '0/24 V' },
  })[key] || { sensor: 'Sensor', input: 'AI0', actuator: 'Actuador', sig: '0–10 V' };
  const R='#d63a3a', B='#2368b8', G='#277a4a', O='#c46220';
  const blk = (x,y,w,h,t,s) => `<rect class="dgm-blk" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><text class="dgm-title" x="${x+w/2}" y="${y+22}" text-anchor="middle">${t}</text><text class="dgm-sub" x="${x+w/2}" y="${y+40}" text-anchor="middle">${s}</text>`;
  const dot = (x,y,c) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`;
  const jct = (x,y,c) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${c}"/>`;
  const lbl = (x,y,s,a,c) => `<text x="${x}" y="${y}" text-anchor="${a}" class="dgm-lbl" fill="${c}">${s}</text>`;
  const wir = (d,c,w=2) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // coordinates
  const [yL,yM]=[20,258]; // bus y
  const [px,py,pw,ph]=[28,50,100,105]; // PSU
  const [sx,sy,sw,sh]=[28,180,100,65]; // Sensor
  const [lx,ly,lw,lh]=[292,30,192,215]; // LOGO!
  const [ax,ay,aw,ah]=[660,65,135,105]; // Actuator
  const [pLx,pLy]=[px+pw/2,py]; const [pMx,pMy]=[px+pw/2+10,py+ph];
  const [soX,soY]=[sx+sw,sy+sh/2];
  const [liX,liY]=[lx,ly+50]; const [lmX,lmY]=[lx,ly+82]; const [lsX,lsY]=[lx,ly+148];
  const [cX,cY]=[lx+lw,ly+148]; const [nX,nY]=[lx+lw,ly+180];
  const [aIX,aIY]=[ax,ay+30]; const [aMX,aMY]=[ax,ay+72];
  return `<svg viewBox="0 0 840 276" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;max-height:280px"><style>.dgm-blk{fill:var(--surface-2,#edf2ef);stroke:var(--line,#b0cfc2);stroke-width:1.5}.dgm-title{font:700 12px/1 system-ui,sans-serif;fill:var(--text,#0a2e22)}.dgm-sub{font:10px/1 system-ui,sans-serif;fill:var(--text-2,#3d6053)}.dgm-lbl{font:9.5px/1 system-ui,sans-serif}</style>
  ${wir(`M0 ${yL}H840`,R,2.5)}${lbl(6,yL-3,'L+','start',R)}
  ${wir(`M0 ${yM}H840`,B,2.5)}${lbl(6,yM+10,'M','start',B)}
  ${wir(`M${pLx} ${pLy}V${yL}`,R)}${wir(`M${pMx} ${pMy}V${yM}`,B)}
  ${wir(`M${soX} ${soY}H${lx-28}V${lsY}H${lx}`,G,2.5)}
  ${wir(`M${lx-18} ${yL}V${liY}H${lx}`,R)}${wir(`M${lx-6} ${yM}V${lmY}H${lx}`,B)}
  ${wir(`M${lx+lw+22} ${yL}V${cY}H${cX}`,R)}
  ${wir(`M${nX} ${nY}H${lx+lw+50}V${aIY}H${aIX}`,O,2.5)}
  ${wir(`M${aMX} ${aMY}H${ax-35}V${yM}`,B)}
  ${blk(px,py,pw,ph,'Fuente','24 VDC')}${blk(sx,sy,sw,sh,D.sensor,D.sig)}
  ${blk(lx,ly,lw,lh,'LOGO!','Controlador configurable')}
  ${blk(ax,ay,aw,ah,D.actuator,'+24 VDC')}
  ${dot(pLx,pLy,R)}${dot(pMx,pMy,B)}
  ${dot(soX,soY,G)}${lbl(soX+5,soY+4,'OUT','start',G)}
  ${dot(lsX,lsY,G)}${lbl(lsX-5,lsY-6,D.input,'end',G)}
  ${dot(liX,liY,R)}${lbl(liX-5,liY+4,'L+','end',R)}${jct(lx-18,yL,R)}
  ${dot(lmX,lmY,B)}${lbl(lmX-5,lmY+4,'M','end',B)}${jct(lx-6,yM,B)}
  ${dot(cX,cY,R)}${lbl(cX+5,cY+4,'Q1 COM','start',R)}${jct(lx+lw+22,yL,R)}
  ${dot(nX,nY,O)}${lbl(nX+5,nY+4,'Q1 NO','start',O)}
  ${dot(aIX,aIY,O)}${lbl(aIX-5,aIY-7,'+','end',O)}
  ${dot(aMX,aMY,B)}${lbl(aMX-5,aMY-7,'M','end',B)}${jct(ax-35,yM,B)}
  </svg>`;
}

function workbenchWireMarkup() {
  const LEAD = 20;
  const leadOf = side => ({ left:[-LEAD,0], right:[LEAD,0], up:[0,-LEAD] })[side] || [LEAD,0];
  return state.workbench.connections.map(connection => {
    const a = workbenchTerminalPoint(connection.from);
    const b = workbenchTerminalPoint(connection.to);
    if (!a || !b) return "";
    const [adx,ady] = leadOf(a.side);
    const [bdx,bdy] = leadOf(b.side);
    const ax2 = a.x+adx, ay2 = a.y+ady;
    const bx2 = b.x+bdx, by2 = b.y+bdy;
    const midX = (ax2+bx2)/2;
    const path = `M ${a.x} ${a.y} L ${ax2} ${ay2} H ${midX} V ${by2} H ${bx2} L ${b.x} ${b.y}`;
    const color = workbenchWireColor(a.kind==="common"||b.kind==="common" ? "common" : a.kind);
    const live = workbenchConnectionIsLive(connection);
    return `<g class="wire-group" data-wire-id="${connection.id}"><path class="workbench-wire" d="${path}" style="--wire:${color}"/>${live?`<path class="workbench-wire-flow" d="${path}" style="--wire:${color}"/>`:""}<path class="wire-hit" d="${path}"/></g>`;
  }).join("");
}

function workbenchTerminalLive(componentId, terminalKey) {
  return state.workbench.connections.some(connection => {
    const includesTerminal = (connection.from.componentId === componentId && connection.from.terminalKey === terminalKey) ||
      (connection.to.componentId === componentId && connection.to.terminalKey === terminalKey);
    return includesTerminal && workbenchConnectionIsLive(connection);
  });
}

function workbenchProcessAnimation(component, scenario, ready) {
  const test = state.workbench.test;
  if (!ready || !test?.running) return "";
  if (component.type === "tank") {
    return `<div class="wb-tank-fill" style="height:${Math.max(4, Math.min(58, test.variable * .58))}%"><i></i></div><span class="wb-process-chip">NIVEL ${test.variable}%</span>`;
  }
  if (component.type === "temperatureSensor") {
    return `<div class="wb-heat-motion ${test.variable >= 30 ? "hot" : ""}"><i></i><i></i><i></i></div><span class="wb-process-chip">${test.variable} °C</span>`;
  }
  if (component.type === "photoSensor") {
    return `<div class="wb-photo-beam ${test.variable ? "detected" : ""}"><i></i></div><span class="wb-process-chip">${test.variable ? "PRODUCTO" : "ZONA LIBRE"}</span>`;
  }
  if (component.type === scenario.actuator) {
    if (component.type === "pump") return `<div class="wb-pump-motion ${test.output ? "running" : ""}"></div><span class="wb-process-chip">${test.output ? "EN MARCHA" : "DETENIDA"}</span>`;
    if (component.type === "fan") return `<div class="wb-fan-motion ${test.output ? "running" : ""}"><i></i></div><span class="wb-process-chip">${test.output ? "VENTILANDO" : "DETENIDO"}</span>`;
    if (component.type === "conveyor") return `<div class="wb-conveyor-motion ${test.output ? "running" : ""}"><i></i></div><span class="wb-process-chip">${test.output ? "CORREA EN MARCHA" : "CORREA DETENIDA"}</span>`;
  }
  return "";
}

function workbenchComponentMarkup(component) {
  const part = workbenchParts[component.type];
  if (!part) return "";
  const selected = state.workbench.selectedTerminal;
  const scenario = workbenchScenarios[state.workbench.scenario] || workbenchScenarios.level;
  const validation = workbenchValidation();
  const ready = validation.complete;
  const powered = state.workbench.test?.running && ready && ["supply", "lplusBus", "commonBus", "logo", scenario.sensor].includes(component.type);
  const activeOutput = state.workbench.test?.running && state.workbench.test.output && component.type === scenario.actuator;
  const bus = ["lplusBus", "commonBus"].includes(component.type);
  const occupiedCount = bus ? part.terminals.filter(terminal => workbenchTerminalOccupied(component.id, terminal.key)).length : 0;
  return `<div class="placed-component ${bus ? "bus-component" : ""} ${powered ? "energized" : ""} ${activeOutput ? "active-output" : ""}" data-component-id="${component.id}" data-component-type="${component.type}" tabindex="0" aria-label="${part.label}" style="left:${component.x}px;top:${component.y}px;width:${part.width}px;height:${part.height}px">
    <button class="component-remove" data-remove-component="${component.id}" aria-label="Quitar ${part.label}" title="Quitar componente">×</button>
    <div class="mounted-device"><img src="${part.image}" alt="${part.label}" draggable="false">${workbenchProcessAnimation(component, scenario, ready)}</div>
    <strong class="mounted-label">${part.short}${bus ? `<em>${occupiedCount}/${part.terminals.length} OCUPADOS</em>` : ""}</strong>
    ${part.terminals.map(terminal => {
      const occupied = workbenchTerminalOccupied(component.id, terminal.key);
      const live = occupied && workbenchTerminalLive(component.id, terminal.key);
      const stateLabel = live ? "ocupado y energizado" : occupied ? "ocupado" : "libre";
      return `<button class="terminal ${selected?.componentId===component.id&&selected?.terminalKey===terminal.key?"selected":""} ${occupied ? "occupied" : "free"} ${live ? "live" : ""} terminal-${terminal.kind} terminal-label-${terminal.labelSide || (terminal.x > 50 ? "right" : "left")}" data-terminal="${terminal.key}" data-component="${component.id}" data-label="${terminal.label}" style="left:${terminal.x}%;top:${terminal.y}%" aria-label="Borne ${terminal.label} de ${part.label}: ${stateLabel}" title="${terminal.label} · ${stateLabel}"><span>${terminal.label}</span></button>`;
    }).join("")}
  </div>`;
}

function workbenchHasLink(typeA, terminalA, typeB, terminalB) {
  return state.workbench.connections.some(connection => {
    const from = workbenchTerminal(connection.from.componentId, connection.from.terminalKey);
    const to = workbenchTerminal(connection.to.componentId, connection.to.terminalKey);
    if (!from || !to) return false;
    return (from.component.type === typeA && from.terminal.key === terminalA && to.component.type === typeB && to.terminal.key === terminalB) ||
      (from.component.type === typeB && from.terminal.key === terminalB && to.component.type === typeA && to.terminal.key === terminalA);
  });
}

function workbenchValidation() {
  const has = type => state.workbench.components.some(component => component.type === type);
  const scenario = workbenchScenarios[state.workbench.scenario] || workbenchScenarios.level;
  const checks = [
    { id: "parts", label: `Fuente, LOGO!, ${scenario.sensorLabel} y ${scenario.actuatorLabel} instalados`, hint: `Arrastra desde el gabinete: Fuente LOGO! 24 VDC, Controlador LOGO!, ${scenario.sensorLabel} y ${scenario.actuatorLabel}.`, ok: ["supply", "logo", scenario.sensor, scenario.actuator].every(has) },
    { id: "buses", label: "Borneras L+ y M instaladas", hint: "Arrastra las dos borneras de distribución: Bornera L+ y Bornera M / 0 V.", ok: ["lplusBus", "commonBus"].every(has) },
    { id: "busSupply", label: "Fuente conectada a las entradas de ambas borneras", hint: "Conecta: Fuente L+ → Bornera L+ ENTRADA, y Fuente M → Bornera M ENTRADA.", ok: workbenchHasLink("supply", "lplus", "lplusBus", "in") && workbenchHasLink("supply", "m", "commonBus", "in") },
    { id: "logoPower", label: "LOGO! alimentado desde las borneras L+ y M", hint: "Conecta: Bornera L+ (L+ 1/2/3) → LOGO! L+, y Bornera M (M 1/2/3) → LOGO! M.", ok: workbenchBusFeeds("lplusBus", "logo", "lplus") && workbenchBusFeeds("commonBus", "logo", "m") },
    { id: "sensorPower", label: `${scenario.sensorLabel} alimentado desde las borneras`, hint: `Conecta: Bornera L+ (L+ 1/2/3) → ${scenario.sensorLabel} +24, y Bornera M (M 1/2/3) → ${scenario.sensorLabel} M.`, ok: workbenchBusFeeds("lplusBus", scenario.sensor, "vplus") && workbenchBusFeeds("commonBus", scenario.sensor, "m") },
    { id: "sensorSignal", label: `Señal OUT conectada a ${scenario.inputLabel}`, hint: `Conecta: ${scenario.sensorLabel} OUT → LOGO! ${scenario.inputLabel}.`, ok: workbenchHasLink(scenario.sensor, "out", "logo", scenario.input) },
    { id: "outputFeed", label: "Q1 COM alimentado desde la bornera L+", hint: "Conecta: Bornera L+ (L+ 1/2/3) → LOGO! Q1 COM.", ok: workbenchBusFeeds("lplusBus", "logo", "q1com") },
    { id: "actuatorOutput", label: `Contacto Q1 NO conectado a ${scenario.actuatorLabel}`, hint: `Conecta: LOGO! Q1 NO → ${scenario.actuatorLabel} +24.`, ok: workbenchHasLink("logo", "q1no", scenario.actuator, "vplus") },
    { id: "return", label: `Retorno de ${scenario.actuatorLabel} conectado a la bornera M`, hint: `Conecta: Bornera M (M 1/2/3) → ${scenario.actuatorLabel} M.`, ok: workbenchBusFeeds("commonBus", scenario.actuator, "m") }
  ];
  return { checks, complete: checks.every(check => check.ok), scenario };
}

function workbenchOperationMarkup(validation) {
  const test = state.workbench.test || (state.workbench.test = defaultWorkbenchTest(state.workbench.scenario));
  const scenario = validation.scenario;
  const ready = validation.complete;
  let control = "";
  let inputText = "";
  let rule = "";
  if (state.workbench.scenario === "level") {
    inputText = `${test.variable}%`;
    rule = "Q1 cierra con nivel ≤ 30% y abre con nivel ≥ 75%.";
    control = `<label class="operation-variable"><span>Nivel simulado <b>${test.variable}%</b></span><input id="workbenchVariable" type="range" min="0" max="100" step="1" value="${test.variable}" aria-label="Nivel simulado del estanque"></label>`;
  } else if (state.workbench.scenario === "temperature") {
    inputText = `${test.variable} °C`;
    rule = "Q1 cierra a 30 °C y abre al bajar a 26 °C.";
    control = `<label class="operation-variable"><span>Temperatura simulada <b>${test.variable} °C</b></span><input id="workbenchVariable" type="range" min="10" max="80" step="1" value="${test.variable}" aria-label="Temperatura simulada"></label>`;
  } else {
    inputText = test.variable ? "Producto detectado" : "Zona libre";
    rule = "La correa funciona con la zona libre y se detiene al detectar un producto.";
    control = `<button id="workbenchObject" class="btn ${test.variable ? "gold" : ""}" aria-pressed="${Boolean(test.variable)}">${test.variable ? "Retirar producto" : "Colocar producto"}</button>`;
  }
  return `<section class="operation-panel ${test.running ? "running" : ""}" aria-label="Prueba de operación del montaje">
    <div class="operation-head"><div><p class="eyebrow">Prueba operativa</p><h3>${scenario.label}</h3><p>${rule}</p></div><button id="runWorkbench" class="btn ${test.running ? "danger" : "primary"}">${test.running ? "Detener prueba" : "Probar operación"}</button></div>
    <div class="operation-body"><div class="operation-control">${control}</div><div class="operation-status"><div class="${test.running ? "on" : ""}"><span>Entrada</span><b>${test.running ? inputText : "Sin prueba"}</b></div><div class="${test.running && test.output ? "on" : ""}"><span>Q1</span><b>${test.running ? (test.output ? "CERRADO · ON" : "ABIERTO · OFF") : "Sin prueba"}</b></div><div class="${ready ? "ready" : ""}"><span>Circuito</span><b>${ready ? "LISTO" : "INCOMPLETO"}</b></div></div></div>
    <p class="operation-safety"><b>Distribución de 24 VDC:</b> la fuente alimenta las borneras L+ y M. Desde ellas se derivan el LOGO!, el sensor y la carga. L+ entra a Q1 COM y sale por Q1 NO hacia el actuador. Si la corriente supera la capacidad del contacto, se debe usar un relé de interfaz o contactor.</p>
  </section>`;
}

function workbenchConnectionLabel(connection) {
  const from = workbenchTerminal(connection.from.componentId, connection.from.terminalKey);
  const to = workbenchTerminal(connection.to.componentId, connection.to.terminalKey);
  if (!from || !to) return "Conexión";
  return `${from.part.short} ${from.terminal.label} → ${to.part.short} ${to.terminal.label}`;
}

function builderView() {
  const validation = workbenchValidation();
  updateWorkbenchTest();
  const scenario = validation.scenario;
  const selected = state.workbench.selectedTerminal ? workbenchTerminal(state.workbench.selectedTerminal.componentId, state.workbench.selectedTerminal.terminalKey) : null;
  return `<section class="card system-picker"><div class="row"><div><p class="eyebrow">Proceso a controlar</p><h2>Selecciona el sistema</h2></div><button class="btn diagram-toggle-btn" data-action="toggleDiagram">${state.workbenchDiagramOpen ? '▲ Ocultar diagrama' : '▼ Diagrama de cableado'}</button></div><div class="system-options">${Object.entries(workbenchScenarios).map(([key,item])=>`<button data-workbench-scenario="${key}" class="${state.workbench.scenario===key?"active":""}"><span>${state.workbench.completed.includes(key)?"✓":""}</span><b>${item.label}</b><small>${item.description}</small></button>`).join("")}</div></section>
  ${state.workbenchDiagramOpen ? `<section class="card diagram-card">${workbenchDiagramMarkup()}</section>` : ''}
  <div class="builder-layout">
    <aside class="card component-palette">
      <div class="builder-section-head"><div><p class="eyebrow">Componentes disponibles</p><h2>Gabinete</h2></div></div>
      <p class="helper">Pulsa un componente para colocarlo en la mesa.</p>
      <div class="palette-list">${Object.entries(workbenchParts).map(([type, part]) => `<button class="palette-part" draggable="true" data-palette-type="${type}" title="Añadir ${part.label}"><img src="${part.image}" alt=""><span><strong>${part.label}</strong><small>${part.terminals.map(t=>t.label).join(" · ")}</small></span><b>＋</b></button>`).join("")}</div>
    </aside>

    <section class="card workbench-panel">
      <div class="workbench-toolbar"><div><h2>Mesa · ${scenario.short}</h2><p class="helper">${selected ? `Origen seleccionado: <b>${selected.part.short} ${selected.terminal.label}</b>. Elige el borne de destino.` : scenario.description}</p></div><div class="toolbar-actions"><button id="validateWorkbench" class="btn primary">Verificar lazo</button><button id="undoWire" class="btn" ${state.workbench.connections.length?"":"disabled"}>Deshacer cable</button><button id="clearWorkbench" class="btn danger-outline">Vaciar mesa</button></div></div>
      <div class="workbench-scroll"><div id="workbenchCanvas" class="workbench-canvas" aria-label="Mesa de montaje con cuadrícula de 20 píxeles">
        <div class="din-work-rail" aria-hidden="true"></div>
        <svg id="workbenchWires" class="workbench-wires" width="900" height="600" viewBox="0 0 900 600" aria-label="Conductores instalados">${workbenchWireMarkup()}</svg>
        ${state.workbench.components.map(workbenchComponentMarkup).join("")}
        ${state.workbench.components.length ? "" : `<div class="canvas-empty"><b>Mesa vacía</b><span>Selecciona componentes del gabinete para comenzar el montaje.</span></div>`}
      </div></div>
      <button class="mobile-palette-fab" data-action="openPalette">＋ Añadir componente</button>
      ${workbenchOperationMarkup(validation)}
      ${state.workbench.feedback ? `<div class="feedback ${state.workbench.feedbackType}" style="margin-top:10px">${state.workbench.feedback}</div>` : ""}
    </section>

    <aside class="card builder-guide">
      <p class="eyebrow">Comprobación</p><h2>${scenario.label}</h2>
      <div class="builder-checks">${validation.checks.map(check => `<div class="builder-check ${check.ok?"done":""}"><span>${check.ok?"✓":""}</span><div><p>${check.label}</p>${!check.ok && check.hint ? `<small class="check-hint">${check.hint}</small>` : ""}</div></div>`).join("")}</div>
      <div class="builder-divider"></div>
      <p class="eyebrow">Conductores</p>
      <div class="wire-legend"><span><i class="wire-red"></i>+24 VDC</span><span><i class="wire-blue"></i>Común M</span><span><i class="wire-green"></i>Señal</span><span><i class="wire-orange"></i>Salida</span></div>
      <div class="terminal-legend"><span><i class="terminal-demo free"></i>Borne libre</span><span><i class="terminal-demo occupied">✓</i>Borne ocupado</span><span><i class="terminal-demo live">✓</i>Energizado</span></div>
      <div class="builder-divider"></div>
      <p class="eyebrow">Conexiones (${state.workbench.connections.length})</p>
      <div class="connection-list">${state.workbench.connections.length ? state.workbench.connections.map(connection => `<div><span>${workbenchConnectionLabel(connection)}</span><button data-remove-wire="${connection.id}" aria-label="Eliminar conexión">×</button></div>`).join("") : `<p class="helper">Aún no hay conductores instalados.</p>`}</div>
    </aside>
    ${state.paletteModalOpen ? `<div class="palette-modal"><button class="palette-modal-backdrop" data-action="closePalette" aria-label="Cerrar gabinete"></button><div class="palette-modal-inner"><div class="palette-modal-head"><div><p class="eyebrow">Componentes</p><h2>Gabinete</h2></div><button class="palette-modal-close" data-action="closePalette" aria-label="Cerrar">×</button></div><div class="palette-list">${Object.entries(workbenchParts).map(([type,part])=>`<button class="palette-part" data-palette-type="${type}" title="Añadir ${part.label}"><img src="${part.image}" alt=""><span><strong>${part.label}</strong><small>${part.terminals.map(t=>t.label).join(' · ')}</small></span><b>＋</b></button>`).join('')}</div></div></div>` : ''}
  </div>`;
}

function sidebar() {
  const sc = SCENARIOS[state.scenario];
  const compileCard = '';
  return `<aside class="sidebar"><section class="card side-card"><p class="eyebrow">Proceso activo</p><div class="scenario-btns">${Object.entries(SCENARIOS).map(([k,s])=>`<button class="btn ${state.scenario===k?'primary':''}" data-scenario="${k}">${s.label}</button>`).join('')}</div></section>
    <section class="card side-card"><p class="eyebrow">Variable de proceso</p><div class="row"><span>${sc.variable}</span><span class="metric"><span id="d-level-val">${state.level.toFixed(0)}</span><small> ${sc.unit}</small></span></div><input id="level" aria-label="Variable simulada" type="range" min="0" max="100" step="1" value="${state.level}"><button id="auto" class="btn full ${state.auto?"danger":""}" style="margin-top:10px">${state.auto?"Pausar proceso":"Simular proceso"}</button>${sc.hasValve?`<button id="valveSide" class="btn full" style="margin-top:8px">Válvula: ${state.drainOpen?"abierta":"cerrada"}</button>`:""}</section>
    ${compileCard}
    <section class="card side-card"><p class="eyebrow">Modo de control</p><div class="stack"><button class="btn ${state.mode==="config"?"primary":""}" data-mode="config">Relé configurable</button><button class="btn ${state.mode==="program"?"primary":""}" data-mode="program">PLC programable</button></div></section></aside>`;
}

function missionRail() {
  const items=[["wiring","CE 1.1.1 — Conectar componentes","Conecta fuente, sensor y actuador en el lazo de control."],["builder","CE 1.1.2 — Clasificar componentes","Identifica y monta cada elemento del lazo en la mesa de trabajo."],["relay","CE 1.1.4 — Configurar on/off","Ajusta P1 = 30% y P2 = 75% con histéresis adecuada."],["program","CE 2.1.3 — Implementar rutina","Compila el programa Ladder y activa la salida Q0.0."],["diagnose","CE 1.1.3 — Medir variables","Identifica la falla midiendo en los puntos del circuito."]];
  const done=items.filter(i=>state.missions[i[0]]).length;
  if (!state.missionOpen) {
    return `<aside class="mission-rail mission-rail-collapsed"><button class="mission-tab" data-action="toggleMission" title="Mostrar ruta de aprendizaje"><span class="mission-tab-label">Ruta de aprendizaje</span><span class="mission-tab-badge">${done}/${items.length}</span></button></aside>`;
  }
  return `<aside class="mission-rail"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><p class="eyebrow" style="margin:0">Ruta de aprendizaje</p><button class="mission-collapse-btn" data-action="toggleMission" title="Ocultar">‹</button></div><h2 style="margin:0 0 8px">Misiones</h2><div class="progress"><span style="width:${done/items.length*100}%"></span></div><p class="helper">${done} de ${items.length} completadas</p><div style="margin-top:10px">${items.map(i=>`<div class="mission ${state.missions[i[0]]?"done":""}"><span class="mission-check">✓</span><div><strong>${i[1]}</strong><p>${i[2]}</p></div></div>`).join("")}<button id="resetProgress" class="btn full" style="margin-top:12px">Reiniciar progreso</button></div></aside>`;
}

function handleRelayKey(key) {
  if (!effectivePower() || !state.wires.supply) { state.feedback = "El relé no responde: comprueba la alimentación de 24 VDC."; state.feedbackType = "bad"; return; }
  if (state.relayPage === "run") { if (key === "ok") state.relayPage = "low"; return; }
  if (key === "back") { state.relayPage = "run"; return; }
  if (key === "right" || key === "left") state.relayPage = state.relayPage === "low" ? "high" : "low";
  if (state.relayPage === "low") {
    if (key === "up") state.lowLevel = Math.min(state.highLevel - 5, state.lowLevel + 5);
    if (key === "down") state.lowLevel = Math.max(5, state.lowLevel - 5);
  } else {
    if (key === "up") state.highLevel = Math.min(95, state.highLevel + 5);
    if (key === "down") state.highLevel = Math.max(state.lowLevel + 5, state.highLevel - 5);
  }
  if (key === "ok") { state.relayPage = "run"; state.relaySaved = true; state.feedback = "Parámetros guardados en el relé."; state.feedbackType = "ok"; }
}

function snapWorkbench(value) {
  return Math.round(value / 20) * 20;
}

function addWorkbenchComponent(type, x, y) {
  const part = workbenchParts[type];
  if (!part) return;
  state.paletteModalOpen = false;
  const index = state.workbench.components.length;
  const defaultX = 40 + (index % 4) * 200;
  const defaultY = 70 + Math.floor(index / 4) * 190;
  state.workbench.components.push({
    id: `wb-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    type,
    x: snapWorkbench(Math.max(0, Math.min(900 - part.width, Number.isFinite(x) ? x : defaultX))),
    y: snapWorkbench(Math.max(0, Math.min(600 - part.height, Number.isFinite(y) ? y : defaultY)))
  });
  stopWorkbenchTest();
  state.workbench.feedback = `${part.label} añadido. Arrástralo para ubicarlo y selecciona sus bornes para conectar.`;
  state.workbench.feedbackType = "ok";
  saveWorkbench();
  render();
}

function removeWorkbenchComponent(id) {
  state.workbench.components = state.workbench.components.filter(component => component.id !== id);
  state.workbench.connections = state.workbench.connections.filter(connection => connection.from.componentId !== id && connection.to.componentId !== id);
  if (state.workbench.selectedTerminal?.componentId === id) state.workbench.selectedTerminal = null;
  stopWorkbenchTest();
  state.workbench.feedback = "Componente y sus conductores retirados.";
  state.workbench.feedbackType = "ok";
  saveWorkbench();
  render();
}

function workbenchTerminalOccupied(componentId, terminalKey) {
  return state.workbench.connections.some(connection =>
    (connection.from.componentId === componentId && connection.from.terminalKey === terminalKey) ||
    (connection.to.componentId === componentId && connection.to.terminalKey === terminalKey)
  );
}

function selectWorkbenchTerminal(componentId, terminalKey) {
  const selected = state.workbench.selectedTerminal;
  if (!selected) {
    if (workbenchTerminalOccupied(componentId, terminalKey)) {
      state.workbench.feedback = "Ese borne ya tiene un conductor. Retíralo antes de realizar una conexión diferente.";
      state.workbench.feedbackType = "bad";
      render();
      return;
    }
    state.workbench.selectedTerminal = { componentId, terminalKey };
    state.workbench.feedback = "Borne de origen seleccionado. Ahora elige el borne de destino.";
    state.workbench.feedbackType = "ok";
    render();
    return;
  }
  if (selected.componentId === componentId && selected.terminalKey === terminalKey) {
    state.workbench.selectedTerminal = null;
    state.workbench.feedback = "Selección cancelada.";
    state.workbench.feedbackType = "ok";
    render();
    return;
  }
  if (selected.componentId === componentId) {
    state.workbench.feedback = "Conecta bornes de equipos diferentes.";
    state.workbench.feedbackType = "bad";
    state.workbench.selectedTerminal = null;
    render();
    return;
  }
  if (workbenchTerminalOccupied(componentId, terminalKey)) {
    state.workbench.feedback = "El borne de destino ya está ocupado. Utiliza otra salida de la bornera o retira el conductor existente.";
    state.workbench.feedbackType = "bad";
    state.workbench.selectedTerminal = null;
    render();
    return;
  }
  const duplicate = state.workbench.connections.some(connection =>
    (connection.from.componentId === selected.componentId && connection.from.terminalKey === selected.terminalKey && connection.to.componentId === componentId && connection.to.terminalKey === terminalKey) ||
    (connection.to.componentId === selected.componentId && connection.to.terminalKey === selected.terminalKey && connection.from.componentId === componentId && connection.from.terminalKey === terminalKey)
  );
  if (duplicate) {
    state.workbench.feedback = "Ese conductor ya está instalado.";
    state.workbench.feedbackType = "bad";
  } else {
    state.workbench.connections.push({
      id: `wire-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      from: selected,
      to: { componentId, terminalKey }
    });
    stopWorkbenchTest();
    state.workbench.feedback = "Conductor instalado. Puedes continuar con el siguiente par de bornes.";
    state.workbench.feedbackType = "ok";
  }
  state.workbench.selectedTerminal = null;
  saveWorkbench();
  render();
}

function redrawWorkbenchWires() {
  const svg = document.getElementById("workbenchWires");
  if (svg) svg.innerHTML = workbenchWireMarkup();
}

function applyCanvasScale() {
  const scroll = document.querySelector('.workbench-scroll');
  const canvas = document.getElementById('workbenchCanvas');
  if (!scroll || !canvas) return;
  const avail = scroll.clientWidth;
  const scale = avail > 0 ? Math.min(1, avail / 900) : 1;
  canvas.dataset.scale = String(scale);
  if (scale < 1) {
    canvas.style.transform = `scale(${scale})`;
    canvas.style.transformOrigin = 'top left';
    scroll.style.height = Math.ceil(600 * scale) + 'px';
    scroll.style.overflow = 'hidden';
  } else {
    canvas.style.transform = '';
    canvas.dataset.scale = '1';
    scroll.style.height = '';
    scroll.style.overflow = '';
  }
}

function bindWorkbenchDrag() {
  const canvas = document.getElementById('workbenchCanvas');
  if (!canvas) return;

  canvas.ondragover = e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; canvas.classList.add('drag-over'); };
  canvas.ondragleave = e => { if (!canvas.contains(e.relatedTarget)) canvas.classList.remove('drag-over'); };
  canvas.ondrop = e => {
    e.preventDefault();
    canvas.classList.remove('drag-over');
    const type = e.dataTransfer.getData('text/plain');
    const part = workbenchParts[type];
    if (!part) return;
    const rect = canvas.getBoundingClientRect();
    const _s = parseFloat(canvas.dataset.scale || '1');
    addWorkbenchComponent(type, (e.clientX - rect.left) / _s - part.width / 2, (e.clientY - rect.top) / _s - part.height / 2);
  };

  let drag = null;
  canvas.onpointerdown = e => {
    if (e.button !== 0) return;
    const compEl = e.target.closest('.placed-component');
    if (!compEl || e.target.closest('.terminal, .component-remove')) return;
    const component = workbenchComponent(compEl.dataset.componentId);
    const part = component ? workbenchParts[component.type] : null;
    if (!component || !part) return;
    const rect = canvas.getBoundingClientRect();
    const _s = parseFloat(canvas.dataset.scale || '1');
    drag = { component, part, element: compEl, ox: (e.clientX - rect.left) / _s - component.x, oy: (e.clientY - rect.top) / _s - component.y };
    compEl.classList.add('moving');
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  canvas.onpointermove = e => {
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const _s = parseFloat(canvas.dataset.scale || '1');
    drag.component.x = snapWorkbench(Math.max(0, Math.min(900 - drag.part.width, (e.clientX - rect.left) / _s - drag.ox)));
    drag.component.y = snapWorkbench(Math.max(0, Math.min(600 - drag.part.height, (e.clientY - rect.top) / _s - drag.oy)));
    drag.element.style.left = `${drag.component.x}px`;
    drag.element.style.top = `${drag.component.y}px`;
    redrawWorkbenchWires();
  };
  canvas.onpointerup = e => {
    if (!drag) return;
    drag.element.classList.remove('moving');
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    saveWorkbench();
    drag = null;
  };
  canvas.onkeydown = e => {
    const compEl = e.target.closest('.placed-component');
    if (!compEl) return;
    const delta = { ArrowLeft: [-20,0], ArrowRight: [20,0], ArrowUp: [0,-20], ArrowDown: [0,20] }[e.key];
    if (!delta) return;
    e.preventDefault();
    const component = workbenchComponent(compEl.dataset.componentId);
    const part = component ? workbenchParts[component.type] : null;
    if (!component || !part) return;
    component.x = Math.max(0, Math.min(900 - part.width, component.x + delta[0]));
    component.y = Math.max(0, Math.min(600 - part.height, component.y + delta[1]));
    compEl.style.left = `${component.x}px`;
    compEl.style.top = `${component.y}px`;
    redrawWorkbenchWires();
    saveWorkbench();
  };

  const svg = document.getElementById('workbenchWires');
  if (svg) svg.addEventListener('click', e => {
    const g = e.target.closest('.wire-group');
    if (!g?.dataset.wireId) return;
    state.workbench.connections = state.workbench.connections.filter(c => c.id !== g.dataset.wireId);
    saveWorkbench(); render();
  });
}

let _toastTimer = null;
let _lastFeedback = "";
let _prevMissions = null;
const _missionLabels = { wiring: "CE 1.1.1 completado", relay: "CE 1.1.4 completado", program: "CE 2.1.3 completado", diagnose: "CE 1.1.3 completado", builder: "CE 1.1.2 completado" };
let _celebTimer = null;
function showCelebration(key) {
  const b = document.getElementById('celebrate');
  if (!b) return;
  b.innerHTML = `¡Misión completada!<small>${_missionLabels[key] || key}</small>`;
  b.className = 'celebrate show';
  clearTimeout(_celebTimer);
  _celebTimer = setTimeout(() => { b.className = 'celebrate'; }, 2200);
}
function showToast(msg, type) {
  if (!msg || msg === _lastFeedback) return;
  _lastFeedback = msg;
  const t = document.getElementById('toast');
  if (!t) return;
  clearTimeout(_toastTimer);
  t.textContent = msg;
  t.className = `toast show ${type || 'ok'}`;
  _toastTimer = setTimeout(() => { t.className = 'toast'; _lastFeedback = ""; }, 3000);
}

function render() {
  updateLogic(); missionCheck(); const v=views[state.view]; const builderMode=state.view==="builder";
  const content=state.view==="panel"?panelView():state.view==="config"?configView():state.view==="program"?programView():state.view==="diagnose"?diagnoseView():builderView();
  const sc = SCENARIOS[state.scenario];
  const viewTitle = state.view==='panel'?sc.label:v.title;
  const viewKicker = state.view==='panel'?sc.variable:v.kicker;
  document.getElementById("app").innerHTML=`<header class="topbar"><div class="brand"><div class="brand-mark">AL</div><div><strong>Autómata Lab</strong><span>Introducción a la Automatización y Robótica</span></div></div><nav class="nav" aria-label="Módulos">${Object.entries({panel:"Operación",builder:"Montar",program:"Programar",diagnose:"Diagnosticar"}).map(([k,l])=>`<button data-view="${k}" class="${state.view===k||( k==="panel"&&state.view==="config")?"active":""}">${l}</button>`).join("")}</nav><div class="global-status"><span id="d-status-pill" class="status-pill">24 VDC · <b>${statusText()}</b></span><button id="estop" class="estop ${state.estop?"on":""}">${state.estop?"REARMAR":"PARADA"}</button></div></header><div class="workspace ${builderMode?"builder-workspace":""}${!builderMode&&!state.missionOpen?" mission-collapsed":""}">${builderMode?"":sidebar()}<main class="content"><div class="page-head"><div><p class="eyebrow">${viewKicker}</p><h1>${viewTitle}</h1><p class="helper">${v.desc}</p></div><span class="mode-chip">${builderMode?"CE 1.1.1":state.mode==="config"?"U1 · CE 1.1.4":"U2 · CE 2.1.2"}</span></div>${content}</main>${builderMode?"":missionRail()}</div><nav class="bottom-nav"><button class="bn-item ${state.view==='panel'||state.view==='config'?'bn-active':''}" data-view="panel"><svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="M11 11 L7.5 7.5" stroke-width="2" stroke-linecap="round"/><circle cx="11" cy="11" r="1.5" fill="currentColor" stroke="none"/></svg><span>Operar</span></button><button class="bn-item ${state.view==='builder'?'bn-active':''}" data-view="builder"><svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="8" width="5" height="6" rx="1.5"/><rect x="15" y="8" width="5" height="6" rx="1.5"/><line x1="7" y1="11" x2="15" y2="11"/></svg><span>Montar</span></button><button class="bn-item ${state.view==='program'?'bn-active':''}" data-view="program"><svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="4" y1="3" x2="4" y2="19" stroke-linecap="round"/><line x1="18" y1="3" x2="18" y2="19" stroke-linecap="round"/><line x1="4" y1="8" x2="18" y2="8" stroke-linecap="round"/><line x1="4" y1="14" x2="18" y2="14" stroke-linecap="round"/></svg><span>Programar</span></button><button class="bn-item ${state.view==='diagnose'?'bn-active':''}" data-view="diagnose"><svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="20" y2="20" stroke-width="2" stroke-linecap="round"/></svg><span>Diagnóstico</span></button></nav>`;
  if (state.view === 'builder') { bindWorkbenchDrag(); applyCanvasScale(); }
  const fb = state.feedback || state.workbench.feedback;
  const fbType = state.feedback ? state.feedbackType : state.workbench.feedbackType;
  showToast(fb, fbType);
  positionMarks();
}


function patchDom() {
  updateLogic();
  missionCheck();
  const powerActive = effectivePower() && state.wires.supply;
  const sensorActive = powerActive && effectiveSensorWire();
  const controllerActive = sensorActive && !safetyOpen();
  const waterHeight = Math.max(2, Math.min(64, state.level * 0.64));
  const sensorVolts = sensorActive ? (state.level / 10).toFixed(1) : '0.0';
  const set = (id, fn) => { const el = document.getElementById(id); if (el) fn(el); };

  set('d-status-pill', el => el.innerHTML = `24 VDC · <b>${statusText()}</b>`);
  set('d-level-val', el => el.textContent = state.level.toFixed(0));
  set('level', el => { if (document.activeElement !== el) el.value = state.level; });
  set('auto', el => { el.className = `btn full ${state.auto ? 'danger' : ''}`; el.textContent = state.auto ? 'Pausar proceso' : 'Simular proceso'; });
  set('valveSide', el => el.textContent = `Válvula: ${state.drainOpen ? 'abierta' : 'cerrada'}`);

  set('d-flow-fill', el => el.className = `flow-line ${state.output ? 'flowing' : ''}`);
  set('d-flow-drain', el => el.className = `flow-line drain ${state.drainOpen ? 'flowing' : ''}`);
  ['d-air1','d-air2','d-air3'].forEach(id => set(id, el => el.className = `air-line${state.output?' flowing':''}`));
  set('d-belt1', el => el.className = `belt-line${state.output?' moving':''}`);
  set('d-belt2', el => el.className = `belt-line belt-return${state.output?' moving':''}`);
  set('d-cable-supply-hot', el => el.setAttribute('class', `cable cable-supply-hot${powerActive ? ' live' : ''}${!state.wires.supply ? ' broken' : ''}`));
  set('d-cable-supply-com', el => el.setAttribute('class', `cable cable-supply-com${powerActive ? ' live' : ''}${!state.wires.supply ? ' broken' : ''}`));
  set('d-cable-sensor', el => el.setAttribute('class', `cable cable-sensor${sensorActive ? ' live' : ''}${!state.wires.sensor ? ' broken' : ''}`));
  set('d-cable-output', el => el.setAttribute('class', `cable cable-output${state.output ? ' live' : ''}${!state.wires.output ? ' broken' : ''}`));
  set('d-alarm-line', el => el.setAttribute('class', `alarm-line${state.alarm ? ' live' : ''}`));
  set('d-cut-supply', el => el.classList.toggle('visible', !state.wires.supply));
  set('d-cut-sensor', el => el.classList.toggle('visible', !state.wires.sensor));
  set('d-cut-output', el => el.classList.toggle('visible', !state.wires.output));
  set('d-tank-fill', el => el.style.height = `${waterHeight}%`);
  set('d-level-scale', el => el.innerHTML = `<i style="bottom:${scaleMark(state.lowLevel)}%">P1 ${state.lowLevel}%</i><i style="bottom:${scaleMark(state.highLevel)}%">P2 ${state.highLevel}%</i>`);
  positionMarks();
  set('d-sensor-readout', el => { el.className = `sensor-readout ${sensorActive ? 'active' : 'fault'}`; el.textContent = `AI0 · ${sensorVolts} V · ${state.level.toFixed(0)}${SCENARIOS[state.scenario].unit}`; });
  set('d-relay-unit', el => el.className = `loop-component relay-unit ${controllerActive ? 'powered' : 'fault'}`);
  set('d-relay-lcd', el => el.innerHTML = relayScreen());
  set('d-alarm-unit', el => el.className = `loop-component alarm-unit ${state.alarm && !state.alarmAck ? 'ringing' : ''}`);
  set('d-pump-unit', el => el.className = `loop-component pump-unit ${state.output ? 'running' : ''}`);
  set('d-pump-tag', el => el.textContent = `Q0.0 ${SCENARIOS[state.scenario].io.q00} · ${state.output ? 'ON' : 'OFF'}`);
  set('d-valve-unit', el => el.className = `loop-component valve-unit ${state.drainOpen ? 'open' : 'closed'}`);
  set('d-valve-tag', el => el.textContent = `VÁLVULA · ${state.drainOpen ? 'ABIERTA' : 'CERRADA'}`);

  set('d-io-ps', el => el.className = `io ${powerActive ? 'on' : ''}`);
  set('d-io-low', el => { el.className = `io ${state.levelLow ? 'on' : ''}`; const s = el.querySelector('span'); if (s) s.textContent = state.levelLow ? 'Activo' : 'Inactivo'; });
  set('d-io-high', el => { el.className = `io ${state.levelHigh ? 'on' : ''}`; const s = el.querySelector('span'); if (s) s.textContent = state.levelHigh ? 'Activo' : 'Inactivo'; });
  set('d-io-pump', el => { el.className = `io ${state.output ? 'on' : ''}`; const s = el.querySelector('span'); if (s) s.textContent = state.output ? '24 V' : '0 V'; });
  if (state.chartOpen) set('d-chart-area', el => el.innerHTML = chartSvg());
  if (state.ladderOpen) set('d-ladder-area', el => el.innerHTML = ladderSvg());

  // Symbol table patch
  const symPatch = (tag, v, etVal) => {
    const id = 'sv-' + tag.replace('.','').replace('/','');
    set(id, el => { el.className = `sym-bit ${v?'sym-on':'sym-off'}`; el.textContent = v?'1':'0'; });
    if (etVal !== undefined) {
      const etEl = document.querySelector(`#${id} ~ .sym-et`);
      if (etEl) etEl.textContent = etVal.toFixed(1) + 's';
    }
  };
  symPatch('I0.0', state.inputs.start);
  symPatch('I0.1', state.inputs.stop);
  symPatch('I0.2', state.levelLow);
  symPatch('I0.3', state.levelHigh);
  symPatch('M0.0', state.latch);
  symPatch('T0.0', state.timerQ, state.timerET);
  symPatch('Q0.0', state.output);

  // S7-1200 SVG LEDs + pilot lights
  const plcRun2 = state.plcRunning && state.compiled;
  set('plc-led-run',  el => el.setAttribute('fill', plcRun2 ? '#22c55e' : '#374151'));
  set('plc-led-stop', el => el.setAttribute('fill', !plcRun2 && state.compiled ? '#f59e0b' : '#374151'));
  set('plc-led-err',  el => el.setAttribute('fill', state.alarm && plcRun2 ? '#ef4444' : '#374151'));
  [state.inputs.start, state.inputs.stop, state.levelLow, state.levelHigh].forEach((v,i) =>
    set(`plc-di-${i}`, el => el.setAttribute('fill', v && plcRun2 ? '#22c55e' : '#374151')));
  [state.output, false, state.alarm && plcRun2].forEach((v,i) =>
    set(`plc-dq-${i}`, el => el.setAttribute('fill', v ? '#22c55e' : '#374151')));
  set('plc-pilot-q00', el => el.classList.toggle('plc-on', state.output));
  set('plc-pilot-q01', el => el.classList.toggle('plc-on', false));
  set('plc-pilot-q02', el => el.classList.toggle('plc-on', state.alarm && plcRun2));

  // Monitor mode: highlight energized contacts in Ladder editor
  if (state.plcMonitor && plcRun2) {
    document.querySelectorAll('.ld-zone[data-dz-ri][data-dz-k]').forEach(el => {
      const ri = +el.dataset.dzRi; const k = el.dataset.dzK;
      const tag = state.ladderProgram[ri]?.[k];
      const on = tag ? (k === 'coil' ? evaluateRung(ri) : evaluateContact(tag)) : false;
      el.classList.toggle('ld-live-on', on);
      el.classList.toggle('ld-live-off', !!tag && !on);
    });
  } else {
    document.querySelectorAll('.ld-live-on,.ld-live-off').forEach(el => {
      el.classList.remove('ld-live-on', 'ld-live-off');
    });
  }
}

function setupEvents() {
  const toastEl = document.createElement('div');
  toastEl.id = 'toast'; toastEl.className = 'toast';
  document.body.appendChild(toastEl);

  document.addEventListener('change', e => {
    const pickEl = e.target.closest('.ld-tag-pick');
    if (pickEl && pickEl.value) {
      state.ladderProgram[+pickEl.dataset.pickRi][pickEl.dataset.pickK] = pickEl.value;
      state.ladderErrors = null; render(); return;
    }
    const nInp = e.target.closest('.ld-net-inp');
    if (nInp) { state.rungTitles[+nInp.dataset.netRi] = nInp.value; return; }
    const inp = e.target.closest('.sym-name-inp');
    if (!inp) return;
    const tag = inp.dataset.tag;
    const val = inp.value.trim().replace(/[^A-Za-z0-9_]/g,'').toUpperCase().slice(0,12);
    inp.value = val;
    if (val) state.tagNames[tag] = val; else delete state.tagNames[tag];
    render();
  });
  const celebEl = document.createElement('div');
  celebEl.id = 'celebrate'; celebEl.className = 'celebrate';
  document.body.appendChild(celebEl);
  const tipEl = document.createElement('div');
  tipEl.id = 'chart-tip'; tipEl.className = 'chart-tip';
  document.body.appendChild(tipEl);
  const chartFloat = document.createElement('div');
  chartFloat.id = 'chart-float'; chartFloat.className = 'chart-float';
  chartFloat.innerHTML = `<div class="chart-float-head"><div><h3>Tendencia del proceso</h3><p>Nivel del estanque e historial de Q0.0</p></div><button class="chart-float-close" data-action="chart" aria-label="Cerrar">×</button></div><div id="d-chart-area"></div>`;
  document.body.appendChild(chartFloat);
  const ladderFloat = document.createElement('div');
  ladderFloat.id = 'ladder-float'; ladderFloat.className = 'ladder-float';
  ladderFloat.innerHTML = `<div class="ladder-float-head"><div><h3>Diagrama Ladder</h3><p>Rutina SET/RESET · tiempo real</p></div><button class="ladder-float-close" data-action="ladder" aria-label="Cerrar">×</button></div><div id="d-ladder-area" class="ladder-area"></div>`;
  document.body.appendChild(ladderFloat);
  let _ldrag = null;
  ladderFloat.querySelector('.ladder-float-head').addEventListener('mousedown', e => {
    if (e.target.closest('[data-action]')) return;
    const r = ladderFloat.getBoundingClientRect();
    ladderFloat.style.transform = 'none';
    ladderFloat.style.left = r.left + 'px';
    ladderFloat.style.top = r.top + 'px';
    _ldrag = { ox: e.clientX - r.left, oy: e.clientY - r.top };
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => { if (_ldrag) { ladderFloat.style.left = (e.clientX - _ldrag.ox) + 'px'; ladderFloat.style.top = (e.clientY - _ldrag.oy) + 'px'; } });
  document.addEventListener('mouseup', () => { _ldrag = null; });
  document.addEventListener('mousemove', e => {
    const area = document.getElementById('d-chart-area');
    const tip = document.getElementById('chart-tip');
    if (!area || !tip) return;
    const svg = area.querySelector('svg.chart');
    if (!svg || state.trace.length < 2 || !area.contains(e.target)) { tip.className = 'chart-tip'; return; }
    const rect = svg.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(xPct * (state.trace.length - 1));
    const d = state.trace[idx];
    tip.innerHTML = `Nivel: <strong>${d.level.toFixed(0)}%</strong> · Q0.0: <strong>${d.out ? 'ON' : 'OFF'}</strong>`;
    tip.className = 'chart-tip show';
    tip.style.left = `${Math.min(e.clientX + 14, window.innerWidth - 160)}px`;
    tip.style.top = `${e.clientY - 42}px`;
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'level') { state.level = +e.target.value; tickTrace(); render(); }
    else if (e.target.id === 'workbenchVariable') { state.workbench.test.variable = Number(e.target.value); updateWorkbenchTest(); render(); }
  });

  document.addEventListener('dragstart', e => {
    const el = e.target.closest('[data-palette-type]');
    if (!el) return;
    el.dataset.dragged = 'true';
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', el.dataset.paletteType);
  });
  document.addEventListener('dragend', e => {
    const el = e.target.closest('[data-palette-type]');
    if (el) setTimeout(() => delete el.dataset.dragged, 0);
  });

  // ── Ladder Structure DnD ────────────────────────────────
  let _ldStruct = null;
  document.addEventListener('dragstart', e => {
    const el = e.target.closest('[data-drag-struct]');
    if (!el) return;
    _ldStruct = el.dataset.dragStruct;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'struct:' + _ldStruct);
    el.classList.add('ld-dragging');
  });
  document.addEventListener('dragend', e => {
    const el = e.target.closest('[data-drag-struct]');
    if (el) setTimeout(() => el.classList.remove('ld-dragging'), 0);
    _ldStruct = null;
  });
  document.addEventListener('dragover', e => {
    if (!_ldStruct) return;
    const z = e.target.closest('[data-struct-ri]');
    if (!z) return;
    e.preventDefault();
    document.querySelectorAll('[data-struct-ri].ld-drag-over').forEach(x => x.classList.remove('ld-drag-over'));
    z.classList.add('ld-drag-over');
  });
  document.addEventListener('dragleave', e => {
    const z = e.target.closest('[data-struct-ri]');
    if (z && !z.contains(e.relatedTarget)) z.classList.remove('ld-drag-over');
  });
  document.addEventListener('drop', e => {
    if (!_ldStruct) return;
    const z = e.target.closest('[data-struct-ri]');
    if (!z) return;
    e.preventDefault();
    z.classList.remove('ld-drag-over');
    const ri = +z.dataset.structRi;
    state.ladderStructure[ri] = _ldStruct;
    state.ladderProgram[ri] = {a: null, b: null, coil: null};
    state.ladderErrors = null;
    _ldStruct = null;
    render();
  });
  // ─────────────────────────────────────────────────────────

  // ── Ladder DnD ──────────────────────────────────────────
  let _ldTag = null, _ldSrc = null;
  const COIL_SET = new Set(['M0.0/S','M0.0/R','Q0.0']);
  document.addEventListener('dragstart', e => {
    const el = e.target.closest('[data-drag-tag]');
    if (!el) return;
    _ldTag = el.dataset.dragTag;
    _ldSrc = el.dataset.dzRi != null ? {ri:+el.dataset.dzRi, k:el.dataset.dzK} : null;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', _ldTag);
    el.classList.add('ld-dragging');
  });
  document.addEventListener('dragend', () => {
    document.querySelectorAll('.ld-dragging,.ld-drag-over').forEach(el => el.classList.remove('ld-dragging','ld-drag-over'));
    if (_ldSrc) { state.ladderProgram[_ldSrc.ri][_ldSrc.k] = null; state.ladderErrors = null; render(); }
    _ldTag = null; _ldSrc = null;
  });
  document.addEventListener('dragover', e => {
    if (!_ldTag) return;
    const z = e.target.closest('[data-dz-ri]');
    if (!z) return;
    if (z.classList.contains('ld-zone-coil') !== COIL_SET.has(_ldTag)) return;
    e.preventDefault();
    document.querySelectorAll('.ld-drag-over').forEach(el => el.classList.remove('ld-drag-over'));
    z.classList.add('ld-drag-over');
  });
  document.addEventListener('dragleave', e => {
    const z = e.target.closest('[data-dz-ri]');
    if (z && !z.contains(e.relatedTarget)) z.classList.remove('ld-drag-over');
  });
  document.addEventListener('drop', e => {
    const z = e.target.closest('[data-dz-ri]');
    if (!z || !_ldTag) return;
    if (z.classList.contains('ld-zone-coil') !== COIL_SET.has(_ldTag)) return;
    e.preventDefault();
    z.classList.remove('ld-drag-over');
    if (_ldSrc) { state.ladderProgram[_ldSrc.ri][_ldSrc.k] = null; }
    state.ladderProgram[+z.dataset.dzRi][z.dataset.dzK] = (_ldTag === '__NA__' || _ldTag === '__NC__') ? null : _ldTag;
    state.ladderErrors = null; _ldTag = null; _ldSrc = null;
    render();
  });
  document.addEventListener('dblclick', e => {
    const z = e.target.closest('[data-dz-ri][data-drag-tag]');
    if (!z) return;
    state.ladderProgram[+z.dataset.dzRi][z.dataset.dzK] = null;
    state.ladderErrors = null; render();
  });
  // ────────────────────────────────────────────────────────

  // ── Touch/Pointer DnD ────────────────────────────────────
  let _ptTag = null, _ptSrc = null, _ghost = null;
  const COIL_SET2 = new Set(['M0.0/S','M0.0/R','Q0.0']);

  function _createGhost(el) {
    const g = el.cloneNode(true);
    g.className = 'ld-drag-ghost';
    g.style.width = el.offsetWidth + 'px';
    document.body.appendChild(g);
    return g;
  }
  function _moveGhost(x, y) {
    if (!_ghost) return;
    _ghost.style.left = (x - _ghost.offsetWidth / 2) + 'px';
    _ghost.style.top  = (y - _ghost.offsetHeight / 2) + 'px';
  }
  function _dropZoneAt(x, y) {
    if (_ghost) _ghost.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (_ghost) _ghost.style.display = '';
    if (!el) return null;
    return el.closest('[data-dz-ri]') || el.closest('[data-struct-ri]');
  }
  function _cleanTouch() {
    if (_ghost) { _ghost.remove(); _ghost = null; }
    document.querySelectorAll('.ld-drag-over').forEach(el => el.classList.remove('ld-drag-over'));
    _ptTag = null; _ptSrc = null;
  }

  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    const elTag = e.target.closest('[data-drag-tag]');
    const elStruct = e.target.closest('[data-drag-struct]');
    if (!elTag && !elStruct) return;
    e.preventDefault();
    if (elTag) {
      _ptTag = elTag.dataset.dragTag;
      _ptSrc = elTag.dataset.dzRi != null ? {ri:+elTag.dataset.dzRi, k:elTag.dataset.dzK} : null;
    } else {
      _ptTag = 'struct:' + elStruct.dataset.dragStruct;
    }
    _ghost = _createGhost(elTag || elStruct);
    _moveGhost(e.clientX, e.clientY);
  }, {passive: false});

  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' || !_ptTag) return;
    e.preventDefault();
    _moveGhost(e.clientX, e.clientY);
    const z = _dropZoneAt(e.clientX, e.clientY);
    document.querySelectorAll('.ld-drag-over').forEach(el => el.classList.remove('ld-drag-over'));
    if (z) z.classList.add('ld-drag-over');
  }, {passive: false});

  document.addEventListener('pointerup', e => {
    if (e.pointerType === 'mouse' || !_ptTag) return;
    const z = _dropZoneAt(e.clientX, e.clientY);
    if (z) {
      if (_ptTag.startsWith('struct:')) {
        const struct = _ptTag.slice(7);
        const ri = +z.dataset.structRi;
        if (ri >= 0 && ri <= 2) {
          state.ladderStructure[ri] = struct;
          state.ladderProgram[ri] = {a:null, b:null, coil:null};
          state.ladderErrors = null;
        }
      } else {
        if (z.dataset.dzRi != null) {
          const isCoil = z.classList.contains('ld-zone-coil');
          if (isCoil === COIL_SET2.has(_ptTag)) {
            if (_ptSrc) state.ladderProgram[_ptSrc.ri][_ptSrc.k] = null;
            state.ladderProgram[+z.dataset.dzRi][z.dataset.dzK] = (_ptTag === '__NA__' || _ptTag === '__NC__') ? null : _ptTag;
            state.ladderErrors = null;
          }
        }
      }
    } else if (_ptSrc) {
      state.ladderProgram[_ptSrc.ri][_ptSrc.k] = null;
      state.ladderErrors = null;
    }
    _cleanTouch();
    render();
  });

  document.addEventListener('pointercancel', () => { _cleanTouch(); });
  // ────────────────────────────────────────────────────────

  document.addEventListener('click', e => {
    const viewEl = e.target.closest('[data-view]');
    if (viewEl) { setView(viewEl.dataset.view); return; }

    const modeEl = e.target.closest('[data-mode]');
    if (modeEl) {
      const m = modeEl.dataset.mode;
      state.mode = m;
      if (m === 'program') { state.view = 'program'; }
      else if (state.view === 'config' || state.view === 'program') { state.view = 'panel'; }
      render(); return;
    }

    const moveRungEl = e.target.closest('[data-rung-up],[data-rung-dn]');
    if (moveRungEl) {
      const isUp = 'rungUp' in moveRungEl.dataset;
      const ri = +(isUp ? moveRungEl.dataset.rungUp : moveRungEl.dataset.rungDn);
      const j = isUp ? ri - 1 : ri + 1;
      [state.ladderProgram[ri], state.ladderProgram[j]] = [state.ladderProgram[j], state.ladderProgram[ri]];
      [state.ladderStructure[ri], state.ladderStructure[j]] = [state.ladderStructure[j], state.ladderStructure[ri]];
      [state.rungTitles[ri], state.rungTitles[j]] = [state.rungTitles[j], state.rungTitles[ri]];
      state.ladderErrors = null; state.compiled = false; state.plcRunning = false;
      render(); return;
    }

    const removeRungEl = e.target.closest('[data-remove-rung]');
    if (removeRungEl) {
      const ri = +removeRungEl.dataset.removeRung;
      state.ladderProgram.splice(ri, 1);
      state.ladderStructure.splice(ri, 1);
      state.rungTitles.splice(ri, 1);
      state.ladderErrors = null;
      state.compiled = false;
      state.plcRunning = false;
      render(); return;
    }

    const xrefEl = e.target.closest('[data-xref-tag]');
    if (xrefEl) {
      const tag = xrefEl.dataset.xrefTag;
      state.xrefTag = state.xrefTag === tag ? null : tag;
      render(); return;
    }

    const forceEl = e.target.closest('[data-force-tag]');
    if (forceEl) {
      const tag = forceEl.dataset.forceTag;
      const val = forceEl.dataset.forceVal;
      if (val === 'release') delete state.forced[tag];
      else state.forced[tag] = val === '1';
      render(); return;
    }

    const clearStructEl = e.target.closest('[data-clear-struct]');
    if (clearStructEl) {
      const ri = +clearStructEl.dataset.clearStruct;
      state.ladderStructure[ri] = null;
      state.ladderProgram[ri] = {a: null, b: null, coil: null};
      state.ladderErrors = null;
      render(); return;
    }

    const addElBtn = e.target.closest('[data-add-el]');
    if (addElBtn) {
      const ri = +addElBtn.dataset.tbRi;
      const el = addElBtn.dataset.addEl;
      const s = state.ladderStructure[ri];
      const prog = state.ladderProgram[ri] || {a:null, b:null, coil:null};
      if (el === '__NA__' || el === '__NC__') {
        if (!s) {
          state.ladderStructure[ri] = 'series1';
          state.ladderProgram[ri] = {a: null, b: null, coil: prog.coil};
        } else if (s === 'series1') {
          state.ladderStructure[ri] = 'series2';
          state.ladderProgram[ri] = {...prog, b: null};
        }
      } else if (el === '__BRANCH__') {
        if (s === 'series1') {
          state.ladderStructure[ri] = 'parallel';
          state.ladderProgram[ri] = {...prog, b: null};
        }
      } else if (el === '__CLEAR__') {
        state.ladderStructure[ri] = null;
        state.ladderProgram[ri] = {a: null, b: null, coil: null};
      } else {
        if (!s) state.ladderStructure[ri] = 'series1';
        if (!state.ladderProgram[ri]) state.ladderProgram[ri] = {a:null, b:null, coil:null};
        const cur = state.ladderProgram[ri].coil;
        state.ladderProgram[ri] = {...state.ladderProgram[ri], coil: cur === el ? null : el};
      }
      state.ladderErrors = null;
      render(); return;
    }

    const wireEl = e.target.closest('[data-wire]');
    if (wireEl) { state.wires[wireEl.dataset.wire] = !state.wires[wireEl.dataset.wire]; render(); return; }

    const wireHitEl = e.target.closest('[data-toggle-wire]');
    if (wireHitEl) {
      const key = wireHitEl.dataset.toggleWire;
      state.wires[key] = !state.wires[key];
      const names = { supply: 'alimentación 24 VDC', sensor: 'sensor AI0', output: 'salida Q0.0' };
      state.feedback = state.wires[key] ? `Cable ${names[key]} conectado.` : `Cable ${names[key]} desconectado — lazo abierto.`;
      state.feedbackType = state.wires[key] ? 'ok' : 'warn';
      render();
      return;
    }

    const relayKeyEl = e.target.closest('[data-relay-key]');
    if (relayKeyEl) {
      relayKeyEl.classList.add('pressed');
      if (navigator.vibrate) navigator.vibrate(25);
      handleRelayKey(relayKeyEl.dataset.relayKey);
      setTimeout(() => render(), 120);
      return;
    }

    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      const a = actionEl.dataset.action;
      if (a === 'start') { state.systemEnabled = true; state.auto = true; state.inputs.start = true; state.inputs.stop = false; setTimeout(() => { state.inputs.start = false; render(); }, 220); }
      else if (a === 'stop') { state.systemEnabled = false; state.inputs.stop = true; state.inputs.start = false; state.manualPump = false; }
      else if (a === 'valve') state.drainOpen = !state.drainOpen;
      else if (a === 'pump') { state.manualPump = !state.manualPump; state.systemEnabled = true; }
      else if (a === 'toggleMission') { state.missionOpen = !state.missionOpen; render(); return; }
      else if (a === 'alarm') state.alarmAck = true;
      else if (a === 'hint') {
        const hints = buildHints(state.scenario);
        state.hintIdx = Math.min(state.hintIdx + 1, hints.length - 1);
        state.hintMsg = hints[state.hintIdx];
        render(); return;
      }
      else if (a === 'ladder') {
        state.ladderOpen = !state.ladderOpen;
        const lf = document.getElementById('ladder-float');
        if (lf) {
          if (state.ladderOpen) { lf.style.left = ''; lf.style.top = ''; lf.style.transform = ''; }
          lf.classList.toggle('open', state.ladderOpen);
        }
        if (state.ladderOpen) { const area = document.getElementById('d-ladder-area'); if (area) area.innerHTML = ladderSvg(); }
        return;
      }
      else if (a === 'chart') {
        state.chartOpen = !state.chartOpen;
        const cf = document.getElementById('chart-float');
        if (cf) cf.classList.toggle('open', state.chartOpen);
        if (state.chartOpen) { const area = document.getElementById('d-chart-area'); if (area) area.innerHTML = chartSvg(); }
        return;
      }
      else if (a === 'openPalette') { state.paletteModalOpen = true; render(); return; }
      else if (a === 'closePalette') { state.paletteModalOpen = false; render(); return; }
      else if (a === 'toggleDiagram') { state.workbenchDiagramOpen = !state.workbenchDiagramOpen; render(); return; }
      else if (a === 'plcRun')    { if (state.compiled && !state.plcRunning) { state.plcRunning = true; state.systemEnabled = true; state.feedback = 'PLC en modo RUN — pulsa ▶ START para arrancar.'; state.feedbackType = 'ok'; render(); } return; }
      else if (a === 'plcStop')   { state.plcRunning = false; state.latch = false; state.inputs = { start: false, stop: false }; state.feedback = 'PLC en modo STOP — salidas congeladas a 0.'; state.feedbackType = 'warn'; render(); return; }
      else if (a === 'plcMonitor'){ state.plcMonitor = !state.plcMonitor; render(); return; }
      else if (a === 'plcStart')  { if (!state.plcRunning) return; state.inputs.start = true; state.inputs.stop = false; render(); setTimeout(() => { state.inputs.start = false; render(); }, 250); return; }
      else if (a === 'plcStopBtn'){ if (!state.plcRunning) return; state.inputs.stop = true; state.inputs.start = false; render(); setTimeout(() => { state.inputs.stop = false; render(); }, 300); return; }
      else if (a === 'plcVtToggle'){ state.plcVtOpen = !state.plcVtOpen; render(); return; }
      else if (a === 'plcFtToggle') { state.plcFtOpen = !state.plcFtOpen; render(); return; }
      else if (a === 'plcXrefToggle') { state.xrefTag = state.xrefTag ? null : state.xrefTag; render(); return; }
      else if (a === 'plcScanToggle'){
        state.plcScanMode = !state.plcScanMode;
        if (state.plcScanMode) { state.plcRunning = false; state.plcMonitor = true; state.scanCount = 0; state.feedback = 'Modo paso a paso activo — pulsa ⏭ Un ciclo para ejecutar cada scan.'; state.feedbackType = 'ok'; }
        else { state.plcMonitor = false; state.feedback = 'Modo paso a paso desactivado.'; state.feedbackType = 'ok'; }
        render(); return;
      }
      else if (a === 'plcStep'){
        if (!state.plcScanMode || !state.compiled) return;
        updateLogic();
        const sc_s = SCENARIOS[state.scenario];
        const tonRi2 = state.ladderProgram.findIndex((r,i) => r?.coil === 'T0.0/TON' && !!state.ladderStructure[i]);
        if (tonRi2 >= 0) {
          const tonEnable2 = evaluateRung(tonRi2);
          if (tonEnable2) { const pt2 = sc_s.timerPT || state.timerPT; state.timerET = Math.min(state.timerET + 0.7, pt2); state.timerQ = state.timerET >= pt2; }
          else { state.timerET = 0; state.timerQ = false; }
          updateLogic();
        }
        state.scanCount++;
        state.feedback = `Scan #${state.scanCount} — M0.0=${state.latch?1:0} · Q0.0=${state.pumpCommand?1:0} · T0.0Q=${state.timerQ?1:0}`;
        state.feedbackType = 'ok';
        render(); return;
      }
      else if (a === 'addRung')   { state.ladderProgram.push({a:null,b:null,coil:null}); state.ladderStructure.push(null); state.rungTitles.push(''); state.ladderErrors = null; render(); return; }
      if (a !== 'start') render();
      return;
    }

    const inputEl = e.target.closest('[data-input]');
    if (inputEl) {
      state.inputs[inputEl.dataset.input] = !state.inputs[inputEl.dataset.input];
      if (inputEl.dataset.input === 'start' && state.inputs.start) { state.inputs.stop = false; state.systemEnabled = true; }
      if (inputEl.dataset.input === 'stop' && state.inputs.stop) { state.inputs.start = false; state.latch = false; }
      render(); return;
    }

    const pointEl = e.target.closest('[data-point]');
    if (pointEl) {
      if (!state.diagActive) { state.feedback = 'Primero inicia un diagnóstico.'; state.feedbackType = 'bad'; render(); return; }
      const _sc = SCENARIOS[state.scenario];
      const names = { p1:'Fuente', p2:`Sensor ${_sc.io.i02}`, p3:'Entrada AI0', p4:'Salida Q0.0', p5:_sc.io.q00 };
      const value = voltageAt(pointEl.dataset.point);
      state.readings.push({ name: names[pointEl.dataset.point], value, time: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
      render(); return;
    }

    const scSwitchEl = e.target.closest('[data-scenario]');
    if (scSwitchEl) {
      const key = scSwitchEl.dataset.scenario;
      if (key === state.scenario) return;
      // Save current ladder state
      state.ladderSave[state.scenario] = {
        program: JSON.parse(JSON.stringify(state.ladderProgram)),
        structure: [...state.ladderStructure],
        rungTitles: [...state.rungTitles],
        hintIdx: state.hintIdx, hintMsg: state.hintMsg, compiled: state.compiled,
      };
      const sc = SCENARIOS[key];
      const rungs = sc.rungs || 3;
      state.scenario = key;
      state.level = sc.defaultVar;
      state.lowLevel = sc.defaultLow;
      state.highLevel = sc.defaultHigh;
      state.relaySaved = false;
      state.latch = false;
      state.systemEnabled = false;
      state.fillDemand = false;
      state.drainOpen = false;
      state.timerET = 0; state.timerQ = false;
      state.timerPT = sc.timerPT || 5;
      state.trace = Array.from({length:44},()=>({level:0,out:0}));
      // Restore ladder if saved, otherwise clear
      const saved = state.ladderSave[key];
      if (saved) {
        state.ladderProgram = saved.program;
        state.ladderStructure = saved.structure;
        state.rungTitles = saved.rungTitles || Array.from({length: saved.program.length}, () => '');
        state.hintIdx = saved.hintIdx; state.hintMsg = saved.hintMsg;
        state.compiled = saved.compiled;
        state.ladderErrors = null;
        state.feedback = `Proceso: ${sc.label} · Programa restaurado.`;
      } else {
        state.ladderProgram = Array.from({length:rungs}, () => ({a:null,b:null,coil:null}));
        state.ladderStructure = Array.from({length:rungs}, () => null);
        state.rungTitles = Array.from({length:rungs}, () => '');
        state.ladderErrors = null;
        state.compiled = false;
        state.hintIdx = -1; state.hintMsg = '';
        state.feedback = `Proceso: ${sc.label} · Configura el relé y compila el programa.`;
      }
      state.feedbackType = 'ok';
      render(); return;
    }

    const scenarioEl = e.target.closest('[data-workbench-scenario]');
    if (scenarioEl) {
      state.workbench.scenario = scenarioEl.dataset.workbenchScenario;
      state.workbench.test = defaultWorkbenchTest(state.workbench.scenario);
      state.workbench.selectedTerminal = null;
      state.workbench.feedback = `Desafío seleccionado: ${workbenchScenarios[state.workbench.scenario].label}. Revisa la nueva lista de comprobación.`;
      state.workbench.feedbackType = 'ok';
      saveWorkbench(); render(); return;
    }

    const paletteEl = e.target.closest('[data-palette-type]');
    if (paletteEl && paletteEl.dataset.dragged !== 'true') { addWorkbenchComponent(paletteEl.dataset.paletteType); return; }

    const terminalEl = e.target.closest('[data-terminal]');
    if (terminalEl) { selectWorkbenchTerminal(terminalEl.dataset.component, terminalEl.dataset.terminal); return; }

    const removeCompEl = e.target.closest('[data-remove-component]');
    if (removeCompEl) { removeWorkbenchComponent(removeCompEl.dataset.removeComponent); return; }

    const removeWireEl = e.target.closest('[data-remove-wire]');
    if (removeWireEl) {
      state.workbench.connections = state.workbench.connections.filter(c => c.id !== removeWireEl.dataset.removeWire);
      stopWorkbenchTest();
      state.workbench.feedback = 'Conductor retirado.'; state.workbench.feedbackType = 'ok';
      saveWorkbench(); render(); return;
    }

    const btn = e.target.closest('button[id]');
    if (!btn) return;
    switch (btn.id) {
      case 'auto': state.auto = !state.auto; render(); break;
      case 'valveSide': state.drainOpen = !state.drainOpen; render(); break;
      case 'estop': state.estop = !state.estop; state.latch = false; state.manualPump = false; render(); break;
      case 'compile': {
        const sc2 = SCENARIOS[state.scenario];
        const rungs2 = state.ladderProgram.length;
        const lp = state.ladderProgram;
        const ls = state.ladderStructure;
        const errs = {}; let ok = true;
        for (let ri = 0; ri < rungs2; ri++) {
          const struct = ls[ri];
          if (!struct) { errs[`${ri}.struct`] = false; ok = false; continue; }
          errs[`${ri}.struct`] = true;
          const needB = struct === 'series2' || struct === 'parallel';
          ['a', ...(needB ? ['b'] : []), 'coil'].forEach(k => {
            const filled = !!(lp[ri] && lp[ri][k]);
            errs[`${ri}.${k}`] = filled;
            if (!filled) ok = false;
          });
        }
        state.ladderErrors = errs;
        if (ok) { state.compiled = true; state.plcRunning = false; state.feedback = 'Programa compilado ✓ — haz clic en ▶ Arrancar para iniciar el PLC.'; state.feedbackType = 'ok'; }
        else { state.compiled = false; state.plcRunning = false; state.systemEnabled = false; state.feedback = 'Programa incompleto — asigna estructura y contactos a todos los peldaños.'; state.feedbackType = 'warn'; }
        render(); break;
      }
      case 'resetPlc': { const _rsc = SCENARIOS[state.scenario]; const _rn = _rsc.rungs || 3; state.compiled = false; state.plcRunning = false; state.plcMonitor = false; state.latch = false; state.systemEnabled = false; state.ladderProgram = Array.from({length:_rn},()=>({a:null,b:null,coil:null})); state.ladderStructure = Array.from({length:_rn},()=>null); state.rungTitles = Array.from({length:_rn},()=>''); state.forced = {}; state.xrefTag = null; state.plcScanMode = false; state.scanCount = 0; state.ladderErrors = null; state.activeSlot = null; state.inputs = { start: false, stop: false }; state.hintIdx = -1; state.hintMsg = ''; state.timerET = 0; state.timerQ = false; delete state.ladderSave[state.scenario]; state.feedback = 'PLC reiniciado — programa borrado.'; state.feedbackType = 'ok'; render(); break; }
      case 'newFault': {
        const sf = currentFaults();
        const keys = Object.keys(sf);
        state.fault = keys[Math.floor(Math.random() * keys.length)];
        state.diagActive = true; state.diagSolved = false; state.readings = [];
        state.feedback = 'Falla generada. Comienza midiendo la fuente.'; state.feedbackType = 'ok';
        const _dsc = SCENARIOS[state.scenario];
        state.level = _dsc.controlMode === 'cool' ? 85 : _dsc.controlMode === 'detect' ? 0 : 20;
        state.systemEnabled = true; state.mode = 'config';
        render(); break;
      }
      case 'checkDiagnosis': {
        const sf = currentFaults();
        const choice = document.getElementById('diagnosis')?.value;
        if (!choice) { state.feedback = 'Selecciona una conclusión.'; state.feedbackType = 'bad'; }
        else if (choice === state.fault) { state.feedback = `Diagnóstico correcto: ${sf[state.fault].label}.`; state.feedbackType = 'ok'; state.diagSolved = true; }
        else { state.feedback = `Aún no coincide. Pista: ${sf[state.fault].hint}`; state.feedbackType = 'bad'; }
        render(); break;
      }
      case 'resetProgress': state.missions = {}; state.diagSolved = false; saveProgress(); render(); break;
      case 'validateWorkbench': {
        const result = workbenchValidation();
        if (result.complete) {
          state.workbench.feedback = `¡${result.scenario.label} completado! Las borneras distribuyen L+ y M, la entrada recibe la realimentación y Q1 gobierna ${result.scenario.actuatorLabel} con retorno común de 0 V.`;
          state.workbench.feedbackType = 'ok';
          if (!state.workbench.completed.includes(state.workbench.scenario)) state.workbench.completed.push(state.workbench.scenario);
          state.missions.builder = true;
          saveWorkbench(); saveProgress();
        } else {
          const missing = result.checks.filter(c => !c.ok).length;
          state.workbench.feedback = `El lazo aún está abierto: revisa los ${missing} puntos pendientes de la lista de comprobación.`;
          state.workbench.feedbackType = 'bad';
        }
        render(); break;
      }
      case 'runWorkbench': {
        const result = workbenchValidation();
        if (!result.complete) {
          stopWorkbenchTest();
          state.workbench.feedback = 'No se puede energizar la prueba: completa y verifica primero todos los puntos del circuito.';
          state.workbench.feedbackType = 'bad';
        } else {
          state.workbench.test.running = !state.workbench.test.running;
          if (!state.workbench.test.running) state.workbench.test.output = false;
          state.workbench.feedback = state.workbench.test.running ? 'Prueba energizada. Modifica la variable del proceso y observa la entrada, Q1 y el actuador.' : 'Prueba detenida. El circuito quedó desenergizado.';
          state.workbench.feedbackType = 'ok';
        }
        render(); break;
      }
      case 'workbenchObject': state.workbench.test.variable = state.workbench.test.variable ? 0 : 1; updateWorkbenchTest(); render(); break;
      case 'undoWire':
        state.workbench.connections.pop();
        stopWorkbenchTest(); state.workbench.selectedTerminal = null;
        state.workbench.feedback = 'Se retiró el último conductor.'; state.workbench.feedbackType = 'ok';
        saveWorkbench(); render(); break;
      case 'clearWorkbench':
        if (!state.workbench.components.length || confirm('¿Vaciar la mesa y eliminar todos los conductores?')) {
          state.workbench = { components: [], connections: [], scenario: state.workbench.scenario, completed: state.workbench.completed, selectedTerminal: null, feedback: 'Mesa despejada.', feedbackType: 'ok', test: defaultWorkbenchTest(state.workbench.scenario) };
          saveWorkbench(); render();
        }
        break;
    }
  });
}

function tickTrace() {
  updateLogic(); state.trace.push({level:state.level,out:state.output?1:0}); if(state.trace.length>44)state.trace.shift();
}

setInterval(()=>{
  if(!state.auto)return;
  if(state.plcScanMode)return;
  updateLogic();
  const sc_t = SCENARIOS[state.scenario];
  const tonRi = state.ladderProgram.findIndex((r,i) => r?.coil === 'T0.0/TON' && !!state.ladderStructure[i]);
  if (tonRi >= 0 && state.compiled && state.plcRunning && state.mode === 'program') {
    const tonEnable = evaluateRung(tonRi);
    if (tonEnable) {
      const pt = sc_t.timerPT || state.timerPT;
      state.timerET = Math.min(state.timerET + 0.7, pt);
      state.timerQ = state.timerET >= pt;
    } else {
      state.timerET = 0;
      state.timerQ = false;
    }
    updateLogic();
  }
  const delta=sc_t.delta(state.output, state.drainOpen);
  if(delta!==0) state.level=Math.max(0,Math.min(100,state.level+delta));
  tickTrace(); patchDom();
},700);

setupEvents();
window.addEventListener('resize', () => { if (state.view === 'builder') applyCanvasScale(); });
render();
