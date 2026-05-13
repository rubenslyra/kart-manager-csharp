import { useEffect, useRef, useState } from "react";
import type { KartTelemetry } from "@/bridge/types";
import type { FocusTarget } from "../parts/shared";

export interface AuditEvent {
  ts: number;
  iso: string;
  module: string;
  field: string;
  before: string;
  after: string;
}

const MAX = 200;
const SIG_DELTA = 0.05; // 5%

function toRows(t: KartTelemetry): Record<string, Record<string, string | number | boolean>> {
  const m = t.modules;
  return {
    vehicle: { state: t.vehicleState, speedKmh: t.speedKmh ?? 0 },
    core: { loaded: m.core.loaded, status: m.core.status },
    gearbox: { loaded: m.gearbox.loaded, gear: m.gearbox.currentGear, status: m.gearbox.status },
    brakes: {
      loaded: m.brakes.loaded,
      pedal: m.brakes.pedalPressure,
      disc: m.brakes.discTemperature,
      regen: m.brakes.regenLevel,
      status: m.brakes.status,
    },
    ignition: { loaded: m.ignition.loaded, enabled: m.ignition.enabled, status: m.ignition.status },
    battery: {
      level: m.battery.level,
      voltage: m.battery.voltage,
      temp: m.battery.temperature,
      status: m.battery.status,
    },
    steering: { angle: m.steering.angle, status: m.steering.status },
  };
}

function isSig(field: string, before: unknown, after: unknown, focusedModule: string, mod: string): boolean {
  if (typeof before !== "number" || typeof after !== "number") return before !== after;
  // Always log status fields & loaded
  if (field === "status" || field === "loaded" || field === "state" || field === "enabled" || field === "gear") {
    return before !== after;
  }
  // For numerics, only when delta exceeds 5% range OR when focused module
  const delta = Math.abs(after - before);
  if (focusedModule === mod) return delta > Math.max(0.001, Math.abs(before) * SIG_DELTA * 0.5);
  return delta > Math.max(0.5, Math.abs(before) * SIG_DELTA);
}

export function useAuditLog(telemetry: KartTelemetry, focus: FocusTarget) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const prevRef = useRef<ReturnType<typeof toRows> | null>(null);

  useEffect(() => {
    const next = toRows(telemetry);
    const prev = prevRef.current;
    if (!prev) {
      prevRef.current = next;
      return;
    }
    const newEvents: AuditEvent[] = [];
    const ts = Date.now();
    const iso = new Date(ts).toISOString();
    for (const mod of Object.keys(next)) {
      const a = next[mod];
      const b = prev[mod] ?? {};
      for (const field of Object.keys(a)) {
        const before = b[field];
        const after = a[field];
        if (before === undefined) continue;
        if (!isSig(field, before, after, focus ?? "", mod)) continue;
        newEvents.push({
          ts,
          iso,
          module: mod,
          field,
          before: format(before),
          after: format(after),
        });
      }
    }
    if (newEvents.length) {
      setEvents((cur) => [...newEvents, ...cur].slice(0, MAX));
    }
    prevRef.current = next;
  }, [telemetry, focus]);

  return {
    events,
    clear: () => setEvents([]),
  };
}

function format(v: unknown): string {
  if (typeof v === "number") return v.toFixed(2);
  return String(v);
}
