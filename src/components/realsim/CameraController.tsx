import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import type { FocusTarget } from "./parts/shared";

export type SceneFocusTarget = "acousticRoom" | null;
export type CameraFocusTarget = FocusTarget | SceneFocusTarget;

// Targets in blueprint scale (meters). Look points align with MODULE_ANCHORS.
const TARGETS: Record<
  Exclude<CameraFocusTarget, null>,
  { pos: THREE.Vector3; look: THREE.Vector3 }
> = {
  battery: { pos: new THREE.Vector3(0.9, 0.85, -1.4), look: new THREE.Vector3(0.22, 0.4, -0.2) },
  brakes: { pos: new THREE.Vector3(1.4, 0.55, -1.2), look: new THREE.Vector3(0.41, 0.3, -0.5) },
  steering: { pos: new THREE.Vector3(0, 0.95, 1.6), look: new THREE.Vector3(0, 0.58, 0.3) },
  ignition: { pos: new THREE.Vector3(1.0, 0.85, 1.1), look: new THREE.Vector3(0.18, 0.55, 0.2) },
  gearbox: { pos: new THREE.Vector3(0, 0.75, -1.4), look: new THREE.Vector3(0, 0.32, -0.4) },
  acousticRoom: { pos: new THREE.Vector3(5.2, 1.85, 6.0), look: new THREE.Vector3(7.2, 1.05, 3.9) },
};

const HOME = { pos: new THREE.Vector3(2.6, 1.6, 2.8), look: new THREE.Vector3(0, 0.45, 0) };
const HOME_FULLSCREEN = {
  pos: new THREE.Vector3(5.3, 2.2, 5.85),
  look: new THREE.Vector3(1.65, 0.68, 0.75),
};
const FULLSCREEN_TARGETS: Partial<
  Record<Exclude<CameraFocusTarget, null>, { pos: THREE.Vector3; look: THREE.Vector3 }>
> = {
  acousticRoom: {
    pos: new THREE.Vector3(6.95, 2.05, 6.35),
    look: new THREE.Vector3(7.2, 1.0, 3.9),
  },
};

export function CameraController({
  focus,
  fullscreen = false,
}: {
  focus: CameraFocusTarget;
  fullscreen?: boolean;
}) {
  const { camera, gl } = useThree();
  const target = useRef(new THREE.Vector3());
  const desiredPos = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());
  const baseDesiredPos = useRef(new THREE.Vector3());
  const zoomOffset = useRef(0);

  useEffect(() => {
    const t = focus
      ? fullscreen
        ? (FULLSCREEN_TARGETS[focus] ?? TARGETS[focus])
        : TARGETS[focus]
      : fullscreen
        ? HOME_FULLSCREEN
        : HOME;
    baseDesiredPos.current.copy(t.pos);
    desiredPos.current.copy(t.pos);
    desiredLook.current.copy(t.look);
  }, [focus, fullscreen]);

  useEffect(() => {
    const home = fullscreen ? HOME_FULLSCREEN : HOME;
    camera.position.copy(home.pos);
    target.current.copy(home.look);
    baseDesiredPos.current.copy(home.pos);
    desiredPos.current.copy(home.pos);
    desiredLook.current.copy(home.look);
    zoomOffset.current = 0;
    camera.lookAt(home.look);
  }, [camera, fullscreen]);

  useEffect(() => {
    const canvas = gl.domElement;
    const onWheel = (event: WheelEvent) => {
      if (!fullscreen) return;
      event.preventDefault();
      const next = zoomOffset.current + event.deltaY * 0.004;
      zoomOffset.current = THREE.MathUtils.clamp(next, -1.25, 4.75);
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [fullscreen, gl]);

  useFrame((s, dt) => {
    const k = 1 - Math.exp(-dt * 4);
    // Idle cinematic dolly when not focused
    const t = s.clock.elapsedTime;
    const idle =
      focus === null
        ? new THREE.Vector3(
            Math.sin(t * 0.18) * 0.35,
            Math.sin(t * 0.13) * 0.12,
            Math.cos(t * 0.18) * 0.35,
          )
        : new THREE.Vector3(0, 0, 0);
    const zoomDir = baseDesiredPos.current.clone().sub(desiredLook.current).normalize();
    desiredPos.current.copy(baseDesiredPos.current).add(zoomDir.multiplyScalar(zoomOffset.current));
    const dp = desiredPos.current.clone().add(idle);
    camera.position.lerp(dp, k);
    target.current.lerp(desiredLook.current, k);
    camera.lookAt(target.current);
  });

  return null;
}
