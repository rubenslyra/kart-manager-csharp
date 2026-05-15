import { mockBridge } from "@/bridge/mockExternalData";
import type { ConnectionStatus, DataSource, KartTelemetry } from "@/bridge/types";
import { buildChecklist, canLeavePit } from "@/bridge/moduleValidator";
import type { SceneFocusTarget } from "./CameraController";
import type { EngineTestState } from "./engineTest";
import type { FocusTarget } from "./RealKart";

interface Props {
  telemetry: KartTelemetry;
  source: DataSource;
  setSource: (s: DataSource) => void;
  connection: ConnectionStatus;
  wsUrl: string;
  setWsUrl: (s: string) => void;
  lastRaw: string | null;
  focus: FocusTarget;
  setFocus: (f: FocusTarget) => void;
  sceneFocus: SceneFocusTarget;
  setSceneFocus: (f: SceneFocusTarget) => void;
  onRelease: () => void;
  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
  xray: boolean;
  setXray: (v: boolean) => void;
  showWiring: boolean;
  setShowWiring: (v: boolean) => void;
  engineTest: EngineTestState;
  setEngineRunning: (v: boolean) => void;
  setEngineThrottle: (v: number) => void;
  toggleEngineAudio: () => void;
  presentationAudioEnabled: boolean;
  playPresentationAudio: () => void;
}

const stateColor: Record<KartTelemetry["vehicleState"], string> = {
  OFF: "text-muted-foreground",
  WAITING_FOR_MODULES: "text-warning",
  CORE_READY: "text-primary",
  GEARBOX_READY: "text-primary",
  BRAKES_READY: "text-primary",
  IGNITION_READY: "text-primary",
  READY_TO_DRIVE: "text-success",
  DRIVING: "text-success",
  WARNING: "text-warning",
  CRITICAL_FAILURE: "text-destructive",
  SHUTDOWN: "text-muted-foreground",
};

