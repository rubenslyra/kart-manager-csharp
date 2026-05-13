import * as THREE from "three";
import type { DimProps } from "./shared";
import { RL_KART_DIMENSIONS, RL_KART_PART_NAMES } from "@/components/simulator/kart/RLKart26ADimensions";

const D = RL_KART_DIMENSIONS;
const COLUMN_TILT = THREE.MathUtils.degToRad(25); // blueprint: 25° column

/** Steering column + D-shape wheel positioned at official 0.58 m height. */
export function Steering({ angleDeg, dim }: { angleDeg: number; dim: DimProps }) {
  const rad = THREE.MathUtils.degToRad(angleDeg);
  const wheelY = D.steeringWheelHeight;
  const wheelZ = 0.30;

  return (
    <group name="steering_assembly" position={[0, 0, 0]}>
      {/* Column from dashboard area down to footwell */}
      <mesh position={[0, wheelY - 0.18, wheelZ - 0.05]} rotation={[COLUMN_TILT, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.42, 14]} />
        <meshStandardMaterial color="#2a2f37" metalness={0.85} roughness={0.3} {...dim} />
      </mesh>
      {/* Wheel — D-shape: torus + spokes + RL hub */}
      <group
        name={RL_KART_PART_NAMES.steeringWheel}
        position={[0, wheelY, wheelZ]}
        rotation={[COLUMN_TILT, rad, 0]}
      >
        <mesh>
          <torusGeometry args={[0.12, 0.018, 12, 28]} />
          <meshStandardMaterial color="#1a1d22" metalness={0.6} roughness={0.5} {...dim} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.22, 0.018, 0.018]} />
          <meshStandardMaterial color="#1a1d22" metalness={0.6} roughness={0.5} {...dim} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <boxGeometry args={[0.22, 0.018, 0.018]} />
          <meshStandardMaterial color="#1a1d22" metalness={0.6} roughness={0.5} {...dim} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 3]}>
          <boxGeometry args={[0.22, 0.018, 0.018]} />
          <meshStandardMaterial color="#1a1d22" metalness={0.6} roughness={0.5} {...dim} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.035, 16]} />
          <meshStandardMaterial
            color="#39a8ff"
            emissive="#39a8ff"
            emissiveIntensity={0.7}
            metalness={0.5}
            roughness={0.4}
            {...dim}
          />
        </mesh>
      </group>
    </group>
  );
}
