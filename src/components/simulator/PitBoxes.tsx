import { Text } from "@react-three/drei";

interface Box {
  pos: [number, number, number];
  label: string;
  color: string;
  official?: boolean;
}

const BOXES: Box[] = [
  { pos: [-26, 0, -12], label: "TEAM 01", color: "#3b82f6" },
  { pos: [-20, 0, -12], label: "TEAM 02", color: "#22d3ee" },
  { pos: [-14, 0, -12], label: "TEAM 03", color: "#f59e0b" },
  { pos: [-8, 0, -12], label: "TEAM 04", color: "#22c55e" },
  { pos: [-17, 0, -16], label: "RACE CONTROL", color: "#ef4444", official: true },
];

export function PitBoxes() {
  return (
    <group>
      {BOXES.map((b, i) => (
        <group key={i} position={b.pos}>
          {/* Floor pad */}
          <mesh position={[0, -0.01, 0]} receiveShadow>
            <boxGeometry args={[5, 0.02, 3]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          {/* Roof */}
          <mesh position={[0, 2.6, 0]} castShadow>
            <boxGeometry args={[5.2, 0.15, 3.2]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Back wall */}
          <mesh position={[0, 1.3, -1.4]} castShadow>
            <boxGeometry args={[5, 2.5, 0.15]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          {/* Side pillars */}
          <mesh position={[-2.45, 1.3, 0]}>
            <boxGeometry args={[0.15, 2.5, 2.8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[2.45, 1.3, 0]}>
            <boxGeometry args={[0.15, 2.5, 2.8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Color band / signage */}
          <mesh position={[0, 2.25, -1.31]}>
            <boxGeometry args={[4.8, 0.4, 0.05]} />
            <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={b.official ? 1.2 : 0.6} />
          </mesh>
          <Text
            position={[0, 2.25, -1.27]}
            fontSize={0.28}
            color="#0b1020"
            anchorX="center"
            anchorY="middle"
          >
            {b.label}
          </Text>
        </group>
      ))}
    </group>
  );
}
