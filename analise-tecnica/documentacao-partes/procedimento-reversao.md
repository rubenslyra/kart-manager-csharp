# Procedimento De Reversao

Este projeto ainda esta em fase de iteracao visual. Use este guia para desfazer uma proposta especifica sem afetar outras partes aprovadas.

## Reverter estribos laterais

Arquivo: `src/components/realsim/RealKart.tsx`

1. Localize `TASK-SIDESTEPS-ONLY`.
2. Remova as chamadas:

```tsx
<SideStep side={1} dim={dimAny} />
<SideStep side={-1} dim={dimAny} />
```

3. Remova o componente `SideStep`, se nao houver uso futuro.
4. Recrie side pods apenas se a direcao visual pedir.

## Reverter calotas das rodas

Arquivo: `src/components/realsim/parts/Wheels.tsx`

1. Localize o comentario `Polished aluminum hub caps`.
2. Remova o bloco `[-1, 1].map((side) => (... polished-cap ...))`.
3. Mantenha `WheelAssembly`, larguras dianteira/traseira e pivots.

## Reverter motor Wankel

Arquivo: `src/components/realsim/parts/MotorAssembly.tsx`

1. Substitua `WankelEngine` por outro motor procedural que mantenha:
   - `MotorAssembly({ dim })`
   - `EngineTestRig({ position })`
   - pivot local na base inferior central.
2. Atualize a placa da sala acustica em `Workshop.tsx`.

## Reverter sala acustica

Arquivo: `src/components/realsim/Workshop.tsx`

1. Remova a chamada:

```tsx
<AcousticEngineRoom position={[7.2, 0, 3.9]} />
```

2. Remova o componente `AcousticEngineRoom`.
3. Remova o import de `EngineTestRig` se ele nao for usado em outro lugar.

## Validacao apos reversao

Sempre executar:

```bash
npm run build
```

O build atualmente pode manter avisos conhecidos de `@import` CSS e chunks grandes. Esses avisos nao bloqueiam a reversao visual.

