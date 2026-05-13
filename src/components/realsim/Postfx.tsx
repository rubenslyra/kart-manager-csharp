import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export function Postfx() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.45} luminanceThreshold={0.6} luminanceSmoothing={0.25} mipmapBlur />
      <Vignette eskil={false} offset={0.2} darkness={0.55} />
    </EffectComposer>
  );
}
