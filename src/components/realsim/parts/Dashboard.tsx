import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { DimProps } from "./shared";
import { RL_KART_DIMENSIONS, RL_KART_PART_NAMES } from "@/components/simulator/kart/RLKart26ADimensions";

interface Props {
  ignitionEnabled: boolean;
  warning: boolean;
  critical: boolean;
  dim: DimProps;
}

const D = RL_KART_DIMENSIONS;

/** Painel HUD + chave/ignição/safety key, montados próximos à coluna de direção. */
export function Dashboard({ ignitionEnabled, warning, critical, dim }: Props) {
  const blink = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((s) => {
    if (!blink.current) return;
    const t = s.clock.elapsedTime;
    if (critical) blink.current.emissiveIntensity = 1.5 + Math.sin(t * 8) * 1.0;
    else if (warning) blink.current.emissiveIntensity = 0.6 + Math.sin(t * 3) * 0.5;
    else blink.current.emissiveIntensity = 0.05;
  });

  // Sit near the steering column base, slightly to the right
  const baseY = D.steeringWheelHeight - 0.15;
  return (
    <group name={RL_KART_PART_NAMES.hudGroup} position={[0.18, baseY, 0.20]}>
      {/* Dashboard display */}
      <mesh castShadow name={RL_KART_PART_NAMES.dashboardDisplay}>
        <boxGeometry args={[0.14, 0.08, 0.10]} />
        <meshStandardMaterial color="#1a1d22" metalness={0.8} roughness={0.3} {...dim} />
      </mesh>
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[0.12, 0.06]} />
        <meshStandardMaterial
          color="#06121e"
          emissive={ignitionEnabled ? "#39a8ff" : "#06121e"}
          emissiveIntensity={ignitionEnabled ? 0.9 : 0.05}
          {...dim}
        />
      </mesh>

      {/* Start button (ignition power) */}
      <mesh
        name={RL_KART_PART_NAMES.startButton}
        position={[0, -0.06, 0.045]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.018, 0.018, 0.010, 16]} />
        <meshStandardMaterial
          color="#1a1d22"
          emissive={ignitionEnabled ? "#22ff88" : "#400"}
          emissiveIntensity={ignitionEnabled ? 1.6 : 0.4}
          metalness={0.85}
          roughness={0.3}
          {...dim}
        />
      </mesh>

      {/* Safety key cylinder, just left of start button */}
      <mesh
        name={RL_KART_PART_NAMES.safetyKey}
        position={[-0.045, -0.06, 0.045]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.012, 0.012, 0.020, 12]} />
        <meshStandardMaterial color="#a8a8a8" metalness={0.95} roughness={0.25} {...dim} />
      </mesh>

      {/* Alert LED */}
      <mesh position={[0.045, 0.025, 0.052]}>
        <sphereGeometry args={[0.010, 10, 10]} />
        <meshStandardMaterial
          ref={blink}
          color="#ff3333"
          emissive={critical ? "#ff3333" : warning ? "#ffaa33" : "#220000"}
          emissiveIntensity={0.05}
          {...dim}
        />
      </mesh>
    </group>
  );
}
