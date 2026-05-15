# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-15

## Titulo

Criar primeira versao da pista para uso do kart RL Kart 26A em escala real

## Objetivo

Construir a primeira versao de uma pista para posicionar e usar o kart RL Kart 26A em escala real, mantendo coerencia fisica e visual entre rodas, solo e superficie da pista.

## Escopo

- Avaliar a cena atual do simulador/pista e como o kart e posicionado nela.
- Avaliar componentes existentes de pista, layout, boxes, arquibancada, IA e modelo do kart.
- Definir uma primeira versao de pista compatível com a escala real do RL Kart 26A.
- Aplicar a mesma regra usada na oficina: as rodas devem tocar a superficie correta sem afundar e sem flutuar.
- Identificar se o ajuste deve acontecer na malha da pista, no posicionamento do kart, no raio das rodas, no rig ou em algum offset visual.
- Planejar criterio claro para superficie de referencia da pista, zebras, areas de escape e boxes.
- Definir checks e validacao visual antes de implementar.

## Subtarefas

- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: implementar pista apos aprovacao por `[Concluir RPI]`.

## RPI

### Research

- `SimulatorScene.tsx` monta a cena de corrida em `/simulator` com `TrackModel`, `PitBoxes`, `Grandstand`, `KartRig`, `AIKart`, `GhostKart` e `RecordedRace`.
- `trackConfig.json` ja define uma pista fechada por pontos 3D, chamada `Circuito das Curvas Maiores`, com variacao vertical:
  - inicio em `y = 0`;
  - rampa ate `y = 5`;
  - trecho em `y = -1`;
  - `trackHalfWidth = 6.5`, ou largura total de 13 m.
- `track.ts` usa `CatmullRomCurve3` em escala 1 unidade = 1 metro e expoe:
  - `trackCurve()`;
  - `nearestOnTrack()`;
  - `spawnPose()`, que posiciona o kart em `p.y`, sem compensar a altura visual do asfalto.
- `TrackModel.tsx` gera o asfalto como ribbon entre bordas internas/externas, mas eleva os vertices para `p.y + 0.02`.
  - Isso cria um desvio de 2 cm entre a superficie visual da pista e a altura usada por `spawnPose()`/`nearestOnTrack()`.
  - E o mesmo tipo de risco ja corrigido na plataforma da oficina.
- Marcadores da pista tambem usam offsets independentes:
  - linha central em `p.y + 0.04`;
  - zebras em `p.y + 0.06`;
  - linha de largada em `startPos.y + 0.05`.
- `TrackModel.tsx` renderiza barreiras de pneus duas vezes:
  - uma em `p.y + 0.4`;
  - outra em `y = 0.4`.
  - Em trechos com elevacao, a segunda serie fica desalinhada da pista.
- O solo/grama e um plano grande em `position={[40, -1.2, 50]}`. Ele fica abaixo da pista, mas nao acompanha os trechos elevados ou o trecho em `y = -1`.
- `KartRig.tsx` renderiza o player com `KartModel position={[0, 0, -0.6]}` dentro de um grupo posicionado em `probe.point.y`.
  - Durante movimento, `next.y = group.current.position.y * 0.85 + probe.point.y * 0.15`, sem compensar a superficie visual `+0.02`.
  - `grounded` considera apenas distancia XZ ao centro da pista, nao a diferenca vertical entre roda e asfalto.
- `KartModel.tsx` do simulador nao esta em escala oficial do RL Kart 26A:
  - rodas dianteiras tem raio visual `0.22`;
  - rodas traseiras tem raio visual `0.26`;
  - eixos ficam em `y = 0.22` e `y = 0.24`;
  - o arquivo oficial `RLKart26ADimensions.ts` define `wheelDiameter = 0.28`, logo `wheelRadius = 0.14`.
- `KartRig.tsx` usa `PHYS.visualScale = 2.2`, o que acelera o deslocamento visual em relacao a velocidade fisica.
- O modelo tecnico oficial da oficina esta em `RealKart.tsx`:
  - usa `RL_KART_DIMENSIONS`;
  - tem pivot na origem do chassi ao nivel do solo;
  - usa roda oficial com centro em `wheelRadius = 0.14`.
