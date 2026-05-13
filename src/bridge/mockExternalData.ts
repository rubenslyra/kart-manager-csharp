import { INITIAL_TELEMETRY, type Gear, type KartTelemetry } from "./types";
import { deriveState } from "./moduleValidator";

type Listener = (t: KartTelemetry) => void;

export type ModuleLifecycle = "unloaded" | "registered" | "initializing" | "ready" | "shutdown" | "fault";

export interface ModuleTestSnapshot {
  moduleId: "core" | "gearbox" | "brakes" | "ignition" | "battery" | "steering";
  phase: ModuleLifecycle;
  tick: number;
  timestamp: string;
  /** GetTelemetryJson() output simulated by the bus. */
  telemetryJson: string;
  /** GetSystemState() snapshot from the CORE bus. */
  systemStateJson: string;
  log: string;
}

type TestListener = (s: ModuleTestSnapshot) => void;

let state: KartTelemetry = structuredClone(INITIAL_TELEMETRY);
state.vehicleState = "WAITING_FOR_MODULES";

const listeners = new Set<Listener>();
const testListeners = new Set<TestListener>();

const lifecycle: Record<ModuleTestSnapshot["moduleId"], ModuleLifecycle> = {
  core: "unloaded",
  gearbox: "unloaded",
  brakes: "unloaded",
  ignition: "unloaded",
  battery: "unloaded",
  steering: "unloaded",
};
let bootStartedAt = 0;

function emit() {
  state = { ...state, timestamp: new Date().toISOString() };
  state.vehicleState = deriveState(state, state.vehicleState);
  for (const l of listeners) l(state);
}

function systemStateJson(): string {
  return JSON.stringify(
    {
      state: state.vehicleState,
      uptimeMs: bootStartedAt ? Date.now() - bootStartedAt : 0,
      modules: Object.entries(lifecycle).map(([id, phase]) => ({ id, phase })),
    },
    null,
    0,
  );
}

function moduleTelemetryJson(mod: ModuleTestSnapshot["moduleId"]): string {
  const m = state.modules;
  const payload =
    mod === "core"
      ? { id: "core", loaded: m.core.loaded, status: m.core.status }
      : mod === "gearbox"
        ? { id: "gearbox", gear: m.gearbox.currentGear, loaded: m.gearbox.loaded, status: m.gearbox.status }
        : mod === "brakes"
          ? { id: "brakes", pedal: m.brakes.pedalPressure, discC: m.brakes.discTemperature, regen: m.brakes.regenLevel, status: m.brakes.status }
          : mod === "ignition"
            ? { id: "ignition", enabled: m.ignition.enabled, loaded: m.ignition.loaded, status: m.ignition.status }
            : mod === "battery"
              ? { id: "battery", levelPct: m.battery.level, voltageV: m.battery.voltage, tempC: m.battery.temperature, status: m.battery.status }
              : { id: "steering", angleDeg: m.steering.angle, status: m.steering.status };
  return JSON.stringify(payload);
}

