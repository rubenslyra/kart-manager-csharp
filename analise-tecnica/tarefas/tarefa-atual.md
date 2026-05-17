# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-16

## Titulo

Preparar experiencia de corrida imersiva para alunos

## Objetivo

Preparar a Arena para uma entrega mais imersiva aos alunos, mantendo o split
atual e adicionando bases para camera da corredora, camera de capacete com HUD
de engenharia, futura interacao por gestos via webcam, karts da Arena com
estrutura mais alinhada ao carrinho da Oficina e desenvolvimento visual da
corredora Rayssa a partir da referencia fornecida.

## Escopo Inicial

- Manter o split atual da Arena.
- Adicionar ou planejar modo de camera em tela unica na visao da corredora.
- Adicionar ou planejar camera de dentro do capacete/visor.
- Projetar HUD estilo Formula 1 na viseira, com informacoes da equipe de
  engenharia e instrucoes por voz.
- Preparar arquitetura para controle por gestos via webcam.
- Levar a estrutura visual/mecanica do carrinho da Oficina para os karts da
  Arena.
- Reconstruir concorrentes usando a estrutura modelo, preservando cores e nomes
  atuais.
- Desenvolver a corredora Rayssa com base na imagem e descricao fornecidas:
  - personagem 3D estilo Pixar;
  - jovem afro-brasileira;
  - cabelo afro preto volumoso e detalhado;
  - olhos castanho-escuros e sorriso acolhedor;
  - macacao azul e laranja com `RAYSSA`;
  - kart azul e laranja desgastado, numero `77`;
  - pneus com `BLENDER TIRES`;
  - pista externa com asfalto, bandeiras quadriculadas e barreiras de pneus.
- Nao executar implementacao nesta etapa.
- Nao fazer commit automatico apenas por iniciar a tarefa.

## Estado Inicial Do Git

Verificado em 2026-05-16:

- Branch: `main`.
- Arquivos rastreados: sem modificacoes reportadas por `git status --short --branch`.
- Artefatos nao rastreados existentes antes da tarefa:
  - `chamado-correções-erros-prints/`
  - `image_1030ed13.png`
  - `sounds-trilha/`

## Subtarefas

- Concluido: abrir tarefa formal e registrar escopo inicial.
- Concluido: receber `[Iniciar RPI]`.
- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: receber `[Concluir RPI]`.
- Concluido: implementar apos aprovacao do RPI.
- Concluido: validar alteracoes.
- Concluido: receber `[Finalizar Tarefa]`.
- Concluido: revisar diff final.
- Concluido: validar e fechar tarefa.

## RPI

Iniciado em 2026-05-16.

### Research

Concluido em 2026-05-16.

- Estado do git no inicio do RPI:
  - Branch `main`.
  - `analise-tecnica/tarefas/tarefa-atual.md` modificado pela abertura da tarefa.
  - Artefatos nao rastreados preexistentes:
    - `chamado-correções-erros-prints/`
    - `image_1030ed13.png`
    - `sounds-trilha/`
- Referencia da corredora:
  - Imagem anexada pelo usuario tambem existe como `src/assets/driver-rayssa.png`.
  - Ha copia nao rastreada `image_1030ed13.png` com mesmo tamanho.
  - `src/assets/driver-rayssa.png` e o melhor asset para consumo pelo projeto por ja estar dentro de `src/assets`.
- `src/components/simulator/SimulatorScene.tsx`
  - E a cena principal da Arena.
  - Mantem `splitMode`, `activeView`, `camerasRef`, `fallbackCamRef` e `camsReady`.
  - `VIEW_LABELS` atuais:
    - `COCKPIT`
    - `CHASE`
    - `NOSE`
    - `TOP-DOWN`
    - `FREE`
  - `Splitter` renderiza:
    - uma camera ativa quando `splitMode=false`;
    - quatro viewports 2x2 quando `splitMode=true`.
  - HUDs de single-view atuais:
    - `HUD3D`
    - `ExtendedHud`
    - `Leaderboard`
    - `TelemetryCharts`
  - Split atual tem labels e mini HUDs por quadrante e deve ser preservado.
  - Teclas atuais:
    - `V`: split-screen;
    - `1-5`: camera ativa;
    - `H`, `B`, `P`: debug/performance.
