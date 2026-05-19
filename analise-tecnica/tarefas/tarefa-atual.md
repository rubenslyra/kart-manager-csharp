# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-19

## Titulo

Adicionar modo Engenharia Observador e progressao de acesso da equipe

## Objetivo

Transformar o fluxo inicial da Arena em uma experiencia de equipe tecnica:
o usuario comeca dentro de uma sala/pit wall de engenharia, observando a
corrida por monitores, paineis de telemetria e cameras selecionaveis, enquanto
Rayssa pilota o kart de forma autonoma. A conducao direta do kart deve ser
desbloqueada apenas depois de uma progressao baseada em vitorias da corredora.

## Escopo Inicial

- Criar ou planejar dois modos iniciais de controle:
  - modo `Equipe Engenharia` ou observador, em que o usuario atua na sala de
    engenharia e acompanha a corrida pelos monitores;
  - modo de conducao direta, equivalente a perspectiva atual do jogo, liberado
    apenas posteriormente.
- No inicio da experiencia, permitir apenas o modo observador:
  - Rayssa opera o carrinho sozinha;
  - o usuario aprende as mecanicas observando a corrida;
  - o usuario pode acionar/trocar posicoes de camera;
  - o usuario acompanha telemetria, paineis e feeds de camera.
- Representar a primeira etapa como cadeira de engenheiro mecanico assistente,
  com acesso a monitores e paineis de controle.
- Reforcar a finalidade didatica:
  - mostrar como as libs em C# desenvolvidas em aula contribuem para a corrida;
  - destacar a importancia da qualidade de codigo por meio de telemetria,
    diagnosticos e feedbacks da equipe.
- Criar ou planejar progressao de acesso por vitorias de Rayssa:
  - inicio: engenheiro mecanico assistente;
  - apos 4 vitorias em primeiro lugar: cadeira superior a de assistente;
  - apos 6 vitorias: cadeira de lider de equipe;
  - a partir da 10a vitoria: liberar opcao de operar os carros na perspectiva
    atual do jogo.
- Projetar ambiente visual de pit wall/command station:
  - sala de comando high-tech noturna;
  - cinco engenheiros ou estrategistas vistos por tras;
  - cadeiras profissionais pretas com branding `Autonomy`;
  - uniformes claros com identidade propria do projeto;
  - headsets de comunicacao;
  - arrays verticais/duplos de monitores com telemetria, mapas de pista, feeds
    ao vivo e graficos;
  - booth metalico escuro, linhas limpas, divisorias e iluminacao cinematica.
- Evitar uso direto de marcas reais protegidas como `PETRONAS` no produto final,
  salvo se houver autorizacao explicita; usar identidade inspirada e propria,
  como `Autonomy Racing` ou equivalente.
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

## Arquivos Provaveis

- `src/components/simulator/SimulatorScene.tsx`
- `src/components/simulator/KartRig.tsx`
- `src/components/simulator/AIKart.tsx`
- `src/components/simulator/useKartControls.ts`
- `src/components/simulator/gestureInput.ts`
- `src/components/simulator/HelmetHud.tsx`
- `src/components/simulator/raceStore` ou store equivalente de corrida
- componentes novos para pit wall, monitores, paineis e progressao
- documentacao em `analise-tecnica/documentacao-partes/`

## Riscos Iniciais

- Travar o controle direto sem quebrar a experiencia atual de camera e corrida.
- Definir uma IA/autopilot de Rayssa suficiente para o modo observador inicial.
- Persistir contagem de vitorias sem criar estado inconsistente ou facil de
  corromper.
- Integrar monitores/pit wall com a cena 3D sem degradar performance.
- Manter o valor didatico das libs C# claro sem inventar metricas tecnicas
  desconectadas do que o projeto realmente possui.
- Evitar marcas reais protegidas no visual final.
- Preservar as cameras imersivas implementadas na tarefa anterior.

## Checks Planejados

