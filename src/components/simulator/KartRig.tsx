import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from "three";
import { PerspectiveCamera } from "@react-three/drei";
import { KartModel } from "./KartModel";
import { useKartControls } from "./useKartControls";
import {
  CHECKPOINTS,
  TRACK_HALF_WIDTH,
  TRACK_SURFACE_OFFSET,
  nearestOnTrack,
  spawnPose,
  trackCurve,
} from "./track";
import type { Gear, KartState } from "./types";
import { raceStore } from "./raceStore";
import type { SparksHandle } from "./Sparks";
import type { ExtendedPhysics } from "./ExtendedHud";
import { telemetry } from "./telemetry";
import { ghostStore } from "./ghostStore";
import { HitboxHelper } from "./HitboxHelper";
import { perfStore } from "./perfStore";

export interface DebugStats {
  speed: number;
  fov: number;
  rotationY: number;
  pos: { x: number; z: number };
  gear: Gear;
  grounded: boolean;
}

interface Props {
  state: KartState;
  ignition: boolean;
  battery: number;
  devMode: boolean;
  resetSignal: number;
  splitMode: boolean;
  activeView: number;
  onKinematics: (speed: number, gear: Gear) => void;
  onLapProgress: (progress: number, lap: number) => void;
  onCameras?: (cams: ThreePerspectiveCamera[]) => void;
  onDebug?: (stats: DebugStats) => void;
  onPhysics?: (p: ExtendedPhysics) => void;
  sparksRef?: React.RefObject<SparksHandle | null>;
  playerId?: string;
  showHitbox?: boolean;
  hitboxAuto?: boolean;
  controlMode?: "manual" | "autopilot";
}

const PHYS = {
  acceleration: 28,
  reverseAccel: 22,
  brakeForce: 70,
  rollingFriction: 1.4,
  steerSpeed: 1.6,
  maxSpeed: 70,
  maxReverse: 25,
  visualScale: 1,
};

const FOV_BASE = 70;
const FOV_MAX = 95;
const CHASE_INDEX = 1;
const FREE_INDEX = 4;

const _offset = new Vector3();
const _desired = new Vector3();
const _lookTarget = new Vector3();
const _prevVel = new Vector3();
const _curVel = new Vector3();
const _sparkOriginL = new Vector3();
const _sparkOriginR = new Vector3();
const _back = new Vector3();
const _right = new Vector3();
const _lookAheadTan = new Vector3();
const CHASE_OFFSET = new Vector3(0, 2.5, -5.5);
const CHASE_LOOK = new Vector3(0, 1.0, 2.0);

