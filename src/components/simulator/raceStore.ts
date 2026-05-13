import { useSyncExternalStore } from "react";
import { replayRecordStore } from "./replayRecordStore";

export interface RacerEntry {
  id: string;
  name: string;
  color: string;
  isPlayer: boolean;
  lap: number;
  progress: number;
  bestLapMs: number | null;
  lastLapMs: number | null;
  lapStartedAt: number;
  totalDist: number;
  finished: boolean;
  finishTime: number | null;
  penaltyMs: number;
  pose: { x: number; z: number; rotY: number };
}

export interface RaceSetup {
  opponentCount: number; // 0..6
  aggression: number; // 0..1
  brakingSkill: number; // 0..1 — higher = brakes earlier/safer
  overtakeSkill: number; // 0..1 — higher = more frequent lane changes
  totalLaps: number;
  replayDurationMs: number; // duração do replay cinematográfico antes do pódio
}

export interface RaceState {
  racers: Record<string, RacerEntry>;
  totalLaps: number;
  startedAt: number;
  finished: boolean;
  timeScale: number;
  slowMoUntil: number;
  setup: RaceSetup;
  setupOpen: boolean;
  lastImpact: { at: number; penaltyMs: number } | null;
  lastCheckpoint: { idx: number; total: number; isLapClose: boolean; at: number } | null;
  // Replay cinematográfico
  replayPhase: 0 | 1 | 2; // TV / Orbital / Helicóptero
  replayRunNonce: number; // bump → ReplayCameras reinicia o ciclo
  playbackActive: boolean; // assistir o replay gravado novamente
  playbackStartedAt: number;
  playbackSpeed: number; // 0.5 / 1 / 1.5 — afeta replay cinematográfico e playback
}

const defaultSetup: RaceSetup = {
  opponentCount: 3,
  aggression: 0.6,
  brakingSkill: 0.5,
  overtakeSkill: 0.5,
  totalLaps: 3,
  replayDurationMs: 12000,
};

const initial: RaceState = {
  racers: {},
  totalLaps: 3,
  startedAt: performance.now(),
  finished: false,
  timeScale: 1,
  slowMoUntil: 0,
  setup: defaultSetup,
  setupOpen: true,
  lastImpact: null,
  lastCheckpoint: null,
  replayPhase: 0,
  replayRunNonce: 0,
  playbackActive: false,
  playbackStartedAt: 0,
  playbackSpeed: 1,
};

let state: RaceState = initial;
const listeners = new Set<() => void>();
let lastProgressEmit = 0;

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

