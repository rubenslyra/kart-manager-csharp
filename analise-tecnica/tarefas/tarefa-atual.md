# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-15

## Titulo

Tornar a pista de corrida visualmente mais evidente e legivel

## Objetivo

Melhorar a leitura visual da pista de corrida para que a evolucao do circuito fique clara na experiencia: layout mais evidente, camera inicial mais informativa, grid de largada, sinalizacao, arquibancada e protecoes mais visiveis.

## Escopo

- Avaliar a pista atual no simulador e por que ela ainda parece visualmente parecida.
- Revisar camera inicial, enquadramento e alvo do OrbitControls.
- Revisar contraste e materiais do asfalto, zebras, linhas, grid e protecoes.
- Tornar layout, curvas, chicane, hairpins e area de arquibancada mais reconheciveis.
- Adicionar ou reforcar sinalizacao visual da pista, como placas, nome do kartodromo, setas, grid e marcadores.
- Melhorar visibilidade de arquibancada, barreiras, muretas e cercas de contencao.
- Preservar regra de contato dos karts com a pista e nao mexer em audio nesta tarefa.

## Subtarefas

- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: implementar ajustes visuais apos aprovacao por `[Concluir RPI]`.
- Concluido: validacao final e fechamento da tarefa apos `[Finalizar Tarefa]`.

## RPI

### Research

Concluido em 2026-05-15.

- `src/components/simulator/SimulatorScene.tsx`
  - A camera fallback/default esta em `[-25, 25, -25]` com `fov={50}`.
  - O `OrbitControls` mira `[15, 0, 31]`, mas a camera inicial ainda nao enquadra o circuito completo de forma claramente panoramica.
  - `Confetti` tambem usa `[15, 0, 31]`, entao vale centralizar constantes visuais sem afetar replay.
- `src/components/simulator/TrackModel.tsx`
  - O circuito ja foi ampliado e usa `TRACK_SURFACE_OFFSET`, `TRACK_DECAL_OFFSET` e `TRACK_KERB_OFFSET`.
  - O asfalto esta no plano correto de contato, mas a cor escura sobre terreno escuro reduz a leitura da pista.
  - Ha linha tracejada central, zebras externas, pneus, muretas e cercas, porem todos sao discretos de longe.
  - O grid atual e basicamente a faixa quadriculada; faltam slots de largada, numeros, portal e placas grandes.
  - As zebras aparecem principalmente na borda externa; a borda interna e as areas de curva ainda nao desenham bem o circuito.
- `src/components/simulator/trackConfig.json`
  - Layout atual tem reta principal, curva rapida, hairpin externo, sweeper, chicane tecnica, workshop bend e hairpin final.
  - A arquibancada fica em `[88, 0.45, 58]`, fora da borda externa da area de curva.
- `src/components/simulator/Grandstand.tsx`
  - A arquibancada e grande em quantidade de assentos, mas usa materiais escuros e mira `lookAt(0, 0, 0)`.
  - Ela pode ficar pouco destacada no enquadramento inicial e pode nao apontar para o centro visual real da pista.
- `src/components/simulator/PitBoxes.tsx`
  - Boxes ficam proximos da largada e ja possuem textos e faixas emissivas.
  - Pads foram mantidos nivelados; qualquer reforco visual deve continuar sem criar degrau trafegavel.
- `src/components/simulator/ReplayCameras.tsx`
  - Replay assume camera apenas no fim/playback; alterar a camera inicial nao deve quebrar as cameras de replay.
- Documentacao
  - `catalogo-partes.md` exige que asfalto permaneça no plano de contato; linhas, zebras e marcadores so podem usar pequenos offsets.
  - Protecoes devem ficar fora da area trafegavel, acompanhar elevacao da pista e ficar entre pista e torcida.

Conclusao do Research:

- A pista mudou tecnicamente, mas a experiencia inicial ainda pode parecer igual porque o enquadramento e os marcos visuais nao comunicam o novo layout.
- O foco da implementacao deve ser contraste, sinalizacao, grid e composicao da cena, nao refazer a fisica nem o contrato de contato.

### Plan

Plano para executar apos `[Concluir RPI]`:

1. Camera e enquadramento inicial
   - Ajustar a camera fallback/default para uma vista alta e aberta do circuito.
   - Manter `OrbitControls` mirando o centro util da pista.
   - Preservar cameras de cockpit, chase, hood, split e replay.

2. Leitura do layout
   - Reforcar contraste do asfalto e do terreno ao redor.
   - Adicionar linhas laterais claras nas duas bordas usando apenas offset de decalque.
   - Adicionar zebras mais largas e mais visiveis em curvas relevantes, sem transformar em obstaculo fisico.
   - Adicionar runoff/areas pintadas em curvas para o desenho do circuito aparecer de longe.

3. Grid, largada e sinalizacao
   - Criar slots de grid com marcas no solo e numeros.
   - Adicionar portal/gantry de largada com nome do kartodromo.
   - Adicionar placas de curva, setas/chevrons e marcadores de direcao em pontos chave.

4. Arquibancada e protecoes
   - Melhorar visibilidade da arquibancada com cores, bandeiras, banner e orientacao para o centro da pista.
   - Reforcar visual de barreiras, muretas e cercas sem invadir a area trafegavel.
   - Adicionar placas/sponsor boards junto das protecoes para indicar claramente a separacao pista-torcida.

