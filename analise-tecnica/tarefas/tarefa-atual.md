# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-19

## Titulo

Refino visual dos karts da pista e vidro limpo da sala acustica

## Objetivo

Antes da etapa final de QA visual/refino da primeira versao, alinhar os carrinhos da arena ao modelo oficinal usado na Oficina/Simulador Real e corrigir a renderizacao do painel frontal da sala acustica para eliminar a camada fosca que prejudica transparencia e legibilidade.

## Escopo Inicial

- Revisar o modelo visual atual dos karts da pista:
  - `src/components/simulator/KartModel.tsx`;
  - usos em `KartRig`, `AIKart` e `RecordedRace`.
- Comparar com o carrinho/modelo oficinal atual:
  - `src/components/realsim/RealKart.tsx`;
  - componentes em `src/components/realsim/parts/`, especialmente chassi, rodas, motor e materiais.
- Ajustar os karts da arena para se aproximarem do modelo oficinal:
  - proporcao visual;
  - materiais;
  - rodas/cockpit;
  - identidade/livery;
  - preservando hitbox, fisica, cameras e controle.
- Corrigir a sala acustica em `src/components/realsim/Workshop.tsx`:
  - remover camada semitransparente/esbranquicada que cobre a frente da cabine;
  - remover especificamente a layer quadrada clara que fica sobre a frente da
    sala e atrapalha a visao interna;
  - tornar o vidro frontal limpo e transparente;
  - garantir que o vidro nao bloqueie a iluminacao interna nem a visibilidade do motor Wankel;
  - separar textos e menu `PAINEL EXTERNO` do material do vidro;
  - manter UI 100% opaca, legivel e em world space/fixada sobre o vidro.
- Adicionar movimento visivel ao motor Wankel durante o teste:
  - quando `engineTest.running` estiver ativo, o motor deve ter animacao clara
    de funcionamento;
  - a animacao deve ajudar o usuario a perceber que o teste esta acontecendo
    mesmo atraves do vidro limpo.
- Adicionar controle de volume seguro para a Sala Acustica:
  - permitir reduzir o volume do motor Wankel durante a interacao;
  - responder em tempo real sem desligar necessariamente o teste;
  - objetivo: nao prejudicar conforto/saude auditiva do usuario.
- Nao iniciar implementacao antes de `[Concluir RPI]`.
- A tarefa posterior de QA visual/refino devera ser aberta separadamente apos esta entrega.

## Estado Inicial Do Git

Verificado em 2026-05-19 apos abertura da tarefa:

- Branch: `main`.
- Ultimo commit fechado da tarefa anterior: `9924d1f` (`milestone: add qualifying race flow`).
- Sem modificacoes rastreadas pendentes.
- Artefatos nao rastreados existentes e fora do escopo imediato:
  - `chamado-correções-erros-prints/`;
  - `image_1030ed13.png` na raiz;
  - `sounds-trilha/`.

## Arquivos Provaveis

- `src/components/simulator/KartModel.tsx`
- `src/components/simulator/KartRig.tsx`
- `src/components/simulator/AIKart.tsx`
- `src/components/simulator/RecordedRace.tsx`
- `src/components/realsim/RealKart.tsx`
- `src/components/realsim/parts/Chassis.tsx`
- `src/components/realsim/parts/MotorAssembly.tsx`
- `src/components/realsim/Workshop.tsx`
  - camada quadrada clara no painel frontal da sala acustica;
  - motor em bancada de teste.
- `src/components/realsim/RealSimulator.tsx`
  - estado local do volume seguro do teste Wankel.
- `src/components/realsim/RealSimUI.tsx`
  - overlay tecnico tambem recebe slider de volume.
- `src/components/realsim/hooks/useWankelTestAudio.ts`
  - ganhos principais do audio do Wankel devem ser multiplicados pelo volume do
    usuario.
