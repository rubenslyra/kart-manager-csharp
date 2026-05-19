# Tarefa Atual

Status: aberta
Aberta em: 2026-05-19

## Titulo

Adicionar qualificacao, grid de largada, pit lane e eventos de corrida

## Objetivo

Implementar uma etapa de classificacao antes da corrida principal, onde cada
piloto realiza 3 voltas sozinho na pista para registrar tempos. Os melhores
tempos definem a ordem do grid e a Pole Position. A corrida deve iniciar com
contador regressivo/semaforo de largada, e a experiencia deve incluir retorno ao
Pit Box apos classificatoria e manutencao no Pit Lane durante a corrida.

## Escopo Inicial

- Ler e consolidar as instrucoes adicionadas pelo usuario na nova estrutura de
  pastas e no documento exibido na imagem.
- Rastrear ao final da etapa a nova estrutura de assets em `public/sounds/race/`.
- Implementar ou planejar fase de qualificacao/classificacao:
  - cada corredor faz 3 voltas sozinho na pista;
  - tempos de volta sao registrados;
  - melhor tempo de cada piloto define ranking classificatorio;
  - ranking define posicoes no grid;
  - melhor tempo garante Pole Position.
- Implementar ou planejar posicao inicial no grid:
  - karts devem largar em ordem de classificacao;
  - Rayssa e adversarios devem respeitar suas posicoes;
  - grid deve ser integrado a pista e ao sistema de corrida atual.
- Implementar ou planejar retorno ao Pit Box:
  - apos qualificacao, piloto retorna ao seu Pit Box;
  - durante a corrida, entrada no Pit Lane deve permitir manutencao da equipe.
- Implementar ou planejar eventos de corrida e audio:
  - contador regressivo;
  - semaforo de largada;
  - largada da corrida;
  - volta completa;
  - tempo de setor;
  - melhor volta;
  - volta final;
  - bandeirada;
  - chegada ao podium.
- Considerar os assets ja adicionados:
  - `public/sounds/race/start_light_03-02-01-start.ogg`
  - `public/sounds/race/lap_complete.wav`
  - `public/sounds/race/sector_time.mp3`
  - `public/sounds/race/best_lap.mp3`
  - `public/sounds/race/final_lap.mp3`
  - `public/sounds/race/finish_flag.mp3`
  - `public/sounds/race/podium_arrival.mp3`
- Nao executar implementacao nesta etapa.
- Nao fazer commit automatico apenas por iniciar a tarefa.

## Estado Inicial Do Git

Verificado em 2026-05-19:

- Branch: `main`.
- Arquivos rastreados: sem modificacoes reportadas por `git status --short --branch`.
- Artefatos nao rastreados existentes antes da tarefa:
  - `chamado-correções-erros-prints/`
  - `image_1030ed13.png`
  - `sounds-trilha/`
- Nova estrutura nao rastreada relacionada a esta tarefa:
  - `public/sounds/race/`

## Nova Estrutura De Assets Identificada

- `public/sounds/race/best_lap.mp3`
- `public/sounds/race/final_lap.mp3`
- `public/sounds/race/finish_flag.mp3`
- `public/sounds/race/lap_complete.wav`
- `public/sounds/race/podium_arrival.mp3`
- `public/sounds/race/sector_time.mp3`
- `public/sounds/race/start_light_03-02-01-start.ogg`

## Arquivos Provaveis

- `src/components/audio/audioAssets.ts`
- `src/components/simulator/useSimAudio.ts`
- `src/components/simulator/raceStore.ts`
- `src/components/simulator/replayRecordStore.ts`
- `src/components/simulator/SimulatorScene.tsx`
- `src/components/simulator/KartRig.tsx`
- `src/components/simulator/AIKart.tsx`
- `src/components/simulator/RaceSetup.tsx`
- `src/components/simulator/Leaderboard.tsx`
- `src/components/simulator/PitBoxes.tsx`
- `src/components/simulator/TrackModel.tsx`
- `src/components/simulator/track.ts`
- componentes novos para qualificacao, grid, semaforo, pit lane e eventos
- documentacao em `analise-tecnica/documentacao-partes/`

## Riscos Iniciais

- O sistema atual finaliza corrida com base no `isPlayer`; qualificacao por
  piloto individual pode exigir separar fases de sessao.
- IA atual corre simultaneamente; classificacao individual pode exigir modo
  time-trial/autonomo isolado por piloto.
- Grid atual pode nao ter pontos discretos suficientes para todos os corredores.
- Pit Lane e Pit Box precisam interagir com a pista sem quebrar colisao,
  checkpoints ou replay.
