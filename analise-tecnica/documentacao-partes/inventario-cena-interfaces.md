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

### Monitor/balcao `Wankel Test Bench`

- Codigo:
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - `src/components/realsim/engineTest.ts`
- Funcao: controlar e monitorar o teste local da bancada Wankel a partir de um monitor tecnico posicionado em um balcao da oficina.
- Dados locais:
  - `running`
  - `throttle`
  - `rpm`
  - `health`
  - `temperature`
  - `load`
  - `audioEnabled`
- Comportamento:
  - Monitor na cena usa area dominante para informacoes, telemetria, graficos simples e dados de stress/capacidade.
  - Faixa lateral do monitor contem controles touchscreen reais, incluindo ligar/parar, audio, stress, capacidade e aceleracao.
  - Controles touchscreen chamam os mesmos estados locais do teste Wankel usados pela sala acustica.
  - No modo fullscreen da Oficina, o antigo painel externo de teste fica oculto para evitar controles fora da area de trabalho.
  - A sala acustica reflete o estado do teste em luzes, leitura interna e bancada.
  - A sala acustica possui painel externo no vidro com comandos de ligar/parar, audio, stress, capacidade e aceleracao, voltado para a camera externa da opcao `SALA ACUSTICA`.
  - Textos e leituras frontais da sala acustica ficam orientados para fora da cabine, evitando leitura espelhada pelo lado interno do vidro.
  - O audio usa o MP3 `wankel-test-room-engine.mp3` como camada principal conectada ao grafo Web Audio e mantem o sintetizador Web Audio como apoio/fallback.
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

## Arena De Corrida

### Cameras imersivas e split-screen

- Codigo:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/KartRig.tsx`
- Comportamento:
  - O split-screen permanece restrito as quatro cameras historicas:
    - `COCKPIT`
    - `CHASE`
    - `NOSE`
    - `TOP-DOWN`
  - A visao em tela unica adiciona:
    - `DRIVER`: camera na perspectiva da corredora;
    - `HELMET`: camera de capacete/visor.
  - `FREE` continua usando OrbitControls quando o split esta desligado.
- Requisito tecnico:
  - Novas cameras de single-view nao devem alterar a composicao 2x2 do split.
  - A lista de cameras pode crescer, mas o render do split deve usar apenas as quatro primeiras cameras de competicao.

### Visor de capacete e radio da engenharia

- Codigo:
  - `src/components/simulator/HelmetHud.tsx`
  - `src/components/simulator/SimulatorScene.tsx`
- Fonte de dados:
  - `Telemetry` do simulador.
  - `ExtendedPhysics` calculado em `KartRig`.
  - Estado de volta/progresso da corrida.
- Comportamento:
  - Ativo apenas nas cameras `DRIVER` e `HELMET`.
  - Exibe velocidade, marcha, RPM, grip, volta, bateria, reticulo e vinheta de visor.
  - Mensagens de engenharia sao selecionadas por contexto:
    - largada/ritmo;
    - reta/alta velocidade;
    - baixa aderencia/drift;
    - fechamento de setor/volta.
  - Quando o audio da Arena esta habilitado e o navegador suporta, usa `SpeechSynthesis` com voz em `pt-BR`.
  - Quando voz nao esta disponivel ou e bloqueada, mantem o canal visual por legenda.
- Requisito tecnico:
  - O radio nao depende de MP3 novo.
  - A voz sintetizada depende de suporte/permissao do navegador e deve falhar sem quebrar a corrida.

### Preparacao de controle por gestos

- Codigo:
  - `src/components/simulator/gestureInput.ts`
  - `src/components/simulator/useKartControls.ts`
- Comportamento:
  - Define contrato inicial `GestureInputState` e `GestureInputStatus`.
  - `useKartControls` passa a aceitar uma fonte externa opcional no mesmo formato de entrada do teclado.
  - A webcam real permanece desativada nesta etapa.
- Requisito tecnico:
  - O controle por teclado continua sendo o padrao.
  - Implementacao real de gestos deve plugar no contrato existente, provavelmente via `navigator.mediaDevices.getUserMedia` e detector de maos/pose em tarefa posterior.

### Modo Engenharia Observador e pit wall

- Codigo:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/KartRig.tsx`
  - `src/components/simulator/EngineeringPitWall.tsx`
  - `src/components/simulator/engineeringProgressStore.ts`
  - `src/components/simulator/useKartControls.ts`
