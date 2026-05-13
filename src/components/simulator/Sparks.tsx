import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from "three";
import { raceStore } from "./raceStore";
import { perfStore } from "./perfStore";

const MAX = 160;

export interface SparksHandle {
  emit: (
    origin: Vector3,
    dir: Vector3,
    count?: number,
    opts?: { color?: string; gravity?: number },
  ) => void;
}

interface Particle {
  pos: Vector3;
  vel: Vector3;
  life: number;
  maxLife: number;
  color: Color;
  gravity: number;
}

const _spark = new Color("#ffb347");
const _scratchColor = new Color();

export const Sparks = forwardRef<SparksHandle>((_, ref) => {
  const meshRef = useRef<InstancedMesh>(null);
  const particles = useRef<Particle[]>([]);
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => new SphereGeometry(0.06, 4, 4), []);
  const material = useMemo(
    () => new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }),
    [],
  );

  useImperativeHandle(ref, () => ({
    emit: (origin, dir, count = 8, opts) => {
      if (!perfStore.get().toggles.particlesEnabled) return;
      const c = opts?.color ? _scratchColor.set(opts.color).clone() : _spark.clone();
      const g = opts?.gravity ?? 9;
      for (let i = 0; i < count; i++) {
        if (particles.current.length >= MAX) particles.current.shift();
        const spread = new Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 1.5 + 0.5,
          (Math.random() - 0.5) * 2,
        );
        const v = dir.clone().multiplyScalar(-2 - Math.random() * 3).add(spread);
        particles.current.push({
          pos: origin.clone(),
          vel: v,
          life: 0,
          maxLife: 0.35 + Math.random() * 0.25,
          color: c,
          gravity: g,
        });
      }
    },
  }));

  useFrame((_, dtRaw) => {
    if (!meshRef.current) return;
    const ts = raceStore.get().timeScale;
    const dt = Math.min(dtRaw, 0.05) * ts;
    const arr = particles.current;
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        arr.splice(i, 1);
        continue;
      }
      p.vel.y -= p.gravity * dt;
      p.pos.addScaledVector(p.vel, dt);
    }
    for (let i = 0; i < MAX; i++) {
      const p = arr[i];
      if (!p) {
        dummy.position.set(0, -1000, 0);
        dummy.scale.setScalar(0.001);
      } else {
        const k = 1 - p.life / p.maxLife;
        dummy.position.copy(p.pos);
        dummy.scale.setScalar(0.4 + k * 0.8);
      }
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      if (p && meshRef.current.setColorAt) {
        meshRef.current.setColorAt(i, p.color);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    perfStore.setCounter("sparkAlive", arr.length);
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, MAX]} frustumCulled={false} />;
});
Sparks.displayName = "Sparks";
