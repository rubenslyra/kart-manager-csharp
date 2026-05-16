import { createFileRoute } from "@tanstack/react-router";
import { ConfirmHomeExit } from "@/components/rl/ConfirmHomeExit";
import { RealSimulator } from "@/components/realsim/RealSimulator";

export const Route = createFileRoute("/simulador-real")({
  component: RealSimPage,
  head: () => ({
    meta: [
      { title: "Oficina — RL Kart 26A" },
      {
        name: "description",
        content:
          "Oficina de engenharia do RL Kart 26A. O kart recebe módulos compilados em C# via WebSocket e responde em tempo real à telemetria.",
      },
      { property: "og:title", content: "Oficina — RL Kart 26A" },
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
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-3">
        <div className="pointer-events-auto">
          <ConfirmHomeExit area="Oficina" />
        </div>
        <div className="pointer-events-none hidden text-right md:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary">
            Oficina
          </div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Validação técnica · módulos C# · checklist
          </div>
        </div>
      </div>
      <RealSimulator fullscreen />
    </main>
  );
}
