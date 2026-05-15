import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, Text } from "@react-three/drei";
import { EngineTestRig } from "./parts/MotorAssembly";
import type { EngineTestState } from "./engineTest";
import type { KartTelemetry, ModuleStatus } from "@/bridge/types";
import { buildChecklist, canLeavePit } from "@/bridge/moduleValidator";

/** Cinematic engineering workshop: reflective floor, hydraulic lift, racks, holo panels. */
export function Workshop({
  telemetry,
  engineTest,
}: {
  telemetry: KartTelemetry;
  engineTest: EngineTestState;
}) {
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

      {/* Inspection pad — visual floor insert, top kept at y = 0 so tires do not sink. */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, -0.01, 0]} receiveShadow>
          <boxGeometry args={[2.6, 0.02, 3.2]} />
          <meshStandardMaterial color="#2a3544" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Painted RL outline around pad, just above floor to avoid z-fighting. */}
        <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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

      <DiagnosticBay position={[-5.0, 0, -2]} telemetry={telemetry} />
      <Workbench position={[5.0, 0, -1.5]} />
      <AcousticEngineRoom position={[7.2, 0, 3.9]} engineTest={engineTest} />
      <ToolRack position={[-5.5, 0, 2]} />
      <ToolRack position={[5.5, 0, 2]} />

      <ModuleReadinessPanel position={[-3.4, 2.85, -3.5]} telemetry={telemetry} />
      <TelemetryReadoutPanel position={[3.4, 2.85, -3.5]} telemetry={telemetry} />

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

