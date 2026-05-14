# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-14

## Titulo

Melhorar a visualizacao da sala acustica do motor Wankel

## Objetivo

Evoluir a leitura visual e tecnica da sala acustica onde o motor Wankel e testado, mantendo coerencia com a oficina de engenharia do RL Kart 26A.

## Escopo

- Avaliar a sala acustica existente no simulador real.
- Identificar melhorias visuais para isolamento sonoro, dinamometro, exaustao, bancada e sinalizacao.
- Preservar o motor Wankel procedural e a integracao atual com a oficina.
- Definir criterios de aceite antes de qualquer implementacao.

## Subtarefas

- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: implementar melhorias aprovadas no RPI.

## RPI

### Research

- `AcousticEngineRoom` vive em `src/components/realsim/Workshop.tsx`.
- A sala atual contem:
  - base elevada;
  - parede traseira e laterais;
  - paineis acusticos simples;
  - teto e barra de luz;
  - `EngineTestRig` reutilizando `WankelEngine`;
  - placa `SALA ACUSTICA · TESTE MOTOR WANKEL`;
  - subtitulo `ISOLAMENTO SONORO · DINAMOMETRO · EXAUSTAO`;
  - uma divisoria/transparencia lateral.
- `EngineTestRig` vive em `src/components/realsim/parts/MotorAssembly.tsx` e ja representa bancada/dinamometro basico com motor Wankel em escala reduzida.
- O catalogo de partes exige que a sala:
  - fique dentro da oficina atual;
  - contenha paineis acusticos, bancada/dinamometro e sinalizacao;
  - represente isolamento sonoro, exaustao e teste controlado.
- O requisito minimo ja existe, mas a leitura visual ainda e fraca nos seguintes pontos:
  - exaustao nao esta clara como sistema dedicado da sala;
  - nao ha instrumentacao acustica evidente, como medidores, microfones ou leitura dB;
  - paineis acusticos sao planos e repetitivos, com pouca profundidade;
  - bancada nao comunica bem carga/dinamometro e conexoes de teste;
  - a sala poderia ter bordas, porta/vidro tecnico e indicadores de seguranca mais reconheciveis.

### Plan

Implementar uma evolucao visual concentrada em `AcousticEngineRoom`, mantendo o motor Wankel e a bancada existentes.

Escopo dentro:

1. Melhorar isolamento e leitura arquitetonica:
   - adicionar porta/vidro tecnico na lateral ou frente;
   - criar molduras metalicas e selos de vedacao;
   - dar mais profundidade aos paineis acusticos com alternancia de relevo.
2. Evidenciar exaustao:
   - adicionar duto/exaustor conectado ao lado ou teto;
   - incluir grelha, flange e luz de status.
3. Evidenciar medicao acustica:
   - adicionar microfones/sensores em torno da bancada;
   - adicionar pequena tela/placa interna com leitura dB e RPM, preferencialmente visual, sem depender de nova telemetria.
4. Reforcar dinamometro/teste controlado:
   - adicionar rolo/carga, cabos ou suportes ao `EngineTestRig` se necessario;
   - manter a funcao de reutilizar `WankelEngine`.
5. Atualizar documentacao:
   - `catalogo-partes.md` com requisitos refinados da sala;
   - `historico-etapas.md` com a nova etapa;
   - possivelmente `inventario-cena-interfaces.md` se for criada tela informativa operacional.

Escopo fora:

- Nao alterar o motor Wankel instalado no kart.
- Nao alterar pivots do motor removivel.
- Nao criar nova fonte de telemetria real.
- Nao refatorar a oficina inteira.

Criterios de aceite:

- A sala deve ser reconhecivel como uma sala acustica de ensaio mesmo sem ler os textos.
- O sistema de exaustao deve ficar visualmente claro.
- Deve haver instrumentos visuais de medicao acustica/teste.
- O motor Wankel e o `EngineTestRig` devem continuar presentes e alinhados.
- O build deve passar apos a implementacao.

Checks previstos:

- `npm run build`.
- Revisao de diff.
- Validacao visual manual em `/simulador-real`.

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
- Validacao visual da rota `/simulador-real`, se houver mudanca de cena.

## Checks Executados

- `git status --short --branch`: branch `main` limpa antes da abertura.
- Research de `Workshop.tsx`, `MotorAssembly.tsx`, catalogo, historico, mapa de componentes e inventario de interfaces.
- `npm run build`: passou. Avisos conhecidos de `@import` CSS e chunks grandes permanecem.
- Revisao de diff final: concluida, escopo restrito a sala acustica Wankel e documentacao da tarefa.

## Fechamento

- Finalizada em: 2026-05-14
- Commit: gerado no fechamento da tarefa.

## Notas Para Release

- **Alterado:** sala acustica do motor Wankel ganhou leitura visual mais clara de isolamento, exaustao, medicao acustica e teste controlado.
- **Adicionado:** vidro tecnico vedado, duto de exaustao, microfones/sensores, tela interna dB/RPM e detalhe de carga/dinamometro.
- **Tecnico:** documentacao de requisitos da sala acustica atualizada no catalogo de partes e historico de etapas.
