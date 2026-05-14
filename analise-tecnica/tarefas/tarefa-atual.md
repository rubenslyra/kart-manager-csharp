# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-14

## Titulo

Adicionar botao de acesso/foco para a sala acustica Wankel

## Objetivo

Criar uma forma clara de o usuario acessar visualmente a sala acustica Wankel dentro do simulador real, sem depender de procurar manualmente a sala na cena 3D.

## Escopo

- Avaliar como o foco de camera funciona hoje no simulador real.
- Identificar onde adicionar um comando de UI para a sala acustica.
- Planejar se a sala sera integrada ao sistema existente de `focus` ou se precisara de um novo tipo de foco de cena.
- Garantir que o botao siga o padrao visual dos controles atuais.
- Definir criterios de aceite antes de implementar.

## Subtarefas

- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: implementar botao/foco aprovado no RPI.

## RPI

### Research

- `RealSimulator.tsx` mantem `focus` como `FocusTarget`, usado por kart, labels, cabos, raio-X, auditoria e camera.
- `FocusTarget` atual e estritamente modular: `battery`, `brakes`, `steering`, `ignition`, `gearbox` ou `null`.
- `RealSimUI.tsx` renderiza os chips de foco no topo: bateria, freios, direcao, ignicao e cambio.
- `CameraController.tsx` usa o mesmo `FocusTarget` para mover a camera entre alvos do kart.
- `ModuleLabels.tsx`, `Wiring.tsx` e `XRayOverlay.tsx` assumem que qualquer foco nao nulo e um modulo presente em `MODULE_ANCHORS`.
- Adicionar `acousticRoom` diretamente em `FocusTarget` aumentaria o risco de quebrar overlays ou exigir excecoes em varios componentes.
- Melhor opcao tecnica: separar foco de camera/cena do foco modular, mantendo os modulos atuais intactos.

### Plan

Implementar um foco de cena separado para a sala acustica.

Escopo dentro:

1. Criar um tipo de foco de camera que aceite:
   - focos modulares atuais;
   - novo foco de cena `acousticRoom`;
   - `null` para home.
2. Manter `FocusTarget` modular para `RealKart`, `ModuleLabels`, `Wiring`, `XRayOverlay` e `useAuditLog`.
3. Alterar `CameraController` para receber o novo tipo de foco de camera e incluir alvo da sala:
   - posicao aproximada olhando para `AcousticEngineRoom` em `[7.2, 0, 3.9]`;
   - camera mais aberta/lateral para ver vidro, exaustao e bancada.
4. Alterar `RealSimulator` para manter dois estados:
   - `focus`: modulo do kart;
   - `sceneFocus`: alvo de camera.
5. Alterar `RealSimUI`:
   - chips atuais continuam focando modulos;
   - adicionar botao `Sala Acustica` ou `Teste Wankel`;
   - ao clicar em modulo, limpar foco de cena;
   - ao clicar na sala, limpar foco modular e apontar a camera para a sala.
6. Atualizar documentacao de interfaces de cena e historico.

Escopo fora:

- Nao alterar a geometria da sala acustica nesta tarefa.
- Nao alterar contrato de telemetria.
- Nao transformar a sala em modulo do kart.

Criterios de aceite:

- Usuario ve um botao claro para acessar a sala acustica.
- Clicar no botao move a camera para a sala acustica Wankel.
- Clicar novamente ou `reset` volta ao estado home.
- Focos de bateria, freios, direcao, ignicao e cambio continuam funcionando.
- Labels, cabos e raio-X nao devem quebrar com foco da sala.
- `npm run build` deve passar.

### Status RPI

Concluido. Implement liberado por `[Concluir RPI]`.

## Arquivos Impactados

- `src/components/realsim/RealSimulator.tsx`
- `src/components/realsim/RealSimUI.tsx`
- `src/components/realsim/CameraController.tsx`
- `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- `analise-tecnica/documentacao-partes/historico-etapas.md`
- `analise-tecnica/tarefas/tarefa-atual.md`

## Checks Planejados

- Revisao de diff.
- `npm run build` apos implementacao.
- Validacao visual/manual em `/simulador-real`.

## Checks Executados

- `git status --short --branch`: branch `main` limpa antes da abertura.
- Research de `RealSimulator.tsx`, `RealSimUI.tsx`, `CameraController.tsx`, `parts/shared.ts`, `ModuleLabels.tsx`, `Wiring.tsx` e `XRayOverlay.tsx`.
- `npm run build`: passou. Avisos conhecidos de `@import` CSS e chunks grandes permanecem.
- Revisao de diff final: concluida, escopo restrito ao foco de cena da sala acustica e documentacao da tarefa.

## Fechamento

- Finalizada em: 2026-05-14
- Commit: gerado no fechamento da tarefa.

## Notas Para Release

- **Adicionado:** botao `Sala Acustica` para acessar diretamente a sala de teste Wankel.
- **Alterado:** camera agora possui foco de cena separado do foco modular do kart.
- **Tecnico:** labels, cabos, raio-X e auditoria continuam restritos aos modulos do kart.
