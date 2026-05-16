# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-16

## Titulo

Melhorar navegacao da oficina e recriar controles de teste do motor

## Objetivo

Melhorar a experiencia da Oficina em tela cheia: permitir zoom por scroll do mouse, corrigir o zoom inicial que ainda parece excessivo, revisar o som da sala de motor Wankel e substituir os controles atuais do teste por um monitor/balcao dedicado com informacoes, telemetria, graficos e botoes touchscreen.

## Escopo

- Adicionar controle de zoom por scroll do mouse na Oficina, semelhante ao comportamento da Arena.
- Reduzir/ajustar o zoom inicial ao abrir `Oficina`.
- Revisar por que o som do motor Wankel/sala de motor nao esta audivel.
- Substituir a forma atual dos controles de teste Wankel quando estiverem fora do alcance/fora da area util.
- Criar um monitor de teste em um balcao:
  - 80% da tela com informacoes, telemetria, graficos e dados pertinentes a stress/capacidade do motor;
  - 20% da tela com controles touchscreen, incluindo aceleracao, ligar/parar, audio e testes de stress/capacidade.
- Preservar checklist, importacao de DLL, auditoria, focos, labels, wiring e demais controles da Oficina.
- Nao alterar Arena, home ou navegacao global nesta tarefa.

## Subtarefas

- Concluido: abrir tarefa formal e registrar escopo inicial.
- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: aguardar `[Concluir RPI]`.
- Concluido: implementar apos aprovacao do RPI.
- Concluido: validar e fechar tarefa apos `[Finalizar Tarefa]`.

## RPI

### Research

Concluido em 2026-05-16.

- Estado inicial do git:
  - Branch `main`.
  - `analise-tecnica/tarefas/tarefa-atual.md` modificado pela abertura da tarefa.
  - Pastas nao rastreadas fora do escopo: `sounds-trilha/` e `chamado-correções-erros-prints/`.
- `src/components/realsim/CameraController.tsx`
  - Controla a camera por interpolacao para presets fixos (`HOME`, `HOME_FULLSCREEN`, `TARGETS`, `FULLSCREEN_TARGETS`).
  - Nao existe controle de zoom por scroll.
  - O idle dolly adiciona uma pequena oscilacao quando `focus === null`.
  - A camera sempre se aproxima do `desiredPos`; portanto zoom pode ser implementado como deslocamento ao longo do vetor camera -> look target.
  - O zoom deve respeitar limites para evitar entrar dentro do kart/sala ou afastar demais.
- `src/components/realsim/RealSimulator.tsx`
  - Mantem estado local do teste Wankel:
    - `engineRunning`
    - `engineThrottle`
    - `engineTest`
    - hook `useWankelTestAudio`.
  - Passa `engineTest`, `setEngineRunning`, `setEngineThrottle`, `toggleEngineAudio` e afins para `RealSimUI`.
  - Passa apenas `engineTest` para `Workshop`.
  - Para criar controles reais dentro do monitor da cena, `Workshop` precisa receber callbacks de controle do teste.
- `src/components/realsim/RealSimUI.tsx`
  - Os controles Wankel atuais estao em overlay HTML absoluto:
    - `left-3 top-24`
    - largura `w-80`
    - botoes `Ligar bancada`, `Audio ON/OFF`
    - slider de aceleracao
    - leituras de RPM, saude, temperatura e carga.
  - Por ficarem no overlay da tela, podem parecer "dentro" ou "fora" da sala, mas nao estao associados ao balcao/monitor da cena.
  - O novo monitor deve substituir esse painel, pelo menos na experiencia full body, para ficar no local correto da Oficina.
