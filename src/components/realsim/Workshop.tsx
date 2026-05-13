import { useMemo } from "react";
import * as THREE from "three";
import { MeshReflectorMaterial, Text } from "@react-three/drei";
import { EngineTestRig } from "./parts/MotorAssembly";

/** Cinematic engineering workshop: reflective floor, hydraulic lift, racks, holo panels. */
export function Workshop() {
  const stripeMatrices = useMemo(() => {
    const arr: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    for (let i = 0; i < 8; i++) {
      m.makeTranslation(0, 0.011, -1.6 + i * 0.46);
      arr.push(m.clone());
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Reflective industrial floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          color="#1a2230"
          metalness={0.65}
          roughness={0.55}
          mirror={0.35}
          mixBlur={1.6}
          mixStrength={1.1}
          resolution={512}
          blur={[400, 100]}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          depthScale={1.1}
        />
      </mesh>

      {/* RL grid */}
      <gridHelper args={[40, 40, "#39a8ff", "#1f344a"]} position={[0, 0.003, 0]} />

      {/* Inspection pad — flush with floor (kart sits ON TOP, never inside) */}
      <group position={[0, 0, 0]}>
        {/* Polished service pad (top at y = 0.02) */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[2.6, 0.02, 3.2]} />
          <meshStandardMaterial color="#2a3544" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Painted RL outline around pad */}
        <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.7, 1.78, 48]} />
          <meshBasicMaterial color="#39a8ff" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Caution stripes flanking the pad — flat on floor, NEVER above the kart */}
      {stripeMatrices.map((mat, i) => {
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scl = new THREE.Vector3();
        mat.decompose(pos, quat, scl);
        return (
          <group key={i}>
            <mesh position={[1.65, 0.024, pos.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.4, 0.05]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#39a8ff" : "#ffb340"} />
            </mesh>
            <mesh position={[-1.65, 0.024, pos.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.4, 0.05]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#39a8ff" : "#ffb340"} />
            </mesh>
          </group>
        );
      })}

      {/* Walls */}
      <mesh position={[0, 3, -8]} receiveShadow>
        <boxGeometry args={[30, 6, 0.3]} />
        <meshStandardMaterial color="#172230" metalness={0.4} roughness={0.65} />
      </mesh>
      <mesh position={[-15, 3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 16]} />
        <meshStandardMaterial color="#172230" metalness={0.4} roughness={0.65} />
      </mesh>
      <mesh position={[15, 3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 16]} />
        <meshStandardMaterial color="#172230" metalness={0.4} roughness={0.65} />
      </mesh>

      {/* Ceiling LED bars */}
      {[-4, 0, 4].map((x) => (
        <mesh key={x} position={[x, 5.4, -2]}>
          <boxGeometry args={[2.4, 0.08, 0.18]} />
          <meshBasicMaterial color="#7ec8ff" />
        </mesh>
      ))}
      {/* Ceiling support cables */}
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, 4.5, -2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.8, 6]} />
          <meshStandardMaterial color="#1a1d22" metalness={0.5} />
        </mesh>
      ))}

      <DiagnosticBay position={[-5.0, 0, -2]} />
      <Workbench position={[5.0, 0, -1.5]} />
      <AcousticEngineRoom position={[7.2, 0, 3.9]} />
      <ToolRack position={[-5.5, 0, 2]} />
      <ToolRack position={[5.5, 0, 2]} />

      <FloatingPanel position={[-3.4, 2.7, -3.5]} color="#39a8ff" label="MODULES OK" />
      <FloatingPanel position={[3.4, 2.7, -3.5]} color="#5be39a" label="TELEMETRY" />

      {/* Lighting — RL palette, cinematic */}
      <ambientLight intensity={0.55} color="#9ec8ff" />
      <hemisphereLight args={["#cfe3ff", "#1a2230", 0.5]} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-6, 5, 3]} intensity={2.2} color="#39a8ff" distance={18} />
      <pointLight position={[6, 5, 3]} intensity={2.2} color="#39a8ff" distance={18} />
      <pointLight position={[0, 5.2, -6]} intensity={1.6} color="#5be39a" distance={14} />
      <spotLight
        position={[0, 8, 4]}
        target-position={[0, 0.6, 0]}
        intensity={3.2}
        angle={0.55}
        penumbra={0.8}
        color="#ffffff"
        castShadow
      />
      {/* Rim back light */}
      <spotLight
        position={[-4, 3, -5]}
        target-position={[0, 0.6, 0]}
        intensity={1.4}
        angle={0.7}
        penumbra={0.9}
        color="#39a8ff"
      />
    </group>
  );
}

