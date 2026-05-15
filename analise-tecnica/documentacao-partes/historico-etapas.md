# Historico De Etapas

## 2026-05-13

### Etapa 1 - Remocao do cone azul frontal

- Arquivo principal: `src/components/realsim/RealKart.tsx`.
- Alteracao: removido o bloco `Nose cone`.
- Resultado esperado: frente do kart fica limpa, mantendo o arco/estrutura do chassi.

### Etapa 2 - Estribos laterais

- Arquivo principal: `src/components/realsim/RealKart.tsx`.
- Alteracao: side pods azuis substituidos por estribos laterais em aluminio polido.
- Marcador: `TASK-SIDESTEPS-ONLY`.
- Ajuste posterior: estribos encurtados e recuados para ficarem atras da linha da roda dianteira.

### Etapa 3 - Rodas e calotas

- Arquivo principal: `src/components/realsim/parts/Wheels.tsx`.
- Alteracoes:
  - Rodas dianteiras estreitas e traseiras largas.
  - Pivots centralizados no cubo.
  - Calotas em aluminio polido no mesmo acabamento dos estribos.
  - Calotas deslocadas para fora da face da roda.
  - Aneis `torusGeometry` corrigidos para nao cortar visualmente pneu/aro.
- Tentativa descartada: design futurista turbofan/carbono.

### Etapa 4 - Motor removivel e sala acustica

- Arquivos:
  - `src/components/realsim/parts/MotorAssembly.tsx`
  - `src/components/realsim/Workshop.tsx`
- Alteracoes:
  - Criado motor removivel com pivot na base inferior central.
  - Criada sala acustica dentro da oficina.
  - Criada bancada/dinamometro de teste usando o mesmo motor.

### Etapa 5 - Conversao para motor Wankel

- Arquivo principal: `src/components/realsim/parts/MotorAssembly.tsx`.
- Alteracao: motor 2T substituido por Wankel/rotativo.
- Itens incluidos:
  - Carcaca epitrocoidal.
  - Rotor triangular em corte tecnico.
  - Eixo excentrico.
  - Vedacoes de apice.
  - Admissao, escape, dupla ignicao e arrefecimento.
- Sinalizacao atualizada em `Workshop.tsx`: `SALA ACUSTICA · TESTE MOTOR WANKEL`.

### Etapa 6 - Sistema de documentacao

- Diretorio: `analise-tecnica/documentacao-partes/`.
- Objetivo: manter rastreabilidade tecnica de partes, arquivos, pivots e tarefas.

### Etapa 7 - Interfaces tecnicas de cena

- Arquivos:
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/RealSimulator.tsx`
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- Alteracoes:
  - Paineis superiores deixaram de ser textos fixos e passaram a usar `KartTelemetry`.
  - `MODULES OK` agora alterna com `MODULES CHECK` conforme checklist real de modulos.
  - Painel de telemetria exibe velocidade, marcha, bateria, freio e direcao.
  - Console `DIAG 26A` passou a exibir estado real de validacao, marcha e bateria.

### Etapa 8 - Refinamento da sala acustica Wankel

- Arquivo principal: `src/components/realsim/Workshop.tsx`.
- Alteracoes:
  - Sala acustica recebeu porta/vidro tecnico com moldura de vedacao.
  - Paineis acusticos ganharam relevo para melhor leitura de isolamento.
  - Criado sistema visual de exaustao com duto, grelha, flange e luz de status.
  - Adicionados microfones/sensores de medicao acustica ao redor da bancada.
  - Adicionada tela interna com leitura de dB, RPM, array de microfones e celula de carga.
  - Bancada ganhou detalhe visual de carga/dinamometro.

### Etapa 9 - Acesso direto a sala acustica

- Arquivos:
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/CameraController.tsx`
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- Alteracoes:
  - Criado foco de cena separado do foco modular do kart.
  - Adicionado botao `Sala Acustica` na barra de focos.
  - Camera passa a mirar diretamente a sala de teste Wankel.
  - Focos de modulo continuam preservando labels, cabos, raio-X e auditoria.

### Etapa 10 - Som e painel de teste da bancada Wankel

- Arquivos:
  - `src/components/realsim/RealSimulator.tsx`
  - `src/components/realsim/RealSimUI.tsx`
  - `src/components/realsim/Workshop.tsx`
  - `src/components/realsim/parts/MotorAssembly.tsx`
  - `src/components/realsim/hooks/useWankelTestAudio.ts`
  - `src/components/realsim/engineTest.ts`
  - `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- Alteracoes:
  - Criado estado local de teste da bancada Wankel.
  - Criado audio sintetizado do motor de teste via Web Audio.
  - Adicionado painel externo com ligar/parar, audio, aceleracao, RPM, saude, temperatura e carga.
  - Sala acustica passou a refletir o teste em leitura interna, luz de status e bancada.
  - O teste da bancada permanece separado dos modulos C# e de `KartTelemetry`.

### Etapa 11 - Iluminacao da sala e contato das rodas

- Arquivo principal: `src/components/realsim/Workshop.tsx`.
- Alteracoes:
  - Plataforma de inspecao foi nivelada ao piso para nao atravessar visualmente os pneus.
  - Outline/anel RL da plataforma foi reposicionado para ficar apenas acima do piso.
  - Materiais internos da sala acustica foram clareados sem perder o visual industrial.
  - Sala acustica recebeu luzes internas adicionais para vidro, bancada, duto e paineis.
  - Luz de status da bancada foi reforcada quando o teste Wankel esta rodando.

### Etapa 12 - Primeira pista em escala para o RL Kart 26A

- Arquivos principais:
  - `src/components/simulator/track.ts`
  - `src/components/simulator/trackConfig.json`
  - `src/components/simulator/TrackModel.tsx`
  - `src/components/simulator/KartRig.tsx`
  - `src/components/simulator/KartModel.tsx`
  - `src/components/simulator/AIKart.tsx`
  - `src/components/simulator/GhostKart.tsx`
  - `src/components/simulator/RecordedRace.tsx`
- Alteracoes:
  - Criado contrato de superficie da pista para contato dos pneus.
  - Pista ajustada para um kartodromo compacto em escala de metros.
  - Asfalto deixou de ser renderizado acima do ponto de contato.
  - Zebras, linhas e marcadores passaram a usar apenas offset de decalque.
  - Player, IA, fantasma e replay passaram a consultar a mesma altura de pista.
  - Rodas do kart procedural da corrida passaram a usar `wheelRadius = 0.14`.
  - Pads de boxes foram nivelados para nao ficarem acima do plano trafegavel.
  - Circuito foi ampliado com mais curvas, chicane tecnica e hairpins.
  - Adicionadas muretas, postes e cercas/rede de contencao externas para conter pecas soltas antes da area de torcida.