- `src/components/simulator/KartRig.tsx`
  - Controla fisica/pose do player.
  - Ja cria quatro `PerspectiveCamera` presas ao grupo do kart:
    - cockpit: `[0, 1.05, 0.45]`, `fov=78`;
    - chase;
    - nose;
    - top.
  - Em single-view, somente chase tem follow suave na camera default; as demais cameras sao usadas pelo `Splitter`.
  - Para visao da corredora/capacete, a melhor base e adicionar uma camera extra no rig ou renomear/refinar a cockpit existente sem remover as quatro cameras do split.
  - `onCameras` hoje espera quatro cameras. Se uma quinta camera entrar, o split precisa continuar renderizando somente as quatro primeiras ou receber uma lista separada.
- `src/components/simulator/KartModel.tsx`
  - Modelo da Arena ja e procedural e usa `RL_KART_DIMENSIONS`.
  - Recebe `liveryColor` para adversarios.
  - Usa `Driver` internamente.
  - Ja tem rodas com hierarquia de esterco/Ackermann, giro por velocidade e diferencial simples.
  - Ainda e mais simplificado que o kart da Oficina: nao usa partes `Chassis`, `Seat`, `Steering`, `ElectricalSystem`, `MotorAssembly`, `BrakeSystem`, `Dashboard`.
  - Tem livery azul/laranja no player e cor principal dos adversarios via `liveryColor`.
- `src/components/realsim/RealKart.tsx`
  - Modelo da Oficina carrega GLB se existir, senao usa `ProceduralKart`.
  - `ProceduralKart` depende de `KartTelemetry` e `focus`.
  - Montagem usa componentes de partes reais:
    - `Chassis`
    - `Seat`
    - `Steering`
    - `ElectricalSystem`
    - `MotorAssembly`
    - `GearSelector`
    - `BrakeSystem`
    - `Dashboard`
  - Nao da para importar `RealKart` diretamente na Arena sem criar telemetria fake/adaptador ou separar um componente compartilhado de chassis/estrutura.
- `src/components/simulator/AIKart.tsx`
  - Adversarios usam `KartModel` com `liveryColor={color}`.
  - Movimento e baseado em `trackCurve`, `startOffset`, `baseSpeed`, habilidade e faixa.
  - Registra cada adversario no `raceStore` com `id`, `name`, `color`.
  - Tem `Nameplate` preservando nome/cor visual.
- `src/components/simulator/aiProfiles.ts`
  - Nomes e cores atuais dos concorrentes:
    - Dandara `#ef4444`
    - Zuri `#22c55e`
    - Bento `#facc15`
    - Aisha `#06b6d4`
    - Kael `#a855f7`
    - Nzinga `#ec4899`
  - Devem ser preservados.
- `src/components/simulator/Driver.tsx`
  - Personagem Rayssa ja existe como low-poly procedural.
  - Descricao atual: `stylized low-poly character (Rayssa #77)`.
  - Ja usa macacao azul/laranja, pele escura e cabelo afro por esferas.
  - Ainda nao exibe texto `RAYSSA`, numero `77` real em geometria/texto, olhos detalhados, sorriso ou textura de referencia.
  - Pode ser evoluido com primitivas/`Text` do Drei sem depender de GLTF.
- `src/components/simulator/HUD3D.tsx` e `ExtendedHud.tsx`
  - Ja exibem estado, velocidade, bateria, ignicao, volta, RPM, torque, grip, G lateral/longitudinal e drift.
  - HUD atual e de tela, nao e especifico de visor/capacete.
  - Para capacete, o ideal e criar um overlay separado, por exemplo `HelmetHud`, ativado somente em camera de visor/corredora.
