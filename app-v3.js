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
  ladderNets: [],
  cpuNets: null,
  ldDirty: false,
  ldSel: null,
  verifyResult: null,
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
      for (const net of state.cpuNets || []) {
        const on = evaluateNet(net);
        for (const o of net.coils) {
          const coil = coilKey(o);
          if      (coil === 'M0.0/S') { if (on) state.latch = true; }
          else if (coil === 'M0.0/R') { if (on) state.latch = false; }
          else if (coil === 'M0.0')   { state.latch = on; }
          else if (coil === 'Q0.0')   { state.pumpCommand = on; }
        }
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

// ── Editor LAD estilo TIA Portal ─────────────────────────────────
// Red      = { id, title, comment, logic: Serie, coils: [Bobina] }
// Serie    = { t:'S', id, items: [Contacto | Paralelo] }
// Paralelo = { t:'P', id, branches: [Serie] }
// Contacto = { t:'C', id, tag, nc }
// Bobina   = { t:'O', id, kind: '=' | 'S' | 'R' | 'TON', tag }
let _lxId = 0;
const lxId = p => `${p}${++_lxId}`;
const lxSer  = (items = []) => ({ t:'S', id:lxId('s'), items });
const lxPar  = branches => ({ t:'P', id:lxId('p'), branches });
const lxCtc  = (tag = null, nc = false) => ({ t:'C', id:lxId('c'), tag, nc });
const lxCoil = (kind = '=', tag = null) => ({ t:'O', id:lxId('o'), kind, tag });
const lxNet  = () => ({ id:lxId('n'), title:'', comment:'', logic:lxSer(), coils:[] });
const lxNets = n => Array.from({ length:n }, lxNet);
const lxClone = v => JSON.parse(JSON.stringify(v));

const ctcKey  = c => c?.tag ? c.tag + (c.nc ? '/NC' : '') : null;
const coilKey = o => !o?.tag ? null : o.kind === '=' ? o.tag : `${o.tag}/${o.kind}`;
const LX_COIL_KINDS = { '=': 'Asignación', S: 'Activar (SET)', R: 'Desactivar (RESET)', TON: 'Temporizador TON' };

function lxFromLegacy(r) {
  const c = t => t ? lxCtc(t.replace('/NC', ''), t.endsWith('/NC')) : lxCtc();
  const items = r.struct === 'parallel' ? [lxPar([lxSer([c(r.a)]), lxSer([c(r.b)])])]
              : r.struct === 'series2'  ? [c(r.a), c(r.b)] : [c(r.a)];
  const m = (r.coil || '').match(/^([^/]*)(?:\/(S|R|TON))?$/);
  const net = lxNet();
  net.logic = lxSer(items);
  net.coils = r.coil ? [lxCoil(m[2] || '=', m[1])] : [];
  return net;
}
const _lxTargets = {};
function lxTargetNets(scenario) {
  return _lxTargets[scenario] || (_lxTargets[scenario] = SCENARIOS[scenario].ladder.map(lxFromLegacy));
}

function lxWalk(node, fn) {
  fn(node);
  if (node.t === 'S') node.items.forEach(x => lxWalk(x, fn));
  else if (node.t === 'P') node.branches.forEach(b => lxWalk(b, fn));
}
// Busca un nodo por id; devuelve { node, parent, index, list } o null.
function lxFind(net, id) {
  const ci = net.coils.findIndex(o => o.id === id);
  if (ci >= 0) return { node:net.coils[ci], parent:null, index:ci, list:net.coils };
  if (net.logic.id === id) return { node:net.logic, parent:null, index:-1, list:null };
  let hit = null;
  lxWalk(net.logic, n => {
    if (hit) return;
    const list = n.t === 'S' ? n.items : n.t === 'P' ? n.branches : null;
    if (!list) return;
    const i = list.findIndex(x => x.id === id);
    if (i >= 0) hit = { node:list[i], parent:n, index:i, list };
  });
  return hit;
}
function lxParentOf(net, id) { const f = lxFind(net, id); return f ? f.parent : null; }
// Paralelo más cercano que contiene al nodo id (o null).
function lxParAncestor(net, id) {
  let cur = id;
  while (cur) {
    const f = lxFind(net, cur);
    if (!f || !f.parent) return null;
    if (f.parent.t === 'P') return f.parent;
    cur = f.parent.id;
  }
  return null;
}
// Orden visual de los elementos editables de una red.
function lxOrder(net) {
  const out = [];
  lxWalk(net.logic, n => { if (n.t === 'C') out.push(n.id); });
  return out.concat(net.coils.map(o => o.id));
}
// Elimina ramas vacías y paralelos de una sola rama.
function lxNormalize(ser) {
  for (let i = 0; i < ser.items.length; i++) {
    const it = ser.items[i];
    if (it.t !== 'P') continue;
    it.branches.forEach(lxNormalize);
    it.branches = it.branches.filter(b => b.items.length);
    if (it.branches.length === 0) { ser.items.splice(i, 1); i--; }
    else if (it.branches.length === 1) { ser.items.splice(i, 1, ...it.branches[0].items); i--; }
  }
}

function lxEval(node) {
  if (node.t === 'C') return evaluateContact(ctcKey(node));
  if (node.t === 'S') return node.items.every(lxEval);
  return node.branches.some(lxEval);
}
function evaluateNet(net) { return !!net && net.coils.length > 0 && lxEval(net.logic); }

// Flujo de corriente para el monitoreo: clave → energizado.
function lxFlow(net) {
  const f = {};
  const run = (node, pin) => {
    if (node.t === 'C') { const closed = evaluateContact(ctcKey(node)); f[node.id] = closed; return pin && closed; }
    if (node.t === 'S') {
      let p = pin;
      node.items.forEach((it, i) => { f[`${node.id}:${i}`] = p; p = run(it, p); });
      f[`${node.id}:${node.items.length}`] = p;
      return p;
    }
    const out = node.branches.map(b => run(b, pin)).some(Boolean);
    f[`${node.id}:in`] = pin; f[`${node.id}:out`] = out;
    return out;
  };
  const rlo = run(net.logic, true);
  f[`${net.id}:rlo`] = rlo;
  net.coils.forEach(o => { f[o.id] = rlo; });
  return f;
}

function lxTagMeta(tag) {
  const sc = SCENARIOS[state.scenario];
  const io = { 'I0.0':sc.io.i00, 'I0.1':sc.io.i01, 'I0.2':sc.io.i02, 'I0.3':sc.io.i03, 'M0.0':'MEMORIA', 'T0.0':'TEMPORIZADOR', 'Q0.0':sc.io.q00 };
  return { sym: state.tagNames[tag] || io[tag] || '', addr: tag };
}
function lxContactTags() {
  return SCENARIOS[state.scenario].controlMode === 'sequence' ? ['I0.0','I0.1','M0.0','T0.0'] : ['I0.0','I0.1','I0.2','I0.3','M0.0'];
}
function lxCoilTags(kind) { return kind === 'TON' ? ['T0.0'] : kind === '=' ? ['Q0.0','M0.0'] : ['M0.0']; }
function lxCoilKinds() { return SCENARIOS[state.scenario].controlMode === 'sequence' ? ['=','S','R','TON'] : ['=','S','R']; }

const LX_SVG = {
  NO:  `<svg class="lx-g" viewBox="0 0 30 28" width="30" height="28" aria-hidden="true"><line x1="0" y1="14" x2="8" y2="14"/><line x1="8" y1="3" x2="8" y2="25"/><line x1="22" y1="3" x2="22" y2="25"/><line x1="22" y1="14" x2="30" y2="14"/></svg>`,
  NC:  `<svg class="lx-g" viewBox="0 0 30 28" width="30" height="28" aria-hidden="true"><line x1="0" y1="14" x2="8" y2="14"/><line x1="8" y1="3" x2="8" y2="25"/><line x1="22" y1="3" x2="22" y2="25"/><line x1="22" y1="14" x2="30" y2="14"/><line x1="9" y1="24" x2="21" y2="4"/></svg>`,
  coil: l => `<svg class="lx-g" viewBox="0 0 34 28" width="34" height="28" aria-hidden="true"><line x1="0" y1="14" x2="6" y2="14"/><path d="M11 4 Q5 14 11 24" fill="none"/><path d="M23 4 Q29 14 23 24" fill="none"/><line x1="28" y1="14" x2="34" y2="14"/>${l ? `<text x="17" y="18.5" text-anchor="middle">${l}</text>` : ''}</svg>`,
  BR:  `<svg class="lx-g" viewBox="0 0 30 28" width="30" height="28" aria-hidden="true"><line x1="0" y1="8" x2="30" y2="8"/><line x1="6" y1="8" x2="6" y2="22"/><line x1="6" y1="22" x2="24" y2="22"/><line x1="24" y1="22" x2="24" y2="8"/></svg>`,
  ADDBR: `<svg class="lx-g" viewBox="0 0 30 28" width="30" height="28" aria-hidden="true"><line x1="0" y1="6" x2="30" y2="6"/><line x1="6" y1="6" x2="6" y2="24"/><line x1="24" y1="6" x2="24" y2="24"/><line x1="6" y1="15" x2="24" y2="15"/><line x1="6" y1="24" x2="24" y2="24" stroke-dasharray="3 2"/></svg>`,
};

// Genera el HTML de una lista de redes. opts: { edit, flowOf(net) }
function lxNetsHtml(nets, opts = {}) {
  const edit = !!opts.edit;
  const sel = edit ? state.ldSel : null;
  const errIds = new Set((edit && state.ladderErrors?.ids) || []);
  const tags = lxContactTags();
  return nets.map((net, ni) => {
    const fl = opts.flowOf ? opts.flowOf(net) : null;
    const pf = key => fl ? (fl[key] ? ' pf-on' : ' pf-off') : '';
    const selCls = id => sel && sel.ni === ni && (sel.id === id || (sel.ids || []).includes(id)) ? ' lx-sel' : '';
    const errCls = id => errIds.has(id) ? ' lx-err' : '';
    const opSel = (node, options) => {
      const empty = !node.tag;
      const meta = node.tag ? lxTagMeta(node.tag) : { sym:'', addr:'' };
      if (!edit) return `<span class="lx-sym">${meta.sym ? `"${meta.sym}"` : '&nbsp;'}</span><span class="lx-op lx-op-ro${empty ? ' lx-op-empty' : ''}">${empty ? '&lt;??.?&gt;' : '%' + node.tag}</span>`;
      const o = options.map(t => `<option value="${t}"${t === node.tag ? ' selected' : ''}>%${t}${lxTagMeta(t).sym ? ` "${lxTagMeta(t).sym}"` : ''}</option>`).join('');
      return `<span class="lx-sym">${meta.sym ? `"${meta.sym}"` : '&nbsp;'}</span><span class="lx-op-wrap"><span class="lx-op${empty ? ' lx-op-empty' : ''}">${empty ? '&lt;??.?&gt;' : '%' + node.tag}</span><select class="lx-op-sel" data-op-ni="${ni}" data-op-id="${node.id}" title="Operando${meta.sym ? `: ${meta.sym}` : ''}" aria-label="Operando">${empty ? '<option value="" selected>&lt;??.?&gt;</option>' : ''}${o}</select></span>`;
    };
    const ctcHtml = c => `<div class="lx-el lx-ctc${selCls(c.id)}${errCls(c.id)}${pf(c.id)}" data-lx-ni="${ni}" data-lx-id="${c.id}" data-pf="${c.id}"${edit ? ' draggable="true"' : ''} title="${c.nc ? 'Contacto normalmente cerrado' : 'Contacto normalmente abierto'}">
      <div class="lx-opbox">${opSel(c, tags)}</div>
      <div class="lx-glyph"><span class="lx-wl"></span>${c.nc ? LX_SVG.NC : LX_SVG.NO}<span class="lx-wl"></span></div>
    </div>`;
    const gapHtml = (ser, i, grow) => `<div class="lx-gap${grow ? ' lx-gap-grow' : ''}${sel && sel.ni === ni && sel.gap && sel.gap.sid === ser.id && sel.gap.i === i ? ' lx-sel' : ''}${pf(`${ser.id}:${i}`)}" data-pf="${ser.id}:${i}"${edit ? ` data-gap-ni="${ni}" data-gap-sid="${ser.id}" data-gap-i="${i}"` : ''}></div>`;
    const serHtml = (ser, grow) => `<div class="lx-ser${grow ? ' lx-ser-grow' : ''}">${ser.items.map((it, i) => gapHtml(ser, i, false) + (it.t === 'C' ? ctcHtml(it) : parHtml(it))).join('')}${gapHtml(ser, ser.items.length, true)}</div>`;
    const parHtml = p => `<div class="lx-par${fl ? (fl[`${p.id}:in`] ? ' pf-in' : '') + (fl[`${p.id}:out`] ? ' pf-out' : '') : ''}" data-pf-par="${p.id}">${p.branches.map(b => `<div class="lx-br">${serHtml(b, true)}</div>`).join('')}</div>`;
    const coilHtml = o => {
      const isTon = o.kind === 'TON';
      const glyph = isTon
        ? `<div class="lx-box"><span class="lx-box-t">TON</span><span class="lx-box-r">Time</span><span class="lx-box-pt">PT <b>T#${SCENARIOS[state.scenario].timerPT || state.timerPT}s</b></span><span class="lx-box-pt">ET <b class="lx-ton-et">${state.timerET.toFixed(1)}s</b></span></div>`
        : `<div class="lx-glyph"><span class="lx-wl"></span>${LX_SVG.coil(o.kind === '=' ? '' : o.kind)}<span class="lx-wl lx-wl-end"></span></div>`;
      return `<div class="lx-el lx-coil${isTon ? ' lx-ton' : ''}${selCls(o.id)}${errCls(o.id)}${pf(o.id)}" data-lx-ni="${ni}" data-lx-id="${o.id}" data-pf="${o.id}"${edit ? ' draggable="true"' : ''} title="${LX_COIL_KINDS[o.kind]}">
        <div class="lx-opbox">${opSel(o, lxCoilTags(o.kind))}</div>${glyph}</div>`;
    };
    const coils = net.coils.length
      ? `<div class="lx-par lx-coils${fl && fl[`${net.id}:rlo`] ? ' pf-in' : ''}">${net.coils.map(o => `<div class="lx-br"><div class="lx-gap lx-gap-c${pf(`${net.id}:rlo`)}" data-pf="${net.id}:rlo"></div>${coilHtml(o)}</div>`).join('')}</div>`
      : `<div class="lx-coil-ph${errIds.has(net.id) ? ' lx-err' : ''}" data-lx-coil-drop="${ni}">${edit ? 'Bobina' : ''}</div>`;
    const n = nets.length;
    const head = edit
      ? `<div class="lx-net-hd">
          <span class="lx-net-num">Network ${ni + 1}:</span>
          <input class="ld-net-inp" data-net-ri="${ni}" value="${(net.title || '').replace(/"/g, '&quot;')}" placeholder="Título de la red" maxlength="60">
          <span class="lx-net-tools">
            <button class="lx-net-btn" data-rung-up="${ni}" title="Subir red"${ni === 0 ? ' disabled' : ''}>↑</button>
            <button class="lx-net-btn" data-rung-dn="${ni}" title="Bajar red"${ni === n - 1 ? ' disabled' : ''}>↓</button>
            <button class="lx-net-btn" data-insert-rung="${ni}" title="Insertar red debajo">＋</button>
            <button class="lx-net-btn lx-net-del" data-remove-rung="${ni}" title="Borrar red"${n <= 1 ? ' disabled' : ''}>✕</button>
          </span>
        </div>
        <textarea class="lx-net-cmt" data-net-cmt="${ni}" rows="1" placeholder="Comentario" maxlength="200">${(net.comment || '').replace(/</g, '&lt;')}</textarea>`
      : `<div class="lx-net-hd"><span class="lx-net-num">Network ${ni + 1}:</span><span class="lx-net-ttl">${(net.title || '').replace(/</g, '&lt;')}</span></div>`;
    const netSel = sel && sel.ni === ni ? ' lx-net-sel' : '';
    return `<div class="lx-net${netSel}${errIds.has(net.id) ? ' lx-net-err' : ''}" data-lx-net="${ni}">${head}
      <div class="lx-rung" data-lx-rung="${ni}"><div class="lx-rail"></div>${serHtml(net.logic, true)}${coils}</div>
    </div>`;
  }).join('');
}

// Aplica el flujo de corriente al DOM sin re-renderizar.
function lxPaintFlow(root, nets) {
  root.querySelectorAll('[data-lx-net]').forEach(el => {
    const net = nets[+el.dataset.lxNet];
    if (!net) return;
    const f = lxFlow(net);
    el.querySelectorAll('[data-pf]').forEach(x => {
      const on = !!f[x.dataset.pf];
      x.classList.toggle('pf-on', on); x.classList.toggle('pf-off', !on);
    });
    el.querySelectorAll('[data-pf-par]').forEach(x => {
      x.classList.toggle('pf-in', !!f[`${x.dataset.pfPar}:in`]);
      x.classList.toggle('pf-out', !!f[`${x.dataset.pfPar}:out`]);
    });
    const coils = el.querySelector('.lx-coils');
    if (coils) coils.classList.toggle('pf-in', !!f[`${net.id}:rlo`]);
  });
  root.querySelectorAll('.lx-ton-et').forEach(x => { x.textContent = state.timerET.toFixed(1) + 's'; });
}
function lxClearFlow(root) {
  root.querySelectorAll('.pf-on,.pf-off,.pf-in,.pf-out').forEach(x => x.classList.remove('pf-on', 'pf-off', 'pf-in', 'pf-out'));
}
function lxPaintSel() {
  const cv = document.querySelector('.lx-canvas');
  if (!cv) return;
  const s = state.ldSel;
  cv.querySelectorAll('.lx-sel,.lx-net-sel').forEach(x => x.classList.remove('lx-sel', 'lx-net-sel'));
  if (!s) return;
  cv.querySelector(`[data-lx-net="${s.ni}"]`)?.classList.add('lx-net-sel');
  [s.id, ...(s.ids || [])].forEach(id => id && cv.querySelector(`.lx-el[data-lx-id="${id}"]`)?.classList.add('lx-sel'));
}
function lxMonitoring() { return state.compiled && !state.ldDirty && state.plcMonitor && (state.plcRunning || state.plcScanMode); }

function builderLadder() {
  const sc = SCENARIOS[state.scenario];
  const isSeq = sc.controlMode === 'sequence';
  const fav = (act, svg, lbl, key, title) => `<button class="lx-fav" data-lx-act="${act}" draggable="true" data-lx-drag="${act}" title="${title}${key ? ` (${key})` : ''}">${svg}<span>${lbl}</span></button>`;
  const favBar = `<div class="lx-favbar" role="toolbar" aria-label="Favoritos LAD">
    ${fav('NO', LX_SVG.NO, 'NA', 'F2', 'Contacto normalmente abierto')}
    ${fav('NC', LX_SVG.NC, 'NC', 'F3', 'Contacto normalmente cerrado')}
    <span class="lx-fav-sep"></span>
    ${fav('=', LX_SVG.coil(''), 'Bobina', 'F7', 'Bobina de asignación')}
    ${fav('S', LX_SVG.coil('S'), 'Set', '', 'Activar salida (SET)')}
    ${fav('R', LX_SVG.coil('R'), 'Reset', '', 'Desactivar salida (RESET)')}
    ${isSeq ? fav('TON', `<svg class="lx-g" viewBox="0 0 30 28" width="30" height="28"><rect x="4" y="4" width="22" height="20" rx="2" fill="none"/><text x="15" y="17.5" text-anchor="middle" style="font-size:8px">TON</text></svg>`, 'TON', '', 'Temporizador con retardo a la conexión') : ''}
    <span class="lx-fav-sep"></span>
    <button class="lx-fav" data-lx-act="BRANCH" title="Abrir rama paralela en el contacto seleccionado (Shift+F8). Shift+clic en otro contacto de la misma línea para abarcar varios.">${LX_SVG.BR}<span>Rama</span></button>
    <button class="lx-fav" data-lx-act="ADDBR" title="Añadir otra rama al paralelo que contiene la selección">${LX_SVG.ADDBR}<span>+ Rama</span></button>
    <span class="lx-fav-sep"></span>
    <button class="lx-fav lx-fav-del" data-lx-act="DEL" title="Borrar elemento seleccionado (Supr)"><svg class="lx-g" viewBox="0 0 30 28" width="30" height="28"><line x1="9" y1="7" x2="21" y2="21"/><line x1="21" y1="7" x2="9" y2="21"/></svg><span>Borrar</span></button>
    <span class="lx-fav-sep"></span>
    <button class="lx-fav" data-lx-act="UNDO" title="Deshacer (Ctrl+Z)"${_lxHist.undo.length ? '' : ' disabled'}><svg class="lx-g" viewBox="0 0 30 28" width="30" height="28"><path d="M10 9 L5 14 L10 19"/><path d="M5 14 H19 a6 6 0 0 1 0 12 H15"/></svg><span>Deshacer</span></button>
    <button class="lx-fav" data-lx-act="REDO" title="Rehacer (Ctrl+Y)"${_lxHist.redo.length ? '' : ' disabled'}><svg class="lx-g" viewBox="0 0 30 28" width="30" height="28"><path d="M20 9 L25 14 L20 19"/><path d="M25 14 H11 a6 6 0 0 0 0 12 H15"/></svg><span>Rehacer</span></button>
    <span class="lx-fav-spacer"></span>
    ${state.ldDirty && state.compiled ? `<span class="lx-dirty" title="El programa del editor difiere del cargado en la CPU">● Offline ≠ Online — compila para cargar</span>` : ''}
  </div>`;

  const hints = state.scenario ? buildHints(state.scenario) : [];
  const allHintsShown = state.hintIdx >= hints.length - 1;
  const hintSection = `<div class="ld-hint-row">${!allHintsShown ? `<button class="btn ld-hint-btn" data-action="hint">Pedir pista</button>` : `<span class="ld-hint-btn-done">Sin más pistas</span>`}${state.hintMsg ? `<div class="ld-hint-box"><span class="ld-hint-icon">💡</span> ${state.hintMsg}</div>` : ''}</div>`;

  const er = state.ladderErrors;
  const info = er && (er.msgs.length || er.warns.length) ? `<div class="lx-info">
    <div class="lx-info-hd">Info · Compilar — ${er.msgs.length} error(es), ${er.warns.length} advertencia(s)</div>
    <ul>${er.msgs.map(m => `<li class="lx-info-err">⛔ ${m}</li>`).join('')}${er.warns.map(m => `<li class="lx-info-warn">⚠ ${m}</li>`).join('')}</ul>
  </div>` : '';

  return `<div class="ld-builder lx-builder">
${favBar}
<p class="ld-hint">Selecciona un contacto o un tramo de cable y pulsa una instrucción (o <kbd>F2</kbd> NA · <kbd>F3</kbd> NC · <kbd>F7</kbd> bobina · <kbd>Shift</kbd>+<kbd>F8</kbd> rama · <kbd>Supr</kbd> borrar · <kbd>←</kbd><kbd>→</kbd> moverse · <kbd>Ctrl</kbd>+<kbd>Z</kbd> deshacer). También puedes arrastrar instrucciones y elementos. El programa se guarda solo en este navegador.</p>
<div class="ld-canvas lx-canvas${lxMonitoring() ? ' lx-monitor' : ''}" tabindex="0">
${lxNetsHtml(state.ladderNets, { edit:true, flowOf: lxMonitoring() ? (net => lxFlow(state.cpuNets[state.ladderNets.indexOf(net)] || net)) : null })}
</div>
<div class="ld-add-row"><button class="btn ld-add-btn" data-action="addRung">＋ Agregar red</button></div>
${info}
${lxVerifyHtml()}
${hintSection}
</div>`;
}

// ── Operaciones de edición ─────────────────────────────────────
function lxTouch() { state.ldDirty = true; state.ladderErrors = null; state.verifyResult = null; lxCommit(); }

// ── Historial (deshacer/rehacer) y guardado local ─────────────
// _lxHist.last es el estado ya confirmado; cada commit lo apila en undo.
const LX_STORE = 'automata-lab-ladder-v1';
const LX_HIST_MAX = 50;
const _lxHist = { undo: [], redo: [], last: null };
function lxSnapshot() { return JSON.stringify(state.ladderNets); }
function lxResetHistory() { _lxHist.undo = []; _lxHist.redo = []; _lxHist.last = lxSnapshot(); state.verifyResult = null; }
function lxCommit() {
  const cur = lxSnapshot();
  if (_lxHist.last !== null && cur !== _lxHist.last) {
    _lxHist.undo.push(_lxHist.last);
    if (_lxHist.undo.length > LX_HIST_MAX) _lxHist.undo.shift();
    _lxHist.redo = [];
  }
  _lxHist.last = cur;
  lxPersist();
}
function lxRestore(snap) {
  state.ladderNets = JSON.parse(snap);
  _lxHist.last = snap;
  state.ldSel = null; state.ldDirty = true; state.ladderErrors = null; state.verifyResult = null;
  lxPersist();
}
function lxUndo() {
  if (!_lxHist.undo.length) return false;
  _lxHist.redo.push(_lxHist.last);
  lxRestore(_lxHist.undo.pop());
  return true;
}
function lxRedo() {
  if (!_lxHist.redo.length) return false;
  _lxHist.undo.push(_lxHist.last);
  lxRestore(_lxHist.redo.pop());
  return true;
}

function lxReadStore() {
  try { const d = JSON.parse(localStorage.getItem(LX_STORE) || '{}'); return d && typeof d === 'object' ? d : {}; }
  catch { return {}; }
}
function lxPersist() {
  try {
    const d = lxReadStore();
    d.programs = d.programs || {};
    d.programs[state.scenario] = state.ladderNets;
    d.tagNames = state.tagNames;
    localStorage.setItem(LX_STORE, JSON.stringify(d));
  } catch { /* almacenamiento no disponible: se sigue trabajando en memoria */ }
}
function lxForget(scenario) {
  try {
    const d = lxReadStore();
    if (d.programs) delete d.programs[scenario];
    localStorage.setItem(LX_STORE, JSON.stringify(d));
  } catch { /* nada que borrar */ }
}
// Valida un programa guardado y ajusta el contador de ids para no repetirlos.
function lxAdopt(nets) {
  const okSer = n => n && n.t === 'S' && Array.isArray(n.items) && n.items.every(x =>
    x && (x.t === 'C' || (x.t === 'P' && Array.isArray(x.branches) && x.branches.length && x.branches.every(okSer))));
  if (!Array.isArray(nets) || !nets.length || !nets.every(n => n && okSer(n.logic) && Array.isArray(n.coils))) return null;
  let max = 0;
  const bump = id => { const m = /^[a-z](\d+)$/.exec(id || ''); if (m) max = Math.max(max, +m[1]); };
  nets.forEach(n => { bump(n.id); lxWalk(n.logic, x => bump(x.id)); n.coils.forEach(o => bump(o.id)); });
  _lxId = Math.max(_lxId, max);
  return nets;
}
function lxStoredNets(scenario) { return lxAdopt(lxReadStore().programs?.[scenario]); }
function lxSelNet() {
  if (!state.ladderNets.length) state.ladderNets.push(lxNet());
  const ni = state.ldSel ? Math.min(state.ldSel.ni, state.ladderNets.length - 1) : state.ladderNets.length - 1;
  return { ni, net: state.ladderNets[ni] };
}
function lxInsertContact(nc, target) {
  const { ni, net } = target ? { ni:target.ni, net:state.ladderNets[target.ni] } : lxSelNet();
  const s = target || state.ldSel || {};
  const c = lxCtc(null, nc);
  const gapRef = s.gap ? lxFind(net, s.gap.sid) : null;
  if (s.gap && (gapRef || net.logic.id === s.gap.sid)) {
    const ser = gapRef ? gapRef.node : net.logic;
    ser.items.splice(s.gap.i, 0, c);
  } else {
    const f = s.id ? lxFind(net, s.id) : null;
    if (f && f.node.t === 'C') f.list.splice(f.index + 1, 0, c);
    else net.logic.items.push(c);
  }
  state.ldSel = { ni, id:c.id };
  lxTouch();
  return c;
}
function lxInsertCoil(kind, ni) {
  if (ni == null) ni = lxSelNet().ni;
  const net = state.ladderNets[ni];
  const tags = lxCoilTags(kind);
  const o = lxCoil(kind, tags.length === 1 ? tags[0] : null);
  const f = state.ldSel && state.ldSel.ni === ni && state.ldSel.id ? lxFind(net, state.ldSel.id) : null;
  if (f && f.node.t === 'O') net.coils.splice(f.index + 1, 0, o); else net.coils.push(o);
  state.ldSel = { ni, id:o.id };
  lxTouch();
}
function lxOpenBranch() {
  const s = state.ldSel;
  if (!s || !s.id) return 'Selecciona un contacto para abrir una rama paralela.';
  const net = state.ladderNets[s.ni];
  const f = lxFind(net, s.id);
  if (!f || f.node.t !== 'C') return 'Las ramas se abren sobre contactos. Selecciona un contacto.';
  let a = f.index, b = f.index;
  (s.ids || []).forEach(id => { const g = lxFind(net, id); if (g && g.parent === f.parent) { a = Math.min(a, g.index); b = Math.max(b, g.index); } });
  const c = lxCtc();
  const span = f.list.splice(a, b - a + 1);
  f.list.splice(a, 0, lxPar([lxSer(span), lxSer([c])]));
  state.ldSel = { ni:s.ni, id:c.id };
  lxTouch();
  return null;
}
function lxAddBranch() {
  const s = state.ldSel;
  const net = s && state.ladderNets[s.ni];
  const p = net && s.id ? lxParAncestor(net, s.id) : (net && s.gap ? lxParAncestor(net, s.gap.sid) : null);
  if (!p) return 'Selecciona un elemento que esté dentro de un paralelo.';
  const c = lxCtc();
  p.branches.push(lxSer([c]));
  state.ldSel = { ni:s.ni, id:c.id };
  lxTouch();
  return null;
}
function lxDeleteSel() {
  const s = state.ldSel;
  if (!s || !s.id) return;
  const net = state.ladderNets[s.ni];
  const order = lxOrder(net);
  const ids = [s.id, ...(s.ids || [])];
  ids.forEach(id => { const f = lxFind(net, id); if (f && f.list) f.list.splice(f.index, 1); });
  lxNormalize(net.logic);
  const left = lxOrder(net);
  const prev = order.slice(0, order.indexOf(s.id)).reverse().find(id => left.includes(id)) || left[0];
  state.ldSel = prev ? { ni:s.ni, id:prev } : { ni:s.ni };
  lxTouch();
}
// Mueve un elemento existente a un tramo de cable (contactos) o a otra red (bobinas).
function lxMove(fromNi, id, target) {
  const src = state.ladderNets[fromNi];
  const f = lxFind(src, id);
  if (!f || !f.list) return;
  const node = f.node;
  if (node.t === 'O') {
    f.list.splice(f.index, 1);
    state.ladderNets[target.ni].coils.push(node);
  } else {
    if (!target.gap) return;
    const tomb = { t:'X', id:'x' };
    f.list.splice(f.index, 1, tomb);
    const dst = state.ladderNets[target.ni];
    const g = lxFind(dst, target.gap.sid);
    (g ? g.node : dst.logic).items.splice(target.gap.i, 0, node);
    const t = lxFind(src, 'x');
    if (t) t.list.splice(t.index, 1);
    lxNormalize(src.logic);
    if (src !== dst) lxNormalize(dst.logic);
  }
  state.ldSel = { ni:target.ni, id:node.id };
  lxTouch();
}

// ── Verificación por comportamiento ────────────────────────────
// Simula el programa del alumno y la solución con las mismas entradas y recorre
// (BFS) todos los estados alcanzables. Si en algún caso Q0.0 difiere, devuelve la
// secuencia de entradas más corta que lo provoca.
const LX_SCAN_S = 0.7; // duración de un ciclo del simulador (igual que el intervalo de la app)

function lxSimTick(nets, st, inp, ptSteps) {
  const s = { ...st };
  const io = { 'I0.0':inp[0], 'I0.1':inp[1], 'I0.2':inp[2], 'I0.3':inp[3] };
  const ctc = c => {
    if (!c.tag) return false;
    const v = c.tag === 'M0.0' ? s.M : c.tag === 'T0.0' ? s.TQ : !!io[c.tag];
    return c.nc ? !v : v;
  };
  const ev = n => n.t === 'C' ? ctc(n) : n.t === 'S' ? n.items.every(ev) : n.branches.some(ev);
  const scan = () => {
    s.Q = false;
    for (const net of nets) {
      if (!net.coils.length) continue;
      const on = ev(net.logic);
      for (const o of net.coils) {
        const k = coilKey(o);
        if      (k === 'M0.0/S') { if (on) s.M = true; }
        else if (k === 'M0.0/R') { if (on) s.M = false; }
        else if (k === 'M0.0')   s.M = on;
        else if (k === 'Q0.0')   s.Q = on;
      }
    }
  };
  // Igual que el ciclo real: scan, actualizar TON, scan.
  scan();
  const ton = nets.find(n => n.coils.some(o => coilKey(o) === 'T0.0/TON'));
  if (ton) {
    if (ev(ton.logic)) { s.k = Math.min(s.k + 1, ptSteps); s.TQ = s.k >= ptSteps; }
    else { s.k = 0; s.TQ = false; }
    scan();
  }
  return s;
}

function lxVerify() {
  const sc = SCENARIOS[state.scenario];
  const target = lxTargetNets(state.scenario);
  const mine = lxClone(state.ladderNets);
  const ptSteps = Math.max(1, Math.ceil((sc.timerPT || state.timerPT) / LX_SCAN_S - 1e-9));
  // Combinaciones de entradas posibles: el sensor no puede estar bajo y alto a la vez.
  const combos = [];
  for (let m = 0; m < 16; m++) {
    const b = [!!(m & 1), !!(m & 2), !!(m & 4), !!(m & 8)];
    if (!(b[2] && b[3])) combos.push(b);
  }
  combos.sort((x, y) => x.filter(Boolean).length - y.filter(Boolean).length);
  const key = (a, b) => `${+a.M}${+a.TQ}${a.k}|${+b.M}${+b.TQ}${b.k}`;
  const init = { M:false, Q:false, k:0, TQ:false };
  const bfs = list => {
    const nodes = [{ a:init, b:init, prev:-1, inp:null }];
    const seen = new Set([key(init, init)]);
    let trans = 0;
    for (let i = 0; i < nodes.length; i++) {
      const { a, b } = nodes[i];
      for (const inp of list) {
        trans++;
        const na = lxSimTick(target, a, inp, ptSteps), nb = lxSimTick(mine, b, inp, ptSteps);
        if (na.Q !== nb.Q) {
          const path = [{ inp, exp:na.Q, got:nb.Q }];
          for (let j = i; nodes[j].prev >= 0; j = nodes[j].prev) path.unshift({ inp:nodes[j].inp, exp:nodes[j].a.Q, got:nodes[j].b.Q });
          return { ok:false, steps:path };
        }
        const kk = key(na, nb);
        if (!seen.has(kk)) { seen.add(kk); nodes.push({ a:na, b:nb, prev:i, inp }); }
      }
    }
    return { ok:true, states:seen.size, trans };
  };
  // Primero sin pulsar MARCHA y PARADA a la vez (contraejemplos más claros);
  // si todo coincide, se prueba también ese caso (prioridad de la parada).
  const first = bfs(combos.filter(c => !(c[0] && c[1])));
  if (!first.ok) return first;
  const all = bfs(combos);
  if (!all.ok) all.bothButtons = true;
  return all;
}

function lxVerifyHtml() {
  const v = state.verifyResult;
  if (!v) return '';
  const sc = SCENARIOS[state.scenario];
  const out = lxTagMeta('Q0.0').sym || sc.io.q00;
  if (v.ok) return `<div class="lx-verify lx-verify-ok">
    <div class="lx-verify-hd">✔ Verificación superada</div>
    <p>Tu programa responde igual que la solución en todas las situaciones posibles: se probaron ${v.trans} combinaciones de entradas sobre ${v.states} estados internos.</p>
  </div>`;
  const tags = ['I0.0','I0.1','I0.2','I0.3'];
  const inpLbl = inp => { const on = tags.filter((t, i) => inp[i]).map(t => `<code>${lxTagMeta(t).sym || t}</code>`); return on.length ? on.join(' + ') : '<span class="lx-verify-none">ninguna</span>'; };
  // Agrupa pasos consecutivos iguales (p. ej. esperar a que corra el TON).
  const rows = [];
  v.steps.forEach((s, i) => {
    const last = rows[rows.length - 1];
    const same = last && i < v.steps.length - 1 && last.inp.join() === s.inp.join() && last.exp === s.exp && last.got === s.got;
    if (same) last.n++; else rows.push({ ...s, n:1, from:i + 1 });
  });
  const onOff = q => q ? '<b class="lx-q-on">1 · ON</b>' : '<b class="lx-q-off">0 · OFF</b>';
  const fin = v.steps[v.steps.length - 1];
  return `<div class="lx-verify lx-verify-bad">
    <div class="lx-verify-hd">✖ Tu programa no se comporta como se espera</div>
    ${v.bothButtons ? `<p>Solo falla si se pulsan <b>${lxTagMeta('I0.0').sym || 'I0.0'}</b> y <b>${lxTagMeta('I0.1').sym || 'I0.1'}</b> a la vez: la parada debe tener prioridad. Revisa el orden de las redes o usa un contacto NC de parada.</p>` : ''}
    <p>Con esta secuencia de entradas, <b>${out}</b> debería quedar <b>${fin.exp ? 'encendida' : 'apagada'}</b>, pero tu programa la deja <b>${fin.got ? 'encendida' : 'apagada'}</b>.</p>
    <table class="lx-verify-tbl"><thead><tr><th>Ciclo</th><th>Entradas activas</th><th>${out} esperada</th><th>Tu ${out}</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr class="${i === rows.length - 1 ? 'lx-verify-fail' : ''}"><td>${r.n > 1 ? `${r.from}–${r.from + r.n - 1} <small>(×${r.n}, ≈${(r.n * LX_SCAN_S).toFixed(1)} s)</small>` : r.from}</td><td>${inpLbl(r.inp)}</td><td>${onOff(r.exp)}</td><td>${onOff(r.got)}</td></tr>`).join('')}
    </tbody></table>
    <p class="lx-verify-tip">Cada fila es un ciclo de scan (${LX_SCAN_S} s). Puedes reproducir el caso con <b>⏩ Paso</b> y la tabla de forzado.</p>
  </div>`;
}

function lxTonNet() { return (state.cpuNets || []).find(n => n.coils.some(o => coilKey(o) === 'T0.0/TON')) || null; }

function lxCompile() {
  const msgs = [], warns = [], ids = [];
  const sc = SCENARIOS[state.scenario];
  const assigned = {};
  let used = 0;
  state.ladderNets.forEach((net, ni) => {
    const nm = `Network ${ni + 1}`;
    if (!net.logic.items.length && !net.coils.length) { warns.push(`${nm}: red vacía (se ignora).`); return; }
    used++;
    let emptyOps = 0;
    lxWalk(net.logic, n => { if (n.t === 'C' && !n.tag) { emptyOps++; ids.push(n.id); } });
    net.coils.forEach(o => { if (!o.tag) { emptyOps++; ids.push(o.id); } });
    if (emptyOps) msgs.push(`${nm}: ${emptyOps} operando(s) sin asignar &lt;??.?&gt;.`);
    if (!net.coils.length) { msgs.push(`${nm}: la red no termina en una bobina o instrucción de salida.`); ids.push(net.id); }
    if (net.coils.length && !net.logic.items.length) warns.push(`${nm}: bobina conectada directamente a la barra (siempre activa).`);
    net.coils.forEach(o => {
      if (o.kind === 'TON' && sc.controlMode !== 'sequence') { msgs.push(`${nm}: TON no disponible en este proceso.`); ids.push(o.id); }
      if (o.kind === '=' && o.tag) (assigned[o.tag] = assigned[o.tag] || []).push(ni + 1);
    });
  });
  Object.entries(assigned).forEach(([t, nets]) => {
    if (nets.length > 1) warns.push(`%${t} se asigna en varias redes (${nets.join(', ')}): manda la última evaluada.`);
  });
  if (!used) msgs.push('El bloque OB1 no contiene instrucciones.');
  return { ok: !msgs.length, msgs, warns, ids };
}

function buildHints(scenario) {
  const sc = SCENARIOS[scenario];
  const io = sc.io;
  const structLabels = { series1:'un contacto seguido de la bobina', series2:'dos contactos en serie antes de la bobina', parallel:'dos contactos en paralelo (abre una rama) antes de la bobina' };
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
  sc.ladder.forEach((r, i) => hints.push(`Network ${i+1}: usa ${structLabels[r.struct]}.`));
  sc.ladder.forEach((r, i) => {
    if (r.a !== undefined) hints.push(`Network ${i+1}, primer contacto: ${tagName(r.a)}.`);
    if ('b' in r && r.b !== undefined) hints.push(`Network ${i+1}, segundo contacto: ${tagName(r.b)}.`);
    hints.push(`Network ${i+1}, bobina: ${tagName(r.coil)}.`);
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

function ladderSvg() {
  const nets = state.compiled && state.cpuNets ? state.cpuNets : lxTargetNets(state.scenario);
  return `<div class="lx-live">${lxNetsHtml(nets, { flowOf: lxFlow })}</div>`;
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

function lxUsages(tag) {
  const usages = [];
  state.ladderNets.forEach((net, ni) => {
    const netLbl = `Network ${ni+1}${net.title ? ' — ' + net.title : ''}`;
    lxWalk(net.logic, n => { if (n.t === 'C' && n.tag === tag) usages.push({ net: netLbl, pos: 'Contacto', mod: n.nc ? 'NC' : 'NO' }); });
    net.coils.forEach(o => { if (o.tag === tag) usages.push({ net: netLbl, pos: o.kind === 'TON' ? 'Temporizador' : 'Bobina', mod: o.kind === '=' ? '(bobina)' : o.kind }); });
  });
  return usages;
}

function tagUsageCount(tag) { return lxUsages(tag).length; }

function xrefHtml(tag) {
  const usages = lxUsages(tag);
  const tn = state.tagNames;
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
    <button class="tia-tb-btn" data-action="plcVerify" title="Comprueba que tu programa se comporte como la solución en todas las situaciones">✔ Verificar</button>
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
        <div class="tia-net-hd">Main [OB1] · ${sc.label}</div>
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
  const items=[["wiring","CE 1.1.1 — Conectar componentes","Conecta fuente, sensor y actuador en el lazo de control."],["builder","CE 1.1.2 — Clasificar componentes","Identifica y monta cada elemento del lazo en la mesa de trabajo."],["relay","CE 1.1.4 — Configurar on/off","Ajusta P1 = 30% y P2 = 75% con histéresis adecuada."],["program","CE 2.1.3 — Implementar rutina","Programa la rutina Ladder y pulsa ✔ Verificar: debe comportarse como la solución en todos los casos."],["diagnose","CE 1.1.3 — Medir variables","Identifica la falla midiendo en los puntos del circuito."]];
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

  // Monitor mode: power flow in the LAD editor (only when editor == CPU program)
  const ldCanvas = document.querySelector('.lx-canvas');
  if (ldCanvas) {
    const mon = lxMonitoring();
    ldCanvas.classList.toggle('lx-monitor', mon);
    if (mon) lxPaintFlow(ldCanvas, state.cpuNets); else lxClearFlow(ldCanvas);
  }
}

function setupEvents() {
  const toastEl = document.createElement('div');
  toastEl.id = 'toast'; toastEl.className = 'toast';
  document.body.appendChild(toastEl);

  document.addEventListener('change', e => {
    const opEl = e.target.closest('.lx-op-sel');
    if (opEl && opEl.value) {
      const net = state.ladderNets[+opEl.dataset.opNi];
      const f = net && lxFind(net, opEl.dataset.opId);
      if (f) { f.node.tag = opEl.value; state.ldSel = { ni:+opEl.dataset.opNi, id:f.node.id }; lxTouch(); }
      render(); return;
    }
    const nInp = e.target.closest('.ld-net-inp');
    if (nInp) { const net = state.ladderNets[+nInp.dataset.netRi]; if (net) { net.title = nInp.value; lxCommit(); } return; }
    const nCmt = e.target.closest('.lx-net-cmt');
    if (nCmt) { const net = state.ladderNets[+nCmt.dataset.netCmt]; if (net) { net.comment = nCmt.value; lxCommit(); } return; }
    const inp = e.target.closest('.sym-name-inp');
    if (!inp) return;
    const tag = inp.dataset.tag;
    const val = inp.value.trim().replace(/[^A-Za-z0-9_]/g,'').toUpperCase().slice(0,12);
    inp.value = val;
    if (val) state.tagNames[tag] = val; else delete state.tagNames[tag];
    lxPersist();
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

  // ── LAD editor: drag & drop ──────────────────────────────
  // Instrucciones de favoritos (data-lx-drag) o elementos existentes (data-lx-id).
  let _lxDrag = null;
  const _lxDropAt = (target, drag) => {
    const isCoil = drag.coil;
    if (isCoil) return target.closest('[data-lx-net]');
    return target.closest('[data-gap-sid]') || target.closest('.lx-ctc[data-lx-id]');
  };
  const _lxClearOver = () => document.querySelectorAll('.lx-drop-over').forEach(x => x.classList.remove('lx-drop-over'));
  document.addEventListener('dragstart', e => {
    const fav = e.target.closest('[data-lx-drag]');
    const el = !fav && e.target.closest('.lx-el[data-lx-id]');
    if (!fav && !el) return;
    if (fav) {
      const act = fav.dataset.lxDrag;
      _lxDrag = { act, coil: !(act === 'NO' || act === 'NC') };
      e.dataTransfer.effectAllowed = 'copy';
    } else {
      _lxDrag = { ni:+el.dataset.lxNi, id:el.dataset.lxId, coil: el.classList.contains('lx-coil') };
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('lx-dragging');
    }
    e.dataTransfer.setData('text/plain', 'lad');
  });
  document.addEventListener('dragend', () => {
    _lxDrag = null; _lxClearOver();
    document.querySelectorAll('.lx-dragging').forEach(x => x.classList.remove('lx-dragging'));
  });
  document.addEventListener('dragover', e => {
    if (!_lxDrag) return;
    const z = _lxDropAt(e.target, _lxDrag);
    if (!z) return;
    e.preventDefault();
    if (!z.classList.contains('lx-drop-over')) { _lxClearOver(); z.classList.add('lx-drop-over'); }
  });
  document.addEventListener('drop', e => {
    if (!_lxDrag) return;
    const z = _lxDropAt(e.target, _lxDrag);
    if (!z) return;
    e.preventDefault();
    const d = _lxDrag; _lxDrag = null; _lxClearOver();
    const ni = +(z.dataset.gapNi ?? z.dataset.lxNi ?? z.dataset.lxNet);
    const target = z.dataset.gapSid ? { ni, gap:{ sid:z.dataset.gapSid, i:+z.dataset.gapI } } : { ni, id:z.dataset.lxId };
    if (d.act) {
      if (d.coil) { state.ldSel = { ni }; lxInsertCoil(d.act, ni); }
      else lxInsertContact(d.act === 'NC', target);
    } else if (d.coil) {
      if (d.ni !== ni) lxMove(d.ni, d.id, { ni });
    } else {
      let t = target;
      if (!t.gap) { // soltar sobre un contacto: insertar a continuación
        const f = lxFind(state.ladderNets[ni], t.id);
        if (!f || f.node.id === d.id) return;
        t = { ni, gap:{ sid:f.parent.id, i:f.index + 1 } };
      }
      lxMove(d.ni, d.id, t);
    }
    render();
  });

  // Pulsar sobre el operando también selecciona el elemento (sin re-render para no cerrar el desplegable).
  document.addEventListener('pointerdown', e => {
    const op = e.target.closest('.lx-op-sel');
    if (!op) return;
    state.ldSel = { ni:+op.dataset.opNi, id:op.dataset.opId };
    lxPaintSel();
  });

  // ── LAD editor: teclado (atajos TIA Portal) ──────────────
  document.addEventListener('keydown', e => {
    if (state.view !== 'program') return;
    const k = e.key;
    // Desde el selector de operando se permiten los atajos de instrucción (no las flechas).
    const onOp = e.target.closest('.lx-op-sel') && /^(F2|F3|F7|F8|Delete|Escape)$/.test(k);
    if (e.target.closest('input,textarea,select') && !onOp) return;
    let msg = null, handled = true;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && !onOp && (k === 'z' || k === 'Z') && !e.shiftKey) { if (!lxUndo()) msg = 'No hay nada que deshacer.'; }
    else if (mod && !onOp && (k === 'y' || k === 'Y' || ((k === 'z' || k === 'Z') && e.shiftKey))) { if (!lxRedo()) msg = 'No hay nada que rehacer.'; }
    else if (k === 'F2') lxInsertContact(false);
    else if (k === 'F3') lxInsertContact(true);
    else if (k === 'F7') lxInsertCoil('=');
    else if (k === 'F8' && e.shiftKey) msg = lxOpenBranch();
    else if ((k === 'Delete' || k === 'Backspace') && state.ldSel?.id) lxDeleteSel();
    else if (k === 'Escape' && state.ldSel) state.ldSel = null;
    else if ((k === 'ArrowLeft' || k === 'ArrowRight') && state.ldSel) {
      const net = state.ladderNets[state.ldSel.ni];
      const order = lxOrder(net);
      const i = order.indexOf(state.ldSel.id);
      const j = i < 0 ? 0 : Math.max(0, Math.min(order.length - 1, i + (k === 'ArrowRight' ? 1 : -1)));
      if (order[j]) state.ldSel = { ni:state.ldSel.ni, id:order[j] };
    }
    else if ((k === 'ArrowUp' || k === 'ArrowDown') && state.ldSel) {
      const ni = Math.max(0, Math.min(state.ladderNets.length - 1, state.ldSel.ni + (k === 'ArrowDown' ? 1 : -1)));
      const first = lxOrder(state.ladderNets[ni])[0];
      state.ldSel = first ? { ni, id:first } : { ni };
    }
    else handled = false;
    if (!handled) return;
    e.preventDefault();
    if (msg) { state.feedback = msg; state.feedbackType = 'warn'; }
    render();
    document.querySelector('.lx-canvas')?.focus({ preventScroll:true });
  });
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
      if (j < 0 || j >= state.ladderNets.length) return;
      [state.ladderNets[ri], state.ladderNets[j]] = [state.ladderNets[j], state.ladderNets[ri]];
      state.ldSel = { ni:j };
      lxTouch(); render(); return;
    }

    const removeRungEl = e.target.closest('[data-remove-rung]');
    if (removeRungEl) {
      const ri = +removeRungEl.dataset.removeRung;
      if (state.ladderNets.length <= 1) return;
      state.ladderNets.splice(ri, 1);
      state.ldSel = { ni:Math.max(0, ri - 1) };
      lxTouch(); render(); return;
    }

    const insRungEl = e.target.closest('[data-insert-rung]');
    if (insRungEl) {
      const ri = +insRungEl.dataset.insertRung;
      state.ladderNets.splice(ri + 1, 0, lxNet());
      state.ldSel = { ni:ri + 1 };
      lxTouch(); render(); return;
    }

    const favEl = e.target.closest('[data-lx-act]');
    if (favEl) {
      const act = favEl.dataset.lxAct;
      let msg = null;
      if (act === 'NO' || act === 'NC') lxInsertContact(act === 'NC');
      else if (act === 'BRANCH') msg = lxOpenBranch();
      else if (act === 'ADDBR') msg = lxAddBranch();
      else if (act === 'DEL') { if (state.ldSel?.id) lxDeleteSel(); else msg = 'Selecciona el elemento que quieres borrar.'; }
      else if (act === 'UNDO') { if (!lxUndo()) msg = 'No hay nada que deshacer.'; }
      else if (act === 'REDO') { if (!lxRedo()) msg = 'No hay nada que rehacer.'; }
      else lxInsertCoil(act);
      if (msg) { state.feedback = msg; state.feedbackType = 'warn'; }
      render();
      document.querySelector('.lx-canvas')?.focus({ preventScroll:true });
      return;
    }

    // Selección en el editor LAD (elemento, tramo de cable o red)
    if (e.target.closest('.lx-canvas') && !e.target.closest('select,input,textarea,button')) {
      const el = e.target.closest('.lx-el[data-lx-id]');
      const gap = !el && e.target.closest('[data-gap-sid]');
      const netEl = e.target.closest('[data-lx-net]');
      if (el) {
        const ni = +el.dataset.lxNi, id = el.dataset.lxId;
        const cur = state.ldSel;
        if (e.shiftKey && cur && cur.ni === ni && cur.id && el.classList.contains('lx-ctc')) {
          const net = state.ladderNets[ni];
          const p1 = lxParentOf(net, cur.id), p2 = lxParentOf(net, id);
          if (p1 && p1 === p2 && id !== cur.id) {
            const ids = new Set(cur.ids || []);
            ids.has(id) ? ids.delete(id) : ids.add(id);
            state.ldSel = { ...cur, ids:[...ids] };
          } else state.ldSel = { ni, id };
        } else state.ldSel = { ni, id };
      } else if (gap) {
        state.ldSel = { ni:+gap.dataset.gapNi, gap:{ sid:gap.dataset.gapSid, i:+gap.dataset.gapI } };
      } else if (netEl) {
        const ph = e.target.closest('[data-lx-coil-drop]');
        state.ldSel = { ni:+netEl.dataset.lxNet };
        if (ph) state.ldSel.gap = { sid:state.ladderNets[state.ldSel.ni].logic.id, i:state.ladderNets[state.ldSel.ni].logic.items.length };
      }
      if (el || gap || netEl) {
        render();
        document.querySelector('.lx-canvas')?.focus({ preventScroll:true });
        return;
      }
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
        const tonNet2 = lxTonNet();
        if (tonNet2) {
          const tonEnable2 = evaluateNet(tonNet2);
          if (tonEnable2) { const pt2 = sc_s.timerPT || state.timerPT; state.timerET = Math.min(state.timerET + 0.7, pt2); state.timerQ = state.timerET >= pt2; }
          else { state.timerET = 0; state.timerQ = false; }
          updateLogic();
        }
        state.scanCount++;
        state.feedback = `Scan #${state.scanCount} — M0.0=${state.latch?1:0} · Q0.0=${state.pumpCommand?1:0} · T0.0Q=${state.timerQ?1:0}`;
        state.feedbackType = 'ok';
        render(); return;
      }
      else if (a === 'plcVerify') {
        const res = lxCompile();
        if (!res.ok) {
          state.ladderErrors = res; state.verifyResult = null;
          state.feedback = 'Corrige los errores de compilación antes de verificar.'; state.feedbackType = 'warn';
        } else {
          state.ladderErrors = res.warns.length ? res : null;
          state.verifyResult = lxVerify();
          if (state.verifyResult.ok) { state.missions.program = true; state.feedback = 'Verificación superada ✓ — el programa cumple la rutina de control.'; state.feedbackType = 'ok'; }
          else { state.feedback = 'Verificación: hay un caso en que tu programa no responde como se espera.'; state.feedbackType = 'warn'; }
        }
        render();
        document.querySelector('.lx-verify')?.scrollIntoView({ block:'nearest', behavior:'smooth' });
        return;
      }
      else if (a === 'addRung')   { state.ladderNets.push(lxNet()); state.ldSel = { ni:state.ladderNets.length - 1 }; lxTouch(); render(); return; }
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
        nets: lxClone(state.ladderNets),
        cpuNets: state.cpuNets ? lxClone(state.cpuNets) : null,
        dirty: state.ldDirty,
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
        state.ladderNets = lxAdopt(saved.nets) || lxNets(rungs);
        state.cpuNets = saved.cpuNets;
        state.ldDirty = saved.dirty;
        state.ldSel = null;
        state.hintIdx = saved.hintIdx; state.hintMsg = saved.hintMsg;
        state.compiled = saved.compiled;
        state.ladderErrors = null;
        state.feedback = `Proceso: ${sc.label} · Programa restaurado.`;
      } else {
        const stored = lxStoredNets(key);
        state.ladderNets = stored || lxNets(rungs);
        state.cpuNets = null; state.ldDirty = false; state.ldSel = null;
        state.ladderErrors = null;
        state.compiled = false;
        state.hintIdx = -1; state.hintMsg = '';
        state.feedback = stored ? `Proceso: ${sc.label} · Programa guardado recuperado — compílalo para cargarlo.` : `Proceso: ${sc.label} · Configura el relé y compila el programa.`;
      }
      lxResetHistory();
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
        const res = lxCompile();
        state.ladderErrors = res;
        if (res.ok) {
          state.cpuNets = lxClone(state.ladderNets); state.ldDirty = false;
          state.compiled = true; state.plcRunning = false;
          state.feedback = `Compilación finalizada sin errores${res.warns.length ? ` (${res.warns.length} advertencia(s))` : ''} — programa cargado en la CPU. Pulsa ▶ Arrancar.`; state.feedbackType = 'ok';
        } else {
          state.feedback = `Compilación con ${res.msgs.length} error(es) — revisa la ventana Info.`; state.feedbackType = 'warn';
          if (!state.compiled) { state.plcRunning = false; state.systemEnabled = false; }
        }
        render(); break;
      }
      case 'resetPlc': { const _rsc = SCENARIOS[state.scenario]; const _rn = _rsc.rungs || 3; state.compiled = false; state.plcRunning = false; state.plcMonitor = false; state.latch = false; state.systemEnabled = false; state.ladderNets = lxNets(_rn); state.cpuNets = null; state.ldDirty = false; state.ldSel = null; state.forced = {}; state.xrefTag = null; state.plcScanMode = false; state.scanCount = 0; state.ladderErrors = null; state.activeSlot = null; state.inputs = { start: false, stop: false }; state.hintIdx = -1; state.hintMsg = ''; state.timerET = 0; state.timerQ = false; delete state.ladderSave[state.scenario]; state.verifyResult = null; lxCommit(); lxForget(state.scenario); state.feedback = 'PLC reiniciado — programa borrado (Ctrl+Z para recuperarlo).'; state.feedbackType = 'ok'; render(); break; }
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
  const tonNet = lxTonNet();
  if (tonNet && state.compiled && state.plcRunning && state.mode === 'program') {
    const tonEnable = evaluateNet(tonNet);
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

(() => {
  const d = lxReadStore();
  if (d.tagNames && typeof d.tagNames === 'object') state.tagNames = d.tagNames;
  state.ladderNets = lxStoredNets(state.scenario) || lxNets(SCENARIOS[state.scenario].rungs || 3);
  lxResetHistory();
})();
setupEvents();
window.addEventListener('resize', () => { if (state.view === 'builder') applyCanvasScale(); });
render();
