import type { DimProps } from "./shared";
import { RL_KART_DERIVED, RL_KART_DIMENSIONS, RL_KART_PART_NAMES } from "@/components/simulator/kart/RLKart26ADimensions";

interface Props {
  dim: DimProps;
}

const D = RL_KART_DIMENSIONS;
const X = RL_KART_DERIVED;

/**
 * RL Kart 26A tubular carbon-steel frame, scaled to the official blueprint.
 * length 1.55 · width 0.98 · ground clearance 0.07 m.
 */
export function Chassis({ dim }: Props) {
  const Tube = ({
    pos,
    rot = [0, 0, 0],
    len,
    r = 0.022,
    name,
  }: {
    pos: [number, number, number];
    rot?: [number, number, number];
    len: number;
    r?: number;
    name?: string;
  }) => (
    <mesh position={pos} rotation={rot} castShadow name={name}>
      <cylinderGeometry args={[r, r, len, 12]} />
      <meshStandardMaterial
        color="#3a4452"
        metalness={0.92}
        roughness={0.32}
        emissive="#0a1a2c"
        emissiveIntensity={0.18}
        {...dim}
      />
    </mesh>
  );

  const sideRailX = 0.31;
  const railY = D.chassisGroundClearance + 0.06; // 0.13 m
  const upperRailY = 0.32;
  const railLen = D.length * 0.92; // 1.42 m
  const halfL = railLen / 2;
  const trackHalf = D.width / 2 - 0.05; // 0.44

  return (
    <group name={RL_KART_PART_NAMES.chassis}>
      {/* Floor pan (chassi) */}
      <mesh castShadow receiveShadow position={[0, D.chassisGroundClearance + 0.015, 0]} name="chassis_floor">
        <boxGeometry args={[0.62, 0.03, railLen]} />
        <meshStandardMaterial color="#1c2632" metalness={0.7} roughness={0.4} {...dim} />
      </mesh>

      {/* Side rails (long) */}
      <Tube name="rail_left" pos={[sideRailX, railY, 0]} rot={[Math.PI / 2, 0, 0]} len={railLen} r={0.024} />
      <Tube name="rail_right" pos={[-sideRailX, railY, 0]} rot={[Math.PI / 2, 0, 0]} len={railLen} r={0.024} />

      {/* Upper side protection rails */}
      <Tube name="upper_rail_left" pos={[trackHalf, upperRailY, 0]} rot={[Math.PI / 2, 0, 0]} len={D.length * 0.7} />
      <Tube name="upper_rail_right" pos={[-trackHalf, upperRailY, 0]} rot={[Math.PI / 2, 0, 0]} len={D.length * 0.7} />
      {/* Vertical struts connecting both rails */}
      {[-0.4, 0, 0.4].map((z) => (
        <Tube key={`sl${z}`} pos={[sideRailX + 0.06, (railY + upperRailY) / 2, z]} len={upperRailY - railY} />
      ))}
      {[-0.4, 0, 0.4].map((z) => (
        <Tube key={`sr${z}`} pos={[-(sideRailX + 0.06), (railY + upperRailY) / 2, z]} len={upperRailY - railY} />
      ))}

      {/* Cross bars */}
      <Tube name="cross_front" pos={[0, railY, halfL - 0.02]} rot={[0, 0, Math.PI / 2]} len={0.62} />
      <Tube name="cross_mid" pos={[0, railY, 0]} rot={[0, 0, Math.PI / 2]} len={0.62} />
      <Tube name="cross_rear" pos={[0, railY, -(halfL - 0.02)]} rot={[0, 0, Math.PI / 2]} len={0.62} />

      {/* Front bumper hoop @ frontBumperHeight */}
      <mesh position={[0, D.frontBumperHeight, X.noseZ - 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow name="front_bumper">
        <torusGeometry args={[0.30, 0.028, 10, 22, Math.PI]} />
        <meshStandardMaterial
          color="#3a4452"
          metalness={0.92}
          roughness={0.32}
          emissive="#0a1a2c"
          emissiveIntensity={0.18}
          {...dim}
        />
      </mesh>

      {/* Front + Rear axle tubes (visible bars between wheels) */}
      <Tube name="front_axle" pos={[0, X.wheelRadius, X.halfWheelbase]} rot={[0, 0, Math.PI / 2]} len={D.frontAxleWidth} r={0.022} />
      <Tube name="rear_axle" pos={[0, X.wheelRadius, -X.halfWheelbase]} rot={[0, 0, Math.PI / 2]} len={D.rearAxleWidth} r={0.026} />

      {/* Roll hoop behind seat */}
      <mesh position={[0, D.height - 0.05, -0.32]} castShadow name="roll_hoop">
        <torusGeometry args={[0.22, 0.025, 10, 22, Math.PI]} />
        <meshStandardMaterial
          color="#3a4452"
          metalness={0.92}
          roughness={0.32}
          emissive="#0a1a2c"
          emissiveIntensity={0.18}
          {...dim}
        />
      </mesh>
      <Tube pos={[0.22, (D.height - 0.05 + railY) / 2, -0.32]} len={D.height - 0.05 - railY} />
      <Tube pos={[-0.22, (D.height - 0.05 + railY) / 2, -0.32]} len={D.height - 0.05 - railY} />

      {/* Motor mount cradle (rear) */}
      <Tube pos={[0.14, railY + 0.04, -0.5]} rot={[Math.PI / 2, 0, 0]} len={0.22} r={0.018} />
      <Tube pos={[-0.14, railY + 0.04, -0.5]} rot={[Math.PI / 2, 0, 0]} len={0.22} r={0.018} />
    </group>
  );
}
