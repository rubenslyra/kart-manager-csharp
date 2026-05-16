import { createFileRoute } from "@tanstack/react-router";
import { ConfirmHomeExit } from "@/components/rl/ConfirmHomeExit";
import { SimulatorScene } from "@/components/simulator/SimulatorScene";

export const Route = createFileRoute("/simulator")({
  component: SimulatorPage,
  head: () => ({
    meta: [
      { title: "Arena de Corrida — RL Kart 26A" },
      {
        name: "description",
        content: "Arena de corrida interativa do RL Kart 26A com telemetria, replay e IA.",
      },
      { property: "og:title", content: "Arena de Corrida — RL Kart 26A" },
      {
        property: "og:description",
        content: "Experiência de corrida do RL Kart 26A renderizada com Three.js.",
      },
    ],
  }),
});

function SimulatorPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-3">
        <div className="pointer-events-auto">
          <ConfirmHomeExit area="Arena" />
        </div>
        <div className="pointer-events-none hidden text-right md:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary">
            Arena de Corrida
          </div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            RL Kart 26A · replay · telemetria · IA
          </div>
        </div>
      </div>
      <SimulatorScene fullscreen />
    </main>
  );
}
