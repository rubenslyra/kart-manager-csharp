import { forwardRef, type MutableRefObject, type Ref } from "react";
import * as THREE from "three";
import type { DimProps } from "./shared";

interface WheelProps {
  position: [number, number, number];
  discMat: THREE.Material;
  susRef: MutableRefObject<THREE.Group | null>;
  dim: DimProps;
  steerable?: boolean;
  name?: string;
}

const TIRE_RADIUS = 0.14; // wheelDiameter 0.28 m
const FRONT_TIRE_WIDTH = 0.095;
const REAR_TIRE_WIDTH = 0.135;
const RIM_RADIUS = 0.092;
const HUB_RADIUS = 0.043;
const DISC_RADIUS = 0.10;
const SPOKE_LENGTH = 0.095;
const SPOKE_RADIUS = 0.018;
const STUD_PATTERN_RADIUS = 0.031;

function WheelAssembly({
  width,
  axleBoreRadius,
  discMat,
  dim,
}: {
  width: number;
  axleBoreRadius: number;
  discMat: THREE.Material;
  dim: DimProps;
}) {
  const sideOffset = width / 2 + 0.002;
  const coverOffset = width / 2 + 0.008;

  return (
    <group name="wheel_integrated_origin_centered">
      {/* Slick tire body. Wheel axis is local X, pivot is the hub center at [0,0,0]. */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[TIRE_RADIUS, TIRE_RADIUS, width, 64]} />
        <meshStandardMaterial color="#07080a" roughness={0.94} metalness={0.03} {...dim} />
      </mesh>

      {/* Rounded slick shoulders and subtle wear rings. */}
      {[-1, 1].map((side) => (
        <group key={`sidewall-${side}`} position={[side * sideOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <torusGeometry args={[TIRE_RADIUS * 0.94, 0.012, 12, 64]} />
            <meshStandardMaterial color="#050608" roughness={0.98} metalness={0.02} {...dim} />
          </mesh>
          <mesh>
            <torusGeometry args={[TIRE_RADIUS * 0.71, 0.004, 8, 48]} />
            <meshStandardMaterial color="#111318" roughness={0.96} metalness={0.03} {...dim} />
          </mesh>
          <mesh>
            <torusGeometry args={[TIRE_RADIUS * 0.52, 0.004, 8, 48]} />
            <meshStandardMaterial color="#111318" roughness={0.96} metalness={0.03} {...dim} />
          </mesh>
        </group>
      ))}

      {/* Wear witness grooves on the slick contact surface. */}
      {[-0.035, 0, 0.035].map((x) => (
        <mesh key={`wear-groove-${x}`} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[TIRE_RADIUS + 0.001, 0.0025, 6, 64]} />
          <meshStandardMaterial color="#17191d" roughness={1} metalness={0.02} {...dim} />
        </mesh>
      ))}

      {/* Magnesium alloy rim, satin black. */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[RIM_RADIUS, RIM_RADIUS, width * 0.62, 48]} />
        <meshStandardMaterial color="#111318" metalness={0.72} roughness={0.42} {...dim} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[RIM_RADIUS, 0.010, 10, 48]} />
        <meshStandardMaterial color="#050608" metalness={0.8} roughness={0.36} {...dim} />
      </mesh>

      {/* Three short robust spokes, perfectly radial around the hub center. */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        const y = Math.cos(a) * (HUB_RADIUS + SPOKE_LENGTH * 0.38);
        const z = Math.sin(a) * (HUB_RADIUS + SPOKE_LENGTH * 0.38);
        return (
          <mesh key={`spoke-${i}`} position={[0, y, z]} rotation={[0, 0, -a + Math.PI / 2]} castShadow>
            <boxGeometry args={[width * 0.36, SPOKE_LENGTH, SPOKE_RADIUS]} />
            <meshStandardMaterial color="#0b0d10" metalness={0.82} roughness={0.38} {...dim} />
          </mesh>
        );
      })}

      {/* Central hub and visual bore: 30 mm front, 40 mm rear. */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[HUB_RADIUS, HUB_RADIUS, width * 0.76, 36]} />
        <meshStandardMaterial color="#15181d" metalness={0.86} roughness={0.34} {...dim} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`face-detail-${side}`} position={[side * (width * 0.39 + 0.003), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[axleBoreRadius, axleBoreRadius, 0.006, 32]} />
            <meshStandardMaterial color="#020304" roughness={0.9} metalness={0.1} {...dim} />
          </mesh>
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
            return (
              <mesh
                key={`stud-hole-${i}`}
                position={[Math.cos(a) * STUD_PATTERN_RADIUS, Math.sin(a) * STUD_PATTERN_RADIUS, 0.004]}
              >
                <cylinderGeometry args={[0.0065, 0.0065, 0.007, 18]} />
                <meshStandardMaterial color="#020304" roughness={0.86} metalness={0.16} {...dim} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Polished aluminum hub caps matching the side steps, outside and parallel to each wheel face. */}
      {[-1, 1].map((side) => (
        <group key={`polished-cap-${side}`}>
          <mesh position={[side * coverOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.068, 0.068, 0.008, 48]} />
            <meshStandardMaterial
              color="#d9dde2"
              metalness={1}
              roughness={0.16}
              emissive="#1b2731"
              emissiveIntensity={0.08}
              {...dim}
            />
          </mesh>
          <mesh position={[side * (coverOffset + 0.005), 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.052, 0.004, 8, 48]} />
            <meshStandardMaterial color="#eef2f5" metalness={1} roughness={0.12} {...dim} />
          </mesh>
          <mesh position={[side * (coverOffset + 0.008), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[axleBoreRadius, axleBoreRadius, 0.004, 32]} />
            <meshStandardMaterial color="#20242b" metalness={0.7} roughness={0.32} {...dim} />
          </mesh>
        </group>
      ))}

      {/* Brake disc remains centered on the same wheel axis. */}
      <mesh rotation={[0, 0, Math.PI / 2]} material={discMat} name="brake_disc">
        <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.018, 36]} />
      </mesh>
    </group>
  );
}

export const Wheel = forwardRef<THREE.Group, WheelProps>(function Wheel(
  { position, discMat, susRef, dim, name },
  ref,
) {
  const isRear = name?.includes("_R") ?? false;
  const tireWidth = isRear ? REAR_TIRE_WIDTH : FRONT_TIRE_WIDTH;
  const axleBoreRadius = isRear ? 0.02 : 0.015;

  return (
    <group ref={ref as Ref<THREE.Group>} position={position} name={name}>
      {/* Suspension shock — coil spring + damper */}
      <group ref={susRef as Ref<THREE.Group>} position={[0, 0.18, 0]} name="suspension">
        <mesh>
          <cylinderGeometry args={[0.014, 0.014, 0.18, 10]} />
          <meshStandardMaterial color="#9aa3b3" metalness={0.9} roughness={0.25} />
        </mesh>
        {[-0.07, -0.035, 0, 0.035, 0.07].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.028, 0.007, 6, 14]} />
            <meshStandardMaterial color="#d6d6d6" metalness={0.85} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.04, 0.05, 0.04]} />
          <meshStandardMaterial color="#5a5f68" metalness={0.7} roughness={0.45} />
        </mesh>
      </group>

      <WheelAssembly width={tireWidth} axleBoreRadius={axleBoreRadius} discMat={discMat} dim={dim} />
    </group>
  );
});
