import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Wheel } from "./Wheels";
import type { DimProps } from "./shared";
import { RL_KART_DERIVED, RL_KART_PART_NAMES } from "@/components/simulator/kart/RLKart26ADimensions";

interface Props {
  pedalPressure: number;
  discTemperature: number;
  regen: number;
  steeringAngleDeg: number;
  dim: DimProps;
  /** Refs for suspension compression — controlled by parent for telemetry. */
  susRefs: {
    fl: React.MutableRefObject<THREE.Group | null>;
    fr: React.MutableRefObject<THREE.Group | null>;
    rl: React.MutableRefObject<THREE.Group | null>;
    rr: React.MutableRefObject<THREE.Group | null>;
  };
  wheelRefs: {
    fl: React.MutableRefObject<THREE.Group | null>;
    fr: React.MutableRefObject<THREE.Group | null>;
  };
  pedalRef: React.MutableRefObject<THREE.Mesh | null>;
}

export function BrakeSystem({
  discTemperature,
  regen,
  pedalPressure,
  dim,
  susRefs,
  wheelRefs,
  pedalRef,
}: Props) {
  const discMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3a3f47",
        emissive: "#000000",
        metalness: 0.7,
        roughness: 0.35,
      }),
    [],
  );

  useFrame(() => {
    const t = THREE.MathUtils.clamp((discTemperature - 30) / 470, 0, 1);
    discMat.emissive.setRGB(t, t * 0.15, 0);
    discMat.emissiveIntensity = 0.3 + t * 1.8;
  });

  // Caliper visual factory
  const Caliper = ({ position }: { position: [number, number, number] }) => (
    <mesh position={position} castShadow name={RL_KART_PART_NAMES.brakeCaliper}>
      <boxGeometry args={[0.06, 0.10, 0.06]} />
      <meshStandardMaterial
        color="#a31818"
        emissive="#400"
        emissiveIntensity={0.5 + pedalPressure * 1.2}
        metalness={0.6}
        roughness={0.4}
        {...dim}
      />
    </mesh>
  );

  const X = RL_KART_DERIVED;
  const wheelY = X.wheelRadius;

  return (
    <group name={RL_KART_PART_NAMES.wheelsGroup}>
      <Wheel
        ref={wheelRefs.fl}
        name={RL_KART_PART_NAMES.wheelFL}
        position={[X.halfFrontTrack, wheelY, X.halfWheelbase]}
        discMat={discMat}
        susRef={susRefs.fl}
        dim={dim}
      />
      <Wheel
        ref={wheelRefs.fr}
        name={RL_KART_PART_NAMES.wheelFR}
        position={[-X.halfFrontTrack, wheelY, X.halfWheelbase]}
        discMat={discMat}
        susRef={susRefs.fr}
        dim={dim}
      />
      <Wheel
        name={RL_KART_PART_NAMES.wheelRL}
        position={[X.halfRearTrack, wheelY, -X.halfWheelbase]}
        discMat={discMat}
        susRef={susRefs.rl}
        dim={dim}
      />
      <Wheel
        name={RL_KART_PART_NAMES.wheelRR}
        position={[-X.halfRearTrack, wheelY, -X.halfWheelbase]}
        discMat={discMat}
        susRef={susRefs.rr}
        dim={dim}
      />

      {/* Calipers (rear) */}
      <Caliper position={[X.halfRearTrack, wheelY + 0.10, -X.halfWheelbase]} />
      <Caliper position={[-X.halfRearTrack, wheelY + 0.10, -X.halfWheelbase]} />

      {/* Brake pedal — at footwell, just inside front cross bar */}
      <mesh ref={pedalRef} position={[0.10, 0.22, 0.42]} name={RL_KART_PART_NAMES.brakePedal}>
        <boxGeometry args={[0.08, 0.025, 0.12]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.4} {...dim} />
      </mesh>

      {/* Regen LED indicator */}
      <mesh position={[-0.28, 0.55, 0.0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial
          color="#0f0"
          emissive="#0f8"
          emissiveIntensity={regen * 2.5 + 0.2}
          {...dim}
        />
      </mesh>
    </group>
  );
}