- `src/components/realsim/Workshop.tsx`
  - Ja possui `Workbench` em `[5.0, 0, -1.5]`.
  - Sala acustica fica em `[7.2, 0, 3.9]`.
  - Ja existe infra para telas na cena:
    - `HoloCanvasPanel`
    - `drawPanelShell`
    - paineis `MODULES OK`, `LIVE TELEMETRY`, `DIAG 26A`.
  - `HoloCanvasPanel` desenha canvas como textura, mas nao e interativo.
  - Para botoes touchscreen reais, ha duas opcoes:
    - meshes com `onClick`/`onPointer*` no R3F;
    - `Html` do Drei acoplado ao monitor, com botoes HTML reais.
  - Como o usuario pediu controles touchscreen, `Html` sobre o monitor e a opcao mais segura/ergonomica.
- `src/components/realsim/hooks/useWankelTestAudio.ts`
  - O hook cria um `AudioContext` para sintetizador/fallback.
  - O MP3 `wankelTestRoomEngine` e criado como `HTMLAudioElement` separado:
    - `new Audio(AUDIO_ASSETS.wankelTestRoomEngine)`
    - `volume = 0`
    - `play()`
    - no tick, volume sobe apenas se `running`.
  - Esse MP3 nao esta ligado ao `AudioContext`/`masterGain`.
  - Possiveis causas de o som nao estar audivel:
    - usuario habilita audio mas nao liga a bancada (`running=false`, volume fica 0);
    - MP3 separado do `AudioContext` pode ser bloqueado/baixo/inconsistente dependendo do navegador;
    - volume maximo atual do MP3 (`0.16 + throttle * 0.54`) pode ser insuficiente diante de outras camadas ou speakers;
    - gesto do usuario e controle de `running` estao separados, entao a sequencia de uso pode nao ficar clara.
- `src/components/audio/audioAssets.ts`
  - O asset existe como `/sounds/wankel-test-room-engine.mp3`.
  - Credito registrado em `AUDIO_CREDITS`.
- `src/components/realsim/engineTest.ts`
  - Dados disponiveis para monitor:
    - `running`
    - `throttle`
    - `rpm`
    - `health`
    - `temperature`
    - `load`
    - `audioEnabled`
  - Ainda nao ha conceito separado de modo de stress/capacidade; pode ser modelado inicialmente como presets de throttle/carga via controles.
- Documentacao:
  - `inventario-cena-interfaces.md` descreve o painel externo `Teste Motor Wankel`; ficara desatualizado quando esse controle migrar para monitor/balcao na cena.

Conclusao do Research:

- O zoom por scroll deve ser implementado no controle de camera da Oficina, preferencialmente escutando wheel apenas no canvas para nao interferir em sliders/inputs dos overlays.
- A vista inicial da Oficina ainda pode estar mais aproximada que o desejado; o preset `HOME_FULLSCREEN` deve ser recuado/aberto em relacao ao ajuste anterior.
- O painel Wankel atual deve ser substituido por um console no `Workshop`, alimentado pelo mesmo estado `engineTest` e com callbacks reais.
- O audio Wankel deve ser tornado mais robusto conectando o MP3 ao `AudioContext` com `MediaElementSource` ou, no minimo, elevando/organizando o ganho e deixando claro que audio+running precisam estar ativos.

### Plan

Plano para executar apos `[Concluir RPI]`:

1. Zoom por scroll na Oficina
   - Adicionar controle de zoom no `CameraController`.
   - Escutar `wheel` no `gl.domElement` do Canvas, nao em `window`, para evitar conflito com inputs e overlays HTML.
   - Aplicar zoom como deslocamento ao longo do vetor entre `desiredPos` e `desiredLook`.
   - Definir limites conservadores:
     - zoom in sem atravessar o kart/sala;
     - zoom out sem perder totalmente a Oficina.
   - Manter comportamento antigo quando nao houver scroll.

2. Ajustar zoom inicial
   - Recalibrar `HOME_FULLSCREEN` para abrir um pouco mais a cena da Oficina.
   - Manter o modo nao-fullscreen preservado.
   - Revisar tambem `FULLSCREEN_TARGETS.acousticRoom` para nao entrar colado demais na sala de motor.

