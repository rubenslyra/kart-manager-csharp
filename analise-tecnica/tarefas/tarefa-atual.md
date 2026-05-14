# Tarefa Atual

Status: finalizada
Aberta em: 2026-05-14

## Titulo

Adicionar som do motor em teste e painel externo de controle da bancada

## Objetivo

Permitir que o usuario teste a bancada do motor Wankel com feedback sonoro e controle visual externo para aceleracao, saude e funcionamento do motor.

## Escopo

- Avaliar a infraestrutura atual de audio do simulador.
- Avaliar a sala acustica, `EngineTestRig` e UI do simulador real.
- Planejar controles de aceleracao, saude e funcionamento do motor sem confundir com os modulos do kart.
- Definir onde o painel externo deve viver: overlay HTML, painel 3D na bancada, ou ambos.
- Definir criterios de aceite antes de implementar.

## Subtarefas

- Concluido: executar Research.
- Concluido: executar Plan.
- Concluido: implementar audio e painel aprovados no RPI.

## RPI

### Research

- O simulador de corrida possui `src/components/simulator/useSimAudio.ts`, que usa Web Audio sintetizado sem assets externos.
- O audio existente e especifico do simulador de pista:
  - motor por oscilador `sawtooth`;
  - filtro low-pass;
  - volume/pitch seguindo velocidade;
  - efeitos de torcida, pneus e tons de checkpoint.
- Navegadores exigem gesto do usuario para iniciar Web Audio; portanto o som do motor em teste precisa de botao explicito de start/stop.
- O simulador real (`src/components/realsim/RealSimulator.tsx`) ainda nao tem engine de audio propria.
- A bancada de teste vive em `EngineTestRig`, dentro de `src/components/realsim/parts/MotorAssembly.tsx`.
- A sala acustica vive em `AcousticEngineRoom`, dentro de `src/components/realsim/Workshop.tsx`, e ja mostra leitura decorativa `86 dB · 7.4k RPM`.
- A UI do simulador real (`RealSimUI.tsx`) ja tem:
  - barra de focos;
  - painel de telemetria do kart;
  - checklist;
  - controles mock.
- O painel pedido deve representar o teste do motor na bancada, nao o estado real dos modulos do kart.
- Melhor separacao tecnica:
  - estado local de teste da bancada no simulador real;
  - hook de audio proprio para a bancada Wankel;
  - painel HTML externo para controle do usuario;
  - opcionalmente refletir estado no painel/tela 3D da sala.

### Plan

Implementar um sistema local de teste da bancada Wankel.

Escopo dentro:

1. Criar um estado local `engineTest` em `RealSimulator.tsx`:
   - `running`;
   - `throttle`;
   - `rpm`;
   - `health`;
   - `temperature`;
   - `load`;
   - `audioEnabled`.
2. Criar hook de audio para o simulador real, por exemplo `src/components/realsim/hooks/useWankelTestAudio.ts`:
   - Web Audio sintetizado;
   - start/stop por gesto do usuario;
   - som rotativo mais agudo/rasgado que o motor de pista;
   - pitch/volume/filtro seguindo throttle/rpm/health;
   - desligamento seguro no unmount.
3. Adicionar painel externo na UI, preferencialmente em `RealSimUI.tsx`:
   - titulo `Teste Motor Wankel`;
   - botao ligar/desligar bancada;
   - botao audio on/off;
   - slider de aceleracao;
   - leitura de RPM;
   - leitura de saude;
   - leitura de temperatura;
   - leitura de carga/dinamometro.
4. Refletir estado visual na cena:
   - passar `engineTest` para `Workshop`;
   - passar para `AcousticEngineRoom` e/ou `EngineTestRig`;
   - atualizar leitura interna da sala com RPM/dB/health reais do estado local;
   - intensificar luz/status do exaustor ou bancada quando o motor estiver rodando.
5. Documentar:
   - `inventario-cena-interfaces.md` com painel externo de teste;
   - `catalogo-partes.md` se novos requisitos de bancada forem definidos;
   - `historico-etapas.md` com a etapa.

Escopo fora:

- Nao ligar o teste da bancada aos modulos C# ainda.
- Nao alterar contrato `KartTelemetry`.
- Nao alterar o motor instalado no kart.
- Nao usar arquivos de audio externos.

Criterios de aceite:

- Usuario consegue ligar/desligar o teste da bancada.
- Usuario consegue ativar/desativar audio por gesto.
- Slider de aceleracao altera RPM, som e leituras.
- Painel mostra saude e funcionamento do motor de forma clara.
- Cena da sala reflete estado do teste.
- `npm run build` passa.

### Status RPI

Concluido. Implement liberado por `[Concluir RPI]`.

## Arquivos Impactados

- `src/components/realsim/RealSimulator.tsx`
- `src/components/realsim/RealSimUI.tsx`
- `src/components/realsim/Workshop.tsx`
- `src/components/realsim/parts/MotorAssembly.tsx`
- `src/components/realsim/engineTest.ts`
- `src/components/realsim/hooks/useWankelTestAudio.ts`
- `analise-tecnica/documentacao-partes/inventario-cena-interfaces.md`
- `analise-tecnica/documentacao-partes/historico-etapas.md`
- `analise-tecnica/tarefas/tarefa-atual.md`

## Checks Planejados

- Revisao de diff.
- `npm run build` apos implementacao.
- Validacao manual em `/simulador-real`.
- Validacao do fluxo de audio conforme restricoes do navegador.

## Checks Executados

- `git status --short --branch`: branch `main` limpa antes da abertura.
- Research de `useSimAudio.ts`, `RealSimulator.tsx`, `RealSimUI.tsx`, `Workshop.tsx`, `MotorAssembly.tsx`, inventario de interfaces, catalogo de partes e usos de audio no projeto.
- `npm run build`: passou. Avisos conhecidos de `@import` CSS e chunks grandes permanecem.
- Revisao de diff final: concluida, escopo restrito ao teste da bancada Wankel e documentacao da tarefa.

## Fechamento

- Finalizada em: 2026-05-14
- Commit: gerado no fechamento da tarefa.

## Notas Para Release

- **Adicionado:** painel externo `Teste Motor Wankel` com ligar/parar, audio, aceleracao, RPM, saude, temperatura e carga.
- **Adicionado:** som sintetizado do motor em teste usando Web Audio.
- **Alterado:** sala acustica reflete o funcionamento da bancada em luzes, leitura interna e detalhes do dinamometro.
- **Tecnico:** teste da bancada fica separado de `KartTelemetry` e dos modulos C#.
