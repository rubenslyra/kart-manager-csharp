# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-16

## Titulo

Reorganizar navegacao, arena de corrida e oficina em telas dedicadas

## Objetivo

Reduzir redundancias de navegacao e separar as experiencias principais do projeto: a arena de corrida e a oficina devem virar telas full body dedicadas, enquanto a home deve concentrar paineis de replay, metricas, telemetrias, historicos e estatisticas.

## Escopo

- Renomear a entrada/botao hoje chamado `Simulador Real` para `Oficina` ou termo equivalente mais adequado ao que acontece naquela tela.
- Remover o item `Simulador` do menu principal, ja que existe acesso dedicado no canto direito.
- Substituir o nome atual `Simulador` da arena de corrida por uma nomenclatura mais clara dentro do refactor.
- Tirar a arena de corrida da caixa/preview na home da SPA e apresenta-la como tela full body.
- Tirar a oficina da caixa/preview equivalente, caso exista, e apresenta-la como tela full body.
- Manter a home focada em replay, metricas, telemetrias, historicos e estatisticas de corridas, alem de historicos e estatisticas de reparacoes.
- Adicionar botao de voltar a home na arena e na oficina.
- Padronizar a saida da arena e da oficina com caixa de dialogo perguntando se o usuario realmente deseja sair.
- Preservar rotas, estado e funcionalidades existentes sempre que possivel.

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
- Rotas principais:
  - `src/routes/index.tsx` renderiza a home com `Nav`, `Hero`, `ProjectOverview`, `Lessons`, `States`, `Stack`, `SimulatorScene`, `Sprints` e `Footer`.
  - A home importa diretamente `SimulatorScene`, criando a caixa/preview de corrida dentro da SPA.
  - `src/routes/simulator.tsx` ja existe como rota dedicada para a experiencia de corrida e passa `fullscreen` para `SimulatorScene`.
  - `src/routes/simulador-real.tsx` ja existe como rota dedicada para a oficina/simulador real.
- Navegacao:
  - `src/components/rl/Nav.tsx` contem links de menu: `Projeto`, `Aulas`, `Estados`, `Stack`, `Simulador`, `Sprints`.
  - O mesmo componente tambem contem botoes de rota no canto direito: `/simulator` com label `Simulador` e `/simulador-real` com label `Simulador Real`.
  - A redundancia apontada pelo usuario existe: ha um item de menu `#simulator` e um botao dedicado para `/simulator`.
- Hero:
  - `src/components/rl/Hero.tsx` tem CTA `Iniciar Simulador` para `/simulator`.
  - Tambem tem CTA `Simulador Real (Oficina)` para `/simulador-real`.
  - O texto menciona "do simulador 3D ao prototipo fisico".
- Arena de corrida:
  - `src/components/simulator/SimulatorScene.tsx` recebe `fullscreen?: boolean`.
  - Mesmo com `fullscreen`, o componente ainda renderiza `<section id="simulator" className="relative py-24">`, container `max-w-7xl`, grid e um painel `panel corner-cut`.
  - `fullscreen` hoje muda apenas a altura do viewport: `h-[calc(100vh-200px)] min-h-[520px]`; nao torna a cena realmente full body.
  - O componente tambem contem titulo interno `06 / Simulador 3D` e `RL KART · Live Scene`, alem de controles, telemetria, replay, setup, ghost, HUD e debug.
- Oficina:
  - `src/components/realsim/RealSimulator.tsx` renderiza um container com `h-[80vh] min-h-[640px]`, `corner-cut`, borda e background.
  - `src/routes/simulador-real.tsx` envolve `RealSimulator` em `Nav`, `Footer`, container `max-w-7xl`, titulo `Simulador Real — Oficina` e link `Ir para Simulador Atual`.
  - Portanto a oficina tambem nao esta full body hoje.
