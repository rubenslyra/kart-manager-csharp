# Instrucoes Operacionais Do Projeto

Este repositorio usa um protocolo de tarefas baseado em marcadores escritos pelo usuario.

## Marcadores

### `[Iniciar Tarefa]`

Quando o usuario escrever `[Iniciar Tarefa]`, tratar a proxima demanda como uma tarefa formal aberta.

Procedimento base:

- Identificar objetivo, escopo, arquivos provaveis e riscos.
- Registrar ou atualizar a tarefa em `analise-tecnica/tarefas/tarefa-atual.md`.
- Verificar estado inicial do git antes de editar.
- Executar a implementacao ate ficar funcional, salvo bloqueio real.
- Validar alteracoes com checks adequados ao escopo.
- Nao fazer commit automatico apenas por iniciar a tarefa.

### `[Finalizar Tarefa]`

Quando o usuario escrever `[Finalizar Tarefa]`, encerrar a tarefa aberta.

Procedimento base:

- Revisar diff e confirmar que o escopo esta coerente com a tarefa.
- Rodar checks relevantes, como `npm run build`, lint ou testes disponiveis.
- Atualizar documentacao tecnica, historico e notas de release quando aplicavel.
- Criar commit com titulo claro e descricao estruturada quando houver mudancas.
- A descricao do commit deve usar subitens, subtarefas, topicos e enumeracoes quando isso melhorar a rastreabilidade.
- Informar hash do commit, checks executados e pendencias residuais.

## Documentacao

O protocolo detalhado vive em:

- `analise-tecnica/protocolo-tarefas.md`

