import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { KartTelemetry } from "@/bridge/types";
import type { FocusTarget } from "./parts/shared";

interface CableDef {
  id: string;
  module: Exclude<FocusTarget, null>;
  color: string;
  pts: [number, number, number][];
}

// Coordinates in blueprint scale (meters), kart pivot at ground level.
const CABLES: CableDef[] = [
  // Battery → controller
  { id: "bat-ctrl", module: "battery", color: "#a31818", pts: [[0.27, 0.32, -0.28], [0.28, 0.34, -0.36], [0.27, 0.32, -0.42]] },
  // Controller → motor
  { id: "ctrl-motor", module: "ignition", color: "#39a8ff", pts: [[0.18, 0.30, -0.50], [0.10, 0.22, -0.58], [0.0, 0.18, -0.62]] },
  // Controller → start button / dashboard
  { id: "ctrl-ign", module: "ignition", color: "#5be39a", pts: [[0.22, 0.36, -0.40], [0.20, 0.46, -0.05], [0.18, 0.50, 0.18]] },
  // Brake pedal → calipers via spine under floor
  { id: "brake-line", module: "brakes", color: "#ff8a3a", pts: [[0.10, 0.20, 0.40], [0.18, 0.18, 0.10], [0.32, 0.18, -0.30], [0.41, 0.24, -0.50]] },
  { id: "brake-line2", module: "brakes", color: "#ff8a3a", pts: [[0.10, 0.20, 0.40], [-0.05, 0.18, 0.10], [-0.32, 0.18, -0.30], [-0.41, 0.24, -0.50]] },
  // Steering column → rack → hubs
  { id: "steer-link", module: "steering", color: "#cfd6e0", pts: [[0.0, 0.45, 0.30], [0.0, 0.20, 0.45], [0.39, 0.18, 0.50]] },
  { id: "steer-link2", module: "steering", color: "#cfd6e0", pts: [[0.0, 0.45, 0.30], [0.0, 0.20, 0.45], [-0.39, 0.18, 0.50]] },
  // Gearbox shifter → transaxle housing
  { id: "shift", module: "gearbox", color: "#5be39a", pts: [[0.0, 0.32, -0.05], [0.0, 0.18, -0.42]] },
];

interface Props {
  telemetry: KartTelemetry;
  focus: FocusTarget;
  visible: boolean;
}

export function Wiring({ telemetry, focus, visible }: Props) {
  const m = telemetry.modules;

  const moduleActive = (mod: Exclude<FocusTarget, null>): boolean => {
    if (mod === "battery") return m.battery.level > 0 && m.battery.status !== "critical";
    if (mod === "brakes") return m.brakes.loaded;
    if (mod === "steering") return true;
    if (mod === "ignition") return m.ignition.loaded;
    if (mod === "gearbox") return m.gearbox.loaded;
    return false;
  };

  const cables = useMemo(
    () =>
      CABLES.map((c) => {
        const curve = new THREE.CatmullRomCurve3(c.pts.map((p) => new THREE.Vector3(...p)));
        const geometry = new THREE.TubeGeometry(curve, 32, 0.012, 8, false);
        return { ...c, geometry };
      }),
    [],
  );

  // Pulsing materials
  const matsRef = useRef<Record<string, THREE.MeshStandardMaterial>>({});

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    cables.forEach((c) => {
      const mat = matsRef.current[c.id];
      if (!mat) return;
      const isFocus = focus === c.module;
      const active = moduleActive(c.module);
      const base = active ? 0.6 : 0.12;
      const pulse = active ? Math.sin(t * 4 + c.id.length) * 0.4 : 0;
      mat.emissiveIntensity = base + pulse + (isFocus ? 0.6 : 0);
      mat.opacity = focus !== null && focus !== c.module ? 0.18 : 1;
      mat.transparent = focus !== null && focus !== c.module;
    });
  });

  if (!visible) return null;

  return (
    <group position={[0, 0, 0]}>
      {cables.map((c) => (
        <mesh key={c.id} geometry={c.geometry}>
          <meshStandardMaterial
            ref={(r) => {
              if (r) matsRef.current[c.id] = r;
            }}
            color={c.color}
            emissive={c.color}
            emissiveIntensity={0.4}
            metalness={0.2}
            roughness={0.55}
          />
        </mesh>
      ))}
    </group>
  );
}
