import { useEffect, useMemo, useState } from "react";
import { raceStore, type RacePhase } from "./raceStore";

const COUNTDOWN_MS = 3600;

export function StartLightsOverlay({
  phase,
  startedAt,
  onStartSound,
}: {
  phase: RacePhase;
  startedAt: number | null;
  onStartSound: () => void;
}) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (phase !== "GRID_COUNTDOWN") return;
    const id = window.setInterval(() => setNow(performance.now()), 80);
    return () => window.clearInterval(id);
  }, [phase]);
  const elapsed = startedAt ? now - startedAt : 0;
  const step = Math.min(3, Math.floor(elapsed / 900));
  const label = useMemo(() => {
    if (step === 0) return "3";
    if (step === 1) return "2";
    if (step === 2) return "1";
    return "START";
  }, [step]);

  useEffect(() => {
    if (phase !== "GRID_COUNTDOWN" || !startedAt) return;
    onStartSound();
    const id = window.setTimeout(() => raceStore.startRace(), COUNTDOWN_MS);
    return () => window.clearTimeout(id);
  }, [onStartSound, phase, startedAt]);

  if (phase !== "GRID_COUNTDOWN") return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-background/25 font-mono backdrop-blur-[1px]">
      <div className="border border-primary/60 bg-background/80 px-8 py-6 text-center shadow-2xl">
        <div className="mb-4 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-10 w-10 rounded-full border border-border"
              style={{
                background: i <= step ? "var(--destructive)" : "var(--muted)",
                boxShadow: i <= step ? "0 0 22px var(--destructive)" : "none",
              }}
            />
          ))}
        </div>
        <div className="font-display text-5xl font-black text-primary text-glow">{label}</div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
          largada autorizada pela direcao de prova
        </div>
      </div>
    </div>
  );
}
