import { useRaceState, raceStore } from "./raceStore";
import { AI_PROFILES } from "./aiProfiles";

export function RaceSetup({ onStart }: { onStart: () => void }) {
  const s = useRaceState();
  if (!s.setupOpen) return null;
  const { setup } = s;
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md font-mono">
      <div className="corner-cut w-[420px] border border-primary/50 bg-card/80 p-6 shadow-elegant">
        <div className="mb-1 text-[10px] uppercase tracking-[0.4em] text-primary">Race Setup</div>
        <h3 className="mb-5 font-display text-xl font-black text-foreground">Configurar corrida</h3>

        <Field label={`Adversários (IA): ${setup.opponentCount}`}>
          <input type="range" min={0} max={6} step={1} value={setup.opponentCount}
            onChange={(e) => raceStore.setSetup({ opponentCount: parseInt(e.target.value) })}
            className="w-full accent-primary" />
        </Field>

        <Field label={`Voltas: ${setup.totalLaps}`}>
          <input type="range" min={1} max={8} step={1} value={setup.totalLaps}
            onChange={(e) => raceStore.setSetup({ totalLaps: parseInt(e.target.value) })}
            className="w-full accent-primary" />
        </Field>

        <Field label={`Agressividade: ${(setup.aggression * 100).toFixed(0)}%`}>
          <input type="range" min={0} max={1} step={0.05} value={setup.aggression}
            onChange={(e) => raceStore.setSetup({ aggression: parseFloat(e.target.value) })}
            className="w-full accent-primary" />
        </Field>

        <Field label={`Habilidade de frenagem: ${(setup.brakingSkill * 100).toFixed(0)}%`}>
          <input type="range" min={0} max={1} step={0.05} value={setup.brakingSkill}
            onChange={(e) => raceStore.setSetup({ brakingSkill: parseFloat(e.target.value) })}
            className="w-full accent-primary" />
        </Field>

        <Field label={`Habilidade de ultrapassagem: ${(setup.overtakeSkill * 100).toFixed(0)}%`}>
          <input type="range" min={0} max={1} step={0.05} value={setup.overtakeSkill}
            onChange={(e) => raceStore.setSetup({ overtakeSkill: parseFloat(e.target.value) })}
            className="w-full accent-primary" />
        </Field>

        <Field label={`Duração do replay: ${(setup.replayDurationMs / 1000).toFixed(0)}s`}>
          <input type="range" min={4} max={30} step={1} value={Math.round(setup.replayDurationMs / 1000)}
            onChange={(e) => raceStore.setSetup({ replayDurationMs: parseInt(e.target.value) * 1000 })}
            className="w-full accent-primary" />
        </Field>

        <button onClick={onStart}
          className="mt-4 w-full corner-cut border border-primary bg-primary/15 px-4 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary/25">
          Iniciar corrida
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

export function generateAIList(setup: { opponentCount: number; aggression: number; brakingSkill: number; overtakeSkill: number }) {
  const list: { id: string; name: string; color: string; startOffset: number; baseSpeed: number; aggression: number; brakingSkill: number; overtakeSkill: number }[] = [];
  for (let i = 0; i < setup.opponentCount; i++) {
    const profile = AI_PROFILES[i % AI_PROFILES.length];
    list.push({
      id: `ai-${i + 1}`,
      name: profile.name,
      color: profile.color,
      startOffset: (0.94 - i * 0.015) % 1,
      baseSpeed: 16 + setup.aggression * 6 * profile.aggressionMul + profile.speedBias,
      aggression: Math.min(1, setup.aggression * profile.aggressionMul),
      brakingSkill: Math.min(1, setup.brakingSkill * profile.brakingMul),
      overtakeSkill: Math.min(1, setup.overtakeSkill * profile.overtakeMul),
    });
  }
  return list;
}

export const AI_NAME_POOL = AI_PROFILES.map((p) => p.name);