- Funcao: iniciar a Arena como uma experiencia de equipe tecnica, na qual o
  usuario acompanha a corrida a partir de uma estacao de engenharia enquanto
  Rayssa pilota o kart de forma autonoma.
- Modos:
  - `ENGINEERING_OBSERVER`: modo inicial, com controle direto bloqueado e
    cameras/monitores liberados para observacao.
  - `DRIVER_CONTROL`: modo de pilotagem direta, liberado somente depois de 10
    vitorias de Rayssa em primeiro lugar.
- Progressao persistida em `localStorage`:
  - 0 a 3 vitorias: engenharia mecanica assistente.
  - 4 a 5 vitorias: engenharia assistente senior.
  - 6 a 9 vitorias: lider de equipe.
  - 10 ou mais vitorias: operacao direta autorizada.
- Comportamento:
  - Rayssa e registrada como protagonista da equipe no ranking.
  - Em modo observador, `KartRig` usa controle autonomo baseado na pista e o
    teclado de direcao/aceleracao fica desabilitado.
  - Atalhos de camera, split-screen, replay, audio e paineis continuam
    disponiveis ao usuario.
  - `EngineeringPitWall` mostra posto `Autonomy Racing`, cadeiras/monitores,
    estado dos modulos, leitura de corrida, ranking e proximo desbloqueio.
  - Ao final da corrida, vitorias P1 de Rayssa incrementam a progressao.
- Requisito tecnico:
  - Nao usar marcas reais protegidas como identidade de equipe.
  - O painel de qualidade/C# deve se apoiar nos estados reais de modulos e
    telemetria existentes, sem inventar integracoes externas.
  - O controle manual atual deve permanecer disponivel quando o modo
    `DRIVER_CONTROL` estiver desbloqueado.

### Classificacao, grid, largada e pit lane

- Codigo:
  - `src/components/simulator/raceStore.ts`
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/QualifyingPanel.tsx`
  - `src/components/simulator/QualifyingSessionPanel.tsx`
  - `src/components/simulator/GridLoadingOverlay.tsx`
  - `src/components/simulator/StartLightsOverlay.tsx`
  - `src/components/simulator/PitServiceOverlay.tsx`
  - `src/components/simulator/track.ts`
  - `src/components/simulator/KartRig.tsx`
  - `src/components/simulator/AIKart.tsx`
- Funcao: estruturar a Arena em fases de sessao antes da corrida principal.
- Fases:
  - `SETUP`;
  - `QUALIFYING`;
  - `QUALIFYING_COMPLETE`;
  - `GRID_LOADING`;
  - `GRID_COUNTDOWN`;
  - `RACE`;
  - `FINISHED`.
- Classificacao:
  - Cada piloto recebe exatamente 3 tempos de volta.
  - As tentativas sao alternadas por rodada, com Rayssa abrindo cada ciclo.
  - Durante a classificacao a torcida visual/sonora fica desligada; permanecem
    motores, pista e eventos pertinentes.
  - `QualifyingSessionPanel` mostra competidor na pista, retorno ao Pit Box e
    tempos parciais da Rayssa para analise da equipe.
  - A soma das 3 voltas define o ranking classificatorio.
  - O primeiro colocado e marcado como Pole Position.
  - `QualifyingPanel` exibe tabela alfabetica, tarja vermelha sobre tempos,
    coluna de total e ranking final para grid.
- Grid e largada:
  - `GridLoadingOverlay` usa `public/image_1030ed13.png` como fundo,
    `public/logo_kart_A26.png` como logo central e barra de progresso antes do
    grid oficial.
  - `track.ts` expoe `gridPose` para alinhar logica e slots visuais.
  - Karts ficam bloqueados durante `GRID_COUNTDOWN`.
  - `StartLightsOverlay` exibe 3, 2, 1 e START antes de liberar `RACE`.
- Pit lane:
  - `track.ts` expoe uma zona simples de pit lane.
  - `KartRig` detecta entrada em baixa velocidade e inicia manutencao.
  - `PitServiceOverlay` exibe manutencao rapida de pneus, freio e bateria.

### Assets de evento de corrida

- Codigo:
  - `src/components/audio/audioAssets.ts`
  - `src/components/simulator/useSimAudio.ts`
- Assets:
  - `public/sounds/race/start_light_03-02-01-start.ogg`
  - `public/sounds/race/lap_complete.wav`
  - `public/sounds/race/sector_time.mp3`
  - `public/sounds/race/best_lap.mp3`
  - `public/sounds/race/final_lap.mp3`
  - `public/sounds/race/finish_flag.mp3`
  - `public/sounds/race/podium_arrival.mp3`
- Mapeamento:
  - semaforo/largada -> `start_light_03-02-01-start.ogg`;
  - setor -> `sector_time.mp3`;
  - volta completa -> `lap_complete.wav`;
  - melhor volta -> `best_lap.mp3`;
  - volta final -> `final_lap.mp3`;
  - bandeirada -> `finish_flag.mp3`;
  - chegada ao podium -> `podium_arrival.mp3`.
- Requisito tecnico:
  - O audio depende de gesto do usuario por restricoes do navegador.
  - Cada evento mantem fallback sintetico quando o asset falha ou nao foi
    habilitado.

### Karts de arena alinhados ao modelo oficinal

- Codigo:
  - `src/components/simulator/KartModel.tsx`
- Funcao: manter o kart procedural da arena compativel com corrida, replay,
  camera e fisica, mas com linguagem visual coerente com o kart oficinal.
- Elementos:
  - chassi tubular escuro com trilhos superiores, struts e roll hoop;
  - degraus laterais de aluminio com textura/ridges;
  - bucket seat visivel atras da corredora;
  - volante tecnico com hub emissivo;
  - motor traseiro compacto inspirado em Wankel, com housing triangular, rotor,
    ribs e exaustao metalica.
- Requisito tecnico:
  - A API publica do `KartModel` e a hierarquia de refs de rodas/direcao devem
    permanecer estaveis para `KartRig`, `AIKart` e `RecordedRace`.

### Sala acustica clear glass e teste Wankel seguro

- Codigo:
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/parts/MotorAssembly.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
- Funcao: permitir observar o motor Wankel na sala acustica sem filtro fosco,
  com indicacao visual clara de funcionamento e controle de conforto auditivo.
- Elementos:
  - vidro frontal em `meshPhysicalMaterial` transparente, com opacidade baixa,
    transmission/clearcoat e `depthWrite={false}`;
  - textos e leituras externos com fundos opacos localizados, sem camada ampla
    sobre o vidro;
  - rotor, eixo, polia e dinamometro animados quando `engineTest.running` esta
    ativo;
  - vibracao procedural do conjunto proporcional a `engineTest.throttle`;
  - slider `Volume seguro` no painel externo e no overlay tecnico.
- Requisito tecnico:
  - O painel externo deve continuar clicavel e a visibilidade interna do motor
    nao deve depender de fundo semitransparente sobre o vidro.

### Arena em full body

- Codigo:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/routes/simulator.tsx`
- Funcao: entregar a Arena como experiencia full body, equivalente ao padrao
  visual da Oficina, sem coluna lateral comprimindo a corrida.
