# Historico De Etapas

## 2026-05-13

### Etapa 1 - Remocao do cone azul frontal

- Arquivo principal: `src/components/realsim/RealKart.tsx`.
- Alteracao: removido o bloco `Nose cone`.
- Resultado esperado: frente do kart fica limpa, mantendo o arco/estrutura do chassi.

### Etapa 2 - Estribos laterais

- Arquivo principal: `src/components/realsim/RealKart.tsx`.
- Alteracao: side pods azuis substituidos por estribos laterais em aluminio polido.
- Marcador: `TASK-SIDESTEPS-ONLY`.
- Ajuste posterior: estribos encurtados e recuados para ficarem atras da linha da roda dianteira.

### Etapa 3 - Rodas e calotas

- Arquivo principal: `src/components/realsim/parts/Wheels.tsx`.
- Alteracoes:
  - Rodas dianteiras estreitas e traseiras largas.
  - Pivots centralizados no cubo.
  - Calotas em aluminio polido no mesmo acabamento dos estribos.
  - Calotas deslocadas para fora da face da roda.
  - Aneis `torusGeometry` corrigidos para nao cortar visualmente pneu/aro.
- Tentativa descartada: design futurista turbofan/carbono.

### Etapa 4 - Motor removivel e sala acustica

- Arquivos:
  - `src/components/realsim/parts/MotorAssembly.tsx`
  - `src/components/realsim/Workshop.tsx`
- Alteracoes:
  - Criado motor removivel com pivot na base inferior central.
  - Criada sala acustica dentro da oficina.
  - Criada bancada/dinamometro de teste usando o mesmo motor.

### Etapa 5 - Conversao para motor Wankel

- Arquivo principal: `src/components/realsim/parts/MotorAssembly.tsx`.
- Alteracao: motor 2T substituido por Wankel/rotativo.
- Itens incluidos:
  - Carcaca epitrocoidal.
  - Rotor triangular em corte tecnico.
  - Eixo excentrico.
  - Vedacoes de apice.
  - Admissao, escape, dupla ignicao e arrefecimento.
- Sinalizacao atualizada em `Workshop.tsx`: `SALA ACUSTICA · TESTE MOTOR WANKEL`.

### Etapa 6 - Sistema de documentacao

- Diretorio: `analise-tecnica/documentacao-partes/`.
- Objetivo: manter rastreabilidade tecnica de partes, arquivos, pivots e tarefas.

### Etapa 7 - Interfaces tecnicas de cena

- Arquivos:
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- Alteracoes:
  - Paineis superiores deixaram de ser textos fixos e passaram a usar `KartTelemetry`.
  - `MODULES OK` agora alterna com `MODULES CHECK` conforme checklist real de modulos.
  - Painel de telemetria exibe velocidade, marcha, bateria, freio e direcao.
  - Console `DIAG 26A` passou a exibir estado real de validacao, marcha e bateria.

### Etapa 8 - Refinamento da sala acustica Wankel

- Arquivo principal: `src/components/realsim/Workshop.tsx`.
- Alteracoes:
  - Sala acustica recebeu porta/vidro tecnico com moldura de vedacao.
  - Paineis acusticos ganharam relevo para melhor leitura de isolamento.
  - Criado sistema visual de exaustao com duto, grelha, flange e luz de status.
  - Adicionados microfones/sensores de medicao acustica ao redor da bancada.
  - Adicionada tela interna com leitura de dB, RPM, array de microfones e celula de carga.
  - Bancada ganhou detalhe visual de carga/dinamometro.

### Etapa 9 - Acesso direto a sala acustica

- Arquivos:
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/CameraController.tsx`
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- Alteracoes:
  - Criado foco de cena separado do foco modular do kart.
  - Adicionado botao `Sala Acustica` na barra de focos.
  - Camera passa a mirar diretamente a sala de teste Wankel.
  - Focos de modulo continuam preservando labels, cabos, raio-X e auditoria.

### Etapa 10 - Som e painel de teste da bancada Wankel

- Arquivos:
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/parts/MotorAssembly.tsx`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - `src/components/realsim/engineTest.ts`
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- Alteracoes:
  - Criado estado local de teste da bancada Wankel.
  - Criado audio sintetizado do motor de teste via Web Audio.
  - Adicionado painel externo com ligar/parar, audio, aceleracao, RPM, saude, temperatura e carga.
  - Sala acustica passou a refletir o teste em leitura interna, luz de status e bancada.
  - O teste da bancada permanece separado dos modulos C# e de `KartTelemetry`.

