export type KartState =
  | "OFF"
  | "WAITING_FOR_MODULES"
  | "CORE_READY"
  | "GEARBOX_READY"
  | "BRAKES_READY"
  | "IGNITION_READY"
  | "READY_TO_DRIVE"
  | "DRIVING"
  | "WARNING"
  | "CRITICAL_FAILURE";

export type Gear = "P" | "R" | "N" | "D" | "B";

export type Module = "CORE" | "GEARBOX" | "BRAKES" | "IGNITION";

export interface Telemetry {
  state: KartState;
  battery: number;
  gear: Gear;
  brake: number;
  ignition: boolean;
  speed: number;
  modules: Module[];
  alerts: string[];
}

export const STATE_COLOR: Record<KartState, string> = {
  OFF: "#6b7280",
  WAITING_FOR_MODULES: "#9ca3af",
  CORE_READY: "#3b82f6",
  GEARBOX_READY: "#3b82f6",
  BRAKES_READY: "#3b82f6",
  IGNITION_READY: "#22d3ee",
  READY_TO_DRIVE: "#22c55e",
  DRIVING: "#22c55e",
  WARNING: "#f59e0b",
  CRITICAL_FAILURE: "#ef4444",
};

export const STATE_LABEL: Record<KartState, string> = {
  OFF: "Desligado",
  WAITING_FOR_MODULES: "Aguardando módulos",
  CORE_READY: "Core carregado",
  GEARBOX_READY: "Câmbio carregado",
  BRAKES_READY: "Freios carregados",
  IGNITION_READY: "Ignição pronta",
  READY_TO_DRIVE: "Pronto para dirigir",
  DRIVING: "Em movimento",
  WARNING: "Alerta — Bateria baixa",
  CRITICAL_FAILURE: "Falha crítica",
};