- Contador/semaforo deve bloquear movimento antes da largada sem bloquear
  cameras, audio e UI.
- Novos assets de audio precisam entrar no catalogo sem duplicar sons existentes
  ou tocar sobreposto em excesso.
- A captura de tempos precisa ser consistente com voltas/checkpoints atuais.
- O modo Engenharia Observador implementado na tarefa anterior deve continuar
  funcionando.

## Checks Planejados

- `git status --short --branch` antes de qualquer edicao de codigo.
- Research de:
  - store de corrida e fases;
  - checkpoints/voltas;
  - IA e autopilot;
  - grid/track/pit boxes;
  - audio e assets de evento;
  - replay/podium;
  - modo Engenharia Observador.
- Plan tecnico com subtarefas, riscos, validacoes e criterios de aceite.
- Apos implementacao aprovada por `[Concluir RPI]`:
  - lint focado nos arquivos alterados;
  - `git diff --check`;
  - `npm run build`;
  - validacao manual da classificacao, grid, largada, audio, pit lane e corrida.

## Subtarefas

- Concluido: abrir tarefa formal e registrar escopo inicial.
- Concluido: receber `[Iniciar RPI]`.
- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: receber `[Concluir RPI]`.
- Concluido: implementar apos aprovacao do RPI.
- Concluido: validar alteracoes.
- Pendente: receber `[Finalizar Tarefa]`.
- Pendente: revisar diff final.
- Pendente: validar e fechar tarefa.

## RPI

Iniciado em 2026-05-19.

### Research

Concluido em 2026-05-19.

- Estado do git no inicio do RPI:
  - Branch `main`.
  - `analise-tecnica/tarefas/tarefa-atual.md` modificado pela abertura da tarefa.
  - Nova pasta nao rastreada relacionada a tarefa: `public/sounds/race/`.
  - Artefatos nao rastreados preexistentes e fora do escopo:
    - `chamado-correções-erros-prints/`
    - `image_1030ed13.png`
    - `sounds-trilha/`
- Documento/imagem do usuario:
  - A imagem mostra estrutura recomendada `public/sounds/race/` e mapeamento de
    eventos.
  - A estrutura real encontrada contem:
    - `start_light_03-02-01-start.ogg`
    - `lap_complete.wav`
    - `sector_time.mp3`
    - `best_lap.mp3`
    - `final_lap.mp3`
    - `finish_flag.mp3`
    - `podium_arrival.mp3`
  - Nao foram encontrados arquivos separados:
    - `start_light_02.wav`
    - `start_light_03.wav`
    - `race_start.wav`
  - Conclusao: a implementacao deve mapear largada/semaforo para o arquivo
    consolidado `start_light_03-02-01-start.ogg`.
- `src/components/simulator/raceStore.ts`
  - Store atual nao possui fases de sessao.
  - Estado atual cobre:
    - racers;
    - total de voltas;
    - `startedAt`;
    - `finished`;
    - setup;
    - checkpoint recente;
    - replay.
  - `RacerEntry` ja guarda:
    - `lap`;
    - `progress`;
    - `lastLapMs`;
    - `bestLapMs`;
    - `lapStartedAt`;
    - `finishTime`.
  - `updateProgress` calcula tempo de volta quando `lap` aumenta.
  - A corrida finaliza quando todos terminam ou quando um racer `isPlayer`
    termina.
  - O store atual serve de base para tempos, mas precisa de novos conceitos:
    - fase: setup, classificacao, pre-grid/countdown, corrida, finalizada;
    - resultados de qualificacao;
    - ordem de grid;
    - semaforo/countdown;
    - pit service/estado de pit.
- `src/components/simulator/KartRig.tsx`
  - Controla o kart da Rayssa/protagonista.
  - Usa checkpoints sequenciais de `CHECKPOINTS`.
  - Incrementa `lap.current` ao completar o ciclo de checkpoints.
  - Atualiza `raceStore.updateProgress` e `raceStore.updatePose`.
  - Hoje usa `spawnPose()` fixo no reset.
  - Ja possui `controlMode` manual/autopilot por causa da tarefa anterior.
  - Para largada/grid, precisa receber pose inicial configuravel e respeitar
    bloqueio de largada quando a fase for pre-grid/countdown.
  - Para classificacao solo, pode ser reaproveitado para Rayssa, mas os
    adversarios atualmente usam outro rig (`AIKart`).
