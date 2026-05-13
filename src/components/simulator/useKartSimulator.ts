import { useCallback, useEffect, useState } from "react";
import type { KartState, Module, Telemetry } from "./types";

const INITIAL: Telemetry = {
  state: "WAITING_FOR_MODULES",
  battery: 78,
  gear: "P",
  brake: 0,
  ignition: false,
  speed: 0,
  modules: [],
  alerts: [],
};

function computeState(
  modules: Module[],
  ignition: boolean,
  speed: number,
  battery: number,
): KartState {
  if (ignition && battery <= 0) return "CRITICAL_FAILURE";
  if (ignition && battery <= 15) return "WARNING";
  if (speed > 0) return "DRIVING";
  if (ignition) return "READY_TO_DRIVE";
  if (modules.includes("IGNITION")) return "IGNITION_READY";
  if (modules.includes("BRAKES")) return "BRAKES_READY";
  if (modules.includes("GEARBOX")) return "GEARBOX_READY";
  if (modules.includes("CORE")) return "CORE_READY";
  return "WAITING_FOR_MODULES";
}

function buildAlerts(t: Pick<Telemetry, "battery" | "speed" | "ignition">): string[] {
  const a: string[] = [];
  if (t.ignition && t.battery <= 0) a.push("Bateria esgotada — sistema desligando");
  else if (t.ignition && t.battery <= 15) a.push(`Bateria baixa (${t.battery.toFixed(0)}%)`);
  if (t.speed > 60) a.push("Velocidade próxima ao limite");
  return a;
}

function next(prev: Telemetry, patch: Partial<Telemetry>): Telemetry {
  const merged = { ...prev, ...patch };
  const state = computeState(merged.modules, merged.ignition, merged.speed, merged.battery);
  const alerts = buildAlerts(merged);
  // Critical failure forces shutdown
  if (state === "CRITICAL_FAILURE") {
    return { ...merged, state, alerts, ignition: false, speed: 0, gear: "P", brake: 100 };
  }
  return { ...merged, state, alerts };
}

export function useKartSimulator() {
  const [t, setT] = useState<Telemetry>(INITIAL);

  const loadModule = useCallback((m: Module) => {
    setT((prev) => {
      if (prev.modules.includes(m)) return prev;
      return next(prev, { modules: [...prev.modules, m] });
    });
  }, []);

  const ignite = useCallback(() => {
    setT((prev) => {
      if (!prev.modules.includes("IGNITION")) return prev;
      if (prev.battery <= 0) return prev;
      const ignition = !prev.ignition;
      return next(prev, { ignition, gear: ignition ? "N" : "P", speed: 0 });
    });
  }, []);

  const accelerate = useCallback(() => {
    setT((prev) => {
      if (!prev.ignition || prev.battery <= 0) return prev;
      return next(prev, {
        speed: Math.min(70, prev.speed + 8),
        gear: "D",
        brake: 0,
      });
    });
  }, []);

  const brake = useCallback(() => {
    setT((prev) => {
      if (!prev.ignition) return prev;
      return next(prev, { speed: Math.max(0, prev.speed - 12), brake: 80 });
    });
  }, []);

  const drainBattery = useCallback(() => {
    setT((prev) => next(prev, { battery: Math.max(0, prev.battery - 25) }));
  }, []);

  const setKinematics = useCallback((speed: number, gear: import("./types").Gear) => {
    setT((prev) => {
      if (Math.abs(prev.speed - speed) < 0.2 && prev.gear === gear) return prev;
      return next(prev, { speed, gear });
    });
  }, []);

  const reset = useCallback(() => setT(INITIAL), []);

  // Brake bar natural decay only (speed driven by KartRig physics)
  useEffect(() => {
    const id = setInterval(() => {
      setT((prev) => {
        if (prev.brake === 0) return prev;
        return next(prev, { brake: Math.max(0, prev.brake - 8) });
      });
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Battery drain when driving
  useEffect(() => {
    if (t.state !== "DRIVING" && t.state !== "WARNING") return;
    const id = setInterval(() => {
      setT((prev) => next(prev, { battery: Math.max(0, prev.battery - 0.15) }));
    }, 500);
    return () => clearInterval(id);
  }, [t.state]);

  return { t, loadModule, ignite, accelerate, brake, drainBattery, reset, setKinematics };
}
