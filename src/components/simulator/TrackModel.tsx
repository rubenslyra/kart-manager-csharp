import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import {
  trackCurve,
  CHECKPOINTS,
  TRACK_DECAL_OFFSET,
  TRACK_HALF_WIDTH,
  TRACK_KERB_OFFSET,
  TRACK_SURFACE_OFFSET,
} from "./track";

const TRACK_CENTER = new THREE.Vector3(15, 0, 31);

const TURN_BOARDS = [
  { t: 0.18, side: 1, label: "T1", arrows: ">>>", color: "#facc15" },
  { t: 0.3, side: 1, label: "HAIRPIN", arrows: "<<<", color: "#38bdf8" },
  { t: 0.52, side: -1, label: "SWEEPER", arrows: ">>>", color: "#f97316" },
  { t: 0.68, side: -1, label: "CHICANE", arrows: "<<<", color: "#22c55e" },
  { t: 0.88, side: 1, label: "FINAL", arrows: ">>>", color: "#ef4444" },
];

const RUNOFF_ZONES = [
  { t: 0.18, side: 1, width: 3.2, length: 9, color: "#2563eb" },
  { t: 0.31, side: 1, width: 3.6, length: 10, color: "#f97316" },
  { t: 0.51, side: -1, width: 3.2, length: 10, color: "#2563eb" },
  { t: 0.68, side: -1, width: 2.8, length: 8, color: "#facc15" },
  { t: 0.88, side: 1, width: 3.4, length: 9, color: "#ef4444" },
];

