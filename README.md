# RL Kart 26A

### Plataforma Educacional de Engenharia, Simulação e Desenvolvimento Modular em C#

<img src="https://github.com/user-attachments/assets/022d2efb-cbe0-468a-9867-f0a1a86e34ef" width="100%" alt="RL Kart 26A Banner"/>

<br/>

![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)
![CSharp](https://img.shields.io/badge/C%23-.NET_8-512BD4?style=for-the-badge&logo=dotnet)
![WebSocket](https://img.shields.io/badge/WebSocket-RealTime-00C853?style=for-the-badge)
![Blender](https://img.shields.io/badge/Blender-3D-E87D0D?style=for-the-badge&logo=blender)
![Panda3D](https://img.shields.io/badge/Panda3D-Simulation-0099FF?style=for-the-badge)
![Lovable](https://img.shields.io/badge/Lovable-AI_UI-00B0FF?style=for-the-badge)

<br/>

### "O informático modela. O software dá vida. A vida real executa."

</div>

---

# 📘 Sobre o Projeto

O **RL Kart 26A** é uma plataforma educacional modular criada para ensinar:

- lógica de programação;
- arquitetura de software;
- engenharia de sistemas;
- comunicação entre aplicações;
- integração C# + WebSocket + Simulação 3D;
- modelagem orientada a estados;
- telemetria;
- validação de componentes;
- desenvolvimento de software aplicado ao mundo real.

O projeto utiliza:

- C# (.NET)
- Three.js
- React
- TypeScript
- Blender
- WebSockets
- Simulação 3D em tempo real

---

# 🎯 Objetivo Educacional

Cada aula desenvolve uma funcionalidade real do kart.

O aluno:
1. cria um módulo em C#;
2. compila uma DLL;
3. envia dados ao simulador;
4. vê o kart responder visualmente em tempo real.

---

# 🧠 Conceito Central

O projeto funciona como um:

# Digital Twin (Gêmeo Digital)

Onde:

| Camada | Responsabilidade |
|---|---|
| Three.js | Visualização 3D |
| C# DLLs | Lógica |
| WebSocket | Comunicação |
| Blender | Assets |
| React/Lovable | Interface |
| Telemetria | Diagnóstico |

---

# 🏗️ Arquitetura

```text
Aluno cria DLL em C#
        ↓
Console Host (.NET)
        ↓
WebSocket
        ↓
Bridge JSON
        ↓
Three.js / React
        ↓
Kart reage em tempo real
````

---

# ⚙️ Estrutura do Projeto

```text
RLKart26A/
│
├── apps/
│   ├── lovable-ui/
│   ├── simulator-threejs/
│   └── csharp-runtime/
│
├── assets/
│   ├── kart/
│   ├── workshop/
│   ├── track/
│   ├── sounds/
│   └── ui/
│
├── docs/
│
├── runtime/
│   └── modules/
│
└── websocket/
```

---

# 🚗 Estados do Kart

```text
OFF
WAITING_FOR_MODULES
CORE_READY
GEARBOX_READY
BRAKES_READY
IGNITION_READY
READY_TO_DRIVE
DRIVING
WARNING
CRITICAL_FAILURE
SHUTDOWN
```

---

# 🔌 Comunicação C# ↔ Simulador

O sistema utiliza:

* WebSocket
* JSON
* DLLs carregadas dinamicamente

---

# 📡 Exemplo de JSON

```json
{
  "vehicleState": "READY_TO_DRIVE",
  "modules": {
    "gearbox": {
      "currentGear": "D"
    },
    "battery": {
      "level": 78
    },
    "steering": {
      "angle": 12
    }
  }
}
```

---

# 🛠️ Tecnologias

## Frontend

* React
* TypeScript
* Tailwind
* React Three Fiber
* Drei

## Backend

* .NET 8
* C#
* WebSocket

## 3D

* Blender
* GLTF / GLB
* PBR Materials

---

# 🎓 Módulos Educacionais

| Aula   | Sistema               |
| ------ | --------------------- |
| Aula 1 | Core System           |
| Aula 2 | Gearbox               |
| Aula 3 | Brakes                |
| Aula 4 | Health Monitor        |
| Aula 5 | Ignition              |
| Aula 6 | Telemetria            |
| Aula 7 | Comunicação WebSocket |

---

# 🧩 Features

* Simulador Real
* Oficina Técnica
* Telemetria
* Dashboard
* Mock DLLs
* Integração real com C#
* Checklist de saída
* Visualização modular
* Wireframe inspection
* Camera focus por módulo
* Sistema de estados
* Split-screen
* Sistema de auditoria JSON
* HUD técnica

---

# 🎨 Direção de Arte

Tema visual:

* industrial futurista;
* engenharia;
* RL Labs;
* blueprint técnico;
* neon azul;
* metal grafite;
* laboratório cinematográfico.

---

# 📦 Assets

Formato principal:

```text
.glb
```

---

# 🚀 Roadmap

## Fase 1

* oficina técnica;
* mock DLLs;
* telemetria.

## Fase 2

* integração real C#;
* websocket bridge.

## Fase 3

* corrida técnica;
* módulos dinâmicos.

## Fase 4

* protótipo físico.

---

# ▶️ Executando o Projeto

## Frontend

```bash
npm install
npm run dev
```

---

## Backend C#

```bash
dotnet restore
dotnet run
```

---

# 🔥 Executando WebSocket

```bash
dotnet run --project websocket-server
```

---

# 📸 Simulador

## Dashboard

* telemetria;
* módulos;
* checklist;
* auditoria.

## Oficina

* inspeção técnica;
* integração DLL;
* validação de componentes.

---

# 📱 Redes

## Rubinho Lyra Labs

* YouTube:
  [https://www.youtube.com/@rubinholyralabs](https://www.youtube.com/@rubinholyralabs)

* Instagram:
  [https://www.instagram.com/rubinholyralabs/](https://www.instagram.com/rubinholyralabs/)

* LinkedIn:
  [https://www.linkedin.com/in/rubenslyra/](https://www.linkedin.com/in/rubenslyra/)

* TikTok:
  [https://www.tiktok.com/@rubinholyra](https://www.tiktok.com/@rubinholyra)

---

# 👨‍💻 Autor

Rubens Lyra
Rubinho Lyra Labs

---

# 📄 Licença

Projeto educacional experimental.

