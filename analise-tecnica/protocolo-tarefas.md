# Protocolo De Tarefas

Este documento define o fluxo operacional padrao para evolucao do RL Kart 26A dentro deste repositorio.

## Objetivo

Manter cada ciclo de trabalho rastreavel, validado e pronto para release notes, evitando alteracoes soltas sem contexto tecnico.

## SDD E RPI

O projeto adota SDD (Spec-Driven Development) com RPI:

1. Research.
2. Plan.
3. Implement.

Regra central:

- Nenhuma implementacao deve ser executada antes de o usuario escrever `[Concluir RPI]`.
- `[Iniciar RPI]` abre a fase de pesquisa e planejamento.
- `[Concluir RPI]` aprova o plano e libera a fase de implementacao.
- Implementar sem RPI concluido so e permitido se o usuario pedir explicitamente uma excecao.

## Marcador `[Iniciar Tarefa]`

Quando o usuario escrever `[Iniciar Tarefa]`, uma tarefa formal deve ser aberta.

### Abertura

1. Ler a solicitacao completa do usuario.
2. Identificar objetivo principal, escopo e resultado esperado.
3. Conferir o estado inicial do repositorio com `git status --short --branch`.
4. Criar ou atualizar `analise-tecnica/tarefas/tarefa-atual.md`.
5. Registrar:
   - titulo da tarefa;
   - data de abertura;
   - objetivo;
   - escopo inicial;
   - arquivos ou areas provaveis;
   - riscos tecnicos;
   - checks previstos.
6. Se a tarefa exigir alteracao de codigo, cena, UI, comportamento ou documentacao tecnica estrutural, orientar o usuario a abrir RPI com `[Iniciar RPI]`.
7. Nao iniciar implementacao enquanto `[Concluir RPI]` nao for recebido.

### Marcador `[Iniciar RPI]`

Quando o usuario escrever `[Iniciar RPI]`, iniciar a fase de Research e Plan da tarefa aberta.

#### Research

Objetivo: entender antes de alterar.

Atividades esperadas:

- Ler codigo relevante.
- Ler documentacao tecnica, contratos e historico de etapas.
- Identificar dependencias, estado atual, pontos de integracao e riscos.
- Verificar restricoes de UX, cena 3D, arquitetura e padroes do projeto.
- Registrar achados em `analise-tecnica/tarefas/tarefa-atual.md`.

#### Plan

Objetivo: transformar a pesquisa em proposta implementavel.

O plano deve conter:

- objetivo refinado;
- escopo dentro e fora;
- arquivos provaveis;
- subtarefas;
- criterios de aceite;
- checks previstos;
- riscos e rollback quando aplicavel;
- notas de release previstas, se houver impacto de produto.

Ao final do Plan:

- Apresentar o plano ao usuario.
- Aguardar `[Concluir RPI]`.
- Nao editar arquivos de implementacao antes da conclusao do RPI.

### Marcador `[Concluir RPI]`

Quando o usuario escrever `[Concluir RPI]`, considerar o Research/Plan aprovado e abrir a fase Implement.

### Implement

Depois de `[Concluir RPI]`:

- Fazer alteracoes de forma incremental e coerente com o padrao existente.
- Evitar refatoracoes fora do escopo.
- Atualizar documentacao quando a mudanca criar ou alterar conceito tecnico.
- Validar visualmente quando a tarefa envolver UI, cena 3D, simulador ou experiencia do usuario.
- Manter notas suficientes para gerar commit e release notes no fechamento.
- Atualizar `analise-tecnica/tarefas/tarefa-atual.md` com progresso, arquivos impactados e checks executados.

### Estado Da Tarefa

O arquivo `analise-tecnica/tarefas/tarefa-atual.md` deve representar a tarefa aberta mais recente.

Estrutura sugerida:

```md
# Tarefa Atual

Status: aberta
Aberta em: AAAA-MM-DD

## Titulo

## Objetivo

## Escopo

## Subtarefas

## RPI

### Research

### Plan

### Status RPI

Pendente | Em andamento | Concluido

## Arquivos Impactados

## Checks Planejados

## Checks Executados

## Notas Para Release
```

## Marcador `[Finalizar Tarefa]`

Quando o usuario escrever `[Finalizar Tarefa]`, a tarefa aberta deve ser encerrada.

### Validacao

Antes do commit:

1. Revisar `git status --short`.
2. Revisar `git diff` dos arquivos alterados.
3. Confirmar que nao ha arquivos fora do escopo.
4. Rodar checks proporcionais ao risco:
   - `npm run build` para alteracoes TypeScript, React, Vite ou Three.js;
   - `npm run lint` quando a mudanca tocar padroes gerais de codigo;
   - testes especificos se existirem e forem relevantes;
   - validacao visual quando houver mudancas em UI ou cena.
5. Registrar avisos conhecidos separadamente de falhas reais.

### Commit

Criar commit quando houver mudancas confirmadas.

Padrao de titulo:

```txt
milestone: <resumo curto da entrega>
```

ou, quando for uma correcao pequena:

```txt
fix: <resumo curto da correcao>
```

Descricao recomendada para commits com mais de uma parte:

```txt
Resumo:
- <item principal>
- <item principal>

Subtarefas:
1. <subtarefa concluida>
2. <subtarefa concluida>

Checks:
- <comando executado>: <resultado>

Notas de Release:
- <nota objetiva para usuario/produto>
```

Usar descricao estruturada quando houver:

- multiplos arquivos ou subsistemas impactados;
- alteracao de comportamento;
- documentacao nova;
- mudanca visual relevante;
- criacao ou encerramento de etapa tecnica.

### Fechamento

Ao finalizar:

- Atualizar `analise-tecnica/tarefas/tarefa-atual.md` para `Status: finalizada`.
- Registrar hash do commit.
- Registrar checks executados.
- Registrar notas de release.
- Informar ao usuario:
  - commit criado;
  - resumo tecnico;
  - checks;
  - pendencias ou riscos residuais.

## Notas De Release

Notas de release devem ser escritas para explicar impacto real da mudanca, nao apenas arquivos alterados.

Formato recomendado:

- **Adicionado:** novo recurso, cena, painel, documento ou capacidade.
- **Alterado:** comportamento, visual, fluxo ou criterio.
- **Corrigido:** problema resolvido.
- **Tecnico:** ajuste interno relevante para manutencao.
- **Validacao:** checks executados e resultado.

## Regras Gerais

- Respeitar o bloqueio RPI: sem `[Concluir RPI]`, nao implementar.
- Nao commitar alteracoes sem validacao proporcional ao escopo.
- Nao misturar tarefas independentes no mesmo commit.
- Nao reverter mudancas existentes sem pedido explicito.
- Se houver alteracao visual, manter coerencia com o padrao tecnico/futurista do RL Kart 26A.
- Se um novo elemento de cena ou parte tecnica for criado, documentar em `analise-tecnica/documentacao-partes/` quando aplicavel.
