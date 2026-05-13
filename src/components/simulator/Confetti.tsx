import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, MathUtils, Object3D } from "three";

const CONFETTI_COUNT = 280;
const PALETTE = [
  "#ef4444", "#f59e0b", "#facc15", "#22c55e",
  "#06b6d4", "#3b82f6", "#a855f7", "#ec4899",
];
const dummy = new Object3D();

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
}

/**
 * Confete 3D em InstancedMesh — só montado quando a corrida termina.
 * Partículas caem em espiral sobre o pódio (centro [40, 0, 50]).
 */
export function Confetti({ origin = [40, 0, 50] as [number, number, number] }) {
  const mesh = useRef<InstancedMesh>(null);

  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      arr.push({
        x: origin[0] + (Math.random() - 0.5) * 24,
        y: origin[1] + 18 + Math.random() * 12,
        z: origin[2] + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(0.8 + Math.random() * 1.6),
        vz: (Math.random() - 0.5) * 1.2,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 6,
        vry: (Math.random() - 0.5) * 6,
        vrz: (Math.random() - 0.5) * 6,
      });
    }
    return arr;
  }, [origin]);

  // cores fixas por instância
  const colors = useMemo(() => {
    const cs: Color[] = [];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      cs.push(new Color(PALETTE[i % PALETTE.length]));
    }
    return cs;
  }, []);

  useFrame((_, dt) => {
    if (!mesh.current) return;
    const step = Math.min(dt, 0.05);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.vy -= 1.4 * step; // gravidade leve
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.z += p.vz * step;
      p.rx += p.vrx * step;
      p.ry += p.vry * step;
      p.rz += p.vrz * step;
      // reciclagem ao tocar o chão
      if (p.y < 0.05) {
        p.x = origin[0] + (Math.random() - 0.5) * 24;
        p.y = origin[1] + 22 + Math.random() * 8;
        p.z = origin[2] + (Math.random() - 0.5) * 24;
        p.vy = -(0.6 + Math.random() * 1.4);
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.setScalar(MathUtils.lerp(0.9, 1.4, (i % 7) / 7));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, CONFETTI_COUNT]}
      onUpdate={(self) => {
        for (let i = 0; i < CONFETTI_COUNT; i++) self.setColorAt(i, colors[i]);
        if (self.instanceColor) self.instanceColor.needsUpdate = true;
      }}
    >
      <planeGeometry args={[0.18, 0.28]} />
      <meshBasicMaterial vertexColors toneMapped={false} side={2} transparent opacity={0.95} />
    </instancedMesh>
  );
}
