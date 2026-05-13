import { Billboard, Line, Text } from "@react-three/drei";
import * as THREE from "three";
import type { KartTelemetry } from "@/bridge/types";
import { MODULE_ANCHORS, type FocusTarget } from "./parts/shared";

interface Props {
  telemetry: KartTelemetry;
  focus: FocusTarget;
  enabled: boolean;
}

/** Raio-X overlay: dimension lines + telemetry dimension callouts on the focused module. */
export function XRayOverlay({ telemetry, focus, enabled }: Props) {
  if (!enabled || !focus) return null;
  const a = MODULE_ANCHORS[focus];
  const m = telemetry.modules;

  const callouts: string[] = (() => {
    switch (focus) {
      case "battery":
        return [
          `level: ${m.battery.level.toFixed(1)}%`,
          `voltage: ${m.battery.voltage.toFixed(2)} V`,
          `temp: ${m.battery.temperature.toFixed(1)} °C`,
          `status: ${m.battery.status.toUpperCase()}`,
        ];
      case "brakes":
        return [
          `disc: ${m.brakes.discTemperature.toFixed(1)} °C`,
          `pedal: ${(m.brakes.pedalPressure * 100).toFixed(1)} %`,
          `regen: ${(m.brakes.regenLevel * 100).toFixed(1)} %`,
          `loaded: ${m.brakes.loaded ? "yes" : "no"}`,
        ];
      case "steering":
        return [`angle: ${m.steering.angle.toFixed(2)} °`, `status: ${m.steering.status.toUpperCase()}`];
      case "ignition":
        return [
          `enabled: ${m.ignition.enabled ? "ON" : "OFF"}`,
          `loaded: ${m.ignition.loaded ? "yes" : "no"}`,
          `status: ${m.ignition.status.toUpperCase()}`,
        ];
      case "gearbox":
        return [
          `gear: ${m.gearbox.currentGear}`,
          `loaded: ${m.gearbox.loaded ? "yes" : "no"}`,
          `status: ${m.gearbox.status.toUpperCase()}`,
        ];
    }
  })();

  // Dimension cross over the anchor (scaled to blueprint distances)
  const reach = 0.30;
  const offsetY = 0.25;
  const center = new THREE.Vector3(a[0], a[1] + offsetY, a[2]);
  const left = new THREE.Vector3(a[0] - reach, a[1] + offsetY, a[2]);
  const right = new THREE.Vector3(a[0] + reach, a[1] + offsetY, a[2]);
  const down = new THREE.Vector3(a[0], a[1], a[2]);

  return (
    <group>
      {/* Pulsing scanning ring at anchor */}
      <mesh position={a} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.10, 0.13, 32]} />
        <meshBasicMaterial color="#39a8ff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Dimension lines */}
      <Line points={[left, right]} color="#39a8ff" lineWidth={1.5} />
      <Line points={[center, down]} color="#39a8ff" lineWidth={1.2} dashed dashSize={0.03} gapSize={0.02} />

      {/* Tick marks */}
      {[left, right].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.008, 0.04, 0.008]} />
          <meshBasicMaterial color="#39a8ff" />
        </mesh>
      ))}

      {/* Callout panel */}
      <Billboard position={[a[0] + 0.45, a[1] + 0.35, a[2]]}>
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[0.95, 0.06 + callouts.length * 0.09]} />
          <meshBasicMaterial color="#06121e" transparent opacity={0.78} />
        </mesh>
        {callouts.map((line, i) => (
          <Text
            key={i}
            position={[-0.42, (callouts.length - 1) * 0.045 - i * 0.09, 0]}
            fontSize={0.055}
            color="#cfe9ff"
            anchorX="left"
            outlineWidth={0.004}
            outlineColor="#06121e"
          >
            {line}
          </Text>
        ))}
      </Billboard>
    </group>
  );
}