- `git status --short --branch` antes de qualquer edicao de codigo.
- Research da cena da Arena, controles, cameras, IA de corrida, store de
  resultados/vitorias, HUDs e documentacao tecnica.
- Plan tecnico com subtarefas, riscos, criterios de aceite e validacoes.
- Apos implementacao aprovada por `[Concluir RPI]`:
  - lint focado nos arquivos alterados;
  - `git diff --check`;
  - `npm run build`;
  - validacao visual/manual do modo observador, cameras, progressao e liberacao
    do controle direto.

## Subtarefas

- Concluido: abrir tarefa formal e registrar escopo inicial.
- Concluido: receber `[Iniciar RPI]`.
- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: receber `[Concluir RPI]`.
- Concluido: implementar apos aprovacao do RPI.
- Concluido: validar alteracoes.
- Concluido: receber `[Finalizar Tarefa]`.
- Concluido: revisar diff final.
- Concluido: validar e fechar tarefa.

## RPI

Iniciado em 2026-05-19.

### Research

Concluido em 2026-05-19.

- Estado do git no inicio do RPI:
  - Branch `main`.
  - `analise-tecnica/tarefas/tarefa-atual.md` modificado pela abertura da tarefa.
  - Artefatos nao rastreados preexistentes:
    - `chamado-correções-erros-prints/`
    - `image_1030ed13.png`
    - `sounds-trilha/`
- Dependencias disponiveis:
  - React 19, Three.js, `@react-three/fiber`, `@react-three/drei`, Radix,
    Recharts, Lucide e Vite.
  - Nao ha dependencia de engine de IA externa ou detector de gestos nesta etapa.
- `src/components/simulator/SimulatorScene.tsx`
  - E a composicao principal da Arena.
  - Renderiza `Canvas`, pista, boxes, arquibancada, `KartRig`, concorrentes,
    ghost, replay, HUDs, leaderboard, setup e controles laterais.
  - Estado local atual:
    - `devMode`;
    - `resetSignal`;
    - `lap`;
    - `splitMode`;
    - `activeView`;
    - `camerasRef`;
    - `fallbackCamRef`;
    - `showHitbox`;
    - `hitboxAuto`.
  - Cameras atuais:
    - `COCKPIT`;
    - `CHASE`;
    - `NOSE`;
    - `TOP-DOWN`;
    - `DRIVER`;
    - `HELMET`;
    - `FREE`.
  - O split usa somente as quatro primeiras cameras.
  - Teclas `1-7` selecionam camera; `V` alterna split.
  - Hoje a interface instrui o usuario a dirigir com teclado logo no topo e no
    painel lateral.
  - `RaceSetup` abre por padrao e o botao `Iniciar corrida` apenas fecha o modal
    de setup.
  - `KartRig` e sempre renderizado como `player`, e o registro do usuario no
    `raceStore` usa nome `"Você"`, embora o modelo visual ja seja Rayssa.
  - Esta diferenca e importante: para o modo observador, o usuario nao deve ser
    tratado semanticamente como piloto.
- `src/components/simulator/KartRig.tsx`
  - Controla fisica manual do kart atual.
  - Usa `useKartControls(devMode)` internamente e le teclado diretamente.
  - Calcula:
    - velocidade;
    - marcha;
    - progresso;
    - voltas;
    - checkpoints;
    - colisao com IA;
    - telemetria;
    - fisica estendida para HUD.
  - Registra progresso do `playerId` em `raceStore`.
  - O fim da corrida pode ocorrer quando o racer `isPlayer` termina.
  - Para modo observador, ha duas opcoes:
    - adaptar `KartRig` para aceitar controle externo/autopilot e bloquear teclado;
    - criar um rig autonomo separado para Rayssa reaproveitando a logica do
      `AIKart`.
  - A opcao menos arriscada para primeira entrega e criar uma fonte de input
    automatica/engenharia para `KartRig`, mantendo as cameras presas ao kart da
    Rayssa e evitando duplicar cameras.