- Dialogo de confirmacao:
  - `src/components/ui/alert-dialog.tsx` ja disponibiliza componentes Radix/shadcn para confirmacao: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogAction`, `AlertDialogCancel`, etc.
  - E melhor reutilizar esse padrao para os botoes de voltar a home em arena e oficina.
- Documentacao:
  - `analise-tecnica/analise-projeto.md` lista `/simulator` como simulador 3D interativo de corrida/kart e `/simulador-real` como oficina tecnica.
  - `historico-etapas.md`, `catalogo-partes.md` e `inventario-cena-interfaces.md` usam "simulador" em contexto tecnico. Nem todos precisam ser renomeados; o impacto de produto deve ser registrado em historico/documentacao quando a estrutura mudar.

Conclusao do Research:

- A menor mudanca estrutural segura e manter os paths `/simulator` e `/simulador-real` para compatibilidade, mas alterar a linguagem visivel:
  - `/simulator` passa a ser apresentado como `Arena` ou `Arena de Corrida`.
  - `/simulador-real` passa a ser apresentado como `Oficina`.
- A home deve parar de renderizar `SimulatorScene` e deve receber uma secao de dados/operacao, sem experiencia 3D interativa embutida.
- Arena e oficina devem remover `Nav`/`Footer` e containers institucionais das suas rotas, usando controles internos de retorno com confirmacao.
- O padrao de confirmacao pode ser um componente compartilhado simples para evitar duplicacao.

### Plan

Plano para executar apos `[Concluir RPI]`:

1. Navegacao e nomenclatura
   - Remover `{ href: "#simulator", label: "Simulador" }` de `src/components/rl/Nav.tsx`.
   - Alterar o botao `/simulator` para `Arena` ou `Arena de Corrida`.
   - Alterar o botao `/simulador-real` para `Oficina`.
   - Atualizar CTAs da `Hero`:
     - `Iniciar Simulador` -> `Entrar na Arena` ou `Arena de Corrida`.
     - `Simulador Real (Oficina)` -> `Abrir Oficina`.
   - Manter os paths atuais para nao quebrar links existentes.

2. Home como dashboard/central
   - Remover import e renderizacao de `SimulatorScene` em `src/routes/index.tsx`.
   - Criar uma secao nova na home, por exemplo `OperationsDashboard`, em `src/components/rl/OperationsDashboard.tsx`.
   - Essa secao deve conter apenas informacao operacional, sem Canvas/cena 3D:
     - replay e ultimas sessoes;
     - metricas de corrida;
     - telemetria resumida;
     - historico/estatisticas de corridas;
     - historico/estatisticas de reparacoes/oficina.
   - Inserir essa secao onde a caixa do simulador aparecia, antes de `Sprints`.
   - Ajustar indices/textos se necessario para nao ficar "06 / Simulador 3D" na home.

3. Arena full body
   - Em `src/routes/simulator.tsx`, remover `Nav`, `Footer`, container superior institucional e link simples.
   - Apresentar a rota como tela imersiva de altura minima `100vh`, com topo compacto sobreposto ou integrado.
   - Atualizar meta title/description para `Arena de Corrida`.
   - Alterar `SimulatorScene` para quando `fullscreen=true`:
     - usar `section` full body sem `py-24` e sem `max-w-7xl`;
     - usar grid/layout que ocupe a tela inteira;
     - remover ou reduzir moldura `panel corner-cut` do viewport principal;
     - manter telemetria/controles em painel lateral sem encaixar a arena dentro de uma caixa de home.
   - Preservar HUD, replay, setup, telemetria, IA, ghost, audio e controles existentes.

4. Oficina full body
   - Em `src/routes/simulador-real.tsx`, remover `Nav`, `Footer`, container institucional e link lateral para simulador atual.
   - Atualizar meta title/description para `Oficina — RL Kart 26A`.
   - Permitir que `RealSimulator` receba prop opcional, por exemplo `fullscreen`, para aplicar:
     - `min-h-screen`;
     - sem container externo `max-w-7xl`;
     - sem borda/moldura de card principal quando estiver em rota dedicada;
     - Canvas ocupando a area principal com UI sobreposta existente.
   - Renomear titulo visivel da rota para `Oficina` se houver titulo externo mantido; preferencia: header compacto interno/overlay.
   - Preservar checklist, importacao de DLL, auditoria, foco de cena, teste Wankel e telemetria.

5. Confirmacao padronizada de saida
   - Criar um componente compartilhado, por exemplo `src/components/rl/ConfirmHomeExit.tsx` ou `src/components/shared/ConfirmHomeExit.tsx`.
   - Usar `AlertDialog` existente.
   - O componente deve exibir pergunta clara, por exemplo:
     - `Deseja realmente sair da Arena?`
     - `Deseja realmente sair da Oficina?`
   - A acao confirmada navega para `/`.
   - A acao cancelar fecha o dialogo sem alterar estado.
   - Usar o mesmo componente nas duas rotas para manter padrao.

6. Documentacao
   - Atualizar `analise-tecnica/tarefas/tarefa-atual.md` com implementacao e checks quando a fase abrir.
   - Atualizar `analise-tecnica/documentacao-partes/historico-etapas.md` com uma nova etapa de reorganizacao estrutural da navegacao/experiencias.
   - Atualizar `analise-tecnica/analise-projeto.md` se a descricao das rotas/home ficar desatualizada.

Escopo fora:

- Nao renomear fisicamente as rotas nesta primeira passada, para evitar quebrar links e `routeTree.gen.ts`.
- Nao refatorar internamente toda a arquitetura de `SimulatorScene` ou `RealSimulator` alem do necessario para full body.
- Nao mexer nos arquivos de audio nem na pasta `sounds-trilha/`.
- Nao corrigir todos os erros Prettier existentes do projeto nesta tarefa.

Criterios de aceite:

- O menu principal nao mostra mais `Simulador` como ancora da home.
- Os acessos dedicados mostram `Arena`/`Arena de Corrida` e `Oficina`, sem `Simulador Real` como label principal.
- A home nao renderiza a arena de corrida em uma caixa/canvas.
- A home mostra paineis de replay, metricas, telemetria, historicos e estatisticas de corrida/oficina.
- `/simulator` abre a arena em tela full body.
- `/simulador-real` abre a oficina em tela full body.
- Arena e oficina tem botao para voltar a home.
- Ao acionar voltar, ambas exibem caixa de confirmacao antes de navegar.
- Build de producao passa.

### Status RPI

Concluido. Implementacao liberada por `[Concluir RPI]` e executada.

## Implementacao

Executada em 2026-05-16.

- Removido o item `Simulador` do menu principal da home.
- Botao dedicado de corrida renomeado para `Arena`.
- Botao dedicado de `Simulador Real` renomeado para `Oficina`.
- CTAs da hero ajustados para `Entrar na Arena` e `Abrir Oficina`.
- Home deixou de renderizar `SimulatorScene` como caixa/canvas interno.
- Criada `OperationsDashboard` para centralizar replay, metricas, telemetria, historicos e estatisticas de corrida/oficina.
- Criado `ConfirmHomeExit` reutilizando `AlertDialog` para padronizar confirmacao de saida.
- Rota `/simulator` passou a apresentar a arena em tela full body, sem `Nav`/`Footer` da home.
- Rota `/simulador-real` passou a apresentar a oficina em tela full body, sem `Nav`/`Footer` da home.
- `RealSimulator` recebeu prop `fullscreen` para adaptar o container principal.
- `SimulatorScene` passou a adaptar section, container, grid, viewport e painel lateral no modo `fullscreen`.
- Documentacao tecnica atualizada com nova separacao entre dashboard, arena e oficina.

## Arquivos Impactados

- `analise-tecnica/tarefas/tarefa-atual.md`
- `src/routes/index.tsx`
- `src/routes/simulator.tsx`
- `src/routes/simulador-real.tsx`
- `src/components/rl/Nav.tsx`
- `src/components/rl/Hero.tsx`
- `src/components/rl/OperationsDashboard.tsx`
- `src/components/rl/ConfirmHomeExit.tsx`
- `src/components/simulator/SimulatorScene.tsx`
- `src/components/realsim/RealSimulator.tsx`
- `analise-tecnica/analise-projeto.md`
- `analise-tecnica/documentacao-partes/historico-etapas.md`

## Riscos Tecnicos

- Quebrar rotas existentes ou links de acesso rapido.
- Misturar responsabilidade da home com experiencias imersivas full body.
- Criar navegacao inconsistente entre arena e oficina.
- Perder estado de simulacao/oficina ao sair sem confirmacao clara.
- Introduzir dialogo duplicado em vez de reutilizar padroes/componentes existentes.
- Alterar nomes visiveis sem atualizar documentacao tecnica e historico.
- Esbarrar em erros de lint/Prettier preexistentes ao tocar arquivos amplos.

## Checks Planejados

- `git status --short --branch` antes de alterar codigo.
- Research da estrutura de rotas, menu, home, arena e oficina.
- Revisao de diff apos implementacao.
- `npm run build`.
- Lint focado nos arquivos alterados quando viavel.
- Validacao manual das rotas/telas:
  - home;
  - arena de corrida full body;
  - oficina full body;
  - dialogo de confirmacao ao voltar para home.

## Checks Executados

- `git status --short --branch`: branch `main`, apenas `sounds-trilha/` nao rastreado no inicio da tarefa.
- Protocolo de tarefas consultado.
- Research concluido nos arquivos:
  - `src/routes/index.tsx`
  - `src/routes/simulator.tsx`
  - `src/routes/simulador-real.tsx`
  - `src/routes/__root.tsx`
  - `src/components/rl/Nav.tsx`
  - `src/components/rl/Hero.tsx`
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/ui/alert-dialog.tsx`
  - `analise-tecnica/analise-projeto.md`