- `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- `analise-tecnica/documentacao-partes/historico-etapas.md`

## Riscos Iniciais

- Mudar o `KartModel` pode afetar camera, cockpit/helmet view e leitura de hitbox.
- A arena usa escala e hierarquia propria; reaproveitar geometria da oficina deve ser feito por compatibilidade visual, nao por troca direta sem validar proporcoes.
- Vidro transparente em Three.js pode gerar ordenacao/alpha sorting ruim se UI e vidro compartilharem plano.
- A UI da sala acustica deve continuar clicavel e legivel depois da separacao do vidro.
- O motor Wankel precisa continuar visivel e iluminado por tras do vidro limpo.

## RPI

Iniciado em 2026-05-19.

### Research

Concluido em 2026-05-19.

- Estado do git no inicio do RPI:
  - Branch `main`.
  - Apenas `analise-tecnica/tarefas/tarefa-atual.md` modificado pela abertura
    da tarefa.
  - Nao rastreados fora do escopo:
    - `chamado-correções-erros-prints/`;
    - `image_1030ed13.png` na raiz;
    - `sounds-trilha/`.
- `src/components/simulator/KartModel.tsx`
  - Modelo atual da arena e procedural.
  - Ja usa `RL_KART_DIMENSIONS` e `RL_KART_DERIVED`, portanto escala oficial
    esta alinhada ao modelo oficinal.
  - Possui hierarquia funcional importante:
    - pivots de direcao nas rodas dianteiras;
    - refs individuais para giro das rodas;
    - `Driver`;
    - steering wheel animado;
    - labels e livery por piloto.
  - A implementacao atual tem:
    - chassi tubular simples;
    - floor pan;
    - front fairing;
    - side pods;
    - bateria;
    - motor simplificado cilindrico;
    - rodas proceduralmente animadas.
  - Nao convem substituir por `RealKart` diretamente, porque `KartModel` e
    usado em `KartRig`, `AIKart` e `RecordedRace` com animacao propria de rodas,
    direcao e driver.
- `src/components/realsim/RealKart.tsx`
  - Modelo oficinal e composicional.
  - Pode carregar GLB se existir, mas fallback procedural e montado por partes:
    - `Chassis`;
    - `Seat`;
    - `Steering`;
    - `ElectricalSystem`;
    - `MotorAssembly`;
    - `GearSelector`;
    - `BrakeSystem`;
    - `Dashboard`;
    - `SideStep`.
  - O modelo oficinal tambem usa as mesmas dimensoes oficiais `RL_KART_26A`.
  - Reaproveitamento recomendado:
    - copiar linguagem visual/material dos componentes, nao trocar a arvore do
      kart da arena por `RealKart`.
- `src/components/realsim/parts/Chassis.tsx`
  - Chassi oficinal usa:
    - trilhos laterais em metal escuro;
    - trilhos superiores de protecao;
    - struts verticais;
    - eixo dianteiro/traseiro visiveis;
    - roll hoop atras do banco;
    - berco de motor traseiro.
  - Materiais usam metalness alto, roughness medio e emissive sutil azul.
- `src/components/realsim/parts/Seat.tsx`
  - Banco oficinal e bucket seat com:
    - base;
    - bolsters laterais;
    - encosto inclinado;
    - headrest;
    - ancoragens de cinto vermelhas.
  - O `Driver` da arena hoje ocupa o cockpit; o banco precisa ser visualmente
    compatível sem atravessar a corredora.
- `src/components/realsim/parts/Steering.tsx`
  - Direcao oficinal tem volante menor e mais tecnico, com hub emissivo azul.
  - A arena ja tem steering wheel animado; pode receber hub e spokes mais
    proximos sem alterar animacao.
- `src/components/realsim/parts/MotorAssembly.tsx`
  - Motor oficinal representa o Wankel por:
    - housing lobado/epitrocoide;
    - rotor triangular;
    - eixo excentrico;
    - parafusos;
    - velas e cabos;
    - admissao/exaustao.
  - Para a arena, uma versao simplificada e recomendada para nao pesar nem
    comprometer todos os karts/replay.
- `src/components/simulator/RecordedRace.tsx`
  - Usa `KartModel`, portanto qualquer refino visual sera refletido no replay.
  - Deve manter props atuais (`state`, `driving`, `steer`, `speedKmh`,
    `liveryColor`).
- `src/components/realsim/Workshop.tsx`
  - Vidro frontal atual:
    - plano em `[0, 1.08, 0.965]`;
    - material `meshBasicMaterial color="#a8d8ff" transparent opacity={0.22}
      side={THREE.DoubleSide}`;
    - cria o filtro esbranquicado/azulado sobre o motor Wankel.
  - Textos frontais e leituras:
    - ja foram trazidos para a face externa em `z ~= 1.01`;
    - ainda possuem placas solidas de fundo (`#0c2236` e `#061827`) que podem
      parecer uma layer opaca adicional.
  - Painel `PAINEL EXTERNO` e um `Html` em world space externo, separado do mesh
    do vidro, mas ainda visualmente sobreposto ao plano.
  - Correção deve:
    - substituir o plano fosco por vidro quase invisivel ou material fisico de
      clear glass;
    - remover a layer quadrada clara da face frontal quando ela funcionar como
      filtro visual sobre a sala;
    - manter moldura/vedacao e puxador;
    - mover UI/textos para grupos proprios com fundos opacos localizados, sem
      depender do material do vidro;
    - evitar `depthWrite` no vidro para nao bloquear iluminacao/visibilidade
      interna;
    - preservar clique do painel externo.
