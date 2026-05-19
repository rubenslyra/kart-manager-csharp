import type { KartControlsState } from "./useKartControls";

export type GestureInputStatus = "unsupported" | "available" | "disabled" | "active";

export interface GestureInputState {
  status: GestureInputStatus;
  confidence: number;
  controls: KartControlsState;
}

export const EMPTY_GESTURE_INPUT: GestureInputState = {
  status: typeof navigator === "undefined" || !navigator.mediaDevices ? "unsupported" : "disabled",
  confidence: 0,
  controls: {
    forward: 0,
    reverse: 0,
    left: 0,
    right: 0,
    brake: 0,
    automatic: 0,
    help: 0,
    reset: 0,
  },
};
