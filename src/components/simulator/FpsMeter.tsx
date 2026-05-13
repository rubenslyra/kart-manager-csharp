import { useEffect, useMemo, useRef, useState } from "react";
import { downloadFile, perfStore, usePerf } from "./perfStore";

/**
 * FpsMeter — overlay DOM de performance. Amostra requestAnimationFrame e
 * empurra cada frame para o perfStore, exibindo:
 *  - FPS instantâneo (1s) e ms/frame
 *  - frame time médio + p95 (janela ~10s)
 *  - contadores por subsistema (torcida, partículas, sombras, motion blur)
 *  - controles de captura (30s) com lista top-N de picos
 *  - exportação CSV/JSON das amostras
 *
 * Visibilidade controlada por `perfStore.toggles.overlayEnabled` (atalho P).
 */
export function FpsMeter() {
  const [fps, setFps] = useState(0);
  const [ms, setMs] = useState(0);
  const [, force] = useState(0);
  const raf = useRef<number | null>(null);
  const frames = useRef(0);
  const lastTick = useRef(performance.now());
  const lastFrame = useRef(performance.now());
  const accMs = useRef(0);
  const perf = usePerf();

  useEffect(() => {
    const loop = () => {
      const now = performance.now();
      const frameMs = now - lastFrame.current;
      lastFrame.current = now;
      perfStore.pushFrameSample(frameMs);
      accMs.current += frameMs;
      frames.current += 1;
      if (now - lastTick.current >= 500) {
        const elapsed = now - lastTick.current;
        setFps(Math.round((frames.current * 1000) / elapsed));
        setMs(accMs.current / Math.max(frames.current, 1));
        frames.current = 0;
        accMs.current = 0;
        lastTick.current = now;
        force((n) => n + 1); // refresh stats/capture
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  const stats = useMemo(() => perfStore.getStats(), [fps, ms]);
  const cap = perf.capture;
  const captureRemaining = cap.active
    ? Math.max(0, Math.ceil((cap.endsAt - performance.now()) / 1000))
    : 0;

  const color =
    fps >= 55 ? "var(--primary)" : fps >= 35 ? "var(--accent)" : "var(--destructive)";

  const c = perf.counters;
  const tg = perf.toggles;

  return (
    <div
      className="pointer-events-auto absolute right-3 top-44 z-50 corner-cut border bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm"
      style={{ borderColor: color, color, minWidth: 220 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="opacity-70">FPS</span>{" "}
          <span className="font-bold">{fps}</span>{" "}
          <span className="opacity-50">· {ms.toFixed(1)}ms</span>
        </div>
        <button
          onClick={() => perfStore.toggleOverlay()}
          className="opacity-60 hover:opacity-100"
          title="Fechar (P)"
        >
          ✕
        </button>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-x-2 text-[9px]" style={{ color: "var(--muted-foreground)" }}>
        <div>avg <span className="text-foreground">{stats.avgMs.toFixed(1)}ms</span></div>
        <div>p95 <span className="text-foreground">{stats.p95Ms.toFixed(1)}ms</span></div>
        <div>n <span className="text-foreground">{stats.count}</span></div>
        <div>blur <span style={{ color: tg.motionBlurEnabled ? "var(--foreground)" : "var(--muted-foreground)" }}>{tg.motionBlurEnabled ? "ON" : "OFF"}</span></div>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-x-2 text-[9px]" style={{ color: "var(--muted-foreground)" }}>
        <div>Torcida <span style={{ color: tg.crowdEnabled ? "var(--foreground)" : "var(--destructive)" }}>{c.crowdCount}</span></div>
        <div>Part. <span style={{ color: tg.particlesEnabled ? "var(--foreground)" : "var(--destructive)" }}>{c.sparkAlive}</span></div>
        <div>Sombras <span style={{ color: tg.shadowsEnabled ? "var(--foreground)" : "var(--destructive)" }}>{tg.shadowsEnabled ? "ON" : "OFF"}</span></div>
        <div>Player <span className="text-foreground">{(perf.groundedById["player"] ?? true) ? "ON-TRACK" : "OFF-TRACK"}</span></div>
      </div>

      <div className="mt-1.5 border-t border-current/20 pt-1">
        <div className="flex flex-wrap gap-1">
          {!cap.active ? (
            <button
              onClick={() => perfStore.startCapture(30_000, 10)}
              className="corner-cut border border-current/40 px-1.5 py-0.5 hover:border-current"
              title="Capturar 30s e listar top-10 picos"
            >
              ● Capturar 30s
            </button>
          ) : (
            <button
              onClick={() => perfStore.stopCapture()}
              className="corner-cut border border-destructive px-1.5 py-0.5 text-destructive"
            >
              ■ Parar ({captureRemaining}s)
            </button>
          )}
          <button
            onClick={() => downloadFile(`perf-${Date.now()}.csv`, "text/csv", perfStore.exportSamplesCSV())}
            className="corner-cut border border-current/40 px-1.5 py-0.5 hover:border-current"
          >
            CSV
          </button>
          <button
            onClick={() => downloadFile(`perf-${Date.now()}.json`, "application/json", perfStore.exportSamplesJSON())}
            className="corner-cut border border-current/40 px-1.5 py-0.5 hover:border-current"
          >
            JSON
          </button>
          <button
            onClick={() => perfStore.clearLog()}
            className="corner-cut border border-current/40 px-1.5 py-0.5 opacity-70 hover:opacity-100"
          >
            ⌫
          </button>
        </div>

        {(cap.active || cap.spikes.length > 0) && (
          <div className="mt-1">
            <div className="text-[9px] opacity-70">
              Picos top-{cap.topN} {cap.active ? `(coletando ${captureRemaining}s)` : "(últimos)"}
            </div>
            <div className="max-h-24 overflow-auto text-[9px]" style={{ color: "var(--muted-foreground)" }}>
              {cap.spikes.length === 0 && <div className="opacity-60">—</div>}
              {cap.spikes.map((s, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <span>#{i + 1}</span>
                  <span className="text-foreground">{s.ms.toFixed(1)}ms</span>
                  <span>{s.fps.toFixed(0)}fps</span>
                  <span className="opacity-60">{((s.t - cap.startedAt) / 1000).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
