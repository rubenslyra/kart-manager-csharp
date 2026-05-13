import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { DimProps } from "./shared";
import { RL_KART_PART_NAMES } from "@/components/simulator/kart/RLKart26ADimensions";

interface Props {
  batteryTemp: number;
  ignitionEnabled: boolean;
  regen: number;
  dim: DimProps;
}

/**
 * Sistema elétrico — bateria LiFePO4 48V (420×300×200 mm), BMS, controlador
 * e chicotes roteados via tubeGeometry. Posicionados conforme blueprint.
 */
export function ElectricalSystem({ batteryTemp, ignitionEnabled, regen, dim }: Props) {
  const batteryMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0e141c",
        emissive: "#0a2440",
        metalness: 0.5,
        roughness: 0.55,
      }),
    [],
  );
  const ledRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const c = new THREE.Color();
    if (batteryTemp < 45) c.setHex(0x0a2440);
    else if (batteryTemp < 65) c.setHex(0x6e4a17);
    else c.setHex(0x6e1717);
    batteryMat.emissive.copy(c);
    if (ledRef.current) {
      ledRef.current.emissiveIntensity = ignitionEnabled
        ? 1.2 + Math.sin(t * 4) * 0.6
        : 0.15;
    }
  });

  // Battery sits to the right of the seat (per blueprint isometric view).
  const batteryPos: [number, number, number] = [0.22, 0.20, -0.18];
  const controllerPos: [number, number, number] = [0.22, 0.30, -0.42];
  const motorPos: [number, number, number] = [0, 0.16, -0.625];

  const positiveCable = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(batteryPos[0] + 0.05, batteryPos[1] + 0.12, batteryPos[2] - 0.10),
          new THREE.Vector3(batteryPos[0] + 0.10, batteryPos[1] + 0.18, controllerPos[2] + 0.05),
          new THREE.Vector3(controllerPos[0] + 0.05, controllerPos[1], controllerPos[2]),
        ]),
        16,
        0.012,
        8,
        false,
      ),
    [],
  );
  const negativeCable = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(batteryPos[0] - 0.05, batteryPos[1] + 0.12, batteryPos[2] - 0.10),
          new THREE.Vector3(controllerPos[0] - 0.05, controllerPos[1], controllerPos[2]),
          new THREE.Vector3(motorPos[0] + 0.05, motorPos[1] + 0.05, motorPos[2] + 0.08),
        ]),
        16,
        0.012,
        8,
        false,
      ),
    [],
  );

  return (
    <group name={RL_KART_PART_NAMES.electricalGroup}>
      {/* Battery LiFePO4 — 420×200×300 mm */}
      <mesh
        name={RL_KART_PART_NAMES.batteryPack}
        position={batteryPos}
        material={batteryMat}
        castShadow
      >
        <boxGeometry args={[0.42, 0.20, 0.30]} />
      </mesh>
      {/* Cooling fins on top of battery */}
      {[-0.14, -0.07, 0, 0.07, 0.14].map((x) => (
        <mesh key={x} position={[batteryPos[0] + x, batteryPos[1] + 0.12, batteryPos[2]]}>
          <boxGeometry args={[0.014, 0.025, 0.26]} />
          <meshStandardMaterial color="#5a626f" metalness={0.85} roughness={0.3} {...dim} />
        </mesh>
      ))}
      {/* Terminals */}
      <mesh position={[batteryPos[0] + 0.10, batteryPos[1] + 0.13, batteryPos[2] - 0.10]}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 10]} />
        <meshStandardMaterial color="#c33" metalness={0.7} roughness={0.4} emissive="#400" emissiveIntensity={0.4} {...dim} />
      </mesh>
      <mesh position={[batteryPos[0] - 0.10, batteryPos[1] + 0.13, batteryPos[2] - 0.10]}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 10]} />
        <meshStandardMaterial color="#222" metalness={0.7} roughness={0.5} {...dim} />
      </mesh>
      {/* LiFePO4 label LED */}
      <mesh position={[batteryPos[0], batteryPos[1] + 0.005, batteryPos[2] + 0.151]}>
        <boxGeometry args={[0.14, 0.04, 0.005]} />
        <meshStandardMaterial
          ref={ledRef}
          color="#0a141c"
          emissive="#39a8ff"
          emissiveIntensity={0.4}
          {...dim}
        />
      </mesh>

      {/* BMS box (small, atop battery) */}
      <mesh
        name={RL_KART_PART_NAMES.bmsBox}
        position={[batteryPos[0] - 0.10, batteryPos[1] + 0.16, batteryPos[2] + 0.05]}
        castShadow
      >
        <boxGeometry args={[0.10, 0.04, 0.10]} />
        <meshStandardMaterial color="#1a212c" metalness={0.6} roughness={0.5} {...dim} />
      </mesh>

      {/* Controller box — 150×70 mm */}
      <mesh name={RL_KART_PART_NAMES.controllerBox} position={controllerPos} castShadow>
        <boxGeometry args={[0.18, 0.10, 0.15]} />
        <meshStandardMaterial color="#1a212c" metalness={0.6} roughness={0.45} {...dim} />
      </mesh>
      {/* Controller status LED */}
      <mesh position={[controllerPos[0], controllerPos[1] + 0.06, controllerPos[2] + 0.07]}>
        <sphereGeometry args={[0.014, 10, 10]} />
        <meshStandardMaterial
          color="#0f0"
          emissive={ignitionEnabled ? "#5be39a" : "#222"}
          emissiveIntensity={ignitionEnabled ? 1.6 : 0.1}
          {...dim}
        />
      </mesh>
      {/* Regen LED */}
      <mesh position={[controllerPos[0] - 0.04, controllerPos[1] + 0.06, controllerPos[2] + 0.07]}>
        <sphereGeometry args={[0.014, 10, 10]} />
        <meshStandardMaterial
          color="#39a8ff"
          emissive="#39a8ff"
          emissiveIntensity={0.3 + regen * 2.2}
          {...dim}
        />
      </mesh>

      {/* Harness cables */}
      <mesh geometry={positiveCable} name="cable_positive">
        <meshStandardMaterial color="#a01818" emissive="#400" emissiveIntensity={0.35} {...dim} />
      </mesh>
      <mesh geometry={negativeCable} name="cable_negative">
        <meshStandardMaterial color="#101218" emissive="#000" {...dim} />
      </mesh>
    </group>
  );
}
