/**
 * Official RL Kart 26A blueprint dimensions.
 *
 * Coordinate convention (Three.js):
 *   1 unit = 1 meter
 *   X = width (left/right)
 *   Y = height (up)
 *   Z = forward (kart nose points to +Z)
 *   Pivot/origin: chassis center, at ground level (y = 0)
 *
 * Source: RL KART 26A — Plataforma Modular, Versão 1.0 blueprint.
 */
export const RL_KART_DIMENSIONS = {
  length: 1.55,
  width: 0.98,
  height: 0.65,
  chassisGroundClearance: 0.07,
  frontBumperHeight: 0.12,
  wheelbase: 0.99,
  frontAxleWidth: 0.79,
  rearAxleWidth: 0.82,
  wheelDiameter: 0.28,
  seatToPedalDistance: 0.65,
  steeringWheelHeight: 0.58,
} as const;

export type RLKartDimensions = typeof RL_KART_DIMENSIONS;

/** Derived helpers — keep the rest of the model in sync with the blueprint. */
export const RL_KART_DERIVED = {
  wheelRadius: RL_KART_DIMENSIONS.wheelDiameter / 2, // 0.14 m
  halfFrontTrack: RL_KART_DIMENSIONS.frontAxleWidth / 2, // 0.395 m
  halfRearTrack: RL_KART_DIMENSIONS.rearAxleWidth / 2, // 0.41 m
  halfWheelbase: RL_KART_DIMENSIONS.wheelbase / 2, // 0.495 m
  // Front bumper sits on the nose; rear motor sits behind rear axle.
  noseZ: RL_KART_DIMENSIONS.wheelbase / 2 + 0.18, // ~0.675 m
  rearMotorZ: -(RL_KART_DIMENSIONS.wheelbase / 2 + 0.13), // ~-0.625 m
} as const;

/**
 * Canonical part / group names used for animation, audit and future GLB binding.
 * Mirror these as `name` on the corresponding three.js objects.
 */
export const RL_KART_PART_NAMES = {
  root: "RL_KART_26A",
  chassis: "CHASSI_TUBULAR",
  wheelsGroup: "RODAS_E_EIXOS",
  wheelFL: "wheel_FL",
  wheelFR: "wheel_FR",
  wheelRL: "wheel_RL",
  wheelRR: "wheel_RR",
  seatGroup: "BANCO_E_DIRECAO",
  steeringWheel: "steering_wheel",
  electricalGroup: "SISTEMA_ELETRICO",
  batteryPack: "battery_pack",
  bmsBox: "bms_box",
  controllerBox: "controller_box",
  motorRear: "motor_rear",
  brakesGroup: "FREIOS",
  brakeDiscRear: "brake_disc_rear",
  brakeCaliper: "brake_caliper",
  brakePedal: "brake_pedal",
  ignitionGroup: "IGNICAO_PARTIDA",
  startButton: "start_button",
  safetyKey: "safety_key",
  gearboxGroup: "CAIXA_DE_MARCHA",
  gearSelector: "gear_selector",
  hudGroup: "PAINEL_HUD",
  dashboardDisplay: "dashboard_display",
  wiringGroup: "CABOS_CHICOTES",
} as const;
