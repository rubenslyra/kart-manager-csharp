# Mapa De Componentes

## Hierarquia Visual Do Kart Real

Entrada principal:

- `src/components/realsim/RealKart.tsx`

Composicao:

- `Chassis`: estrutura tubular.
- `SideStep`: estribos laterais.
- `Seat`: banco.
- `Steering`: coluna e volante.
- `ElectricalSystem`: bateria, BMS, controlador e cabos.
- `MotorAssembly`: motor Wankel instalado.
- `GearSelector`: seletor/cambio.
- `BrakeSystem`: freios, rodas e pedal.
- `Dashboard`: painel, ignicao e alertas.

## Arquivos Por Dominio

| Dominio | Arquivo | Observacao |
| --- | --- | --- |
| Dimensoes oficiais | `src/components/simulator/kart/RLKart26ADimensions.ts` | Fonte de medidas e nomes canonicos. |
| Montagem do kart real | `src/components/realsim/RealKart.tsx` | Composicao geral e estribos. |
| Kart da Arena | `src/components/simulator/KartModel.tsx` | Modelo procedural de corrida alinhado as dimensoes oficiais e com identidade de pista. |
| Corredora da Arena | `src/components/simulator/Driver.tsx` | Modelo procedural da Rayssa com macacao, cabelo afro e identificacao visual. |
| Chassi | `src/components/realsim/parts/Chassis.tsx` | Tubos, piso, eixos e arcos. |
| Rodas | `src/components/realsim/parts/Wheels.tsx` | Rodas parametricas com calotas. |
| Freios | `src/components/realsim/parts/BrakeSystem.tsx` | Discos, pincas, pedal e montagem das rodas. |
| Motor | `src/components/realsim/parts/MotorAssembly.tsx` | Wankel, bancada e rig de teste. |
| Oficina | `src/components/realsim/Workshop.tsx` | Sala principal e sala acustica. |
| Chicotes | `src/components/realsim/Wiring.tsx` | Cabos e conexoes visuais. |
| Labels | `src/components/realsim/ModuleLabels.tsx` | Marcadores dos modulos. |

## Regras De Pivot

| Parte | Pivot esperado | Motivo |
| --- | --- | --- |
| Kart completo | Origem do chassi no solo | Facilita camera, labels e montagem geral. |
| Roda | Centro geometrico do cubo | Rotacao e esterco corretos. |
| Calota | Fora da face da roda, paralela ao eixo lateral | Evita corte visual no pneu/aro. |
| Motor | Base inferior central da placa/carcaca | Facilita alinhamento nos trilhos e remocao. |
| Sala de teste | Base no piso da oficina | Permite mover o ambiente como modulo. |

## Nomes Canonicos

Os nomes usados em objetos Three.js devem continuar alinhados com `RL_KART_PART_NAMES`:

- `RL_KART_26A`
- `CHASSI_TUBULAR`
- `RODAS_E_EIXOS`
- `wheel_FL`, `wheel_FR`, `wheel_RL`, `wheel_RR`
- `BANCO_E_DIRECAO`
- `SISTEMA_ELETRICO`
- `motor_rear`
- `FREIOS`
- `IGNICAO_PARTIDA`
- `CAIXA_DE_MARCHA`
- `PAINEL_HUD`
