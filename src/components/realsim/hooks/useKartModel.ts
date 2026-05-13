import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";

const GLB_URL = "/models/kart/rl_kart_26a_full.glb";

/**
 * Returns the loaded GLTF when available, or null to indicate the procedural
 * fallback should be used. Probes the URL with a HEAD request first so a
 * missing file never throws a Suspense error in the canvas tree.
 */
export function useKartModel() {
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GLB_URL, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setExists(r.ok);
      })
      .catch(() => {
        if (!cancelled) setExists(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { exists, url: GLB_URL };
}

// Allow drei to preload only when caller knows the file exists.
export function preloadKartModel() {
  useGLTF.preload(GLB_URL);
}
