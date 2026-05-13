# Modelos GLB do Simulador Real

Estrutura preparada para substituir os assets procedurais por GLBs autorais
sem alterar a arquitetura funcional.

## Convenção de nomes

```
public/models/
├── kart/
│   ├── kart_full.glb         # Modelo completo (preferencial)
│   ├── kart_chassis.glb
│   ├── kart_wheels.glb
│   ├── kart_dashboard.glb
│   ├── kart_battery.glb
│   ├── kart_motor.glb
│   └── kart_brakes.glb
└── workshop/
    ├── hydraulic_lift.glb
    ├── telemetry_station.glb
    ├── tool_rack.glb
    ├── industrial_lights.glb
    └── holographic_panels.glb
```

Quando os arquivos existirem, podemos extender `RealKart` / `Workshop` para
preferir os GLBs (via `useGLTF` em Suspense) com fallback procedural.