5. Documentacao
   - Atualizar historico/catalogo com a melhoria visual da pista, mantendo o contrato de superficie.

6. Checks
   - Revisar diff.
   - Rodar `npm run build`.
   - Validar visualmente em `/simulator` se a primeira vista mostra circuito, grid, arquibancada e protecoes.

Criterios de aceite:

- Ao abrir o simulador, a pista deve parecer claramente diferente e legivel ja na camera inicial.
- O circuito deve ter curvas e layout perceptiveis de longe.
- Grid, sinalizacao, arquibancada e protecoes devem ser reconheciveis sem depender de zoom.
- Karts nao devem afundar nem flutuar; elementos visuais de solo devem respeitar offsets pequenos.
- A tarefa nao deve alterar audio nem refazer a logica de corrida.

### Status RPI

Research e Plan concluidos. Implementacao liberada por `[Concluir RPI]` e executada.

## Implementacao

Concluida em 2026-05-15.

- Camera livre inicial reposicionada para vista alta e aberta, mirando o centro util do circuito.
- Asfalto e terreno tiveram contraste ajustado.
- Foram adicionadas linhas laterais continuas nas duas bordas da pista.
- Zebras ficaram mais largas e agora aparecem nos dois lados do circuito.
- Curvas principais receberam zonas de escape coloridas no solo como decalques.
- Grid de largada recebeu slots marcados e portal `KARTODROMO RL 26A`.
- Foram adicionadas placas grandes de curvas, setas/chevrons e placas de patrocinio junto ao perimetro de contencao.
- Arquibancada foi reorientada para o centro da pista e recebeu banner maior, cobertura, bandeiras e materiais mais claros.
- Contrato de superficie foi preservado: elementos de solo seguem usando offsets pequenos e nao alteram a altura trafegavel.

## Arquivos Impactados

- `analise-tecnica/tarefas/tarefa-atual.md`
- Provaveis apos RPI:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/TrackModel.tsx`
  - `src/components/simulator/trackConfig.json`
  - `src/components/simulator/Grandstand.tsx`
  - `src/components/simulator/PitBoxes.tsx`
  - `analise-tecnica/documentacao-partes/historico-etapas.md`
  - `analise-tecnica/documentacao-partes/catalogo-partes.md`

## Riscos Tecnicos

- Melhorar a leitura visual sem quebrar escala real da pista.
- Adicionar elementos demais e poluir a cena ou reduzir performance.
- Aumentar contraste sem perder coerencia com o estilo tecnico/futurista do projeto.
- Reforcar zebras/protecoes sem criar degraus que aparentem atravessar pneus.
- Alterar camera inicial e prejudicar controles livres, split ou replay.
- Misturar escopo de visual da pista com audio/sons ja finalizados.

## Checks Planejados

- `git status --short --branch` antes de alterar codigo.
- Research dos componentes visuais da pista.
- Revisao de diff apos implementacao.
- `npm run build` apos implementacao.
- Validacao visual/manual em `/simulator`.

## Checks Executados

- `git status --short --branch`: branch `main`, apenas `sounds-trilha/` nao rastreado antes da abertura.
- Research concluido nos componentes:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/TrackModel.tsx`
  - `src/components/simulator/trackConfig.json`
  - `src/components/simulator/Grandstand.tsx`
  - `src/components/simulator/PitBoxes.tsx`
  - `src/components/simulator/ReplayCameras.tsx`
  - `analise-tecnica/documentacao-partes/historico-etapas.md`
  - `analise-tecnica/documentacao-partes/catalogo-partes.md`
- Ultimos commits de referencia:
  - `758899f` - integracao de audio fornecido.
  - `74a638d` - primeira pista em escala do RL Kart.
  - `8e0b823` - iluminacao da sala e contato das rodas.
- `npm run build`: aprovado.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- `npm run lint`: falhou por erros de Prettier preexistentes e amplos no repositorio.
- `npx eslint src\components\simulator\TrackModel.tsx src\components\simulator\Grandstand.tsx`: aprovado apos formatacao dos componentes alterados.
- Dev server iniciado em `http://127.0.0.1:5173/`; rota `/simulator` respondeu `200`.
- `[Finalizar Tarefa]` recebido em 2026-05-16.
- Revisao final de diff: concluida, escopo restrito a leitura visual da pista, camera, sinalizacao, arquibancada e documentacao.
- `git diff --check`: aprovado, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado no fechamento.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- `npx eslint src\components\simulator\TrackModel.tsx src\components\simulator\Grandstand.tsx`: aprovado no fechamento.
- `npx eslint src\components\simulator\TrackModel.tsx src\components\simulator\Grandstand.tsx src\components\simulator\SimulatorScene.tsx`: falhou por erros de Prettier preexistentes em `SimulatorScene.tsx`.
- `npm run lint`: falhou por erros de Prettier preexistentes e amplos no repositorio.

## Fechamento

- Finalizada em: 2026-05-16.
- Commit: criado no fechamento da tarefa; hash final informado ao usuario.

## Notas Para Release

- Simulador de corrida agora abre com uma leitura mais clara do kartodromo.
- Pista recebeu camera inicial panoramica, grid, portal, sinalizacao de curvas, bordas continuas, zebras reforcadas, zonas de escape, arquibancada mais evidente e perimetro de protecao mais visivel.
- Audio e logica de corrida nao foram alterados nesta tarefa.