function pushTest(
  snapshot: Omit<ModuleTestSnapshot, "timestamp" | "telemetryJson" | "systemStateJson" | "log">,
  log: string,
) {
  const full: ModuleTestSnapshot = {
    ...snapshot,
    log,
    timestamp: new Date().toISOString(),
    telemetryJson: moduleTelemetryJson(snapshot.moduleId),
    systemStateJson: systemStateJson(),
  };
  for (const l of testListeners) l(full);
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

type RunControl = { paused: boolean; stopped: boolean };
let currentRun: RunControl | null = null;

async function gate() {
  while (currentRun?.paused && !currentRun.stopped) await delay(80);
}
function shouldStop() { return !!currentRun?.stopped; }

export const mockBridge = {
  get(): KartTelemetry {
    return state;
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    l(state);
    return () => listeners.delete(l);
  },
  subscribeTest(l: TestListener): () => void {
    testListeners.add(l);
    return () => testListeners.delete(l);
  },
  reset() {
    state = structuredClone(INITIAL_TELEMETRY);
    state.vehicleState = "WAITING_FOR_MODULES";
    (Object.keys(lifecycle) as ModuleTestSnapshot["moduleId"][]).forEach((k) => (lifecycle[k] = "unloaded"));
    bootStartedAt = 0;
    emit();
  },
  loadModule(mod: "core" | "gearbox" | "brakes" | "ignition", on = true) {
    const m = { ...state.modules };
    if (mod === "core") m.core = { loaded: on, status: on ? "ok" : "missing" };
    if (mod === "gearbox")
      m.gearbox = { ...m.gearbox, loaded: on, status: on ? "ok" : "missing" };
    if (mod === "brakes")
      m.brakes = { ...m.brakes, loaded: on, status: on ? "ok" : "missing" };
    if (mod === "ignition")
      m.ignition = { ...m.ignition, loaded: on, status: on ? "ok" : "missing" };
    lifecycle[mod] = on ? "ready" : "unloaded";
    state = { ...state, modules: m };
    emit();
  },
  setIgnition(enabled: boolean) {
    state = {
      ...state,
      modules: { ...state.modules, ignition: { ...state.modules.ignition, enabled } },
    };
    emit();
  },
  setGear(g: Gear) {
    state = {
      ...state,
      modules: { ...state.modules, gearbox: { ...state.modules.gearbox, currentGear: g } },
    };
    emit();
  },
  setSteering(angleDeg: number) {
    state = {
      ...state,
      modules: { ...state.modules, steering: { ...state.modules.steering, angle: angleDeg } },
    };
    emit();
  },
  setBrakes(p: { pedalPressure?: number; discTemperature?: number; regenLevel?: number }) {
    state = {
      ...state,
      modules: { ...state.modules, brakes: { ...state.modules.brakes, ...p } },
    };
    emit();
  },
  setBattery(p: Partial<KartTelemetry["modules"]["battery"]>) {
    state = {
      ...state,
      modules: { ...state.modules, battery: { ...state.modules.battery, ...p } },
    };
    emit();
  },
  setSuspension(p: Partial<KartTelemetry["modules"]["suspension"]>) {
    state = {
      ...state,
      modules: { ...state.modules, suspension: { ...state.modules.suspension, ...p } },
    };
    emit();
  },
  setSpeed(kmh: number) {
    state = { ...state, speedKmh: kmh };
    emit();
  },
  ingest(next: KartTelemetry) {
    state = { ...next, timestamp: next.timestamp ?? new Date().toISOString() };
    state.vehicleState = next.vehicleState ?? deriveState(state);
    for (const l of listeners) l(state);
  },

  /**
   * Pause/resume/stop the active scenario (no-op if none active).
   */
  pauseScenario() { if (currentRun) currentRun.paused = true; },
  resumeScenario() { if (currentRun) currentRun.paused = false; },
  stopScenario() { if (currentRun) { currentRun.stopped = true; currentRun.paused = false; } },
  isScenarioActive() { return currentRun !== null; },

  /**
   * Deterministic isolated lifecycle: registered → initializing → ready → exercise → shutdown.
   * Emits a stream of ModuleTestSnapshot to subscribeTest() listeners.
   * @param opts.runs number of full lifecycle repetitions (default 1)
   */
  async runModuleScenario(
    mod: ModuleTestSnapshot["moduleId"],
    opts: { runs?: number } = {},
  ): Promise<void> {
    const runs = Math.max(1, Math.min(50, opts.runs ?? 1));
    currentRun = { paused: false, stopped: false };
    let tick = 0;

    const step = async (ms: number) => { await delay(ms); await gate(); };

    try {
      for (let run = 1; run <= runs; run++) {
        if (shouldStop()) break;
        // Reset bus per run
        (["core", "gearbox", "brakes", "ignition"] as const).forEach((k) => this.loadModule(k, false));
        (Object.keys(lifecycle) as ModuleTestSnapshot["moduleId"][]).forEach((k) => (lifecycle[k] = "unloaded"));
        bootStartedAt = Date.now();

        const phase = (p: ModuleLifecycle, log: string) => {
          lifecycle[mod] = p;
          pushTest({ moduleId: mod, phase: p, tick: tick++ }, `[run ${run}/${runs}] ${log}`);
        };

        phase("registered", `RegisterModule("${mod}", "1.0.0") → true`);
        await step(180); if (shouldStop()) break;
        phase("initializing", `Initialize() → BootCore/handshake`);
        await step(250); if (shouldStop()) break;

        if (mod !== "core") {
          this.loadModule("core", true);
          lifecycle.core = "ready";
          pushTest({ moduleId: mod, phase: "initializing", tick: tick++ }, `[bus] CORE ready (dep)`);
          await step(150);
        } else {
          this.loadModule("core", true);
        }
        if (shouldStop()) break;

        if (mod === "core") {
          phase("ready", "Heartbeat()=1");
          await step(150); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "Heartbeat()=2");
          await step(150); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "GetSystemState() ok");
        }
        if (mod === "gearbox") {
          this.loadModule("gearbox", true); this.setGear("N");
          phase("ready", `SetGear('N') ok`);
          await step(150); this.setGear("D"); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "IsShiftAllowed(N→D,0)=true");
          await step(150); this.setSpeed(8); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "speed=8 km/h · IsShiftAllowed(D→R,8)=false");
          await step(150); this.setGear("B"); this.setSpeed(0); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "SetGear('B') regen-brake");
        }
        if (mod === "brakes") {
          this.loadModule("brakes", true);
          this.setBrakes({ pedalPressure: 0, discTemperature: 30, regenLevel: 0.2 });
          phase("ready", "ApplyBrake(0.00)");
          await step(150); this.setBrakes({ pedalPressure: 0.4, discTemperature: 120 }); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "ApplyBrake(0.40) disc=120°C");
          await step(150); this.setBrakes({ pedalPressure: 0.9, discTemperature: 360 }); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "ApplyBrake(0.90) disc=360°C");
          await step(150); this.setBrakes({ discTemperature: 495 }); pushTest({ moduleId: mod, phase: "fault", tick: tick++ }, "disc>480°C → status=critical");
          lifecycle.brakes = "ready";
        }
        if (mod === "ignition") {
          this.loadModule("ignition", true);
          phase("ready", `InsertSafetyKey("RL-26A-PRIMARY")=true`);
          await step(150); this.setIgnition(true); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "PressStart()=true · enabled=true");
          await step(150); this.setIgnition(false); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "PressStop() · enabled=false");
        }
        if (mod === "battery") {
          this.setBattery({ level: 87, voltage: 51.2, temperature: 33, status: "ok" });
          phase("ready", "GetLevelPct()=87");
          await step(150); this.setBattery({ level: 64, temperature: 41 }); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "drain → 64% · 41°C");
          await step(150); this.setBattery({ level: 12, status: "warning" }); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "level<15% → status=warning");
        }
        if (mod === "steering") {
          phase("ready", "SetSteeringAngleDeg(0)");
          await step(150); this.setSteering(15); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "SetSteeringAngleDeg(15)");
          await step(150); this.setSteering(-30); pushTest({ moduleId: mod, phase: "ready", tick: tick++ }, "SetSteeringAngleDeg(-30) [limite ±35]");
        }
        if (shouldStop()) break;

        await step(200);
        phase("shutdown", `Shutdown() ok`);
      }
      if (shouldStop()) {
        pushTest({ moduleId: mod, phase: "shutdown", tick: tick++ }, `[STOP] cenário interrompido pelo operador`);
      }
    } finally {
      currentRun = null;
    }
  },
};
