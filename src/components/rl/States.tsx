import { SectionHeader } from "./ProjectOverview";

const states = [
  { n: "OFF", c: "muted-foreground" },
  { n: "WAITING_MODULES", c: "muted-foreground" },
  { n: "CORE_READY", c: "primary" },
  { n: "GEAR_READY", c: "primary" },
  { n: "BRAKE_READY", c: "primary" },
  { n: "HEALTH_READY", c: "accent" },
  { n: "IGNITION_READY", c: "accent" },
  { n: "READY", c: "accent" },
  { n: "DRIVING", c: "accent" },
  { n: "WARNING", c: "warning" },
  { n: "CRITICAL", c: "destructive" },
  { n: "SHUTDOWN", c: "muted-foreground" },
];

export function States() {
  return (
    <section id="estados" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          index="03"
          title="Sistema de Estados"
          subtitle="Pipeline de execução do kart — do boot ao shutdown."
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {states.map((s, i) => (
            <div
              key={s.n}
              className="panel corner-cut flex items-center gap-4 p-4 font-mono text-xs"
            >
              <span className="text-muted-foreground">{String(i).padStart(2, "0")}</span>
              <span
                className="led h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `var(--${s.c})`, color: `var(--${s.c})` }}
              />
              <span className="font-semibold tracking-wider text-foreground">{s.n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
