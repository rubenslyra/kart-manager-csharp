import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/rl/Nav";
import { Footer } from "@/components/rl/Footer";
import { RealSimulator } from "@/components/realsim/RealSimulator";

export const Route = createFileRoute("/simulador-real")({
  component: RealSimPage,
  head: () => ({
    meta: [
      { title: "Simulador Real — Oficina · RL Kart 26A" },
      {
        name: "description",
        content:
          "Oficina de engenharia do RL Kart 26A. O kart recebe módulos compilados em C# via WebSocket e responde em tempo real à telemetria.",
      },
      { property: "og:title", content: "Simulador Real — Oficina RL Kart" },
      {
        property: "og:description",
        content:
          "Validação técnica do kart com módulos C# (Core/Gearbox/Brakes/Ignition) e checklist de liberação para pista.",
      },
    ],
  }),
});

function RealSimPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
          >
            ← Voltar ao dashboard
          </Link>
          <div className="mt-4 mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Simulador Real <span className="text-primary">— Oficina</span>
              </h1>
              <p className="mt-1 max-w-2xl font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Validação técnica · Recebe módulos C# via WebSocket · Não corre até liberação
              </p>
            </div>
            <Link
              to="/simulator"
              className="corner-cut border border-border bg-card/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-primary hover:text-primary"
            >
              Ir para Simulador Atual →
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-8">
          <RealSimulator />
        </div>
      </main>
      <Footer />
    </div>
  );
}
