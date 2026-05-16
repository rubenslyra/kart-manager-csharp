# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-16

## Titulo

Atualizar logo do projeto

## Objetivo

Atualizar o logo visual do projeto para usar a imagem fornecida pelo usuario:
marca horizontal `RL KART 26A`, com icone `RL` em placa azul e texto tecnico
ciano/branco.

## Escopo

- Substituir a composicao textual atual do logo pelo asset de imagem fornecido.
- Preservar a navegacao, rotas, textos e demais secoes da home.
- Garantir que o logo fique legivel no header e no footer.
- Ajustar responsividade para desktop e mobile sem estourar layout.
- Nao executar implementacao nesta etapa.
- Nao fazer commit automatico apenas por iniciar a tarefa.

## Estado Inicial Do Git

Verificado em 2026-05-16:

- Branch: `main`.
- Arquivos rastreados: sem modificacoes reportadas por `git status --short --branch`.
- Pastas nao rastreadas existentes antes da nova tarefa:
  - `chamado-correções-erros-prints/`
  - `sounds-trilha/`

## Artefatos Pendentes Observados

- `public/logo_kart_A26.png`
- `chamado-correções-erros-prints/image.png`
- `sounds-trilha/015522_Go Kart Racing Outdoors.mp3`
- `sounds-trilha/alex_jauk-old-kart-engine-idle-sound-191129-motor-quase-batendo.mp3`
- `sounds-trilha/motor-para-a-sala-de-teste.mp3`
- `sounds-trilha/som-apresentação-carro-testado.mp3`
- `sounds-trilha/som-motor-durante-corrida.mp3`
- `sounds-trilha/torcida-na-bandeirada.mp3`
- `sounds-trilha/torcida1.mp3`
- `sounds-trilha/torcida2-sobreposição-quando-carros-se-aproximam-da-torcida.mp3`

## Subtarefas

- Concluido: abrir tarefa formal e registrar estado inicial.
- Concluido: receber demanda concreta do usuario.
- Concluido: receber marcador `[Iniciar RPI]`.
- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: receber `[Concluir RPI]`.
- Concluido: implementar apos aprovacao do RPI.
- Concluido: validar alteracoes.
- Concluido: receber `[Finalizar Tarefa]`.
- Concluido: revisar diff final.
- Concluido: atualizar historico tecnico.
- Concluido: validar e fechar tarefa.

## RPI

Iniciado em 2026-05-16.

### Research

Concluido em 2026-05-16.

- Demanda recebida:
  - Atualizar o logo do projeto usando a imagem anexada pelo usuario.
- Estado atual do git no RPI:
  - Branch `main`.
  - `analise-tecnica/tarefas/tarefa-atual.md` modificado pelo registro da tarefa.
  - `public/logo_kart_A26.png` aparece como nao rastreado.
  - Pastas nao rastreadas preexistentes:
    - `chamado-correções-erros-prints/`
    - `sounds-trilha/`
- Asset de logo disponivel:
  - `public/logo_kart_A26.png`
  - Dimensoes: `922x218`.
  - Proporcao horizontal aproximada: 4.23:1.
  - Adequado para uso como imagem no header/footer com altura fixa e largura automatica.
- Pontos de uso do logo atual:
  - `src/components/rl/Logo.tsx`
    - Hoje renderiza marca por HTML/CSS:
      - bloco quadrado `RL`;
      - texto `LABS`;
      - texto `KART 26A`.
    - E o ponto central para alterar a marca em `Nav` e `Footer`.
  - `src/components/rl/Nav.tsx`
    - Usa `<Logo />` no header sticky.
    - Header usa `px-6 py-4`, logo precisa caber junto aos links e botoes `Arena`/`Oficina`.
  - `src/components/rl/Footer.tsx`
    - Usa `<Logo />` no rodape em layout flex responsivo.
- Referencias textuais `RL Kart 26A`, `DIAG 26A`, `KARTODROMO RL 26A` etc. existem em varias areas, mas nao sao logos de imagem e estao fora do escopo.
- `README.md` usa banner remoto externo do GitHub, nao e necessariamente o logo da UI. Pode ser atualizado apenas se o usuario quiser incluir documentacao/readme nesta tarefa.

