export interface EngineTestState {
  running: boolean;
  throttle: number;
  rpm: number;
  health: number;
  temperature: number;
  load: number;
  audioEnabled: boolean;
  volume: number;
}

export function deriveEngineTestState({
  running,
  throttle,
  audioEnabled,
  volume = 0.45,
}: {
  running: boolean;
  throttle: number;
  audioEnabled: boolean;
  volume?: number;
}): EngineTestState {
  const clampedThrottle = Math.max(0, Math.min(1, throttle));
  const clampedVolume = Math.max(0, Math.min(1, volume));
  const rpm = running ? 900 + clampedThrottle * 7600 : 0;
  const load = running ? 0.22 + clampedThrottle * 0.72 : 0;
  const temperature = running ? 38 + clampedThrottle * 62 + load * 18 : 30;
  const health = Math.max(0, 100 - Math.max(0, temperature - 92) * 1.25 - load * 6);

  return {
    running,
    throttle: clampedThrottle,
    rpm,
    health,
    temperature,
    load,
    audioEnabled,
    volume: clampedVolume,
  };
}
