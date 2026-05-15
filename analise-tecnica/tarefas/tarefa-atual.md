# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-14

## Titulo

Corrigir iluminacao da sala acustica e ajustar contato das rodas com a plataforma

## Objetivo

Melhorar a legibilidade visual da sala acustica Wankel e corrigir a percepcao de que as rodas do kart estao entrando no solo ou na plataforma da oficina.

## Escopo

- Avaliar iluminacao atual da sala acustica e da oficina.
- Avaliar altura da plataforma de inspecao, piso e contato visual das rodas.
- Identificar se o problema de contato vem da plataforma, do posicionamento do kart, do raio das rodas ou de materiais/reflexos.
- Planejar ajustes sem quebrar escala oficial do kart.
- Definir criterios de aceite antes de implementar.

## Subtarefas

- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: implementar iluminacao/ajustes de contato aprovados no RPI.

## RPI

### Research

- Em `Workshop.tsx`, a plataforma de inspecao e uma caixa com:
  - `position={[0, 0.01, 0]}`;
  - `boxGeometry args={[2.6, 0.02, 3.2]}`;
  - topo em `y = 0.02`.
- As rodas sao posicionadas em `BrakeSystem.tsx` com `wheelY = X.wheelRadius`.
- Em `RLKart26ADimensions.ts`, `wheelDiameter = 0.28`, logo `wheelRadius = 0.14`.
- Em `Wheels.tsx`, o pneu tem `TIRE_RADIUS = 0.14` e pivot central no cubo.
- Portanto, roda com centro em `y = 0.14` toca o solo em `y = 0`.
- A plataforma com topo em `y = 0.02` entra visualmente 2 cm dentro dos pneus.
- O comentario atual em `Workshop.tsx` diz que o kart fica em cima da plataforma, mas a escala/pivots atuais indicam que o kart esta calibrado para tocar o piso em `y = 0`.
- A sala acustica esta escura porque combina:
  - paredes em `#111820`;
  - paineis acusticos em `#202a35` e `#151c24`;
  - vidro com opacidade baixa;
  - apenas uma barra emissiva pequena e point lights relativamente discretos dentro da sala.
- A iluminacao geral da oficina nao privilegia a sala acustica, que fica deslocada para `[7.2, 0, 3.9]`.

### Plan

Implementar dois ajustes visuais controlados.

Escopo dentro:

1. Corrigir contato das rodas com a plataforma:
   - manter rodas e dimensoes oficiais sem alterar `wheelRadius`;
   - baixar a plataforma de inspecao para que o topo fique em `y = 0` ou ligeiramente abaixo;
   - ajustar o anel/outline RL para ficar quase no piso, sem parecer atravessar os pneus;
   - revisar comentario da plataforma para explicar que ela e um pad visual nivelado ao piso.
2. Melhorar iluminacao da sala acustica:
   - adicionar luz interna dedicada na sala, com intensidade suficiente para revelar bancada, vidro, duto e paineis;
   - aumentar leitura da barra de teto ou adicionar luzes laterais discretas;
   - clarear levemente materiais internos sem perder o aspecto acustico/industrial;
   - reforcar luz da bancada quando o teste Wankel estiver ligado;
   - evitar excesso de brilho ou lavagem da cena.
3. Documentar:
   - atualizar historico de etapas;
   - atualizar catalogo se a regra da plataforma/piso precisar ficar explicita.

Escopo fora:

- Nao alterar raio das rodas.
- Nao alterar pivots de rodas ou suspensao.
- Nao alterar dimensoes oficiais do kart.
- Nao refazer a oficina inteira.

Criterios de aceite:

- Rodas nao devem parecer entrar no piso/plataforma.
- Sala acustica deve ficar legivel sem depender apenas do teste ligado.
- Quando a bancada estiver ligada, a sala pode ganhar reforco de luz/status.
- O kart deve manter escala oficial e contato visual coerente com o piso.
- `npm run build` deve passar.

### Status RPI

Concluido. Implement liberado por `[Concluir RPI]`.

## Arquivos Impactados

- `src/components/realsim/Workshop.tsx`
- `analise-tecnica/documentacao-partes/catalogo-partes.md`
- `analise-tecnica/documentacao-partes/historico-etapas.md`
- `analise-tecnica/tarefas/tarefa-atual.md`

## Checks Planejados

- Revisao de diff.
- `npm run build` apos implementacao.
- Validacao visual/manual em `/simulador-real`.

## Checks Executados

- `git status --short --branch`: branch `main` limpa antes da abertura.
- Research de `Workshop.tsx`, `RealKart.tsx`, `Wheels.tsx`, `BrakeSystem.tsx`, `RLKart26ADimensions.ts` e `catalogo-partes.md`.
- `npm run build`: passou. Avisos conhecidos de `@import` CSS e chunks grandes permanecem.
- Revisao de diff final: concluida, escopo restrito a iluminacao da sala, plataforma e documentacao da tarefa.

## Fechamento

- Finalizada em: 2026-05-14
- Commit: gerado no fechamento da tarefa.

## Notas Para Release

- **Corrigido:** plataforma de inspecao nao atravessa mais visualmente os pneus.
- **Alterado:** sala acustica Wankel recebeu materiais mais legiveis e iluminacao interna reforcada.
- **Tecnico:** regra de contato das rodas com o piso foi documentada no catalogo de partes.
