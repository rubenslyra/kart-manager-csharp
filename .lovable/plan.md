# Plano — Simulador Real: Direção de Arte + Auditoria Avançada

## Escopo

Evoluir **apenas** a camada visual e de auditoria do `/simulador-real`. Sem mexer em: WebSocket bridge, telemetria, validador de módulos, controles, checklist de liberação, store, rotas.

Trabalho dividido em **2 grandes blocos**:

- **Bloco A** — Direção de arte (kart cinematográfico + oficina laboratório)
- **Bloco B** — Auditoria avançada (labels, raio-X, cabos, painel de evidências)

---

## Bloco A — Direção de arte

### A1. Kart cinematográfico (refatorar `RealKart.tsx`)
Substituir primitivas soltas por **subcomponentes organizados**, todos reagindo à telemetria existente:

- `Chassis` — chassi tubular já existente, refinar com mais barras (proteção lateral, suporte traseiro do motor, reforços diagonais), material aço escovado grafite (`#3a4452`, metalness 0.9, roughness 0.35).
- `Wheels` — pneus slick (cilindros chanfrados via `latheGeometry`), aro metálico interno, eixo traseiro contínuo visível, suspensão tipo amortecedor (mola helicoidal via `torusGeometry` empilhado).
- `Seat` — banco bucket com encosto curvo (composição de `boxGeometry` com chanfros), preto fosco.
- `Steering` — coluna inclinada + volante esportivo D-shape (torus + barras), gira com `steering.angle`.
- `ElectricalSystem` — bateria LiFePO4 estilizada (caixa preta + terminais + aletas), controlador eletrônico, **chicotes** roteados via `CatmullRomCurve3` + `tubeGeometry` (vermelho/preto), LEDs técnicos pulsantes.
- `MotorAssembly` — motor elétrico cilíndrico no eixo traseiro com aletas de dissipação.
- `GearSelector` — placa central pedagógica com letras P/R/N/D/B emissivas (uma destacada conforme `gearbox.currentGear`).
- `BrakeSystem` — discos ventilados (cilindro com furos via `RingGeometry`), pinças vermelhas, emissive controlado por `discTemperature`.
- `Dashboard` — painel sobre o volante com LEDs/displays simbólicos (ignição, regen, alerta).

Manter a API atual: `<RealKart telemetry={} focus={} />` e o sistema de `dim`/`dimAny` por módulo.

### A2. Oficina cinematográfica (refatorar `Workshop.tsx`)
- Piso industrial **refletivo** com `MeshReflectorMaterial` (de drei) — atenuado para custar pouco.
- Elevador hidráulico com pistões, base em X, plataforma com slots.
- Racks de ferramentas laterais (silhuetas), monitores técnicos com texturas emissivas (canvas com mock de telemetria).
- **Painéis holográficos** flutuantes com bordas emissivas azul RL.
- Cabos industriais pendurados do teto (catmull → tube).
- **Volumetric fog leve** via `fog` denso já existente + sprites de poeira.
- Iluminação: spot principal cenográfico no kart, rim light azul, fill quente sutil, point lights pulsantes nos painéis.

### A3. Pós-processamento e câmera
- Adicionar `@react-three/postprocessing`: **Bloom** leve, **DepthOfField** sutil, **Vignette**.
- `CameraController` ganha **idle dolly** (oscilação sinusoidal pequena em X/Y quando `focus === null`).
- Manter zoom suave aos módulos já implementado.

### A4. Estrutura de assets (preparar para GLB futuros)
Criar `/public/models/kart/.gitkeep` e `/public/models/workshop/.gitkeep` com README explicando o naming esperado. O código continua usando primitivas; um helper `useKartModel()` tenta carregar `kart_full.glb` via `useGLTF` com `Suspense` + fallback para a versão procedural. Sem GLBs reais agora — só o ponto de extensão.

### A5. Performance
- `InstancedMesh` para parafusos repetidos, LEDs do painel, slots do elevador.
- `useMemo` em todos os materials (já feito parcialmente).
- DPR mantido `[1, 1.6]`.

---

## Bloco B — Auditoria avançada

### B1. Labels 3D flutuantes (`ModuleLabels.tsx`)
Usa `<Html>` ou `<Billboard><Text>` (drei) ancorados em cada módulo. Mostram **nome + estado**:
- "BATTERY · 78% · ok"
- "BRAKES · 45°C · ok"
- "VEHICLE: WAITING_FOR_MODULES" (label global flutuante acima do kart).
Visíveis quando `focus !== null` (ou toggle dedicado). Cor segue o `status` (ok=verde, warning=âmbar, critical=vermelho).

