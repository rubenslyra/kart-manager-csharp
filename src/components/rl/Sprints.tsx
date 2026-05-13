import { SectionHeader } from "./ProjectOverview";

const sprints = [
  {
    n: "Sprint 1",
    title: "Base Executável",
    status: "EM EXECUÇÃO",
    items: ["Kart parado na oficina", "HUD funcionando", "Painel acendendo", "Aula 1 integrada"],
    color: "accent",
  },
  {
    n: "Sprint 2",
    title: "Pista & Movimento",
    status: "PRÓXIMO",
    items: ["Pista básica", "Movimento", "Marcha", "Som"],
    color: "primary",
  },
  {
    n: "Sprint 3",
    title: "Freio & Regeneração",
    status: "PLANEJADO",
    items: ["Freio hidráulico", "Regeneração", "Alertas críticos"],
    color: "warning",
  },
  {
    n: "Sprint 4",
    title: "Corrida & Telemetria",
    status: "PLANEJADO",
    items: ["Corrida simples", "Boxes", "NPCs", "Telemetria completa"],
    color: "chart-5",
  },
];

export function Sprints() {
  return (
    <section id="sprints" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          index="05"
          title="Roadmap de Sprints"
          subtitle="Pequeno o suficiente para executar. Grande o suficiente para impressionar."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {sprints.map((s) => (
            <div key={s.n} className="panel corner-cut relative overflow-hidden p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: `var(--${s.color})` }}
                  >
                    {s.n}
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                    {s.title}
                  </h3>
                </div>
                <span
                  className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
                  style={{ borderColor: `var(--${s.color})`, color: `var(--${s.color})` }}
                >
                  {s.status}
                </span>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                {s.items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: `var(--${s.color})` }}>■</span> {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
