import { Link } from "@tanstack/react-router";
import { SectionHeader } from "./ProjectOverview";

const raceStats = [
  ["Melhor volta", "1:08.421"],
  ["Replays salvos", "12"],
  ["Sessões de corrida", "34"],
  ["Incidentes médios", "0.8 / volta"],
];

const telemetryStats = [
  ["Velocidade pico", "70 km/h"],
  ["Bateria média", "78%"],
  ["Temperatura crítica", "0 eventos"],
  ["Sinal WebSocket", "Mock / Real ready"],
];

const repairStats = [
  ["Checklist oficina", "6 módulos"],
  ["Reparos registrados", "9"],
  ["Falhas recorrentes", "Bateria / Freio"],
  ["Última inspeção", "Hoje"],
];

const history = [
  "Replay técnico disponível para comparação de voltas.",
  "Telemetria consolidada para bateria, freios, marcha e ignição.",
  "Histórico de oficina vinculado ao checklist de módulos C#.",
];

function MetricPanel({ title, items }: { title: string; items: string[][] }) {
  return (
    <div className="panel corner-cut p-5">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
        {title}
      </div>
      <dl className="space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 border-b border-border/50 pb-2"
          >
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-right font-mono text-xs font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function OperationsDashboard() {
  return (
    <section id="operacao" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          index="06"
          title="Central Operacional"
          subtitle="Replays, telemetria, métricas e históricos sem abrir a arena ou a oficina."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <MetricPanel title="Corridas" items={raceStats} />
          <MetricPanel title="Telemetria" items={telemetryStats} />
          <MetricPanel title="Oficina" items={repairStats} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="panel corner-cut p-5">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
              Histórico e estatísticas
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {history.map((item, i) => (
                <div key={item} className="border border-border/60 bg-card/40 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Registro {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel corner-cut flex flex-col justify-between gap-4 p-5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Acessos dedicados
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A arena de corrida e a oficina agora abrem como experiências em tela cheia. A home
                permanece como painel de leitura e acompanhamento.
              </p>
            </div>
            <div className="grid gap-2">
              <Link
                to="/simulator"
                className="corner-cut bg-primary px-4 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary-glow"
              >
                Entrar na Arena
              </Link>
              <Link
                to="/simulador-real"
                className="corner-cut border border-primary/60 bg-background/60 px-4 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
              >
                Abrir Oficina
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
