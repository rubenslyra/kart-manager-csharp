import type { RacePhase } from "./raceStore";

export function GridLoadingOverlay({ phase, progress }: { phase: RacePhase; progress: number }) {
  if (phase !== "GRID_LOADING") return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center overflow-hidden bg-background font-mono">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative flex w-[min(520px,80vw)] flex-col items-center">
        <svg viewBox="0 0 200 60" className="mb-8 h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="10" width="60" height="40" rx="6" fill="currentColor" className="text-primary" />
          <text x="50" y="37" textAnchor="middle" fill="hsl(var(--primary-foreground))"
            style={{ fontFamily: "system-ui, sans-serif", fontSize: "22px", fontWeight: 900, letterSpacing: "2px" }}>
            RL
          </text>
          <text x="95" y="37" fill="currentColor" className="text-foreground"
            style={{ fontFamily: "system-ui, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "3px" }}>
            KART
          </text>
          <text x="155" y="37" fill="currentColor" className="text-accent"
            style={{ fontFamily: "system-ui, sans-serif", fontSize: "11px", fontWeight: 800, letterSpacing: "1px" }}>
            26A
          </text>
        </svg>
        <div className="mb-3 text-[10px] uppercase tracking-[0.45em] text-primary">
          Carregando grid oficial
        </div>
        <div className="h-2 w-full overflow-hidden border border-primary/50 bg-background/70">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
