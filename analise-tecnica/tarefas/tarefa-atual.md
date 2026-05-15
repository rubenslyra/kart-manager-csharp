# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-15

## Titulo

Integrar arquivos de `sounds-trilha` na aplicacao conforme uso sugerido pelos nomes

## Objetivo

Adicionar os audios fornecidos em `sounds-trilha/` aos pontos corretos da experiencia: sala de teste, apresentacao do carro, corrida, torcida base, aproximacao da torcida e bandeirada.

## Escopo

- Avaliar os arquivos de audio adicionados pelo usuario em `sounds-trilha/`.
- Identificar como o projeto carrega assets estaticos de audio.
- Avaliar o sistema atual de audio do simulador e da sala de teste.
- Planejar a integracao sem quebrar os sons sintetizados existentes.
- Definir gatilhos coerentes para cada arquivo pelo nome:
  - `motor-para-a-sala-de-teste.mp3`
  - `som-apresentação-carro-testado.mp3`
  - `som-motor-durante-corrida.mp3`
  - `torcida-na-bandeirada.mp3`
  - `torcida1.mp3`
  - `torcida2-sobreposição-quando-carros-se-aproximam-da-torcida.mp3`
- Definir se os arquivos devem permanecer em `sounds-trilha/` ou ser movidos/copiadose para `public/` ou outro local servido pelo build.
- Manter controle de volume, loop e disparos para evitar sobreposicao excessiva.

## Subtarefas

- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: implementar integracao apos aprovacao por `[Concluir RPI]`.

## RPI

### Research

- `sounds-trilha/` contem 6 MP3 adicionados pelo usuario:
  - `motor-para-a-sala-de-teste.mp3`;
  - `som-apresentação-carro-testado.mp3`;
  - `som-motor-durante-corrida.mp3`;
  - `torcida-na-bandeirada.mp3`;
  - `torcida1.mp3`;
  - `torcida2-sobreposição-quando-carros-se-aproximam-da-torcida.mp3`.
- `public/` ja existe e e o local adequado para arquivos servidos diretamente pelo Vite/TanStack sem entrar no bundle JS.
  - Estrutura atual contem `public/docs/` e `public/models/`.
  - Nao ha pasta `public/sounds/` ainda.
- `vite.config.ts` nao customiza tratamento de assets; usar `public/sounds/...` evita importacao dos MP3 e aumento do bundle.
- Os nomes originais tem acentos e cedilha. Funcionam no filesystem, mas sao mais frageis como URLs.
  - Melhor criar nomes publicos ASCII/kebab-case em `public/sounds/` e manter a origem em `sounds-trilha/` apenas como fonte fornecida.
- `src/components/simulator/useSimAudio.ts` atualmente cria audio sintetizado via Web Audio:
  - motor por oscilador `sawtooth`;
  - torcida por ruido filtrado;
  - bips/jingle/fanfare sintetizados;
  - requer gesto do usuario por `audio.start`, acionado no botao `Audio 3D`.
- `useSimAudio.ts` ja recebe velocidade (`setSpeed`) e posicao da camera (`setCamPosition`), e calcula distancia ate `TRACK_CONFIG.assets.bleachers`.
- `SimulatorScene.tsx` ja dispara eventos de audio:
  - `audio.setSpeed(t.speed)` a cada atualizacao de velocidade;
  - checkpoint: `checkpointBeep`;
  - fechamento de volta: `lapJingle`;
  - replay/final: `fanfare`;
  - botao `Audio 3D` chama `audio.start`.
- `raceStore.ts` registra `finished`, `lastCheckpoint`, `replayPhase`, `playbackActive` e `lastImpact`.
  - Ha ponto claro para usar `torcida-na-bandeirada.mp3` quando a corrida acaba ou entra no podium/replay final.
  - Ha ponto claro para usar uma camada de torcida por proximidade da arquibancada usando a mesma distancia que ja existe em `useSimAudio`.
- `src/components/realsim/hooks/useWankelTestAudio.ts` tambem usa Web Audio sintetizado:
  - botao `Audio ON/OFF` em `RealSimUI.tsx` chama `audio.start`;
  - o audio acompanha `running`, `throttle` e `health`;
  - o som e sintetico e pode ser substituido ou complementado por MP3 em loop.