- `src/components/simulator/AIKart.tsx`
  - IA atual corre simultaneamente.
  - Usa `startOffset`, `baseSpeed`, habilidades e curva da pista.
  - Incrementa lap por cruzamento `prevT > 0.85 && t.current < 0.15`, sem usar
    checkpoints sequenciais.
  - Registra pose/progresso no mesmo `raceStore`.
  - Para classificacao individual de adversarios, ha duas opcoes:
    - simular tempos deterministamente no store, sem renderizar cada volta;
    - adicionar modo visual/time-trial para um piloto por vez.
  - A primeira entrega recomendada deve simular ou calcular as voltas de
    qualificacao dos adversarios a partir dos perfis, porque renderizar todos os
    pilotos isolados em sequencia aumenta muito o escopo.
- `src/components/simulator/track.ts` e `trackConfig.json`
  - Pista tem `trackCurve`, `nearestOnTrack`, `CHECKPOINTS` e `spawnPose`.
  - `trackConfig.points[0]` e `START_GRID`.
  - Checkpoints atuais: `[0.1, 0.28, 0.48, 0.68, 0.86]`.
  - Nao existem utilitarios exportados para posicoes de grid/pit lane/pit box.
  - Recomenda-se adicionar helpers em `track.ts`:
    - `gridPose(index)`;
    - `pitBoxPose(index)`;
    - `pitLanePose`/zonas de pit;
    - `isInPitLane(position)` quando necessario.
- `src/components/simulator/TrackModel.tsx`
  - Ja desenha visualmente:
    - linha de largada/chegada;
    - slots de grid;
    - gantry `KARTODROMO RL 26A`;
    - placas `PIT LANE` em sponsor boards.
  - Os slots de grid sao apenas visuais, calculados localmente dentro do
    componente; a logica de corrida nao usa esses pontos.
  - Melhor caminho: extrair ou duplicar cuidadosamente a formula de grid para
    `track.ts`, mantendo o visual coerente.
- `src/components/simulator/PitBoxes.tsx`
  - Ja desenha boxes estaticos:
    - `TEAM 01`;
    - `TEAM 02`;
    - `TEAM 03`;
    - `TEAM 04`;
    - `RACE CONTROL`.
  - Nao existe estado/logica de entrada, retorno ou manutencao.
  - Pode receber realce por equipe/fase posteriormente.
  - Primeira entrega pode implementar pit return/maintenance como estado e UI,
    com zona simples perto dos boxes, sem animacao mecanica completa.
- `src/components/simulator/RaceSetup.tsx`
  - Modal atual apenas configura:
    - adversarios;
    - voltas;
    - agressividade;
    - frenagem;
    - ultrapassagem;
    - duracao do replay.
  - Botao `Iniciar corrida` apenas fecha `setupOpen`.
  - Precisa virar entrada para fluxo completo: iniciar classificacao ou pular
    para corrida com grid calculado.
- `src/components/simulator/SimulatorScene.tsx`
  - Compoe a Arena inteira.
  - Registra Rayssa como racer `player`.
  - Gera adversarios por `generateAIList(race.setup)`.
  - Integra modo Engenharia Observador, cameras, split, HUDs, pit wall,
    leaderboard, replay e podium.
  - Audio atual:
    - checkpoint -> `audio.checkpointBeep()`;
    - volta completa -> `audio.lapJingle()`;
    - fase final do replay -> `audio.checkeredFlag()`.
  - Precisara integrar:
    - overlay de classificacao;
    - overlay de grid/luzes;
    - bloqueio de movimento antes da largada;
    - novos sons de evento;
    - painel de resultados classificatorios.
- `src/components/audio/audioAssets.ts`
  - Catalogo atual so conhece MP3s anteriores.
  - Precisa adicionar novos assets:
    - `raceStartLights`;
    - `raceLapComplete`;
    - `raceSectorTime`;
    - `raceBestLap`;
    - `raceFinalLap`;
    - `raceFinishFlag`;
    - `racePodiumArrival`.
  - A pasta `public/sounds/race/` deve ser rastreada no commit final.
- `src/components/simulator/useSimAudio.ts`
  - Ja instancia `HTMLAudioElement` para loops e bandeirada.
  - Possui tons sinteticos para checkpoint/lap/fanfare.
  - Deve receber metodo generico ou metodos explicitos:
    - `startLights()`;
    - `sectorTime()`;
    - `lapComplete()`;
    - `bestLap()`;
    - `finalLap()`;
    - `finishFlag()`;
    - `podiumArrival()`.
  - Deve manter fallback sintetico quando audio asset falhar.
  - Audio ainda depende de gesto do usuario por politica de navegador.
