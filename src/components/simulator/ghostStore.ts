// Ghost kart: grava amostras da volta atual do player; se o tempo for o melhor,
// persiste em localStorage e dispara playback pelo componente <GhostKart/>.
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "rl-ghost-best-lap-v1";
const SAMPLE_INTERVAL_MS = 50; // ~20Hz

export interface GhostSample {
  t: number; // ms desde o início da volta
  x: number;
  z: number;
  rotY: number;
}
export interface GhostLap {
  totalMs: number;
  samples: GhostSample[];
  recordedAt: number;
}

let best: GhostLap | null = null;
let current: { startedAt: number; samples: GhostSample[] } = {
  startedAt: 0,
  samples: [],
};
const listeners = new Set<() => void>();

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as GhostLap;
    if (parsed && Array.isArray(parsed.samples) && parsed.totalMs > 0) {
      best = parsed;
    }
  } catch {
    /* ignore */
  }
}
loadFromStorage();

function emit() {
  listeners.forEach((l) => l());
}

export const ghostStore = {
  getBest: () => best,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  resetCurrent: () => {
    current = { startedAt: performance.now(), samples: [] };
  },
  /** Chamar a cada frame com a pose do player; faz throttle internamente. */
  push: (x: number, z: number, rotY: number) => {
    if (!current.startedAt) current.startedAt = performance.now();
    const t = performance.now() - current.startedAt;
    const last = current.samples[current.samples.length - 1];
    if (last && t - last.t < SAMPLE_INTERVAL_MS) return;
    current.samples.push({ t, x, z, rotY });
  },
  /** Chamar quando o player fecha uma volta. Persiste se for novo recorde. */
  commitLap: (): { isNewBest: boolean; totalMs: number } => {
    const totalMs = performance.now() - current.startedAt;
    if (current.samples.length < 8 || totalMs < 5_000) {
      ghostStore.resetCurrent();
      return { isNewBest: false, totalMs };
    }
    const isNewBest = !best || totalMs < best.totalMs;
    if (isNewBest) {
      best = {
        totalMs,
        samples: [...current.samples],
        recordedAt: Date.now(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
      } catch {
        /* ignore quota */
      }
      emit();
    }
    ghostStore.resetCurrent();
    return { isNewBest, totalMs };
  },
  clear: () => {
    best = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    emit();
  },
};

export function useGhostBest() {
  return useSyncExternalStore(ghostStore.subscribe, ghostStore.getBest, ghostStore.getBest);
}
