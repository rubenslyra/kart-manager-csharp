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

### Controle de foco `Sala Acustica`

- Codigo:
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/CameraController.tsx`
  - `src/components/realsim/RealSimulator.tsx`
- Funcao: permitir que o usuario acesse visualmente a sala acustica Wankel sem procurar manualmente pela cena.
- Comportamento:
  - Botao `Sala Acustica` move a camera para a sala de teste Wankel.
  - O foco de cena e separado do foco modular do kart.
  - Ao focar a sala, o foco de modulo e limpo.
  - Ao focar bateria, freios, direcao, ignicao ou cambio, o foco de sala e limpo.
  - O botao `reset` retorna a camera para a vista inicial.
- Requisito tecnico:
  - Nao adicionar a sala acustica como modulo do kart.
  - Preservar labels, cabos, raio-X e auditoria como recursos dos modulos do kart.

### Painel externo `Teste Motor Wankel`

- Codigo:
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - `src/components/realsim/engineTest.ts`
- Funcao: controlar o teste local da bancada Wankel na sala acustica.
- Dados locais:
  - `running`
  - `throttle`
  - `rpm`
  - `health`
  - `temperature`
  - `load`
  - `audioEnabled`
- Comportamento:
  - Botao `Ligar bancada` inicia o teste local.
  - Botao `Audio ON/OFF` inicia ou para o som do motor da bancada.
  - Slider de aceleracao controla RPM, carga, temperatura e timbre do audio.
  - Leituras de RPM, saude, temperatura e carga aparecem fora da cena, em painel de controle.
  - A sala acustica reflete o estado do teste em luzes, leitura interna e bancada.
  - O audio usa o MP3 `wankel-test-room-engine.mp3` como camada principal e mantem o sintetizador Web Audio como apoio/fallback.
  - O mesmo gesto de audio habilita o riser de apresentacao do carrinho quando o checklist fica completo.
- Requisito tecnico:
  - O teste da bancada nao altera `KartTelemetry`.
  - O audio depende de gesto do usuario por restricao dos navegadores.
  - Os MP3 sao servidos por `public/sounds/` para nao entrarem no bundle JS.

### Audio de apresentacao e corrida

- Codigo:
  - `src/components/audio/audioAssets.ts`
  - `src/components/realsim/hooks/usePresentationRiserAudio.ts`
  - `src/components/simulator/useSimAudio.ts`
- Assets:
  - `public/sounds/wankel-test-room-engine.mp3`
  - `public/sounds/kart-tested-presentation-riser.mp3`
  - `public/sounds/go-kart-passing.mp3`
  - `public/sounds/crowd-checkered-flag.mp3`
  - `public/sounds/fans-in-the-stadium-low.mp3`
  - `public/sounds/crowd-near-turn.mp3`
  - `public/sounds/go-kart-racing-outdoors.mp3`
- Comportamento:
  - `kart-tested-presentation-riser.mp3` toca quando o checklist de modulos fica completo, apos audio habilitado por gesto do usuario.
  - `go-kart-passing.mp3` toca em loop no simulador como camada de carros em corrida.
  - `go-kart-racing-outdoors.mp3` sobe quando outros karts ficam ao lado da protagonista.
  - `fans-in-the-stadium-low.mp3` e a torcida ambiente base em volume baixo.
  - `crowd-near-turn.mp3` sobe quando a camera/kart se aproxima da arquibancada.
  - `crowd-checkered-flag.mp3` toca na fase final/replay de bandeirada.
- Creditos:
  - `freesound_community` / Pixabay: som do motor.
  - `ALEXIS_GAMING_CAM` / Pixabay: Riser long Classique 1.
  - `Mauricio Povoa` / Pixabay: Som da torcida.
  - `Mauricio Povoa` / Pixabay: Fans_in_the_Stadium.
  - `Alexander Jauk` / Pixabay: Go-Kart Passing.
  - Pixabay: 015522_Go Kart Racing Outdoors.

## Convencao

- Elementos deste documento podem parecer "projetores", telas ou hologramas, mas devem ser tratados como interfaces tecnicas de cena.
- Uma interface tecnica pode ser visualmente cenografica, desde que seja alimentada por dados reais do contrato de telemetria.
- Textos decorativos sao permitidos apenas quando nao comunicam status operacional.