- `src/components/simulator/Leaderboard.tsx`
  - Mostra ranking de corrida e podium.
  - Pode receber tabela de classificacao ou novo componente separado para evitar
    misturar ranking da corrida com resultados de qualy.
- `src/components/simulator/ReplayCameras.tsx` e `RecordedRace.tsx`
  - Dependem de `race.finished` e replay gravado.
  - Devem continuar vinculados apenas a corrida principal, nao a classificacao.
- Documentacao:
  - `inventario-cena-interfaces.md` ja documenta modo engenharia, cameras e
    audio atual.
  - `historico-etapas.md` termina na Etapa 19.
  - A nova etapa deve adicionar classificacao, grid, semaforo, pit lane e assets
    de eventos de corrida.

### Plan

Plano proposto para executar apos `[Concluir RPI]`.

#### Entrega Recomendada Nesta Tarefa

1. Modelar fases da sessao
   - Adicionar no `raceStore` um estado de fase, por exemplo:
     - `SETUP`;
     - `QUALIFYING`;
     - `QUALIFYING_COMPLETE`;
     - `GRID_COUNTDOWN`;
     - `RACE`;
     - `FINISHED`.
   - Manter compatibilidade com `finished`, replay e podium.
   - `RaceSetup` deve iniciar `QUALIFYING`, nao simplesmente fechar o setup.

2. Criar resultados de classificacao
   - Criar tipos como:
     - `QualifyingLap`;
     - `QualifyingResult`;
     - `GridSlot`.
   - Cada piloto deve ter 3 voltas registradas.
   - Para Rayssa:
     - usar tempos reais do `KartRig` quando possivel.
   - Para adversarios na primeira entrega:
     - gerar tempos deterministas com base em `AI_PROFILES`, `RaceSetup` e
       pequena variacao controlada;
     - registrar 3 voltas por piloto, preservando o requisito de 3 voltas sem
       obrigar o usuario a esperar todas as IAs renderizadas uma a uma.
   - Ordenar por melhor volta.
   - Marcar `gridPosition` e `pole`.

3. Criar UI de qualificacao/classificacao
   - Novo componente recomendado:
     - `QualifyingPanel.tsx`.
   - Exibir:
     - piloto atual;
     - volta 1/2/3;
     - melhor volta;
     - tabela classificatoria;
     - Pole Position;
     - botao para avancar para grid quando a classificacao estiver completa.
   - No modo Engenharia, apresentar como painel tecnico no pit wall/overlay.

4. Grid e Pole Position
   - Adicionar helpers em `track.ts`:
     - `gridPose(index)`;
     - `gridPoses(count)`.
   - Usar a mesma geometria conceitual do `TrackModel`.
   - Atualizar `KartRig` e `AIKart` para aceitar pose inicial de grid.
   - `generateAIList` ou `SimulatorScene` deve ordenar adversarios pela
     classificacao antes de renderizar.
   - Rayssa deve largar na posicao correspondente ao ranking classificatorio.

5. Contador regressivo e semaforo
   - Criar `StartLightsOverlay.tsx`.
   - Fase `GRID_COUNTDOWN`:
     - bloquear movimento de Rayssa e adversarios;
     - exibir `3`, `2`, `1`, `START`;
     - tocar `start_light_03-02-01-start.ogg`.
   - Ao fim do contador, mudar fase para `RACE` e liberar movimento.
   - Preservar troca de camera, split e observacao durante o countdown.

6. Eventos sonoros de corrida
   - Atualizar `audioAssets.ts` com `public/sounds/race/*`.
   - Atualizar `useSimAudio` com metodos de evento.
   - Mapeamento inicial:
     - semaforo/largada -> `start_light_03-02-01-start.ogg`;
     - checkpoint/setor -> `sector_time.mp3`;
     - volta completa -> `lap_complete.wav`;
     - melhor volta -> `best_lap.mp3`;
     - volta final -> `final_lap.mp3`;
     - bandeirada -> `finish_flag.mp3`;
     - podium -> `podium_arrival.mp3`.
   - Manter fallback sintetico se o asset falhar.

7. Pit Box e Pit Lane
   - Primeira entrega funcional:
     - criar estado de pit service no `raceStore` ou store auxiliar:
       - piloto em pit lane;
       - manutencao ativa;
       - duracao/bonus simples;
       - ultima parada.
     - detectar entrada na zona dos boxes por proximidade de coordenadas
       simples.
     - exibir overlay `PIT SERVICE` e reduzir/pausar velocidade por alguns
       segundos.
   - Apos classificacao:
     - exibir retorno ao Pit Box como estado/overlay e resetar para grid.
   - Manutencao visual detalhada por equipe pode ficar para proxima atividade se
     o tempo da implementacao ficar alto.

