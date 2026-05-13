import { Suspense, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { KartTelemetry } from "@/bridge/types";
import { Chassis } from "./parts/Chassis";
import { Seat } from "./parts/Seat";
import { Steering } from "./parts/Steering";
import { ElectricalSystem } from "./parts/ElectricalSystem";
import { MotorAssembly } from "./parts/MotorAssembly";
import { GearSelector } from "./parts/GearSelector";
import { BrakeSystem } from "./parts/BrakeSystem";
import { Dashboard } from "./parts/Dashboard";
import { computeDim, computeDimAny, type FocusTarget } from "./parts/shared";
import {
  RL_KART_DERIVED,
  RL_KART_DIMENSIONS,
  RL_KART_PART_NAMES,
} from "@/components/simulator/kart/RLKart26ADimensions";
import { useKartModel } from "./hooks/useKartModel";

export type { FocusTarget } from "./parts/shared";

interface Props {
  telemetry: KartTelemetry;
  focus: FocusTarget;
}

const D = RL_KART_DIMENSIONS;
const X = RL_KART_DERIVED;

/**
 * RL Kart 26A — modelo composicional em escala oficial do blueprint.
 * Pivot na origem do chassi, ao nível do solo (Y = 0).
 * Carrega GLB `/models/kart/rl_kart_26a_full.glb` quando disponível;
 * caso contrário, usa o modelo procedural abaixo.
 */
export function RealKart({ telemetry, focus }: Props) {
  const { exists, url } = useKartModel();

  return (
    <group name={RL_KART_PART_NAMES.root}>
      {exists ? (
        <Suspense fallback={<ProceduralKart telemetry={telemetry} focus={focus} />}>
          <GLBKart url={url} />
        </Suspense>
      ) : (
        <ProceduralKart telemetry={telemetry} focus={focus} />
      )}
    </group>
  );
}

function GLBKart({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function SideStep({ side, dim }: { side: 1 | -1; dim: ReturnType<typeof computeDimAny> }) {
  const x = side * (D.width / 2 + 0.035);
  const supportX = side * (D.width / 2 - 0.15);
  const supportMidX = (x + supportX) / 2;
  const capRotation = side * 0.08;
  const stepCenterZ = -0.14;

  return (
    <group name={side > 0 ? "side_step_left" : "side_step_right"}>
      <mesh position={[x, 0.145, stepCenterZ]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.035, 0.78]} />
        <meshStandardMaterial
          color="#d9dde2"
          metalness={1}
          roughness={0.16}
          emissive="#1b2731"
          emissiveIntensity={0.08}
          {...dim}
        />
      </mesh>

      {[-0.42, 0.42].map((offsetZ) => (
        <mesh key={`cap-${offsetZ}`} position={[x, 0.15, stepCenterZ + offsetZ]} rotation={[0, capRotation, 0]} castShadow>
          <boxGeometry args={[0.18, 0.048, 0.12]} />
          <meshStandardMaterial color="#0c0d0f" metalness={0.08} roughness={0.88} {...dim} />
        </mesh>
      ))}

      {[-0.18, 0.18].map((offsetZ) => (
        <group key={`tread-${offsetZ}`} position={[x, 0.169, stepCenterZ + offsetZ]}>
          <mesh castShadow>
            <boxGeometry args={[0.13, 0.012, 0.24]} />
            <meshStandardMaterial color="#08090b" metalness={0.02} roughness={0.94} {...dim} />
          </mesh>
          {[-0.08, -0.04, 0, 0.04, 0.08].map((ridgeZ) => (
            <mesh key={`ridge-${ridgeZ}`} position={[0, 0.009, ridgeZ]} castShadow>
              <boxGeometry args={[0.105, 0.007, 0.012]} />
              <meshStandardMaterial color="#181a1f" metalness={0.02} roughness={0.98} {...dim} />
            </mesh>
          ))}
        </group>
      ))}

      {[-0.28, 0, 0.28].map((offsetZ) => (
        <group key={`support-${offsetZ}`}>
          <mesh position={[supportMidX, 0.112, stepCenterZ + offsetZ]} castShadow>
            <boxGeometry args={[0.2, 0.022, 0.035]} />
            <meshStandardMaterial color="#2d343d" metalness={0.85} roughness={0.28} {...dim} />
          </mesh>
          <mesh position={[x - side * 0.055, 0.122, stepCenterZ + offsetZ]} castShadow>
            <boxGeometry args={[0.026, 0.06, 0.042]} />
            <meshStandardMaterial color="#222832" metalness={0.82} roughness={0.32} {...dim} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ProceduralKart({ telemetry, focus }: Props) {
  const m = telemetry.modules;
  const wheelFL = useRef<THREE.Group>(null);
  const wheelFR = useRef<THREE.Group>(null);
  const susFL = useRef<THREE.Group>(null);
  const susFR = useRef<THREE.Group>(null);
  const susRL = useRef<THREE.Group>(null);
  const susRR = useRef<THREE.Group>(null);
  const pedal = useRef<THREE.Mesh>(null);
  const dashLight = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const angle = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(m.steering.angle, -35, 35));
    if (wheelFL.current) wheelFL.current.rotation.y = angle;
    if (wheelFR.current) wheelFR.current.rotation.y = angle;

    const sus = m.suspension;
    if (susFL.current) susFL.current.position.y = 0.18 - sus.frontLeftCompression * 0.06;
    if (susFR.current) susFR.current.position.y = 0.18 - sus.frontRightCompression * 0.06;
    if (susRL.current) susRL.current.position.y = 0.18 - sus.rearLeftCompression * 0.06;
    if (susRR.current) susRR.current.position.y = 0.18 - sus.rearRightCompression * 0.06;

    if (pedal.current) pedal.current.rotation.x = m.brakes.pedalPressure * 0.6;
    if (dashLight.current) dashLight.current.intensity = m.ignition.enabled ? 1.0 : 0;
  });

  const dim = computeDim;
  const dimAny = computeDimAny(focus);

  const warning = m.battery.status === "warning" || m.brakes.status === "warning";
  const critical =
    m.battery.status === "critical" ||
    m.brakes.status === "critical" ||
    m.core.status === "critical" ||
    m.gearbox.status === "critical" ||
    m.ignition.status === "critical";

  return (
    <group>
      <Chassis dim={dimAny} />

      {/* TASK-SIDESTEPS-ONLY: side pods replaced by removable aluminum side steps. */}
      <SideStep side={1} dim={dimAny} />
      <SideStep side={-1} dim={dimAny} />

      <group name={RL_KART_PART_NAMES.seatGroup}>
        <Seat dim={dimAny} />
        <Steering angleDeg={m.steering.angle} dim={dim(focus, "steering")} />
      </group>

      <ElectricalSystem
        batteryTemp={m.battery.temperature}
        ignitionEnabled={m.ignition.enabled}
        regen={m.brakes.regenLevel}
        dim={dim(focus, "battery")}
      />
      <MotorAssembly dim={dim(focus, "battery")} />

      <group name={RL_KART_PART_NAMES.gearboxGroup}>
        <GearSelector current={m.gearbox.currentGear} dim={dim(focus, "gearbox")} />
        {/* Gearbox housing under seat — 140×140 mm */}
        <mesh position={[0, X.wheelRadius + 0.01, -0.42]}>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color="#2c2f36" metalness={0.7} roughness={0.45} {...dim(focus, "gearbox")} />
        </mesh>
      </group>

      <group name={RL_KART_PART_NAMES.brakesGroup}>
        <BrakeSystem
          pedalPressure={m.brakes.pedalPressure}
          discTemperature={m.brakes.discTemperature}
          regen={m.brakes.regenLevel}
          steeringAngleDeg={m.steering.angle}
          dim={dim(focus, "brakes")}
          susRefs={{ fl: susFL, fr: susFR, rl: susRL, rr: susRR }}
          wheelRefs={{ fl: wheelFL, fr: wheelFR }}
          pedalRef={pedal}
        />
      </group>

      <group name={RL_KART_PART_NAMES.ignitionGroup}>
        <Dashboard
          ignitionEnabled={m.ignition.enabled}
          warning={warning}
          critical={critical}
          dim={dim(focus, "ignition")}
        />
      </group>

      {/* Dashboard interior glow */}
      <pointLight ref={dashLight} position={[0, D.steeringWheelHeight - 0.05, 0.25]} color="#39c5ff" distance={1.2} intensity={0} />
    </group>
  );
}