3. Novo monitor/balcao de teste Wankel
   - Criar tipo de props de controle do motor, por exemplo `EngineTestControls`.
   - Passar do `RealSimulator` para `Workshop`:
     - `engineTest`
     - `setEngineRunning`
     - `setEngineThrottle`
     - `toggleEngineAudio`
   - Criar componente de cena no `Workshop`, por exemplo `EngineTestConsoleBench`.
   - Posicionar esse balcao perto da sala acustica ou bancada, de forma visualmente acessivel.
   - Compor o monitor com:
     - base/balcao fisico;
     - tela grande.
   - Usar proporcao visual da tela:
     - 80% area informativa com RPM, temperatura, carga, saude, audio, linhas/graficos simples;
     - 20% area de controles touchscreen.
   - Usar `Html` do Drei ou botoes R3F reais para os controles:
     - ligar/parar;
     - audio ON/OFF;
     - aceleracao +/- ou presets;
     - stress test;
     - capacity test.
   - Para "stress/capacidade" nesta primeira implementacao, usar presets que ajustam `running` e `throttle`:
     - stress: liga teste e eleva throttle para faixa alta;
     - capacity: liga teste e usa faixa media/alta estavel.

4. Remover/ocultar painel externo Wankel antigo
   - Remover o bloco `Teste Motor Wankel` de `RealSimUI` ou esconder no modo fullscreen.
   - Preferencia: esconder no modo fullscreen e manter fallback se `RealSimulator` for usado como card no futuro.
   - Para isso, adicionar prop opcional em `RealSimUI`, por exemplo `showEngineOverlay?: boolean`.

5. Audio Wankel
   - Atualizar `useWankelTestAudio` para deixar o MP3 mais audivel e consistente.
   - Preferencia tecnica:
     - criar `MediaElementAudioSourceNode` para o MP3;
     - conectar ao `masterGain`;
     - controlar volume por gain node, nao apenas por `HTMLAudioElement.volume`.
   - Se houver restricao de browser para reutilizacao do media element, garantir criacao unica por start/stop.
   - Ajustar ganho para ser perceptivel quando `audioEnabled=true` e `running=true`.
   - Manter fallback sintetizado.

6. Documentacao
   - Atualizar `analise-tecnica/tarefas/tarefa-atual.md` com implementacao/checks.
   - Atualizar `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md` substituindo "Painel externo Teste Motor Wankel" por monitor/balcao de teste.
   - Atualizar `historico-etapas.md` se a mudanca visual/operacional for relevante para release.

Escopo fora:

- Nao alterar Arena.
- Nao alterar home/menu/navegacao global.
- Nao criar fisica real de stress/capacidade do motor alem de presets visuais/operacionais.
- Nao normalizar ou editar arquivos MP3.
- Nao reformatar arquivos amplos fora dos pontos alterados.

Criterios de aceite:

- Scroll do mouse no Canvas da Oficina aproxima/afasta a camera.
- Scroll sobre controles HTML/inputs nao deve alterar a camera de forma indevida.
- Ao abrir a Oficina, o zoom inicial mostra melhor a sala, kart e area de trabalho.
- Controles Wankel ficam acessiveis em monitor/balcao dentro da cena.
- Monitor mostra dados de teste com area informativa dominante e controles touchscreen separados.
- Audio do Wankel fica audivel quando audio esta ON e bancada/teste esta rodando.
- Build passa.

### Status RPI

Concluido. Implementacao liberada por `[Concluir RPI]` e executada.

## Implementacao

Executada em 2026-05-16.