const SPONSOR_LABELS = ["RL KART 26A", "SAFETY CELL", "REAL SCALE", "PIT LANE", "RACE CONTROL"];

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

  const edgeLines = useMemo(() => {
    const build = (pts: THREE.Vector3[], prefix: "inner" | "outer") =>
      pts.map((a, i) => {
        const b = pts[(i + 1) % pts.length];
        const dir = new THREE.Vector3().subVectors(b, a);
        return {
          key: `${prefix}-${i}`,
          pos: a.clone().add(b).multiplyScalar(0.5),
          rot: Math.atan2(dir.x, dir.z),
          len: dir.length(),
        };
      });
    return [...build(innerKerb, "inner"), ...build(outerKerb, "outer")];
  }, [innerKerb, outerKerb]);

  const kerbs = useMemo(() => {
    const segs: { key: string; pos: THREE.Vector3; rot: number; color: string }[] = [];
    const addKerb = (pts: THREE.Vector3[], side: string) => {
      for (let i = 0; i < pts.length; i += 2) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const dir = new THREE.Vector3().subVectors(b, a);
        segs.push({
          key: `${side}-${i}`,
          pos: a.clone().add(b).multiplyScalar(0.5),
          rot: Math.atan2(dir.x, dir.z),
          color: Math.floor(i / 2) % 2 === 0 ? "#ef4444" : "#f9fafb",
        });
      }
    };
    addKerb(outerKerb, "outer");
    addKerb(innerKerb, "inner");
    return segs;
  }, [innerKerb, outerKerb]);

  const runoffZones = useMemo(() => {
    const curve = trackCurve();
    return RUNOFF_ZONES.map((zone, i) => {
      const p = curve.getPointAt(zone.t);
      const tan = curve.getTangentAt(zone.t);
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(zone.side);
      const pos = p.clone().add(normal.multiplyScalar(TRACK_HALF_WIDTH + zone.width * 0.6));
      return {
        ...zone,
        key: `runoff-${i}`,
        pos,
        rot: Math.atan2(tan.x, tan.z),
      };
    });
  }, []);

  const turnBoards = useMemo(() => {
    const curve = trackCurve();
    return TURN_BOARDS.map((board, i) => {
      const p = curve.getPointAt(board.t);
      const tan = curve.getTangentAt(board.t);
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(board.side);
      const pos = p.clone().add(normal.multiplyScalar(TRACK_HALF_WIDTH + 3.4));
      return {
        ...board,
        key: `turn-${i}`,
        pos,
        rot: Math.atan2(TRACK_CENTER.x - pos.x, TRACK_CENTER.z - pos.z),
      };
    });
  }, []);

  const sponsorBoards = useMemo(() => {
    const curve = trackCurve();
    return [0.08, 0.16, 0.24, 0.56, 0.74, 0.82].map((t, i) => {
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const pos = p.clone().add(normal.multiplyScalar(TRACK_HALF_WIDTH + 2.75));
      return {
        key: `sponsor-${i}`,
        label: SPONSOR_LABELS[i % SPONSOR_LABELS.length],
        pos,
        rot: Math.atan2(tan.x, tan.z),
      };
    });
  }, []);

  // Start/finish line position (first sample)
  const startPos = innerKerb[0]
    ? new THREE.Vector3().addVectors(innerKerb[0], outerKerb[0]).multiplyScalar(0.5)
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
        <meshStandardMaterial color="#24472f" roughness={1} />
      </mesh>

      {/* Painted runoff patches make each major corner readable from the first camera. */}
      {runoffZones.map((zone) => (
        <mesh
          key={zone.key}
          position={[zone.pos.x, zone.pos.y + TRACK_DECAL_OFFSET * 0.55, zone.pos.z]}
          rotation={[-Math.PI / 2, 0, zone.rot]}
          receiveShadow
        >
          <planeGeometry args={[zone.width, zone.length]} />
          <meshStandardMaterial color={zone.color} roughness={0.92} transparent opacity={0.74} />
        </mesh>
      ))}

      {/* Asphalt */}
      <mesh geometry={asphaltGeo} receiveShadow>
        <meshStandardMaterial color="#343944" roughness={0.82} metalness={0.04} />
      </mesh>

      {/* Continuous border lines on both track edges. */}
      {edgeLines.map((line) => (
        <mesh
          key={line.key}
          position={[line.pos.x, line.pos.y + TRACK_DECAL_OFFSET, line.pos.z]}
          rotation={[-Math.PI / 2, 0, line.rot]}
        >
          <planeGeometry args={[0.12, line.len]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.12} />
        </mesh>
      ))}

      {/* Center racing line */}
      {Array.from({ length: 80 }).map((_, i) => {
        const t = i / 80;
        const curve = trackCurve();
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const rot = Math.atan2(tan.x, tan.z);
        return (
          <mesh
            key={`cl-${i}`}
            position={[p.x, p.y + TRACK_DECAL_OFFSET, p.z]}
            rotation={[-Math.PI / 2, 0, rot]}
          >
            <planeGeometry args={[0.18, 1.4]} />
            <meshStandardMaterial color="#fafafa" emissive="#fafafa" emissiveIntensity={0.2} />
          </mesh>
        );
      })}

      {/* Kerbs (red/white) on both edges. */}
      {kerbs.map((k, i) => (
        <mesh
          key={k.key}
          position={[k.pos.x, k.pos.y + TRACK_KERB_OFFSET, k.pos.z]}
          rotation={[-Math.PI / 2, 0, k.rot]}
        >
          <planeGeometry args={[0.85, 1.65]} />
          <meshStandardMaterial color={k.color} emissive={k.color} emissiveIntensity={0.32} />
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

      {/* Sponsor boards help the containment perimeter stand out from the spectator area. */}
      {sponsorBoards.map((board) => (
        <group
          key={board.key}
          position={[board.pos.x, board.pos.y, board.pos.z]}
          rotation={[0, board.rot, 0]}
        >
          <mesh position={[0, 1.15, 0]} castShadow>
            <boxGeometry args={[3.9, 1.05, 0.12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} metalness={0.05} />
          </mesh>
          <Text
            position={[0, 1.16, 0.07]}
            fontSize={0.34}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
          >
            {board.label}
          </Text>
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
              position={[
                startPos.x + perpX * offset,
                startPos.y + TRACK_DECAL_OFFSET,
                startPos.z + perpZ * offset,
              ]}
              rotation={[-Math.PI / 2, 0, startRot]}
            >
              <planeGeometry args={[tileW, 1.2]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#0a0a0a" : "#fafafa"} />
            </mesh>
          );
        });
      })()}

      {/* Start grid slots and gantry. */}
      {(() => {
        const rows = 6;
        const laneOffset = TRACK_HALF_WIDTH * 0.32;
        const forwardX = Math.sin(startRot);
        const forwardZ = Math.cos(startRot);
        const perpX = Math.cos(startRot);
        const perpZ = -Math.sin(startRot);
        return (
          <group>
            {Array.from({ length: rows }).map((_, row) =>
              [-1, 1].map((side) => {
                const back = 3.1 + row * 2.25;
                const lateral = side * laneOffset;
                const pos = new THREE.Vector3(
                  startPos.x - forwardX * back + perpX * lateral,
                  startPos.y + TRACK_DECAL_OFFSET,
                  startPos.z - forwardZ * back + perpZ * lateral,
                );
                const slot = row * 2 + (side < 0 ? 1 : 2);
                return (
                  <group
                    key={`grid-${slot}`}
                    position={[pos.x, pos.y, pos.z]}
                    rotation={[-Math.PI / 2, 0, startRot]}
                  >
                    <mesh>
                      <planeGeometry args={[1.25, 1.75]} />
                      <meshStandardMaterial
                        color="#0f172a"
                        emissive="#0f172a"
                        emissiveIntensity={0.08}
                      />
                    </mesh>
                    <mesh position={[0, 0, 0.01]}>
                      <ringGeometry args={[0.34, 0.45, 24]} />
                      <meshStandardMaterial
                        color="#facc15"
                        emissive="#facc15"
                        emissiveIntensity={0.45}
                      />
                    </mesh>
                  </group>
                );
              }),
            )}
            <group position={[startPos.x, startPos.y, startPos.z]} rotation={[0, startRot, 0]}>
              {[-TRACK_HALF_WIDTH - 0.8, TRACK_HALF_WIDTH + 0.8].map((x) => (
                <mesh key={`gantry-post-${x}`} position={[x, 2.2, 0]} castShadow>
                  <boxGeometry args={[0.35, 4.4, 0.35]} />
                  <meshStandardMaterial color="#e5e7eb" metalness={0.55} roughness={0.35} />
                </mesh>
              ))}
              <mesh position={[0, 4.35, 0]} castShadow>
                <boxGeometry args={[TRACK_HALF_WIDTH * 2 + 2.4, 1.15, 0.35]} />
                <meshStandardMaterial color="#111827" emissive="#111827" emissiveIntensity={0.25} />
              </mesh>
              <Text
                position={[0, 4.45, 0.22]}
                fontSize={0.52}
                color="#facc15"
                anchorX="center"
                anchorY="middle"
              >
                KARTODROMO RL 26A
              </Text>
              <Text
                position={[0, 3.92, 0.23]}
                fontSize={0.22}
                color="#e2e8f0"
                anchorX="center"
                anchorY="middle"
              >
                START GRID
              </Text>
            </group>
          </group>
        );
      })()}

      {/* Large turn boards and chevrons. */}
      {turnBoards.map((board) => (
        <group
          key={board.key}
          position={[board.pos.x, board.pos.y, board.pos.z]}
          rotation={[0, board.rot, 0]}
        >
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[3.3, 1.2, 0.12]} />
            <meshStandardMaterial
              color={board.color}
              emissive={board.color}
              emissiveIntensity={0.35}
            />
          </mesh>
          <Text
            position={[0, 1.42, 0.08]}
            fontSize={0.32}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
          >
            {board.label}
          </Text>
          <Text
            position={[0, 1.0, 0.08]}
            fontSize={0.46}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
          >
            {board.arrows}
          </Text>
          <mesh position={[-1.78, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.3, 8]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.45} roughness={0.35} />
          </mesh>
          <mesh position={[1.78, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.3, 8]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.45} roughness={0.35} />
          </mesh>
        </group>
      ))}

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