- `src/components/simulator/useSimAudio.ts`
  - Audio da Arena ja centraliza motor, torcida, carros passando e bandeirada.
  - Depende de gesto do usuario via `audio.start`.
  - Tem grafo Web Audio com `masterGain` e metodo `tone`.
  - Radio da engenharia pode entrar inicialmente como falas sintetizadas com `SpeechSynthesis` ou como bips/tons + legenda; MP3 gravado exigiria novos assets e creditos.
  - Melhor primeira entrega: criar `useEngineerRadio`/componente de radio com fila de instrucoes e fallback visual, usando gesto de audio ja existente.
- `src/components/simulator/useKartControls.ts`
  - Entrada atual e teclado direto em um ref com `forward`, `reverse`, `left`, `right`, `brake`, `reset`.
  - Para gestos via webcam, convem separar a origem de input:
    - teclado continua fonte padrao;
    - gestos entram como outra fonte opcional que escreve no mesmo formato.
  - `package.json` nao tem MediaPipe/TensorFlow.
  - Nesta tarefa, a preparacao sem instalar dependencia pode criar tipos/interfaces e UI de placeholder.
  - Implementacao real com webcam provavelmente exigira dependencia e autorizacao de camera do navegador.
- `src/components/audio/audioAssets.ts`
  - Catalogo atual nao tem audio de radio/engenharia.
  - Qualquer MP3 novo deve ir para `public/sounds/` e ter credito registrado.
