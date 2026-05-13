import { motion } from "framer-motion";
import { SectionHeader } from "./ProjectOverview";

const lessons = [
  {
    n: "01",
    title: "Core System",
    dll: "Aula01.Core.dll",
    desc: "Liga sistemas, painel ativo, bateria online, luzes internas.",
    color: "primary",
  },
  {
    n: "02",
    title: "Caixa de Marchas",
    dll: "Aula02.Gearbox.dll",
    desc: "Seleção P, R, N, D, B · Permite movimento.",
    color: "chart-5",
  },
  {
    n: "03",
    title: "Freios e Regeneração",
    dll: "Aula03.Brake.dll",
    desc: "Freio eletrônico · Regeneração · Recuperação de energia.",
    color: "accent",
  },
  {
    n: "04",
    title: "Saúde e Alertas",
    dll: "Aula04.Health.dll",
    desc: "Monitoramento · Alertas críticos · Evita falhas.",
    color: "warning",
  },
  {
    n: "05",
    title: "Ignição e Liberação",
    dll: "Aula05.Ignition.dll",
    desc: "Checklist · Partida segura · Liberação total.",
    color: "destructive",
  },
];

export function Lessons() {
  return (
    <section id="aulas" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          index="02"
          title="Módulos de Desenvolvimento"
          subtitle="Cada aula compila uma DLL em C# que libera uma função real no kart."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {lessons.map((l, i) => (
            <motion.div
              key={l.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="panel corner-cut group relative flex flex-col p-5 transition-all hover:-translate-y-1 hover:glow"
            >
              <div
                className="absolute left-0 top-0 h-1 w-full"
                style={{ backgroundColor: `var(--${l.color})` }}
              />
              <div className="flex items-start justify-between">
                <span className="font-display text-3xl font-black text-muted-foreground/40">
                  {l.n}
                </span>
                <span
                  className="led h-2 w-2 rounded-full"
                  style={{ backgroundColor: `var(--${l.color})`, color: `var(--${l.color})` }}
                />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                {l.title}
              </h3>
              <code className="mt-2 font-mono text-[10px] text-primary">{l.dll}</code>
              <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                {l.desc}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-3 font-mono text-[10px] uppercase tracking-widest">
                <span className="text-muted-foreground">Aula {l.n}</span>
                <span className="text-accent group-hover:text-primary">→ Carregar</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4 panel corner-cut p-4 font-mono text-xs">
          <span className="text-muted-foreground">PROGRESSO</span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-primary to-accent" />
          </div>
          <span className="text-accent">▶ KART LIBERADO P/ PISTA</span>
        </div>
      </div>
    </section>
  );
}
