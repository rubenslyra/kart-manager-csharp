import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, MeshStandardMaterial, Object3D } from "three";
import { perfStore } from "./perfStore";
import { usePerf } from "./perfStore";

type CrowdShader = { uniforms: { uTime: { value: number } }; vertexShader: string };
import { TRACK_CONFIG } from "./track";

/**
 * Grandstand — bleachers with ~2000 NPCs rendered via THREE.InstancedMesh.
 * Animation runs entirely on the GPU via MeshStandardMaterial.onBeforeCompile,
 * so 2k+ spectators bob/jump without a CPU per-frame matrix update.
 */
const ROWS = 20;
const COLS = 100;
const COUNT = ROWS * COLS; // 2000

const PALETTE = [
  "#e11d48",
  "#f59e0b",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#ffffff",
  "#0ea5e9",
  "#ef4444",
  "#fde047",
];

function injectCrowdShader(material: MeshStandardMaterial, isHead: boolean) {
  material.onBeforeCompile = (shader) => {
    const s = shader as unknown as CrowdShader;
    s.uniforms.uTime = { value: 0 };
    (material.userData as { shader?: CrowdShader }).shader = s;

    s.vertexShader = s.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        float crowdPhase(float id) { return mod(id * 0.6180339, 6.2831853); }`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3( position );
        float id = float(gl_InstanceID);
        float phase = crowdPhase(id);
        float bob = sin(uTime * 4.0 + phase * 3.0) * 0.04;
        float jumpRaw = max(0.0, sin(uTime * 1.5 + phase * 2.0));
        float jump = pow(jumpRaw, 6.0) * ${isHead ? "0.32" : "0.30"};
        float sway = cos(uTime * 2.0 + phase) * 0.06 * max(0.0, transformed.y);
        transformed.y += bob + jump;
        transformed.x += sway;`,
      );
  };
  material.needsUpdate = true;
}

export function Grandstand() {
  const bodies = useRef<InstancedMesh>(null);
  const heads = useRef<InstancedMesh>(null);
  const perf = usePerf();
  const crowdOn = perf.toggles.crowdEnabled;

  useEffect(() => {
    perfStore.setCounter("crowdCount", crowdOn ? COUNT : 0);
  }, [crowdOn]);

  const anchor = TRACK_CONFIG.assets.bleachers;
  const lookAt = useMemo(() => {
    const dx = 0 - anchor.x;
    const dz = 0 - anchor.z;
    return Math.atan2(dx, dz);
  }, [anchor]);

  const layout = useMemo(() => {
    const positions: { x: number; y: number; z: number; scale: number }[] = [];
    const colors: Color[] = [];
    const skins: Color[] = [];
    const skinPalette = ["#5b3320", "#8b5a2b", "#c08457", "#3a2418", "#a06a3f"];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const xLocal = (c - (COLS - 1) / 2) * 0.7 + (Math.random() - 0.5) * 0.15;
        const yLocal = 0.55 + r * 0.55;
        const zLocal = -r * 0.95 + (Math.random() - 0.5) * 0.1;
        const scale = 0.85 + Math.random() * 0.35;
        positions.push({ x: xLocal, y: yLocal, z: zLocal, scale });
        colors.push(new Color(PALETTE[(r * 7 + c * 3) % PALETTE.length]));
        skins.push(new Color(skinPalette[Math.floor(Math.random() * skinPalette.length)]));
      }
    }
    return { positions, colors, skins };
  }, []);

  // Bake matrices once (animation is GPU-side via shader uniform uTime)
  useEffect(() => {
    if (!bodies.current || !heads.current) return;
    const dummy = new Object3D();
    layout.positions.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.rotation.set(0, (Math.random() - 0.5) * 0.3, 0);
      dummy.updateMatrix();
      bodies.current!.setMatrixAt(i, dummy.matrix);
      bodies.current!.setColorAt(i, layout.colors[i]);

      dummy.position.set(p.x, p.y + 0.45 * p.scale, p.z);
      dummy.updateMatrix();
      heads.current!.setMatrixAt(i, dummy.matrix);
      heads.current!.setColorAt(i, layout.skins[i]);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
    if (bodies.current.instanceColor) bodies.current.instanceColor.needsUpdate = true;
    if (heads.current.instanceColor) heads.current.instanceColor.needsUpdate = true;
  }, [layout]);

  // Materials with shader injection (memoised so the patch only runs once)
  const bodyMat = useMemo(() => {
    const m = new MeshStandardMaterial({ roughness: 0.85, metalness: 0.0, vertexColors: false });
    injectCrowdShader(m, false);
    return m;
  }, []);
  const headMat = useMemo(() => {
    const m = new MeshStandardMaterial({ roughness: 0.7, metalness: 0.0, vertexColors: false });
    injectCrowdShader(m, true);
    return m;
  }, []);

  // Drive shader uniform once per frame (single CPU op for entire crowd)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const bs = (bodyMat.userData as { shader?: CrowdShader }).shader;
    const hs = (headMat.userData as { shader?: CrowdShader }).shader;
    if (bs) bs.uniforms.uTime.value = t;
    if (hs) hs.uniforms.uTime.value = t;
  });

  const standWidth = COLS * 0.7 + 4;
  const standDepth = ROWS * 0.95 + 2;

  return (
    <group position={[anchor.x, anchor.y, anchor.z]} rotation={[0, lookAt, 0]}>
      {/* Base platform */}
      <mesh position={[0, 0, -standDepth / 2 + 0.5]} receiveShadow>
        <boxGeometry args={[standWidth, 0.4, standDepth]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Bleacher steps */}
      {Array.from({ length: ROWS }).map((_, r) => (
        <mesh key={r} position={[0, 0.25 + r * 0.55, -r * 0.95]} receiveShadow>
          <boxGeometry args={[standWidth, 0.5, 0.95]} />
          <meshStandardMaterial color={r % 2 === 0 ? "#1e293b" : "#0b1220"} roughness={0.85} />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, ROWS * 0.3 + 1.5, -ROWS * 0.95 - 0.5]} castShadow>
        <boxGeometry args={[standWidth + 0.5, ROWS * 0.55 + 4, 0.4]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Sponsor sign */}
      <mesh position={[0, ROWS * 0.55 + 1.2, -ROWS * 0.95 - 0.3]}>
        <planeGeometry args={[14, 2]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.6} />
      </mesh>

      {crowdOn && (
        <>
          {/* Crowd — bodies (capsules) */}
          <instancedMesh
            ref={bodies}
            args={[undefined, undefined, COUNT]}
            material={bodyMat}
            frustumCulled={false}
            castShadow={false}
            receiveShadow={false}
          >
            <capsuleGeometry args={[0.16, 0.34, 4, 6]} />
          </instancedMesh>

          {/* Crowd — heads (spheres) */}
          <instancedMesh
            ref={heads}
            args={[undefined, undefined, COUNT]}
            material={headMat}
            frustumCulled={false}
            castShadow={false}
            receiveShadow={false}
          >
            <sphereGeometry args={[0.14, 8, 8]} />
          </instancedMesh>
        </>
      )}
    </group>
  );
}
