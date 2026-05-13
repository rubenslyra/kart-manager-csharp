import { Billboard, Text } from "@react-three/drei";
import type { KartTelemetry } from "@/bridge/types";
import { MODULE_ANCHORS, type FocusTarget } from "./parts/shared";

const COLOR: Record<string, string> = {
  ok: "#5be39a",
  warning: "#ffb340",
  critical: "#ff5050",
  missing: "#7a8590",
};

interface Props {
  telemetry: KartTelemetry;
  focus: FocusTarget;
  visible: boolean;
}

export function ModuleLabels({ telemetry, focus, visible }: Props) {
  if (!visible) return null;
  const m = telemetry.modules;

  const labels: { id: Exclude<FocusTarget, null>; text: string; status: string }[] = [
    {
      id: "battery",
      text: `BATTERY · ${m.battery.level.toFixed(0)}% · ${m.battery.temperature.toFixed(0)}°C`,
      status: m.battery.status,
    },
    {
      id: "brakes",
      text: `BRAKES · ${m.brakes.discTemperature.toFixed(0)}°C · pedal ${(m.brakes.pedalPressure * 100).toFixed(0)}%`,
      status: m.brakes.loaded ? m.brakes.status : "missing",
    },
    {
      id: "steering",
      text: `STEERING · ${m.steering.angle.toFixed(1)}°`,
      status: m.steering.status,
    },
    {
      id: "ignition",
      text: `IGNITION · ${m.ignition.enabled ? "ON" : "OFF"}`,
      status: m.ignition.loaded ? m.ignition.status : "missing",
    },
    {
      id: "gearbox",
      text: `GEARBOX · ${m.gearbox.currentGear}`,
      status: m.gearbox.loaded ? m.gearbox.status : "missing",
    },
  ];

  return (
    <group>
      {/* Global vehicle state label */}
      <Billboard position={[0, 1.05, 0]}>
        <Text
          fontSize={0.08}
          color="#39a8ff"
          outlineWidth={0.008}
          outlineColor="#06121e"
          anchorX="center"
        >
          {`VEHICLE: ${telemetry.vehicleState}`}
        </Text>
      </Billboard>

      {labels.map((l) => {
        if (focus !== null && focus !== l.id) return null;
        const a = MODULE_ANCHORS[l.id];
        const color = COLOR[l.status] ?? "#cfd6e0";
        return (
          <Billboard key={l.id} position={[a[0], a[1] + 0.30, a[2]]}>
            {/* leader line */}
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[0.004, 0.28, 0.004]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <Text
              fontSize={0.045}
              color={color}
              outlineWidth={0.006}
              outlineColor="#06121e"
              anchorX="center"
            >
              {l.text}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
}
