import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, MathUtils, Mesh } from "three";
import type { KartState } from "./types";
import { STATE_COLOR } from "./types";
import { Driver } from "./Driver";
import { RL_KART_DERIVED, RL_KART_DIMENSIONS } from "./kart/RLKart26ADimensions";

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
  driverName?: string;
  kartNumber?: string;
  tireLabel?: string;
}

const STEER_ANGLE = 0.55; // ~31°
const TRACK_WIDTH = RL_KART_DIMENSIONS.frontAxleWidth; // distance between left/right wheels (for differential)
const WHEELBASE = RL_KART_DIMENSIONS.wheelbase; // front-rear axle distance (Ackermann)
const WHEEL_RADIUS = RL_KART_DERIVED.wheelRadius;
const FRONT_WHEEL_WIDTH = 0.09;
const REAR_WHEEL_WIDTH = 0.12;

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
  driverName = "RAYSSA",
  kartNumber = "77",
  tireLabel = "BLENDER TIRES",
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
      const outer =
        target === 0
          ? 0
          : Math.atan(
              (WHEELBASE * Math.tan(target)) /
                (WHEELBASE + (steer > 0 ? -1 : 1) * (TRACK_WIDTH / 2) * Math.tan(target)),
            );
      const leftTarget = steer > 0 ? inner : outer;
      const rightTarget = steer > 0 ? outer : inner;
      pivotFL.current.rotation.y = MathUtils.lerp(
        pivotFL.current.rotation.y,
        leftTarget,
        Math.min(1, dt * 10),
      );
      pivotFR.current.rotation.y = MathUtils.lerp(
        pivotFR.current.rotation.y,
        rightTarget,
        Math.min(1, dt * 10),
      );
    }

    // Rolling — proportional to speed; differential when turning
    // v (m/s) ≈ kmh / 3.6; tire radius follows the RL Kart 26A blueprint.
    const v = speedKmh / 3.6;
    const baseOmega = v / WHEEL_RADIUS;
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
  const tubular = "#3a4452";
  const aluminum = "#d9dde2";
  const tireBlack = "#0a0a0a";
  const rimSilver = "#94a3b8";

  // Wheel renderer — centered on its own pivot (no internal offset)
  const renderWheel = (ref: React.RefObject<Mesh | null>, isRear: boolean) => {
    const r = WHEEL_RADIUS;
    const w = isRear ? REAR_WHEEL_WIDTH : FRONT_WHEEL_WIDTH;
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
        {[0.32, -0.32].map((x, i) => (
          <mesh key={`rail-${i}`} position={[x, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 1.35, 10]} />
            <meshStandardMaterial color={tubular} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {[-0.6, -0.2, 0.2, 0.6].map((z, i) => (
          <mesh
            key={`cross-${i}`}
            rotation={[0, 0, Math.PI / 2]}
            position={[0, 0.13, z]}
            castShadow
          >
            <cylinderGeometry args={[0.032, 0.032, 0.78, 10]} />
            <meshStandardMaterial color={tubular} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.17, 0.74]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.26, 0.03, 8, 18, Math.PI]} />
          <meshStandardMaterial color={tubular} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.17, -0.68]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.82, 10]} />
          <meshStandardMaterial color={tubular} metalness={0.85} roughness={0.25} />
        </mesh>
        {[0.44, -0.44].map((x, i) => (
          <mesh
            key={`upper-rail-${i}`}
            position={[x, 0.32, -0.05]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.022, 0.022, 1.05, 10]} />
            <meshStandardMaterial
              color={tubular}
              metalness={0.92}
              roughness={0.32}
              emissive="#0a1a2c"
              emissiveIntensity={0.18}
            />
          </mesh>
        ))}
        {[0.42, 0, -0.42].map((z) =>
          [1, -1].map((side) => (
            <mesh key={`side-strut-${side}-${z}`} position={[side * 0.38, 0.225, z]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.21, 8]} />
              <meshStandardMaterial color={tubular} metalness={0.88} roughness={0.34} />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.6, -0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.21, 0.022, 10, 22, Math.PI]} />
          <meshStandardMaterial color={tubular} metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Floor pan */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.66, 0.035, 1.25]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Front fairing */}
      <group position={[0, 0.18, 0.56]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.18, 0.34]} />
          <meshStandardMaterial color={liveryBlue} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.0, 0.175]}>
          <boxGeometry args={[0.62, 0.045, 0.005]} />
          <meshStandardMaterial color={liveryOrange} />
        </mesh>
        <mesh position={[0, 0.035, 0.176]}>
          <planeGeometry args={[0.28, 0.14]} />
          <meshStandardMaterial color="#fde047" />
        </mesh>
        <Text
          position={[0, 0.04, 0.18]}
          fontSize={0.12}
          anchorX="center"
          anchorY="middle"
          color="#111827"
          outlineWidth={0.006}
          outlineColor="#f8fafc"
        >
          {kartNumber}
        </Text>
      </group>

      {/* Side steps derived from the workshop model. */}
      {[0.5, -0.5].map((x, i) => (
        <group key={`pod-${i}`} position={[x * 0.86, 0.15, -0.08]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.04, 0.78]} />
            <meshStandardMaterial color={aluminum} metalness={1} roughness={0.16} />
          </mesh>
          <mesh position={[0, 0.026, 0]}>
            <boxGeometry args={[0.095, 0.012, 0.58]} />
            <meshStandardMaterial color="#111827" roughness={0.92} />
          </mesh>
          {[-0.18, 0, 0.18].map((z) => (
            <mesh key={`step-ridge-${z}`} position={[0, 0.038, z]}>
              <boxGeometry args={[0.105, 0.01, 0.018]} />
              <meshStandardMaterial color="#2d343d" metalness={0.75} roughness={0.32} />
            </mesh>
          ))}
          <mesh position={[x > 0 ? 0.068 : -0.068, 0.055, 0.18]}>
            <planeGeometry args={[0.34, 0.07]} />
            <meshStandardMaterial color={liveryOrange} />
          </mesh>
          <mesh
            position={[x > 0 ? 0.07 : -0.07, 0.06, -0.24]}
            rotation={[0, x > 0 ? 0 : Math.PI, 0]}
          >
            <planeGeometry args={[0.24, 0.12]} />
            <meshStandardMaterial color="#fde047" />
          </mesh>
          <Text
            position={[x > 0 ? 0.056 : -0.056, -0.04, -0.24]}
            rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
            fontSize={0.1}
            anchorX="center"
            anchorY="middle"
            color="#111827"
            outlineWidth={0.006}
            outlineColor="#f8fafc"
          >
            {kartNumber}
          </Text>
        </group>
      ))}

      {/* Accent strip */}
      <mesh position={[0, 0.26, 0.36]}>
        <boxGeometry args={[0.64, 0.018, 0.22]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} />
      </mesh>

      {/* Steering column + wheel */}
      <mesh position={[0, 0.5, 0.45]} rotation={[Math.PI / 3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.55, 10]} />
        <meshStandardMaterial color="#6b7280" metalness={0.7} />
      </mesh>
      <group ref={steerWheel} position={[0, 0.7, 0.7]} rotation={[Math.PI / 3, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.14, 0.02, 10, 28]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.25, 0.016, 0.016]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.035, 16]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* Bucket seat shell visible behind the driver, matching the workshop kart. */}
      <group position={[0, 0.15, -0.18]}>
        <mesh position={[0, 0.08, 0.04]} castShadow>
          <boxGeometry args={[0.38, 0.08, 0.36]} />
          <meshStandardMaterial color="#0d1117" roughness={0.95} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0.32, -0.1]} rotation={[-0.22, 0, 0]} castShadow>
          <boxGeometry args={[0.36, 0.42, 0.045]} />
          <meshStandardMaterial color="#0d1117" roughness={0.95} metalness={0.12} />
        </mesh>
        {[1, -1].map((side) => (
          <mesh key={`seat-bolster-${side}`} position={[side * 0.2, 0.21, -0.02]} castShadow>
            <boxGeometry args={[0.045, 0.24, 0.32]} />
            <meshStandardMaterial color="#0d1117" roughness={0.95} metalness={0.12} />
          </mesh>
        ))}
      </group>

      {/* Driver */}
      <Driver driving={driving} name={driverName} suitColor={liveryColor ?? "#1e3a8a"} />

      {/* Battery */}
      <mesh position={[0, 0.19, -0.48]} castShadow>
        <boxGeometry args={[0.5, 0.18, 0.3]} />
        <meshStandardMaterial color="#0b1220" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.29, -0.48]}>
        <boxGeometry args={[0.36, 0.018, 0.18]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
      </mesh>

      {/* Compact Wankel-inspired rear motor + exhaust. */}
      <group position={[0.27, 0.14, -0.52]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.18, 3]} />
          <meshStandardMaterial color="#8f969e" metalness={0.62} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.094]} rotation={[0, 0, 0.36]}>
          <cylinderGeometry args={[0.07, 0.07, 0.018, 3]} />
          <meshStandardMaterial color="#b7a261" metalness={0.82} roughness={0.31} />
        </mesh>
        <mesh position={[0, 0, -0.102]}>
          <cylinderGeometry args={[0.035, 0.035, 0.035, 20]} />
          <meshStandardMaterial color="#1d232b" metalness={0.78} roughness={0.34} />
        </mesh>
      </group>
      {[-0.08, -0.04, 0, 0.04, 0.08].map((z) => (
        <mesh key={`wankel-rib-${z}`} position={[0.27, 0.285, -0.52 + z]}>
          <boxGeometry args={[0.22, 0.012, 0.018]} />
          <meshStandardMaterial color="#a5adb5" metalness={0.62} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[-0.28, 0.26, -0.44]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.034, 0.045, 0.5, 16]} />
        <meshStandardMaterial
          color="#8e949b"
          metalness={0.84}
          roughness={0.28}
          emissive="#15324a"
          emissiveIntensity={0.07}
        />
      </mesh>

      {/* ==========================================================
          WHEELS — proper hierarchy (Ackermann front + differential)
          Front: pivot group at axle position → wheel mesh as child
          Rear: wheel mesh directly at axle position
         ========================================================== */}

      {/* Front-left: pivot at official axle center height. */}
      <group
        ref={pivotFL}
        position={[RL_KART_DERIVED.halfFrontTrack, WHEEL_RADIUS, RL_KART_DERIVED.halfWheelbase]}
      >
        {renderWheel(wheelFL, false)}
        <TireLabel label={tireLabel} side={1} />
      </group>
      {/* Front-right: pivot at official axle center height. */}
      <group
        ref={pivotFR}
        position={[-RL_KART_DERIVED.halfFrontTrack, WHEEL_RADIUS, RL_KART_DERIVED.halfWheelbase]}
      >
        {renderWheel(wheelFR, false)}
        <TireLabel label={tireLabel} side={-1} />
      </group>
      {/* Rear-left: official axle center height. */}
      <group
        position={[RL_KART_DERIVED.halfRearTrack, WHEEL_RADIUS, -RL_KART_DERIVED.halfWheelbase]}
      >
        {renderWheel(wheelRL, true)}
        <TireLabel label={tireLabel} side={1} />
      </group>
      {/* Rear-right: official axle center height. */}
      <group
        position={[-RL_KART_DERIVED.halfRearTrack, WHEEL_RADIUS, -RL_KART_DERIVED.halfWheelbase]}
      >
        {renderWheel(wheelRR, true)}
        <TireLabel label={tireLabel} side={-1} />
      </group>
    </group>
  );
}

function TireLabel({ label, side }: { label: string; side: 1 | -1 }) {
  return (
    <Text
      position={[side * 0.052, 0.02, 0]}
      rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI / 2]}
      fontSize={0.035}
      anchorX="center"
      anchorY="middle"
      color="#f8fafc"
      outlineWidth={0.003}
      outlineColor="#0a0a0a"
    >
      {label}
    </Text>
  );
}
