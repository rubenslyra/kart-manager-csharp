import type { QualifyingResult, RacePhase } from "./raceStore";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const mil = Math.floor(ms % 1000);
  return `${m}:${sec.toString().padStart(2, "0")}.${mil.toString().padStart(3, "0")}`;
}

export function QualifyingPanel({
  phase,
  results,
  onGrid,
}: {
  phase: RacePhase;
  results: QualifyingResult[];
  onGrid: () => void;
}) {
  if (phase !== "QUALIFYING_COMPLETE" || results.length === 0) return null;
  const alphabetic = [...results].sort((a, b) => a.name.localeCompare(b.name));
  const positionById = new Map(results.map((r) => [r.id, r.gridPosition]));
  return (
    <div className="pointer-events-auto absolute inset-x-4 top-10 z-50 mx-auto max-w-5xl border border-primary/50 bg-background/90 p-4 font-mono shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-start justify-between gap-4 border-b border-primary/30 pb-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-primary">Classificacao</div>
          <h3 className="font-display text-xl font-black text-foreground">
            Apuracao das tres voltas alternadas
          </h3>
        </div>
        <button
          onClick={onGrid}
          className="corner-cut border border-primary bg-primary/15 px-4 py-2 text-[10px] uppercase tracking-widest text-primary hover:bg-primary/25"
        >
          Ir para grid
        </button>
      </div>

      <div className="overflow-hidden border border-border/60">
        <div className="grid grid-cols-[1.4fr_repeat(3,1fr)_1fr_92px] bg-primary/10 px-3 py-2 text-[9px] uppercase tracking-widest text-primary">
          <span>Competidor</span>
          <span>Volta 1</span>
          <span>Volta 2</span>
          <span>Volta 3</span>
          <span>Total</span>
          <span>Grid</span>
        </div>
        {alphabetic.map((r, row) => (
          <div
            key={r.id}
            className="grid grid-cols-[1.4fr_repeat(3,1fr)_1fr_92px] items-center border-t border-border/50 bg-card/60 px-3 py-2 text-[10px] uppercase tracking-widest"
          >
            <span className={r.isPlayer ? "text-primary" : "text-foreground"}>{r.name}</span>
            {r.laps.map((lap, i) => (
              <span key={i} className="relative text-muted-foreground">
                {fmt(lap)}
                <span
                  className="absolute left-0 right-2 top-1/2 h-0.5 origin-left animate-[qualy-strike_420ms_ease-out_forwards] bg-destructive"
                  style={{ animationDelay: `${row * 160 + i * 120}ms`, transform: "scaleX(0)" }}
                />
              </span>
            ))}
            <span
              className="animate-[qualy-reveal_360ms_ease-out_forwards] text-foreground opacity-0"
              style={{ animationDelay: `${900 + row * 130}ms` }}
            >
              {fmt(r.totalMs)}
            </span>
            <span
              className={
                positionById.get(r.id) === 1
                  ? "animate-[qualy-reveal_360ms_ease-out_forwards] text-warning opacity-0"
                  : "animate-[qualy-reveal_360ms_ease-out_forwards] text-primary opacity-0"
              }
              style={{ animationDelay: `${1050 + row * 130}ms` }}
            >
              {positionById.get(r.id) === 1 ? "POLE" : `P${positionById.get(r.id)}`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-1">
        {results.map((r) => (
          <div
            key={`rank-${r.id}`}
            className="grid grid-cols-[58px_1fr_110px] items-center gap-3 border border-border/60 bg-background/55 px-3 py-2 text-[10px] uppercase tracking-widest"
          >
            <span className={r.pole ? "text-warning" : "text-primary"}>
              {r.pole ? "POLE" : `P${r.gridPosition}`}
            </span>
            <span className={r.isPlayer ? "text-primary" : "text-foreground"}>{r.name}</span>
            <span className="text-foreground">{fmt(r.totalMs)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
