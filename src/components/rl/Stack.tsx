import { SectionHeader } from "./ProjectOverview";

const stack = [
  {
    title: "Lovable Hub",
    role: "Orquestração + UX",
    items: ["Interface geral", "Dashboard", "HUD", "Fluxo de aulas", "Telemetria"],
    accent: "primary",
  },
  {
    title: "Three.js",
    role: "Mundo 3D",
    items: ["Kart", "Pista", "Física visual", "Iluminação", "NPCs"],
    accent: "chart-5",
  },
  {
    title: "Blender",
    role: "Pipeline de Assets",
    items: ["Chassi GLB", "Pista", "Oficina RL Labs", "Materiais PBR"],
    accent: "warning",
  },
  {
    title: "C# .NET 8",
    role: "Lógica do Kart",
    items: ["DLLs por aula", "ConsoleHost", "Estados", "Validações"],
    accent: "accent",
  },
];

export function Stack() {
  return (
    <section id="stack" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          index="04"
          title="Arquitetura Final"
          subtitle="Lovable é o HUB. Cada camada tem uma responsabilidade clara."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stack.map((s) => (
            <div key={s.title} className="panel corner-cut p-6">
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
                style={{ color: `var(--${s.accent})` }}
              >
                <span className="led h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${s.accent})`, color: `var(--${s.accent})` }} />
                {s.role}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{s.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {s.items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-primary">▸</span> {i}
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