- Atualmente a pista usa `KartModel`, nao `RealKart`. Portanto, o "carrinho que estamos fazendo" ainda nao e o modelo principal da cena de pista.
- `AIKart.tsx` posiciona adversarios em `point.y + 0.4`, ignorando a altura real da superficie e a escala oficial das rodas.
- `GhostKart.tsx` posiciona o fantasma em `y = 0.4`, ignorando totalmente elevacao da pista.
- `RecordedRace.tsx` tambem posiciona replays em `y = 0.4`.
- `raceStore.ts` e `replayRecordStore.ts` guardam pose apenas como `x`, `z` e `rotY`; altura nao e persistida.
- `PitBoxes.tsx` usa floor pads com topo em `y = 0.06` (`position.y = 0.03`, altura `0.06`), acima do plano de referencia `y = 0`.
  - Se algum kart entrar nesses pads, ha risco visual de pneu atravessado, igual ao pad antigo da oficina.
- `catalogo-partes.md` ja documenta a regra do kart tecnico:
  - com centro em `wheelRadius`, pneu toca o piso em `y = 0`;
  - plataformas visuais nao devem subir acima desse plano.

### Plan

Implementar a primeira versao da pista com uma regra unica de superficie.

Escopo dentro:

1. Definir uma constante/fonte unica para a superficie da pista:
   - tratar `trackCurve().getPointAt(t).y` como altura de contato do pneu;
   - desenhar o asfalto no mesmo plano visual da superficie, sem elevar a pista acima do contato;
   - manter linhas, zebras e decalques com offsets minimos apenas para evitar z-fighting, sem criar "degraus" que atravessem pneus.
2. Criar ou ajustar a primeira versao da pista para uso em escala real:
   - manter unidade 1 metro;
   - revisar largura para kart real, area de escape, boxes e leitura visual;
   - suavizar ou limitar elevacoes se necessario para uma primeira pista coerente;
   - preservar um circuito fechado com checkpoints.
3. Corrigir contato vertical de todos os carrinhos:
   - player: usar a altura de superficie da pista de forma consistente;
   - IA: remover offset fixo `+0.4` e usar a mesma regra do player;
   - fantasma e replay: recomputar altura pela pista a partir de `x/z` ou passar a armazenar altura se isso for necessario;
   - nao alterar `wheelRadius` oficial para resolver contato.
4. Alinhar o carrinho da pista ao RL Kart 26A:
   - preferencial: introduzir um componente/adaptador para usar `RealKart` ou um `RaceKartModel` baseado nas dimensoes oficiais;
   - alternativa incremental: corrigir `KartModel` do simulador para respeitar `RL_KART_DIMENSIONS`, mantendo animacoes de direcao/rodagem;
   - evitar misturar raio visual `0.22/0.26` com documentacao oficial `0.14`.
5. Ajustar elementos laterais:
   - remover duplicidade das barreiras de pneus;
   - alinhar barreiras, arquibancada e boxes com a altura/escala da pista;
   - nivelar pads de box para nao ficarem acima do plano de contato quando servirem como area trafegavel.
6. Documentar:
   - atualizar `catalogo-partes.md` com regra de pista/superficie, se a implementacao criar contrato novo;
   - atualizar `historico-etapas.md` com a primeira versao da pista e validacao de contato.

Escopo fora:

- Nao alterar dimensoes oficiais do RL Kart 26A.
- Nao resolver fisica completa de suspensao, colisao 3D ou banking real nesta primeira versao.
- Nao criar assets GLB novos.
- Nao refazer a UI do simulador.
- Nao fazer uma pista definitiva; esta entrega deve ser a primeira versao funcional e escalavel.

Arquivos provaveis:

- `src/components/simulator/track.ts`
- `src/components/simulator/trackConfig.json`
- `src/components/simulator/TrackModel.tsx`
- `src/components/simulator/KartRig.tsx`
- `src/components/simulator/KartModel.tsx` ou novo componente de kart de corrida baseado no RL Kart 26A
- `src/components/simulator/AIKart.tsx`
- `src/components/simulator/GhostKart.tsx`
- `src/components/simulator/RecordedRace.tsx`
- `src/components/simulator/PitBoxes.tsx`
- `analise-tecnica/documentacao-partes/catalogo-partes.md`
- `analise-tecnica/documentacao-partes/historico-etapas.md`
- `analise-tecnica/tarefas/tarefa-atual.md`

Criterios de aceite:

- O kart principal toca a pista sem afundar e sem flutuar em retas, curvas e trechos com elevacao.
- IA, fantasma e replay seguem a mesma altura visual do player.
- Zebras, linha de largada, boxes e pads nao atravessam pneus.
- A pista usa escala coerente em metros e comporta o RL Kart 26A sem parecer uma pista gigante demais para o kart.
- A regra de contato nao altera raio das rodas nem pivots oficiais do kart.
- `npm run build` passa.
- Validacao visual/manual confirma contato coerente em pelo menos largada, reta, curva, rampa e trecho de box.

Riscos e mitigacoes:

- Trocar `KartModel` por `RealKart` pode exigir adaptacao de props/telemetria; se ficar grande demais, fazer componente intermediario de corrida com dimensoes oficiais.
- Corrigir escala do kart pode afetar camera e hitbox; revisar cameras e `COLLISION_R` depois da alteracao.
- Remover offsets fixos pode revelar z-fighting; usar offsets de decalque pequenos e documentados.
- Replays antigos salvos em `localStorage` podem ficar desalinhados se o formato mudar; tratar como dado temporario ou recomputar altura em runtime.

### Status RPI

Concluido. Implementacao liberada por `[Concluir RPI]`.

## Arquivos Impactados

- `analise-tecnica/tarefas/tarefa-atual.md`
- `src/components/simulator/SimulatorScene.tsx`
- `src/components/simulator/TrackModel.tsx`
- `src/components/simulator/track.ts`
- `src/components/simulator/trackConfig.json`
- `src/components/simulator/KartRig.tsx`
- `src/components/simulator/KartModel.tsx`
- `src/components/simulator/AIKart.tsx`
- `src/components/simulator/GhostKart.tsx`
- `src/components/simulator/RecordedRace.tsx`
- `src/components/simulator/PitBoxes.tsx`
- `analise-tecnica/documentacao-partes/catalogo-partes.md`
- `analise-tecnica/documentacao-partes/historico-etapas.md`

## Riscos Tecnicos

- Incompatibilidade entre escala real do kart e escala atual da pista existente.
- Offset vertical duplicado entre pista, rig do kart e modelo visual.
- Zebras ou elementos decorativos acima da pista atravessando pneus.
- IA, fantasma ou replay usando alturas diferentes do kart principal.
- Alterar o contato visual das rodas quebrando a calibracao ja documentada no kart/oficina.
- Pista grande demais afetar performance, cameras ou leitura visual.

## Checks Planejados

- `git status --short --branch` antes de alterar codigo.
- Research dos componentes de pista, kart e simulador.
- Revisao de diff apos implementacao.
- `npm run build` apos implementacao.
- Validacao visual/manual da pista com kart principal, IA/fantasma quando aplicavel.

## Checks Executados

- `git status --short --branch`: branch `main` limpa na abertura da tarefa.
- Research de `SimulatorScene.tsx`, `TrackModel.tsx`, `track.ts`, `trackConfig.json`, `KartRig.tsx`, `KartModel.tsx`, `RLKart26ADimensions.ts`, `AIKart.tsx`, `GhostKart.tsx`, `RecordedRace.tsx`, `PitBoxes.tsx`, `RealKart.tsx`, `raceStore.ts`, `replayRecordStore.ts` e `catalogo-partes.md`.
- RPI registrado com plano de implementacao bloqueado ate `[Concluir RPI]`.
- `[Concluir RPI]` recebido em 2026-05-15.
- Implementado contrato de superficie em `track.ts`.
- Implementada primeira versao do `Kartodromo RL 26A` em `trackConfig.json`.
- Pista ampliada com reta maior, curvas rapidas, chicane tecnica e hairpins.
- Asfalto, zebras, linha central e linha de largada foram ajustados para nao elevar a superficie trafegavel.
- Player, IA, fantasma e replay passaram a usar a mesma altura de referencia da pista.
- Kart procedural da corrida recebeu rodas com raio oficial `0.14`.
- Pads de box foram nivelados para nao atravessar pneus.
- Adicionadas protecoes externas com barreira baixa, postes e cerca/rede de contencao para reduzir risco de pecas soltas atingirem a torcida.
- Catalogo de partes e historico de etapas atualizados.
- `npm run build`: passou. Avisos conhecidos de `@import` CSS e chunks grandes permanecem.
- Servidor de desenvolvimento iniciado para validacao manual em `http://127.0.0.1:8080/`.
- `git diff --check`: passou; apenas avisos de conversao LF/CRLF do Windows.
- `npm run build` apos ampliacao/protecoes: passou. Avisos conhecidos de `@import` CSS e chunks grandes permanecem.
- Revisao final de diff: concluida, escopo restrito a pista, contato dos karts, protecoes e documentacao.

## Fechamento

- Finalizada em: 2026-05-15
- Commit: criado no fechamento da tarefa; hash final informado ao usuario.

## Notas Para Release

- **Adicionado:** primeira versao da pista em escala coerente para uso do RL Kart 26A.
- **Adicionado:** barreiras, muretas e cercas de contencao externas para proteger a area de torcida.
- **Corrigido:** regra unica de contato para evitar carrinhos afundando ou flutuando na pista.
- **Tecnico:** superficie de referencia da pista documentada para player, IA, fantasma e replay.
