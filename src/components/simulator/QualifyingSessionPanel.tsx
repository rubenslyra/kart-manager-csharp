import type { QualifyingSession } from "./raceStore";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const mil = Math.floor(ms % 1000);
  return `${m}:${sec.toString().padStart(2, "0")}.${mil.toString().padStart(3, "0")}`;
}

export function QualifyingSessionPanel({ session }: { session: QualifyingSession | null }) {
  if (!session || session.complete) return null;
  const active = session.entrants[session.entrantIndex];
  const playerLaps = session.lapsById.player ?? [];
  const activeLaps = session.lapsById[active.id] ?? [];
  const elapsed = performance.now() - session.stepStartedAt;
  const progress =
    session.step === "RUNNING"
      ? Math.min(100, (elapsed / 3600) * 100)
      : Math.min(100, (elapsed / 1500) * 100);
  const label =
    session.step === "RUNNING"
      ? `${active.name} na pista`
      : session.step === "PIT_RETURN"
        ? `${active.name} retornando ao Pit Box`
        : "Analise de telemetria";

  return (
    <div className="pointer-events-none absolute left-4 top-16 z-40 w-[360px] border border-primary/45 bg-background/82 p-4 font-mono shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-primary/25 pb-2">
        <div>
          <div className="text-[9px] uppercase tracking-[0.35em] text-primary">
            Classificacao alternada
          </div>
          <div className="mt-1 text-sm font-bold uppercase tracking-widest text-foreground">
            Rodada {session.roundIndex + 1}/3
          </div>
        </div>
        <div className="text-right text-[9px] uppercase tracking-widest text-muted-foreground">
          Tentativa {session.entrantIndex + 1}/{session.entrants.length}
        </div>
      </div>

      <div className="mb-3">
        <div className={active.isPlayer ? "text-primary" : "text-warning"}>{label}</div>
        <div className="mt-2 h-1.5 overflow-hidden bg-muted/40">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        {session.step !== "RUNNING" && activeLaps.length > 0 && (
          <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            Ultima volta:{" "}
            <span className="text-foreground">{fmt(activeLaps[activeLaps.length - 1])}</span>
          </div>
        )}
      </div>

      <div className="border border-border/60 bg-card/60 p-3">
        <div className="mb-2 text-[9px] uppercase tracking-[0.3em] text-primary">Box Rayssa</div>
        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-border/50 bg-background/45 p-2">
              <div className="text-muted-foreground">V{i + 1}</div>
              <div className="mt-1 text-foreground">
                {playerLaps[i] ? fmt(playerLaps[i]) : "--"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
