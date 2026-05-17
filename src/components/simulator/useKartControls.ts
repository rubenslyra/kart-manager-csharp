import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export interface KartControlsState {
  forward: number;
  reverse: number;
  left: number;
  right: number;
  brake: number;
  reset: number;
}

const KEY_MAP: Record<string, keyof KartControlsState> = {
  w: "forward",
  arrowup: "forward",
  s: "reverse",
  arrowdown: "reverse",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
  " ": "brake",
  r: "reset",
};

/**
 * useKartControls — keyboard input ref. Read-only ref.current for use in useFrame.
 * Logs key presses to console while in DevMode/debug.
 */
export function useKartControls(
  debug = false,
  external?: RefObject<Partial<KartControlsState> | null>,
) {
  const state = useRef<KartControlsState>({
    forward: 0,
    reverse: 0,
    left: 0,
    right: 0,
    brake: 0,
    reset: 0,
  });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const action = KEY_MAP[k];
      if (!action) return;
      e.preventDefault();
      state.current[action] = 1;
      if (debug) console.log("[useKartControls] keydown:", k, "->", action);
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const action = KEY_MAP[k];
      if (!action) return;
      state.current[action] = 0;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [debug]);

  useEffect(() => {
    if (!external) return;
    let raf = 0;
    const mergeExternal = () => {
      raf = requestAnimationFrame(mergeExternal);
      const input = external.current;
      if (!input) return;
      state.current.forward = Math.max(state.current.forward, input.forward ?? 0);
      state.current.reverse = Math.max(state.current.reverse, input.reverse ?? 0);
      state.current.left = Math.max(state.current.left, input.left ?? 0);
      state.current.right = Math.max(state.current.right, input.right ?? 0);
      state.current.brake = Math.max(state.current.brake, input.brake ?? 0);
      state.current.reset = Math.max(state.current.reset, input.reset ?? 0);
    };
    raf = requestAnimationFrame(mergeExternal);
    return () => cancelAnimationFrame(raf);
  }, [external]);

  return state;
}
