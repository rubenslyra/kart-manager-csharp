import { useSyncExternalStore } from "react";

export type ControlMode = "ENGINEERING_OBSERVER" | "DRIVER_CONTROL";
export type TeamRole =
  | "ASSISTANT_ENGINEER"
  | "SENIOR_ASSISTANT"
  | "TEAM_LEAD"
  | "DRIVER_AUTHORIZED";

export interface EngineeringProgressState {
  rayssaWins: number;
  controlMode: ControlMode;
  lastRecordedRaceStartedAt: number | null;
}

const STORAGE_KEY = "rl-kart:engineering-progress/v1";

const initial: EngineeringProgressState = {
  rayssaWins: 0,
  controlMode: "ENGINEERING_OBSERVER",
  lastRecordedRaceStartedAt: null,
};

let state = load();
const listeners = new Set<() => void>();

function roleForWins(wins: number): TeamRole {
  if (wins >= 10) return "DRIVER_AUTHORIZED";
  if (wins >= 6) return "TEAM_LEAD";
  if (wins >= 4) return "SENIOR_ASSISTANT";
  return "ASSISTANT_ENGINEER";
}

function load(): EngineeringProgressState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<EngineeringProgressState>;
    const rayssaWins =
      typeof parsed.rayssaWins === "number" && Number.isFinite(parsed.rayssaWins)
        ? Math.max(0, Math.floor(parsed.rayssaWins))
        : 0;
    const unlocked = rayssaWins >= 10;
    const controlMode =
      unlocked && parsed.controlMode === "DRIVER_CONTROL"
        ? "DRIVER_CONTROL"
        : "ENGINEERING_OBSERVER";
    return {
      rayssaWins,
      controlMode,
      lastRecordedRaceStartedAt:
        typeof parsed.lastRecordedRaceStartedAt === "number"
          ? parsed.lastRecordedRaceStartedAt
          : null,
    };
  } catch {
    return initial;
  }
}

function save() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage can be disabled in some browsers. Runtime state still works. */
  }
}

function emit() {
  state = { ...state };
  save();
  listeners.forEach((l) => l());
}

export const engineeringProgressStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getRole: () => roleForWins(state.rayssaWins),
  canDrive: () => state.rayssaWins >= 10,
  setControlMode: (mode: ControlMode) => {
    state.controlMode =
      mode === "DRIVER_CONTROL" && state.rayssaWins < 10 ? "ENGINEERING_OBSERVER" : mode;
    emit();
  },
  recordRayssaWin: (raceStartedAt: number) => {
    if (state.lastRecordedRaceStartedAt === raceStartedAt) return;
    state.rayssaWins += 1;
    state.lastRecordedRaceStartedAt = raceStartedAt;
    if (state.rayssaWins < 10) state.controlMode = "ENGINEERING_OBSERVER";
    emit();
  },
  markRaceSeen: (raceStartedAt: number) => {
    if (state.lastRecordedRaceStartedAt === raceStartedAt) return;
    state.lastRecordedRaceStartedAt = raceStartedAt;
    emit();
  },
  reset: () => {
    state = initial;
    emit();
  },
};

export function useEngineeringProgress() {
  return useSyncExternalStore(
    engineeringProgressStore.subscribe,
    engineeringProgressStore.get,
    engineeringProgressStore.get,
  );
}

export function getTeamRole(wins: number) {
  return roleForWins(wins);
}

export function roleLabel(role: TeamRole) {
  switch (role) {
    case "DRIVER_AUTHORIZED":
      return "Operacao direta autorizada";
    case "TEAM_LEAD":
      return "Lider de equipe";
    case "SENIOR_ASSISTANT":
      return "Engenharia assistente senior";
    default:
      return "Engenharia mecanica assistente";
  }
}

export function nextUnlockLabel(wins: number) {
  if (wins < 4) return `${4 - wins} vitoria(s) para cadeira senior`;
  if (wins < 6) return `${6 - wins} vitoria(s) para lider de equipe`;
  if (wins < 10) return `${10 - wins} vitoria(s) para controle direto`;
  return "Controle direto liberado";
}
