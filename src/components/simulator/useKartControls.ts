import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export interface KartControlsState {
  forward: number;
  reverse: number;
  left: number;
  right: number;
  brake: number;
  automatic: number;
  help: number;
  reset: number;
}

const KEY_MAP: Record<string, keyof KartControlsState> = {
  arrowup: "forward",
  d: "forward",
  arrowdown: "reverse",
  arrowleft: "left",
  arrowright: "right",
  f: "brake",
  a: "automatic",
  e: "help",
  r: "reset",
};

/**
 * useKartControls — keyboard input ref. Read-only ref.current for use in useFrame.
 * Logs key presses to console while in DevMode/debug.
 */
export function useKartControls(
  debug = false,
  external?: RefObject<Partial<KartControlsState> | null>,
  keyboardEnabled = true,
) {
  const state = useRef<KartControlsState>({
    forward: 0,
    reverse: 0,
    left: 0,
    right: 0,
    brake: 0,
    automatic: 0,
    help: 0,
    reset: 0,
  });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (!keyboardEnabled) return;
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
    if (!keyboardEnabled) {
      state.current.forward = 0;
      state.current.reverse = 0;
      state.current.left = 0;
      state.current.right = 0;
      state.current.brake = 0;
      state.current.automatic = 0;
      state.current.help = 0;
      state.current.reset = 0;
    }
  }, [debug, keyboardEnabled]);

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
      state.current.automatic = Math.max(state.current.automatic, input.automatic ?? 0);
      state.current.help = Math.max(state.current.help, input.help ?? 0);
      state.current.reset = Math.max(state.current.reset, input.reset ?? 0);
    };
    raf = requestAnimationFrame(mergeExternal);
    return () => cancelAnimationFrame(raf);
  }, [external]);

  return state;
}