### Etapa 11 - Iluminacao da sala e contato das rodas

- Arquivo principal: `src/components/realsim/Workshop.tsx`.
- Alteracoes:
  - Plataforma de inspecao foi nivelada ao piso para nao atravessar visualmente os pneus.
  - Outline/anel RL da plataforma foi reposicionado para ficar apenas acima do piso.
  - Materiais internos da sala acustica foram clareados sem perder o visual industrial.
  - Sala acustica recebeu luzes internas adicionais para vidro, bancada, duto e paineis.
  - Luz de status da bancada foi reforcada quando o teste Wankel esta rodando.

### Etapa 12 - Primeira pista em escala para o RL Kart 26A

- Arquivos principais:
  - `src/components/simulator/track.ts`
  - `src/components/simulator/trackConfig.json`
  - `src/components/simulator/TrackModel.tsx`
  - `src/components/simulator/KartRig.tsx`
  - `src/components/simulator/KartModel.tsx`
  - `src/components/simulator/AIKart.tsx`
  - `src/components/simulator/GhostKart.tsx`
  - `src/components/simulator/RecordedRace.tsx`
- Alteracoes:
  - Criado contrato de superficie da pista para contato dos pneus.
  - Pista ajustada para um kartodromo compacto em escala de metros.
  - Asfalto deixou de ser renderizado acima do ponto de contato.
  - Zebras, linhas e marcadores passaram a usar apenas offset de decalque.
  - Player, IA, fantasma e replay passaram a consultar a mesma altura de pista.
  - Rodas do kart procedural da corrida passaram a usar `wheelRadius = 0.14`.
  - Pads de boxes foram nivelados para nao ficarem acima do plano trafegavel.
  - Circuito foi ampliado com mais curvas, chicane tecnica e hairpins.
  - Adicionadas muretas, postes e cercas/rede de contencao externas para conter pecas soltas antes da area de torcida.

### Etapa 13 - Integracao de sons fornecidos

- Arquivos principais:
  - `src/components/audio/audioAssets.ts`
  - `src/components/simulator/useSimAudio.ts`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - `src/components/realsim/hooks/usePresentationRiserAudio.ts`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `public/sounds/`
- Alteracoes:
  - MP3 fornecidos foram publicados em `public/sounds/` com nomes seguros para URL.
  - Simulador passou a usar camadas reais de kart passando, torcida ambiente, torcida na curva e bandeirada.
  - Audio `015522_Go Kart Racing Outdoors` foi integrado como camada de carros ao lado da protagonista.
  - Bancada Wankel passou a usar o som de motor fornecido como camada principal.
  - Riser de apresentacao toca quando os modulos C# ficam prontos para liberacao.
  - Creditos dos audios Pixabay foram registrados no inventario tecnico.

### Etapa 14 - Leitura visual da pista de corrida

- Arquivos principais:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/TrackModel.tsx`
  - `src/components/simulator/Grandstand.tsx`
- Alteracoes:
  - Camera inicial reposicionada para uma vista alta e aberta do circuito.
  - Pista recebeu bordas continuas, zebras em ambos os lados e zonas de escape coloridas.
  - Grid de largada ganhou slots marcados e portal com identificacao `KARTODROMO RL 26A`.
  - Curvas principais ganharam placas grandes com nome e chevrons direcionais.
  - Perimetro de contencao recebeu placas visuais para separar pista e torcida.
  - Arquibancada passou a mirar o centro da pista e recebeu banner, cobertura, materiais mais claros e bandeiras.
  - Contrato de superficie foi preservado: asfalto continua no plano de contato e marcas de solo usam apenas offsets pequenos.

### Etapa 15 - Reorganizacao de navegacao, arena e oficina

- Arquivos principais:
  - `src/routes/index.tsx`
  - `src/routes/simulator.tsx`
  - `src/routes/simulador-real.tsx`
  - `src/components/rl/Nav.tsx`
  - `src/components/rl/Hero.tsx`
  - `src/components/rl/OperationsDashboard.tsx`
  - `src/components/rl/ConfirmHomeExit.tsx`
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/realsim/RealSimulator.tsx`
- Alteracoes:
  - Home deixou de renderizar a arena de corrida como caixa interna.
  - Criada central operacional para replay, metricas, telemetria, historicos e estatisticas.
  - Acesso de corrida passou a ser apresentado como `Arena`.
  - Acesso de `Simulador Real` passou a ser apresentado como `Oficina`.
  - Item redundante `Simulador` foi removido do menu principal.
  - Arena e oficina passaram a abrir como experiencias full body.
  - Ambas receberam botao de retorno para home com confirmacao via dialogo padronizado.