8. Integrar com modo Engenharia Observador
   - O modo Engenharia continua como padrao.
   - Durante classificacao e corrida:
     - usuario observa cameras/monitores;
     - Rayssa segue autopilot enquanto controle direto nao estiver liberado;
     - pit wall mostra fase atual, qualy/grid/pit status.
   - A progressao por vitorias P1 continua sendo atualizada somente na corrida
     principal, nao na classificacao.

9. Documentacao
   - Atualizar `tarefa-atual.md` com implementacao e checks.
   - Atualizar `inventario-cena-interfaces.md`:
     - fases de corrida;
     - classificacao;
     - grid/semaforo;
     - pit lane;
     - novos assets de audio.
   - Atualizar `historico-etapas.md` no fechamento.
   - Rastrear `public/sounds/race/` no commit final.

#### Escopo Que Deve Ficar Para Proxima Atividade

- Renderizar visualmente todos os pilotos fazendo 3 voltas de classificacao um
  por vez, em tempo real, se isso deixar a entrega muito longa.
- Animacao detalhada de mecanicos/manutencao no Pit Lane.
- Estrategia completa de pit stop com pneus, dano, combustivel e undercut.
- Penalidades de largada queimada.
- Safety car, bandeiras amarelas/vermelhas ou regras completas de corrida.
- Persistencia historica de tempos de classificacao entre sessoes.

#### Riscos Tecnicos

- Alterar o store central de corrida pode quebrar replay, podium, progressao de
  engenharia e leaderboard.
- Classificacao visual em tempo real para todos os pilotos pode tornar o fluxo
  lento demais para sala de aula.
- Bloqueio de largada precisa impedir movimento dos karts sem bloquear cameras,
  setup, audio ou UI.
- Grid pose deve ficar alinhado ao visual de `TrackModel`; divergencia causa
  karts fora dos slots.
- Pit lane simplificado deve ser claro para o usuario sem parecer uma mecanica
  completa de estrategia.
- Audio por `HTMLAudioElement` depende de gesto do usuario e pode ser bloqueado
  pelo navegador.

#### Criterios De Aceite

- A nova pasta `public/sounds/race/` e seus arquivos entram no rastreamento ao
  final da tarefa.
- Existe fase de classificacao antes da corrida.
- Cada piloto recebe 3 tempos de volta na classificacao.
- A tabela de classificacao ordena pilotos por melhor tempo.
- Pole Position e identificada.
- O grid da corrida respeita a ordem de classificacao.
- Antes da largada, karts ficam parados durante countdown/semaforo.
- O semaforo toca o asset de largada quando audio esta habilitado.
- A corrida so libera movimento apos o countdown.
- Eventos de setor, volta completa, melhor volta, volta final, bandeirada e
  podium usam os novos assets ou fallback seguro.
- Ha representacao funcional de retorno ao Pit Box/Pit Lane/manutencao, ainda
  que simplificada.
- Modo Engenharia Observador continua funcionando.
- Build passa.

## Implementacao

Executada em 2026-05-19 apos `[Concluir RPI]`.

- `raceStore` recebeu fases de sessao:
  - `SETUP`;
  - `QUALIFYING`;
  - `QUALIFYING_COMPLETE`;
  - `GRID_COUNTDOWN`;
  - `RACE`;
  - `FINISHED`.
- Criados resultados de classificacao com 3 voltas por piloto, melhor volta,
  posicao de grid e Pole Position.
- `RaceSetup` agora inicia a classificacao.
- Criado `QualifyingPanel` para exibir ranking classificatorio, voltas e botao
  para ir ao grid.
- `track.ts` recebeu helpers:
  - `gridPose`;
  - `pitBoxPose`;
  - `isInPitLane`.
- `KartRig` e `AIKart` passaram a aceitar grid/pausa de largada.
- Criado `StartLightsOverlay` com contagem 3, 2, 1 e START.
- Criado `PitServiceOverlay` e estado de pit service simplificado.
- `SimulatorScene` passou a orquestrar:
  - classificacao;
  - grid countdown;
  - liberacao da corrida;
  - audio por evento;
  - pit service;
  - grid ordenado por classificacao.
