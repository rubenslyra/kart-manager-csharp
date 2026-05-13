import type { Telemetry } from "./types";
import { STATE_COLOR, STATE_LABEL } from "./types";

export function HUD3D({
  t,
  lap,
  devMode,
}: {
  t: Telemetry;
  lap?: { progress: number; count: number };
  devMode?: boolean;
}) {
  const color = STATE_COLOR[t.state];
  const isAlert = t.state === "WARNING" || t.state === "CRITICAL_FAILURE";

  return (
    <div className="pointer-events-none absolute inset-0 font-mono text-[10px] uppercase tracking-widest">
      {/* Top-left: state */}
      <div className="absolute left-4 top-4 min-w-[200px] border border-primary/40 bg-background/40 p-3 backdrop-blur-sm corner-cut">
        <div className="text-[9px] text-muted-foreground">RL:HUD · STATE</div>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          />
          <span className="font-display text-sm font-bold" style={{ color }}>
            {t.state}
          </span>
        </div>
        <div className="mt-0.5 text-[9px] text-muted-foreground normal-case">
          {STATE_LABEL[t.state]}
        </div>
        {devMode && (
          <div className="mt-1 text-[9px] text-accent">● DEV MODE</div>
        )}
        {lap && (
          <div className="mt-2">
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>LAP {lap.count}</span>
              <span>{Math.round(lap.progress * 100)}%</span>
            </div>
            <div className="mt-0.5 h-1 w-full overflow-hidden rounded-sm border border-border bg-card/40">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${lap.progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Top-right: speed */}
      <div className="absolute right-4 top-4 border border-primary/40 bg-background/40 p-3 text-right backdrop-blur-sm corner-cut">
        <div className="text-[9px] text-muted-foreground">SPEED</div>
        <div className="font-display text-2xl font-black text-primary text-glow leading-none">
          {t.speed.toFixed(0)}
        </div>
        <div className="text-[9px] text-muted-foreground">km/h · {t.gear}</div>
      </div>

      {/* Bottom-left: battery + ignition */}
      <div className="absolute bottom-4 left-4 min-w-[220px] border border-primary/40 bg-background/40 p-3 backdrop-blur-sm corner-cut">
        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
          <span>BATTERY</span>
          <span className="font-display text-foreground">{t.battery.toFixed(0)}%</span>
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-sm border border-border bg-card/40">
          <div
            className="h-full transition-all"
            style={{
              width: `${t.battery}%`,
              background:
                t.battery > 40 ? "var(--accent)" : t.battery > 15 ? "var(--warning)" : "var(--destructive)",
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[9px]">
          <span className="text-muted-foreground">IGN</span>
          <span style={{ color: t.ignition ? "var(--accent)" : "var(--muted-foreground)" }}>
            {t.ignition ? "● ON" : "○ OFF"}
          </span>
        </div>
      </div>

      {/* Bottom-right: alerts */}
      {isAlert && (
        <div
          className="absolute bottom-4 right-4 max-w-[260px] border bg-background/60 p-3 backdrop-blur-sm corner-cut animate-pulse"
          style={{ borderColor: color }}
        >
          <div className="text-[9px]" style={{ color }}>
            ▲ ALERT · {t.state}
          </div>
          {t.alerts.map((a) => (
            <div key={a} className="mt-1 text-[10px] normal-case" style={{ color }}>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Crosshair / blueprint reticle */}
      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 opacity-30">
        <div className="absolute left-1/2 top-0 h-full w-px bg-primary" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-primary" />
        <div className="absolute inset-2 rounded-full border border-primary" />
      </div>
    </div>
  );
}
