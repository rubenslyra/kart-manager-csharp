import type { ExtendedPhysics } from "./ExtendedHud";
import { rankedRacers, type RaceState } from "./raceStore";
import type { Telemetry } from "./types";
import { STATE_LABEL } from "./types";
import {
  getTeamRole,
  nextUnlockLabel,
  roleLabel,
  type ControlMode,
} from "./engineeringProgressStore";

interface Props {
  t: Telemetry;
  physics: ExtendedPhysics | null;
  race: RaceState;
  activeViewLabel: string;
  splitMode: boolean;
  rayssaWins: number;
  controlMode: ControlMode;
  canDrive: boolean;
  onSetMode: (mode: ControlMode) => void;
}

const MODULES = ["CORE", "GEARBOX", "BRAKES", "IGNITION"] as const;

export function EngineeringPitWall({
  t,
  physics,
  race,
  activeViewLabel,
  splitMode,
  rayssaWins,
  controlMode,
  canDrive,
  onSetMode,
}: Props) {
  const role = getTeamRole(rayssaWins);
  const ranked = rankedRacers(race).slice(0, 5);
  const rayssa = ranked.find((r) => r.id === "player");

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-40 font-mono">
      <div className="grid gap-2 border border-primary/35 bg-[#070b10]/88 p-2 shadow-2xl backdrop-blur-md md:grid-cols-[1.15fr_1fr_1fr]">
        <div className="relative min-h-[150px] overflow-hidden border border-border/60 bg-[#0b1118] p-3">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary/70" />
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.34em] text-primary">
                Autonomy Racing Pit Wall
              </div>
              <div className="mt-1 text-sm font-black uppercase text-foreground">
                {roleLabel(role)}
              </div>
            </div>
            <div className="text-right text-[9px] uppercase tracking-widest text-muted-foreground">
              <div>{rayssaWins} vitorias P1</div>
              <div className="text-primary">{nextUnlockLabel(rayssaWins)}</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="grid h-12 w-full grid-cols-2 gap-1">
                  <MonitorBars seed={i} />
                  <MonitorFeed active={i === 2} />
                </div>
                <div className="relative h-12 w-10 rounded-t-sm border border-primary/25 bg-[#111827]">
                  <div className="absolute inset-x-1 top-1 h-3 border border-border/60 bg-[#e8eef4]" />
                  <div className="absolute inset-x-2 top-4 h-4 rounded-full bg-[#1f2937]" />
                  <div className="absolute -bottom-1 left-1/2 h-5 w-8 -translate-x-1/2 rounded-t-md bg-[#05070a]" />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-bold text-primary">
                    AUTONOMY
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid min-h-[150px] grid-cols-2 gap-2 border border-border/60 bg-[#081018] p-3">
          <PanelTitle title="Sistemas C# / Qualidade" />
          {MODULES.map((m) => {
            const loaded = t.modules.includes(m);
            return (
              <div key={m} className="border border-border/50 bg-background/35 px-2 py-1.5">
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground">
                  {m}
                </div>
                <div
                  className={
                    loaded ? "text-[11px] text-primary" : "text-[11px] text-muted-foreground"
                  }
                >
                  {loaded ? "validado" : "aguardando"}
                </div>
              </div>
            );
          })}
          <div className="col-span-2 border border-primary/30 bg-primary/10 px-2 py-1.5 text-[9px] uppercase tracking-widest text-primary">
            Estado: {STATE_LABEL[t.state]} · qualidade observada por telemetria real
          </div>
        </div>

        <div className="min-h-[150px] border border-border/60 bg-[#081018] p-3">
          <div className="mb-2 flex items-center justify-between">
            <PanelTitle title="Comando de corrida" />
            <span className="text-[9px] uppercase tracking-widest text-primary">
              {splitMode ? "monitor wall" : activeViewLabel}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest">
            <Metric label="Vel" value={`${t.speed.toFixed(0)} km/h`} />
            <Metric label="RPM" value={`${(physics?.rpm ?? 0).toFixed(0)}`} />
            <Metric label="Grip" value={`${((physics?.grip ?? 0) * 100).toFixed(0)}%`} />
          </div>
          <div className="mt-2 space-y-1 text-[9px] uppercase tracking-widest text-muted-foreground">
            {ranked.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between border-b border-border/30 pb-1"
              >
                <span className={r.id === "player" ? "text-primary" : "text-foreground"}>
                  P{i + 1} {r.name}
                </span>
                <span>L{r.lap}</span>
              </div>
            ))}
          </div>
          <div className="pointer-events-auto mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => onSetMode("ENGINEERING_OBSERVER")}
              className="border border-primary/50 bg-primary/10 px-2 py-1 text-[9px] uppercase tracking-widest text-primary"
            >
              Engenharia
            </button>
            <button
              disabled={!canDrive}
              onClick={() => onSetMode("DRIVER_CONTROL")}
              className="border px-2 py-1 text-[9px] uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: controlMode === "DRIVER_CONTROL" ? "var(--primary)" : "var(--border)",
                color:
                  controlMode === "DRIVER_CONTROL" ? "var(--primary)" : "var(--muted-foreground)",
              }}
            >
              Pilotar
            </button>
          </div>
          {rayssa && (
            <div className="mt-2 text-[9px] uppercase tracking-widest text-muted-foreground">
              Rayssa: P{ranked.findIndex((r) => r.id === "player") + 1} · volta {rayssa.lap}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ title }: { title: string }) {
  return (
    <div className="col-span-2 text-[9px] uppercase tracking-[0.28em] text-primary">{title}</div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/50 bg-background/35 px-2 py-1.5">
      <div className="text-[8px] text-muted-foreground">{label}</div>
      <div className="text-[11px] text-foreground">{value}</div>
    </div>
  );
}

function MonitorBars({ seed }: { seed: number }) {
  return (
    <div className="flex items-end gap-0.5 border border-primary/25 bg-[#06121e] p-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="block flex-1 bg-primary/70"
          style={{ height: `${22 + ((i * 17 + seed * 13) % 45)}%` }}
        />
      ))}
    </div>
  );
}

function MonitorFeed({ active }: { active: boolean }) {
  return (
    <div className="relative overflow-hidden border border-accent/25 bg-[#07131d]">
      <div className="absolute left-1 top-1 h-1 w-1 rounded-full bg-destructive" />
      <div className="absolute inset-x-1 top-1/2 h-px bg-accent/70" />
      <div className="absolute inset-y-1 left-1/2 w-px bg-accent/70" />
      <div className={active ? "absolute bottom-1 right-1 h-1.5 w-3 bg-primary" : "hidden"} />
    </div>
  );
}
