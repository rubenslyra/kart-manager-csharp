import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { KartTelemetry } from "@/bridge/types";

/**
 * Wall-mounted monitors above the back wall:
 *  - 2 race-feed monitors (animated circuit + karts)
 *  - 1 wide engineering metrics monitor (live graphs from telemetry)
 *
 * Uses CanvasTexture redrawn each frame for cheap, deterministic visuals.
 */
export function BackgroundMonitors({ telemetry }: { telemetry: KartTelemetry }) {
  return (
    <group>
      <RaceMonitor position={[-4.2, 3.0, -7.78]} title="LIVE · TURN 3" seed={1} />
      <MetricsMonitor position={[0, 3.2, -7.78]} telemetry={telemetry} />
      <RaceMonitor position={[4.2, 3.0, -7.78]} title="LIVE · MAIN STRAIGHT" seed={2} />
    </group>
  );
}

/* ---------------- Race feed monitor ---------------- */

function RaceMonitor({
  position,
  title,
  seed,
}: {
  position: [number, number, number];
  title: string;
  seed: number;
}) {
  const W = 512;
  const H = 288;

  const { canvas, ctx, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d")!;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    return { canvas: c, ctx: x, texture: t };
  }, []);

  // Karts orbiting on an oval — independent per monitor via seed
  const karts = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        speed: 0.18 + (i * 0.04 + seed * 0.05) % 0.18,
        offset: (i / 5 + seed * 0.13) * Math.PI * 2,
        color: ["#39a8ff", "#5be39a", "#ffb340", "#ff5079", "#cfd6e0"][i],
        num: ["07", "12", "23", "44", "01"][i],
      })),
    [seed],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Background
    ctx.fillStyle = "#06121e";
    ctx.fillRect(0, 0, W, H);

    // Asphalt track (oval)
    const cx = W / 2;
    const cy = H / 2 + 18;
    const rx = 190;
    const ry = 88;
    ctx.strokeStyle = "#1f344a";
    ctx.lineWidth = 56;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#0e2236";
    ctx.lineWidth = 50;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Center line dashes
    ctx.setLineDash([10, 14]);
    ctx.strokeStyle = "#39a8ff66";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Start/finish
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(cx + rx - 4, cy - 26 + i * 10, 6, 5);
      ctx.fillRect(cx + rx + 2, cy - 26 + i * 10 + 5, 6, 5);
    }

    // Karts
    karts.forEach((k) => {
      const a = k.offset + t * k.speed;
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      const heading = Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(heading);
      // shadow
      ctx.fillStyle = "#00000066";
      ctx.fillRect(-10, -5, 22, 10);
      // body
      ctx.fillStyle = k.color;
      ctx.fillRect(-9, -4, 20, 8);
      // wheels
      ctx.fillStyle = "#0a0d12";
      ctx.fillRect(-9, -6, 4, 3);
      ctx.fillRect(-9, 3, 4, 3);
      ctx.fillRect(7, -6, 4, 3);
      ctx.fillRect(7, 3, 4, 3);
      ctx.restore();
    });

    // HUD overlay
    ctx.fillStyle = "#06121ecc";
    ctx.fillRect(0, 0, W, 32);
    ctx.fillStyle = "#5be39a";
    ctx.font = "600 14px ui-monospace, monospace";
    ctx.fillText("● REC", 12, 21);
    ctx.fillStyle = "#9ed8ff";
    ctx.fillText(title, 80, 21);
    ctx.fillStyle = "#cfd6e0";
    ctx.textAlign = "right";
    ctx.fillText(`LAP ${(Math.floor(t / 6) % 24) + 1}/24`, W - 12, 21);
    ctx.textAlign = "left";

    // Bottom telemetry strip
    ctx.fillStyle = "#06121ecc";
    ctx.fillRect(0, H - 28, W, 28);
    ctx.fillStyle = "#39a8ff";
    ctx.font = "12px ui-monospace, monospace";
    const leaderSpd = 132 + Math.sin(t * 0.8) * 6;
    ctx.fillText(`P1 #07  ${leaderSpd.toFixed(0)} km/h`, 12, H - 10);
    ctx.fillStyle = "#ffb340";
    ctx.fillText(`GAP +0.${Math.floor((t * 7) % 99)}s`, 230, H - 10);
    ctx.fillStyle = "#5be39a";
    ctx.textAlign = "right";
    ctx.fillText(`BEST 1:08.${Math.floor((t * 13) % 999).toString().padStart(3, "0")}`, W - 12, H - 10);
    ctx.textAlign = "left";

    // Scanlines
    ctx.fillStyle = "#39a8ff10";
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

    texture.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* Bezel */}
      <mesh>
        <boxGeometry args={[3.6, 2.1, 0.08]} />
        <meshStandardMaterial color="#0a0d12" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Inner frame */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[3.4, 1.92]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[3.36, 1.88]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Status LED */}
      <mesh position={[1.6, -0.92, 0.06]}>
        <circleGeometry args={[0.025, 12]} />
        <meshBasicMaterial color="#5be39a" />
      </mesh>
      {/* Glow */}
      <pointLight position={[0, 0, 0.6]} color="#39a8ff" intensity={0.7} distance={3.2} />
    </group>
  );
}

