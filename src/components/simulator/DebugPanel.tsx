import type { DebugStats } from "./KartRig";
import { usePerf, perfStore } from "./perfStore";

interface Props {
  stats: DebugStats | null;
}

export function DebugPanel({ stats }: Props) {
  const perf = usePerf();
  if (!stats) return null;
  const log = perf.groundedLog.slice(-6).reverse();
  const maxes = Object.entries(perf.maxSpeedById).slice(0, 6);
  return (
    <div
      className="pointer-events-auto absolute right-3 bottom-3 z-50 corner-cut border border-primary/60 bg-background/75 p-2 font-mono text-[9px] text-primary backdrop-blur-sm"
      style={{ transform: "scale(0.85)", transformOrigin: "bottom right", width: 240 }}
    >
      <div className="mb-1 flex items-center justify-between border-b border-primary/30 pb-0.5 font-bold uppercase tracking-widest">
        <span>Dev · Kart Stats</span>
        <button
          onClick={() => perfStore.clearLog()}
          className="text-muted-foreground hover:text-destructive"
          title="Limpar log"
        >
          ✕
        </button>
      </div>
      <div className="space-y-0.5 text-muted-foreground">
        <div>VEL: <span className="text-foreground">{stats.speed.toFixed(1)} km/h</span></div>
        <div>FOV: <span className="text-foreground">{stats.fov.toFixed(1)}°</span></div>
        <div>ROT Y: <span className="text-foreground">{stats.rotationY.toFixed(2)} rad ({((stats.rotationY * 180) / Math.PI).toFixed(0)}°)</span></div>
        <div>POS: <span className="text-foreground">X {stats.pos.x.toFixed(1)} · Z {stats.pos.z.toFixed(1)}</span></div>
        <div>GEAR: <span className="text-foreground">{stats.gear}</span></div>
        <div>GROUNDED: <span className={stats.grounded ? "text-primary" : "text-destructive"}>{stats.grounded ? "OK" : "FORA"}</span></div>
      </div>

      <div className="mt-1.5 border-t border-primary/20 pt-1">
        <div className="mb-0.5 uppercase tracking-widest text-primary/80">Max Speed</div>
        {maxes.length === 0 && <div className="text-muted-foreground/60">—</div>}
        {maxes.map(([id, v]) => (
          <div key={id} className="flex justify-between text-muted-foreground">
            <span>{id}</span>
            <span className="text-foreground">{v.toFixed(1)} km/h</span>
          </div>
        ))}
      </div>

      <div className="mt-1.5 border-t border-primary/20 pt-1">
        <div className="mb-0.5 uppercase tracking-widest text-primary/80">Grounded Log</div>
        {log.length === 0 && <div className="text-muted-foreground/60">—</div>}
        {log.map((e, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span className="text-muted-foreground/80">{(e.t / 1000).toFixed(1)}s</span>
            <span className="text-muted-foreground">{e.id}</span>
            <span className={e.grounded ? "text-primary" : "text-destructive"}>
              {e.grounded ? "ON-TRACK" : "OFF-TRACK"}
            </span>
            <span className="text-foreground">{e.speedKmh.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