function AcousticEngineRoom({
  position,
  engineTest,
}: {
  position: [number, number, number];
  engineTest: EngineTestState;
}) {
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
  const sealPositions = [
    [-1.34, 1.05, 0.94, 0],
    [1.34, 1.05, 0.94, 0],
    [0, 2.08, 0.94, Math.PI / 2],
    [0, 0.08, 0.94, Math.PI / 2],
  ] as const;
  const microphonePositions = [
    [-0.72, 0.92, 0.4],
    [0.72, 0.92, 0.4],
    [0, 1.36, -0.28],
  ] as const;

  return (
    <group position={position}>
      <mesh position={[0, 0.035, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.07, 1.8]} />
        <meshStandardMaterial color="#243142" metalness={0.64} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.05, -0.9]} receiveShadow>
        <boxGeometry args={[2.6, 2.1, 0.08]} />
        <meshStandardMaterial color="#1a2430" metalness={0.25} roughness={0.78} />
      </mesh>
      <mesh position={[-1.3, 1.05, 0]} receiveShadow>
        <boxGeometry args={[0.08, 2.1, 1.8]} />
        <meshStandardMaterial color="#1a2430" metalness={0.25} roughness={0.78} />
      </mesh>
      <mesh position={[1.3, 1.05, 0]} receiveShadow>
        <boxGeometry args={[0.08, 2.1, 1.8]} />
        <meshStandardMaterial color="#1a2430" metalness={0.25} roughness={0.78} />
      </mesh>

      {foamPanels.map(([x, y, z, rot], i) => (
        <mesh key={`foam-${i}`} position={[x, y, z]} rotation={[0, rot, 0]}>
          <boxGeometry args={[0.32, 0.78, i % 2 === 0 ? 0.055 : 0.035]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#2c3a49" : "#202b37"} roughness={0.96} />
        </mesh>
      ))}
      {foamPanels.map(([x, y, z, rot], i) => (
        <mesh key={`foam-rib-${i}`} position={[x, y + 0.01, z + (rot === 0 ? 0.028 : 0)]} rotation={[0, rot, 0]}>
          <boxGeometry args={[0.26, 0.035, 0.024]} />
          <meshStandardMaterial color="#2d3b4a" roughness={0.94} metalness={0.08} />
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
      <mesh position={[-0.72, 1.9, 0.35]}>
        <boxGeometry args={[0.6, 0.018, 0.08]} />
        <meshBasicMaterial color="#9ed8ff" />
      </mesh>
      <mesh position={[0.72, 1.9, 0.35]}>
        <boxGeometry args={[0.6, 0.018, 0.08]} />
        <meshBasicMaterial color="#9ed8ff" />
      </mesh>

      <EngineTestRig position={[0, 0, 0]} engineTest={engineTest} />

      {/* Acoustic door frame and sealed observation glass. */}
      {sealPositions.map(([x, y, z, rot], i) => (
        <mesh key={`door-seal-${i}`} position={[x, y, z]} rotation={[0, 0, rot]}>
          <boxGeometry args={i < 2 ? [0.055, 1.95, 0.05] : [1.95, 0.055, 0.05]} />
          <meshStandardMaterial color="#05080d" metalness={0.25} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 1.08, 0.965]}>
        <planeGeometry args={[1.72, 1.32]} />
        <meshBasicMaterial color="#a8d8ff" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.78, 1.08, 0.995]}>
        <boxGeometry args={[0.08, 0.5, 0.045]} />
        <meshStandardMaterial color="#d9dde2" metalness={0.88} roughness={0.2} />
      </mesh>

      {/* Exhaust extraction duct: visible controlled ventilation for Wankel tests. */}
      <mesh position={[0.62, 1.78, -0.76]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.12, 28]} />
        <meshStandardMaterial color="#3b4652" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0.62, 2.04, -0.52]} rotation={[0.72, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.68, 18]} />
        <meshStandardMaterial color="#56616d" metalness={0.78} roughness={0.28} />
      </mesh>
      <mesh position={[0.62, 2.26, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.16, 24]} />
        <meshStandardMaterial color="#111827" metalness={0.65} roughness={0.44} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`exhaust-louver-${i}`} position={[0.62, 2.26, -0.27 + i * 0.045]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.2, 0.012, 0.018]} />
          <meshStandardMaterial color="#8da2b8" metalness={0.8} roughness={0.24} />
        </mesh>
      ))}
      <mesh position={[0.82, 1.72, -0.73]}>
        <sphereGeometry args={[0.035, 16, 12]} />
        <meshBasicMaterial color={engineTest.running ? "#5be39a" : "#7f93a8"} />
      </mesh>

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

      <mesh position={[-0.83, 1.48, 0.91]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.62, 0.34]} />
        <meshBasicMaterial color="#061827" />
      </mesh>
      <Text position={[-0.83, 1.54, 0.9]} rotation={[0, Math.PI, 0]} fontSize={0.04} color="#5be39a" anchorX="center">
        {`${(engineTest.running ? 74 + engineTest.throttle * 22 : 32).toFixed(0)} dB · ${(engineTest.rpm / 1000).toFixed(1)}k RPM`}
      </Text>
      <Text
        position={[-0.83, 1.43, 0.9]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.032}
        color={engineTest.health < 70 ? "#ffb340" : "#9ed8ff"}
        anchorX="center"
      >
        {`HEALTH ${engineTest.health.toFixed(0)}% · LOAD ${(engineTest.load * 100).toFixed(0)}%`}
      </Text>

      {microphonePositions.map(([x, y, z], i) => (
        <group key={`acoustic-mic-${i}`} position={[x, y, z]}>
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.34, 8]} />
            <meshStandardMaterial color="#111318" metalness={0.45} roughness={0.55} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.075, 14]} />
            <meshStandardMaterial color="#d9dde2" metalness={0.82} roughness={0.24} />
          </mesh>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.038, 0.003, 6, 20]} />
            <meshBasicMaterial color={i === 2 ? "#ffb340" : "#39a8ff"} />
          </mesh>
        </group>
      ))}

      <mesh position={[0.34, 0.63, 0.31]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <torusGeometry args={[0.16, 0.012, 10, 36]} />
        <meshStandardMaterial color="#101720" metalness={0.82} roughness={0.3} />
      </mesh>
      <mesh position={[0.34, 0.63, 0.31]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.026, 0.026, 0.42, 16]} />
        <meshStandardMaterial color="#a0a7ae" metalness={0.85} roughness={0.25} />
      </mesh>

      <mesh position={[1.18, 0.78, 0.78]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.38, 1.05]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.45, 0.18]} intensity={1.85 + engineTest.throttle * 0.35} color="#d7ecff" distance={3.6} />
      <pointLight position={[-0.95, 1.62, 0.42]} intensity={0.9} color="#9ed8ff" distance={2.4} />
      <pointLight position={[0.95, 1.62, 0.42]} intensity={0.9} color="#9ed8ff" distance={2.4} />
      <pointLight
        position={[0.72, 1.85, -0.68]}
        intensity={engineTest.running ? 1.05 + engineTest.throttle * 0.85 : 0.42}
        color={engineTest.health < 70 ? "#ffb340" : "#5be39a"}
        distance={2.4}
      />
    </group>
  );
}