- `audioAssets.ts` passou a catalogar `public/sounds/race/*`.
- `useSimAudio` ganhou eventos:
  - `startLights`;
  - `sectorTime`;
  - `lapComplete`;
  - `bestLap`;
  - `finalLap`;
  - `finishFlag`;
  - `podiumArrival`.
- A pasta `public/sounds/race/` deve ser rastreada no fechamento desta tarefa.
- Documentacao tecnica atualizada:
  - `inventario-cena-interfaces.md`;
  - `historico-etapas.md`.

## Checks Executados

- `npx eslint ... --fix`: aplicado nos arquivos alterados.
  - Aviso residual: `RaceSetup.tsx` exporta helper alem de componente
    (`react-refresh/only-export-components`), ja existente no padrao atual do
    arquivo.
- `npm run build`: aprovado.
  - Avisos residuais conhecidos: `@import` de CSS fora da primeira posicao e
    chunks acima de 500 kB.
- `npx eslint ...`: aprovado sem erros, mantendo apenas o aviso de Fast Refresh
  em `RaceSetup.tsx`.
- `git diff --check`: aprovado, com apenas avisos LF/CRLF do Windows.
- Dev server iniciado e validado em `http://127.0.0.1:8080/simulator`: HTTP 200.
- Correcao apos validacao manual:
  - causa do carro parado no grid: `gridPose(playerGridIndex)` era recriado a
    cada render e fazia `KartRig` resetar a pose inicial continuamente;
  - correcao: pose inicial do grid memoizada em `SimulatorScene`.
- `npx eslint src\components\simulator\SimulatorScene.tsx src\components\simulator\KartRig.tsx`: aprovado apos correcao.
- `npm run build`: aprovado apos correcao.
- Ajuste solicitado de controles do modo piloto:
  - `38` / seta para cima: dirigir;
  - `37` / seta esquerda: virar esquerda;
  - `39` / seta direita: virar direita;
  - `40` / seta para baixo: re;
  - `65` / `A`: assistencia automatica;
  - `68` / `D`: dirigir;
  - `70` / `F`: freiar;
  - `69` / `E`: pedir ajuda a equipe por radio.

## Replanejamento Antes Do Fechamento Da Versao Inicial

Registrado em 2026-05-19 apos revisao de escopo solicitada pelo usuario.

### Novos Ajustes De Regra Da Classificacao

- A classificacao nao deve mais ser apenas uma geracao instantanea de todos os
  tempos.
- Cada competidor deve ter exatamente 3 voltas classificatorias.
- As voltas devem ser alternadas por rodada:
  - rodada 1: Rayssa faz a primeira volta completa e retorna ao Pit Box da
    equipe;
  - os demais competidores fazem sua volta, um por vez;
  - enquanto adversarios estao na pista, o usuario permanece com tempo de
    analise dos numeros da equipe;
  - o ciclo se repete para a segunda e terceira voltas.
- Durante a classificacao nao deve haver torcida:
  - manter som de motores, pista e eventos pertinentes;
  - desativar camada de torcida ambiente enquanto a fase for classificatoria.
- Rayssa deve buscar desempenho maximo na primeira volta e retornar ao Pit Box
  identificado com o nome/equipe dela.
- A corrida oficial so deve iniciar depois de:
  - completar as 3 rodadas;
  - exibir a tabela/modal final;
  - calcular ranking final;
  - apresentar transicao de carregamento;
  - posicionar a camera no grid de largada.

### Modal E Motion De Resultado Classificatorio

- Ao fim da terceira rodada, subir modal de resultado.
- O modal deve iniciar com tabela grande em ordem alfabetica por competidor.
- Colunas iniciais:
  - nome;
  - volta 1;
  - volta 2;
  - volta 3.
- De cima para baixo, cada linha/celula deve receber efeito de corte:
  - aplicar tarja vermelha sobre as celulas de tempo ja processadas;
  - evitar remover o dado, pois o aluno precisa ver o tempo original.
- Depois do corte, apresentar coluna final:
  - tempo total;
  - colocacao.
- Ranking:
  - soma das 3 voltas define a classificacao;
  - menor soma = 1o colocado / Pole Position;
  - maior soma = ultimo colocado;
  - ordenar a lista final pelas posicoes qualificadas para o grid.

### Loading E Transicao Para Grid Oficial

- Criar tela de carregamento entre classificacao e corrida oficial.
- Assets:
  - fundo: `image_1030ed13.png`;
  - logo central: `public/logo_kart_A26.png`.
- A tela deve exibir barra de progresso ate concluir o carregamento das
  dependencias/estado de largada.
