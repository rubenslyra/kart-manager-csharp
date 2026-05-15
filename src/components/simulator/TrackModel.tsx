import { useMemo } from "react";
import * as THREE from "three";
import {
  trackCurve,
  CHECKPOINTS,
  TRACK_DECAL_OFFSET,
  TRACK_HALF_WIDTH,
  TRACK_KERB_OFFSET,
  TRACK_SURFACE_OFFSET,
} from "./track";

export function TrackModel() {
  const { asphaltGeo, innerKerb, outerKerb, tireBarriers, safetyFence } = useMemo(() => {
    const curve = trackCurve();
    const samples = 200;
    const halfWidth = TRACK_HALF_WIDTH;

    const innerPts: THREE.Vector3[] = [];
    const outerPts: THREE.Vector3[] = [];
    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      innerPts.push(p.clone().add(normal.clone().multiplyScalar(-halfWidth)));
      outerPts.push(p.clone().add(normal.clone().multiplyScalar(halfWidth)));
    }

    // Build asphalt as a triangle strip ribbon
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i < samples; i++) {
      positions.push(innerPts[i].x, innerPts[i].y + TRACK_SURFACE_OFFSET, innerPts[i].z);
      positions.push(outerPts[i].x, outerPts[i].y + TRACK_SURFACE_OFFSET, outerPts[i].z);
    }
    for (let i = 0; i < samples; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = ((i + 1) % samples) * 2;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
    const asphaltGeo = new THREE.BufferGeometry();
    asphaltGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    asphaltGeo.setIndex(indices);
    asphaltGeo.computeVertexNormals();

    // Tire barriers along outer edge
    const tireBarriers: THREE.Vector3[] = [];
    const safetyFence: { pos: THREE.Vector3; rot: number }[] = [];
    for (let i = 0; i < samples; i += 4) {
      const t = i / samples;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      tireBarriers.push(p.clone().add(normal.clone().multiplyScalar(halfWidth + 1.2)));
    }

    for (let i = 0; i < samples; i += 5) {
      const t = i / samples;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      safetyFence.push({
        pos: p.clone().add(normal.clone().multiplyScalar(halfWidth + 2.0)),
        rot: Math.atan2(tan.x, tan.z),
      });
    }

    return { asphaltGeo, innerKerb: innerPts, outerKerb: outerPts, tireBarriers, safetyFence };
  }, []);

  // Kerb segments at curve positions (every Nth segment alternating red/white)
  const kerbs = useMemo(() => {
    const segs: { pos: THREE.Vector3; rot: number; color: string }[] = [];
    for (let i = 0; i < outerKerb.length; i++) {
      const a = outerKerb[i];
      const b = outerKerb[(i + 1) % outerKerb.length];
      const dir = new THREE.Vector3().subVectors(b, a);
      const rot = Math.atan2(dir.x, dir.z);
      segs.push({
        pos: a.clone().add(b).multiplyScalar(0.5),
        rot,
        color: i % 2 === 0 ? "#ef4444" : "#f9fafb",
      });
    }
    return segs;
  }, [outerKerb]);

  // Start/finish line position (first sample)
  const startPos = innerKerb[0]
    ? new THREE.Vector3()
        .addVectors(innerKerb[0], outerKerb[0])
        .multiplyScalar(0.5)
    : new THREE.Vector3();
  const startRot = (() => {
    if (!innerKerb[1]) return 0;
    const a = new THREE.Vector3().addVectors(innerKerb[0], outerKerb[0]).multiplyScalar(0.5);
    const b = new THREE.Vector3().addVectors(innerKerb[1], outerKerb[1]).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(b, a);
    return Math.atan2(dir.x, dir.z);
  })();

  return (
    <group>
      {/* Ground — grass-like (large enough for elevated track) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, -1.2, 50]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#1f3d2b" roughness={1} />
      </mesh>

      {/* Asphalt */}
      <mesh geometry={asphaltGeo} receiveShadow>
        <meshStandardMaterial color="#2a2d34" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Center racing line */}
      {Array.from({ length: 80 }).map((_, i) => {
        const t = i / 80;
        const curve = trackCurve();
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const rot = Math.atan2(tan.x, tan.z);
        return (
          <mesh key={`cl-${i}`} position={[p.x, p.y + TRACK_DECAL_OFFSET, p.z]} rotation={[-Math.PI / 2, 0, rot]}>
            <planeGeometry args={[0.18, 1.4]} />
            <meshStandardMaterial color="#fafafa" emissive="#fafafa" emissiveIntensity={0.2} />
          </mesh>
        );
      })}

      {/* Kerbs (red/white) along outer edge */}
      {kerbs.map((k, i) => (
        <mesh key={i} position={[k.pos.x, k.pos.y + TRACK_KERB_OFFSET, k.pos.z]} rotation={[-Math.PI / 2, 0, k.rot]}>
          <planeGeometry args={[0.6, 1.4]} />
          <meshStandardMaterial color={k.color} emissive={k.color} emissiveIntensity={0.25} />
        </mesh>
      ))}

      {/* Tire barriers */}
      {tireBarriers.map((p, i) => (
        <mesh key={i} position={[p.x, p.y + 0.4, p.z]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.8, 16]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      ))}

      {/* Safety containment: low wall + debris fence outside the tire barriers. */}
      {safetyFence.map((f, i) => (
        <group key={`safe-${i}`} position={[f.pos.x, f.pos.y, f.pos.z]} rotation={[0, f.rot, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 0.5, 0.18]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.55} metalness={0.08} />
          </mesh>
          <mesh position={[0, 1.55, 0]} castShadow>
            <boxGeometry args={[1.35, 2.1, 0.035]} />
            <meshStandardMaterial
              color="#94a3b8"
              roughness={0.42}
              metalness={0.55}
              transparent
              opacity={0.36}
            />
          </mesh>
          {[-0.62, 0, 0.62].map((x) => (
            <mesh key={`post-${x}`} position={[x, 1.38, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 2.25, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
          {[0.85, 1.45, 2.05].map((y) => (
            <mesh key={`rail-${y}`} position={[0, y, 0.03]}>
              <boxGeometry args={[1.35, 0.025, 0.035]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.35} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Start / finish line — checkered tiles laid across track width */}
      {(() => {
        const tiles = 16;
        const tileW = (TRACK_HALF_WIDTH * 2) / tiles;
        // Perpendicular direction in XZ plane
        const perpX = Math.cos(startRot);
        const perpZ = -Math.sin(startRot);
        return Array.from({ length: tiles }).map((_, i) => {
          const offset = -TRACK_HALF_WIDTH + tileW * (i + 0.5);
          return (
            <mesh
              key={`sf-${i}`}
              position={[startPos.x + perpX * offset, startPos.y + TRACK_DECAL_OFFSET, startPos.z + perpZ * offset]}
              rotation={[-Math.PI / 2, 0, startRot]}
            >
              <planeGeometry args={[tileW, 1.2]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#0a0a0a" : "#fafafa"} />
            </mesh>
          );
        });
      })()}

      {/* Checkpoint flag posts (visible markers along the track) */}
      {CHECKPOINTS.map((tt, i) => {
        const curve = trackCurve();
        const p = curve.getPointAt(tt);
        const tan = curve.getTangentAt(tt);
        const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        const left = p.clone().add(normal.clone().multiplyScalar(-(TRACK_HALF_WIDTH + 0.6)));
        const right = p.clone().add(normal.clone().multiplyScalar(TRACK_HALF_WIDTH + 0.6));
        return (
          <group key={`cp-${i}`}>
            {[left, right].map((pos, j) => (
              <group key={j} position={[pos.x, pos.y, pos.z]}>
                {/* Pole */}
                <mesh position={[0, 1.4, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 2.8, 8]} />
                  <meshStandardMaterial color="#e5e7eb" metalness={0.6} />
                </mesh>
                {/* Checkered flag */}
                <mesh position={[j === 0 ? -0.5 : 0.5, 2.4, 0]} rotation={[0, 0, 0]}>
                  <planeGeometry args={[1, 0.6]} />
                  <meshStandardMaterial color="#fafafa" />
                </mesh>
                {/* Checker tiles overlaid */}
                {Array.from({ length: 6 }).map((_, k) => (
                  <mesh
                    key={k}
                    position={[
                      (j === 0 ? -0.5 : 0.5) + ((k % 3) - 1) * 0.32,
                      2.4 + (Math.floor(k / 3) - 0.5) * 0.28,
                      0.005,
                    ]}
                  >
                    <planeGeometry args={[0.32, 0.28]} />
                    <meshStandardMaterial color={k % 2 === 0 ? "#0a0a0a" : "#fafafa"} />
                  </mesh>
                ))}
                {/* Checkpoint number marker */}
                <mesh position={[0, TRACK_DECAL_OFFSET, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.6, 16]} />
                  <meshStandardMaterial
                    color="#22d3ee"
                    emissive="#22d3ee"
                    emissiveIntensity={0.6}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}