- Documentacao tecnica:
  - `analise-tecnica/documentacao-partes/mapa-componentes.md` define as partes do kart real e nomes canonicos.
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md` ja documenta audio de corrida e interfaces tecnicas.
  - Mudancas de HUD/camera/audio devem atualizar inventario e historico.

### Plan

Plano proposto para executar apos `[Concluir RPI]`.

#### Entrega Recomendada Nesta Tarefa

1. Preservar split atual
   - Manter `splitMode` e renderizacao 2x2 existentes.
   - Garantir que novas cameras nao alterem os quatro quadrantes atuais.
   - Se adicionar camera extra, separar:
     - lista de cameras do split;
     - lista/opcoes de cameras single-view.

2. Adicionar modos single-view imersivos
   - Expandir `VIEW_LABELS`/estado de camera para incluir:
     - `DRIVER`
     - `HELMET`
   - Manter `COCKPIT`, `CHASE`, `NOSE`, `TOP-DOWN`, `FREE`.
   - No `KartRig`, adicionar cameras extras presas ao kart:
     - `driverCam`: posicionada para simular olhar da corredora/ombro/cockpit mais humano;
     - `helmetCam`: posicionada dentro/na altura do capacete/visor, com FOV maior e leve roll/tilt por curva.
   - Ajustar `Splitter` para usar somente as quatro cameras legadas quando `splitMode=true`.
   - Em single-view, permitir selecionar as novas cameras por botoes e teclas adicionais.

3. HUD de capacete/visor
   - Criar componente `HelmetHud`.
   - Exibir somente quando `activeView` for `HELMET` ou `DRIVER`.
   - Usar dados ja disponiveis:
     - velocidade, marcha, bateria, volta/progresso;
     - RPM, torque, grip, G lateral/longitudinal, drift.
   - Visual:
     - vinheta/curvatura de visor;
     - linhas finas e reticulo estilo telemetria;
     - bloco `ENG` com instrucoes da equipe;
     - alertas discretos para curva, drift, bateria e checkpoint.
   - Evitar cobrir centro da pista e preservar leitura em mobile/desktop.

4. Radio/voz da engenharia
   - Criar estrutura de mensagens de engenharia baseada em eventos/telemetria.
   - Primeira versao:
     - legendas no visor;
     - chamada por `SpeechSynthesis` quando disponivel e audio estiver habilitado;
     - fallback silencioso visual quando o navegador bloquear voz.
   - Usar cooldown para nao falar continuamente.
   - Exemplos de mensagens:
     - largada: "Rayssa, mantenha linha e aqueça os pneus";
     - alta velocidade: "Boa reta, prepara frenagem";
     - baixa aderencia/drift: "Corrige suave, recupera tracao";
     - checkpoint/volta: "Setor concluido, ritmo consistente".
   - Nao adicionar MP3 nesta etapa, salvo pedido explicito.

5. Preparar controle por gestos via webcam
   - Criar contrato de input, por exemplo `KartInputSource` ou `GestureInputState`, alinhado com `KartControlsState`.
   - Refatorar `useKartControls` com cuidado para aceitar fonte externa opcional sem alterar comportamento do teclado.
   - Adicionar UI/estado de "Gestos: preparado/desativado" na Arena, sem ativar webcam ainda se a dependencia nao for instalada.
   - Registrar em comentario/documentacao o caminho para proxima atividade:
     - `navigator.mediaDevices.getUserMedia`;
     - detector de maos/pose;
     - mapeamento:
       - palma aberta: acelerar;
       - punho/maos fechadas: frear;
       - inclinacao esquerda/direita: direcao.
   - Deixar implementacao real com MediaPipe/TensorFlow para uma tarefa seguinte, porque exige dependencia nova e validacao em navegador com permissao de camera.

6. Estrutura visual dos karts da Arena
   - Evitar substituir `KartModel` por `RealKart` diretamente.
   - Evoluir `KartModel` para ficar mais proximo da Oficina usando partes compartilhaveis/conceitos:
     - chassi tubular mais rico;
     - estribos laterais/side steps;
     - banco e coluna mais definidos;
     - motor traseiro e bateria/controller mais reconheciveis;
     - dashboard compacto.
   - Preservar API atual de `KartModel`:
     - `state`
     - `driving`
     - `steer`
     - `speedKmh`
     - `liveryColor`
   - Adicionar props opcionais para identidade:
     - `driverName`
     - `kartNumber`
     - `tireLabel`
   - Player:
     - `driverName="RAYSSA"`
     - `kartNumber="77"`
     - `tireLabel="BLENDER TIRES"`
     - livery azul/laranja.
   - Adversarios:
     - preservar nomes e cores de `AI_PROFILES`;
     - usar a mesma estrutura mecanica;
     - permitir numeros derivados do indice, sem trocar nomes atuais.

7. Desenvolver Rayssa no modelo procedural
   - Evoluir `Driver.tsx` sem depender de asset externo inicialmente:
     - cabelo afro com mais volume e variacao de esferas;
     - olhos maiores com brilho;
     - boca/sorriso simples;
     - macacao azul/laranja com faixas;
     - texto `RAYSSA` via `Text` do Drei no peito/cinto quando viavel;
     - postura mais encaixada no volante.
   - Usar `src/assets/driver-rayssa.png` como referencia visual/documental, nao como textura direta no modelo 3D nesta primeira entrega.
   - Caso seja necessario asset 2D de apoio, usar o skill de imagem para gerar/editar bitmap e salvar no projeto, mas apenas se a implementacao exigir.

8. Documentacao
   - Atualizar `analise-tecnica/tarefas/tarefa-atual.md` com implementacao/checks.
   - Atualizar `inventario-cena-interfaces.md` com:
     - cameras imersivas;
     - HUD de capacete;
     - radio de engenharia;
     - preparacao de gestos.
   - Atualizar `mapa-componentes.md` se `KartModel` passar a compartilhar mais estrutura do kart real.
   - Atualizar `historico-etapas.md` no fechamento.

#### Escopo Que Deve Ficar Para Proxima Atividade

- Implementacao completa de controle por gestos com webcam e modelo de deteccao real.
- Instalacao de MediaPipe/TensorFlow ou dependencia equivalente.
- Gravacao/edicao de vozes reais da engenharia em MP3.
- Criacao/importacao de GLTF completo da Rayssa.
- Sistema completo de animacao facial/corporal.

#### Riscos Tecnicos

- Aumentar cameras pode quebrar split se a lista atual deixar de ter exatamente quatro cameras.
- HUD de capacete pode poluir a leitura da pista se ocupar o centro.
- `SpeechSynthesis` varia por navegador, idioma e permissao; precisa fallback visual.
- Gestos por webcam exigem HTTPS/permissao e podem falhar em ambiente de aula sem camera.
- Reaproveitamento direto do kart da Oficina pode trazer dependencias de telemetria/focus inadequadas para a Arena.
- Mais geometria em todos os adversarios pode afetar performance; precisa manter toggles/perf em mente.

#### Criterios De Aceite

- Split atual continua funcionando com as quatro cameras atuais.
- Single-view permite selecionar as novas cameras `DRIVER` e `HELMET`.
- Camera de capacete exibe HUD/visor de engenharia sem bloquear a pista.
- Mensagens de engenharia aparecem de forma contextual; voz funciona quando suportada e nao quebra quando bloqueada.
- Estrutura visual dos karts da Arena fica mais proxima do kart da Oficina.
- Adversarios preservam nomes e cores atuais.
- Rayssa fica visualmente mais proxima da referencia: cabelo afro volumoso, macacao azul/laranja, identidade `RAYSSA` e numero `77`.
- Preparacao de gestos fica isolada sem alterar o comportamento padrao do teclado.
- Build passa.

## Implementacao

Executada em 2026-05-16.

- `[Concluir RPI]` recebido em 2026-05-16.
- `SimulatorScene` passou a oferecer cameras single-view adicionais:
  - `DRIVER`
  - `HELMET`
- Split-screen atual foi preservado usando apenas as quatro cameras originais:
  - `COCKPIT`
  - `CHASE`
  - `NOSE`
  - `TOP-DOWN`
- `KartRig` passou a registrar cameras extras presas ao kart para a visao da corredora e do capacete.
- Criado `HelmetHud`:
  - visor com vinheta, reticulo e telemetria;
  - velocidade, marcha, RPM, grip, volta e bateria;
  - canal `ENG // RADIO` com mensagens contextuais.