- `src/components/realsim/parts/MotorAssembly.tsx` / `EngineTestRig`
  - `WankelEngine` hoje e uma composicao estatica.
  - `EngineTestRig` recebe `engineTest`, mas nao usa animacao mecanica visivel
    do rotor/eixo.
  - Como o usuario precisa ver o teste acontecendo, a implementacao deve
    animar um subconjunto visivel do motor quando `engineTest.running` estiver
    ativo, preferencialmente rotor/eixo/indicador mecanico, com velocidade
    ligada ao `throttle`/`rpm`.
- `src/components/realsim/CameraController.tsx`
  - Foco `acousticRoom` olha de fora para a sala.
  - Nao ha necessidade inicial de mover camera; a melhoria principal fica em
    material/transparencia e legibilidade.

### Plan

Plano proposto para executar apos `[Concluir RPI]`.

1. Refino do kart da arena em `KartModel.tsx`
   - Manter interface publica e hierarquia de refs.
   - Introduzir pequenos helpers locais para materiais/peças:
     - tubos metalicos escuros;
     - side steps de aluminio;
     - bucket seat visual;
     - motor Wankel simplificado;
     - cubos/aros mais tecnicos.
   - Substituir ou complementar os `side pods` por degraus laterais/removable
     aluminum side steps inspirados no modelo oficinal.
   - Adicionar trilhos superiores e struts, preservando rodas e pivots atuais.
   - Melhorar banco/cockpit sem deslocar o `Driver`.
   - Trocar o motor cilindrico simplificado por uma leitura Wankel compacta:
     - housing lobado ou caixa técnica com rotor triangular visivel;
     - cabos/velas/exaustao curta;
     - materiais metalicos coerentes com `MotorAssembly`.
   - Preservar:
     - dimensoes oficiais;
     - `position`/`rotation`;
     - animacao de direcao;
     - rotacao das rodas;
     - livery por piloto;
     - textos/numeracao.

2. Garantir compatibilidade nos usos
   - Validar visual por uso em:
     - `KartRig`;
     - `AIKart`;
     - `RecordedRace`.
   - Ajustar somente se houver clipping evidente por causa do novo cockpit,
     banco ou motor.