export const raceStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  reset: (totalLaps?: number) => {
    const laps = totalLaps ?? state.setup.totalLaps;
    state = {
      ...initial,
      totalLaps: laps,
      setup: { ...state.setup, totalLaps: laps },
      setupOpen: state.setupOpen,
      startedAt: performance.now(),
      racers: {},
      replayPhase: 0,
      replayRunNonce: 0,
      playbackActive: false,
      playbackStartedAt: 0,
    };
    // começa nova gravação (lastRecord do replayRecordStore é preservado)
    replayRecordStore.start();
    emit();
  },
  setSetup: (patch: Partial<RaceSetup>) => {
    state.setup = { ...state.setup, ...patch };
    if (patch.totalLaps !== undefined) state.totalLaps = patch.totalLaps;
    emit();
  },
  openSetup: (open: boolean) => {
    state.setupOpen = open;
    emit();
  },
  registerRacer: (
    r: Pick<RacerEntry, "id" | "name" | "color" | "isPlayer">,
  ) => {
    state.racers[r.id] = {
      ...r,
      lap: 0,
      progress: 0,
      bestLapMs: null,
      lastLapMs: null,
      lapStartedAt: performance.now(),
      totalDist: 0,
      finished: false,
      finishTime: null,
      penaltyMs: 0,
      pose: { x: 0, z: 0, rotY: 0 },
    };
    emit();
  },
  updatePose: (id: string, x: number, z: number, rotY: number) => {
    const r = state.racers[id];
    if (!r) return;
    r.pose = { x, z, rotY };
    if (!state.finished) {
      replayRecordStore.push(id, r.name, r.color, r.isPlayer, x, z, rotY);
    }
    // pose mutation does not need to trigger re-render — read directly
  },
  updateProgress: (id: string, progress: number, lap: number) => {
    const r = state.racers[id];
    if (!r || r.finished) return;
    const now = performance.now();
    let { lapStartedAt, lastLapMs, bestLapMs } = r;
    const lapChanged = lap > r.lap;
    if (lapChanged) {
      const elapsed = now - lapStartedAt;
      lastLapMs = elapsed;
      bestLapMs = bestLapMs === null ? elapsed : Math.min(bestLapMs, elapsed);
      lapStartedAt = now;
    }
    const finished = lap >= state.totalLaps;
    const becameFinished = finished && !r.finished;
    state.racers[id] = {
      ...r,
      progress,
      lap,
      lastLapMs,
      bestLapMs,
      lapStartedAt,
      totalDist: lap + progress,
      finished,
      finishTime: finished && !r.finishTime ? now : r.finishTime,
    };
    if (becameFinished && !state.finished) {
      const all = Object.values(state.racers).every((x) => x.finished);
      if (all || r.isPlayer) {
        state.finished = true;
        // Snapshot do replay (vencedor = primeiro do ranking)
        const ranked = Object.values(state.racers).sort(
          (a, b) => b.totalDist - b.penaltyMs * 5e-6 - (a.totalDist - a.penaltyMs * 5e-6),
        );
        const winnerId = ranked[0]?.id ?? r.id;
        replayRecordStore.finalize(winnerId);
      }
    }
    // Throttle re-renders to ~10Hz; lap/finish events emit immediately.
    const force = lapChanged || becameFinished;
    if (force || now - lastProgressEmit >= 100) {
      lastProgressEmit = now;
      emit();
    }
  },
  addPenalty: (id: string, ms: number) => {
    const r = state.racers[id];
    if (!r) return;
    r.penaltyMs += ms;
    state.lastImpact = { at: performance.now(), penaltyMs: ms };
    emit();
  },
  markCheckpoint: (idx: number, total: number, isLapClose: boolean) => {
    state.lastCheckpoint = { idx, total, isLapClose, at: performance.now() };
    emit();
  },
  triggerSlowMo: (durationMs = 600, scale = 0.35) => {
    const now = performance.now();
    state.timeScale = scale;
    state.slowMoUntil = Math.max(state.slowMoUntil, now + durationMs);
    emit();
  },
  tickSlowMo: () => {
    if (state.timeScale === 1) return;
    if (performance.now() >= state.slowMoUntil) {
      state.timeScale = 1;
      emit();
    }
  },
  setReplayPhase: (p: 0 | 1 | 2) => {
    if (state.replayPhase === p) return;
    state.replayPhase = p;
    emit();
  },
  startReplayPlayback: () => {
    state.playbackActive = true;
    state.playbackStartedAt = performance.now();
    state.replayRunNonce += 1;
    state.replayPhase = 0;
    emit();
  },
  stopReplayPlayback: () => {
    if (!state.playbackActive) return;
    state.playbackActive = false;
    emit();
  },
  setPlaybackSpeed: (s: number) => {
    const clamped = Math.max(0.25, Math.min(3, s));
    if (state.playbackSpeed === clamped) return;
    // Reancora o startedAt para que o tempo já decorrido se preserve no novo ritmo
    const now = performance.now();
    const elapsedScaled = (now - state.playbackStartedAt) * state.playbackSpeed;
    state.playbackStartedAt = now - elapsedScaled / clamped;
    state.playbackSpeed = clamped;
    emit();
  },
};

export function useRaceState() {
  return useSyncExternalStore(raceStore.subscribe, raceStore.get, raceStore.get);
}

// Ranking penalizes by subtracting penalty progress equivalent (1s ≈ 0.005 dist)
export function rankedRacers(s: RaceState): RacerEntry[] {
  return Object.values(s.racers).sort(
    (a, b) => b.totalDist - b.penaltyMs * 5e-6 - (a.totalDist - a.penaltyMs * 5e-6),
  );
}
