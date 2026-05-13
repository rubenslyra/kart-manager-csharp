import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { KartModel } from "./KartModel";
import { useRaceState } from "./raceStore";
import { interpolate, replayRecordStore, type RecordedRacer } from "./replayRecordStore";

/**
 * Renderiza os karts a partir do RaceRecord salvo, durante playback.
 * Usado para "Assistir replay novamente" após reiniciar a corrida.
 */
export function RecordedRace() {
  const state = useRaceState();
  if (!state.playbackActive) return null;
  const rec = replayRecordStore.getRecord();
  if (!rec) return null;
  return (
    <group name="recorded-race">
      {rec.racers.map((r) => (
        <RecordedKart
          key={r.id}
          racer={r}
          startedAt={state.playbackStartedAt}
          duration={rec.durationMs}
          speed={state.playbackSpeed}
        />
      ))}
    </group>
  );
}

function RecordedKart({
  racer,
  startedAt,
  duration,
  speed,
}: {
  racer: RecordedRacer;
  startedAt: number;
  duration: number;
  speed: number;
}) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const elapsed = Math.min((performance.now() - startedAt) * speed, duration);
    const p = interpolate(racer.samples, elapsed);
    if (!p) return;
    group.current.position.set(p.x, 0.4, p.z);
    group.current.rotation.y = p.rotY;
  });
  return (
    <group ref={group}>
      <KartModel position={[0, 0, -0.6]} state="DRIVING" driving steer={0} speedKmh={20} liveryColor={racer.color} />
    </group>
  );
}
