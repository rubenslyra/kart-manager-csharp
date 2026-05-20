# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-19

## Titulo

Favicon, SEO no head e hotfix da arena em full body

## Objetivo

Adicionar favicon e metadados essenciais de SEO ao projeto e corrigir a
experiencia visual da Arena para que a area de corrida ocupe o corpo principal
da pagina, sem ficar comprimida em uma caixa lateral. A intencao e aproximar o
modo Arena da experiencia full body ja usada na Oficina.

## Escopo Inicial

- Adicionar favicon ao projeto:
  - usar asset existente quando adequado, preferencialmente `public/logo_kart_A26.png`;
  - registrar no `<head>` com `rel="icon"` e tipo/tamanho coerentes;
  - evitar criar imagem nova sem necessidade.
- Adicionar SEO essencial no `<head>`:
  - `title` consistente com RL Kart 26A;
  - `description`;
  - `keywords` quando fizer sentido;
  - `author` como `RLLabs`;
  - Open Graph basico;
  - Twitter Card basico;
  - `theme-color`;
  - `canonical` quando o framework permitir de forma segura.
- Hotfix visual da Arena:
  - localizar a rota/pagina da arena;
  - remover ou ajustar o layout em caixa lateral que comprime a corrida;
  - tornar a area principal da corrida full body/full viewport, como a Oficina;
  - preservar overlays, HUD, paineis, controles, audio e cenas existentes;
  - manter responsividade em desktop e mobile.
- Nao iniciar implementacao antes de `[Concluir RPI]`, salvo excecao explicita
  do usuario para hotfix sem RPI.

## Estado Inicial Do Git

Verificado em 2026-05-19 apos abertura da tarefa:

- Branch: `main`.
- Ultimo commit fechado da tarefa anterior: `3c78e03` (`milestone: refine karts and acoustic room`).
- Sem modificacoes rastreadas pendentes.
- Artefatos nao rastreados existentes e fora do escopo imediato:
  - `chamado-correções-erros-prints/`;
  - `image_1030ed13.png` na raiz;
  - `sounds-trilha/`.

## Arquivos Provaveis

- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- `src/routes/simulator.tsx`
- `src/routes/simulador-real.tsx`
- `src/router.tsx`
- `src/start.ts`
- `src/styles.css`
- `public/logo_kart_A26.png`
- possivelmente novo asset em `public/` se o favicon exigir arquivo dedicado.

## Riscos Iniciais

- Head/SEO depende do padrao do framework usado no projeto; alterar no lugar
  errado pode nao refletir no SSR ou gerar metadados duplicados.
- Usar PNG grande como favicon pode funcionar, mas um favicon dedicado pode ser
  melhor se houver suporte simples no build.
- Transformar a Arena em full body pode afetar overlays, scroll da pagina,
  foco de teclado, tamanho do canvas e disposicao de paineis.
- Alteracoes de CSS globais podem impactar a Oficina e a landing page.
- A hotfix deve ser localizada para evitar regressao visual fora da Arena.

## RPI

Status RPI: concluido.

### Research

Concluido em 2026-05-19.

- Estado do git no inicio do RPI:
  - Branch `main`.
  - Apenas `analise-tecnica/tarefas/tarefa-atual.md` modificado pela abertura
    desta tarefa.
  - Nao rastreados fora do escopo:
    - `chamado-correções-erros-prints/`;
    - `image_1030ed13.png` na raiz;
    - `sounds-trilha/`.
- `src/routes/__root.tsx`
  - Usa TanStack Router/Start com `createRootRouteWithContext`.
  - O `<head>` global e produzido por `HeadContent`.
  - Head atual ainda tem metadados genericos:
    - title `Lovable App`;
    - description `Lovable Generated Project`;
    - author `Lovable`;
    - Open Graph/Twitter com identidade Lovable.
  - A implementacao deve remover qualquer referencia a Lovable no head global e
    substituir a autoria/identidade por `RLLabs`.
  - CSS global ja entra via `links` em `head`.
  - Local adequado para favicon e SEO base global:
    - `meta` da rota raiz;
    - `links` da rota raiz.
- `src/routes/index.tsx`
  - Home ja define title/description/OG especificos para RL Kart 26A.
  - Pode permanecer como override de rota.