- Depois do carregamento:
  - ir para a cena do grid;
  - iniciar pela camera 1;
  - fazer zoom de cima ate a posicao da Rayssa;
  - somente entao mostrar a contagem/semaforo da corrida oficial.

### Correcao Geometrica Da Sala Acustica

- Documento de referencia:
  - `analise-tecnica/documentacao-partes/Orientações SALA ACÚSTICA - TRATAMENTO MOTOR.docx`.
- Texto extraido do DOCX:
  - "ESSA E A VISAO EXATA DO QUE QUERO PARA A SALA ACUSTICA";
  - "Figura 1 - A visao geral da sala quando a camera troca para a opcao
    SALA ACUSTICA";
  - "Figura 2 - Visao de dentro da SALA - com som do motor ativo".
- Area principal de codigo:
  - `src/components/realsim/Workshop.tsx`;
  - `src/components/realsim/CameraController.tsx`.
- Problema informado:
  - interface e controles da sala acustica foram gerados em plano invertido,
    espelhados para dentro do vidro.
- Correcoes planejadas:
  - revisar grupo `AcousticEngineRoom` e separar face interna da sala de face
    externa do vidro/painel;
  - rebater o conjunto frontal no eixo correto, provavelmente Z local, porque o
    vidro e a sinalizacao principal estao no plano `z ~= 0.91/0.96`;
  - garantir que textos, telas, botoes, medidores e leitura de RPM usem rotacao
    voltada para a camera externa atual;
  - posicionar controles interativos na face externa do painel/vidro;
  - ajustar ou validar alvo de camera `acousticRoom` para mirar a face externa
    corrigida.

### Plano De Implementacao Revisado

1. Consolidar estado de classificacao alternada.
   - Criar modelo de sessao com rodada atual, competidor ativo, volta atual,
     estado `running/returning/analyzing/complete` e resultados parciais.
   - Manter `QualifyingResult` final compativel com `gridOrder`.

2. Implementar fluxo visual/funcional minimo das voltas alternadas.
   - Rayssa no modo automatico durante classificacao.
   - Adversarios executam tempos um por vez.
   - Entre tentativas, mostrar painel de analise da equipe com tempos parciais.
   - Retorno ao Pit Box como estado claro, mesmo que o movimento fisico seja
     simplificado nesta versao.

3. Substituir `QualifyingPanel` por modal de apuracao.
   - Tabela alfabetica inicial.
   - Animacao de corte vermelho por linha/celula.
   - Coluna final com total e colocacao.
   - Ranking final ordenado para grid.

4. Adicionar loading de entrada no grid.
   - Usar `image_1030ed13.png` como fundo.
   - Usar `public/logo_kart_A26.png` no centro.
   - Barra de progresso controlada por estado de transicao.
   - Depois do progresso, ir para camera 1 e iniciar zoom ate a Rayssa.

5. Corrigir sala acustica.
   - Ajustar orientacao do painel/vidro/textos em `Workshop.tsx`.
   - Validar foco `SALA ACUSTICA` em fullscreen e modo normal.
   - Manter controles Wankel interativos e externos.

6. Atualizar documentacao tecnica.
   - Inventario de cena e interfaces.
   - Historico de etapas.
   - Registro final da tarefa.

7. Validar.
   - `npx eslint` nos arquivos alterados.
   - `npm run build`.
   - Validacao manual em `/simulator` para classificacao/grid.
   - Validacao manual em `/real-simulator` ou tela equivalente da oficina para
     foco da sala acustica.

### Riscos Do Replanejamento

- Simular todos os pilotos fisicamente por 3 voltas pode alongar demais o tempo
  de aula; a primeira entrega deve priorizar fluxo alternado claro e tempos
  consistentes, deixando trajetoria fisica completa para etapa posterior se
  necessario.
- A tela de loading usa `image_1030ed13.png`, que esta na raiz e ainda nao esta
  rastreada; sera necessario decidir se o asset fica na raiz ou sera movido para
  `public/` antes do fechamento.
- A correcao da sala acustica pode exigir ajuste fino por imagem/camera, pois o
  DOCX contem orientacao visual, mas pouco texto tecnico extraivel.
- Alterar fases de corrida pode impactar replay, modo Engenharia, audio de
  eventos e progressao de vitorias.

## Implementacao Do Replanejamento

Executada em 2026-05-19.

- `raceStore` recebeu modelo de sessao classificatoria alternada:
  - `QualifyingEntrant`;
  - `QualifyingSession`;
  - etapa atual `RUNNING`, `PIT_RETURN`, `ANALYSIS` ou `COMPLETE`;
  - rodada atual;
  - competidor ativo;
  - tempos parciais por competidor.