export function RealSimUI({
  telemetry,
  source,
  setSource,
  connection,
  wsUrl,
  setWsUrl,
  lastRaw,
  focus,
  setFocus,
  sceneFocus,
  setSceneFocus,
  onRelease,
  showLabels,
  setShowLabels,
  xray,
  setXray,
  showWiring,
  setShowWiring,
  engineTest,
  setEngineRunning,
  setEngineThrottle,
  toggleEngineAudio,
  presentationAudioEnabled,
  playPresentationAudio,
}: Props) {
  const m = telemetry.modules;
  const checklist = buildChecklist(telemetry);
  const releasable = canLeavePit(telemetry);

  return (
    <>
      {/* Top bar */}
      <div className="pointer-events-auto absolute left-3 top-3 z-30 flex flex-wrap items-center gap-2">
        <div className="corner-cut border border-primary/40 bg-background/80 px-3 py-2 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm">
          <span className="text-muted-foreground">Estado:</span>{" "}
          <span className={`font-bold ${stateColor[telemetry.vehicleState]}`}>{telemetry.vehicleState}</span>
        </div>
        <div className="corner-cut flex gap-1 border border-border bg-background/80 p-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm">
          <button
            className={`px-2 py-1 ${source === "mock" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            onClick={() => setSource("mock")}
          >
            Mock
          </button>
          <button
            className={`px-2 py-1 ${source === "real" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            onClick={() => setSource("real")}
          >
            Real (C#)
          </button>
        </div>
        {source === "real" && (
          <div className="corner-cut border border-border bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm">
            <span className="text-muted-foreground">WS:</span>{" "}
            <input
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              className="w-56 bg-transparent text-foreground outline-none"
            />{" "}
            <span
              className={
                connection === "connected"
                  ? "text-success"
                  : connection === "connecting"
                    ? "text-warning"
                    : "text-destructive"
              }
            >
              ● {connection}
            </span>
          </div>
        )}
        {source === "real" && connection !== "connected" && (
          <div className="corner-cut border border-warning/60 bg-warning/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-warning backdrop-blur-sm">
            Aguardando Console C#…
          </div>
        )}
      </div>

      {/* Focus chips */}
      <div className="pointer-events-auto absolute left-1/2 top-3 z-30 flex -translate-x-1/2 flex-wrap justify-center gap-1">
        {(["battery", "brakes", "steering", "ignition", "gearbox"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setSceneFocus(null);
              setFocus(focus === f ? null : f);
            }}
            className={`corner-cut border px-2 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm ${
              focus === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/80 text-muted-foreground hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => {
            setFocus(null);
            setSceneFocus(sceneFocus === "acousticRoom" ? null : "acousticRoom");
          }}
          className={`corner-cut border px-2 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm ${
            sceneFocus === "acousticRoom"
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-background/80 text-muted-foreground hover:text-accent"
          }`}
        >
          Sala Acustica
        </button>
        {(focus || sceneFocus) && (
          <button
            onClick={() => {
              setFocus(null);
              setSceneFocus(null);
            }}
            className="corner-cut border border-border bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
          >
            ← reset
          </button>
        )}
      </div>

      {/* Audit/view toggles */}
      <div className="pointer-events-auto absolute left-1/2 top-12 z-30 flex -translate-x-1/2 gap-1">
        {(
          [
            ["Labels", showLabels, setShowLabels],
            ["Cabos", showWiring, setShowWiring],
            ["Raio-X", xray, setXray],
          ] as const
        ).map(([label, val, set]) => (
          <button
            key={label}
            onClick={() => set(!val)}
            className={`corner-cut border px-2 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm ${
              val
                ? "border-accent bg-accent/20 text-accent"
                : "border-border bg-background/80 text-muted-foreground hover:text-accent"
            }`}
          >
            {val ? "✓ " : ""}
            {label}
          </button>
        ))}
      </div>
      {/* Telemetry panel */}
      <div className="pointer-events-auto absolute right-3 top-3 z-30 w-72 corner-cut border border-primary/40 bg-background/85 p-3 font-mono text-[10px] backdrop-blur-sm">
        <div className="mb-2 text-[9px] uppercase tracking-widest text-primary">Telemetria Técnica</div>
        <Row k="Velocidade" v={`${(telemetry.speedKmh ?? 0).toFixed(1)} km/h`} />
        <Row k="Marcha" v={m.gearbox.currentGear} />
        <Row k="Bateria" v={`${m.battery.level.toFixed(0)}%  ${m.battery.voltage.toFixed(1)}V`} tone={m.battery.status} />
        <Row k="Temp. Bateria" v={`${m.battery.temperature.toFixed(0)} °C`} />
        <Row k="Freio (pedal)" v={`${(m.brakes.pedalPressure * 100).toFixed(0)}%`} />
        <Row k="Disco freio" v={`${m.brakes.discTemperature.toFixed(0)} °C`} />
        <Row k="Regen" v={`${(m.brakes.regenLevel * 100).toFixed(0)}%`} />
        <Row k="Direção" v={`${m.steering.angle.toFixed(1)}°`} />
        <Row k="Ignição" v={m.ignition.enabled ? "ON" : "OFF"} tone={m.ignition.enabled ? "ok" : undefined} />
        <Row
          k="Módulos"
          v={
            ["core", "gearbox", "brakes", "ignition"]
              .filter((k) => (m as Record<string, { loaded?: boolean }>)[k].loaded)
              .join(",") || "—"
          }
        />
        <Row k="Conexão C#" v={connection} />
        <details className="mt-2">
          <summary className="cursor-pointer text-muted-foreground">Último JSON</summary>
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all border border-border bg-background/60 p-1 text-[9px] text-muted-foreground">
            {lastRaw ?? JSON.stringify(telemetry, null, 2)}
          </pre>
        </details>
      </div>

      {/* Wankel bench controls */}
      <div className="pointer-events-auto absolute left-3 top-24 z-30 w-80 corner-cut border border-accent/50 bg-background/85 p-3 font-mono text-[10px] backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-[9px] uppercase tracking-widest text-accent">Teste Motor Wankel</div>
          <span className={engineTest.running ? "text-success" : "text-muted-foreground"}>
            {engineTest.running ? "RODANDO" : "STANDBY"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setEngineRunning(!engineTest.running)}
            className={`corner-cut px-2 py-1 uppercase tracking-widest ${
              engineTest.running
                ? "bg-warning text-background"
                : "border border-border text-muted-foreground hover:text-accent"
            }`}
          >
            {engineTest.running ? "Parar teste" : "Ligar bancada"}
          </button>
          <button
            onClick={toggleEngineAudio}
            className={`corner-cut px-2 py-1 uppercase tracking-widest ${
              engineTest.audioEnabled
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground hover:text-accent"
            }`}
          >
            Audio {engineTest.audioEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <label className="mt-2 block text-muted-foreground">
          Aceleracao ({(engineTest.throttle * 100).toFixed(0)}%)
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={engineTest.throttle}
            onChange={(e) => setEngineThrottle(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          <Row k="RPM" v={engineTest.running ? engineTest.rpm.toFixed(0) : "0"} tone={engineTest.running ? "ok" : undefined} />
          <Row k="Saude" v={`${engineTest.health.toFixed(0)}%`} tone={engineTest.health < 70 ? "warning" : "ok"} />
          <Row k="Temp." v={`${engineTest.temperature.toFixed(0)} °C`} tone={engineTest.temperature > 95 ? "warning" : undefined} />
          <Row k="Carga" v={`${(engineTest.load * 100).toFixed(0)}%`} />
        </div>
      </div>

      {/* Checklist */}
      <div className="pointer-events-auto absolute right-3 bottom-3 z-30 w-72 corner-cut border border-primary/40 bg-background/85 p-3 font-mono text-[10px] backdrop-blur-sm">
        <div className="mb-2 text-[9px] uppercase tracking-widest text-primary">Checklist de Saída</div>
        <ul className="space-y-1">
          {checklist.map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <span className="text-muted-foreground">{c.label}</span>
              <span className={c.ok ? "text-success" : "text-destructive"}>{c.ok ? "OK" : "✕"}</span>
            </li>
          ))}
        </ul>
        <button
          disabled={!releasable}
          onClick={onRelease}
          className={`mt-3 w-full corner-cut px-3 py-2 text-[10px] uppercase tracking-widest ${
            releasable
              ? "bg-success text-background hover:opacity-90"
              : "border border-border bg-background/40 text-muted-foreground"
          }`}
        >
          Liberar para pista
        </button>
        <button
          disabled={!releasable || !presentationAudioEnabled}
          onClick={playPresentationAudio}
          className={`mt-2 w-full corner-cut px-3 py-2 text-[10px] uppercase tracking-widest ${
            releasable && presentationAudioEnabled
              ? "border border-accent/70 bg-accent/10 text-accent hover:bg-accent/20"
              : "border border-border bg-background/40 text-muted-foreground"
          }`}
        >
          Apresentar carrinho
        </button>
      </div>

      {/* Mock controls */}
      {source === "mock" && (
        <div className="pointer-events-auto absolute left-3 bottom-3 z-30 w-80 corner-cut border border-border bg-background/85 p-3 font-mono text-[10px] backdrop-blur-sm">
          <div className="mb-2 text-[9px] uppercase tracking-widest text-primary">Mock DLLs</div>
          <div className="grid grid-cols-2 gap-1">
            {(["core", "gearbox", "brakes", "ignition"] as const).map((k) => {
              const loaded = (m as Record<string, { loaded?: boolean }>)[k].loaded;
              return (
                <button
                  key={k}
                  onClick={() => mockBridge.loadModule(k, !loaded)}
                  className={`corner-cut px-2 py-1 uppercase tracking-widest ${
                    loaded ? "bg-success text-background" : "border border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  {loaded ? "✓ " : ""}
                  Carregar {k}
                </button>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button
              onClick={() => mockBridge.setIgnition(!m.ignition.enabled)}
              className="corner-cut border border-border px-2 py-1 uppercase tracking-widest text-muted-foreground hover:text-primary"
            >
              Ignição: {m.ignition.enabled ? "ON" : "OFF"}
            </button>
            <button
              onClick={() =>
                mockBridge.setGear(
                  ((["P", "R", "N", "D", "B"] as const)[
                    (["P", "R", "N", "D", "B"].indexOf(m.gearbox.currentGear) + 1) % 5
                  ]),
                )
              }
              className="corner-cut border border-border px-2 py-1 uppercase tracking-widest text-muted-foreground hover:text-primary"
            >
              Marcha: {m.gearbox.currentGear}
            </button>
          </div>
          <label className="mt-2 block">
            Direção ({m.steering.angle.toFixed(0)}°)
            <input
              type="range"
              min={-35}
              max={35}
              value={m.steering.angle}
              onChange={(e) => mockBridge.setSteering(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block">
            Freio (pedal)
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={m.brakes.pedalPressure}
              onChange={(e) =>
                mockBridge.setBrakes({
                  pedalPressure: Number(e.target.value),
                  discTemperature: 30 + Number(e.target.value) * 320,
                })
              }
              className="w-full"
            />
          </label>
          <label className="block">
            Bateria ({m.battery.level.toFixed(0)}%)
            <input
              type="range"
              min={0}
              max={100}
              value={m.battery.level}
              onChange={(e) => {
                const v = Number(e.target.value);
                mockBridge.setBattery({
                  level: v,
                  status: v < 10 ? "critical" : v < 20 ? "warning" : "ok",
                });
              }}
              className="w-full"
            />
          </label>
          <button
            onClick={() => mockBridge.reset()}
            className="mt-2 w-full corner-cut border border-destructive/60 px-2 py-1 uppercase tracking-widest text-destructive hover:bg-destructive/10"
          >
            Reset
          </button>
        </div>
      )}
    </>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  const cls =
    tone === "ok"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "critical"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-bold ${cls}`}>{v}</span>
    </div>
  );
}