- `src/components/simulator/useKartControls.ts`
  - Ja aceita fonte externa opcional no mesmo formato do teclado.
  - Hoje o teclado sempre continua ativo e a fonte externa e mesclada com
    `Math.max`.
  - Para travar o controle direto, sera necessario adicionar uma forma explicita
    de desabilitar teclado ou definir o modo de entrada ativo.
- `src/components/simulator/AIKart.tsx`
  - Ja implementa piloto autonomo por curva (`trackCurve`) com:
    - velocidade base;
    - reducao em curvas;
    - troca de faixa/overtake;
    - registro de progresso;
    - pose;
    - numero e identidade visual.
  - Essa logica serve como base conceitual para um autopilot de Rayssa, mas nao
    carrega as cameras `DRIVER`/`HELMET` do `KartRig`.
- `src/components/simulator/raceStore.ts`
  - Store proprio por `useSyncExternalStore`.
  - `RaceState` atual nao possui conceito de modo de acesso, papel do usuario,
    contagem de vitorias, persistencia de carreira ou unlock.
  - `updateProgress` finaliza a corrida quando:
    - todos terminam; ou
    - um racer marcado como `isPlayer` termina.
  - O vencedor ja e calculado por ranking e enviado ao `replayRecordStore`.
  - Melhor ponto para progressao:
    - registrar resultado quando `finished` muda;
    - calcular se Rayssa venceu;
    - incrementar contador persistido;
    - recalcular papel/desbloqueios.
- `src/components/simulator/replayRecordStore.ts`
  - Persiste ultimo replay em `localStorage`.
  - Guarda `winnerId`, `racers` e amostras.
  - Pode ser consultado para saber vencedor do ultimo replay, mas a progressao
    precisa de store proprio para nao depender do replay exportavel.
- `src/components/simulator/Leaderboard.tsx`
  - Exibe ranking e podium final.
  - Hoje usa destaque visual para `r.isPlayer`.
  - No modo engenharia, o destaque deve preferir Rayssa/equipe, nao "Você" como
    piloto.
  - `Podium` e bom ponto para exibir mudanca de nivel apos vitorias.
- `src/components/simulator/RaceSetup.tsx`
  - Configura adversarios, voltas, agressividade, habilidades e duracao de replay.
  - Nao tem seletor de modo de controle.
  - No inicio, deve comunicar que a corrida comeca em modo engenharia/observador.
- `src/components/simulator/useKartSimulator.ts`
  - Mantem telemetria didatica dos modulos:
    - `CORE`;
    - `GEARBOX`;
    - `BRAKES`;
    - `IGNITION`;
    - bateria;
    - estado do kart;
    - alertas.
  - Esta telemetria e adequada para explicar como as libs C# contribuem para a
    qualidade operacional, desde que os paineis de engenharia usem os dados
    reais do simulador.
- `src/components/realsim/BackgroundMonitors.tsx`
  - Ja possui padrao util para monitores 3D via `CanvasTexture`.
  - Inclui monitor de corrida e monitor de telemetria com graficos animados.
  - Pode inspirar ou ser adaptado para a sala de comando da Arena.
  - Usar `CanvasTexture` e mais leve que criar varias subcenas/portais de camera
    em uma primeira entrega.
- Documentacao tecnica:
  - `inventario-cena-interfaces.md` ja documenta cameras imersivas, visor,
    radio de engenharia e preparacao de gestos.
  - `historico-etapas.md` registra a etapa anterior como "Cameras imersivas e
    visor de engenharia da Arena".
  - A nova entrega deve atualizar o inventario com:
    - modo Engenharia Observador;
    - pit wall/command station;
    - progressao por vitorias;
    - politica de desbloqueio do controle direto.

### Plan

Plano proposto para executar apos `[Concluir RPI]`.

#### Entrega Recomendada Nesta Tarefa

