// Profis fixos dos adversários: nome, cor de macacão, perfil de habilidade.
// Os 3 primeiros são os "personagens-título" (Dandara, Zuri, Bento).
export interface AIProfile {
  name: string;
  color: string;
  /** multiplicador aplicado sobre os sliders globais (0.6..1.3) */
  aggressionMul: number;
  brakingMul: number;
  overtakeMul: number;
  /** bônus/penalidade flat na velocidade base */
  speedBias: number;
}

export const AI_PROFILES: AIProfile[] = [
  { name: "Dandara",  color: "#ef4444", aggressionMul: 1.25, brakingMul: 0.85, overtakeMul: 1.20, speedBias:  0.4 },
  { name: "Zuri",     color: "#22c55e", aggressionMul: 0.85, brakingMul: 1.25, overtakeMul: 1.05, speedBias:  0.0 },
  { name: "Bento",    color: "#facc15", aggressionMul: 1.00, brakingMul: 1.00, overtakeMul: 0.90, speedBias:  0.8 },
  { name: "Aisha",    color: "#06b6d4", aggressionMul: 1.05, brakingMul: 1.10, overtakeMul: 1.00, speedBias:  0.2 },
  { name: "Kael",     color: "#a855f7", aggressionMul: 1.15, brakingMul: 0.95, overtakeMul: 1.10, speedBias:  0.1 },
  { name: "Nzinga",   color: "#ec4899", aggressionMul: 0.95, brakingMul: 1.15, overtakeMul: 1.20, speedBias: -0.1 },
];
