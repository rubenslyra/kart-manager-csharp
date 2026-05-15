import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_ASSETS } from "@/components/audio/audioAssets";

export function usePresentationRiserAudio(ready: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasReadyRef = useRef(ready);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  const start = useCallback(() => {
    enabledRef.current = true;
    setEnabled(true);
    if (!audioRef.current) {
      const audio = new Audio(AUDIO_ASSETS.kartPresentationRiser);
      audio.preload = "auto";
      audio.volume = 0.72;
      audioRef.current = audio;
    }
  }, []);

  const play = useCallback(() => {
    if (!enabledRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (ready && !wasReadyRef.current) play();
    wasReadyRef.current = ready;
  }, [ready, play]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );

  return { enabled, start, play };
}
