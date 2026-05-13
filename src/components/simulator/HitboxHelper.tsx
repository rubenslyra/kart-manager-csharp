import { useEffect, useRef } from "react";
import { Box3, Box3Helper, Color, Group } from "three";
import { useFrame } from "@react-three/fiber";

/**
 * HitboxHelper — Debug visual da caixa de colisão (wireframe) + esfera
 * vermelha marcando o ponto onde o raycast de solo atinge a pista.
 *
 * Modos:
 *  - autoBounds=false (padrão): wireframe de tamanho fixo (radius).
 *  - autoBounds=true: usa Box3.setFromObject(target) para alinhar exatamente
 *    ao bounding box real do modelo do kart (atualiza a cada frame).
 *
 * Renderizado como filho do grupo do kart; coordenadas locais.
 */
interface Props {
  color?: string;
  /** Raio horizontal usado para colisão entre karts (default: 1.4) */
  radius?: number;
  /** Quando true, deriva o BoxHelper do bounding box real do alvo. */
  autoBounds?: boolean;
  /** Alvo para Box3.setFromObject quando autoBounds=true. */
  targetRef?: React.RefObject<Group | null>;
}

export function HitboxHelper({
  color = "#00e5ff",
  radius = 1.4,
  autoBounds = false,
  targetRef,
}: Props) {
  const groupRef = useRef<Group>(null);
  const helperRef = useRef<Box3Helper | null>(null);
  const box = useRef(new Box3());

  // Cria/destroi o Box3Helper sob demanda
  useEffect(() => {
    if (!autoBounds || !groupRef.current) return;
    const helper = new Box3Helper(box.current, new Color(color));
    const mat = helper.material as { depthTest?: boolean };
    mat.depthTest = false;
    helperRef.current = helper;
    groupRef.current.add(helper);
    return () => {
      groupRef.current?.remove(helper);
      helper.geometry.dispose();
      helperRef.current = null;
    };
  }, [autoBounds, color]);

  useFrame(() => {
    if (!autoBounds || !targetRef?.current || !helperRef.current) return;
    box.current.setFromObject(targetRef.current);
    // O Box3Helper compartilha a referência da Box3, basta atualizar matrizes
    helperRef.current.updateMatrixWorld(true);
  });

  return (
    <group ref={groupRef}>
      {!autoBounds && (
        <mesh>
          <boxGeometry args={[radius * 1.2, 0.7, radius * 1.6]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.85} />
        </mesh>
      )}
      {/* Anel mostrando o raio de colisão entre karts */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[radius - 0.05, radius, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* Esfera vermelha no ponto do raycast de solo */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ff2244" />
      </mesh>
    </group>
  );
}
