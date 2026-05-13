import blueprint from "@/assets/blueprint-overview.jpg";

const specs = [
  ["Comprimento", "1550 mm"],
  ["Largura", "980 mm"],
  ["Altura", "650 mm"],
  ["Peso", "~85 kg"],
  ["Autonomia", "25–35 km"],
  ["Chassi", "Tubular Aço SAE 1020"],
  ["Freios", "Discos Hidráulicos"],
  ["Idade Recomendada", "12+"],
];

export function ProjectOverview() {
  return (
    <section id="projeto" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader index="01" title="Visão Geral do Projeto" subtitle="Blueprint técnico — Do virtual ao real" />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="panel corner-cut overflow-hidden">
            <img
              src={blueprint}
              alt="Blueprint completo do RL Kart 26A com chassi, sistema elétrico e simulação"
              loading="lazy"
              width={1280}
              height={853}
              className="h-auto w-full opacity-90"
            />
          </div>
          <div className="panel corner-cut p-6">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
              ::Especificações Gerais
            </div>
            <dl className="divide-y divide-border">
              {specs.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="font-mono text-sm font-semibold text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
          [ {index} ] · Sistema
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:block">
        RL://{title.toLowerCase().replace(/\s+/g, "_")}
      </div>
    </div>
  );
}
