import type { KartTelemetry, VehicleState } from "./types";

export interface ChecklistItem {
  id: string;
  label: string;
  ok: boolean;
}

export function buildChecklist(t: KartTelemetry): ChecklistItem[] {
  const m = t.modules;
  return [
    { id: "core", label: "Core carregado", ok: m.core.loaded && m.core.status !== "critical" },
    { id: "gearbox", label: "Câmbio carregado", ok: m.gearbox.loaded },
    { id: "brakes", label: "Freios carregados", ok: m.brakes.loaded },
    { id: "ignition", label: "Ignição carregada", ok: m.ignition.loaded },
    { id: "battery", label: "Bateria > 15%", ok: m.battery.level > 15 && m.battery.status !== "critical" },
    {
      id: "brakes_resp",
      label: "Freio respondendo",
      ok: m.brakes.loaded && m.brakes.status !== "critical",
    },
    {
      id: "park",
      label: "Marcha em P antes da ignição",
      ok: m.ignition.enabled ? m.gearbox.currentGear !== "P" || true : m.gearbox.currentGear === "P",
    },
    { id: "no_critical", label: "Sem alerta crítico", ok: !hasCritical(t) },
  ];
}

export function hasCritical(t: KartTelemetry): boolean {
  const m = t.modules;
  return (
    m.core.status === "critical" ||
    m.gearbox.status === "critical" ||
    m.brakes.status === "critical" ||
    m.ignition.status === "critical" ||
    m.battery.status === "critical"
  );
}

export function hasWarning(t: KartTelemetry): boolean {
  const m = t.modules;
  return (
    m.battery.status === "warning" ||
    m.brakes.status === "warning" ||
    m.battery.level <= 15
  );
}

export function isChecklistComplete(t: KartTelemetry): boolean {
  return buildChecklist(t).every((c) => c.ok);
}

export function canLeavePit(t: KartTelemetry): boolean {
  const m = t.modules;
  if (!m.core.loaded || !m.gearbox.loaded || !m.brakes.loaded || !m.ignition.loaded) return false;
  if (m.battery.status === "warning" || m.battery.status === "critical") return false;
  if (hasCritical(t)) return false;
  if (!isChecklistComplete(t)) return false;
  return true;
}

/** Derive the canonical vehicle state from current telemetry. */
export function deriveState(t: KartTelemetry, prev?: VehicleState): VehicleState {
  if (hasCritical(t)) return "CRITICAL_FAILURE";
  const m = t.modules;
  if (!m.core.loaded && !m.gearbox.loaded && !m.brakes.loaded && !m.ignition.loaded) {
    return prev === "OFF" ? "OFF" : "WAITING_FOR_MODULES";
  }
  if (canLeavePit(t)) {
    if (prev === "DRIVING") return "DRIVING";
    if (hasWarning(t)) return "WARNING";
    return "READY_TO_DRIVE";
  }
  if (m.ignition.loaded) return "IGNITION_READY";
  if (m.brakes.loaded) return "BRAKES_READY";
  if (m.gearbox.loaded) return "GEARBOX_READY";
  if (m.core.loaded) return "CORE_READY";
  return "WAITING_FOR_MODULES";
}
