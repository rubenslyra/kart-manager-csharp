import type { PitServiceState } from "./raceStore";
import { useEffect, useState } from "react";

export function PitServiceOverlay({ service }: { service: PitServiceState }) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!service.active) return;
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, [service.active]);
  if (!service.active) return null;
  const elapsed = now - service.startedAt;
  const pct = Math.min(1, elapsed / service.durationMs);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-36 z-40 flex justify-center font-mono">
      <div className="w-[360px] border border-warning bg-background/80 p-3 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest">
          <span className="text-warning">Pit Service</span>
          <span className="text-muted-foreground">
            {Math.ceil((service.durationMs - elapsed) / 1000)}s
          </span>
        </div>
        <div className="h-2 border border-warning/40 bg-warning/10">
          <div className="h-full bg-warning" style={{ width: `${pct * 100}%` }} />
        </div>
        <div className="mt-2 text-[9px] uppercase tracking-widest text-muted-foreground">
          manutencao rapida no pit lane · checagem de pneus, freio e bateria
        </div>
      </div>
    </div>
  );
}
