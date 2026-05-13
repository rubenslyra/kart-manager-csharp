import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import type { FocusTarget } from "./parts/shared";

// Targets in blueprint scale (meters). Look points align with MODULE_ANCHORS.
const TARGETS: Record<Exclude<FocusTarget, null>, { pos: THREE.Vector3; look: THREE.Vector3 }> = {
  battery: { pos: new THREE.Vector3(0.9, 0.85, -1.4), look: new THREE.Vector3(0.22, 0.40, -0.20) },
  brakes: { pos: new THREE.Vector3(1.4, 0.55, -1.2), look: new THREE.Vector3(0.41, 0.30, -0.50) },
  steering: { pos: new THREE.Vector3(0, 0.95, 1.6), look: new THREE.Vector3(0, 0.58, 0.30) },
  ignition: { pos: new THREE.Vector3(1.0, 0.85, 1.1), look: new THREE.Vector3(0.18, 0.55, 0.20) },
  gearbox: { pos: new THREE.Vector3(0, 0.75, -1.4), look: new THREE.Vector3(0, 0.32, -0.40) },
};

const HOME = { pos: new THREE.Vector3(2.6, 1.6, 2.8), look: new THREE.Vector3(0, 0.45, 0) };

export function CameraController({ focus }: { focus: FocusTarget }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const desiredPos = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());

  useEffect(() => {
    const t = focus ? TARGETS[focus] : HOME;
    desiredPos.current.copy(t.pos);
    desiredLook.current.copy(t.look);
  }, [focus]);

  useEffect(() => {
    camera.position.copy(HOME.pos);
    target.current.copy(HOME.look);
    desiredPos.current.copy(HOME.pos);
    desiredLook.current.copy(HOME.look);
    camera.lookAt(HOME.look);
  }, [camera]);

  useFrame((s, dt) => {
    const k = 1 - Math.exp(-dt * 4);
    // Idle cinematic dolly when not focused
    const t = s.clock.elapsedTime;
    const idle = focus === null
      ? new THREE.Vector3(Math.sin(t * 0.18) * 0.35, Math.sin(t * 0.13) * 0.12, Math.cos(t * 0.18) * 0.35)
      : new THREE.Vector3(0, 0, 0);
    const dp = desiredPos.current.clone().add(idle);
    camera.position.lerp(dp, k);
    target.current.lerp(desiredLook.current, k);
    camera.lookAt(target.current);
  });

  return null;
}
