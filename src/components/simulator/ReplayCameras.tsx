import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { useRaceState, rankedRacers, raceStore } from "./raceStore";
import { interpolate, replayRecordStore } from "./replayRecordStore";

/**
 * ReplayCameras — assume a câmera quando race.finished OU quando o usuário
 * pediu para reassistir o replay (state.playbackActive). Cicla 3 fases
 * (TV → Orbital → Helicóptero) ao longo de setup.replayDurationMs e
 * publica a fase atual em raceStore.replayPhase para sincronizar áudio,
 * confetes e overlays.
 */
const _desired = new Vector3();
const _look = new Vector3();
const _orbit = new Vector3();

function getWinnerPose(state: ReturnType<typeof raceStore.get>) {
  // Durante playback usamos a pose interpolada do último record;
  // caso contrário, a pose viva do líder atual.
  if (state.playbackActive) {
    const rec = replayRecordStore.getRecord();
    if (!rec) return null;
    const winner = rec.racers.find((r) => r.id === rec.winnerId) ?? rec.racers[0];
    if (!winner) return null;
    const elapsed = (performance.now() - state.playbackStartedAt) * state.playbackSpeed;
    const tClamped = Math.min(elapsed, rec.durationMs);
    const p = interpolate(winner.samples, tClamped);
    return p ? { x: p.x, z: p.z } : null;
  }
  const ranked = rankedRacers(state);
  const w = ranked[0];
  return w ? { x: w.pose.x, z: w.pose.z } : null;
}

export function ReplayCameras() {
  const { camera } = useThree();
  const state = useRaceState();
  const startedAt = useRef(0);
  const savedFov = useRef<number | null>(null);
  const lastNonce = useRef(0);
  const active = state.finished || state.playbackActive;

  useEffect(() => {
    if (active) {
      startedAt.current = performance.now();
      const persp = camera as { isPerspectiveCamera?: boolean; fov?: number };
      if (persp.isPerspectiveCamera && savedFov.current === null) {
        savedFov.current = persp.fov ?? 50;
      }
      raceStore.setReplayPhase(0);
    } else {
      const persp = camera as { isPerspectiveCamera?: boolean; fov?: number; updateProjectionMatrix?: () => void };
      if (persp.isPerspectiveCamera && savedFov.current !== null) {
        persp.fov = savedFov.current;
        persp.updateProjectionMatrix?.();
        savedFov.current = null;
      }
    }
  }, [active, camera]);

  // Reinicia o ciclo quando o usuário aciona "Assistir replay novamente".
  useEffect(() => {
    if (state.replayRunNonce !== lastNonce.current) {
      lastNonce.current = state.replayRunNonce;
      startedAt.current = performance.now();
      raceStore.setReplayPhase(0);
    }
  }, [state.replayRunNonce]);

  useFrame((_, dt) => {
    if (!active) return;
    const target = getWinnerPose(state);
    if (!target) return;

    const totalMs = Math.max(3000, state.setup.replayDurationMs);
    const phaseMs = totalMs / 3;
    const speed = state.playbackActive ? state.playbackSpeed : 1;
    const elapsed = (performance.now() - startedAt.current) * speed;
    const phaseIdx = Math.min(2, Math.floor(elapsed / phaseMs));
    const phaseT = (elapsed - phaseIdx * phaseMs) / phaseMs;

    if (state.replayPhase !== phaseIdx) raceStore.setReplayPhase(phaseIdx as 0 | 1 | 2);

    // Auto-encerra playback ao terminar
    if (state.playbackActive && elapsed >= totalMs) {
      raceStore.stopReplayPlayback();
    }

    if (phaseIdx === 0) {
      _desired.set(target.x + 14, 6, target.z + 14);
      _look.set(target.x, 1.2, target.z);
    } else if (phaseIdx === 1) {
      const angle = phaseT * Math.PI * 2;
      _orbit.set(Math.cos(angle) * 8, 0, Math.sin(angle) * 8);
      _desired.set(target.x + _orbit.x, 3.2, target.z + _orbit.z);
      _look.set(target.x, 1.1, target.z);
    } else {
      _desired.set(target.x + 4, 22 - phaseT * 8, target.z + 4);
      _look.set(target.x, 0.6, target.z);
    }

    const k = Math.min(1, dt * 2.2);
    camera.position.lerp(_desired, k);
    camera.lookAt(_look);

    const persp = camera as { isPerspectiveCamera?: boolean; fov?: number; updateProjectionMatrix?: () => void };
    if (persp.isPerspectiveCamera) {
      const targetFov = phaseIdx === 1 ? 45 : 38;
      persp.fov = MathUtils.lerp(persp.fov ?? 50, targetFov, Math.min(1, dt * 1.5));
      persp.updateProjectionMatrix?.();
    }
  });

  return null;
}
