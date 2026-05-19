import type { RacePhase } from "./raceStore";

export function GridLoadingOverlay({ phase, progress }: { phase: RacePhase; progress: number }) {
  if (phase !== "GRID_LOADING") return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center overflow-hidden bg-background font-mono">
      <img
        src="/image_1030ed13.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative flex w-[min(520px,80vw)] flex-col items-center">
        <img src="/logo_kart_A26.png" alt="Kart A26" className="mb-8 h-28 w-28 object-contain" />
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
