# Instrucoes Operacionais Do Projeto

Este repositorio usa um protocolo de tarefas baseado em marcadores escritos pelo usuario.

O processo de desenvolvimento segue SDD (Spec-Driven Development) com RPI:

- Research.
- Plan.
- Implement.

Nenhuma implementacao deve ser iniciada antes de o usuario escrever `[Concluir RPI]`.

## Marcadores

### `[Iniciar Tarefa]`

Quando o usuario escrever `[Iniciar Tarefa]`, tratar a proxima demanda como uma tarefa formal aberta.

Procedimento base:

- Identificar objetivo, escopo, arquivos provaveis e riscos.
- Registrar ou atualizar a tarefa em `analise-tecnica/tarefas/tarefa-atual.md`.
- Verificar estado inicial do git antes de editar.
- Nao executar implementacao ainda, a menos que a fase RPI ja tenha sido concluida.
- Nao fazer commit automatico apenas por iniciar a tarefa.

### `[Iniciar RPI]`

Quando o usuario escrever `[Iniciar RPI]`, abrir a fase SDD/RPI da tarefa.

Procedimento base:

- Executar Research: ler codigo, documentos, contratos e dependencias relevantes.
- Executar Plan: propor abordagem, subtarefas, riscos, checks e criterios de aceite.
- Registrar Research e Plan em `analise-tecnica/tarefas/tarefa-atual.md`.
- Bloquear qualquer Implement ate o usuario escrever `[Concluir RPI]`.

### `[Concluir RPI]`

Quando o usuario escrever `[Concluir RPI]`, considerar aprovado o Research/Plan e abrir a fase Implement.

Procedimento base:

- Confirmar rapidamente o plano aprovado.
- Executar a implementacao ate ficar funcional, salvo bloqueio real.
- Validar alteracoes com checks adequados ao escopo.
- Atualizar registros da tarefa com o que foi implementado.

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
