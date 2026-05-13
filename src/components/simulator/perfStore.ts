/**
 * perfStore — contadores leves por subsistema + amostragem de frames para
 * diagnosticar quedas de FPS.
 *
 * Recursos:
 *  - counters/toggles por subsistema (crowd, particles, shadows, motionBlur)
 *  - overlay on/off (atalho P)
 *  - log circular de transições grounded + max-speed por kart
 *  - buffer circular de amostras de frame (ms, fps, ts, grounded do player)
 *  - estatísticas: avg ms, p95 ms (janela de N amostras)
 *  - modo "captura" (30s por padrão) — registra picos top-N de frame time
 *  - export CSV/JSON das amostras
 */

export interface PerfCounters {
  crowdCount: number;
  sparkAlive: number;
  shadowCasters: number;
  motionBlur: boolean;
}

export interface PerfToggles {
  crowdEnabled: boolean;
  particlesEnabled: boolean;
  shadowsEnabled: boolean;
  motionBlurEnabled: boolean;
  overlayEnabled: boolean;
}

export interface GroundedLogEntry {
  t: number;
  id: string;
  grounded: boolean;
  speedKmh: number;
}

export interface FrameSample {
  t: number;     // performance.now()
  ms: number;    // frame time
  fps: number;   // instantaneous (1000/ms)
  grounded: boolean; // player grounded state at sample time
}

export interface SpikeEntry {
  t: number;
  ms: number;
  fps: number;
}

export interface CaptureState {
  active: boolean;
  startedAt: number;
  endsAt: number;
  durationMs: number;
  spikes: SpikeEntry[];   // top-N por ms
  topN: number;
}

interface PerfState {
  counters: PerfCounters;
  toggles: PerfToggles;
  groundedLog: GroundedLogEntry[];
  maxSpeedById: Record<string, number>;
  groundedById: Record<string, boolean>;
  samples: FrameSample[];     // janela circular
  capture: CaptureState;
}

const MAX_LOG = 60;
const SAMPLE_WINDOW = 600; // ~10s a 60fps
const DEFAULT_CAPTURE_MS = 30_000;
const DEFAULT_TOP_N = 10;

const state: PerfState = {
  counters: { crowdCount: 0, sparkAlive: 0, shadowCasters: 0, motionBlur: false },
  toggles: {
    crowdEnabled: true,
    particlesEnabled: true,
    shadowsEnabled: true,
    motionBlurEnabled: false,
    overlayEnabled: false,
  },
  groundedLog: [],
  maxSpeedById: {},
  groundedById: {},
  samples: [],
  capture: { active: false, startedAt: 0, endsAt: 0, durationMs: DEFAULT_CAPTURE_MS, spikes: [], topN: DEFAULT_TOP_N },
};

type Listener = (s: PerfState) => void;
const listeners = new Set<Listener>();

let pendingEmit = false;
function emit() {
  if (pendingEmit) return;
  pendingEmit = true;
  queueMicrotask(() => {
    pendingEmit = false;
    listeners.forEach((l) => l(state));
  });
}

const lastGroundedById: Record<string, boolean> = {};

function insertSpike(spike: SpikeEntry) {
  const cap = state.capture;
  cap.spikes.push(spike);
  cap.spikes.sort((a, b) => b.ms - a.ms);
  if (cap.spikes.length > cap.topN) cap.spikes.length = cap.topN;
}

export const perfStore = {
  get: () => state,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  setCounter<K extends keyof PerfCounters>(k: K, v: PerfCounters[K]) {
    if (state.counters[k] === v) return;
    state.counters = { ...state.counters, [k]: v };
    emit();
  },
  setToggle<K extends keyof PerfToggles>(k: K, v: PerfToggles[K]) {
    if (state.toggles[k] === v) return;
    state.toggles = { ...state.toggles, [k]: v };
    emit();
  },
  setToggles(patch: Partial<PerfToggles>) {
    state.toggles = { ...state.toggles, ...patch };
    emit();
  },
  toggleOverlay() {
    state.toggles = { ...state.toggles, overlayEnabled: !state.toggles.overlayEnabled };
    emit();
  },
  reportGrounded(id: string, grounded: boolean, speedKmh: number) {
    state.groundedById[id] = grounded;
    const prev = lastGroundedById[id];
    if (prev !== grounded) {
      lastGroundedById[id] = grounded;
      state.groundedLog.push({ t: performance.now(), id, grounded, speedKmh });
      if (state.groundedLog.length > MAX_LOG) state.groundedLog.shift();
      emit();
    }
    const cur = state.maxSpeedById[id] ?? 0;
    if (speedKmh > cur) {
      state.maxSpeedById[id] = speedKmh;
      emit();
    }
  },
  /** Push uma amostra de frame (chamado pelo FpsMeter a cada RAF). */
  pushFrameSample(ms: number) {
    const t = performance.now();
    const fps = ms > 0 ? 1000 / ms : 0;
    const grounded = state.groundedById["player"] ?? true;
    const s: FrameSample = { t, ms, fps, grounded };
    state.samples.push(s);
    if (state.samples.length > SAMPLE_WINDOW) state.samples.shift();

    if (state.capture.active) {
      if (t >= state.capture.endsAt) {
        state.capture = { ...state.capture, active: false };
      } else {
        insertSpike({ t, ms, fps });
      }
    }
    // não emitimos por amostra (alto volume); o FpsMeter já tem seu próprio render
  },
  /** Estatísticas calculadas sob demanda da janela atual. */
  getStats() {
    const arr = state.samples;
    if (arr.length === 0) return { avgMs: 0, p95Ms: 0, count: 0 };
    let sum = 0;
    const sorted = arr.map((s) => s.ms).sort((a, b) => a - b);
    for (const v of sorted) sum += v;
    const avgMs = sum / sorted.length;
    const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
    return { avgMs, p95Ms: sorted[idx], count: sorted.length };
  },
  startCapture(durationMs = DEFAULT_CAPTURE_MS, topN = DEFAULT_TOP_N) {
    const now = performance.now();
    state.capture = {
      active: true,
      startedAt: now,
      endsAt: now + durationMs,
      durationMs,
      spikes: [],
      topN,
    };
    emit();
  },
  stopCapture() {
    state.capture = { ...state.capture, active: false };
    emit();
  },
  clearLog() {
    state.groundedLog = [];
    state.maxSpeedById = {};
    state.samples = [];
    state.capture = { ...state.capture, spikes: [], active: false };
    emit();
  },
  exportSamplesCSV(): string {
    const header = "t_ms,iso,fps,frame_ms,grounded";
    const rows = state.samples.map((s) => {
      const iso = new Date(performance.timeOrigin + s.t).toISOString();
      return `${s.t.toFixed(2)},${iso},${s.fps.toFixed(2)},${s.ms.toFixed(3)},${s.grounded ? 1 : 0}`;
    });
    return [header, ...rows].join("\n");
  },
  exportSamplesJSON(): string {
    const stats = this.getStats();
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      stats,
      capture: state.capture,
      samples: state.samples,
      groundedLog: state.groundedLog,
      maxSpeedById: state.maxSpeedById,
    }, null, 2);
  },
};

export function downloadFile(name: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import { useEffect, useState } from "react";
export function usePerf() {
  const [s, setS] = useState(state);
  useEffect(() => {
    const unsub = perfStore.subscribe((next) => setS({ ...next }));
    return () => { unsub(); };
  }, []);
  return s;
}
