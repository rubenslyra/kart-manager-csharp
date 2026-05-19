import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, Vector3 } from "three";
import { TRACK_SURFACE_OFFSET, gridPose, trackCurve } from "./track";
import { raceStore, rankedRacers } from "./raceStore";
import { KartModel } from "./KartModel";
import { Nameplate } from "./Nameplate";
import { HitboxHelper } from "./HitboxHelper";
import { perfStore } from "./perfStore";

interface Props {
  id: string;
  name: string;
  color: string;
  startOffset: number;
  baseSpeed: number;
  aggression?: number;
  brakingSkill?: number; // 0..1
  overtakeSkill?: number; // 0..1
  kartNumber?: string;
  showHitbox?: boolean;
  hitboxAuto?: boolean;
  raceActive?: boolean;
  gridIndex?: number;
}

const TRACK_LANE = 1.6;

export function AIKart({
  id,
  name,
  color,
  startOffset,
  baseSpeed,
  aggression = 0.5,
  brakingSkill = 0.5,
  overtakeSkill = 0.5,
  kartNumber = "21",
  showHitbox = false,
  hitboxAuto = false,
  raceActive = true,
  gridIndex,
}: Props) {
  const chassisRef = useRef<Group>(null);
  const group = useRef<Group>(null);
  const curve = useMemo(() => trackCurve(), []);
  const t = useRef(startOffset);
  const lap = useRef(0);
  const lane = useRef(0); // -1..1
  const speed = useRef(baseSpeed);
  const steerVisual = useRef(0); // -1..1 suavizado para passar ao KartModel
  const { camera } = useThree();
  const FAR_DIST_SQ = 120 * 120; // além de 120m da câmera, usamos o caminho leve

  useEffect(() => {
    raceStore.registerRacer({ id, name, color, isPlayer: false });
  }, [id, name, color]);

  useFrame((_, dtRaw) => {
    if (!group.current) return;
    const dt = Math.min(dtRaw, 0.05) * raceStore.get().timeScale;

    if (!raceActive) {
      const pose = gridPose(gridIndex ?? 1);
      group.current.position.set(...pose.position);
      group.current.rotation.y = pose.rotationY;
      t.current = pose.t;
      raceStore.updatePose(id, pose.position[0], pose.position[2], pose.rotationY);
      return;
    }

    // Frustum-cheap distance check: longe da câmera, pulamos curvatura/overtake
    const dx = group.current.position.x - camera.position.x;
    const dz = group.current.position.z - camera.position.z;
    const distSq = dx * dx + dz * dz;
    const isFar = distSq > FAR_DIST_SQ;

    let curvature = 0;
    if (!isFar) {
      // Look at curvature ahead → reduce speed in tight turns
      const ahead1 = curve.getTangentAt((t.current + 0.01) % 1);
      const ahead2 = curve.getTangentAt((t.current + 0.05) % 1);
      curvature = 1 - ahead1.dot(ahead2);
      const turnSign = Math.sign(ahead1.x * ahead2.z - ahead1.z * ahead2.x);
      const targetSteer = MathUtils.clamp(turnSign * curvature * 12, -1, 1);
      steerVisual.current = MathUtils.lerp(steerVisual.current, targetSteer, dt * 6);
    }
    const brakeCoef = 4 + (1 - brakingSkill) * 5;
    const targetSpeed = baseSpeed * (1 - Math.min(curvature * brakeCoef, 0.6));
    speed.current = MathUtils.lerp(speed.current, targetSpeed, dt * 1.5);

    // Overtake logic — só quando perto da câmera
    if (!isFar) {
      const me = raceStore.get().racers[id];
      if (me) {
        const ranked = rankedRacers(raceStore.get());
        const myIdx = ranked.findIndex((r) => r.id === id);
        const ahead = ranked[myIdx - 1];
        const overtakeChance = (aggression * 0.6 + overtakeSkill * 0.6) * dt * 4;
        if (ahead && ahead.totalDist - me.totalDist < 0.018 && Math.random() < overtakeChance) {
          lane.current = lane.current >= 0 ? -1 : 1;
        }
      }
    }

    const curveLen = 350;
    const prevT = (group.current.userData.prevT ?? t.current) as number;
    t.current = (t.current + (speed.current * dt) / curveLen) % 1;
    const point = curve.getPointAt(t.current);
    const tan = curve.getTangentAt(t.current);
    const perp = new Vector3(-tan.z, 0, tan.x).normalize();
    const offset = perp.multiplyScalar(lane.current * TRACK_LANE);
    group.current.position.set(
      point.x + offset.x,
      point.y + TRACK_SURFACE_OFFSET,
      point.z + offset.z,
    );
    group.current.rotation.y = Math.atan2(tan.x, tan.z);
    if (prevT > 0.85 && t.current < 0.15) lap.current += 1;
    group.current.userData.prevT = t.current;

    raceStore.updateProgress(id, t.current, lap.current);
    raceStore.updatePose(
      id,
      group.current.position.x,
      group.current.position.z,
      group.current.rotation.y,
    );
    perfStore.reportGrounded(id, true, speed.current * 3.6);
  });

  return (
    <group ref={group}>
      <group ref={chassisRef}>
        <KartModel
          position={[0, 0, -0.6]}
          state="DRIVING"
          driving
          steer={steerVisual.current}
          speedKmh={speed.current * 3.6}
          liveryColor={color}
          driverName={name.toUpperCase()}
          kartNumber={kartNumber}
          tireLabel="RL RACING"
        />
      </group>
      <Nameplate name={name} color={color} />
      {showHitbox && (
        <HitboxHelper color="#ffaa00" radius={1.4} autoBounds={hitboxAuto} targetRef={chassisRef} />
      )}
    </group>
  );
}
