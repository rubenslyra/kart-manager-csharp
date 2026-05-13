import { useMemo } from "react";
import { useTelemetryRecent, type TelemetrySample } from "./telemetry";

interface SparkProps {
  label: string;
  unit?: string;
  values: number[];
  current: number;
  min: number;
  max: number;
  color: string;
  digits?: number;
}

function Spark({ label, unit, values, current, min, max, color, digits = 1 }: SparkProps) {
  const w = 140;
  const h = 36;
  const path = useMemo(() => {
    if (values.length < 2) return "";
    const range = max - min || 1;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((Math.max(min, Math.min(max, v)) - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [values, min, max]);
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-display text-xs font-bold" style={{ color }}>
          {current.toFixed(digits)}
          {unit ? <span className="ml-0.5 text-[8px] text-muted-foreground">{unit}</span> : null}
        </span>
      </div>
      <svg width={w} height={h} className="block" aria-hidden>
        <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="var(--border)" strokeWidth={0.5} />
        {path && <path d={path} fill="none" stroke={color} strokeWidth={1.4} />}
      </svg>
    </div>
  );
}

export function TelemetryCharts() {
  const data: TelemetrySample[] = useTelemetryRecent(180);
  if (data.length === 0) return null;
  const last = data[data.length - 1];
  const get = (k: keyof TelemetrySample) => data.map((d) => d[k] as number);
  return (
    <div className="pointer-events-none absolute left-3 bottom-3 z-40 corner-cut border border-primary/40 bg-background/80 p-3 font-mono backdrop-blur-sm">
      <div className="mb-1 text-[9px] uppercase tracking-widest text-primary">Live Charts · 6s</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Spark label="RPM" values={get("rpm")} current={last.rpm} min={900} max={12000} color="var(--primary)" digits={0} />
        <Spark label="Torque" unit="Nm" values={get("torque")} current={last.torque} min={0} max={100} color="var(--accent)" digits={0} />
        <Spark label="Grip" unit="%" values={get("grip").map((v) => v * 100)} current={last.grip * 100} min={0} max={100} color="var(--warning)" digits={0} />
        <Spark label="Speed" unit="km/h" values={get("speedKmh")} current={last.speedKmh} min={0} max={80} color="var(--primary)" digits={0} />
        <Spark label="G-Lat" values={get("latG")} current={last.latG} min={-2.5} max={2.5} color="var(--destructive)" digits={2} />
        <Spark label="G-Long" values={get("longG")} current={last.longG} min={-2.5} max={2.5} color="var(--accent)" digits={2} />
      </div>
    </div>
  );
}
