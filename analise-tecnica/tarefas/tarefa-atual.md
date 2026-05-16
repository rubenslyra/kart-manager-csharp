# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-16

## Titulo

Corrigir escala e enquadramento da oficina em tela cheia

## Objetivo

Resolver o problema visual em que a sala e o espaco de trabalho da oficina parecem encolhidos apos a mudanca para tela full body. A oficina deve ocupar melhor a tela, com sala, bancada, kart e area de trabalho escalados/enquadrados de forma proporcional ao novo layout.

## Escopo

- Investigar por que o container full body cresceu mas a cena interna da oficina nao acompanhou.
- Revisar `RealSimulator`, camera inicial, controles de camera e dimensoes da cena da oficina.
- Ajustar escala/enquadramento da oficina para o modo `fullscreen`.
- Preservar comportamento da oficina quando usada sem `fullscreen`.
- Preservar UI existente: checklist, auditoria, importacao de DLL, foco de cena, raio-X, wiring e teste Wankel.
- Nao alterar arena de corrida, home ou navegacao nesta tarefa.

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
  - `sounds-trilha/` permanece nao rastreado e fora do escopo.
- `src/routes/simulador-real.tsx`
  - A rota ja usa `RealSimulator fullscreen`.
  - O shell da rota esta full body (`min-h-screen`) e tem apenas overlay superior com `ConfirmHomeExit` e titulo `Oficina`.
  - Portanto o problema nao esta no shell da rota, mas no conteudo/camera da experiencia.
- `src/components/realsim/RealSimulator.tsx`
  - A prop `fullscreen` hoje muda apenas a classe do container:
    - fullscreen: `relative min-h-screen w-full overflow-hidden bg-card`.
    - nao-fullscreen: `h-[80vh] min-h-[640px] ... corner-cut border ...`.
  - O `Canvas` usa a mesma camera nos dois modos:
    - `camera={{ position: [2.6, 1.6, 2.8], fov: 45 }}`.
  - A cena interna tambem e a mesma: `Workshop`, `BackgroundMonitors`, `RealKart`, labels, wiring, x-ray, `CameraController`, postfx.
  - Conclusao: a tela cresceu, mas camera/fov/focos nao foram recalibrados para o novo aspect/area full body.
- `src/components/realsim/CameraController.tsx`
  - Define `HOME = { pos: [2.6, 1.6, 2.8], look: [0, 0.45, 0] }`.
  - No mount, a camera sempre copia `HOME.pos` e mira `HOME.look`.
  - Focos de modulo (`battery`, `brakes`, `steering`, `ignition`, `gearbox`) e foco de cena `acousticRoom` usam posicoes fixas.
  - Nao existe variante fullscreen para `HOME`, para o idle dolly, nem para o foco `acousticRoom`.
  - Em telas largas, a mesma camera/fov mostra mais piso/parede lateral, fazendo sala/bancada/oficina parecerem menores.
- `src/components/realsim/Workshop.tsx`
  - A escala da oficina e em metros/blueprint:
    - piso/grid: `40 x 40`;
    - paredes laterais em `x = +/-15`, parede traseira em `z = -8`;
    - kart e pad central perto de `[0,0,0]`;
    - bancada em `[5,0,-1.5]`;
    - sala acustica em `[7.2,0,3.9]`;
    - racks em `[-5.5,0,2]` e `[5.5,0,2]`.
  - A sala acustica em si tem dimensoes compactas (`2.6 x 2.1 x 1.8`), coerentes com a escala fisica, mas na vista fullscreen fica pequena por enquadramento.
  - Alterar a escala fisica de `Workshop` inteiro pode distorcer relacao com o kart; o ajuste preferivel e camera/fov/enquadramento.
- `src/components/realsim/RealSimUI.tsx`
  - Ha overlays absolutos:
    - topo esquerdo;
    - chips de foco no topo central;
    - toggles no topo central;
    - painel de telemetria no topo direito;
    - controles Wankel no topo/esquerda;
    - checklist no canto inferior direito;
    - mock DLLs no canto inferior esquerdo.
  - A camera fullscreen deve priorizar a area central livre, sem jogar sala/bancada diretamente atras desses paineis.

Conclusao do Research:

- A causa raiz e que o container full body foi expandido, mas a camera principal e o controlador continuam usando o preset do card antigo.
- A correcao deve criar presets visuais especificos para fullscreen:
  - camera inicial mais proxima/adequada;
  - fov menor ou diferente para aumentar presenca visual;
  - `HOME`/focos calibrados para mostrar kart, bancada e sala com melhor ocupacao da tela;
  - preservacao dos presets antigos no modo nao-fullscreen.
- Nao ha necessidade de mexer na arena, home ou navegacao.

### Plan

Plano para executar apos `[Concluir RPI]`:

1. Parametrizar `CameraController`
   - Adicionar prop opcional `fullscreen?: boolean`.
   - Criar presets separados:
     - `HOME_COMPACT` para o uso atual nao-fullscreen.
     - `HOME_FULLSCREEN` para a rota full body.
   - Ajustar `HOME_FULLSCREEN` com camera mais proxima e/ou mais baixa, mirando o miolo da oficina sem esconder a sala acustica.
   - Manter os focos de modulo existentes por padrao.
   - Se necessario, criar variante fullscreen apenas para `acousticRoom`, para que a sala nao pareca pequena quando o usuario escolhe esse foco.

2. Ajustar `RealSimulator`
   - Passar `fullscreen` para `CameraController`.
   - Ajustar `Canvas` camera conforme modo:
     - modo normal preserva `[2.6, 1.6, 2.8]` e `fov 45`;
     - modo fullscreen usa preset com `fov` menor ou posicao mais proxima.
   - Manter `RealSimulator` nao-fullscreen funcional para usos futuros.

