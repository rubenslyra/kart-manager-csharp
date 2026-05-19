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

export type RacePhase =
  | "SETUP"
  | "QUALIFYING"
  | "QUALIFYING_COMPLETE"
  | "GRID_LOADING"
  | "GRID_COUNTDOWN"
  | "RACE"
  | "FINISHED";

export interface QualifyingEntrant {
  id: string;
  name: string;
  color: string;
  isPlayer: boolean;
  pace: number;
}

export type QualifyingStep = "RUNNING" | "PIT_RETURN" | "ANALYSIS" | "COMPLETE";

export interface QualifyingSession {
  entrants: QualifyingEntrant[];
  roundIndex: number;
  entrantIndex: number;
  step: QualifyingStep;
  stepStartedAt: number;
  lapsById: Record<string, number[]>;
  complete: boolean;
}

export interface QualifyingResult {
  id: string;
  name: string;
  color: string;
  isPlayer: boolean;
  laps: number[];
  bestLapMs: number;
  totalMs: number;
  gridPosition: number;
  pole: boolean;
}

export interface PitServiceState {
  active: boolean;
  racerId: string | null;
  startedAt: number;
  durationMs: number;
  completedCount: number;
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
  phase: RacePhase;
  racers: Record<string, RacerEntry>;
  totalLaps: number;
  startedAt: number;
  finished: boolean;
  timeScale: number;
  slowMoUntil: number;
  setup: RaceSetup;
  setupOpen: boolean;
  qualifyingSession: QualifyingSession | null;
  qualifying: QualifyingResult[];
  gridOrder: string[];
  countdownStartedAt: number | null;
  pitService: PitServiceState;
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
  phase: "SETUP",
  racers: {},
  totalLaps: 3,
  startedAt: performance.now(),
  finished: false,
  timeScale: 1,
  slowMoUntil: 0,
  setup: defaultSetup,
  setupOpen: true,
  qualifyingSession: null,
  qualifying: [],
  gridOrder: [],
  countdownStartedAt: null,
  pitService: {
    active: false,
    racerId: null,
    startedAt: 0,
    durationMs: 2600,
    completedCount: 0,
  },
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
      phase: state.setupOpen ? "SETUP" : "RACE",
      startedAt: performance.now(),
      racers: {},
      qualifyingSession: state.qualifyingSession,
      qualifying: state.qualifying,
      gridOrder: state.gridOrder,
      countdownStartedAt: null,
      pitService: {
        active: false,
        racerId: null,
        startedAt: 0,
        durationMs: 2600,
        completedCount: state.pitService.completedCount,
      },
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
    if (open) state.phase = "SETUP";
    emit();
  },
  setPhase: (phase: RacePhase) => {
    state.phase = phase;
    if (phase === "FINISHED") state.finished = true;
    emit();
  },
  startQualifyingSession: (entrants: QualifyingEntrant[]) => {
    const alphabetic = [...entrants].sort((a, b) => a.name.localeCompare(b.name));
    const rayssaIndex = alphabetic.findIndex((e) => e.isPlayer);
    const ordered =
      rayssaIndex <= 0
        ? alphabetic
        : [alphabetic[rayssaIndex], ...alphabetic.filter((_, i) => i !== rayssaIndex)];
    state.qualifyingSession = {
      entrants: ordered,
      roundIndex: 0,
      entrantIndex: 0,
      step: "RUNNING",
      stepStartedAt: performance.now(),
      lapsById: Object.fromEntries(ordered.map((e) => [e.id, []])),
      complete: false,
    };
    state.qualifying = [];
    state.gridOrder = [];
    state.phase = "QUALIFYING";
    state.setupOpen = false;
    emit();
  },
  recordQualifyingLap: (racerId: string, lapMs: number) => {
    const session = state.qualifyingSession;
    if (!session || session.complete) return;
    const laps = session.lapsById[racerId] ?? [];
    if (laps.length > session.roundIndex) return;
    session.lapsById = {
      ...session.lapsById,
      [racerId]: [...laps, lapMs],
    };
    session.step = state.qualifyingSession?.entrants[session.entrantIndex]?.isPlayer
      ? "PIT_RETURN"
      : "ANALYSIS";
    session.stepStartedAt = performance.now();
    emit();
  },
  advanceQualifying: () => {
    const session = state.qualifyingSession;
    if (!session || session.complete) return;
    const nextEntrantIndex = session.entrantIndex + 1;
    if (nextEntrantIndex < session.entrants.length) {
      session.entrantIndex = nextEntrantIndex;
      session.step = "RUNNING";
      session.stepStartedAt = performance.now();
      emit();
      return;
    }
    const nextRoundIndex = session.roundIndex + 1;
    if (nextRoundIndex < 3) {
      session.roundIndex = nextRoundIndex;
      session.entrantIndex = 0;
      session.step = "RUNNING";
      session.stepStartedAt = performance.now();
      emit();
      return;
    }
    const results = session.entrants.map((entrant) => {
      const laps = session.lapsById[entrant.id] ?? [];
      const totalMs = laps.reduce((sum, lap) => sum + lap, 0);
      return {
        ...entrant,
        laps,
        bestLapMs: Math.min(...laps),
        totalMs,
      };
    });
    raceStore.startQualifying(results);
  },
  startQualifying: (results: Omit<QualifyingResult, "gridPosition" | "pole">[]) => {
    const ranked = [...results]
      .sort((a, b) => a.totalMs - b.totalMs)
      .map((r, i) => ({ ...r, gridPosition: i + 1, pole: i === 0 }));
    state.qualifying = ranked;
    state.gridOrder = ranked.map((r) => r.id);
    if (state.qualifyingSession) {
      state.qualifyingSession = {
        ...state.qualifyingSession,
        step: "COMPLETE",
        complete: true,
        stepStartedAt: performance.now(),
      };
    }
    state.phase = "QUALIFYING_COMPLETE";
    state.setupOpen = false;
    emit();
  },
  startGridLoading: () => {
    state.phase = "GRID_LOADING";
    state.countdownStartedAt = null;
    state.setupOpen = false;
    emit();
  },
  startGridCountdown: () => {
    state.finished = false;
    state.phase = "GRID_COUNTDOWN";
    state.countdownStartedAt = performance.now();
    state.startedAt = performance.now();
    Object.keys(state.racers).forEach((id) => {
      const r = state.racers[id];
      state.racers[id] = {
        ...r,
        lap: 0,
        progress: 0,
        lastLapMs: null,
        bestLapMs: null,
        lapStartedAt: performance.now(),
        totalDist: 0,
        finished: false,
        finishTime: null,
      };
    });
    replayRecordStore.start();
    emit();
  },
  startRace: () => {
    state.phase = "RACE";
    state.startedAt = performance.now();
    Object.keys(state.racers).forEach((id) => {
      const r = state.racers[id];
      state.racers[id] = { ...r, lapStartedAt: performance.now() };
    });
    emit();
  },
  registerRacer: (r: Pick<RacerEntry, "id" | "name" | "color" | "isPlayer">) => {
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
    if (becameFinished && !state.finished && state.phase === "RACE") {
      const all = Object.values(state.racers).every((x) => x.finished);
      if (all || r.isPlayer) {
        state.finished = true;
        state.phase = "FINISHED";
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
  startPitService: (racerId: string, durationMs = 2600) => {
    if (state.pitService.active) return;
    state.pitService = {
      active: true,
      racerId,
      startedAt: performance.now(),
      durationMs,
      completedCount: state.pitService.completedCount,
    };
    emit();
  },
  tickPitService: () => {
    if (!state.pitService.active) return;
    if (performance.now() - state.pitService.startedAt < state.pitService.durationMs) return;
    state.pitService = {
      active: false,
      racerId: null,
      startedAt: 0,
      durationMs: state.pitService.durationMs,
      completedCount: state.pitService.completedCount + 1,
    };
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