export function KartRig({
  state,
  ignition,
  battery,
  devMode,
  resetSignal,
  splitMode,
  activeView,
  onKinematics,
  onLapProgress,
  onCameras,
  onDebug,
  onPhysics,
  sparksRef,
  playerId = "player",
  showHitbox = false,
  hitboxAuto = false,
  controlMode = "manual",
}: Props) {
  const group = useRef<Group>(null);
  const chassisRef = useRef<Group>(null);
  const controls = useKartControls(devMode, undefined, controlMode === "manual");
  const curve = useMemo(() => trackCurve(), []);
  const speed = useRef(0);
  const lap = useRef(0);
  const checkpointIdx = useRef(0);
  const lastDebug = useRef(0);
  const lastSpark = useRef(0);
  const prevHeading = useRef(0);
  const autoSteerVisual = useRef(0);
  const { camera } = useThree();

  const camCockpit = useRef<ThreePerspectiveCamera>(null);
  const camChase = useRef<ThreePerspectiveCamera>(null);
  const camNose = useRef<ThreePerspectiveCamera>(null);
  const camTop = useRef<ThreePerspectiveCamera>(null);
  const camDriver = useRef<ThreePerspectiveCamera>(null);
  const camHelmet = useRef<ThreePerspectiveCamera>(null);

  useEffect(() => {
    if (!onCameras) return;
    if (
      camCockpit.current &&
      camChase.current &&
      camNose.current &&
      camTop.current &&
      camDriver.current &&
      camHelmet.current
    ) {
      onCameras([
        camCockpit.current,
        camChase.current,
        camNose.current,
        camTop.current,
        camDriver.current,
        camHelmet.current,
      ]);
    }
  }, [onCameras]);

  useEffect(() => {
    if (!group.current) return;
    const sp = spawnPose();
    group.current.position.set(sp.position[0], sp.position[1], sp.position[2]);
    group.current.rotation.set(0, sp.rotationY, 0);
    speed.current = 0;
    checkpointIdx.current = 0;
    lap.current = 0;
    ghostStore.resetCurrent();
    onLapProgress(0, 0);
  }, [resetSignal, onLapProgress]);

  useFrame((_, dtRaw) => {
    if (!group.current) return;
    raceStore.tickSlowMo();
    const ts = raceStore.get().timeScale;
    const dt = Math.min(dtRaw, 0.05) * ts;
    const c = controls.current;

    const stateAllowsDrive = state === "READY_TO_DRIVE" || state === "DRIVING";
    const canDrive =
      controlMode === "autopilot" || devMode || (ignition && battery > 0 && stateAllowsDrive);

    let autoSteer = 0;
    let autoBrake = 0;
    let autoForward = 0;
    if (controlMode === "autopilot") {
      const probeNow = nearestOnTrack(group.current.position);
      const lookAheadT = (probeNow.t + 0.026) % 1;
      _lookAheadTan.copy(curve.getTangentAt(lookAheadT)).normalize();
      const desiredHeading = Math.atan2(_lookAheadTan.x, _lookAheadTan.z);
      const headingError =
        MathUtils.euclideanModulo(
          desiredHeading - group.current.rotation.y + Math.PI,
          Math.PI * 2,
        ) - Math.PI;
      const curvature =
        1 -
        curve
          .getTangentAt((probeNow.t + 0.01) % 1)
          .dot(curve.getTangentAt((probeNow.t + 0.055) % 1));
      autoSteer = MathUtils.clamp(headingError * 1.65, -1, 1);
      autoBrake = curvature > 0.11 || Math.abs(headingError) > 0.55 ? 1 : 0;
      autoForward = autoBrake ? 0.35 : 1;
      autoSteerVisual.current = autoSteer;
    }

    let v = speed.current;
    if (canDrive) {
      const forwardInput = controlMode === "autopilot" ? autoForward : c.forward;
      const reverseInput = controlMode === "autopilot" ? 0 : c.reverse;
      const brakeInput = controlMode === "autopilot" ? autoBrake : c.brake;
      if (forwardInput) v += PHYS.acceleration * forwardInput * dt;
      if (reverseInput) v -= PHYS.reverseAccel * dt;
      if (brakeInput) {
        const sign = Math.sign(v);
        v -= sign * PHYS.brakeForce * brakeInput * dt;
        if (Math.sign(v) !== sign) v = 0;
      }
    } else {
      v *= Math.pow(0.05, dt);
    }
    const sign = Math.sign(v);
    v -= sign * PHYS.rollingFriction * dt;
    if (Math.sign(v) !== sign) v = 0;
    v = Math.max(-PHYS.maxReverse, Math.min(PHYS.maxSpeed, v));

    const steerInput = controlMode === "autopilot" ? autoSteer : c.left - c.right;
    if (Math.abs(v) > 0.3) {
      const dir = v > 0 ? 1 : -1;
      const steerScale = Math.min(1, Math.abs(v) / 25);
      const steerRate = steerInput * PHYS.steerSpeed * steerScale * dir;
      group.current.rotation.y += steerRate * dt;
    }
    speed.current = v;

    const forward = new Vector3(0, 0, 1).applyQuaternion(group.current.quaternion);
    const speedMs = (v / 3.6) * PHYS.visualScale;
    _curVel.copy(forward).multiplyScalar(speedMs);
    const next = group.current.position.clone().addScaledVector(forward, speedMs * dt);

    const probe = nearestOnTrack(next);
    const limit = TRACK_HALF_WIDTH + 0.6;
    // Off-track: dentro do gramado (entre TRACK_HALF_WIDTH e o limite externo)
    const grounded = probe.distance <= TRACK_HALF_WIDTH;
    perfStore.reportGrounded(playerId, grounded, Math.abs(v));
    if (!grounded) {
      // Cap de velocidade no gramado (~30 km/h) + drag forte
      const OFF_CAP = 30;
      if (Math.abs(speed.current) > OFF_CAP) {
        const decay = Math.pow(0.15, dt);
        speed.current =
          Math.sign(speed.current) * (OFF_CAP + (Math.abs(speed.current) - OFF_CAP) * decay);
        v = speed.current;
      }
      // Poeira marrom nas rodas
      if (sparksRef?.current && Math.abs(speed.current) > 5) {
        const now = performance.now();
        if (now - lastSpark.current > 60) {
          lastSpark.current = now;
          _back.copy(forward).multiplyScalar(-0.7);
          _right.set(forward.z, 0, -forward.x).normalize().multiplyScalar(0.55);
          _sparkOriginL.copy(group.current.position).add(_back).sub(_right);
          _sparkOriginR.copy(group.current.position).add(_back).add(_right);
          _sparkOriginL.y += 0.15;
          _sparkOriginR.y += 0.15;
          sparksRef.current.emit(_sparkOriginL, forward, 3, { color: "#9a6b3f", gravity: 5 });
          sparksRef.current.emit(_sparkOriginR, forward, 3, { color: "#9a6b3f", gravity: 5 });
        }
      }
    }
    if (probe.distance > limit) {
      const push = new Vector3(probe.point.x - next.x, 0, probe.point.z - next.z)
        .normalize()
        .multiplyScalar(probe.distance - limit);
      next.add(push);
      speed.current *= 0.5;
    }
    const surfaceY = probe.point.y + TRACK_SURFACE_OFFSET;
    next.y = group.current.position.y * 0.85 + surfaceY * 0.15;
    group.current.position.copy(next);

    // ─── Extended physics: RPM, torque, grip, G-forces, drift ───
    const speedKmh = Math.abs(v);
    const rpm = MathUtils.clamp(900 + (speedKmh / PHYS.maxSpeed) * 11000, 900, 12000);
    const throttle = c.forward ? 1 : 0;
    const torque = throttle * MathUtils.lerp(95, 60, speedKmh / PHYS.maxSpeed);
    const headingDelta = group.current.rotation.y - prevHeading.current;
    prevHeading.current = group.current.rotation.y;
    const yawRate = headingDelta / Math.max(dt, 1e-3); // rad/s
    const latAcc = yawRate * speedMs; // m/s²
    const longAcc = (_curVel.length() - _prevVel.length()) / Math.max(dt, 1e-3);
    _prevVel.copy(_curVel);
    const latG = latAcc / 9.81;
    const longG = longAcc / 9.81;
    const slip = Math.min(Math.abs(latG) / 1.8, 1.4);
    const grip = MathUtils.clamp(1 - slip * 0.7, 0, 1);
    const drift = Math.abs(steerInput) > 0.5 && speedKmh > 28 && Math.abs(latG) > 0.6;

    // Drift → sparks + occasional slow-mo
    if (drift && sparksRef?.current) {
      const now = performance.now();
      if (now - lastSpark.current > 40) {
        lastSpark.current = now;
        _back.copy(forward).multiplyScalar(-0.7);
        _right.set(forward.z, 0, -forward.x).normalize().multiplyScalar(0.55);
        _sparkOriginL.copy(group.current.position).add(_back).sub(_right);
        _sparkOriginR.copy(group.current.position).add(_back).add(_right);
        _sparkOriginL.y += 0.15;
        _sparkOriginR.y += 0.15;
        sparksRef.current.emit(_sparkOriginL, forward, 4);
        sparksRef.current.emit(_sparkOriginR, forward, 4);
      }
      if (Math.abs(latG) > 1.4 && Math.random() < dt * 0.6) {
        raceStore.triggerSlowMo(500, 0.4);
      }
    }

    // Checkpoints — strict sequential validation (anti-cheat)
    const myT = probe.t;
    const expectedT = CHECKPOINTS[checkpointIdx.current];
    const dist = Math.min(Math.abs(myT - expectedT), 1 - Math.abs(myT - expectedT));
    if (dist < 0.05) {
      const reachedIdx = checkpointIdx.current;
      const isLapClose = reachedIdx === CHECKPOINTS.length - 1;
      checkpointIdx.current = (checkpointIdx.current + 1) % CHECKPOINTS.length;
      if (checkpointIdx.current === 0) {
        lap.current += 1;
        // Player fechou uma volta → tenta gravar como melhor
        ghostStore.commitLap();
      }
      raceStore.markCheckpoint(reachedIdx, CHECKPOINTS.length, isLapClose);
    }
    onLapProgress(myT, lap.current);
    raceStore.updateProgress(playerId, myT, lap.current);
    raceStore.updatePose(
      playerId,
      group.current.position.x,
      group.current.position.z,
      group.current.rotation.y,
    );
    // grava trajetória do player para o Ghost Kart
    ghostStore.push(group.current.position.x, group.current.position.z, group.current.rotation.y);

    // ─── AI collision detection ───
    const racers = raceStore.get().racers;
    const COLLISION_R = 1.4;
    for (const id in racers) {
      if (id === playerId) continue;
      const other = racers[id];
      const dx = group.current.position.x - other.pose.x;
      const dz = group.current.position.z - other.pose.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0 && dist < COLLISION_R) {
        // Knockback: cut speed, push perpendicular outwards
        const overlap = COLLISION_R - dist;
        const nx = dx / dist;
        const nz = dz / dist;
        group.current.position.x += nx * overlap;
        group.current.position.z += nz * overlap;
        speed.current *= 0.55;
        // Time penalty proportional to closing speed
        const penalty = 250 + Math.min(750, Math.abs(speedKmh) * 12);
        raceStore.addPenalty(playerId, penalty);
        if (sparksRef?.current) {
          sparksRef.current.emit(group.current.position, forward, 8);
        }
        raceStore.triggerSlowMo(350, 0.5);
        break;
      }
    }

    // ─── Telemetry recording (~30Hz) ───
    telemetry.push({
      speedKmh,
      rpm,
      torque,
      grip,
      latG,
      longG,
      drift: drift ? 1 : 0,
      lap: lap.current,
      posX: group.current.position.x,
      posZ: group.current.position.z,
      rotY: group.current.rotation.y,
    });

    // Smooth follow camera — só na CHASE_INDEX. Em FREE o OrbitControls é dono
    // da câmera; competir com ele causava trepidação. Usamos damping exponencial
    // estável em qualquer FPS (1 - exp(-k*dt)).
    const replayActive = raceStore.get().finished;
    const useFollowCam = !splitMode && !replayActive && activeView === CHASE_INDEX;
    if (useFollowCam && (ignition || devMode)) {
      _offset.copy(CHASE_OFFSET).applyQuaternion(group.current.quaternion);
      _desired.copy(group.current.position).add(_offset);
      const followK = 1 - Math.exp(-6 * dtRaw); // ~6Hz cutoff, sem jitter em 120Hz
      camera.position.lerp(_desired, followK);
      _lookTarget
        .copy(CHASE_LOOK)
        .applyQuaternion(group.current.quaternion)
        .add(group.current.position);
      camera.lookAt(_lookTarget);
      const persp = camera as ThreePerspectiveCamera;
      if (persp.isPerspectiveCamera) {
        const ratio = Math.min(speedKmh / PHYS.maxSpeed, 1);
        const targetFov = FOV_BASE + ratio * (FOV_MAX - FOV_BASE);
        const fovK = 1 - Math.exp(-2.2 * dtRaw);
        persp.fov = MathUtils.lerp(persp.fov, targetFov, fovK);
        const targetRoll = steerInput * 0.04 * Math.min(1, speedKmh / 25);
        const rollK = 1 - Math.exp(-3.5 * dtRaw);
        persp.rotation.z = MathUtils.lerp(persp.rotation.z, targetRoll, rollK);
        persp.updateProjectionMatrix();
      }
    }

    const gear: Gear = v > 0.5 ? "D" : v < -0.5 ? "R" : ignition || devMode ? "N" : "P";
    onKinematics(speedKmh, gear);

    if (onPhysics) onPhysics({ rpm, torque, grip, latG, longG, drift });

    if (onDebug) {
      const now = performance.now();
      if (now - lastDebug.current > 100) {
        lastDebug.current = now;
        const persp = camera as ThreePerspectiveCamera;
        onDebug({
          speed: speedKmh,
          fov: persp.isPerspectiveCamera ? persp.fov : 0,
          rotationY: group.current.rotation.y,
          pos: { x: group.current.position.x, z: group.current.position.z },
          gear,
          grounded,
        });
      }
    }
  });

  return (
    <group ref={group}>
      <group ref={chassisRef}>
        <KartModel
          position={[0, 0, -0.6]}
          state={state}
          driving={Math.abs(speed.current) > 0.5}
          steer={
            controlMode === "autopilot"
              ? autoSteerVisual.current
              : controls.current.left - controls.current.right
          }
          speedKmh={speed.current}
          driverName="RAYSSA"
          kartNumber="77"
          tireLabel="BLENDER TIRES"
        />
      </group>
      {showHitbox && (
        <HitboxHelper color="#00e5ff" radius={1.4} autoBounds={hitboxAuto} targetRef={chassisRef} />
      )}
      <PerspectiveCamera
        ref={camCockpit}
        position={[0, 1.05, 0.45]}
        rotation={[0, Math.PI, 0]}
        fov={78}
        near={0.1}
        far={500}
      />
      <PerspectiveCamera
        ref={camChase}
        position={[0, 4, -7]}
        rotation={[-0.25, Math.PI, 0]}
        fov={55}
        near={0.1}
        far={500}
      />
      <PerspectiveCamera
        ref={camNose}
        position={[0, 0.55, 1.5]}
        rotation={[0, Math.PI, 0]}
        fov={70}
        near={0.1}
        far={500}
      />
      <PerspectiveCamera
        ref={camTop}
        position={[0, 22, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fov={45}
        near={0.1}
        far={500}
      />
      <PerspectiveCamera
        ref={camDriver}
        position={[0.18, 1.18, 0.15]}
        rotation={[-0.04, Math.PI, -0.015]}
        fov={72}
        near={0.05}
        far={500}
      />
      <PerspectiveCamera
        ref={camHelmet}
        position={[0, 1.22, 0.22]}
        rotation={[0, Math.PI, 0]}
        fov={88}
        near={0.04}
        far={500}
      />
    </group>
  );
}
