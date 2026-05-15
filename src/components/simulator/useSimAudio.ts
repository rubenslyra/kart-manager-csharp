import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_ASSETS } from "@/components/audio/audioAssets";
import { TRACK_CONFIG } from "./track";

/**
 * Synthesised 3D-ish audio for the simulator (no external assets).
 * - Engine: sawtooth oscillator → low-pass; pitch tracks speed (Doppler-ish).
 * - Crowd: filtered noise; volume tracks camera distance to the bleachers.
 * - Tyre screech: short noise burst on demand.
 *
 * Web Audio policies require a user gesture; call `start()` from a click.
 */
export function useSimAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const engineFilterRef = useRef<BiquadFilterNode | null>(null);
  const crowdGainRef = useRef<GainNode | null>(null);
  const crowdSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const raceLoopRef = useRef<HTMLAudioElement | null>(null);
  const sideCarsRef = useRef<HTMLAudioElement | null>(null);
  const crowdBaseRef = useRef<HTMLAudioElement | null>(null);
  const crowdNearRef = useRef<HTMLAudioElement | null>(null);
  const checkeredFlagRef = useRef<HTMLAudioElement | null>(null);
  const speedRef = useRef(0);
  const camDistRef = useRef(60);
  const nearbyRacerRef = useRef(0);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  const stop = useCallback(() => {
    enabledRef.current = false;
    setEnabled(false);
    try {
      engineOscRef.current?.stop();
      crowdSourceRef.current?.stop();
    } catch {
      /* noop */
    }
    [raceLoopRef.current, sideCarsRef.current, crowdBaseRef.current, crowdNearRef.current, checkeredFlagRef.current].forEach(
      (audio) => {
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
      },
    );
    ctxRef.current?.close();
    ctxRef.current = null;
    engineOscRef.current = null;
    crowdSourceRef.current = null;
    raceLoopRef.current = null;
    sideCarsRef.current = null;
    crowdBaseRef.current = null;
    crowdNearRef.current = null;
    checkeredFlagRef.current = null;
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
    master.gain.value = 0.45;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const makeAudio = (src: string, loop: boolean, volume = 0) => {
      const audio = new Audio(src);
      audio.loop = loop;
      audio.preload = "auto";
      audio.volume = volume;
      return audio;
    };

    const raceLoop = makeAudio(AUDIO_ASSETS.goKartPassing, true);
    const sideCars = makeAudio(AUDIO_ASSETS.goKartRacingOutdoors, true);
    const crowdBase = makeAudio(AUDIO_ASSETS.fansInTheStadiumLow, true);
    const crowdNear = makeAudio(AUDIO_ASSETS.crowdNearTurn, true);
    const checkered = makeAudio(AUDIO_ASSETS.crowdCheckeredFlag, false, 0.78);
    raceLoopRef.current = raceLoop;
    sideCarsRef.current = sideCars;
    crowdBaseRef.current = crowdBase;
    crowdNearRef.current = crowdNear;
    checkeredFlagRef.current = checkered;

    void raceLoop.play().catch(() => undefined);
    void sideCars.play().catch(() => undefined);
    void crowdBase.play().catch(() => undefined);
    void crowdNear.play().catch(() => undefined);

    // ---------- Engine ----------
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 70;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 6;
    const gain = ctx.createGain();
    gain.gain.value = 0.0;
    osc.connect(filter).connect(gain).connect(master);
    osc.start();
    engineOscRef.current = osc;
    engineFilterRef.current = filter;
    engineGainRef.current = gain;

    // ---------- Crowd (looping noise buffer through bandpass) ----------
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 0.6;
    // LFO modulates band frequency for an "ooooh"/"yeahh" wash
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.4;
    lfoGain.gain.value = 350;
    lfo.connect(lfoGain).connect(bp.frequency);
    lfo.start();
    const cgain = ctx.createGain();
    cgain.gain.value = 0;
    src.connect(bp).connect(cgain).connect(master);
    src.start();
    crowdSourceRef.current = src;
    crowdGainRef.current = cgain;

    enabledRef.current = true;
    setEnabled(true);
  }, [stop]);

  // Per-frame style update (called from R3F via setSpeed/setCamDistance refs).
  // We poll with rAF here so the audio thread updates even when no R3F frame is
  // scheduled (e.g. when the kart is idle).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const ctx = ctxRef.current;
      if (!ctx || !enabledRef.current) return;
      const v = speedRef.current; // km/h, signed magnitude
      const speed = Math.abs(v);
      // Engine pitch: 70 Hz idle → ~360 Hz at 70 km/h
      const targetFreq = 70 + speed * 4.2;
      const targetGain = 0.02 + Math.min(0.16, speed / 340);
      const targetCutoff = 500 + speed * 25;
      const now = ctx.currentTime;
      engineOscRef.current?.frequency.setTargetAtTime(targetFreq, now, 0.08);
      engineGainRef.current?.gain.setTargetAtTime(targetGain, now, 0.1);
      engineFilterRef.current?.frequency.setTargetAtTime(targetCutoff, now, 0.15);

      // Crowd: louder when camera is near bleachers (positional approx)
      const d = camDistRef.current;
      const crowdVol = Math.max(0, Math.min(0.45, 1 - d / 120)) * 0.6;
      crowdGainRef.current?.gain.setTargetAtTime(crowdVol * 0.25, now, 0.25);

      if (raceLoopRef.current) {
        raceLoopRef.current.volume = Math.min(0.5, 0.04 + speed / 180);
        raceLoopRef.current.playbackRate = Math.max(0.82, Math.min(1.24, 0.9 + speed / 220));
      }
      if (sideCarsRef.current) {
        const sideIntensity = nearbyRacerRef.current * Math.min(1, speed / 20);
        sideCarsRef.current.volume = Math.max(0, Math.min(0.48, sideIntensity * 0.48));
        sideCarsRef.current.playbackRate = Math.max(0.9, Math.min(1.18, 0.96 + speed / 360));
      }
      if (crowdBaseRef.current) {
        crowdBaseRef.current.volume = Math.max(0, Math.min(0.18, 1 - d / 180));
      }
      if (crowdNearRef.current) {
        const nearTurnBoost = Math.max(0, Math.min(0.55, 1 - d / 48));
        crowdNearRef.current.volume = nearTurnBoost;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setSpeed = useCallback((kmh: number) => {
    speedRef.current = kmh;
  }, []);
  const setCamPosition = useCallback((x: number, y: number, z: number) => {
    const a = TRACK_CONFIG.assets.bleachers;
    const dx = x - a.x;
    const dy = y - a.y;
    const dz = z - a.z;
    camDistRef.current = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }, []);
  const setNearbyRacerIntensity = useCallback((intensity: number) => {
    nearbyRacerRef.current = Math.max(0, Math.min(1, intensity));
  }, []);

  // Short tyre screech (call when drifting)
  const screech = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || !enabledRef.current) return;
    const dur = 0.35;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource();
    s.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.value = 0.18;
    s.connect(f).connect(g).connect(master);
    s.start();
    s.stop(ctx.currentTime + dur);
  }, []);

  /** Tom curto sintetizado (bip de checkpoint, jingle de volta etc). */
  const tone = useCallback(
    (freq: number, dur = 0.18, type: OscillatorType = "triangle", vol = 0.18) => {
      const ctx = ctxRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master || !enabledRef.current) return;
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    },
    [],
  );

  const checkpointBeep = useCallback(() => tone(880, 0.12, "square", 0.15), [tone]);
  const lapJingle = useCallback(() => {
    tone(660, 0.14);
    setTimeout(() => tone(880, 0.14), 110);
    setTimeout(() => tone(1175, 0.22), 230);
  }, [tone]);
  const fanfare = useCallback(() => {
    const seq = [523, 659, 784, 1046, 1318];
    seq.forEach((f, i) => setTimeout(() => tone(f, 0.32, "triangle", 0.22), i * 130));
    setTimeout(() => tone(1568, 0.6, "sawtooth", 0.18), seq.length * 130);
  }, [tone]);

  const checkeredFlag = useCallback(() => {
    if (!enabledRef.current) return;
    const audio = checkeredFlagRef.current;
    if (!audio) {
      fanfare();
      return;
    }
    audio.currentTime = 0;
    void audio.play().catch(() => fanfare());
  }, [fanfare]);

  useEffect(() => () => stop(), [stop]);

  return {
    start,
    stop,
    enabled,
    setSpeed,
    setCamPosition,
    setNearbyRacerIntensity,
    screech,
    tone,
    checkpointBeep,
    lapJingle,
    fanfare,
    checkeredFlag,
  };
}