- `[Concluir RPI]` recebido em 2026-05-16.
- Implementacao estrutural executada.
- `git diff --check`: aprovado, com apenas avisos LF/CRLF do Windows.
- `npx eslint src\routes\index.tsx src\routes\simulator.tsx src\routes\simulador-real.tsx src\components\rl\Nav.tsx src\components\rl\Hero.tsx src\components\rl\OperationsDashboard.tsx src\components\rl\ConfirmHomeExit.tsx src\components\realsim\RealSimulator.tsx`: aprovado.
- `npx eslint src\components\simulator\SimulatorScene.tsx`: falhou por erros de Prettier preexistentes no arquivo e um warning `react-hooks/exhaustive-deps` ja existente.
- `npm run build`: aprovado.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- Dev server iniciado em `http://127.0.0.1:5173/`.
- Validacao HTTP:
  - `http://127.0.0.1:5173/`: 200.
  - `http://127.0.0.1:5173/simulator`: 200.
  - `http://127.0.0.1:5173/simulador-real`: 200.
- `[Finalizar Tarefa]` recebido em 2026-05-16.
- Revisao final de diff: concluida, escopo restrito a navegacao, home operacional, tela full body de arena/oficina, confirmacao de saida e documentacao.
- `git diff --check`: aprovado no fechamento, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado no fechamento.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- `npx eslint` focado em rotas, home, navegacao, dialogo e oficina: aprovado no fechamento.
- `npx eslint src\components\simulator\SimulatorScene.tsx`: falhou no fechamento por erros de Prettier preexistentes no arquivo e um warning `react-hooks/exhaustive-deps` ja existente.

## Fechamento

- Finalizada em: 2026-05-16.
- Commit: criado no fechamento da tarefa; hash final informado ao usuario.

## Notas Para Release

- A home passa a priorizar dados, historicos e estatisticas.
- Arena de corrida e oficina passam a ser acessos dedicados em tela cheia.
- Navegacao fica menos redundante e com confirmacao padronizada ao sair de experiencias imersivas.
