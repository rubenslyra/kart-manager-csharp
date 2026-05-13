import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Mesh } from "three";
import type { KartState } from "./types";
import { STATE_COLOR } from "./types";
import { Driver } from "./Driver";

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  state: KartState;
  driving: boolean;
  /** Steering input -1 (right) .. +1 (left). Defaults to 0. */
  steer?: number;
  /** Signed speed in km/h (negative = reverse). Defaults to 0. */
  speedKmh?: number;
  /** Override main livery color (used for AI opponents). */
  liveryColor?: string;
}

const STEER_ANGLE = 0.55; // ~31°
const TRACK_WIDTH = 1.2; // distance between left/right wheels (for differential)
const WHEELBASE = 1.6; // front-rear axle distance (Ackermann)

/**
 * KartModel — RL Kart 26A with proper wheel hierarchy:
 *  - Front wheels live under steering pivot groups (rotation.y = steer angle, Ackermann-corrected)
 *  - All wheels rotate on local X for rolling, with differential during turns
 *  - Each wheel mesh is centered on its own pivot (no offset spin)
 */
export function KartModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  state,
  driving,
  steer = 0,
  speedKmh = 0,
  liveryColor,
}: Props) {
  const group = useRef<Group>(null);
  const steerWheel = useRef<Group>(null);

  // Steering pivot groups (front-left, front-right)
  const pivotFL = useRef<Group>(null);
  const pivotFR = useRef<Group>(null);

  // Individual wheel meshes (for independent X rotation = differential)
  const wheelFL = useRef<Mesh>(null);
  const wheelFR = useRef<Mesh>(null);
  const wheelRL = useRef<Mesh>(null);
  const wheelRR = useRef<Mesh>(null);

  useFrame((_, dt) => {
    // Smooth steering on pivots with Ackermann (inner wheel turns more)
    const target = MathUtils.clamp(steer, -1, 1) * STEER_ANGLE;
    if (pivotFL.current && pivotFR.current) {
      // Ackermann: when turning left (steer > 0), inner = left turns more
      const inner = target;
      const outer = target === 0 ? 0 : Math.atan(
        (WHEELBASE * Math.tan(target)) / (WHEELBASE + (steer > 0 ? -1 : 1) * (TRACK_WIDTH / 2) * Math.tan(target)),
      );
      const leftTarget = steer > 0 ? inner : outer;
      const rightTarget = steer > 0 ? outer : inner;
      pivotFL.current.rotation.y = MathUtils.lerp(pivotFL.current.rotation.y, leftTarget, Math.min(1, dt * 10));
      pivotFR.current.rotation.y = MathUtils.lerp(pivotFR.current.rotation.y, rightTarget, Math.min(1, dt * 10));
    }

    // Rolling — proportional to speed; differential when turning
    // v (m/s) ≈ kmh / 3.6; tire radius ~0.24m → angular = v / r
    const v = speedKmh / 3.6;
    const baseOmega = v / 0.24;
    // Differential factor: outer wheel spins faster, inner slower
    const diff = Math.abs(steer) * 0.25;
    const leftFactor = steer > 0 ? 1 - diff : 1 + diff; // turning left → left (inner) slower
    const rightFactor = steer > 0 ? 1 + diff : 1 - diff;

    if (wheelFL.current) wheelFL.current.rotation.x -= baseOmega * leftFactor * dt;
    if (wheelFR.current) wheelFR.current.rotation.x -= baseOmega * rightFactor * dt;
    if (wheelRL.current) wheelRL.current.rotation.x -= baseOmega * leftFactor * dt;
    if (wheelRR.current) wheelRR.current.rotation.x -= baseOmega * rightFactor * dt;

    // Steering wheel inside cockpit follows input
    if (steerWheel.current) {
      steerWheel.current.rotation.z = MathUtils.lerp(
        steerWheel.current.rotation.z,
        steer * 0.9,
        Math.min(1, dt * 8),
      );
    }

    // Subtle vibration on warning/critical
    if (group.current && (state === "WARNING" || state === "CRITICAL_FAILURE")) {
      const t = performance.now() / 1000;
      group.current.position.y = position[1] + Math.sin(t * 14) * 0.02;
    } else if (group.current) {
      group.current.position.y = position[1];
    }
  });

  const accent = STATE_COLOR[state];
  const liveryBlue = liveryColor ?? "#1d4ed8";
  const liveryOrange = "#f97316";
  const tubular = "#cbd5e1";
  const tireBlack = "#0a0a0a";
  const rimSilver = "#94a3b8";

  // Wheel renderer — centered on its own pivot (no internal offset)
  const renderWheel = (ref: React.RefObject<Mesh | null>, isRear: boolean) => {
    const r = isRear ? 0.26 : 0.22;
    const w = isRear ? 0.22 : 0.18;
    return (
      <group>
        {/* Tire — centered on pivot */}
        <mesh ref={ref} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[r, r, w, 22]} />
          <meshStandardMaterial color={tireBlack} roughness={0.95} />
        </mesh>
        {/* Rim (decorative, not spinning ref) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r * 0.55, r * 0.55, w + 0.005, 16]} />
          <meshStandardMaterial color={rimSilver} metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* ========== CHASSIS — tubular ========== */}
      <group>
        {[0.42, -0.42].map((x, i) => (
          <mesh key={`rail-${i}`} position={[x, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 2.4, 10]} />
            <meshStandardMaterial color={tubular} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {[-1.05, -0.4, 0.3, 1.05].map((z, i) => (
          <mesh key={`cross-${i}`} rotation={[0, 0, Math.PI / 2]} position={[0, 0.18, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.95, 10]} />
            <meshStandardMaterial color={tubular} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.22, 1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.32, 0.04, 8, 18, Math.PI]} />
          <meshStandardMaterial color={tubular} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.25, -1.18]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.0, 10]} />
          <meshStandardMaterial color={tubular} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Floor pan */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.85, 0.04, 2.2]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Front fairing */}
      <group position={[0, 0.22, 1.0]}>
        <mesh castShadow>
          <boxGeometry args={[0.78, 0.22, 0.55]} />
          <meshStandardMaterial color={liveryBlue} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.0, 0.28]}>
          <boxGeometry args={[0.78, 0.06, 0.005]} />
          <meshStandardMaterial color={liveryOrange} />
        </mesh>
        <mesh position={[0, 0.04, 0.281]}>
          <planeGeometry args={[0.36, 0.18]} />
          <meshStandardMaterial color="#fde047" />
        </mesh>
      </group>

      {/* Side pods */}
      {[0.5, -0.5].map((x, i) => (
        <group key={`pod-${i}`} position={[x, 0.18, -0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.28, 1.2]} />
            <meshStandardMaterial color={liveryBlue} metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[x > 0 ? 0.052 : -0.052, 0, 0]}>
            <planeGeometry args={[1.2, 0.08]} />
            <meshStandardMaterial color={liveryOrange} />
          </mesh>
          <mesh position={[x > 0 ? 0.053 : -0.053, -0.05, -0.4]} rotation={[0, x > 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[0.32, 0.16]} />
            <meshStandardMaterial color="#fde047" />
          </mesh>
        </group>
      ))}

      {/* Accent strip */}
      <mesh position={[0, 0.32, 0.7]}>
        <boxGeometry args={[0.86, 0.02, 0.3]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} />
      </mesh>

      {/* Steering column + wheel */}
      <mesh position={[0, 0.5, 0.45]} rotation={[Math.PI / 3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.55, 10]} />
        <meshStandardMaterial color="#6b7280" metalness={0.7} />
      </mesh>
      <group ref={steerWheel} position={[0, 0.7, 0.7]} rotation={[Math.PI / 3, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.17, 0.028, 10, 24]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.32, 0.02, 0.02]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      </group>

      {/* Driver */}
      <Driver driving={driving} />

      {/* Battery */}
      <mesh position={[0, 0.22, -0.95]} castShadow>
        <boxGeometry args={[0.7, 0.22, 0.5]} />
        <meshStandardMaterial color="#0b1220" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.34, -0.95]}>
        <boxGeometry args={[0.5, 0.02, 0.3]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
      </mesh>

      {/* Motor + exhaust */}
      <mesh position={[0.35, 0.22, -0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.3, 18]} />
        <meshStandardMaterial color="#374151" metalness={0.85} roughness={0.25} />
      </mesh>
      {[0, 0.06, 0.12, -0.06, -0.12].map((z, i) => (
        <mesh key={`fin-${i}`} position={[0.35, 0.36, -0.65 + z]}>
          <boxGeometry args={[0.32, 0.02, 0.03]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[-0.35, 0.3, -0.7]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.7, 12]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* ==========================================================
          WHEELS — proper hierarchy (Ackermann front + differential)
          Front: pivot group at axle position → wheel mesh as child
          Rear: wheel mesh directly at axle position
         ========================================================== */}

      {/* Front-left: pivot at (+0.6, 0.22, +0.8) */}
      <group ref={pivotFL} position={[0.6, 0.22, 0.8]}>
        {renderWheel(wheelFL, false)}
      </group>
      {/* Front-right: pivot at (-0.6, 0.22, +0.8) */}
      <group ref={pivotFR} position={[-0.6, 0.22, 0.8]}>
        {renderWheel(wheelFR, false)}
      </group>
      {/* Rear-left: (+0.65, 0.24, -0.8) */}
      <group position={[0.65, 0.24, -0.8]}>
        {renderWheel(wheelRL, true)}
      </group>
      {/* Rear-right: (-0.65, 0.24, -0.8) */}
      <group position={[-0.65, 0.24, -0.8]}>
        {renderWheel(wheelRR, true)}
      </group>
    </group>
  );
}
