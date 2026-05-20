import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { PerspectiveCamera as ThreePerspectiveCamera } from "three";
import { TrackModel } from "./TrackModel";
import { PitBoxes } from "./PitBoxes";
import { Grandstand } from "./Grandstand";
import { KartRig } from "./KartRig";
import { TelemetryPanel } from "./TelemetryPanel";
import { SimulatorControls } from "./SimulatorControls";
import { HUD3D } from "./HUD3D";
import { useKartSimulator } from "./useKartSimulator";
import { useSimAudio } from "./useSimAudio";
import { DebugPanel } from "./DebugPanel";
import type { DebugStats } from "./KartRig";
import { Sparks, type SparksHandle } from "./Sparks";
import { AIKart } from "./AIKart";
import { Leaderboard, Podium } from "./Leaderboard";
import { ExtendedHud, type ExtendedPhysics } from "./ExtendedHud";
import { raceStore, rankedRacers, useRaceState } from "./raceStore";
import { RaceSetup, generateAIList } from "./RaceSetup";
import { TelemetryCharts } from "./TelemetryCharts";
import { telemetry } from "./telemetry";
import { GhostKart } from "./GhostKart";
import { useGhostBest } from "./ghostStore";
import { Confetti } from "./Confetti";
import { ReplayCameras } from "./ReplayCameras";
import { RecordedRace } from "./RecordedRace";
import { replayRecordStore } from "./replayRecordStore";
import { FpsMeter } from "./FpsMeter";
import { perfStore, usePerf } from "./perfStore";
import { HelmetHud } from "./HelmetHud";
import { EMPTY_GESTURE_INPUT } from "./gestureInput";
import { EngineeringPitWall } from "./EngineeringPitWall";
import { QualifyingPanel } from "./QualifyingPanel";
import { QualifyingSessionPanel } from "./QualifyingSessionPanel";
import { GridLoadingOverlay } from "./GridLoadingOverlay";
import { StartLightsOverlay } from "./StartLightsOverlay";
import { PitServiceOverlay } from "./PitServiceOverlay";
import {
  engineeringProgressStore,
  nextUnlockLabel,
  roleLabel,
  useEngineeringProgress,
  getTeamRole,
  type ControlMode,
} from "./engineeringProgressStore";
import { gridPose } from "./track";

interface Props {
  fullscreen?: boolean;
}

const VIEW_LABELS = ["COCKPIT", "CHASE", "NOSE", "TOP-DOWN", "DRIVER", "HELMET", "FREE"] as const;
const SPLIT_CAMERA_COUNT = 4;
const DRIVER_VIEW = 4;
const HELMET_VIEW = 5;
const FREE_VIEW = 6;
const REQUIRED_MODULES = ["CORE", "GEARBOX", "BRAKES", "IGNITION"] as const;

function makeQualifyingEntrants(
  aiOpponents: ReturnType<typeof generateAIList>,
  aggression: number,
) {
  return [
    {
      id: "player",
      name: "Rayssa",
      color: "#22d3ee",
      isPlayer: true,
      pace: 1.0 + aggression * 0.02,
    },
    ...aiOpponents.map((a) => ({
      id: a.id,
      name: a.name,
      color: a.color,
      isPlayer: false,
      pace: a.baseSpeed / 19,
    })),
  ];
}

function makeQualifyingLapMs(
  entrant: ReturnType<typeof makeQualifyingEntrants>[number],
  roundIndex: number,
  entrantIndex: number,
) {
  const playerPush = entrant.isPlayer && roundIndex === 0 ? 520 : 0;
  const base = 70400 - entrant.pace * 4300 + entrantIndex * 145 - playerPush;
  const rhythm = Math.sin((entrantIndex + 1) * (roundIndex + 2.2)) * 480;
  const tyreRamp = roundIndex * 165 - Math.min(roundIndex, 1) * 110;
  return Math.max(61500, Math.round(base + rhythm + tyreRamp));
}

/**
 * Splitter — renders the scene into 1 or 4 viewports using gl.setScissor + setViewport.
 * useFrame priority>0 disables the default render loop, so we own the draw call.
 */
function Splitter({
  cameras,
  splitMode,
  activeView,
  fallbackCam,
}: {
  cameras: ThreePerspectiveCamera[] | null;
  splitMode: boolean;
  activeView: number;
  fallbackCam: ThreePerspectiveCamera | null;
}) {
  const { gl, scene, size } = useThree();
  useFrame(() => {
    gl.autoClear = false;
    gl.clear();
    const w = size.width;
    const h = size.height;

    if (!splitMode) {
      const cam =
        activeView === FREE_VIEW || !cameras ? fallbackCam : (cameras[activeView] ?? fallbackCam);
      if (!cam) return;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      gl.setScissorTest(false);
      gl.setViewport(0, 0, w, h);
      gl.render(scene, cam);
      return;
    }

    if (!cameras || cameras.length < SPLIT_CAMERA_COUNT) return;
    const halfW = w / 2;
    const halfH = h / 2;
    const quads = [
      { x: 0, y: halfH, w: halfW, h: halfH }, // top-left
      { x: halfW, y: halfH, w: halfW, h: halfH }, // top-right
      { x: 0, y: 0, w: halfW, h: halfH }, // bottom-left
      { x: halfW, y: 0, w: halfW, h: halfH }, // bottom-right
    ];
    cameras.slice(0, SPLIT_CAMERA_COUNT).forEach((cam, i) => {
      const q = quads[i];
      cam.aspect = q.w / q.h;
      cam.updateProjectionMatrix();
      gl.setViewport(q.x, q.y, q.w, q.h);
      gl.setScissor(q.x, q.y, q.w, q.h);
      gl.setScissorTest(true);
      gl.render(scene, cam);
    });
    gl.setScissorTest(false);
  }, 1);
  return null;
}