### Plan

Plano para executar apos `[Concluir RPI]`:

1. Confirmar asset alvo
   - Usar `public/logo_kart_A26.png` como fonte do novo logo.
   - Manter o nome atual se ele ja representa o asset anexado.

2. Atualizar componente de logo
   - Alterar `src/components/rl/Logo.tsx` para renderizar `<img>`.
   - Usar `src="/logo_kart_A26.png"` para servir via pasta `public`.
   - Definir `alt="RL Kart 26A"`.
   - Controlar tamanho com classes responsivas, por exemplo altura menor no mobile e largura maxima no desktop.
   - Preservar `className` recebido pelo componente.

3. Revisar header e footer
   - Verificar se o logo horizontal nao empurra links/botoes do `Nav`.
   - Ajustar dimensoes do logo ou gaps somente se necessario.
   - Verificar footer em layout mobile e desktop.

4. Documentacao da tarefa
   - Atualizar este arquivo com implementacao/checks.
   - Atualizar historico tecnico apenas se a mudanca visual for considerada marco de release.

Escopo fora:

- Nao redesenhar a home.
- Nao alterar textos de rotas/metadados.
- Nao trocar banners do README sem pedido explicito.
- Nao modificar logos/textos desenhados dentro das cenas 3D nesta tarefa.

Criterios de aceite:

- Header e footer exibem o novo logo anexado.
- Logo permanece legivel em desktop e mobile.
- Layout do header nao quebra nem sobrepoe links/botoes.
- Build passa.

## Implementacao

Executada em 2026-05-16.

- `[Concluir RPI]` recebido em 2026-05-16.
- `src/components/rl/Logo.tsx` atualizado para renderizar o asset
  `/logo_kart_A26.png`.
- O novo logo usa `alt="RL Kart 26A"`.
- Tamanho responsivo aplicado:
  - mobile/base: `h-10`, largura automatica e `max-w-[11rem]`;
  - `sm+`: `h-12`, largura automatica e `max-w-[15rem]`.
- `className` externo do componente foi preservado.

## Checks Planejados

- `git status --short --branch` antes de qualquer edicao de codigo.
- Validar componente `Logo` apos implementacao.
- `npm run build`.
- Validacao visual da home em desktop e mobile quando viavel.

## Checks Executados

- `git status --short --branch`: branch `main`, com pastas nao rastreadas `chamado-correções-erros-prints/` e `sounds-trilha/`.
- Listagem de `chamado-correções-erros-prints/`.
- Listagem de `sounds-trilha/`.
- `[Iniciar RPI]` recebido em 2026-05-16.
- `git status --short --branch`: branch `main`, com `analise-tecnica/tarefas/tarefa-atual.md` modificado e pastas nao rastreadas preexistentes.
- Demanda recebida: atualizar o logo com a imagem anexada.
- Pesquisa de referencias `logo|Logo|RL|KART|26A|favicon|brand|marca`.
- Listagem de assets de imagem.
- Leitura de `src/components/rl/Logo.tsx`.
- Leitura de `src/components/rl/Nav.tsx`.
- Leitura de `src/components/rl/Footer.tsx`.
- Verificacao de dimensoes de `public/logo_kart_A26.png`: `922x218`.
- `[Concluir RPI]` recebido em 2026-05-16.
- Implementacao aplicada em `src/components/rl/Logo.tsx`.
- `npx eslint src\components\rl\Logo.tsx`: aprovado.
- `git diff --check`: aprovado, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- `[Finalizar Tarefa]` recebido em 2026-05-16.
- Revisao final de diff: concluida, escopo restrito a logo, asset de marca, historico tecnico e registro da tarefa.
- Historico tecnico atualizado em `analise-tecnica/documentacao-partes/historico-etapas.md`.
- `npx eslint src\components\rl\Logo.tsx`: aprovado no fechamento.
- `git diff --check`: aprovado no fechamento, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado no fechamento.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.

## Fechamento

- Finalizada em: 2026-05-16.
- Commit: criado no fechamento da tarefa; hash final informado ao usuario.

## Notas Para Release

- Header e footer passam a usar o novo logo horizontal `RL KART 26A` fornecido.