1. Introduzir modelo de acesso e progressao
   - Criar tipos para:
     - `ControlMode`: `ENGINEERING_OBSERVER` e `DRIVER_CONTROL`;
     - `TeamRole`: `ASSISTANT_ENGINEER`, `SENIOR_ASSISTANT`,
       `TEAM_LEAD`, `DRIVER_AUTHORIZED`.
   - Criar store leve, por exemplo `engineeringProgressStore.ts`, com:
     - vitorias de Rayssa;
     - papel atual;
     - modo atual;
     - desbloqueio de controle direto;
     - persistencia em `localStorage`.
   - Regras:
     - 0 a 3 vitorias: `ASSISTANT_ENGINEER`;
     - 4 a 5 vitorias: `SENIOR_ASSISTANT`;
     - 6 a 9 vitorias: `TEAM_LEAD`;
     - 10 ou mais vitorias: liberar `DRIVER_CONTROL`.
   - O modo padrao deve ser `ENGINEERING_OBSERVER` ate o desbloqueio.

2. Registrar Rayssa como protagonista da equipe
   - Alterar o registro semantico do racer principal:
     - `id`: manter `player` inicialmente para reduzir impacto ou migrar com
       cuidado para `rayssa`;
     - `name`: usar `Rayssa`;
     - `isPlayer`: pode continuar `true` tecnicamente para preservar regra de
       fim de corrida, mas a UI deve tratar isso como "protagonista/equipe" no
       modo observador.
   - Evitar que a UI diga que o usuario e o piloto antes do desbloqueio.

3. Travar controle manual no modo observador
   - Evoluir `useKartControls` para aceitar opcao de teclado habilitado ou modo
     de entrada.
   - Em `ENGINEERING_OBSERVER`, teclado de direcao nao deve controlar o kart.
   - Cameras, split, setup, audio, replay e paineis continuam interativos.
   - Em `DRIVER_CONTROL`, comportamento atual de teclado deve voltar.

4. Criar autopilot de Rayssa para o modo engenharia
   - Primeira implementacao recomendada:
     - criar fonte externa de controles para `KartRig`, por exemplo
       `useRayssaAutopilotControls`;
     - usar `nearestOnTrack`, `trackCurve` e lookahead para gerar `forward`,
       `brake`, `left` e `right`;
     - manter o `KartRig` como rig da Rayssa para preservar cameras `DRIVER` e
       `HELMET`, telemetria, colisao, replay e HUDs.
   - O autopilot deve ser previsivel e bom o suficiente para vitorias, mas ainda
     responsivo a curvas e colisao.
   - Como etapa inicial, permitir balancear dificuldade por setup ou constantes
     locais, sem criar UI complexa.

5. Criar experiencia visual do pit wall/command station
   - Criar componente da sala tecnica da Arena, por exemplo
     `EngineeringPitWall.tsx`.
   - Integrar dentro da area da Arena como primeiro plano/overlay ou cena 3D
     dedicada ao modo observador.
   - Visual:
     - booth escuro, metalico, com iluminacao fria;
     - cinco estacoes de engenharia vistas por tras ou sugeridas por cadeiras;
     - cadeiras pretas com `Autonomy`;
     - headsets e uniformes com identidade propria `Autonomy Racing`;
     - monitores em arrays com telemetria, mapa da pista, feed de camera e
       graficos.
   - Evitar uso literal de `PETRONAS` e identidade Mercedes-AMG; manter apenas a
     inspiracao de estrutura profissional.
   - Para performance, preferir paineis 2D/CanvasTexture e overlays HTML antes
     de criar varias renderizacoes de camera dentro de monitores.

6. Monitores e paineis didaticos
   - Criar paineis que usem dados reais:
     - estado dos modulos (`CORE`, `GEARBOX`, `BRAKES`, `IGNITION`);
     - bateria, velocidade, marcha, freio;
     - RPM, torque, grip e Gs quando disponiveis;
     - ranking e volta;
     - camera ativa.
   - Adicionar um painel de "Qualidade de Codigo / C# libs" com linguagem
     didatica, mas alimentado por status reais dos modulos e checklist.
   - Nao inventar integracao C# nova se ela nao existir no codigo; comunicar como
     diagnostico operacional da simulacao atual.

