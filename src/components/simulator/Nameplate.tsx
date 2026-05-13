import { Html } from "@react-three/drei";

interface Props {
  name: string;
  color: string;
}

/**
 * Etiqueta flutuante 3D presa acima do kart.
 * - Sempre virada para a câmera (Html cuida disso)
 * - Encolhe à distância via distanceFactor
 * - Pointer-events desligados para não capturar cliques na cena
 */
export function Nameplate({ name, color }: Props) {
  return (
    <Html
      position={[0, 2.5, 0]}
      center
      distanceFactor={14}
      zIndexRange={[40, 0]}
      occlude={false}
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <div className="flex flex-col items-center" style={{ transform: "translateY(0)" }}>
        <div
          className="px-2 py-0.5 font-mono text-[11px] italic font-black tracking-widest uppercase"
          style={{
            background: "rgba(0,0,0,0.72)",
            color: color,
            border: `1.5px solid ${color}`,
            borderRadius: 3,
            boxShadow: `0 0 12px ${color}55`,
            textShadow: `0 0 6px ${color}aa`,
            backdropFilter: "blur(2px)",
          }}
        >
          {name}
        </div>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: `6px solid ${color}`,
            marginTop: -1,
            filter: `drop-shadow(0 0 3px ${color}aa)`,
          }}
        />
      </div>
    </Html>
  );
}
