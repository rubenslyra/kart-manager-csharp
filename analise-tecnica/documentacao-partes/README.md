# Documentacao De Partes - RL Kart 26A

Data de criacao: 2026-05-13

Este diretorio documenta as partes, conjuntos e membros estruturais do kart usados no simulador tecnico 3D.

## Objetivo

- Manter um catalogo tecnico das partes visuais e funcionais do kart.
- Registrar onde cada parte vive no codigo.
- Definir criterios de montagem, pivots, encaixes e reversao.
- Separar historico por tarefas para facilitar revisao antes de commits definitivos.

## Arquivos

- `catalogo-partes.md`: lista de partes do veiculo e seus requisitos visuais/funcionais.
- `mapa-componentes.md`: relacao entre partes fisicas e componentes React/Three.js.
- `historico-etapas.md`: etapas de alteracao feitas ate aqui.
- `procedimento-reversao.md`: como reverter alteracoes isoladas quando uma proposta visual nao ficar boa.

## Convencoes

- Eixo `X`: largura do kart, esquerda/direita.
- Eixo `Y`: altura.
- Eixo `Z`: comprimento, com nariz do kart apontando para `+Z`.
- Unidades: 1 unidade Three.js = 1 metro.
- Pivot do kart completo: centro do chassi no nivel do solo.
- Pivot de rodas: centro geometrico do cubo.
- Pivot do motor removivel: base inferior central da placa/carcaca.