3. Ajustar composicao fullscreen da oficina
   - Se camera/fov nao bastarem, adicionar grupo de cena `WorkshopStage` ou wrapper de `<group>` apenas para deslocamento visual fullscreen, sem alterar geometria fisica do kart.
   - Preferencia: evitar escala global do `Workshop`, porque isso pode quebrar relacao visual entre sala, kart, labels e wiring.
   - Se for necessario ampliar apenas contexto da oficina, aplicar deslocamento/composicao de camera antes de alterar escala.

4. Validacao
   - Rodar `npm run build`.
   - Rodar ESLint focado em `RealSimulator.tsx` e `CameraController.tsx`, se viavel.
   - Validar `/simulador-real` por HTTP.
   - Fazer revisao visual/manual no dev server:
     - vista inicial da oficina ocupa melhor a tela;
     - sala acustica e bancada nao ficam pequenas demais;
     - paineis da UI nao encobrem o foco principal;
     - focos de modulo continuam funcionando;
     - foco `Sala Acustica` continua legivel.

Escopo fora:

- Nao alterar arena de corrida.
- Nao mexer na home, menus ou CTAs.
- Nao redimensionar fisicamente todos os objetos da oficina sem necessidade.
- Nao formatar arquivos amplos fora dos pontos alterados.

Criterios de aceite:

- `/simulador-real` abre com oficina visualmente mais presente em tela cheia.
- A sala acustica, bancada e area de trabalho aparecem em escala/enquadramento proporcional ao viewport.
- O kart continua bem enquadrado na vista inicial.
- Focos e overlays existentes continuam utilizaveis.
- Modo nao-fullscreen de `RealSimulator` permanece sem regressao.
- Build passa.

### Status RPI

Concluido. Implementacao liberada por `[Concluir RPI]` e executada.

## Implementacao

Executada em 2026-05-16.

- `CameraController` recebeu prop `fullscreen`.
- Criado preset `HOME_FULLSCREEN` para aproximar e reenquadrar a oficina em tela cheia.
- Criada variante fullscreen para o foco `acousticRoom`, melhorando a leitura da sala acustica.
- `RealSimulator` passou a usar camera inicial especifica no modo fullscreen:
  - posicao `[4.15, 1.9, 4.55]`;
  - `fov` reduzido para `34`.
- `RealSimulator` passa `fullscreen` para `CameraController`.
- Container fullscreen da oficina trocado de `min-h-screen` para `h-screen min-h-[640px]`, garantindo altura explicita para o Canvas.
- `Canvas` recebeu `className="h-full w-full"` para ocupar toda a altura do container fullscreen.
- Modo nao-fullscreen preserva a camera anterior (`[2.6, 1.6, 2.8]`, `fov 45`).
- Nao houve alteracao de escala fisica do `Workshop`, kart ou sala.

## Arquivos Impactados

- `analise-tecnica/tarefas/tarefa-atual.md`
- Provaveis apos Research:
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/CameraController.tsx`
  - `src/components/realsim/Workshop.tsx`
  - documentacao tecnica se o contrato visual da oficina mudar.

## Riscos Tecnicos

- Ampliar a cena e causar cortes em paineis ou overlays da oficina.
- Corrigir fullscreen e quebrar a apresentacao nao-fullscreen do componente.
- Mudar camera e prejudicar focos de modulo, sala acustica, labels ou raio-X.
- Alterar escala fisica do kart/oficina de modo inconsistente com o blueprint.
- Esbarrar em pendencias Prettier preexistentes nos arquivos de cena.

## Checks Planejados

- `git status --short --branch` antes de alterar codigo.
- Research de `RealSimulator`, `CameraController` e `Workshop`.
- Revisao de diff apos implementacao.
- `npm run build`.
- Lint focado nos arquivos alterados quando viavel.
- Validacao manual/HTTP de `/simulador-real`.

## Checks Executados

- `git status --short --branch`: branch `main`, apenas `sounds-trilha/` nao rastreado no inicio da tarefa.
- Research concluido nos arquivos:
  - `src/routes/simulador-real.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/CameraController.tsx`
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/RealSimUI.tsx`
- `[Concluir RPI]` recebido em 2026-05-16.
- Implementacao de camera/enquadramento executada.
- `npx eslint src\components\realsim\RealSimulator.tsx src\components\realsim\CameraController.tsx`: aprovado.
- `git diff --check`: aprovado, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- Validacao HTTP de `http://127.0.0.1:5173/simulador-real`: 200.
- Correcao adicional apos analise visual do usuario:
  - causa ajustada: `Canvas` fullscreen nao tinha altura explicita via pai;
  - `RealSimulator` agora usa `h-screen` no modo fullscreen e `Canvas` com `h-full w-full`.
- `npx eslint src\components\realsim\RealSimulator.tsx src\components\realsim\CameraController.tsx`: aprovado apos correcao adicional.
- `git diff --check`: aprovado apos correcao adicional, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado apos correcao adicional.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- `[Finalizar Tarefa]` recebido em 2026-05-16.
- Revisao final de diff: concluida, escopo restrito a `RealSimulator`, `CameraController` e registro da tarefa.
- `git diff --check`: aprovado no fechamento, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado no fechamento.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- `npx eslint src\components\realsim\RealSimulator.tsx src\components\realsim\CameraController.tsx`: aprovado no fechamento.

## Fechamento

- Finalizada em: 2026-05-16.
- Commit: criado no fechamento da tarefa; hash final informado ao usuario.

## Notas Para Release

- Oficina em tela cheia passa a usar melhor a area visivel, sem parecer encolhida.
