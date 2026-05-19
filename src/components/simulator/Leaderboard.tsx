import { useRaceState, rankedRacers, raceStore } from "./raceStore";
import { exportCSV, exportJSON, telemetry } from "./telemetry";
import { replayRecordStore } from "./replayRecordStore";
import {
  getTeamRole,
  nextUnlockLabel,
  roleLabel,
  useEngineeringProgress,
} from "./engineeringProgressStore";

function fmt(ms: number | null) {
  if (ms === null) return "--:--.---";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const mil = Math.floor(ms % 1000);
  return `${m}:${sec.toString().padStart(2, "0")}.${mil.toString().padStart(3, "0")}`;
}

export function Leaderboard() {
  const state = useRaceState();
  const ranked = rankedRacers(state);
  if (ranked.length === 0) return null;
  return (
    <div className="pointer-events-none absolute right-3 bottom-3 z-40 w-[260px] corner-cut border border-primary/40 bg-background/80 p-3 font-mono text-[10px] backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between border-b border-primary/30 pb-1 uppercase tracking-widest">
        <span className="text-primary">Leaderboard</span>
        <span className="text-muted-foreground">Lap {state.totalLaps}x</span>
      </div>
      <div className="space-y-1">
        {ranked.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-sm border px-2 py-1"
            style={{
              borderColor: r.isPlayer ? "var(--primary)" : "var(--border)",
              background: r.isPlayer
                ? "color-mix(in oklab, var(--primary) 12%, transparent)"
                : "transparent",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-4 text-foreground">{i + 1}</span>
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
              <span className={r.isPlayer ? "text-primary" : "text-foreground"}>{r.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>L{r.lap}</span>
              <span className="text-foreground">{fmt(r.bestLapMs)}</span>
              {r.penaltyMs > 0 && (
                <span className="text-destructive" title="Penalidade">
                  +{(r.penaltyMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Podium({ onRestart }: { onRestart: () => void }) {
  const state = useRaceState();
  const engineering = useEngineeringProgress();
  if (!state.finished) return null;
  const ranked = rankedRacers(state).slice(0, 3);
  const order = [ranked[1], ranked[0], ranked[2]].filter(Boolean);
  const heights = [120, 170, 90];
  const role = getTeamRole(engineering.rayssaWins);
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md font-mono">
      <div className="mb-2 text-[10px] uppercase tracking-[0.4em] text-primary">Race Complete</div>
      <h2 className="mb-8 font-display text-3xl font-black text-foreground text-glow">PÓDIO</h2>
      <div className="flex items-end gap-4">
        {order.map((r, idx) => {
          const place = idx === 0 ? 2 : idx === 1 ? 1 : 3;
          return (
            <div key={r.id} className="flex w-32 flex-col items-center">
              <div className="mb-2 text-center">
                <div
                  className="h-3 w-3 mx-auto rounded-full"
                  style={{ background: r.color, boxShadow: `0 0 12px ${r.color}` }}
                />
                <div className="mt-1 text-xs text-foreground">{r.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  Best {r.bestLapMs ? (r.bestLapMs / 1000).toFixed(2) : "--"}s
                </div>
              </div>
              <div
                className="w-full corner-cut border border-primary/50 bg-card/60 flex items-start justify-center pt-2 font-display text-2xl font-black text-primary"
                style={{ height: heights[idx] }}
              >
                {place}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={onRestart}
          className="corner-cut border border-primary bg-primary/10 px-6 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary/20"
        >
          Reiniciar corrida
        </button>
        {replayRecordStore.getRecord() && (
          <button
            onClick={() => raceStore.startReplayPlayback()}
            className="corner-cut border border-primary/70 bg-primary/5 px-4 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary/15"
          >
            ▶ Assistir replay
          </button>
        )}
        <button
          onClick={() => {
            telemetry.stop();
            exportCSV();
          }}
          className="corner-cut border border-accent bg-accent/10 px-4 py-2 text-xs uppercase tracking-widest text-accent hover:bg-accent/20"
        >
          Export CSV
        </button>
        <button
          onClick={() => {
            telemetry.stop();
            exportJSON();
          }}
          className="corner-cut border border-accent bg-accent/10 px-4 py-2 text-xs uppercase tracking-widest text-accent hover:bg-accent/20"
        >
          Export JSON
        </button>
      </div>
      <div className="mt-4 border border-primary/40 bg-primary/10 px-4 py-2 text-center text-[10px] uppercase tracking-widest text-primary">
        Equipe: {roleLabel(role)} · Rayssa P1: {engineering.rayssaWins} ·{" "}
        {nextUnlockLabel(engineering.rayssaWins)}
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        {telemetry.count()} amostras gravadas
      </div>
    </div>
  );
}
