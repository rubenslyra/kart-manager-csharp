import { Text } from "@react-three/drei";
import type { Gear } from "@/bridge/types";
import type { DimProps } from "./shared";
import { RL_KART_PART_NAMES } from "@/components/simulator/kart/RLKart26ADimensions";

const GEARS: Gear[] = ["P", "R", "N", "D", "B"];

/** Caixa de marcha — placa pedagógica P/R/N/D/B com letra ativa emissiva. */
export function GearSelector({ current, dim }: { current: Gear; dim: DimProps }) {
  return (
    <group
      name={RL_KART_PART_NAMES.gearSelector}
      position={[0, 0.30, -0.04]}
      rotation={[-0.4, 0, 0]}
    >
      {/* Plate */}
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.08, 0.025]} />
        <meshStandardMaterial color="#0c1118" metalness={0.6} roughness={0.5} {...dim} />
      </mesh>
      {GEARS.map((g, i) => {
        const x = -0.10 + i * 0.05;
        const active = g === current;
        return (
          <Text
            key={g}
            position={[x, 0, 0.018]}
            fontSize={0.045}
            color={active ? "#5be39a" : "#39a8ff"}
            anchorX="center"
            anchorY="middle"
            outlineWidth={active ? 0.003 : 0}
            outlineColor="#0a1018"
          >
            {g}
          </Text>
        );
      })}
      {/* Active marker dot */}
      <mesh position={[-0.10 + GEARS.indexOf(current) * 0.05, -0.032, 0.018]}>
        <sphereGeometry args={[0.008, 10, 10]} />
        <meshStandardMaterial color="#5be39a" emissive="#5be39a" emissiveIntensity={2} {...dim} />
      </mesh>
    </group>
  );
}
