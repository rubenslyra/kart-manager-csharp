import { useSyncExternalStore } from "react";

export interface TelemetrySample {
  t: number; // ms since recording start
  speedKmh: number;
  rpm: number;
  torque: number;
  grip: number;
  latG: number;
  longG: number;
  drift: 0 | 1;
  lap: number;
  posX: number;
  posZ: number;
  rotY: number;
}

const MAX_SAMPLES = 60_000; // hard cap (~30 min at 30Hz)
const RECENT_WINDOW = 180; // ~6s at 30Hz — used for live charts

let samples: TelemetrySample[] = [];
let recording = true;
let startTs = performance.now();
let lastPush = 0;
const listeners = new Set<() => void>();

let version = 0;
function emit() {
  version++;
  listeners.forEach((l) => l());
}

const recentCache = new Map<number, { v: number; data: TelemetrySample[] }>();
function getRecentCached(n: number): TelemetrySample[] {
  const c = recentCache.get(n);
  if (c && c.v === version) return c.data;
  const data = samples.length <= n ? samples : samples.slice(samples.length - n);
  recentCache.set(n, { v: version, data });
  return data;
}

export const telemetry = {
  reset() {
    samples = [];
    startTs = performance.now();
    lastPush = 0;
    recording = true;
    emit();
  },
  stop() {
    recording = false;
    emit();
  },
  push(s: Omit<TelemetrySample, "t">) {
    if (!recording) return;
    const now = performance.now();
    if (now - lastPush < 33) return; // ~30 Hz
    lastPush = now;
    samples.push({ t: Math.round(now - startTs), ...s });
    if (samples.length > MAX_SAMPLES) samples.shift();
    emit();
  },
  all: () => samples,
  recent: (n = RECENT_WINDOW) =>
    samples.length <= n ? samples : samples.slice(samples.length - n),
  count: () => samples.length,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useTelemetryRecent(n = RECENT_WINDOW): TelemetrySample[] {
  return useSyncExternalStore(
    telemetry.subscribe,
    () => getRecentCached(n),
    () => getRecentCached(n),
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportJSON() {
  const data = { exportedAt: new Date().toISOString(), samples };
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    `rl-telemetry-${Date.now()}.json`,
  );
}

export function exportCSV() {
  if (samples.length === 0) return;
  const header = Object.keys(samples[0]).join(",");
  const lines = samples.map((s) =>
    [s.t, s.speedKmh, s.rpm, s.torque, s.grip, s.latG, s.longG, s.drift, s.lap, s.posX, s.posZ, s.rotY]
      .map((v) => (typeof v === "number" ? v.toFixed(4) : v))
      .join(","),
  );
  downloadBlob(
    new Blob([header + "\n" + lines.join("\n")], { type: "text/csv" }),
    `rl-telemetry-${Date.now()}.csv`,
  );
}
