import { useCallback, useEffect, useRef, useState } from "react";

interface UseWankelTestAudioArgs {
  running: boolean;
  throttle: number;
  health: number;
}

export function useWankelTestAudio({ running, throttle, health }: UseWankelTestAudioArgs) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const rotorOscRef = useRef<OscillatorNode | null>(null);
  const pulseOscRef = useRef<OscillatorNode | null>(null);
  const rotorGainRef = useRef<GainNode | null>(null);
  const pulseGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const runningRef = useRef(running);
  const throttleRef = useRef(throttle);
  const healthRef = useRef(health);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    runningRef.current = running;
    throttleRef.current = throttle;
    healthRef.current = health;
  }, [running, throttle, health]);

  const stop = useCallback(() => {
    enabledRef.current = false;
    setEnabled(false);
    try {
      rotorOscRef.current?.stop();
      pulseOscRef.current?.stop();
    } catch {
      /* noop */
    }
    ctxRef.current?.close();
    ctxRef.current = null;
    masterGainRef.current = null;
    rotorOscRef.current = null;
    pulseOscRef.current = null;
    rotorGainRef.current = null;
    pulseGainRef.current = null;
    filterRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (enabledRef.current) {
      stop();
      return;
    }

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.42;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 7;
    filterRef.current = filter;

    const rotor = ctx.createOscillator();
    rotor.type = "sawtooth";
    rotor.frequency.value = 95;
    const rotorGain = ctx.createGain();
    rotorGain.gain.value = 0;
    rotor.connect(filter).connect(rotorGain).connect(master);
    rotor.start();

    const pulse = ctx.createOscillator();
    pulse.type = "square";
    pulse.frequency.value = 18;
    const pulseGain = ctx.createGain();
    pulseGain.gain.value = 0;
    pulse.connect(pulseGain).connect(master);
    pulse.start();

    rotorOscRef.current = rotor;
    pulseOscRef.current = pulse;
    rotorGainRef.current = rotorGain;
    pulseGainRef.current = pulseGain;

    enabledRef.current = true;
    setEnabled(true);
  }, [stop]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const ctx = ctxRef.current;
      if (!ctx || !enabledRef.current) return;

      const now = ctx.currentTime;
      const t = throttleRef.current;
      const on = runningRef.current;
      const healthFactor = Math.max(0.25, Math.min(1, healthRef.current / 100));
      const freq = on ? 90 + t * 430 : 55;
      const pulseFreq = on ? 18 + t * 54 : 8;
      const gain = on ? 0.055 + t * 0.28 : 0.0;
      const pulseGain = on ? (0.012 + t * 0.06) * healthFactor : 0.0;
      const cutoff = 550 + t * 2600;

      rotorOscRef.current?.frequency.setTargetAtTime(freq, now, 0.055);
      pulseOscRef.current?.frequency.setTargetAtTime(pulseFreq, now, 0.06);
      rotorGainRef.current?.gain.setTargetAtTime(gain, now, 0.08);
      pulseGainRef.current?.gain.setTargetAtTime(pulseGain, now, 0.08);
      filterRef.current?.frequency.setTargetAtTime(cutoff, now, 0.12);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { enabled, start, stop };
}