7. Integrar cameras ao modo engenharia
   - Preservar cameras existentes e atalhos `1-7`.
   - No modo observador, renomear instrucao de uso:
     - foco em "selecionar feed de camera" em vez de "dirigir".
   - Manter `DRIVER` e `HELMET` como feeds que a equipe pode acompanhar.
   - O split-screen pode representar monitor wall; nao deve ser removido.

8. Registrar vitorias e desbloqueios
   - Ao finalizar corrida, obter ranking por `rankedRacers`.
   - Se Rayssa for P1, incrementar contador de vitorias.
   - Exibir feedback no podium/replay:
     - vitorias atuais;
     - cargo atual;
     - proximo desbloqueio;
     - desbloqueio do modo piloto ao chegar a 10.
   - Quando o controle direto estiver desbloqueado, oferecer seletor claro para
     alternar entre `Equipe Engenharia` e `Controle Direto`.

9. Documentacao
   - Atualizar `tarefa-atual.md` com implementacao/checks.
   - Atualizar `inventario-cena-interfaces.md` com modo observador, pit wall e
     progressao.
   - Atualizar `historico-etapas.md` no fechamento.

#### Escopo Que Deve Ficar Para Proxima Atividade

- Renderizar feeds reais de camera em multiplos monitores 3D por render targets.
- Persistencia em backend ou conta de usuario.
- Integracao real com DLLs C# externas alem dos estados/contratos atuais.
- Sistema de tutorial completo com missoes guiadas.
- Vozes reais/MP3 de engenheiros.
- Modelos humanos hiper-realistas/GLTF completos para os cinco engenheiros.

#### Riscos Tecnicos

- O fim de corrida hoje depende de `isPlayer`; trocar isso de forma ampla pode
  quebrar replay, podium e leaderboard.
- Autopilot simples pode nao vencer de forma consistente se os adversarios
  estiverem muito rapidos.
- Bloquear teclado sem cuidado pode tambem bloquear atalhos de camera, split e
  debug.
- Uma sala 3D muito detalhada pode prejudicar FPS dentro da Arena.
- Paineis sobre C# precisam se manter fieis ao que o projeto realmente mede.
- Persistencia de vitorias em `localStorage` precisa tolerar dados invalidos.

#### Criterios De Aceite

- A Arena inicia em modo `Equipe Engenharia`/observador.
- O usuario nao controla a direcao/aceleracao do kart antes do desbloqueio.
- Rayssa pilota autonomamente e continua aparecendo nas cameras `DRIVER` e
  `HELMET`.
- O usuario consegue alternar cameras e split no modo observador.
- A interface deixa claro o papel atual da equipe e o proximo desbloqueio.
- Vitorias de Rayssa em primeiro lugar incrementam a progressao.
- Apos 4 vitorias, o papel sobe para cadeira superior a assistente.
- Apos 6 vitorias, o papel sobe para lider de equipe.
- A partir da 10a vitoria, aparece opcao de controle direto.
- Ao escolher controle direto desbloqueado, o comportamento atual de dirigir com
  teclado fica disponivel.
- O ambiente de engenharia usa identidade propria do projeto, sem marca real
  protegida como `PETRONAS`.
- Build passa.

## Implementacao

Executada em 2026-05-19 apos `[Concluir RPI]`.

- Criado `engineeringProgressStore.ts`:
  - controla `ENGINEERING_OBSERVER` e `DRIVER_CONTROL`;
  - persiste vitorias P1 de Rayssa em `localStorage`;
  - calcula papeis de equipe por marcos de 4, 6 e 10 vitorias;
  - bloqueia `DRIVER_CONTROL` antes da 10a vitoria.