function AcousticEngineRoom({ position }: { position: [number, number, number] }) {
  const foamPanels = [
    [-1.05, 1.0, -0.76, 0],
    [-0.55, 1.0, -0.76, 0],
    [-0.05, 1.0, -0.76, 0],
    [0.45, 1.0, -0.76, 0],
    [0.95, 1.0, -0.76, 0],
    [-1.16, 1.0, -0.25, Math.PI / 2],
    [-1.16, 1.0, 0.25, Math.PI / 2],
    [1.16, 1.0, -0.25, Math.PI / 2],
    [1.16, 1.0, 0.25, Math.PI / 2],
  ] as const;

  return (
    <group position={position}>
      <mesh position={[0, 0.035, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.07, 1.8]} />
        <meshStandardMaterial color="#1b2430" metalness={0.64} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.05, -0.9]} receiveShadow>
        <boxGeometry args={[2.6, 2.1, 0.08]} />
        <meshStandardMaterial color="#111820" metalness={0.25} roughness={0.84} />
      </mesh>
      <mesh position={[-1.3, 1.05, 0]} receiveShadow>
        <boxGeometry args={[0.08, 2.1, 1.8]} />
        <meshStandardMaterial color="#111820" metalness={0.25} roughness={0.84} />
      </mesh>
      <mesh position={[1.3, 1.05, 0]} receiveShadow>
        <boxGeometry args={[0.08, 2.1, 1.8]} />
        <meshStandardMaterial color="#111820" metalness={0.25} roughness={0.84} />
      </mesh>

      {foamPanels.map(([x, y, z, rot], i) => (
        <mesh key={`foam-${i}`} position={[x, y, z]} rotation={[0, rot, 0]}>
          <boxGeometry args={[0.32, 0.78, 0.035]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#202a35" : "#151c24"} roughness={0.98} />
        </mesh>
      ))}

      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[2.6, 0.08, 1.8]} />
        <meshStandardMaterial color="#17212b" metalness={0.35} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.92, 0]}>
        <boxGeometry args={[1.4, 0.025, 0.12]} />
        <meshBasicMaterial color="#7ec8ff" />
      </mesh>

      <EngineTestRig position={[0, 0, 0]} />

      <mesh position={[0, 1.68, 0.92]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.25, 0.28]} />
        <meshBasicMaterial color="#0c2236" />
      </mesh>
      <Text position={[0, 1.68, 0.91]} rotation={[0, Math.PI, 0]} fontSize={0.07} color="#9ed8ff" anchorX="center">
        SALA ACUSTICA · TESTE MOTOR WANKEL
      </Text>
      <Text position={[0, 1.54, 0.91]} rotation={[0, Math.PI, 0]} fontSize={0.045} color="#ffb340" anchorX="center">
        ISOLAMENTO SONORO · DINAMOMETRO · EXAUSTAO
      </Text>

      <mesh position={[1.18, 0.78, 0.78]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.38, 1.05]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} intensity={1.0} color="#7ec8ff" distance={3} />
    </group>
  );
}

function DiagnosticBay({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.4, 1.2, 0.6]} />
        <meshStandardMaterial color="#243244" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.4, 0.05]}>
        <planeGeometry args={[1.1, 0.7]} />
        <meshBasicMaterial color="#0c2236" />
      </mesh>
      <mesh position={[0, 1.4, 0.06]}>
        <planeGeometry args={[1.0, 0.6]} />
        <meshBasicMaterial color="#39c5ff" transparent opacity={0.18} />
      </mesh>
      <Text position={[0, 1.4, 0.07]} fontSize={0.07} color="#9ed8ff" anchorX="center">
        DIAG · 26A
      </Text>
    </group>
  );
}

function Workbench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.2, 1, 0.9]} />
        <meshStandardMaterial color="#26323f" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[2.2, 0.06, 0.9]} />
        <meshStandardMaterial color="#2a3038" metalness={0.7} roughness={0.4} />
      </mesh>
      {[-0.7, -0.2, 0.3, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.12, -0.2]}>
          <boxGeometry args={[0.18, 0.05, 0.45]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function ToolRack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.12, 2.4, 1.2]} />
        <meshStandardMaterial color="#1c2530" metalness={0.6} roughness={0.5} />
      </mesh>
      {[0.5, 1.0, 1.5, 2.0].map((y) => (
        <mesh key={y} position={[0.07, y, 0]}>
          <boxGeometry args={[0.04, 0.04, 1.0]} />
          <meshStandardMaterial color="#5a626f" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingPanel({
  position,
  color,
  wide,
  label,
}: {
  position: [number, number, number];
  color: string;
  wide?: boolean;
  label?: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[wide ? 4 : 1.6, wide ? 1.6 : 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[wide ? 4.05 : 1.65, wide ? 1.65 : 1.05]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      {label && (
        <Text position={[0, 0, 0.01]} fontSize={wide ? 0.22 : 0.12} color={color} anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
}
