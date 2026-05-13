export type FocusTarget = "battery" | "brakes" | "steering" | "ignition" | "gearbox" | null;

export interface DimProps {
  opacity: number;
  transparent: boolean;
  wireframe: boolean;
}

export const computeDim = (
  focus: FocusTarget,
  target: Exclude<FocusTarget, null>,
): DimProps =>
  focus && focus !== target
    ? { opacity: 0.22, transparent: true, wireframe: false }
    : { opacity: 1, transparent: false, wireframe: false };

export const computeDimAny = (focus: FocusTarget): DimProps =>
  focus !== null
    ? { opacity: 0.55, transparent: true, wireframe: false }
    : { opacity: 1, transparent: false, wireframe: false };

/**
 * Anchor positions (in meters, blueprint scale) used by ModuleLabels,
 * Wiring and CameraController. Coordinates are in the kart's local space:
 * X = width, Y = height, Z = forward.
 */
export const MODULE_ANCHORS: Record<Exclude<FocusTarget, null>, [number, number, number]> = {
  battery: [0, 0.40, -0.20],
  brakes: [0.41, 0.30, -0.495],
  steering: [0, 0.58, 0.30],
  ignition: [0.18, 0.55, 0.20],
  gearbox: [0, 0.32, -0.40],
};
