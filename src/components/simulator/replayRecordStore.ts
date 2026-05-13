// Grava as poses de todos os pilotos durante a corrida e expõe o último
// "race record" para reprodução cinematográfica após a corrida terminar
// (mesmo após Reiniciar corrida ou recarregar a página — persistido em
// localStorage).
import { useSyncExternalStore } from "react";

const SAMPLE_MS = 100; // ~10Hz por piloto
const STORAGE_KEY = "rl-kart:last-replay/v1";

export interface PoseSample {
  t: number;
  x: number;
  z: number;
  rotY: number;
}

export interface RecordedRacer {
  id: string;
  name: string;
  color: string;
  isPlayer: boolean;
  samples: PoseSample[];
}

export interface RaceRecord {
  durationMs: number;
  racers: RecordedRacer[];
  winnerId: string;
  recordedAt: number;
}

let recording: { startedAt: number; perId: Map<string, RecordedRacer> } | null = null;
let lastRecord: RaceRecord | null = loadFromStorage();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function loadFromStorage(): RaceRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RaceRecord;
    if (!parsed?.racers?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(rec: RaceRecord | null) {
  if (typeof window === "undefined") return;
  try {
    if (rec) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* quota or disabled — silently ignore */
  }
}

export const replayRecordStore = {
  start() {
    recording = { startedAt: performance.now(), perId: new Map() };
  },
  push(id: string, name: string, color: string, isPlayer: boolean, x: number, z: number, rotY: number) {
    if (!recording) return;
    let r = recording.perId.get(id);
    if (!r) {
      r = { id, name, color, isPlayer, samples: [] };
      recording.perId.set(id, r);
    }
    const t = performance.now() - recording.startedAt;
    const last = r.samples[r.samples.length - 1];
    if (last && t - last.t < SAMPLE_MS) return;
    r.samples.push({ t, x, z, rotY });
  },
  finalize(winnerId: string) {
    if (!recording) return;
    const durationMs = performance.now() - recording.startedAt;
    const racers = Array.from(recording.perId.values());
    if (racers.length === 0 || durationMs < 1500) {
      recording = null;
      return;
    }
    lastRecord = { durationMs, racers, winnerId, recordedAt: Date.now() };
    recording = null;
    saveToStorage(lastRecord);
    emit();
  },
  getRecord: () => lastRecord,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  clear() {
    lastRecord = null;
    saveToStorage(null);
    emit();
  },
  /** Dispara download do replay como JSON para compartilhar/analisar. */
  exportToFile() {
    if (typeof window === "undefined" || !lastRecord) return;
    const blob = new Blob([JSON.stringify(lastRecord, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date(lastRecord.recordedAt).toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `rl-kart-replay-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export function interpolate(samples: PoseSample[], t: number): PoseSample | null {
  if (samples.length === 0) return null;
  if (t <= samples[0].t) return samples[0];
  if (t >= samples[samples.length - 1].t) return samples[samples.length - 1];
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t <= t) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const f = (t - a.t) / (b.t - a.t);
  // shortest-arc lerp para rotY
  let dRot = b.rotY - a.rotY;
  if (dRot > Math.PI) dRot -= Math.PI * 2;
  if (dRot < -Math.PI) dRot += Math.PI * 2;
  return {
    t,
    x: a.x + (b.x - a.x) * f,
    z: a.z + (b.z - a.z) * f,
    rotY: a.rotY + dRot * f,
  };
}

export function useRaceRecord() {
  return useSyncExternalStore(replayRecordStore.subscribe, replayRecordStore.getRecord, replayRecordStore.getRecord);
}
