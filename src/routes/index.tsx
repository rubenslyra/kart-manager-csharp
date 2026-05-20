import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/rl/Nav";
import { Hero } from "@/components/rl/Hero";
import { ProjectOverview } from "@/components/rl/ProjectOverview";
import { Lessons } from "@/components/rl/Lessons";
import { States } from "@/components/rl/States";
import { Stack } from "@/components/rl/Stack";
import { Sprints } from "@/components/rl/Sprints";
import { Footer } from "@/components/rl/Footer";
import { OperationsDashboard } from "@/components/rl/OperationsDashboard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "RL Kart 26A — Hub Educacional · RLLabs" },
      {
        name: "description",
        content:
          "Mini Kart Eletrico Educacional. Cada aula compila uma DLL em C# que libera uma funcao real do kart. RLLabs + Three.js + Blender + C#.",
      },
      { property: "og:title", content: "RL Kart 26A — RLLabs" },
      {
        property: "og:description",
        content: "Do virtual ao real. Software educacional integrado ao veículo.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <ProjectOverview />
        <Lessons />
        <States />
        <Stack />
        <OperationsDashboard />
        <Sprints />
      </main>
      <Footer />
    </div>
  );
}