- `RealSimulator.tsx` instancia `useWankelTestAudio` e passa `toggleEngineAudio={audio.start}` para `RealSimUI`.
- `RealSimUI.tsx` tem controles claros:
  - `Ligar bancada`;
  - `Audio ON/OFF`;
  - slider de aceleracao.
- `som-apresentação-carro-testado.mp3` nao tem hoje um botao dedicado.
  - Candidatos coerentes: tocar quando o usuario usa `Liberar para pista`, ou adicionar um botao pequeno de apresentacao na oficina.
  - Como o nome sugere apresentacao do carro testado, o melhor gatilho e uma acao explicita na oficina, evitando autoplay.
- `inventario-cena-interfaces.md` documenta que a sala acustica usa audio sintetizado sem assets externos; precisa ser atualizado se MP3 forem integrados.
- O usuario forneceu os creditos/licencas de origem e corrigiu a intencao de aplicacao:
  - `[som do motor]`: Sound Effect by `freesound_community` from Pixabay.
  - `[Riser long Classique 1]`: Sound Effect by `ALEXIS_GAMING_CAM` from Pixabay.
    - Uso correto: preparar a cena para a apresentacao do carrinho quando todos os codigos/modulos C# forem lidos corretamente.
  - `[Som da torcida]`: Sound Effect by `Mauricio Povoa` from Pixabay.
    - Uso correto: quando o carro faz a curva perto da torcida.
  - `[Fans_in_the_Stadium]`: Sound Effect by `Mauricio Povoa` from Pixabay.
    - Uso correto: torcida ambiente normal, em volume mais baixo.
  - `[Go-Kart Passing]`: Sound Effect by `Alexander Jauk` from Pixabay.
    - Uso correto: carros normalmente durante corrida.
  - `[015522_Go Kart Racing Outdoors]`: link Pixabay `https://pixabay.com/pt/sound-effects/cidade-015522-go-kart-racing-outdoors-54107/`.
    - Uso correto: carros ao lado da protagonista durante a corrida.
    - Ponto a confirmar na implementacao: identificar qual MP3 em `sounds-trilha/` corresponde a este item, ou se falta um arquivo separado.

### Plan

Implementar integracao dos MP3 como assets publicos e camadas de audio controladas.

Escopo dentro:

1. Preparar assets estaticos:
   - criar `public/sounds/`;
   - copiar os MP3 de `sounds-trilha/` para nomes ASCII/kebab-case:
     - `wankel-test-room-engine.mp3`;
     - `kart-tested-presentation.mp3`;
     - `race-engine-loop.mp3`;
     - `crowd-checkered-flag.mp3`;
     - `crowd-base.mp3`;
     - `crowd-near-bleachers-layer.mp3`;
   - manter `sounds-trilha/` fora do codigo como origem do usuario ou incluir apenas se for desejado no commit final.
2. Criar um pequeno catalogo de paths de audio:
   - preferencialmente `src/components/audio/audioAssets.ts`;
   - usar URLs absolutas `/sounds/<arquivo>.mp3`.
3. Integrar simulador de corrida em `useSimAudio.ts`:
   - carregar o audio `[Go-Kart Passing]` como camada de carros normalmente durante a corrida;
   - carregar o audio `[015522_Go Kart Racing Outdoors]`, se presente, como camada de carros ao lado da protagonista durante a corrida;
   - manter ou ajustar loop/ganho/pitch de motor conforme a disponibilidade real dos arquivos;
   - manter sintetizador atual como fallback ou camada discreta, caso arquivo nao carregue;
   - usar `[Fans_in_the_Stadium]` como torcida ambiente normal, mais baixa;
   - usar `[Som da torcida]` como camada adicional quando o carro fizer a curva perto da arquibancada;
   - disparar `crowd-checkered-flag.mp3` na bandeirada/final, no lugar ou junto da fanfare sintetizada.
4. Integrar sala de teste Wankel em `useWankelTestAudio.ts`:
   - carregar `wankel-test-room-engine.mp3` como loop da bancada;
   - ajustar ganho conforme `running`, `throttle` e `health`;
   - manter o som sintetizado como fallback ou subcamada tecnica leve.
5. Integrar apresentacao do carro:
   - usar `[Riser long Classique 1]` para preparar a cena de apresentacao;
   - gatilho correto: quando todos os codigos/modulos C# forem lidos corretamente, ou seja, quando o checklist permitir a liberacao;
   - evitar repeticao infinita: tocar uma vez por transicao de checklist incompleto -> completo;
   - tambem permitir uma acao explicita de replay/apresentacao se necessario, sem autoplay fora do gesto habilitador de audio.
