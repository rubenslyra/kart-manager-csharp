// Data contract shared with the C# console (DLLs).
// This is the canonical JSON the kart receives every tick.

export type VehicleState =
  | "OFF"
  | "WAITING_FOR_MODULES"
  | "CORE_READY"
  | "GEARBOX_READY"
  | "BRAKES_READY"
  | "IGNITION_READY"
  | "READY_TO_DRIVE"
  | "DRIVING"
  | "WARNING"
  | "CRITICAL_FAILURE"
  | "SHUTDOWN";

export type ModuleStatus = "missing" | "ok" | "warning" | "critical";
export type Gear = "P" | "R" | "N" | "D" | "B";

export interface CoreModule {
  loaded: boolean;
  status: ModuleStatus;
}
export interface GearboxModule {
  loaded: boolean;
  currentGear: Gear;
  status: ModuleStatus;
}
export interface BrakesModule {
  loaded: boolean;
  pedalPressure: number; // 0..1
  discTemperature: number; // °C
  regenLevel: number; // 0..1
  status: ModuleStatus;
}
export interface IgnitionModule {
  loaded: boolean;
  enabled: boolean;
  status: ModuleStatus;
}
export interface BatteryModule {
  level: number; // 0..100
  voltage: number;
  temperature: number;
  status: ModuleStatus;
}
export interface SteeringModule {
  angle: number; // -1..1 (normalized) or degrees — used as degrees
  status: ModuleStatus;
}
export interface SuspensionModule {
  frontLeftCompression: number;
  frontRightCompression: number;
  rearLeftCompression: number;
  rearRightCompression: number;
}

export interface KartTelemetry {
  timestamp: string;
  vehicleState: VehicleState;
  speedKmh?: number;
  modules: {
    core: CoreModule;
    gearbox: GearboxModule;
    brakes: BrakesModule;
    ignition: IgnitionModule;
    battery: BatteryModule;
    steering: SteeringModule;
    suspension: SuspensionModule;
  };
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
export type DataSource = "mock" | "real";

export const INITIAL_TELEMETRY: KartTelemetry = {
  timestamp: new Date(0).toISOString(),
  vehicleState: "OFF",
  speedKmh: 0,
  modules: {
    core: { loaded: false, status: "missing" },
    gearbox: { loaded: false, currentGear: "P", status: "missing" },
    brakes: {
      loaded: false,
      pedalPressure: 0,
      discTemperature: 30,
      regenLevel: 0,
      status: "missing",
    },
    ignition: { loaded: false, enabled: false, status: "missing" },
    battery: { level: 78, voltage: 48, temperature: 32, status: "ok" },
    steering: { angle: 0, status: "ok" },
    suspension: {
      frontLeftCompression: 0,
      frontRightCompression: 0,
      rearLeftCompression: 0,
      rearRightCompression: 0,
    },
  },
};
