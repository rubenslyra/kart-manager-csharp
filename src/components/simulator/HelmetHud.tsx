import { useEffect, useMemo, useRef, useState } from "react";
import type { ExtendedPhysics } from "./ExtendedHud";
import type { Telemetry } from "./types";

interface Props {
  active: boolean;
  audioEnabled: boolean;
  t: Telemetry;
  lap: { progress: number; count: number };
  physics: ExtendedPhysics | null;
}

const ENGINEER_MESSAGES = [
  "Rayssa, mantem linha e aquece os pneus.",
  "Boa reta. Prepara a frenagem no proximo setor.",
  "Corrige suave. Recupera tracao antes de acelerar.",
  "Setor concluido. Ritmo consistente.",
] as const;

export function HelmetHud({ active, audioEnabled, t, lap, physics }: Props) {
  const [message, setMessage] = useState<string>(ENGINEER_MESSAGES[0]);
  const lastSpoken = useRef("");
  const lastAt = useRef(0);

  const nextMessage = useMemo(() => {
    if (physics?.drift || (physics && physics.grip < 0.38)) return ENGINEER_MESSAGES[2];
    if (lap.progress > 0.88) return ENGINEER_MESSAGES[3];
    if (t.speed > 52) return ENGINEER_MESSAGES[1];
    return ENGINEER_MESSAGES[0];
  }, [lap.progress, physics, t.speed]);

  useEffect(() => {
    if (!active) return;
    const now = performance.now();
    if (nextMessage === message && now - lastAt.current < 5000) return;
    if (now - lastAt.current < 3500) return;
    lastAt.current = now;
    setMessage(nextMessage);
  }, [active, message, nextMessage]);

  useEffect(() => {
    if (
      !active ||
      !audioEnabled ||
      lastSpoken.current === message ||
      !("speechSynthesis" in window)
    )
      return;
    lastSpoken.current = message;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "pt-BR";
    utterance.rate = 1.03;
    utterance.pitch = 0.95;
    utterance.volume = 0.72;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [active, audioEnabled, message]);

  if (!active) return null;

  const rpm = physics?.rpm ?? 0;
  const grip = physics?.grip ?? 1;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden font-mono uppercase tracking-widest text-primary">
      <div className="absolute inset-0 rounded-[42%] border-x border-primary/20 bg-[radial-gradient(ellipse_at_center,transparent_46%,rgba(3,7,18,0.36)_78%,rgba(3,7,18,0.68)_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-28 w-44 -translate-x-1/2 -translate-y-1/2 opacity-35">
        <div className="absolute left-1/2 top-0 h-full w-px bg-primary/70" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-primary/70" />
        <div className="absolute inset-x-10 inset-y-7 rounded-full border border-primary/60" />
      </div>

      <div className="absolute left-4 top-4 w-64 border border-primary/35 bg-background/45 p-3 backdrop-blur-sm corner-cut">
        <div className="text-[9px] text-primary/70">ENG // RADIO</div>
        <div className="mt-1 text-[11px] normal-case tracking-normal text-foreground">
          {message}
        </div>
        <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
          <span>VOZ {audioEnabled ? "ON" : "STANDBY"}</span>
          <span>RAYSSA 77</span>
        </div>
      </div>

      <div className="absolute right-4 top-4 min-w-44 border border-primary/35 bg-background/45 p-3 text-right backdrop-blur-sm corner-cut">
        <div className="text-[9px] text-primary/70">VISOR SPEED</div>
        <div className="font-display text-3xl font-black leading-none text-primary text-glow">
          {t.speed.toFixed(0)}
        </div>
        <div className="text-[9px] text-muted-foreground">km/h // {t.gear}</div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 grid gap-3 md:grid-cols-4">
        <HelmetMetric label="RPM" value={rpm.toFixed(0)} pct={Math.min(rpm / 12000, 1)} />
        <HelmetMetric label="Grip" value={`${(grip * 100).toFixed(0)}%`} pct={grip} />
        <HelmetMetric label="Lap" value={`${lap.count}`} pct={lap.progress} />
        <HelmetMetric label="Battery" value={`${t.battery.toFixed(0)}%`} pct={t.battery / 100} />
      </div>
    </div>
  );
}

function HelmetMetric({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="border border-primary/30 bg-background/40 px-3 py-2 backdrop-blur-sm corner-cut">
      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-display text-foreground">{value}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-sm border border-border bg-card/40">
        <div
          className="h-full bg-primary"
          style={{ width: `${Math.max(0, Math.min(1, pct)) * 100}%` }}
        />
      </div>
    </div>
  );
}