/* ---------------- Engineering metrics monitor ---------------- */

function MetricsMonitor({
  position,
  telemetry,
}: {
  position: [number, number, number];
  telemetry: KartTelemetry;
}) {
  const W = 768;
  const H = 320;

  const { canvas, ctx, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d")!;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    return { canvas: c, ctx: x, texture: t };
  }, []);

  const histRef = useRef({
    speed: [] as number[],
    battery: [] as number[],
    brake: [] as number[],
    motor: [] as number[],
  });

  useFrame(({ clock }) => {
    const m = telemetry.modules;
    const t = clock.elapsedTime;

    const h = histRef.current;
    const motor = 40 + Math.abs(Math.sin(t * 1.3)) * 35 + (m.battery.temperature - 30) * 0.5;
    const speed = telemetry.speedKmh ?? 0;
    h.speed.push(speed);
    h.battery.push(m.battery.level);
    h.brake.push(m.brakes.discTemperature);
    h.motor.push(motor);
    const MAX = 180;
    for (const k of ["speed", "battery", "brake", "motor"] as const) {
      if (h[k].length > MAX) h[k].splice(0, h[k].length - MAX);
    }

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#08151f");
    grad.addColorStop(1, "#06121e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.fillStyle = "#0d2236";
    ctx.fillRect(0, 0, W, 36);
    ctx.fillStyle = "#39a8ff";
    ctx.font = "700 16px ui-sans-serif, system-ui";
    ctx.fillText("ENGINEERING TELEMETRY · RL KART 26A", 14, 23);
    ctx.fillStyle = "#5be39a";
    ctx.font = "12px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.fillText(`STATE: ${telemetry.vehicleState}`, W - 14, 23);
    ctx.textAlign = "left";

    // Grid
    ctx.strokeStyle = "#1f344a55";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const y = 50 + i * 32;
      ctx.beginPath();
      ctx.moveTo(14, y);
      ctx.lineTo(W - 14, y);
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const x = 14 + i * ((W - 28) / 12);
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x, H - 70);
      ctx.stroke();
    }

    // Plot helpers
    const plotArea = { x: 14, y: 50, w: W - 28, h: H - 70 - 50 };
    const drawSeries = (data: number[], min: number, max: number, color: string) => {
      if (data.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = plotArea.x + (i / (MAX - 1)) * plotArea.w;
        const norm = THREE.MathUtils.clamp((v - min) / (max - min), 0, 1);
        const y = plotArea.y + plotArea.h - norm * plotArea.h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    drawSeries(h.speed, 0, 120, "#39a8ff");
    drawSeries(h.battery, 0, 100, "#5be39a");
    drawSeries(h.brake, 20, 220, "#ffb340");
    drawSeries(h.motor, 0, 120, "#ff5079");

    // Legend
    const legend = [
      { c: "#39a8ff", l: `SPEED ${speed.toFixed(0)} km/h` },
      { c: "#5be39a", l: `BATT ${m.battery.level.toFixed(0)}%` },
      { c: "#ffb340", l: `DISC ${m.brakes.discTemperature.toFixed(0)}°C` },
      { c: "#ff5079", l: `MOTOR ${motor.toFixed(0)}°C` },
    ];
    ctx.font = "12px ui-monospace, monospace";
    legend.forEach((it, i) => {
      const x = 18 + i * 180;
      ctx.fillStyle = it.c;
      ctx.fillRect(x, H - 56, 10, 10);
      ctx.fillStyle = "#cfd6e0";
      ctx.fillText(it.l, x + 16, H - 47);
    });

    // Footer status bar
    ctx.fillStyle = "#0d2236";
    ctx.fillRect(0, H - 28, W, 28);
    ctx.fillStyle = "#9ed8ff";
    ctx.font = "11px ui-monospace, monospace";
    const mods = [
      ["CORE", m.core.status, m.core.loaded],
      ["GBOX", m.gearbox.status, m.gearbox.loaded],
      ["BRK", m.brakes.status, m.brakes.loaded],
      ["IGN", m.ignition.status, m.ignition.loaded],
      ["BAT", m.battery.status, true],
      ["STR", m.steering.status, true],
    ] as const;
    mods.forEach(([name, status, loaded], i) => {
      const x = 14 + i * 124;
      const c =
        !loaded || status === "missing"
          ? "#7a8590"
          : status === "ok"
            ? "#5be39a"
            : status === "warning"
              ? "#ffb340"
              : "#ff5079";
      ctx.fillStyle = c;
      ctx.fillRect(x, H - 20, 8, 8);
      ctx.fillStyle = "#cfd6e0";
      ctx.fillText(`${name} ${loaded ? status.toUpperCase() : "MISS"}`, x + 14, H - 12);
    });

    // Scanlines
    ctx.fillStyle = "#39a8ff0c";
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

    texture.needsUpdate = true;
  });

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[5.6, 2.4, 0.08]} />
        <meshStandardMaterial color="#0a0d12" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[5.4, 2.22]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[5.36, 2.18]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0.8]} color="#39a8ff" intensity={1.0} distance={4} />
    </group>
  );
}
