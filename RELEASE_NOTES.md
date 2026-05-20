# Notas De Versao

## v0.1.0 - Release tecnica inicial

Data: 2026-05-19

### Destaques

- Arena de Corrida em modo full body, sem coluna lateral comprimindo a cena.
- Oficina tecnica com validacao de DLLs C#, painel externo, sala acustica e
  teste Wankel animado.
- Favicon, SEO, Open Graph e Twitter Card com identidade `RLLabs`.
- README reestruturado com thumbs, rotas, experiencias, arquitetura, stack,
  comandos e limites de deploy.
- Assets de imagem e trilha sonora incorporados ao historico do repositorio.

### Adicionado

- Favicon via `public/logo_kart_A26.png`.
- Metadados globais:
  - `description`;
  - `keywords`;
  - `author=RLLabs`;
  - `theme-color`;
  - Open Graph;
  - Twitter Card.
- Guia de DLLs C# para alunos em `public/docs/DLL_STUDENT_GUIDE.md`.
- Validacao de nome de arquivo no importador de DLLs.
- Motor Wankel com rotor/eixo/polia animados no teste da sala acustica.
- Controle de volume seguro para o teste Wankel.
- Fluxo de classificacao, grid, largada, replay, pit lane e eventos sonoros.
- Modo Engenharia Observador com progressao.

### Alterado

- Identidade institucional padronizada para `RLLabs`.
- Arena fullscreen usa canvas full viewport e controles essenciais em overlay.
- README passa a refletir o estado real do projeto e seus limites tecnicos.
- Karts da arena foram refinados visualmente para se aproximar do modelo
  oficinal.
- Vidro frontal da sala acustica trocado para clear glass, com UI separada da
  camada do vidro.

### Corrigido

- Removidas referencias remanescentes a `Lovable`.
- Corrigida a apresentacao comprimida da Arena em uma caixa lateral.
- Reduzido o filtro fosco/esbranquicado sobre o motor Wankel na sala acustica.

### Tecnico

- Build atual: TanStack Start SSR/worker.
- Saida:
  - `dist/client` para assets do cliente;
  - `dist/server` para runtime SSR/worker.
- Hospedagem compartilhada Apache pura ainda exige conversao futura para
  SPA/static export; `.htaccess` sozinho nao e suficiente neste estado.
- Remote configurado:
  - `origin`: `git@github.com:rubenslyra/kart-manager-csharp.git`

### Validacao

- `rg "Lovable|@Lovable" README.md src public package.json`: sem resultados.
- `npx eslint src\routes\__root.tsx src\routes\index.tsx src\components\rl\Stack.tsx src\components\simulator\SimulatorScene.tsx`: aprovado.
- `npm run build`: aprovado.

Avisos conhecidos do build:

- `@import` de fontes no CSS fora da primeira posicao.
- Alguns chunks acima de 500 kB.
