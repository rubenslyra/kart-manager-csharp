import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/rl/Nav";
import { Footer } from "@/components/rl/Footer";
import { SimulatorScene } from "@/components/simulator/SimulatorScene";

export const Route = createFileRoute("/simulator")({
  component: SimulatorPage,
  head: () => ({
    meta: [
      { title: "Simulador 3D — RL Kart 26A" },
      {
        name: "description",
        content:
          "Cena 3D interativa do RL Kart 26A. Carregue módulos (DLLs) e ative o kart em tempo real.",
      },
      { property: "og:title", content: "Simulador 3D — RL Kart 26A" },
      {
        property: "og:description",
        content: "Live scene do RL Kart 26A renderizada com Three.js.",
      },
    ],
  }),
});

function SimulatorPage() {
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
        </div>
        <SimulatorScene fullscreen />
      </main>
      <Footer />
    </div>
  );
}