- Radio de engenharia:
  - mostra legenda contextual no visor;
  - usa `SpeechSynthesis` em `pt-BR` quando o audio da Arena esta habilitado e o navegador suporta;
  - mantem fallback visual quando voz nao esta disponivel.
- `Driver` procedural evoluido:
  - texto `RAYSSA` no macacao;
  - numero `77`;
  - olhos mais expressivos;
  - sorriso simples;
  - cabelo afro continua procedural e volumoso.
- `KartModel` passou a aceitar identidade visual:
  - `driverName`;
  - `kartNumber`;
  - `tireLabel`.
- Player usa `RAYSSA`, `77` e `BLENDER TIRES`.
- Adversarios preservam nomes e cores de `AI_PROFILES`, usam a mesma base visual e recebem numeros derivados do indice.
- Criado `gestureInput.ts` com contrato inicial de gestos.
- `useKartControls` passou a aceitar fonte externa opcional no mesmo formato do teclado, preparando futura webcam sem alterar o comportamento padrao.
- Documentacao tecnica atualizada:
  - `historico-etapas.md`;
  - `inventario-cena-interfaces.md`;
  - `mapa-componentes.md`.

## Riscos Iniciais

- Escopo amplo tocando camera, HUD, audio, assets/personagem, karts da Arena e
  futura webcam.
- Controle por gestos via webcam pode exigir dependencias, permissoes do
  navegador e fallback para ambientes sem camera.
- Reaproveitar estrutura da Oficina na Arena pode conflitar com a fisica,
  performance ou simplificacoes atuais dos karts de corrida.
- A personagem Rayssa pode exigir estrategia separada entre asset conceitual,
  textura, sprite, billboard ou modelo 3D procedural.
- HUD de capacete e radio de engenharia precisam evitar poluir a leitura da
  corrida.

## Checks Planejados

- `git status --short --branch` antes de qualquer edicao de codigo.
- Research da Arena, cameras, HUD, karts concorrentes, modelo da Oficina,
  audio/radio e possibilidades de webcam.
- Plan tecnico com divisao de entregas, riscos, checks e criterios de aceite.
- Apos implementacao aprovada:
  - `npx eslint` focado nos arquivos alterados.
  - `git diff --check`.
  - `npm run build`.
  - Validacao visual/manual da Arena em single-view e split.