### Etapa 16 - Monitor de teste Wankel e navegacao da oficina

- Arquivos principais:
  - `src/components/realsim/CameraController.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- Alteracoes:
  - Oficina recebeu zoom por scroll do mouse no Canvas.
  - Vista inicial fullscreen da oficina foi aberta para reduzir aproximacao excessiva.
  - Criado monitor/balcao `Wankel Test Bench` dentro da cena.
  - Controles Wankel em fullscreen migraram do overlay externo para botoes touchscreen no monitor.
  - Monitor exibe RPM, temperatura, carga, saude, audio, aceleracao e grafico simples de teste.
  - Adicionados presets touchscreen de stress e capacidade.
  - Audio Wankel passou a conectar o MP3 ao grafo Web Audio com gain dedicado.

### Etapa 17 - Atualizacao da marca visual

- Arquivos principais:
  - `src/components/rl/Logo.tsx`
  - `public/logo_kart_A26.png`
- Alteracoes:
  - Logo textual do header e footer foi substituido pela marca horizontal fornecida do `RL KART 26A`.
  - Componente `Logo` passou a usar imagem servida pela pasta `public`.
  - Tamanho responsivo do logo foi ajustado para preservar leitura e encaixe no layout.

### Etapa 18 - Cameras imersivas e visor de engenharia da Arena

- Arquivos principais:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/KartRig.tsx`
  - `src/components/simulator/HelmetHud.tsx`
  - `src/components/simulator/KartModel.tsx`
  - `src/components/simulator/Driver.tsx`
  - `src/components/simulator/gestureInput.ts`
- Alteracoes:
  - Arena manteve o split-screen 2x2 original com `COCKPIT`, `CHASE`, `NOSE` e `TOP-DOWN`.
  - Single-view ganhou cameras adicionais `DRIVER` e `HELMET`.
  - Camera de capacete recebeu visor tecnico com telemetria, reticulo e mensagens da engenharia.
  - Radio de engenharia usa legendas contextuais e voz via `SpeechSynthesis` quando disponivel.
  - Kart e corredora procedural passaram a exibir identidade `RAYSSA`, numero `77` e pneus `BLENDER TIRES`.
  - Adversarios preservam nomes e cores atuais, usando a mesma base visual de kart com numeracao propria.
  - Criado contrato inicial para futura entrada por gestos via webcam sem alterar o controle por teclado.

### Etapa 19 - Modo Engenharia Observador e progressao de acesso

- Arquivos principais:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/KartRig.tsx`
  - `src/components/simulator/EngineeringPitWall.tsx`
  - `src/components/simulator/engineeringProgressStore.ts`
  - `src/components/simulator/useKartControls.ts`
  - `src/components/simulator/Leaderboard.tsx`
- Alteracoes:
  - Arena passa a iniciar em modo `Equipe Engenharia`, com Rayssa pilotando de
    forma autonoma e o usuario atuando como observador tecnico.
  - Controle direto por teclado fica bloqueado no modo observador, preservando
    atalhos de cameras, split-screen, replay e paineis.
  - Criada progressao persistida por vitorias P1 de Rayssa: assistente,
    assistente senior, lider de equipe e operacao direta autorizada.
  - Controle direto atual fica disponivel apenas apos 10 vitorias de Rayssa.
  - Adicionado pit wall `Autonomy Racing` com monitores, leitura de modulos,
    telemetria, ranking e proximo desbloqueio.
  - Podium passa a exibir papel atual da equipe, total de vitorias e proximo
    marco de acesso.

### Etapa 20 - Classificacao, grid e eventos de corrida

- Arquivos principais:
  - `src/components/simulator/raceStore.ts`
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/QualifyingPanel.tsx`
  - `src/components/simulator/StartLightsOverlay.tsx`
  - `src/components/simulator/PitServiceOverlay.tsx`
  - `src/components/simulator/track.ts`
  - `src/components/simulator/KartRig.tsx`
  - `src/components/simulator/AIKart.tsx`
  - `src/components/simulator/useSimAudio.ts`
  - `src/components/audio/audioAssets.ts`
  - `public/sounds/race/`