- `src/routes/simulator.tsx`
  - A rota ja usa `SimulatorScene fullscreen`.
  - Possui head proprio da Arena, mas sem twitter/canonical especifico.
  - O wrapper externo e equivalente ao da Oficina:
    - `main.relative.min-h-screen.bg-background`;
    - barra superior absoluta com `ConfirmHomeExit`.
  - Portanto a compressao visual nao vem da rota.
- `src/routes/simulador-real.tsx`
  - A Oficina chama `RealSimulator fullscreen`.
  - `RealSimulator` fullscreen usa container direto:
    - `relative h-screen min-h-[640px] w-full overflow-hidden bg-card`.
  - Nao ha header interno nem grid lateral fora do canvas.
- `src/components/realsim/RealSimulator.tsx`
  - Serve como referencia de full body:
    - canvas ocupa `h-full w-full`;
    - UI e paineis sao overlays absolutos sobre a cena;
    - nao ha coluna lateral de layout.
- `src/components/simulator/SimulatorScene.tsx`
  - Mesmo com `fullscreen`, o componente ainda monta uma composicao de pagina:
    - `sectionClass`: `relative min-h-screen pt-14`;
    - `containerClass`: `flex min-h-[calc(100vh-56px)] flex-col px-3 pb-3`;
    - `headerClass`: header interno com titulo, texto e botoes;
    - `gridClass`: `grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]`;
    - `viewportClass`: `h-[calc(100vh-132px)] min-h-[520px]`;
    - coluna lateral com `TelemetryPanel`, `SimulatorControls` e ajuda.
  - Esse grid lateral de `320px` e a altura reduzida do viewport explicam a
    percepcao de caixa direita/compressao.
  - O hotfix deve alterar apenas o modo `fullscreen`; o modo embutido nao deve
    ser afetado.
  - Paineis ja existem como overlays dentro do viewport:
    - `HUD3D`;
    - `ExtendedHud`;
    - `HelmetHud`;
    - `Leaderboard`;
    - `TelemetryCharts`;
    - `EngineeringPitWall`;
    - `Qualifying*`;
    - `RaceSetup`;
    - botao `Setup`;
    - seletor de cameras.
  - A coluna lateral pode ser removida/ocultada no modo fullscreen sem quebrar
    controles principais se os botoes superiores continuarem disponiveis.
  - Os botoes superiores atuais ficam dentro do header interno; ao remover o
    header no fullscreen, controles importantes devem migrar para overlay.
- `public/logo_kart_A26.png`
  - Arquivo PNG valido (`89 50 4E 47...`) em `public/`.
  - Tamanho atual: 206075 bytes.
  - Pode ser usado como favicon PNG sem criar arquivo novo.
  - Opcionalmente pode ser referenciado como `apple-touch-icon`/OG image.
- `package.json`
  - Scripts disponiveis:
    - `npm run build`;
    - `npm run lint`;
    - `npx eslint <arquivos>` tambem segue padrao ja usado no projeto.

### Plan

Plano proposto para executar apos `[Concluir RPI]`.

1. SEO/head global em `src/routes/__root.tsx`
   - Substituir metadados genericos Lovable por identidade RL Kart 26A e
     autoria `RLLabs`.
   - Adicionar:
     - title global;
     - description global;
     - keywords;
     - author `RLLabs`;
     - `theme-color`;
     - `og:title`;
     - `og:description`;
     - `og:type`;
     - `og:image` apontando para `/logo_kart_A26.png`;
     - `twitter:card`;
     - `twitter:title`;
     - `twitter:description`;
     - `twitter:image`.
   - Adicionar links:
     - stylesheet existente;
     - favicon PNG em `/logo_kart_A26.png`;
     - `apple-touch-icon` em `/logo_kart_A26.png`;
     - canonical base se o framework aceitar `rel="canonical"` sem URL
       dinamica local; preferir URL relativa/raiz somente se nao gerar dado
       enganoso.

2. SEO por rota quando fizer sentido
   - Manter head especifico da home, Arena e Oficina.
   - Adicionar apenas metadados complementares na Arena se necessario:
     - `twitter:title`;
     - `twitter:description`;
     - `og:image`.
   - Evitar duplicar demais metadados ja cobertos pela raiz.

