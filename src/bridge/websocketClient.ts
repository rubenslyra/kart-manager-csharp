import type { ConnectionStatus, KartTelemetry } from "./types";

export interface WsClientOptions {
  url: string;
  onMessage: (t: KartTelemetry) => void;
  onStatus: (s: ConnectionStatus) => void;
  onRaw?: (raw: string) => void;
}

export interface WsClient {
  start(): void;
  stop(): void;
}

/**
 * Resilient WebSocket client. Never throws; reconnects with backoff.
 * Use when source === "real". Falls back gracefully if backend is offline.
 */
export function createWebsocketClient(opts: WsClientOptions): WsClient {
  let ws: WebSocket | null = null;
  let stopped = false;
  let retry = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (stopped) return;
    opts.onStatus("connecting");
    try {
      ws = new WebSocket(opts.url);
    } catch {
      opts.onStatus("error");
      schedule();
      return;
    }

    ws.addEventListener("open", () => {
      retry = 0;
      opts.onStatus("connected");
    });
    ws.addEventListener("message", (ev) => {
      const raw = typeof ev.data === "string" ? ev.data : "";
      opts.onRaw?.(raw);
      try {
        const parsed = JSON.parse(raw) as KartTelemetry;
        opts.onMessage(parsed);
      } catch {
        // ignore malformed messages
      }
    });
    ws.addEventListener("close", () => {
      opts.onStatus("disconnected");
      schedule();
    });
    ws.addEventListener("error", () => {
      opts.onStatus("error");
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    });
  };

  const schedule = () => {
    if (stopped) return;
    const delay = Math.min(8000, 800 * 2 ** retry);
    retry++;
    timer = setTimeout(connect, delay);
  };

  return {
    start() {
      stopped = false;
      retry = 0;
      connect();
    },
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
      ws = null;
    },
  };
}