3. Vidro limpo da sala acustica em `Workshop.tsx`
   - Substituir o material do plano frontal por clear glass:
     - material `meshPhysicalMaterial`;
     - `transparent`;
     - opacidade muito baixa;
     - alta transmission/clearcoat quando suportado;
     - `depthWrite={false}`;
     - `side={THREE.DoubleSide}`.
   - Remover o aspecto azulado/esbranquicado do vidro:
     - sem `meshBasicMaterial` fosco;
     - sem color overlay amplo na cabine.
   - Remover a layer quadrada clara que atualmente bloqueia a leitura do
     interior da sala.
   - Manter apenas reflexos/sutilezas de borda, caso necessario, fora da area
     principal de visao do motor.
   - Separar a UI:
     - textos `SALA ACUSTICA`, dB/RPM, health/load e painel externo ficam acima
       do vidro em world space;
     - fundos dos textos devem ser pequenos painéis opacos localizados, nao uma
       camada grande sobre o vidro;
     - `Html` do painel externo continua externo, opaco e clicavel.
   - Garantir que o vidro nao bloqueie iluminacao interna:
     - usar material fisico/transparente com `depthWrite={false}`;
     - manter luzes internas atuais.

4. Movimento visivel do motor Wankel em teste
   - Ajustar `WankelEngine`/`EngineTestRig` para permitir animacao quando
     `engineTest.running` estiver ativo.
   - Animar rotor/eixo ou elemento tecnico equivalente com velocidade derivada
     de `engineTest.throttle`/`engineTest.rpm`.
   - Manter fallback parado quando o teste estiver em standby.
   - Evitar animacao pesada em todos os motores da aplicacao; priorizar a
     bancada da sala acustica.

5. Documentacao
   - Atualizar `inventario-cena-interfaces.md`:
     - kart de arena alinhado ao modelo oficinal;
     - vidro clear glass e UI separada da sala acustica.
   - Atualizar `historico-etapas.md` no fechamento.
   - Atualizar `tarefa-atual.md` com implementacao e checks.

6. Validacao
   - `npx eslint` nos arquivos alterados.
   - `npm run build`.
   - Validacao manual recomendada:
     - `/simulator`: checar kart Rayssa, adversarios e replay sem quebrar
       cameras/rodas.
     - `/simulador-real`: checar foco `SALA ACUSTICA`, transparencia do vidro,
       visibilidade do Wankel, legibilidade e clique do painel externo.

### Criterios De Aceite

- Karts da arena parecem derivados do modelo oficinal, mantendo identidade de
  corrida e livery.
- Nenhum uso de `KartModel` quebra props, animacao de rodas/direcao ou driver.
- Vidro frontal da sala acustica deixa de ter filtro fosco/esbranquicado.
- Motor Wankel fica visivel atras do vidro limpo.
- Motor Wankel tem movimento perceptivel durante teste ativo.
- Textos e painel externo continuam nitidos e opacos.
- Painel externo continua interativo.
- Build passa.

### Escopo Fora Desta Tarefa

- Substituir todos os karts por GLB externo.
- Refazer fisica, colisao, hitbox ou cameras da arena.
- Fazer QA visual amplo da primeira versao; essa sera a tarefa seguinte.

## Implementacao

Executada em 2026-05-19 apos `[Concluir RPI]`.

- `src/components/realsim/parts/MotorAssembly.tsx`
  - `WankelEngine` recebeu props opcionais `running` e `throttle`.
  - Rotor, eixo e polia frontal passaram a animar quando o teste Wankel esta
    rodando.
  - `EngineTestRig` passa `engineTest.running` e `engineTest.throttle` para o
    motor da bancada.
  - Grupo fisico do motor recebeu vibracao procedural em X/Y/Z proporcional ao
    slider `Aceleracao`, com marcha lenta suave e tremor mais intenso em stress.
  - Polia e eixo do dinamometro tambem giram em tempo real conforme o arrasto do
    slider.
- `src/components/realsim/Workshop.tsx`
  - Vidro frontal trocado de layer azul/esbranquicada com `meshBasicMaterial`
    para `meshPhysicalMaterial` transparente/clear glass.
  - `depthWrite={false}` aplicado ao vidro para reduzir bloqueio visual e
    preservar leitura interna.
  - Fundos de UI frontal foram reposicionados para fora do vidro, com opacidade
    localizada, evitando uma layer ampla sobre o motor.
  - Textos `SALA ACUSTICA`, dB/RPM e health/load permanecem opacos e externos.
