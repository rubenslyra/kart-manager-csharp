import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_ASSETS } from "@/components/audio/audioAssets";

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
  const testRoomEngineRef = useRef<HTMLAudioElement | null>(null);
  const testRoomSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const testRoomGainRef = useRef<GainNode | null>(null);
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
    if (testRoomEngineRef.current) {
      testRoomEngineRef.current.pause();
      testRoomEngineRef.current.currentTime = 0;
    }
    ctxRef.current?.close();
    ctxRef.current = null;
    masterGainRef.current = null;
    rotorOscRef.current = null;
    pulseOscRef.current = null;
    rotorGainRef.current = null;
    pulseGainRef.current = null;
    filterRef.current = null;
    testRoomEngineRef.current = null;
    testRoomSourceRef.current = null;
    testRoomGainRef.current = null;
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

    const testRoomEngine = new Audio(AUDIO_ASSETS.wankelTestRoomEngine);
    testRoomEngine.loop = true;
    testRoomEngine.preload = "auto";
    testRoomEngine.volume = 1;
    testRoomEngineRef.current = testRoomEngine;
    const testRoomSource = ctx.createMediaElementSource(testRoomEngine);
    const testRoomGain = ctx.createGain();
    testRoomGain.gain.value = 0;
    testRoomSource.connect(testRoomGain).connect(master);
    testRoomSourceRef.current = testRoomSource;
    testRoomGainRef.current = testRoomGain;
    void testRoomEngine.play().catch(() => undefined);

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

      if (testRoomEngineRef.current) {
        testRoomGainRef.current?.gain.setTargetAtTime(on ? 0.24 + t * 0.76 : 0, now, 0.08);
        testRoomEngineRef.current.playbackRate = on ? 0.86 + t * 0.32 : 0.86;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { enabled, start, stop };
}
