import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { DimProps } from "./shared";
import type { EngineTestState } from "../engineTest";
import {
  RL_KART_DERIVED,
  RL_KART_PART_NAMES,
} from "@/components/simulator/kart/RLKart26ADimensions";

const X = RL_KART_DERIVED;
const SOLID_DIM: DimProps = { opacity: 1, transparent: false, wireframe: false };

interface WankelEngineProps {
  dim?: DimProps;
  showServiceHandles?: boolean;
  running?: boolean;
  throttle?: number;
}

function makeLobedShape(radius: number, lobing: number, points = 96) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2;
    const r = radius * (1 + lobing * Math.cos(3 * a));
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function makeRotorShape(radius: number) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/** Motor rotativo Wankel com pivô local no centro inferior da placa de montagem. */
export function WankelEngine({
  dim = SOLID_DIM,
  showServiceHandles = false,
  running = false,
  throttle = 0,
}: WankelEngineProps) {
  const housingShape = useMemo(() => makeLobedShape(0.145, 0.18), []);
  const chamberShape = useMemo(() => makeLobedShape(0.106, 0.16), []);
  const rotorShape = useMemo(() => makeRotorShape(0.072), []);
  const rotorRef = useRef<THREE.Mesh>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const pulleyRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!running) return;
    const t = THREE.MathUtils.clamp(throttle, 0, 1);
    const omega = 5.5 + t * 34;
    if (rotorRef.current) rotorRef.current.rotation.z += omega * dt;
    if (shaftRef.current) shaftRef.current.rotation.x += omega * 1.6 * dt;
    if (pulleyRef.current) pulleyRef.current.rotation.x += omega * 2.2 * dt;
  });

  const intakeCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.27, 0.23, 0.06),
        new THREE.Vector3(-0.36, 0.23, 0.02),
        new THREE.Vector3(-0.45, 0.2, -0.04),
      ]),
    [],
  );

  const exhaustCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.26, 0.22, -0.02),
        new THREE.Vector3(0.4, 0.21, -0.1),
        new THREE.Vector3(0.53, 0.17, -0.27),
        new THREE.Vector3(0.61, 0.14, -0.47),
      ]),
    [],
  );

  const plugLeadA = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.04, 0.39, 0.07),
        new THREE.Vector3(-0.12, 0.46, 0.06),
        new THREE.Vector3(-0.24, 0.36, 0.0),
      ]),
    [],
  );

  const plugLeadB = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.06, 0.38, 0.06),
        new THREE.Vector3(0.15, 0.45, 0.04),
        new THREE.Vector3(0.26, 0.35, -0.03),
      ]),
    [],
  );

  return (
    <group name="wankel_engine_pivot_base">
      {/* Adjustable mounting plate: local origin is the bottom-center mounting datum. */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.03, 0.3]} />
        <meshStandardMaterial color="#343b44" metalness={0.85} roughness={0.32} {...dim} />
      </mesh>
      {[-0.15, 0.15].map((x) =>
        [-0.085, 0.085].map((z) => (
          <group key={`slot-${x}-${z}`} position={[x, 0.033, z]}>
            <mesh>
              <boxGeometry args={[0.078, 0.006, 0.022]} />
              <meshStandardMaterial color="#050608" metalness={0.1} roughness={0.9} {...dim} />
            </mesh>
            {[-0.039, 0.039].map((end) => (
              <mesh key={end} position={[end, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.011, 0.011, 0.007, 16]} />
                <meshStandardMaterial color="#050608" metalness={0.1} roughness={0.9} {...dim} />
              </mesh>
            ))}
          </group>
        )),
      )}

      {/* Epitrochoid housing, shown as an engineering cutaway. */}
      <group position={[0, 0.24, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <extrudeGeometry
            args={[
              housingShape,
              {
                depth: 0.24,
                bevelEnabled: true,
                bevelSize: 0.006,
                bevelThickness: 0.006,
                bevelSegments: 2,
              },
            ]}
          />
          <meshStandardMaterial color="#8f969e" metalness={0.56} roughness={0.62} {...dim} />
        </mesh>
        <mesh position={[0, 0, 0.124]}>
          <extrudeGeometry args={[chamberShape, { depth: 0.012, bevelEnabled: false }]} />
          <meshStandardMaterial
            color="#14181d"
            metalness={0.2}
            roughness={0.82}
            transparent
            opacity={0.72}
          />
        </mesh>
        <mesh ref={rotorRef} position={[0, -0.002, 0.14]} rotation={[0, 0, 0.35]} castShadow>
          <extrudeGeometry
            args={[
              rotorShape,
              {
                depth: 0.026,
                bevelEnabled: true,
                bevelSize: 0.006,
                bevelThickness: 0.003,
                bevelSegments: 2,
              },
            ]}
          />
          <meshStandardMaterial color="#b7a261" metalness={0.82} roughness={0.31} {...dim} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = -Math.PI / 2 + (i / 3) * Math.PI * 2 + 0.35;
          return (
            <mesh
              key={`apex-seal-${i}`}
              position={[Math.cos(a) * 0.072, Math.sin(a) * 0.072, 0.156]}
              rotation={[0, 0, a]}
            >
              <boxGeometry args={[0.034, 0.006, 0.006]} />
              <meshStandardMaterial color="#20242b" metalness={0.86} roughness={0.26} {...dim} />
            </mesh>
          );
        })}
      </group>

      {/* Eccentric shaft and front cover hardware. */}
      <mesh ref={shaftRef} position={[0, 0.24, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.026, 0.026, 0.34, 32]} />
        <meshStandardMaterial color="#2f363f" metalness={0.9} roughness={0.25} {...dim} />
      </mesh>
      <mesh ref={pulleyRef} position={[-0.145, 0.24, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.068, 0.068, 0.018, 36]} />
        <meshStandardMaterial color="#1d232b" metalness={0.78} roughness={0.34} {...dim} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={`case-bolt-${i}`}
            position={[-0.156, 0.24 + Math.sin(a) * 0.112, Math.cos(a) * 0.112]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.006, 0.006, 0.012, 12]} />
            <meshStandardMaterial color="#d9dde2" metalness={0.92} roughness={0.22} {...dim} />
          </mesh>
        );
      })}

      {/* Water jacket ribs and coolant fittings. */}
      {[-0.095, -0.055, -0.015, 0.025, 0.065, 0.105].map((x) => (
        <mesh key={`water-rib-${x}`} position={[x, 0.24, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.156, 0.0038, 6, 72]} />
          <meshStandardMaterial color="#a5adb5" metalness={0.62} roughness={0.45} {...dim} />
        </mesh>
      ))}
      <mesh position={[0.02, 0.39, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.09, 14]} />
        <meshStandardMaterial color="#2563eb" metalness={0.78} roughness={0.28} {...dim} />
      </mesh>

      {/* Dual spark plugs and black high-voltage leads. */}
      {[
        [-0.045, 0.38, 0.065],
        [0.055, 0.37, 0.055],
      ].map(([x, y, z], i) => (
        <group key={`spark-${i}`} position={[x, y, z]} rotation={[0.3, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.011, 0.011, 0.064, 14]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.82} roughness={0.24} {...dim} />
          </mesh>
          <mesh position={[0.038, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.032, 12]} />
            <meshStandardMaterial color="#111318" metalness={0.25} roughness={0.58} {...dim} />
          </mesh>
        </group>
      ))}
      <mesh geometry={new THREE.TubeGeometry(plugLeadA, 22, 0.007, 8, false)}>
        <meshStandardMaterial color="#050608" roughness={0.84} metalness={0.1} {...dim} />
      </mesh>
      <mesh geometry={new THREE.TubeGeometry(plugLeadB, 22, 0.007, 8, false)}>
        <meshStandardMaterial color="#050608" roughness={0.84} metalness={0.1} {...dim} />
      </mesh>

      {/* Intake and exhaust ports typical of a rotary engine package. */}
      <mesh geometry={new THREE.TubeGeometry(intakeCurve, 24, 0.026, 14, false)} castShadow>
        <meshStandardMaterial color="#59636e" metalness={0.74} roughness={0.32} {...dim} />
      </mesh>
      <mesh position={[-0.52, 0.19, -0.06]} castShadow>
        <boxGeometry args={[0.13, 0.1, 0.15]} />
        <meshStandardMaterial color="#090a0c" roughness={0.92} metalness={0.04} {...dim} />
      </mesh>
      <mesh geometry={new THREE.TubeGeometry(exhaustCurve, 34, 0.02, 12, false)} castShadow>
        <meshStandardMaterial
          color="#a5abb1"
          metalness={0.84}
          roughness={0.28}
          emissive="#15324a"
          emissiveIntensity={0.07}
          {...dim}
        />
      </mesh>
      {[0.34, 0.49].map((x, i) => (
        <mesh
          key={`weld-${i}`}
          position={[x, 0.2 - i * 0.035, -0.09 - i * 0.13]}
          rotation={[Math.PI / 2, 0, 0.45]}
        >
          <torusGeometry args={[0.028, 0.0035, 6, 20]} />
          <meshStandardMaterial color="#4d7ea6" metalness={0.7} roughness={0.38} {...dim} />
        </mesh>
      ))}
      <mesh position={[0.64, 0.12, -0.6]} rotation={[Math.PI / 2, 0, 0.18]} castShadow>
        <cylinderGeometry args={[0.035, 0.047, 0.23, 28]} />
        <meshStandardMaterial color="#8e949b" metalness={0.84} roughness={0.28} {...dim} />
      </mesh>

      {showServiceHandles && (
        <>
          <mesh position={[0, 0.47, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.006, 8, 24]} />
            <meshStandardMaterial color="#d9dde2" metalness={1} roughness={0.16} {...dim} />
          </mesh>
          <mesh position={[0, 0.51, 0.02]}>
            <boxGeometry args={[0.22, 0.012, 0.012]} />
            <meshStandardMaterial color="#d9dde2" metalness={1} roughness={0.16} {...dim} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function MotorAssembly({ dim }: { dim: DimProps }) {
  return (
    <group
      name={RL_KART_PART_NAMES.motorRear}
      position={[0, X.wheelRadius - 0.015, X.rearMotorZ]}
      rotation={[0, Math.PI, 0]}
    >
      <WankelEngine dim={dim} showServiceHandles />
    </group>
  );
}

const IDLE_ENGINE_TEST: EngineTestState = {
  running: false,
  throttle: 0,
  rpm: 0,
  health: 100,
  temperature: 30,
  load: 0,
  audioEnabled: false,
  volume: 0.45,
};

export function EngineTestRig({
  position,
  engineTest = IDLE_ENGINE_TEST,
}: {
  position: [number, number, number];
  engineTest?: EngineTestState;
}) {
  const engineGroup = useRef<THREE.Group>(null);
  const dynoPulley = useRef<THREE.Mesh>(null);
  const dynoShaft = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const throttle = THREE.MathUtils.clamp(engineTest.throttle, 0, 1);
    const runningFactor = engineTest.running ? 1 : 0;
    const omega = runningFactor * (6 + throttle * 42);

    if (dynoPulley.current) dynoPulley.current.rotation.x += omega * dt;
    if (dynoShaft.current) dynoShaft.current.rotation.x += omega * 1.35 * dt;

    if (!engineGroup.current) return;
    if (!engineTest.running) {
      engineGroup.current.position.set(-0.14, 0.49, 0);
      engineGroup.current.rotation.set(0, 0, 0);
      return;
    }

    const t = state.clock.elapsedTime;
    const amplitude = 0.0025 + throttle * 0.016;
    const frequency = 34 + throttle * 86;
    engineGroup.current.position.set(
      -0.14 + Math.sin(t * frequency) * amplitude,
      0.49 + Math.sin(t * (frequency * 1.37) + 1.7) * amplitude * 0.55,
      Math.cos(t * (frequency * 0.73) + 0.4) * amplitude * 0.7,
    );
    engineGroup.current.rotation.set(
      Math.sin(t * frequency * 0.41) * amplitude * 0.55,
      Math.cos(t * frequency * 0.33) * amplitude * 0.45,
      Math.sin(t * frequency * 0.29) * amplitude * 0.6,
    );
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[1.1, 0.08, 0.56]} />
        <meshStandardMaterial color="#252c35" metalness={0.72} roughness={0.34} />
      </mesh>
      <mesh ref={dynoPulley} position={[0.46, 0.64, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 32]} />
        <meshStandardMaterial
          color="#111827"
          emissive={engineTest.running ? "#39a8ff" : "#000000"}
          emissiveIntensity={engineTest.running ? 0.12 + engineTest.throttle * 0.45 : 0}
          metalness={0.78}
          roughness={0.32}
        />
      </mesh>
      <mesh ref={dynoShaft} position={[0.27, 0.64, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.18, 16]} />
        <meshStandardMaterial color="#a0a7ae" metalness={0.85} roughness={0.28} />
      </mesh>
      <group ref={engineGroup} position={[-0.14, 0.49, 0]} scale={0.82}>
        <WankelEngine
          showServiceHandles
          running={engineTest.running}
          throttle={engineTest.throttle}
        />
      </group>
      <mesh position={[0, 0.9, -0.32]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[0.8, 0.32]} />
        <meshBasicMaterial
          color={engineTest.health < 70 ? "#ffb340" : "#39c5ff"}
          transparent
          opacity={engineTest.running ? 0.34 : 0.18}
        />
      </mesh>
      <mesh position={[0.15, 0.58, 0.31]}>
        <boxGeometry args={[0.46, 0.035, 0.045]} />
        <meshStandardMaterial
          color={engineTest.running ? "#5be39a" : "#4b5563"}
          emissive={engineTest.running ? "#12321f" : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0.02 + engineTest.throttle * 0.34, 0.58, 0.34]}>
        <boxGeometry args={[0.035, 0.052, 0.052]} />
        <meshStandardMaterial color="#d9dde2" metalness={0.8} roughness={0.22} />
      </mesh>
    </group>
  );
}