- Comportamento:
  - quando `SimulatorScene` recebe `fullscreen`, o canvas ocupa `h-screen` e
    `w-full`;
  - header interno e coluna lateral deixam de participar do fluxo visual;
  - controles essenciais ficam em overlay compacto sobre a cena;
  - modo embutido nao-fullscreen preserva a composicao antiga com paineis
    laterais.
- Requisito tecnico:
  - A mudanca deve permanecer restrita ao modo fullscreen e nao deve alterar
    fisica, IA, cameras, fases de corrida ou regras de replay.

### DLLs C# de alunos

- Codigo:
  - `src/lib/csharp/dllInspector.ts`
  - `src/components/realsim/dll/DllImportPanel.tsx`
  - `public/docs/CSHARP_MODULE_CONTRACT.md`
  - `public/docs/DLL_STUDENT_GUIDE.md`
- Funcao: orientar e validar entregas de DLLs C# para os modulos didaticos do
  RL Kart 26A.
- Validacoes bloqueantes:
  - cabecalho PE valido;
  - metadados .NET/BSJB presentes;
  - nome do arquivo igual ao esperado para o slot selecionado;
  - `AssemblyName`, `ModuleId`, versao SemVer e funcoes obrigatorias presentes
    nos metadados.
- Requisito tecnico:
  - O frontend ainda executa cenario simulado via `mockBridge`; execucao real
    da DLL depende de host .NET externo via WebSocket.

## Convencao

- Elementos deste documento podem parecer "projetores", telas ou hologramas, mas devem ser tratados como interfaces tecnicas de cena.
- Uma interface tecnica pode ser visualmente cenografica, desde que seja alimentada por dados reais do contrato de telemetria.
- Textos decorativos sao permitidos apenas quando nao comunicam status operacional.