6. Documentar:
   - atualizar `inventario-cena-interfaces.md` removendo a afirmacao de "sem assets externos";
   - atualizar `historico-etapas.md`;
   - atualizar `tarefa-atual.md`.

Escopo fora:

- Nao editar o conteudo dos MP3.
- Nao criar mixagem profissional ou normalizacao offline.
- Nao trocar toda a arquitetura de audio por uma biblioteca externa.
- Nao adicionar autoplay.
- Nao mexer em fisica, pista ou modelo visual fora do necessario para gatilhos de audio.

Mapeamento proposto:

- `motor-para-a-sala-de-teste.mp3` -> `[som do motor]`, loop/camada da bancada Wankel quando `Audio ON` estiver ligado; volume acompanha `running/throttle`.
- `som-apresentação-carro-testado.mp3` -> `[Riser long Classique 1]`, one-shot quando todos os modulos/codigos C# forem lidos corretamente e a cena puder preparar a apresentacao do carrinho.
- `som-motor-durante-corrida.mp3` -> `[Go-Kart Passing]`, carros normalmente durante a corrida.
- `torcida1.mp3` -> `[Fans_in_the_Stadium]`, torcida ambiente normal em volume mais baixo.
- `torcida2-sobreposição-quando-carros-se-aproximam-da-torcida.mp3` -> `[Som da torcida]`, camada extra quando o carro faz a curva perto da torcida.
- `torcida-na-bandeirada.mp3` -> one-shot na finalizacao da corrida/bandeirada.
- `[015522_Go Kart Racing Outdoors]` -> carros ao lado da protagonista durante a corrida; confirmar se corresponde a algum arquivo ja presente ou se sera necessario adicionar/copiar um MP3 separado.

Creditos a registrar na documentacao/manifesto de audio:

- `freesound_community` / Pixabay: `[som do motor]`.
- `ALEXIS_GAMING_CAM` / Pixabay: `[Riser long Classique 1]`.
- `Mauricio Povoa` / Pixabay: `[Som da torcida]`.
- `Mauricio Povoa` / Pixabay: `[Fans_in_the_Stadium]`.
- `Alexander Jauk` / Pixabay: `[Go-Kart Passing]`.
- Pixabay URL informada: `[015522_Go Kart Racing Outdoors]`.

Criterios de aceite:

- Os arquivos de audio ficam acessiveis no build por `/sounds/...`.
- `Audio 3D` liga/desliga motor de corrida e torcida sem autoplay.
- Motor de corrida responde a velocidade de forma perceptivel.
- Torcida base e camada de aproximacao nao estouram volume quando sobrepostas.
- Bandeirada toca uma vez no final da corrida.
- Audio da sala Wankel usa o MP3 da sala de teste e continua respondendo ao botao `Audio ON/OFF`.
- Riser de apresentacao toca quando a leitura dos modulos C# fica completa, sem repetir continuamente enquanto o estado permanece completo.
- Creditos dos audios ficam documentados no repositorio.
- `npm run build` passa.

Riscos e mitigacoes:

- MP3 pode falhar em algum navegador/ambiente: manter fallback sintetizado.
- Loops podem ter cortes perceptiveis: usar ganho/fade simples, aceitar para primeira integracao.
- Pitches de `HTMLAudioElement.playbackRate` podem soar artificiais: aplicar faixa estreita de playback rate.
- Caminhos com acentos podem quebrar URL: copiar para nomes ASCII em `public/sounds/`.
- Fim de corrida pode disparar mais de uma vez: usar refs de ultimo evento, como ja ocorre com checkpoint/replay.

### Status RPI

Concluido. Implementacao liberada por `[Concluir RPI]`.

## Arquivos Impactados