function DiagnosticBay({
  position,
  telemetry,
}: {
  position: [number, number, number];
  telemetry: KartTelemetry;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.4, 1.2, 0.6]} />
        <meshStandardMaterial color="#243244" metalness={0.7} roughness={0.4} />
      </mesh>
      <DiagnosticConsoleScreen position={[0, 1.4, 0.08]} telemetry={telemetry} />
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

function ModuleReadinessPanel({
  position,
  telemetry,
}: {
  position: [number, number, number];
  telemetry: KartTelemetry;
}) {
  const checklist = buildChecklist(telemetry);
  const critical = checklist.some((item) => !item.ok);
  const title = critical ? "MODULES CHECK" : "MODULES OK";
  const subtitle = canLeavePit(telemetry) ? "PIT RELEASE ARMED" : telemetry.vehicleState;
  const modules = [
    ["CORE", telemetry.modules.core.loaded, telemetry.modules.core.status],
    ["GEAR", telemetry.modules.gearbox.loaded, telemetry.modules.gearbox.status],
    ["BRK", telemetry.modules.brakes.loaded, telemetry.modules.brakes.status],
    ["IGN", telemetry.modules.ignition.loaded, telemetry.modules.ignition.status],
    ["BAT", telemetry.modules.battery.level > 15, telemetry.modules.battery.status],
  ] as const;

  return (
    <HoloCanvasPanel
      position={position}
      width={2.65}
      height={1.5}
      accent={critical ? "#ffb340" : "#39a8ff"}
      draw={(ctx, w, h, time) => {
        drawPanelShell(ctx, w, h, title, subtitle, critical ? "#ffb340" : "#39a8ff", time);
        ctx.font = "700 32px ui-monospace, monospace";
        modules.forEach(([name, loaded, status], i) => {
          const x = 34 + (i % 2) * 260;
          const y = 112 + Math.floor(i / 2) * 62;
          const ok = loaded && status !== "critical";
          ctx.fillStyle = "#102235";
          ctx.fillRect(x, y - 30, 218, 42);
          ctx.strokeStyle = ok ? "#5be39a99" : status === "warning" ? "#ffb340aa" : "#ff5079aa";
          ctx.strokeRect(x, y - 30, 218, 42);
          ctx.fillStyle = ok ? "#5be39a" : status === "warning" ? "#ffb340" : "#ff5079";
          ctx.fillText(ok ? "OK" : loaded ? status.toUpperCase() : "MISS", x + 128, y);
          ctx.fillStyle = "#9ed8ff";
          ctx.fillText(name, x + 14, y);
        });
      }}
    />
  );
}

function TelemetryReadoutPanel({
  position,
  telemetry,
}: {
  position: [number, number, number];
  telemetry: KartTelemetry;
}) {
  const m = telemetry.modules;
  return (
    <HoloCanvasPanel
      position={position}
      width={2.65}
      height={1.5}
      accent="#5be39a"
      draw={(ctx, w, h, time) => {
        drawPanelShell(ctx, w, h, "LIVE TELEMETRY", telemetry.vehicleState, "#5be39a", time);
        const rows = [
          ["SPD", `${(telemetry.speedKmh ?? 0).toFixed(1)} km/h`, "#39a8ff"],
          ["GEAR", m.gearbox.currentGear, "#ffb340"],
          ["BAT", `${m.battery.level.toFixed(0)}%  ${m.battery.voltage.toFixed(1)}V`, statusColor(m.battery.status)],
          ["BRAKE", `${(m.brakes.pedalPressure * 100).toFixed(0)}%  ${m.brakes.discTemperature.toFixed(0)}C`, statusColor(m.brakes.status)],
          ["STEER", `${m.steering.angle.toFixed(1)} deg`, statusColor(m.steering.status)],
        ];
        ctx.font = "700 28px ui-monospace, monospace";
        rows.forEach(([label, value, color], i) => {
          const y = 102 + i * 42;
          ctx.fillStyle = "#102235";
          ctx.fillRect(34, y - 26, w - 68, 32);
          ctx.fillStyle = "#7f93a8";
          ctx.fillText(label, 52, y);
          ctx.fillStyle = color;
          ctx.textAlign = "right";
          ctx.fillText(value, w - 52, y);
          ctx.textAlign = "left";
        });
      }}
    />
  );
}