- Alteracoes:
  - Arena passa a ter fases de sessao para setup, classificacao, grid/countdown,
    corrida e final.
  - Classificacao calcula 3 tempos por piloto e define ranking, Pole Position e
    grid de largada.
  - Karts usam posicoes de grid derivadas da pista e ficam bloqueados ate o fim
    do semaforo regressivo.
  - Adicionado overlay de luzes de largada e painel de classificacao.
  - Adicionado pit service simplificado ao entrar no Pit Lane em baixa
    velocidade.
  - Novos assets em `public/sounds/race/` foram integrados aos eventos de
    semaforo, setor, volta, melhor volta, volta final, bandeirada e podium.

### Etapa 21 - Classificacao alternada, loading do grid e sala acustica externa

- Arquivos principais:
  - `src/components/simulator/raceStore.ts`
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/QualifyingSessionPanel.tsx`
  - `src/components/simulator/QualifyingPanel.tsx`
  - `src/components/simulator/GridLoadingOverlay.tsx`
  - `src/components/simulator/useSimAudio.ts`
  - `src/components/realsim/Workshop.tsx`
  - `src/styles.css`
  - `public/image_1030ed13.png`
- Alteracoes:
  - Classificacao passou a ser alternada por rodada, com Rayssa abrindo cada
    ciclo e todos os competidores recebendo exatamente 3 voltas.
  - Ranking classificatorio passou a ser calculado pela soma das 3 voltas.
  - Durante a classificacao, torcida visual e sonora fica desabilitada para
    manter apenas motor, pista e eventos pertinentes.
  - Painel de sessao exibe competidor ativo, retorno ao Pit Box e tempos
    parciais para analise da equipe.
  - Modal final mostra tabela alfabetica, corte vermelho animado, total e grid
    final.
  - Entrada no grid oficial ganhou tela de carregamento com fundo
    `image_1030ed13.png`, logo `logo_kart_A26.png` e barra de progresso.
  - Sala acustica recebeu painel externo interativo no vidro e leituras
    frontais voltadas para fora da cabine.

### Etapa 22 - Refino oficinal dos karts, clear glass e DLLs de aula

- Arquivos principais:
  - `src/components/simulator/KartModel.tsx`
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/parts/MotorAssembly.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - `src/components/realsim/dll/DllImportPanel.tsx`
  - `src/lib/csharp/dllInspector.ts`
  - `public/docs/CSHARP_MODULE_CONTRACT.md`
  - `public/docs/DLL_STUDENT_GUIDE.md`
- Alteracoes:
  - Karts da arena foram refinados para parecerem derivados do modelo oficinal,
    preservando fisica, cameras, driver, livery e animacoes existentes.
  - Sala acustica trocou o vidro frontal fosco por clear glass com
    `depthWrite={false}`, mantendo textos e painel externo em camadas opacas
    separadas.
  - Motor Wankel da bancada ganhou rotor, eixo, polia e dinamometro animados
    durante teste ativo, com vibracao proporcional ao acelerador.
  - Teste Wankel recebeu controle de volume seguro no painel externo e no
    overlay tecnico.
  - Validador de DLLs passou a bloquear nome de arquivo incorreto para o slot
    selecionado.
  - Criado guia dos alunos com contrato, funcoes obrigatorias, criterios de
    bloqueio, checklist e boas praticas.
