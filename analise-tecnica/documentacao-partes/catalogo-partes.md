# Catalogo De Partes

## Estrutura Principal

### Chassi tubular

- Funcao: estrutura primaria do kart.
- Codigo: `src/components/realsim/parts/Chassis.tsx`.
- Nome tecnico: `CHASSI_TUBULAR`.
- Requisitos:
  - Manter tubos laterais, travessas, eixo dianteiro, eixo traseiro e arco frontal.
  - Nao usar carenagens decorativas que ocultem a leitura tecnica da estrutura.
  - Servir de referencia para fixacao de estribos e motor.

### Estribos laterais

- Funcao: apoio lateral funcional e substituto dos antigos side pods azuis.
- Codigo: `src/components/realsim/RealKart.tsx`, componente `SideStep`.
- Marcador de tarefa: `TASK-SIDESTEPS-ONLY`.
- Requisitos:
  - Barras planas em aluminio polido.
  - Ponteiras pretas foscas nas extremidades.
  - Duas pisadeiras de borracha por lado.
  - Suportes inferiores discretos conectados visualmente aos tubos laterais.
  - Ficar atras da linha da roda dianteira para nao bloquear esterco.

## Rodas E Freios

### Conjunto de rodas

- Funcao: conjunto completo de pneus, aros, cubos e calotas.
- Codigo: `src/components/realsim/parts/Wheels.tsx`.
- Grupo pai: `RODAS_E_EIXOS`.
- Requisitos:
  - Dianteiras mais estreitas.
  - Traseiras mais largas.
  - Pivot local centralizado no cubo, em `[0, 0, 0]`.
  - Pneus slick pretos com ranhuras sutis.
  - Aro preto com tres raios.
  - Calotas em aluminio polido, alinhadas lateralmente e fora da face da roda.
  - Calotas nao podem cortar pneu, aro ou cubo.

### Freios

- Funcao: discos, pincas e pedal.
- Codigo: `src/components/realsim/parts/BrakeSystem.tsx`.
- Requisitos:
  - Preservar refs de rodas dianteiras para esterco.
  - Preservar refs de suspensao para compressao via telemetria.

## Motor E Testes

### Motor Wankel removivel

- Funcao: powertrain visual/tecnico do kart.
- Codigo: `src/components/realsim/parts/MotorAssembly.tsx`.
- Componente principal: `WankelEngine`.
- Nome tecnico no kart: `motor_rear`.
- Requisitos:
  - Pivote local na base inferior central da placa/carcaca.
  - Carcaca epitrocoidal.
  - Rotor triangular visivel em corte tecnico.
  - Eixo excentrico, vedações de apice, admissao, escape e ignicao.
  - Placa de montagem com quatro rasgos oblongos.
  - Instalar no bercario traseiro do chassi sem flutuar.

### Sala acustica de teste de motor

- Funcao: ambiente dedicado para manutencao, ensaio e teste de ruido do motor.
- Codigo: `src/components/realsim/Workshop.tsx`, componente `AcousticEngineRoom`.
- Bancada: `EngineTestRig`, reutilizando `WankelEngine`.
- Requisitos:
  - Ficar dentro da oficina atual.
  - Conter paineis acusticos, bancada/dinamometro e sinalizacao.
  - Representar isolamento sonoro, exaustao e teste controlado.
  - Ter porta/vidro tecnico com vedacao visual.
  - Evidenciar sistema de exaustao dedicado com duto, grelha e status.
  - Conter sensores/microfones de medicao acustica.
  - Exibir leitura interna de teste, como dB, RPM, array de microfones ou carga.

## Cockpit E Controle

### Banco e direcao

- Codigo:
  - `src/components/realsim/parts/Seat.tsx`
  - `src/components/realsim/parts/Steering.tsx`
- Requisitos:
  - Manter volante, coluna e banco alinhados ao blueprint.
  - Preservar animacao/telemetria de angulo de direcao.

### Painel e ignicao

- Codigo: `src/components/realsim/parts/Dashboard.tsx`.
- Requisitos:
  - Mostrar display, botao de partida e chave de seguranca.
  - Responder ao estado de ignicao e alertas.

## Sistema Eletrico

### Bateria, BMS e controlador

- Codigo: `src/components/realsim/parts/ElectricalSystem.tsx`.
- Requisitos:
  - Manter bateria, BMS, controlador e chicotes.
  - Preservar conexoes visuais para o motor.
  - Revisar futuramente o roteamento para alinhar com o Wankel, caso a arquitetura passe a ser hibrida/combustao.