- `useKartControls` passou a aceitar teclado desabilitado, preservando fonte
  externa e zerando entrada manual quando bloqueado.
- `KartRig` passou a aceitar `controlMode`:
  - `manual`: comportamento atual por teclado;
  - `autopilot`: controle autonomo de Rayssa baseado em tangente/lookahead da
    pista.
- `SimulatorScene` passou a:
  - registrar a protagonista como `Rayssa`;
  - iniciar em modo engenharia;
  - carregar/ligar modulos automaticamente no modo observador;
  - bloquear direcao/aceleracao manual enquanto Rayssa pilota;
  - preservar troca de cameras `1-7` e split-screen `V`;
  - registrar vitoria de Rayssa ao final da corrida;
  - oferecer alternancia para modo piloto apenas quando desbloqueado.
- Criado `EngineeringPitWall`:
  - posto `Autonomy Racing`;
  - cinco estacoes de engenharia com monitores;
  - leitura de modulos C# / qualidade;
  - telemetria resumida, ranking, camera ativa e proximo desbloqueio.
- `Podium` passou a exibir papel atual da equipe, vitorias de Rayssa e proximo
  marco de acesso.
- Documentacao tecnica atualizada:
  - `inventario-cena-interfaces.md`;
  - `historico-etapas.md`.

## Checks Executados

- `npm run build`: aprovado apos repetir com timeout maior.
  - Primeira tentativa excedeu timeout de 180s sem erro exibido.
  - Avisos residuais conhecidos: `@import` de CSS fora da primeira posicao e
    chunks acima de 500 kB.
- `npx eslint src\components\simulator\SimulatorScene.tsx src\components\simulator\KartRig.tsx src\components\simulator\useKartControls.ts src\components\simulator\EngineeringPitWall.tsx src\components\simulator\engineeringProgressStore.ts src\components\simulator\Leaderboard.tsx --fix`: aplicado para formatacao.
- `npx eslint src\components\simulator\SimulatorScene.tsx src\components\simulator\KartRig.tsx src\components\simulator\useKartControls.ts src\components\simulator\EngineeringPitWall.tsx src\components\simulator\engineeringProgressStore.ts src\components\simulator\Leaderboard.tsx`: aprovado.
- `git diff --check`: aprovado, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado apos autofix.
  - Avisos residuais conhecidos: `@import` de CSS fora da primeira posicao e
    chunks acima de 500 kB.
- Dev server iniciado e validado em `http://127.0.0.1:8081/simulator`: HTTP 200.
- `[Finalizar Tarefa]` recebido em 2026-05-19.
- Revisao final de diff: concluida, escopo restrito a modo engenharia
  observador, progressao de acesso, pit wall, autopilot da Rayssa, bloqueio de
  controle manual e documentacao.
- `npx eslint src\components\simulator\SimulatorScene.tsx src\components\simulator\KartRig.tsx src\components\simulator\useKartControls.ts src\components\simulator\EngineeringPitWall.tsx src\components\simulator\engineeringProgressStore.ts src\components\simulator\Leaderboard.tsx`: aprovado no fechamento.
- `git diff --check`: aprovado no fechamento, com apenas avisos LF/CRLF do
  Windows.
- `npm run build`: aprovado no fechamento.
  - Avisos residuais conhecidos: `@import` de CSS fora da primeira posicao e
    chunks acima de 500 kB.

## Fechamento

- Finalizada em: 2026-05-19.
- Commit: criado no fechamento; hash final informado ao usuario.

## Notas Para Release

- Arena inicia em modo `Equipe Engenharia`, com Rayssa pilotando
  autonomamente.
- Usuario acompanha a corrida por cameras, split-screen e pit wall tecnico.
- Progressao por vitorias P1 desbloqueia cadeiras de engenharia e libera
  controle direto a partir da 10a vitoria.
- Pit wall `Autonomy Racing` exibe modulos, telemetria, ranking e proximo
  desbloqueio.
