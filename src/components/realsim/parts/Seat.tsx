import type { DimProps } from "./shared";

/** Bucket seat — placed so seatback top sits ~0.55 m above ground. */
export function Seat({ dim }: { dim: DimProps }) {
  return (
    <group name="bucket_seat">
      {/* Bucket base */}
      <mesh position={[0, 0.20, -0.08]} castShadow>
        <boxGeometry args={[0.36, 0.10, 0.40]} />
        <meshStandardMaterial color="#0d1117" metalness={0.15} roughness={0.95} {...dim} />
      </mesh>
      {/* Side bolsters */}
      <mesh position={[0.18, 0.30, -0.10]} castShadow>
        <boxGeometry args={[0.05, 0.28, 0.36]} />
        <meshStandardMaterial color="#0d1117" metalness={0.15} roughness={0.95} {...dim} />
      </mesh>
      <mesh position={[-0.18, 0.30, -0.10]} castShadow>
        <boxGeometry args={[0.05, 0.28, 0.36]} />
        <meshStandardMaterial color="#0d1117" metalness={0.15} roughness={0.95} {...dim} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.42, -0.26]} rotation={[-0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.34, 0.46, 0.05]} />
        <meshStandardMaterial color="#0d1117" metalness={0.15} roughness={0.95} {...dim} />
      </mesh>
      {/* Headrest */}
      <mesh position={[0, 0.66, -0.30]} rotation={[-0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.22, 0.10, 0.06]} />
        <meshStandardMaterial color="#0d1117" metalness={0.15} roughness={0.95} {...dim} />
      </mesh>
      {/* Belt anchors (red accents) */}
      <mesh position={[0.14, 0.48, -0.22]}>
        <boxGeometry args={[0.035, 0.035, 0.035]} />
        <meshStandardMaterial color="#d33" emissive="#400" emissiveIntensity={0.5} {...dim} />
      </mesh>
      <mesh position={[-0.14, 0.48, -0.22]}>
        <boxGeometry args={[0.035, 0.035, 0.035]} />
        <meshStandardMaterial color="#d33" emissive="#400" emissiveIntensity={0.5} {...dim} />
      </mesh>
    </group>
  );
}