- `src/components/simulator/KartModel.tsx`
  - Mantida a API publica e a hierarquia de refs usadas por fisica, cameras,
    direcao e replay.
  - Chassi recebeu trilhos superiores, struts e roll hoop inspirados no modelo
    oficinal.
  - Side pods foram convertidos visualmente em degraus laterais de aluminio com
    textura/ridges e identificacao de kart.
  - Volante recebeu hub emissivo tecnico.
  - Adicionado bucket seat shell por baixo/atras da corredora.
  - Motor traseiro simplificado foi substituido por leitura compacta de Wankel,
    com housing triangular, rotor visivel, ribs e exaustao metalica.
- Controle de volume seguro:
  - `EngineTestState` ganhou `volume`.
  - `RealSimulator` controla `engineVolume` com padrao inicial de 45%.
  - `useWankelTestAudio` recebe `volume` e aplica ao `masterGain` em tempo real.
  - `Workshop` adicionou slider `Volume seguro` ao Painel Externo da sala
    acustica.
  - `RealSimUI` adicionou o mesmo slider ao overlay tecnico quando visivel.
- Documentacao e prontidao para DLLs:
  - Criado `public/docs/DLL_STUDENT_GUIDE.md` com funcoes, condicoes,
    criterios de bloqueio, checklist, boas praticas e padroes de projeto para
    os alunos.
  - Atualizado `public/docs/CSHARP_MODULE_CONTRACT.md` para deixar explicito
    que o nome do arquivo `.dll` tambem bloqueia carregamento quando incorreto.
  - `dllInspector` passou a validar `FileName` como criterio bloqueante.
  - `DllImportPanel` passou a exibir a validacao `FileName` e linkar o guia dos
    alunos.
  - Prontidao atual confirmada: o frontend recebe, inspeciona e testa DLLs por
    cenario simulado; execucao real da DLL ainda requer host .NET externo via
    WebSocket.

## Checks

- `npx eslint src\components\realsim\parts\MotorAssembly.tsx src\components\realsim\Workshop.tsx src\components\simulator\KartModel.tsx --fix`: aplicado para formatacao.
- `npx eslint src\components\realsim\parts\MotorAssembly.tsx src\components\realsim\Workshop.tsx src\components\simulator\KartModel.tsx --fix`: reaplicado apos reforco de vibracao/rotacao pelo slider.
- `npx eslint src\components\realsim\parts\MotorAssembly.tsx src\components\realsim\Workshop.tsx src\components\simulator\KartModel.tsx`: aprovado.
- `npm run build`: aprovado.
  - Avisos residuais conhecidos:
    - `@import` de fontes no CSS fora da primeira posicao;
    - chunks acima de 500 kB.

## Fechamento

Finalizada em 2026-05-19.

- Diff revisado antes do commit.
- Escopo implementado conforme RPI aprovado:
  - karts da arena refinados com linguagem visual do modelo oficinal;
  - vidro frontal da sala acustica convertido para clear glass;
  - motor Wankel da bancada com animacao e vibracao durante teste ativo;
  - controle de volume seguro exposto no painel externo e overlay tecnico;
  - validacao de DLL reforcada por nome de arquivo;
  - guia dos alunos publicado em `public/docs/DLL_STUDENT_GUIDE.md`.
- Artefatos nao rastreados fora do escopo mantidos sem alteracao:
  - `chamado-correções-erros-prints/`;
  - `image_1030ed13.png`;
  - `sounds-trilha/`.

## Notas De Release

- **Alterado:** karts da arena agora usam chassi, banco, degraus laterais e motor traseiro com leitura visual mais proxima do kart oficinal.
- **Corrigido:** vidro frontal da sala acustica deixou de aplicar filtro fosco/esbranquicado sobre o motor Wankel.
- **Adicionado:** teste Wankel ganhou movimento mecanico visivel e controle de volume seguro.
- **Adicionado:** guia de entrega de DLLs C# para alunos.
- **Tecnico:** importador de DLLs agora bloqueia arquivo cujo nome nao corresponda ao slot selecionado.