- `analise-tecnica/tarefas/tarefa-atual.md`
- `public/sounds/wankel-test-room-engine.mp3`
- `public/sounds/kart-tested-presentation-riser.mp3`
- `public/sounds/go-kart-passing.mp3`
- `public/sounds/crowd-checkered-flag.mp3`
- `public/sounds/fans-in-the-stadium-low.mp3`
- `public/sounds/crowd-near-turn.mp3`
- `public/sounds/go-kart-racing-outdoors.mp3`
- `src/components/audio/audioAssets.ts`
- `src/components/simulator/useSimAudio.ts`
- `src/components/simulator/SimulatorScene.tsx`
- `src/components/realsim/hooks/useWankelTestAudio.ts`
- `src/components/realsim/hooks/usePresentationRiserAudio.ts`
- `src/components/realsim/RealSimulator.tsx`
- `src/components/realsim/RealSimUI.tsx`
- `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- `analise-tecnica/documentacao-partes/historico-etapas.md`

## Riscos Tecnicos

- Navegadores bloquearem autoplay sem gesto do usuario.
- Arquivos com acentos no nome exigirem cuidado em URL/paths.
- Audio de motor em loop conflitar com audio sintetizado atual.
- Torcida base, aproximacao e bandeirada se sobreporem alto demais.
- Adicionar assets em local nao servido pelo build.
- Aumentar bundle se audios forem importados de forma inadequada.

## Checks Planejados

- `git status --short --branch` antes de alterar codigo.
- Research de audio atual e fluxo de assets.
- Revisao de diff apos implementacao.
- `npm run build` apos implementacao.
- Validacao manual de audio no simulador e na sala de teste.

## Checks Executados

- `git status --short --branch`: branch `main`, apenas `sounds-trilha/` nao rastreado antes da abertura.
- Listagem inicial dos arquivos em `sounds-trilha/`:
  - `motor-para-a-sala-de-teste.mp3` - 279.840 bytes.
  - `som-apresentação-carro-testado.mp3` - 509.952 bytes.
  - `som-motor-durante-corrida.mp3` - 223.488 bytes.
  - `torcida-na-bandeirada.mp3` - 161.280 bytes.
  - `torcida1.mp3` - 161.332 bytes.
  - `torcida2-sobreposição-quando-carros-se-aproximam-da-torcida.mp3` - 163.004 bytes.
- Research de `useSimAudio.ts`, `useWankelTestAudio.ts`, `engineTest.ts`, `RealSimulator.tsx`, `RealSimUI.tsx`, `SimulatorScene.tsx`, `raceStore.ts`, `vite.config.ts`, `public/` e `inventario-cena-interfaces.md`.
- RPI registrado com plano de implementacao bloqueado ate `[Concluir RPI]`.
- Mapeamento e creditos informados pelo usuario registrados no RPI em 2026-05-15.
- `[Concluir RPI]` recebido em 2026-05-15.
- MP3 copiados para `public/sounds/` com nomes ASCII/kebab-case.
- Criado catalogo `audioAssets.ts` com paths e creditos.
- `useSimAudio.ts` passou a usar camadas de kart passando, torcida ambiente, torcida perto da curva e bandeirada.
- Novo arquivo `015522_Go Kart Racing Outdoors.mp3` encontrado e publicado como `go-kart-racing-outdoors.mp3`.
- `useSimAudio.ts` passou a elevar essa camada quando outros karts ficam perto da protagonista.
- `useWankelTestAudio.ts` passou a usar o MP3 da sala de teste Wankel.
- Criado `usePresentationRiserAudio.ts` para tocar o riser quando os modulos ficam prontos.
- `RealSimulator.tsx` e `RealSimUI.tsx` atualizados com habilitacao/replay de apresentacao.
- Inventario de cena e historico de etapas atualizados.
- `npm run build`: passou. Avisos conhecidos de `@import` CSS e chunks grandes permanecem.
- `npm run build` apos integrar `015522_Go Kart Racing Outdoors`: passou. Avisos conhecidos permanecem.
- `git diff --check`: passou; apenas avisos de conversao LF/CRLF do Windows.
- `npm run build` final de fechamento: passou. Avisos conhecidos de `@import` CSS e chunks grandes permanecem.
- Revisao final de diff: concluida, escopo restrito a assets de audio, integracao, creditos e documentacao.

## Fechamento

- Finalizada em: 2026-05-15
- Commit: criado no fechamento da tarefa; hash final informado ao usuario.

## Notas Para Release

- **Adicionado:** sons reais/fornecidos para corrida, torcida, bandeirada, apresentacao e sala Wankel.
- **Alterado:** audio sintetizado passa a ser fallback/camada auxiliar onde houver MP3.
- **Tecnico:** assets de audio passam a ser servidos por `public/sounds/`.
