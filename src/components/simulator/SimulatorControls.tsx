import type { Module, Telemetry } from "./types";

interface Props {
  t: Telemetry;
  loadModule: (m: Module) => void;
  ignite: () => void;
  accelerate: () => void;
  brake: () => void;
  drainBattery: () => void;
  reset: () => void;
}

export function SimulatorControls({
  t,
  loadModule,
  ignite,
  accelerate,
  brake,
  drainBattery,
  reset,
}: Props) {
  const has = (m: Module) => t.modules.includes(m);
  return (
    <div className="panel corner-cut p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Controles · Mock DLLs
        </span>
        <button
          onClick={reset}
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Btn onClick={() => loadModule("CORE")} done={has("CORE")}>
          Carregar Core
        </Btn>
        <Btn onClick={() => loadModule("GEARBOX")} done={has("GEARBOX")} disabled={!has("CORE")}>
          Carregar Câmbio
        </Btn>
        <Btn
          onClick={() => loadModule("BRAKES")}
          done={has("BRAKES")}
          disabled={!has("GEARBOX")}
        >
          Carregar Freios
        </Btn>
        <Btn
          onClick={() => loadModule("IGNITION")}
          done={has("IGNITION")}
          disabled={!has("BRAKES")}
        >
          Carregar Ignição
        </Btn>
        <Btn onClick={ignite} done={t.ignition} disabled={!has("IGNITION")} variant="accent">
          {t.ignition ? "Desligar" : "Ligar Kart"}
        </Btn>
        <Btn onClick={accelerate} disabled={!t.ignition} variant="accent">
          Acelerar
        </Btn>
        <Btn onClick={brake} disabled={!t.ignition} variant="warn">
          Frear
        </Btn>
        <Btn onClick={drainBattery} variant="danger">
          Drenar Bateria
        </Btn>
      </div>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        Bateria &lt;15% → WARNING · =0% → CRITICAL_FAILURE
      </p>
    </div>
  );
}

function Btn({
  children,
  onClick,
  done,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  done?: boolean;
  disabled?: boolean;
  variant?: "primary" | "accent" | "warn" | "danger";
}) {
  const base =
    "corner-cut px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed";
  const styles = done
    ? "bg-accent/15 border border-accent text-accent"
    : variant === "accent"
      ? "bg-accent/90 text-accent-foreground hover:bg-accent"
      : variant === "warn"
        ? "bg-warning/80 text-background hover:bg-warning"
        : variant === "danger"
          ? "bg-destructive/80 text-destructive-foreground hover:bg-destructive"
          : "bg-primary/90 text-primary-foreground hover:bg-primary";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {done ? "✓ " : ""}
      {children}
    </button>
  );
}