### B2. Modo Raio-X (`XRayOverlay.tsx` + toggle no UI)
- Botão "Raio-X" no `RealSimUI`.
- Quando ativo: aplica material wireframe semi-transparente translúcido a tudo exceto módulo focado.
- Desenha **linhas de cota** com `<Line>` (drei) do componente até labels com valores em tempo real (ex.: pressão do pedal, temperatura do disco, ângulo do volante).
- Highlight pulsante (emissive animado) na região ativa.

### B3. Cabos e chicotes reativos (`Wiring.tsx`)
- Curvas `CatmullRomCurve3` ligando **bateria → controlador → motor → freios → ignição**.
- Cor base por sinal: energia (vermelho), dados (azul), freio (laranja).
- Quando módulo está `loaded` e `ok`: cabo correspondente recebe **pulsing** (shader simples ou animação de `dashOffset` via `meshLine` ou material com `map` deslizando).
- Em modo focus: cabos do módulo destacam, demais ficam atenuados.
- Sempre renderizado (sutil); intensifica em focus/raio-X.

### B4. Painel de evidências de auditoria (`AuditLog.tsx`)
- Painel lateral direito (colapsável) na cena `/simulador-real`.
- Hook `useAuditLog(telemetry, focus)`:
  - escuta mudanças em `vehicleState`, `modules.*.status`, `modules.*.loaded`, e (quando há foco) deltas significativos do módulo focado (>5% delta numérico).
  - guarda até 200 eventos em memória (sem persistência — alinhado a "sem banco externo").
- Cada linha: `HH:MM:SS.mmm · MODULE · campo: antes → depois`.
- Botão **Exportar JSON** + **Exportar CSV** (reaproveitar utilitário do `perfStore` se compatível, senão `Blob` direto).
- Botão **Limpar**.

### B5. Integração com `RealSimUI`
Adicionar 3 toggles: `Labels`, `Raio-X`, `Cabos` (cabos default-on, sutis). Estados locais no `RealSimulator` e propagados.

---

## Detalhes técnicos

**Dependências novas:**
- `@react-three/postprocessing` (Bloom/DOF/Vignette).
- `three-stdlib` já vem com drei. Sem outras deps.

**Arquivos novos:**
```
src/components/realsim/
  parts/Chassis.tsx
  parts/Wheels.tsx
  parts/Seat.tsx
  parts/Steering.tsx
  parts/ElectricalSystem.tsx
  parts/MotorAssembly.tsx
  parts/GearSelector.tsx
  parts/BrakeSystem.tsx
  parts/Dashboard.tsx
  Wiring.tsx
  ModuleLabels.tsx
  XRayOverlay.tsx
  AuditLog.tsx
  Postfx.tsx
  hooks/useAuditLog.ts
  hooks/useKartModel.ts
public/models/kart/.gitkeep
public/models/workshop/.gitkeep
```

**Arquivos editados:**
- `RealKart.tsx` — passa a compor os subcomponentes em `parts/`. Mantém `FocusTarget` e props.
- `Workshop.tsx` — piso reflexivo, elevador, racks, painéis holo, cabos de teto, luzes.
- `RealSimulator.tsx` — adiciona `Postfx`, `Wiring`, `ModuleLabels`, `XRayOverlay`, `AuditLog`, e estados de toggle.
- `RealSimUI.tsx` — botões dos novos modos.
- `CameraController.tsx` — idle dolly quando sem foco.

**Não tocar:** `bridge/*`, `moduleValidator`, `useExternalData`, `mockExternalData`, `websocketClient`, `types.ts`, `routes/*`, simulador antigo (`src/components/simulator/*`).

---

## Ordem de execução

1. Instalar `@react-three/postprocessing`.
2. Criar `parts/*` extraindo a lógica atual e refinando geometria/materiais.
3. Adicionar `Postfx`, idle dolly na câmera.
4. Refinar `Workshop` (piso reflexivo, elevador, painéis holo, cabos teto).
5. Implementar `Wiring`, `ModuleLabels`, `XRayOverlay`.
6. Implementar `useAuditLog` + `AuditLog` com export CSV/JSON.
7. Wire-up de toggles no `RealSimUI` e `RealSimulator`.
8. Verificação visual no preview (`/simulador-real`) com mock alternando módulos para validar reações, labels, cabos pulsantes e log.

---

## Resultado esperado

Ao abrir `/simulador-real`: kart elétrico educacional semi-realista sobre elevador hidráulico em laboratório cinematográfico, com cabos pulsantes ligando módulos, labels 3D mostrando estado por componente, modo raio-X opcional com cotas de telemetria, e painel de evidências registrando cada mudança com timestamp e exportação CSV/JSON. Sistema funcional e arquitetura intactos.