## Checks Executados

- `git status --short --branch`: branch `main`, com artefatos nao rastreados
  `chamado-correções-erros-prints/`, `image_1030ed13.png` e `sounds-trilha/`.
- `[Iniciar RPI]` recebido em 2026-05-16.
- Listagem de arquivos de `src/components/simulator`, `src/components/realsim` e `src/routes`.
- Pesquisa por referencias de camera, split, HUD, driver, concorrentes, audio, webcam e gestos.
- Leitura de `src/components/simulator/SimulatorScene.tsx`.
- Leitura de `src/components/simulator/KartRig.tsx`.
- Leitura de `src/components/simulator/KartModel.tsx`.
- Leitura de `src/components/realsim/RealKart.tsx`.
- Leitura de `src/components/simulator/AIKart.tsx`.
- Leitura de `src/components/simulator/Driver.tsx`.
- Leitura de `src/components/simulator/RaceSetup.tsx`.
- Leitura de `src/components/simulator/aiProfiles.ts`.
- Leitura de `src/components/simulator/HUD3D.tsx`.
- Leitura de `src/components/simulator/ExtendedHud.tsx`.
- Leitura de `src/components/simulator/useSimAudio.ts`.
- Leitura de `src/components/simulator/useKartControls.ts`.
- Leitura de `package.json`.
- Listagem de assets em `public` e `src/assets`.
- Leitura de `src/components/audio/audioAssets.ts`.
- Leitura de `analise-tecnica/documentacao-partes/mapa-componentes.md`.
- Leitura de `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`.
- Inspecao visual de `src/assets/driver-rayssa.png`.
- `[Concluir RPI]` recebido em 2026-05-16.
- Implementacao executada nos arquivos:
  - `src/components/simulator/SimulatorScene.tsx`
  - `src/components/simulator/KartRig.tsx`
  - `src/components/simulator/KartModel.tsx`
  - `src/components/simulator/Driver.tsx`
  - `src/components/simulator/AIKart.tsx`
  - `src/components/simulator/HelmetHud.tsx`
  - `src/components/simulator/gestureInput.ts`
  - `src/components/simulator/useKartControls.ts`
- `npx eslint` focado nos arquivos alterados: aprovado apos autofix de formatacao.
- `npm run build`: primeira tentativa excedeu timeout de 120s sem resultado.
- `npm run build`: aprovado com timeout maior.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.
- `git diff --check`: aprovado, com apenas avisos LF/CRLF do Windows.
- Dev server iniciado em `http://127.0.0.1:5173`.
- Validacao HTTP de `http://127.0.0.1:5173/simulator`: 200.
- `[Finalizar Tarefa]` recebido em 2026-05-17.
- Revisao final de diff: concluida, escopo restrito a cameras imersivas, visor de engenharia, identidade visual da Rayssa/karts, preparacao de gestos e documentacao.
- `npx eslint src\components\simulator\SimulatorScene.tsx src\components\simulator\KartRig.tsx src\components\simulator\KartModel.tsx src\components\simulator\Driver.tsx src\components\simulator\AIKart.tsx src\components\simulator\HelmetHud.tsx src\components\simulator\useKartControls.ts src\components\simulator\gestureInput.ts`: aprovado no fechamento.
- `git diff --check`: aprovado no fechamento, com apenas avisos LF/CRLF do Windows.
- `npm run build`: aprovado no fechamento.
  - Avisos residuais existentes/fora do escopo: `@import` de CSS fora da primeira posicao e chunks acima de 500 kB.

## Fechamento

- Finalizada em: 2026-05-17.
- Commit: criado no fechamento da tarefa; hash final informado ao usuario.

## Notas Para Release

- Arena ganha cameras single-view `DRIVER` e `HELMET`, mantendo split-screen atual.
- Camera de capacete recebe visor de engenharia com telemetria e radio contextual.
- Rayssa e os karts de corrida passam a exibir identidade visual mais clara.
- Projeto fica preparado para plugar controle por gestos via webcam em uma proxima tarefa.