3. Hotfix full body da Arena em `SimulatorScene.tsx`
   - No modo `fullscreen`, aproximar estrutura de `RealSimulator`:
     - wrapper raiz `relative h-screen min-h-[640px] w-full overflow-hidden bg-card`;
     - canvas/viewport ocupando toda a area (`h-full w-full`);
     - remover header interno e grid lateral do fluxo.
   - Manter o modo nao-fullscreen como esta.
   - Migrar controles essenciais do header/coluna para overlay no fullscreen:
     - alternar modo Engenharia/Piloto;
     - Split;
     - Modo Dev;
     - Audio 3D;
     - Reset;
     - resumo do posto/atalhos se necessario em painel compacto.
   - Ocultar `TelemetryPanel` e `SimulatorControls` como coluna lateral no
     fullscreen para eliminar a caixa a direita.
   - Preservar paineis que ja sao overlays na cena.
   - Garantir que o overlay nao sobreponha de forma grave:
     - `ConfirmHomeExit` da rota;
     - seletor de cameras;
     - `EngineeringPitWall`;
     - `RaceSetup`;
     - HUDs existentes.

4. Documentacao da tarefa
   - Atualizar `tarefa-atual.md` com implementacao e checks ao concluir.
   - Se o hotfix alterar inventario de interfaces de cena, registrar nota curta
     em `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md` no
     fechamento.

5. Validacao
   - `npx eslint src\routes\__root.tsx src\routes\simulator.tsx src\components\simulator\SimulatorScene.tsx`.
   - `npm run build`.
   - Validacao visual recomendada:
     - `/simulator`: confirmar canvas em full body, sem coluna lateral
       comprimindo a pista;
     - `/simulator`: confirmar overlays principais e botoes de controle;
     - `/simulador-real`: confirmar que a Oficina continua full body;
     - inspecionar head gerado/build para favicon e metadados.

### Criterios De Aceite

- Favicon aparece a partir de asset publico do projeto.
- Head global deixa de exibir identidade Lovable e passa a usar RL Kart 26A.
- Autoria/metadados institucionais referenciam `RLLabs`.
- Arena em `/simulator` ocupa o corpo principal/full viewport, sem caixa
  lateral comprimindo a corrida.
- Controles principais da Arena continuam acessiveis.
- Oficina em `/simulador-real` nao sofre regressao visual.
- Build passa.

### Escopo Fora Desta Tarefa

- Criar novo pacote de branding completo.
- Produzir novos assets graficos.
- Refatorar toda a arquitetura de HUD/paineis da Arena.
- Alterar fisica, IA, cameras ou regras de corrida.

## Checks Planejados

- `npx eslint` nos arquivos alterados.
- `npm run build`.
- Validacao visual recomendada:
  - `/simulator`: arena em full body/full viewport, sem compressao lateral;
  - `/simulador-real`: confirmar que a Oficina nao foi afetada;
  - verificar favicon e metadados no HTML/head gerado.

## Implementacao

Executada em 2026-05-19 apos `[Concluir RPI]`.

- `src/routes/__root.tsx`
  - Removidos metadados genericos `Lovable`.
  - Head global passou a usar identidade `RL Kart 26A — RLLabs`.
  - Adicionados metadados base:
    - `description`;
    - `keywords`;
    - `author=RLLabs`;
    - `theme-color`;
    - Open Graph;
    - Twitter Card.
  - Adicionados links de favicon e `apple-touch-icon` apontando para
    `/logo_kart_A26.png`.
- `src/routes/index.tsx`
  - Removida referencia a `Lovable` da descricao da home.
  - Titulo/OG da home ajustados para `RLLabs`.
- `src/components/rl/Stack.tsx`
  - Card e subtitulo da arquitetura alterados de `Lovable` para `RLLabs`.
  - Item `Oficina RL Labs` ajustado para `Oficina RLLabs`.
- `src/components/simulator/SimulatorScene.tsx`
  - Modo `fullscreen` da Arena passou a usar wrapper `h-screen`/`w-full`,
    sem header interno e sem grid lateral.
  - Viewport da corrida agora ocupa todo o corpo principal, com canvas em area
    total, aproximando o comportamento da Oficina.
  - Controles essenciais migraram para overlay compacto:
    - modo Engenharia/Piloto;
    - Split;
    - Dev;
    - Audio;
    - Reset.
  - Modo nao-fullscreen manteve layout antigo com coluna lateral.