function DiagnosticConsoleScreen({
  position,
  telemetry,
}: {
  position: [number, number, number];
  telemetry: KartTelemetry;
}) {
  return (
    <HoloCanvasPanel
      position={position}
      width={1.15}
      height={0.72}
      accent="#39a8ff"
      draw={(ctx, w, h, time) => {
        drawPanelShell(ctx, w, h, "DIAG 26A", telemetry.vehicleState, "#39a8ff", time);
        ctx.font = "700 26px ui-monospace, monospace";
        ctx.fillStyle = canLeavePit(telemetry) ? "#5be39a" : "#ffb340";
        ctx.fillText(canLeavePit(telemetry) ? "READY TO DRIVE" : "PIT VALIDATION", 28, 112);
        ctx.font = "600 22px ui-monospace, monospace";
        ctx.fillStyle = "#9ed8ff";
        ctx.fillText(`GEAR ${telemetry.modules.gearbox.currentGear}`, 28, 152);
        ctx.fillText(`BAT ${telemetry.modules.battery.level.toFixed(0)}%`, 210, 152);
      }}
    />
  );
}

function HoloCanvasPanel({
  position,
  width,
  height,
  accent,
  draw,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  accent: string;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => void;
}) {
  const textureWidth = 640;
  const textureHeight = 360;
  const { ctx, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = textureWidth;
    canvas.height = textureHeight;
    const context = canvas.getContext("2d")!;
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.minFilter = THREE.LinearFilter;
    return { ctx: context, texture: canvasTexture };
  }, []);

  useFrame(({ clock }) => {
    draw(ctx, textureWidth, textureHeight, clock.elapsedTime);
    texture.needsUpdate = true;
  });

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[width + 0.08, height + 0.08]} />
        <meshBasicMaterial color="#07121e" transparent opacity={0.62} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + 0.13, height + 0.13]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} transparent opacity={0.96} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0.7]} color={accent} intensity={0.55} distance={3.2} />
    </group>
  );
}

function drawPanelShell(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  subtitle: string,
  accent: string,
  time: number,
) {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#06111d");
  grad.addColorStop(0.55, "#0b1f31");
  grad.addColorStop(1, "#06111d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#1f344a88";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 80, height);
    ctx.stroke();
  }

  ctx.fillStyle = "#071827dd";
  ctx.fillRect(0, 0, width, 58);
  ctx.fillStyle = accent;
  ctx.font = "800 30px ui-sans-serif, system-ui";
  ctx.fillText(title, 28, 38);
  ctx.fillStyle = "#cfd6e0";
  ctx.font = "600 18px ui-monospace, monospace";
  ctx.textAlign = "right";
  ctx.fillText(subtitle, width - 28, 36);
  ctx.textAlign = "left";

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, width - 24, height - 24);
  ctx.fillStyle = `${accent}18`;
  ctx.fillRect(16, height - 34, ((Math.sin(time * 1.6) + 1) / 2) * (width - 32), 8);

  ctx.fillStyle = "#39a8ff10";
  for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 1);
}

function statusColor(status: ModuleStatus) {
  if (status === "ok") return "#5be39a";
  if (status === "warning") return "#ffb340";
  if (status === "critical") return "#ff5079";
  return "#7f93a8";
}
