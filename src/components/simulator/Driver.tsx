import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

/**
 * Driver — stylized low-poly character (Rayssa #77).
 * Built from primitives so it always renders, no GLTF dependency.
 * Sits inside the kart cockpit.
 */
export function Driver({ driving }: { driving: boolean }) {
  const arms = useRef<Group>(null);

  useFrame((_, dt) => {
    if (!arms.current) return;
    // Subtle steering wobble while driving
    if (driving) {
      const t = performance.now() / 1000;
      arms.current.rotation.z = Math.sin(t * 2.4) * 0.08;
    } else {
      arms.current.rotation.z *= Math.pow(0.05, dt);
    }
  });

  // Suit colors: blue + orange (matches uploaded reference)
  const suitBlue = "#1e3a8a";
  const suitOrange = "#f97316";
  const skin = "#5b3320";
  const hair = "#1a1310";

  return (
    <group position={[0, 0.42, -0.1]}>
      {/* Torso — racing suit */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.32]} />
        <meshStandardMaterial color={suitBlue} roughness={0.7} />
      </mesh>
      {/* Orange chest stripe */}
      <mesh position={[0, 0.42, 0.165]} castShadow>
        <boxGeometry args={[0.44, 0.18, 0.005]} />
        <meshStandardMaterial color={suitOrange} roughness={0.6} />
      </mesh>
      {/* Number 77 placard */}
      <mesh position={[0, 0.28, 0.17]}>
        <planeGeometry args={[0.18, 0.1]} />
        <meshStandardMaterial color="#fde047" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.1, 12]} />
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.86, 0.02]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>

      {/* Hair — afro (cluster of small spheres) */}
      {[
        [0, 0.18, 0],
        [0.12, 0.14, 0],
        [-0.12, 0.14, 0],
        [0, 0.14, 0.12],
        [0, 0.14, -0.12],
        [0.1, 0.08, 0.1],
        [-0.1, 0.08, 0.1],
        [0.1, 0.08, -0.1],
        [-0.1, 0.08, -0.1],
        [0.16, 0.02, 0],
        [-0.16, 0.02, 0],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.86 + p[1], 0.02 + p[2]]} castShadow>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color={hair} roughness={0.95} />
        </mesh>
      ))}

      {/* Eyes */}
      <mesh position={[0.05, 0.88, 0.16]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[-0.05, 0.88, 0.16]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Arms forward holding the wheel */}
      <group ref={arms}>
        {/* Left arm */}
        <mesh position={[-0.22, 0.45, 0.28]} rotation={[Math.PI / 2.6, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 10]} />
          <meshStandardMaterial color={suitBlue} roughness={0.7} />
        </mesh>
        {/* Right arm */}
        <mesh position={[0.22, 0.45, 0.28]} rotation={[Math.PI / 2.6, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 10]} />
          <meshStandardMaterial color={suitBlue} roughness={0.7} />
        </mesh>
        {/* Gloves */}
        <mesh position={[-0.16, 0.32, 0.5]} castShadow>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
        </mesh>
        <mesh position={[0.16, 0.32, 0.5]} castShadow>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
        </mesh>
      </group>

      {/* Legs forward */}
      <mesh position={[-0.11, 0.05, 0.3]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.55, 10]} />
        <meshStandardMaterial color={suitBlue} roughness={0.7} />
      </mesh>
      <mesh position={[0.11, 0.05, 0.3]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.55, 10]} />
        <meshStandardMaterial color={suitBlue} roughness={0.7} />
      </mesh>
      {/* Boots */}
      <mesh position={[-0.11, -0.05, 0.55]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.18]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0.11, -0.05, 0.55]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.18]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}