- Deploy compartilhado Apache:
  - investigado em 2026-05-19 a pedido do usuario antes do fechamento;
  - o build atual e TanStack Start SSR/worker, gerando `dist/client` para
    assets e `dist/server` para runtime;
  - `dist/client` nao possui `index.html`, portanto um `.htaccess` de SPA
    estatica nao consegue rodar a aplicacao sozinho em Apache compartilhado;
  - tentativa de habilitar `tanstackStart.spa.enabled` falhou no prerender
    porque o plugin tentou importar `dist/server/server.js`, enquanto este
    projeto gera o entry SSR/Cloudflare como `dist/server/index.js`;
  - a alteracao experimental foi revertida para nao deixar deploy quebrado;
  - conclusao: para hospedagem compartilhada pura, seria necessario converter o
    projeto para build SPA/static export de forma dedicada; do jeito atual, o
    alvo correto continua sendo runtime SSR/worker/Node compativel.
- `README.md`
  - Reescrito com identidade `RLLabs`, thumbs locais, rotas principais,
    experiencias da Arena/Oficina, fluxo das DLLs, arquitetura, stack,
    estrutura do repositorio, comandos, observacao de deploy e roadmap tecnico.
  - Removidas referencias a `Lovable`.
- Git remote:
  - Nao havia remote configurado.
  - Criado `origin` apontando para
    `git@github.com:rubenslyra/kart-manager-csharp.git`.

## Checks

- `rg "Lovable|@Lovable" src public package.json`: sem resultados.
- `npx eslint src\routes\__root.tsx src\routes\index.tsx src\components\rl\Stack.tsx src\components\simulator\SimulatorScene.tsx --fix`: aplicado para formatacao.
- `npx eslint src\routes\__root.tsx src\routes\index.tsx src\components\rl\Stack.tsx src\components\simulator\SimulatorScene.tsx`: aprovado.
- `npm run build`: aprovado.
  - Avisos residuais conhecidos:
    - `@import` de fontes no CSS fora da primeira posicao;
    - chunks acima de 500 kB.
- Tentativa `npm run build` com `tanstackStart.spa.enabled=true`: reprovada no
  prerender por incompatibilidade entre o prerender local e o entry
  `dist/server/index.js`; revertida.
- `npm run build` apos reversao do shell SPA experimental: aprovado.
  - Mesmos avisos residuais conhecidos:
    - `@import` de fontes no CSS fora da primeira posicao;
    - chunks acima de 500 kB.
- `rg "Lovable|@Lovable" README.md src public package.json`: sem resultados.
- `npx eslint src\routes\__root.tsx src\routes\index.tsx src\components\rl\Stack.tsx src\components\simulator\SimulatorScene.tsx`: aprovado apos README/remote.
- `npm run build`: aprovado apos README/remote.
  - Mesmos avisos residuais conhecidos:
    - `@import` de fontes no CSS fora da primeira posicao;
    - chunks acima de 500 kB.

## Fechamento

Finalizada em 2026-05-19.

- Diff revisado antes do commit.
- Escopo implementado conforme RPI aprovado e extensoes solicitadas antes do
  fechamento:
  - favicon e SEO global com identidade `RLLabs`;
  - remocao de referencias a `Lovable`;
  - Arena em full body no modo fullscreen;
  - README enriquecido com thumbs e documentacao tecnica/produto;
  - investigacao de deploy compartilhado Apache;
  - remote `origin` configurado para o repositorio informado.
- Artefatos nao rastreados fora do escopo mantidos sem alteracao:
  - `chamado-correções-erros-prints/`;
  - `image_1030ed13.png`;
  - `sounds-trilha/`.

## Notas De Release

- **Adicionado:** favicon com o logo do RL Kart 26A e metadados SEO/Open Graph/Twitter.
- **Alterado:** identidade institucional do projeto passa a referenciar `RLLabs`.
- **Corrigido:** Arena fullscreen deixou de ficar comprimida por coluna lateral.
- **Alterado:** README agora apresenta thumbs, rotas, experiencias, arquitetura, stack, comandos, deploy e roadmap.
- **Tecnico:** remote `origin` configurado para `git@github.com:rubenslyra/kart-manager-csharp.git`.
- **Tecnico:** confirmado que hospedagem compartilhada Apache pura exige conversao futura para SPA/static export; build atual segue SSR/worker.
