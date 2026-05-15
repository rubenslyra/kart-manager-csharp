import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Vector3 } from "three";
import { ghostStore, type GhostLap } from "./ghostStore";
import { trackSurfaceYAt } from "./track";

/**
 * Kart Fantasma — replica a melhor volta gravada do player.
 * Visual deliberadamente simples (silhueta translúcida ciano) para sinalizar
 * "é só um time-attack reference, não um adversário real".
 */
export function GhostKart() {
  const group = useRef<Group>(null);
  const [best, setBest] = useState<GhostLap | null>(ghostStore.getBest());
  const startRef = useRef(performance.now());
  const probe = useRef(new Vector3());

  useEffect(() => {
    const unsub = ghostStore.subscribe(() => {
      setBest(ghostStore.getBest());
      startRef.current = performance.now();
    });
    return () => {
      unsub();
    };
  }, []);

  useFrame(() => {
    if (!best || !group.current) return;
    const tMs = (performance.now() - startRef.current) % best.totalMs;
    const samples = best.samples;
    // busca linear curta (samples ≤ ~1500); barato o suficiente
    let i = 0;
    while (i < samples.length - 1 && samples[i + 1].t < tMs) i++;
    const a = samples[i];
    const b = samples[Math.min(i + 1, samples.length - 1)];
    const span = Math.max(1, b.t - a.t);
    const k = MathUtils.clamp((tMs - a.t) / span, 0, 1);
    const x = a.x + (b.x - a.x) * k;
    const z = a.z + (b.z - a.z) * k;
    probe.current.set(x, 0, z);
    group.current.position.set(x, trackSurfaceYAt(probe.current), z);
    // interpolação angular curta (não cobre wrap > π, mas voltas reais variam pouco entre samples)
    let dy = b.rotY - a.rotY;
    if (dy > Math.PI) dy -= Math.PI * 2;
    if (dy < -Math.PI) dy += Math.PI * 2;
    group.current.rotation.y = a.rotY + dy * k;
  });

  if (!best) return null;

  // Silhueta translúcida: chassi + 4 rodas, sem detalhes
  return (
    <group ref={group}>
      <mesh position={[0, 0.35, 0]} castShadow={false}>
        <boxGeometry args={[0.98, 0.45, 1.55]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.32} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.78, -0.25]}>
        <boxGeometry args={[0.45, 0.55, 0.45]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {[
        [-0.395, 0.14, 0.495],
        [0.395, 0.14, 0.495],
        [-0.41, 0.14, -0.495],
        [0.41, 0.14, -0.495],
      ].map((p, idx) => (
        <mesh key={idx} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 0.1, 14]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