- `CameraController` passou a escutar `wheel` no `gl.domElement` quando a Oficina esta em fullscreen.
- Zoom por scroll agora desloca a camera ao longo do vetor camera -> alvo, com limites para evitar entrar na cena ou afastar demais.
- `HOME_FULLSCREEN` foi recalibrado para abrir mais a vista inicial da Oficina.
- Foco fullscreen da sala acustica foi levemente recuado.
- `RealSimulator` passou a usar camera fullscreen mais aberta (`fov 40`) e encaminhar controles Wankel reais para `Workshop`.
- `Workshop` recebeu `EngineTestControls` e criou o balcao/monitor `Wankel Test Bench`.
- O monitor usa `Html` acoplado a cena para ter botoes touchscreen reais.
- A tela do monitor prioriza dados/telemetria/grafico e reserva uma faixa lateral para controles:
  - ligar/parar;
  - audio;
  - stress;
  - capacidade;
  - aceleracao.
- `RealSimUI` recebeu `showEngineOverlay` e oculta o painel Wankel antigo no modo fullscreen.
- `useWankelTestAudio` passou a conectar o MP3 `wankel-test-room-engine.mp3` ao grafo Web Audio via `MediaElementAudioSourceNode` e gain dedicado.
- Documentacao do inventario de interfaces atualizada para substituir o painel externo pelo monitor/balcao.

## Arquivos Impactados

- `analise-tecnica/tarefas/tarefa-atual.md`
- Provaveis apos Research:
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/CameraController.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/engineTest.ts`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - documentacao tecnica em `analise-tecnica/documentacao-partes/`.

## Riscos Tecnicos

- Conflitar controle de camera por scroll com inputs/sliders da UI.
- Aproximar/afastar camera demais e prejudicar leitura de kart, sala acustica ou paineis.
- Duplicar estado de teste Wankel entre overlay HTML e monitor 3D.
- Criar controles 3D que parecam interativos, mas nao sejam clicaveis.
- Mexer em audio e quebrar fallback ou gesto obrigatorio do navegador.
- Aumentar complexidade visual da Oficina e cobrir informacoes existentes.
- Esbarrar em pendencias Prettier preexistentes em arquivos amplos.

## Checks Planejados

- `git status --short --branch` antes de alterar codigo.
- Research de camera, UI, som Wankel e geometria da oficina.
- Revisao de diff apos implementacao.
- `npm run build`.
- Lint focado nos arquivos alterados quando viavel.
- Validacao manual/HTTP de `/simulador-real`.
- Validacao manual do zoom por scroll e controles/monitor do motor.

## Checks Executados

- `git status --short --branch`: branch `main`, apenas pastas nao rastreadas `sounds-trilha/` e `chamado-correções-erros-prints/` no inicio da tarefa.
- Research concluido nos arquivos:
  - `src/components/realsim/CameraController.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - `src/components/realsim/engineTest.ts`
  - `src/components/audio/audioAssets.ts`
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- `[Concluir RPI]` recebido em 2026-05-16.
- Implementacao de zoom, monitor/balcao e audio executada.
- `npx eslint src\components\realsim\CameraController.tsx src\components\realsim\RealSimulator.tsx src\components\realsim\RealSimUI.tsx src\components\realsim\Workshop.tsx src\components\realsim\hooks\useWankelTestAudio.ts`: aprovado apos autofix focado.
- `git diff --check`: aprovado, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- Validacao HTTP de `http://127.0.0.1:5173/simulador-real`: 200.
- `[Finalizar Tarefa]` recebido em 2026-05-16.
- Revisao final de diff: concluida, escopo restrito a zoom da Oficina, monitor/balcao Wankel, audio Wankel e documentacao.
- `git diff --check`: aprovado no fechamento, com apenas avisos LF/CRLF do Windows.
- `npx eslint src\components\realsim\CameraController.tsx src\components\realsim\RealSimulator.tsx src\components\realsim\RealSimUI.tsx src\components\realsim\Workshop.tsx src\components\realsim\hooks\useWankelTestAudio.ts`: aprovado no fechamento.
- `npm run build`: aprovado no fechamento.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.

## Fechamento

- Finalizada em: 2026-05-16.
- Commit: criado no fechamento da tarefa; hash final informado ao usuario.

## Notas Para Release

- Oficina ganha zoom por scroll e novo painel de teste do motor Wankel em formato de monitor/balcao.