- A classificacao agora inicia por `startQualifyingSession`.
- Cada competidor recebe exatamente 3 voltas.
- Rayssa e priorizada como primeira tentativa de cada rodada.
- O ranking final passou a usar soma das 3 voltas (`totalMs`):
  - menor soma = Pole Position;
  - maior soma = ultima posicao do grid.
- Criado `QualifyingSessionPanel`:
  - mostra rodada atual;
  - competidor na pista;
  - retorno ao Pit Box;
  - tempos parciais da Rayssa para analise da equipe.
- `QualifyingPanel` foi alterado para modal de apuracao:
  - tabela inicial em ordem alfabetica;
  - voltas 1, 2 e 3;
  - tarja vermelha animada sobre tempos processados;
  - coluna final de total;
  - colocacao final para o grid.
- Criado `GridLoadingOverlay`:
  - fundo `public/image_1030ed13.png`;
  - logo `public/logo_kart_A26.png`;
  - barra de progresso antes do grid oficial.
- `SimulatorScene` passou a:
  - desativar audio de torcida durante `QUALIFYING`;
  - ocultar `Grandstand` durante `QUALIFYING`;
  - iniciar a corrida oficial por `GRID_LOADING`;
  - selecionar camera 1 antes da transicao para o grid;
  - acionar countdown apenas apos o carregamento.
- `useSimAudio` ganhou `setCrowdMuted` para silenciar as camadas de torcida sem
  desligar motor/pista/eventos.
- `Workshop.tsx` corrigiu a orientacao externa da sala acustica:
  - textos e leituras frontais foram reposicionados para a face externa do vidro;
  - a leitura de dB/RPM/saude/carga deixou de ficar voltada para dentro;
  - criado painel externo interativo no vidro com ligar/parar, audio, stress,
    capacidade e aceleracao;
  - o painel usa os mesmos controles locais do teste Wankel.
- `public/image_1030ed13.png` foi criado a partir do asset solicitado na raiz
  para que o navegador consiga servir o fundo da tela de carregamento.

## Checks Executados Apos Replanejamento

- `npx eslint src\components\simulator\SimulatorScene.tsx src\components\simulator\raceStore.ts src\components\simulator\QualifyingPanel.tsx src\components\simulator\QualifyingSessionPanel.tsx src\components\simulator\GridLoadingOverlay.tsx src\components\simulator\useSimAudio.ts src\components\realsim\Workshop.tsx --fix`: aplicado.
- `npx eslint src\components\simulator\SimulatorScene.tsx src\components\simulator\raceStore.ts src\components\simulator\QualifyingPanel.tsx src\components\simulator\QualifyingSessionPanel.tsx src\components\simulator\GridLoadingOverlay.tsx src\components\simulator\useSimAudio.ts src\components\realsim\Workshop.tsx`: aprovado.
- `npm run build`: aprovado.
  - Avisos residuais conhecidos:
    - `@import` de fontes no CSS nao esta na primeira posicao;
    - chunks acima de 500 kB.

## Fechamento Da Tarefa

Executado em 2026-05-19 apos `[Finalizar Tarefa]`.

- Escopo revisado:
  - classificacao alternada;
  - apuracao/ranking por soma das 3 voltas;
  - loading para grid oficial;
  - controles do modo piloto;
  - pit service/pit lane;
  - sons de evento em `public/sounds/race/`;
  - painel externo da sala acustica;
  - documentacao tecnica.
- Arquivos de referencia e assets rastreados no fechamento:
  - `analise-tecnica/documentacao-partes/Orientações SALA ACÚSTICA - TRATAMENTO MOTOR.docx`;
  - `public/image_1030ed13.png`;
  - `public/sounds/race/*`.
- Itens deixados fora do commit por nao pertencerem diretamente ao escopo
  fechado:
  - `chamado-correções-erros-prints/`;
  - `sounds-trilha/`;
  - `image_1030ed13.png` na raiz, pois a versao servida pelo app foi copiada
    para `public/image_1030ed13.png`.

### Checks Finais

- `git diff --check`: aprovado, com avisos LF/CRLF do Windows.
- `npx eslint ...`: aprovado.
  - Aviso residual conhecido: `RaceSetup.tsx` exporta helper alem do componente
    (`react-refresh/only-export-components`).
- `npm run build`: aprovado.
  - Avisos residuais conhecidos:
    - `@import` de fontes no CSS fora da primeira posicao;
    - chunks acima de 500 kB.
