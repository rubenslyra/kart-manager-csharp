import { useEffect, useRef, useState } from "react";
import { mockBridge } from "./mockExternalData";
import { createWebsocketClient } from "./websocketClient";
import type { ConnectionStatus, DataSource, KartTelemetry } from "./types";

export interface UseExternalDataResult {
  telemetry: KartTelemetry;
  source: DataSource;
  setSource: (s: DataSource) => void;
  connection: ConnectionStatus;
  lastRaw: string | null;
  wsUrl: string;
  setWsUrl: (s: string) => void;
}

const DEFAULT_WS = "ws://localhost:5050/kart";

export function useExternalData(): UseExternalDataResult {
  const [source, setSource] = useState<DataSource>("mock");
  const [telemetry, setTelemetry] = useState<KartTelemetry>(() => mockBridge.get());
  const [connection, setConnection] = useState<ConnectionStatus>("disconnected");
  const [lastRaw, setLastRaw] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string>(DEFAULT_WS);
  const clientRef = useRef<ReturnType<typeof createWebsocketClient> | null>(null);

  // Mock subscription always alive — feeds the scene when source === "mock".
  useEffect(() => {
    return mockBridge.subscribe((t) => {
      if (source === "mock") setTelemetry(t);
    });
  }, [source]);

  // Real WebSocket lifecycle.
  useEffect(() => {
    if (source !== "real") {
      clientRef.current?.stop();
      clientRef.current = null;
      setConnection("disconnected");
      return;
    }
    const client = createWebsocketClient({
      url: wsUrl,
      onMessage: (t) => setTelemetry(t),
      onStatus: setConnection,
      onRaw: setLastRaw,
    });
    clientRef.current = client;
    client.start();
    return () => client.stop();
  }, [source, wsUrl]);

  return { telemetry, source, setSource, connection, lastRaw, wsUrl, setWsUrl };
}
