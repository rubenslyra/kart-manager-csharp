# Inventario De Cena E Interfaces Tecnicas

Este documento registra elementos do ambiente 3D que nao sao partes fisicas do kart, mas comunicam operacao, diagnostico, telemetria, validacao e contexto tecnico da oficina.

## Oficina De Engenharia

### Paineis holograficos superiores

- Codigo: `src/components/realsim/Workshop.tsx`.
- Componentes:
  - `ModuleReadinessPanel`
  - `TelemetryReadoutPanel`
  - `HoloCanvasPanel`
- Funcao: exibir, dentro da cena 3D, o estado operacional do kart e dos modulos externos.
- Fonte de dados: `KartTelemetry`, recebida por `RealSimulator` via `useExternalData`.
- Requisitos:
  - Nao usar textos fixos para status operacional.
  - Usar os mesmos criterios da interface principal para validacao de modulos.
  - Manter leitura clara a partir da camera principal.
  - Ter acabamento futurista, tecnico e coerente com a paleta RL: azul, verde, amber e vermelho de alerta.

#### Painel `MODULES OK` / `MODULES CHECK`

- Local: lado esquerdo superior da oficina.
- Dados usados:
  - `telemetry.modules.core.loaded`
  - `telemetry.modules.gearbox.loaded`
  - `telemetry.modules.brakes.loaded`
  - `telemetry.modules.ignition.loaded`
  - `telemetry.modules.battery.level`
  - `telemetry.modules.*.status`
  - `buildChecklist(telemetry)`
  - `canLeavePit(telemetry)`
- Comportamento:
  - Mostra `MODULES OK` quando o checklist operacional esta valido.
  - Mostra `MODULES CHECK` quando ainda existe pendencia.
  - Exibe status individual de CORE, GEAR, BRK, IGN e BAT.

#### Painel `LIVE TELEMETRY`

- Local: lado direito superior da oficina.
- Dados usados:
  - `telemetry.vehicleState`
  - `telemetry.speedKmh`
  - `telemetry.modules.gearbox.currentGear`
  - `telemetry.modules.battery.level`
  - `telemetry.modules.battery.voltage`
  - `telemetry.modules.brakes.pedalPressure`
  - `telemetry.modules.brakes.discTemperature`
  - `telemetry.modules.steering.angle`
- Comportamento:
  - Exibe leitura compacta de velocidade, marcha, bateria, freio e direcao.
  - Usa cor por severidade para estados `ok`, `warning`, `critical` e `missing`.

### Console de diagnostico `DIAG 26A`

- Codigo: `src/components/realsim/Workshop.tsx`, componente `DiagnosticConsoleScreen`.
- Local: bancada de diagnostico no lado esquerdo da oficina.
- Significado:
  - `DIAG`: diagnostico tecnico do kart.
  - `26A`: identificador do modelo/projeto RL Kart 26A.
- Fonte de dados: `KartTelemetry`.
- Comportamento:
  - Mostra `READY TO DRIVE` quando `canLeavePit(telemetry)` permite liberacao.
  - Mostra `PIT VALIDATION` quando ainda existe etapa pendente.
  - Exibe marcha atual e nivel de bateria.

## Convencao

- Elementos deste documento podem parecer "projetores", telas ou hologramas, mas devem ser tratados como interfaces tecnicas de cena.
- Uma interface tecnica pode ser visualmente cenografica, desde que seja alimentada por dados reais do contrato de telemetria.
- Textos decorativos sao permitidos apenas quando nao comunicam status operacional.
