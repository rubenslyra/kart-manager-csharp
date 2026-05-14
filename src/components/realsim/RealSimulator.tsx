import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Workshop } from "./Workshop";
import { RealKart, type FocusTarget } from "./RealKart";
import { CameraController, type SceneFocusTarget } from "./CameraController";
import { RealSimUI } from "./RealSimUI";
import { Postfx } from "./Postfx";
import { ModuleLabels } from "./ModuleLabels";
import { Wiring } from "./Wiring";
import { XRayOverlay } from "./XRayOverlay";
import { AuditLog } from "./AuditLog";
import { BackgroundMonitors } from "./BackgroundMonitors";
import { DllImportPanel } from "./dll/DllImportPanel";
import { useAuditLog } from "./hooks/useAuditLog";
import { useExternalData } from "@/bridge/useExternalData";
import { mockBridge } from "@/bridge/mockExternalData";
import { canLeavePit } from "@/bridge/moduleValidator";

export function RealSimulator() {
  const ext = useExternalData();
  const [focus, setFocus] = useState<FocusTarget>(null);
  const [sceneFocus, setSceneFocus] = useState<SceneFocusTarget>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [xray, setXray] = useState(false);
  const [showWiring, setShowWiring] = useState(true);
  const audit = useAuditLog(ext.telemetry, focus);

  const onRelease = () => {
    if (!canLeavePit(ext.telemetry)) return;
    if (ext.source === "mock") {
      mockBridge.setIgnition(true);
      mockBridge.setGear("D");
      mockBridge.setSpeed(0.1);
    }
  };

  return (
    <div className="relative h-[80vh] min-h-[640px] w-full overflow-hidden corner-cut border border-primary/40 bg-card shadow-[0_0_60px_-20px_oklch(0.72_0.18_235/0.4)]">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [2.6, 1.6, 2.8], fov: 45 }}
      >
        <color attach="background" args={["#0d1826"]} />
        <fog attach="fog" args={["#0d1826", 18, 38]} />
        <Suspense fallback={null}>
          <Workshop telemetry={ext.telemetry} />
          <BackgroundMonitors telemetry={ext.telemetry} />
          <RealKart telemetry={ext.telemetry} focus={focus} />
          <Wiring telemetry={ext.telemetry} focus={focus} visible={showWiring || xray} />
          <ModuleLabels telemetry={ext.telemetry} focus={focus} visible={showLabels} />
          <XRayOverlay telemetry={ext.telemetry} focus={focus} enabled={xray} />
          <CameraController focus={sceneFocus ?? focus} />
          <Postfx />
        </Suspense>
      </Canvas>
      <RealSimUI
        telemetry={ext.telemetry}
        source={ext.source}
        setSource={ext.setSource}
        connection={ext.connection}
        wsUrl={ext.wsUrl}
        setWsUrl={ext.setWsUrl}
        lastRaw={ext.lastRaw}
        focus={focus}
        setFocus={setFocus}
        sceneFocus={sceneFocus}
        setSceneFocus={setSceneFocus}
        onRelease={onRelease}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        xray={xray}
        setXray={setXray}
        showWiring={showWiring}
        setShowWiring={setShowWiring}
      />
      <AuditLog events={audit.events} onClear={audit.clear} />
      <DllImportPanel />
    </div>
  );
}
