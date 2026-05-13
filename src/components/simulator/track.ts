import * as THREE from "three";
import config from "./trackConfig.json";

export const TRACK_HALF_WIDTH = config.trackHalfWidth ?? 5;

// Centerline curve from trackConfig.json
export function trackCurve() {
  const pts = config.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
}

// Cached sampled points for fast nearest-point queries
let cached: { points: THREE.Vector3[]; ts: number[] } | null = null;
export function sampledTrack(samples = 600) {
  if (cached && cached.points.length === samples) return cached;
  const curve = trackCurve();
  const points: THREE.Vector3[] = [];
  const ts: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t = i / samples;
    points.push(curve.getPointAt(t));
    ts.push(t);
  }
  cached = { points, ts };
  return cached;
}

// Returns { distance, t (0..1), point } of closest centerline point to pos (XZ only).
// `point` carries the curve's Y so callers can ride the track elevation.
export function nearestOnTrack(pos: THREE.Vector3) {
  const { points, ts } = sampledTrack();
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - pos.x;
    const dz = points[i].z - pos.z;
    const d = dx * dx + dz * dz;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return { distance: Math.sqrt(bestD), t: ts[best], point: points[best], index: best };
}

// Checkpoint t-values (0..1) loaded from config
export const CHECKPOINTS: number[] = config.checkpoints;

// Spawn pose (just before start line, on track)
export function spawnPose(): { position: [number, number, number]; rotationY: number } {
  const curve = trackCurve();
  const p = curve.getPointAt(0.98);
  const tan = curve.getTangentAt(0.98);
  // Kart visual nose is +Z. atan2(tan.x, tan.z) aligns local +Z with tangent.
  const rotY = Math.atan2(tan.x, tan.z);
  return { position: [p.x, p.y, p.z], rotationY: rotY };
}

export const TRACK_CONFIG = config;
