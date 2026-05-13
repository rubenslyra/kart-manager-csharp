import type { Gear, Module, Telemetry } from "./types";
import { STATE_COLOR, STATE_LABEL } from "./types";

interface Props {
  t: Telemetry;
}

const GEARS: Gear[] = ["P", "R", "N", "D", "B"];
const ALL_MODULES: Module[] = ["CORE", "GEARBOX", "BRAKES", "IGNITION"];

export function TelemetryPanel({ t }: Props) {
  const color = STATE_COLOR[t.state];
  const battColor =
    t.battery > 40 ? "var(--accent)" : t.battery > 15 ? "var(--warning)" : "var(--destructive)";

  return (
    <aside className="panel corner-cut p-5 font-mono text-xs">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-muted-foreground uppercase tracking-widest">Telemetria</span>
        <span
          className="led h-2 w-2 rounded-full"
          style={{ backgroundColor: color, color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Estado</div>
        <div className="mt-1 font-display text-base font-bold leading-tight" style={{ color }}>
          {t.state}
        </div>
        <div className="text-[10px] text-muted-foreground">{STATE_LABEL[t.state]}</div>
      </div>

      {/* Battery bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Bateria</span>
          <span className="font-display text-foreground">{t.battery.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-sm border border-border bg-card/40">
          <div
            className="h-full transition-all"
            style={{ width: `${t.battery}%`, background: battColor, boxShadow: `0 0 6px ${battColor}` }}
          />
        </div>
      </div>

      {/* Speed */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Velocidade</div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-black text-primary text-glow">
            {t.speed.toFixed(0)}
          </span>
          <span className="text-[10px] uppercase text-muted-foreground">km/h</span>
        </div>
      </div>

      {/* Gear selector */}
      <div className="mb-4">
        <div className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Marcha</div>
        <div className="flex gap-1">
          {GEARS.map((g) => {
            const active = t.gear === g;
            return (
              <div
                key={g}
                className="flex h-7 flex-1 items-center justify-center rounded-sm border font-display text-xs font-bold transition-all"
                style={{
                  borderColor: active ? color : "var(--border)",
                  background: active ? `${color}22` : "transparent",
                  color: active ? color : "var(--muted-foreground)",
                  boxShadow: active ? `0 0 8px ${color}66` : "none",
                }}
              >
                {g}
              </div>
            );
          })}
        </div>
      </div>

      {/* Brake bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Freio</span>
          <span className="font-display text-foreground">{t.brake.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-sm border border-border bg-card/40">
          <div
            className="h-full bg-destructive transition-all"
            style={{ width: `${t.brake}%` }}
          />
        </div>
      </div>

      {/* Ignition */}
      <div className="mb-4 flex items-center justify-between rounded border border-border bg-card/40 px-3 py-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Ignição</span>
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: t.ignition ? "var(--accent)" : "var(--muted-foreground)",
              boxShadow: t.ignition ? "0 0 8px var(--accent)" : "none",
            }}
          />
          <span
            className="font-display text-xs font-bold"
            style={{ color: t.ignition ? "var(--accent)" : "var(--muted-foreground)" }}
          >
            {t.ignition ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* Modules */}
      <div>
        <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          Módulos · DLLs
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALL_MODULES.map((m) => {
            const on = t.modules.includes(m);
            return (
              <div
                key={m}
                className="flex items-center gap-2 rounded border border-border bg-card/40 px-2 py-1.5 transition-all"
                style={on ? { borderColor: "var(--accent)" } : undefined}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: on ? "var(--accent)" : "var(--muted-foreground)",
                    boxShadow: on ? "0 0 8px var(--accent)" : "none",
                  }}
                />
                <span className={on ? "text-foreground" : "text-muted-foreground"}>{m}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {t.alerts.length > 0 && (
        <div className="mt-4 rounded border border-warning/60 bg-warning/10 p-2">
          <div className="mb-1 text-[10px] uppercase tracking-widest text-warning">Alertas</div>
          {t.alerts.map((a) => (
            <div key={a} className="text-[11px] text-warning">
              ▲ {a}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