/** Pushes the active camera's world position into the audio engine each frame. */
function AudioSync({ onCam }: { onCam: (x: number, y: number, z: number) => void }) {
  const { camera } = useThree();
  useFrame(() => {
    onCam(camera.position.x, camera.position.y, camera.position.z);
  });
  return null;
}

/** Sincroniza o toggle de sombras do perfStore com gl.shadowMap.enabled. */
function ShadowsSync({ enabled }: { enabled: boolean }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    gl.shadowMap.enabled = enabled;
    scene.traverse((obj) => {
      const mat = (obj as { material?: { needsUpdate?: boolean } | { needsUpdate?: boolean }[] })
        .material;
      if (Array.isArray(mat)) mat.forEach((m) => (m.needsUpdate = true));
      else if (mat) mat.needsUpdate = true;
    });
  }, [enabled, gl, scene]);
  return null;
}

export function SimulatorScene({ fullscreen = false }: Props) {
  const sim = useKartSimulator();
  const { t } = sim;
  const audio = useSimAudio();
  const [devMode, setDevMode] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [poseResetSignal, setPoseResetSignal] = useState(0);
  const [lap, setLap] = useState({ progress: 0, count: 0 });
  const [splitMode, setSplitMode] = useState(false);
  const [debugStats, setDebugStats] = useState<DebugStats | null>(null);
  const [physics, setPhysics] = useState<ExtendedPhysics | null>(null);
  const [activeView, setActiveView] = useState(FREE_VIEW);
  const [radioHelpUntil, setRadioHelpUntil] = useState(0);
  const [qualifyingTick, setQualifyingTick] = useState(0);
  const [gridLoadingProgress, setGridLoadingProgress] = useState(0);
  const camerasRef = useRef<ThreePerspectiveCamera[] | null>(null);
  const fallbackCamRef = useRef<ThreePerspectiveCamera | null>(null);
  const sparksRef = useRef<SparksHandle | null>(null);
  const [camsReady, setCamsReady] = useState(false);
  const [showHitbox, setShowHitbox] = useState(false);
  const [hitboxAuto, setHitboxAuto] = useState(false);
  const perf = usePerf();
  const race = useRaceState();
  const engineering = useEngineeringProgress();
  const canUseDriverControl = engineering.rayssaWins >= 10;
  const engineeringMode = engineering.controlMode === "ENGINEERING_OBSERVER";
  const currentRole = getTeamRole(engineering.rayssaWins);

  // Register player and reset race + telemetry on mount/reset
  useEffect(() => {
    raceStore.reset();
    raceStore.registerRacer({ id: "player", name: "Rayssa", color: "#22d3ee", isPlayer: true });
    telemetry.reset();
  }, [resetSignal]);

  useEffect(() => {
    if (!engineeringMode) return;
    REQUIRED_MODULES.forEach((m) => {
      if (!t.modules.includes(m)) sim.loadModule(m);
    });
    if (t.modules.includes("IGNITION") && !t.ignition) sim.ignite();
  }, [engineeringMode, sim, t.ignition, t.modules]);

  useEffect(() => {
    if (!race.finished) return;
    const ranked = rankedRacers(race);
    const winner = ranked[0];
    if (winner?.id === "player") engineeringProgressStore.recordRayssaWin(race.startedAt);
    else engineeringProgressStore.markRaceSeen(race.startedAt);
  }, [race]);

  const aiOpponents = useMemo(() => generateAIList(race.setup), [race.setup]);

  useEffect(() => {
    if (race.phase !== "QUALIFYING") return;
    const id = window.setInterval(() => setQualifyingTick((n) => n + 1), 180);
    return () => window.clearInterval(id);
  }, [race.phase]);

  useEffect(() => {
    audio.setCrowdMuted(race.phase === "QUALIFYING");
  }, [audio, race.phase]);

  useEffect(() => {
    if (race.phase !== "QUALIFYING") return;
    const session = race.qualifyingSession;
    if (!session || session.complete) return;
    const active = session.entrants[session.entrantIndex];
    if (!active) return;
    const elapsed = performance.now() - session.stepStartedAt;
    if (session.step === "RUNNING" && elapsed >= 3600) {
      const lapMs = makeQualifyingLapMs(active, session.roundIndex, session.entrantIndex);
      raceStore.recordQualifyingLap(active.id, lapMs);
      if (active.isPlayer) audio.lapComplete();
      else audio.sectorTime();
      return;
    }
    if ((session.step === "PIT_RETURN" || session.step === "ANALYSIS") && elapsed >= 1600) {
      raceStore.advanceQualifying();
    }
  }, [audio, qualifyingTick, race.phase, race.qualifyingSession]);

  const handleLap = useCallback((progress: number, count: number) => {
    setLap((prev) =>
      prev.count === count && Math.abs(prev.progress - progress) < 0.01
        ? prev
        : { progress, count },
    );
  }, []);

  const handleResetPosition = useCallback(() => {
    setResetSignal((n) => n + 1);
    console.log("[Simulator] Reset position");
  }, []);

  const toggleDev = useCallback(() => {
    setDevMode((d) => {
      console.log("[Simulator] DevMode:", !d);
      return !d;
    });
  }, []);

  const handleCameras = useCallback((cams: ThreePerspectiveCamera[]) => {
    camerasRef.current = cams;
    setCamsReady(true);
  }, []);

  const handleControlMode = useCallback((mode: ControlMode) => {
    engineeringProgressStore.setControlMode(mode);
  }, []);

  // Keyboard: 1..7 swap active view; V toggles split; H toggles hitbox; B toggles auto-bounds
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "v" || e.key === "V") setSplitMode((s) => !s);
      if (e.key === "h" || e.key === "H") setShowHitbox((s) => !s);
      if (e.key === "b" || e.key === "B") setHitboxAuto((s) => !s);
      if (e.key === "p" || e.key === "P") perfStore.toggleOverlay();
      if ((e.key === "e" || e.key === "E") && !engineeringMode) {
        const until = performance.now() + 4500;
        setRadioHelpUntil(until);
        window.setTimeout(() => {
          setRadioHelpUntil((current) => (current === until ? 0 : current));
        }, 4600);
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance(
            "Equipe no radio. Mantenha a linha, freie antes da curva e acelere progressivo na saida.",
          );
          msg.lang = "pt-BR";
          msg.rate = 1.02;
          window.speechSynthesis.speak(msg);
        }
      }
      if (["1", "2", "3", "4", "5", "6", "7"].includes(e.key))
        setActiveView(parseInt(e.key, 10) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engineeringMode]);

  // Debug presets (botões abaixo) — alternam combinações úteis sem depender só de teclas
  const applyPreset = useCallback((preset: "off" | "hitbox" | "hitboxParticles" | "fpsStats") => {
    if (preset === "off") {
      setShowHitbox(false);
      setDevMode(false);
      perfStore.setToggles({ particlesEnabled: true, crowdEnabled: true });
      return;
    }
    if (preset === "hitbox") {
      setShowHitbox(true);
      setDevMode(true);
      perfStore.setToggles({ particlesEnabled: false });
      return;
    }
    if (preset === "hitboxParticles") {
      setShowHitbox(true);
      setDevMode(true);
      perfStore.setToggles({ particlesEnabled: true });
      return;
    }
    if (preset === "fpsStats") {
      setShowHitbox(false);
      setDevMode(true);
      perfStore.setToggles({ particlesEnabled: true, crowdEnabled: true });
    }
  }, []);

  // Stream telemetry → audio engine
  useEffect(() => {
    audio.setSpeed(t.speed);
  }, [t.speed, audio]);

  useEffect(() => {
    const racers = Object.values(race.racers);
    const player = racers.find((r) => r.isPlayer);
    if (!player) {
      audio.setNearbyRacerIntensity(0);
      return;
    }
    let nearest = Infinity;
    racers.forEach((r) => {
      if (r.id === player.id) return;
      const dx = r.pose.x - player.pose.x;
      const dz = r.pose.z - player.pose.z;
      nearest = Math.min(nearest, Math.hypot(dx, dz));
    });
    audio.setNearbyRacerIntensity(Number.isFinite(nearest) ? Math.max(0, 1 - nearest / 8) : 0);
  }, [race, audio]);

  // Audio cues: checkpoint beep, lap jingle, race fanfare
  const lastCpAt = useRef(0);
  const bestRaceLapRef = useRef<number | null>(null);
  useEffect(() => {
    const cp = race.lastCheckpoint;
    if (!cp || cp.at === lastCpAt.current) return;
    lastCpAt.current = cp.at;
    if (cp.isLapClose) {
      const player = race.racers.player;
      audio.lapComplete();
      if (
        player?.lastLapMs &&
        (bestRaceLapRef.current === null || player.lastLapMs < bestRaceLapRef.current)
      ) {
        bestRaceLapRef.current = player.lastLapMs;
        audio.bestLap();
      }
      if (player && player.lap >= race.totalLaps - 1 && player.lap < race.totalLaps) {
        audio.finalLap();
      }
    } else audio.sectorTime();
  }, [race.lastCheckpoint, race.racers.player, race.totalLaps, audio]);

  useEffect(() => {
    if (race.phase === "RACE") bestRaceLapRef.current = null;
  }, [race.phase]);

  // Sincroniza fanfara/cues com as fases do replay (TV → Orbital → Helicóptero).
  // Fanfara dispara ao entrar na fase Helicóptero (clímax + confetes).
  const lastPhaseKey = useRef("");
  useEffect(() => {
    if (!race.finished && !race.playbackActive) {
      lastPhaseKey.current = "";
      return;
    }
    const key = `${race.replayRunNonce}-${race.replayPhase}`;
    if (key === lastPhaseKey.current) return;
    lastPhaseKey.current = key;
    if (race.replayPhase === 0) audio.sectorTime();
    else if (race.replayPhase === 1) audio.lapComplete();
    else if (race.replayPhase === 2) audio.finishFlag();
  }, [race.finished, race.playbackActive, race.replayPhase, race.replayRunNonce, audio]);

  const ghostBest = useGhostBest();

  // Replay → Pódio: respeita a duração configurada em setup.replayDurationMs
  const [showPodium, setShowPodium] = useState(false);
  useEffect(() => {
    if (!race.finished) {
      setShowPodium(false);
      return;
    }
    audio.finishFlag();
    const id = window.setTimeout(() => setShowPodium(true), race.setup.replayDurationMs);
    return () => window.clearTimeout(id);
  }, [audio, race.finished, race.setup.replayDurationMs]);

  useEffect(() => {
    if (showPodium) audio.podiumArrival();
  }, [audio, showPodium]);

  const skipReplay = useCallback(() => setShowPodium(true), []);
  const hasRecord = !!replayRecordStore.getRecord();
  const gridIndexById = useMemo(() => {
    const map = new Map<string, number>();
    race.gridOrder.forEach((id, i) => map.set(id, i));
    return map;
  }, [race.gridOrder]);
  const playerGridIndex = gridIndexById.get("player") ?? 0;
  const playerInitialPose = useMemo(() => gridPose(playerGridIndex), [playerGridIndex]);
  const raceActive = race.phase === "RACE";
  const sortedOpponents = useMemo(() => {
    if (race.gridOrder.length === 0) return aiOpponents;
    return [...aiOpponents].sort(
      (a, b) => (gridIndexById.get(a.id) ?? 99) - (gridIndexById.get(b.id) ?? 99),
    );
  }, [aiOpponents, gridIndexById, race.gridOrder.length]);

  const handleStartQualifying = useCallback(() => {
    const entrants = makeQualifyingEntrants(aiOpponents, race.setup.aggression);
    raceStore.startQualifyingSession(entrants);
  }, [aiOpponents, race.setup.aggression]);

  const handleGoToGrid = useCallback(() => {
    setGridLoadingProgress(0);
    setActiveView(0);
    raceStore.startGridLoading();
  }, []);

  useEffect(() => {
    if (race.phase !== "GRID_LOADING") return;
    setGridLoadingProgress(0);
    const startedAt = performance.now();
    const duration = 2600;
    const id = window.setInterval(() => {
      const pct = Math.min(100, ((performance.now() - startedAt) / duration) * 100);
      setGridLoadingProgress(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        setPoseResetSignal((n) => n + 1);
        window.setTimeout(() => raceStore.startGridCountdown(), 360);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [race.phase]);

  const viewportClass = fullscreen
    ? "scanline relative h-full min-h-[640px] w-full overflow-hidden bg-card"
    : "panel corner-cut scanline relative h-[620px] overflow-hidden";
  const sectionClass = fullscreen
    ? "relative h-screen min-h-[640px] overflow-hidden"
    : "relative py-24";
  const containerClass = fullscreen ? "h-full w-full" : "mx-auto max-w-7xl px-6";
  const headerClass = fullscreen ? "hidden" : "mb-10 flex items-end justify-between gap-4";
  const gridClass = fullscreen ? "h-full w-full" : "grid gap-6 lg:grid-cols-[1fr_320px]";
  const sidePanelClass = fullscreen ? "hidden" : "flex flex-col gap-4";

  return (
    <section id="arena" className={sectionClass}>
      <div className={containerClass}>
        <div className={headerClass}>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary">
              Arena de Corrida
            </div>
            <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
              RL <span className="text-primary text-glow">KART</span> · Live Scene
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {engineeringMode ? (
                <>
                  Modo engenharia: Rayssa pilota, voce escolhe feeds de camera e monitora os
                  sistemas. <span className="font-mono text-foreground">V</span> alterna monitor
                  wall · <span className="font-mono text-foreground">1-7</span> selecionam camera.
                </>
              ) : (
                <>
                  <span className="font-mono text-foreground">D</span> ou{" "}
                  <span className="font-mono text-foreground">↑</span> dirige ·{" "}
                  <span className="font-mono text-foreground">←/→</span> direcao ·{" "}
                  <span className="font-mono text-foreground">↓</span> re ·{" "}
                  <span className="font-mono text-foreground">F</span> freia ·{" "}
                  <span className="font-mono text-foreground">A</span> automatico ·{" "}
                  <span className="font-mono text-foreground">E</span> radio ·{" "}
                  <span className="font-mono text-foreground">V</span> alterna split-screen ·{" "}
                  <span className="font-mono text-foreground">1-7</span> selecionam camera.
                </>
              )}
            </p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() =>
                handleControlMode(engineeringMode ? "DRIVER_CONTROL" : "ENGINEERING_OBSERVER")
              }
              disabled={engineeringMode ? !canUseDriverControl : false}
              className="corner-cut border border-primary bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                canUseDriverControl
                  ? "Alternar modo de controle"
                  : nextUnlockLabel(engineering.rayssaWins)
              }
            >
              Modo: {engineeringMode ? "Engenharia" : "Piloto"}
            </button>
            <button
              onClick={() => setSplitMode((s) => !s)}
              className="corner-cut border border-primary bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
            >
              Split: {splitMode ? "ON" : "OFF"}
            </button>
            <button
              onClick={toggleDev}
              className="corner-cut border border-accent bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
            >
              Modo Dev: {devMode ? "ON" : "OFF"}
            </button>
            <button
              onClick={audio.start}
              className="corner-cut border border-primary bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
            >
              Áudio 3D: {audio.enabled ? "ON" : "OFF"}
            </button>
            <button
              onClick={handleResetPosition}
              className="corner-cut border border-border bg-card/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Resetar posição
            </button>
          </div>
        </div>

        <div className={gridClass}>
          <div
            className={viewportClass}
            tabIndex={0}
            onClick={(e) => (e.currentTarget as HTMLDivElement).focus()}
          >
            <Canvas shadows dpr={[1, 2]}>
              <color attach="background" args={["#1a2540"]} />
              <fog attach="fog" args={["#1a2540", 120, 320]} />
              {/* Fallback camera (used by OrbitControls and as default before split cams mount) */}
              <PerspectiveCamera
                makeDefault
                position={[18, 82, 132]}
                fov={46}
                onUpdate={(c) => c.lookAt(15, 0, 31)}
                ref={(c) => {
                  fallbackCamRef.current = c as ThreePerspectiveCamera | null;
                }}
              />
              <OrbitControls
                enablePan
                enabled={activeView === FREE_VIEW && !splitMode}
                target={[15, 0, 31]}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={8}
                maxDistance={360}
              />

              <Sky sunPosition={[100, 40, 100]} turbidity={6} rayleigh={2} />

              <ambientLight intensity={0.7} color="#cfe2ff" />
              <hemisphereLight args={["#bcd6ff", "#3a4a2a", 0.8]} />
              <directionalLight
                position={[80, 80, 40]}
                intensity={1.8}
                color="#ffffff"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-120}
                shadow-camera-right={120}
                shadow-camera-top={120}
                shadow-camera-bottom={-120}
              />
              <directionalLight position={[-30, 40, -20]} intensity={0.5} color="#88aaff" />

              <Suspense fallback={null}>
                <group name="world">
                  <TrackModel />
                  <PitBoxes />
                  {race.phase !== "QUALIFYING" && <Grandstand />}
                </group>
                <group name="actors">
                  <KartRig
                    state={t.state}
                    ignition={t.ignition}
                    battery={t.battery}
                    devMode={devMode}
                    resetSignal={resetSignal + poseResetSignal}
                    splitMode={splitMode}
                    activeView={activeView}
                    onKinematics={sim.setKinematics}
                    onLapProgress={handleLap}
                    onCameras={handleCameras}
                    onDebug={setDebugStats}
                    onPhysics={setPhysics}
                    sparksRef={sparksRef}
                    playerId="player"
                    showHitbox={showHitbox}
                    hitboxAuto={hitboxAuto}
                    controlMode={engineeringMode ? "autopilot" : "manual"}
                    raceActive={raceActive}
                    initialPose={playerInitialPose}
                  />
                  {sortedOpponents.map((a, index) => (
                    <AIKart
                      key={a.id}
                      {...a}
                      kartNumber={`${21 + index}`}
                      showHitbox={showHitbox}
                      hitboxAuto={hitboxAuto}
                      raceActive={raceActive}
                      gridIndex={gridIndexById.get(a.id) ?? index + 1}
                    />
                  ))}
                  <GhostKart />
                </group>
                <group name="fx">
                  <Sparks ref={sparksRef} />
                  {(race.finished || race.playbackActive) && race.replayPhase >= 2 && (
                    <Confetti origin={[15, 0, 31]} />
                  )}
                </group>
                <RecordedRace />
              </Suspense>

              <ReplayCameras />

              <Splitter
                cameras={camsReady ? camerasRef.current : null}
                splitMode={splitMode}
                activeView={activeView}
                fallbackCam={fallbackCamRef.current}
              />
              <AudioSync onCam={audio.setCamPosition} />
              <ShadowsSync enabled={perf.toggles.shadowsEnabled} />
            </Canvas>

            {fullscreen && (
              <div className="pointer-events-auto absolute left-3 top-14 z-40 flex max-w-[calc(100%-7.5rem)] flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest md:left-40 md:top-3">
                <div className="corner-cut border border-primary/40 bg-background/75 px-2.5 py-1.5 text-primary backdrop-blur-sm">
                  Arena · {engineeringMode ? roleLabel(currentRole) : "Piloto"}
                </div>
                <button
                  onClick={() =>
                    handleControlMode(engineeringMode ? "DRIVER_CONTROL" : "ENGINEERING_OBSERVER")
                  }
                  disabled={engineeringMode ? !canUseDriverControl : false}
                  className="corner-cut border border-primary bg-primary/10 px-2.5 py-1.5 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                  title={
                    canUseDriverControl
                      ? "Alternar modo de controle"
                      : nextUnlockLabel(engineering.rayssaWins)
                  }
                >
                  {engineeringMode ? "Engenharia" : "Piloto"}
                </button>
                <button
                  onClick={() => setSplitMode((s) => !s)}
                  className="corner-cut border border-primary bg-primary/10 px-2.5 py-1.5 text-primary transition-colors hover:bg-primary/20"
                >
                  Split {splitMode ? "ON" : "OFF"}
                </button>
                <button
                  onClick={toggleDev}
                  className="corner-cut border border-accent bg-accent/10 px-2.5 py-1.5 text-accent transition-colors hover:bg-accent/20"
                >
                  Dev {devMode ? "ON" : "OFF"}
                </button>
                <button
                  onClick={audio.start}
                  className="corner-cut border border-primary bg-primary/10 px-2.5 py-1.5 text-primary transition-colors hover:bg-primary/20"
                >
                  Audio {audio.enabled ? "ON" : "OFF"}
                </button>
                <button
                  onClick={handleResetPosition}
                  className="corner-cut border border-border bg-background/70 px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Single-view: HUD */}
            {!splitMode && <HUD3D t={t} lap={lap} devMode={devMode} />}
            {!splitMode && <ExtendedHud p={physics} />}
            {!splitMode && (
              <HelmetHud
                active={activeView === DRIVER_VIEW || activeView === HELMET_VIEW}
                audioEnabled={audio.enabled}
                t={t}
                lap={lap}
                physics={physics}
              />
            )}
            {!splitMode && !engineeringMode && <Leaderboard />}
            {!splitMode && !engineeringMode && <TelemetryCharts />}
            {engineeringMode && (
              <EngineeringPitWall
                t={t}
                physics={physics}
                race={race}
                activeViewLabel={VIEW_LABELS[activeView]}
                splitMode={splitMode}
                rayssaWins={engineering.rayssaWins}
                controlMode={engineering.controlMode}
                canDrive={canUseDriverControl}
                onSetMode={handleControlMode}
              />
            )}
            <QualifyingSessionPanel session={race.qualifyingSession} />
            <QualifyingPanel phase={race.phase} results={race.qualifying} onGrid={handleGoToGrid} />
            <GridLoadingOverlay phase={race.phase} progress={gridLoadingProgress} />
            <StartLightsOverlay
              phase={race.phase}
              startedAt={race.countdownStartedAt}
              onStartSound={audio.startLights}
            />
            <PitServiceOverlay service={race.pitService} />
            {radioHelpUntil > performance.now() && (
              <div className="pointer-events-none absolute inset-x-0 top-28 z-40 flex justify-center font-mono">
                <div className="corner-cut border border-primary bg-background/80 px-4 py-2 text-[10px] uppercase tracking-widest text-primary backdrop-blur-sm">
                  Radio equipe: freie antes da curva, mantenha a linha e acelere progressivo na
                  saida.
                </div>
              </div>
            )}
            {devMode && <DebugPanel stats={debugStats} />}
            {(devMode || perf.toggles.overlayEnabled) && <FpsMeter />}
            {showHitbox && (
              <div className="pointer-events-none absolute right-3 top-32 z-50 corner-cut border border-warning bg-warning/15 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-warning backdrop-blur-sm">
                ◫ Hitboxes ON · H
              </div>
            )}
            {/* Presets de debug — alternâncias rápidas + toggles por subsistema */}
            <div
              className={`pointer-events-auto absolute left-3 z-50 flex flex-col gap-1.5 corner-cut border border-primary/40 bg-background/75 p-2 font-mono text-[9px] uppercase tracking-widest backdrop-blur-sm ${
                engineeringMode ? "bottom-[190px]" : "bottom-3"
              }`}
            >
              <div className="flex items-center gap-1 text-primary/80">
                <span>Presets</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ["off", "Off"],
                    ["hitbox", "Hitboxes"],
                    ["hitboxParticles", "Hitb+Part"],
                    ["fpsStats", "FPS+Stats"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => applyPreset(k)}
                    className="corner-cut border border-border bg-card/60 px-2 py-0.5 text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                <PerfToggleBtn
                  label="Torcida"
                  on={perf.toggles.crowdEnabled}
                  onClick={() => perfStore.setToggle("crowdEnabled", !perf.toggles.crowdEnabled)}
                />
                <PerfToggleBtn
                  label="Partículas"
                  on={perf.toggles.particlesEnabled}
                  onClick={() =>
                    perfStore.setToggle("particlesEnabled", !perf.toggles.particlesEnabled)
                  }
                />
                <PerfToggleBtn
                  label="Sombras"
                  on={perf.toggles.shadowsEnabled}
                  onClick={() =>
                    perfStore.setToggle("shadowsEnabled", !perf.toggles.shadowsEnabled)
                  }
                />
                <PerfToggleBtn
                  label="MotionBlur"
                  on={perf.toggles.motionBlurEnabled}
                  onClick={() =>
                    perfStore.setToggle("motionBlurEnabled", !perf.toggles.motionBlurEnabled)
                  }
                />
                <PerfToggleBtn
                  label="Hitbox-Auto"
                  on={hitboxAuto}
                  onClick={() => setHitboxAuto((v) => !v)}
                />
                <PerfToggleBtn
                  label="Overlay (P)"
                  on={perf.toggles.overlayEnabled}
                  onClick={() => perfStore.toggleOverlay()}
                />
                <PerfToggleBtn
                  label={`Gestos ${EMPTY_GESTURE_INPUT.status}`}
                  on={false}
                  onClick={() => undefined}
                />
              </div>
            </div>
            {race.timeScale < 1 && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center">
                <div className="mt-32 corner-cut border border-warning bg-warning/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.4em] text-warning backdrop-blur-sm animate-pulse">
                  ◆ Slow-Mo · {(race.timeScale * 100).toFixed(0)}%
                </div>
              </div>
            )}
            {race.lastImpact && performance.now() - race.lastImpact.at < 1500 && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center">
                <div className="mt-44 corner-cut border border-destructive bg-destructive/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-destructive backdrop-blur-sm">
                  ✕ Colisão · +{(race.lastImpact.penaltyMs / 1000).toFixed(2)}s
                </div>
              </div>
            )}
            {race.lastCheckpoint && performance.now() - race.lastCheckpoint.at < 1200 && (
              <div className="pointer-events-none absolute inset-x-0 top-24 z-30 flex justify-center">
                <div className="corner-cut border border-primary bg-primary/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.4em] text-primary backdrop-blur-sm">
                  {race.lastCheckpoint.isLapClose
                    ? `▣ Volta completa · CP ${race.lastCheckpoint.idx + 1}/${race.lastCheckpoint.total}`
                    : `◉ Checkpoint ${race.lastCheckpoint.idx + 1}/${race.lastCheckpoint.total}`}
                </div>
              </div>
            )}
            {showPodium && <Podium onRestart={handleResetPosition} />}
            {(race.finished || race.playbackActive) && !showPodium && (
              <div className="pointer-events-auto absolute inset-x-0 top-10 z-40 flex flex-col items-center gap-2">
                <div className="corner-cut border border-primary bg-background/70 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.5em] text-primary backdrop-blur-sm animate-pulse">
                  ◉ Replay ·{" "}
                  {race.replayPhase === 0
                    ? "TV"
                    : race.replayPhase === 1
                      ? "Orbital"
                      : "Helicóptero"}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {race.finished && !race.playbackActive && (
                    <button
                      onClick={skipReplay}
                      className="corner-cut border border-primary/70 bg-primary/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary hover:bg-primary/25"
                    >
                      ⤳ Pular replay
                    </button>
                  )}
                  {race.playbackActive && (
                    <button
                      onClick={() => raceStore.stopReplayPlayback()}
                      className="corner-cut border border-accent/70 bg-accent/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/25"
                    >
                      ✕ Encerrar replay
                    </button>
                  )}
                  <div className="flex items-center gap-1 corner-cut border border-border bg-background/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span className="mr-1 text-primary">VEL</span>
                    {[0.5, 1, 1.5].map((s) => (
                      <button
                        key={s}
                        onClick={() => raceStore.setPlaybackSpeed(s)}
                        className="px-1.5 py-0.5 transition-colors"
                        style={{
                          color:
                            Math.abs(race.playbackSpeed - s) < 0.01
                              ? "var(--primary)"
                              : "var(--muted-foreground)",
                          borderBottom:
                            Math.abs(race.playbackSpeed - s) < 0.01
                              ? "1px solid var(--primary)"
                              : "1px solid transparent",
                        }}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                  {hasRecord && (
                    <button
                      onClick={() => replayRecordStore.exportToFile()}
                      className="corner-cut border border-border bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      ⇩ Exportar JSON
                    </button>
                  )}
                </div>
              </div>
            )}
            <RaceSetup onStart={handleStartQualifying} />
            <button
              onClick={() => raceStore.openSetup(true)}
              className="absolute left-3 top-3 z-30 corner-cut border border-accent bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20"
            >
              Setup
            </button>
            {hasRecord && !race.finished && !race.playbackActive && !race.setupOpen && (
              <>
                <button
                  onClick={() => raceStore.startReplayPlayback()}
                  className="absolute left-20 top-3 z-30 corner-cut border border-primary bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary hover:bg-primary/20"
                >
                  ▶ Replay
                </button>
                <button
                  onClick={() => replayRecordStore.exportToFile()}
                  title="Exportar buffer de amostras (.json)"
                  className="absolute left-40 top-3 z-30 corner-cut border border-border bg-card/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary"
                >
                  ⇩ JSON
                </button>
              </>
            )}
            {ghostBest && !splitMode && (
              <div className="pointer-events-none absolute left-3 top-12 z-30 corner-cut border border-primary/60 bg-background/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-primary backdrop-blur-sm">
                ◇ Ghost · best {(ghostBest.totalMs / 1000).toFixed(2)}s
              </div>
            )}

            {/* Split-view overlays: 4 quadrant labels + mini HUDs */}
            {splitMode && (
              <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
                {VIEW_LABELS.slice(0, SPLIT_CAMERA_COUNT).map((label, i) => (
                  <div key={label} className="relative border border-primary/20">
                    <div className="absolute left-2 top-2 border border-primary/40 bg-background/60 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-primary backdrop-blur-sm">
                      CAM {i + 1} · {label}
                    </div>
                    <div className="absolute right-2 top-2 border border-primary/40 bg-background/60 px-2 py-1 font-mono text-[9px] text-primary backdrop-blur-sm">
                      {t.speed.toFixed(0)} km/h · {t.gear}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] uppercase text-muted-foreground">
                      <span>BAT {t.battery.toFixed(0)}%</span>
                      <span>IGN {t.ignition ? "ON" : "OFF"}</span>
                      <span>LAP {lap.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Camera selector (single view) */}
            {!splitMode && (
              <div className="absolute right-3 top-20 flex flex-col gap-1 pointer-events-auto">
                {VIEW_LABELS.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setActiveView(i)}
                    className="corner-cut border bg-background/60 px-2 py-1 font-mono text-[9px] uppercase tracking-widest backdrop-blur-sm transition-colors"
                    style={{
                      borderColor: activeView === i ? "var(--primary)" : "var(--border)",
                      color: activeView === i ? "var(--primary)" : "var(--muted-foreground)",
                    }}
                  >
                    {i + 1} · {label}
                  </button>
                ))}
              </div>
            )}

            {!t.ignition && !devMode && !splitMode && (
              <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center">
                <div className="border border-primary/40 bg-background/70 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur-sm corner-cut">
                  {t.modules.includes("IGNITION")
                    ? "Pressione  Ligar Kart  para dirigir · ou ative Modo Dev"
                    : "Carregue todos os módulos · ou ative Modo Dev"}
                </div>
              </div>
            )}
          </div>

          {!fullscreen && (
            <div className={sidePanelClass}>
              <TelemetryPanel t={t} />
              <SimulatorControls
                t={t}
                loadModule={sim.loadModule}
                ignite={sim.ignite}
                accelerate={sim.accelerate}
                brake={sim.brake}
                drainBattery={sim.drainBattery}
                reset={sim.reset}
              />
              <div className="panel corner-cut p-4 font-mono text-[10px] uppercase tracking-widest">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-primary">{engineeringMode ? "Posto" : "Controles"}</span>
                  <button
                    onClick={() => setSplitMode((s) => !s)}
                    className="text-primary hover:underline"
                  >
                    Split: {splitMode ? "ON" : "OFF"}
                  </button>
                </div>
                {engineeringMode ? (
                  <>
                    <div className="text-muted-foreground">{roleLabel(currentRole)}</div>
                    <div className="text-muted-foreground">
                      {engineering.rayssaWins} vitorias P1
                    </div>
                    <div className="text-muted-foreground">
                      {nextUnlockLabel(engineering.rayssaWins)}
                    </div>
                    <div className="text-muted-foreground">Rayssa — piloto automatico</div>
                  </>
                ) : (
                  <>
                    <div className="text-muted-foreground">↑ / D — dirigir</div>
                    <div className="text-muted-foreground">← · → — direção</div>
                    <div className="text-muted-foreground">↓ — ré</div>
                    <div className="text-muted-foreground">A — automático</div>
                    <div className="text-muted-foreground">F — freiar</div>
                    <div className="text-muted-foreground">E — rádio da equipe</div>
                  </>
                )}
                <div className="text-muted-foreground">V — split-screen</div>
                <div className="text-muted-foreground">H — hitbox debug</div>
                <div className="text-muted-foreground">1-7 — câmera ativa</div>
                <div className="text-muted-foreground">5 — visão corredora</div>
                <div className="text-muted-foreground">6 — capacete / visor</div>
                <button
                  onClick={handleResetPosition}
                  className="mt-3 w-full corner-cut border border-border bg-card/60 px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary md:hidden"
                >
                  Resetar posição
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PerfToggleBtn({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="corner-cut border px-2 py-0.5 transition-colors"
      style={{
        borderColor: on ? "var(--primary)" : "var(--border)",
        color: on ? "var(--primary)" : "var(--muted-foreground)",
        background: on ? "color-mix(in oklab, var(--primary) 12%, transparent)" : "transparent",
      }}
    >
      {label}
    </button>
  );
}
