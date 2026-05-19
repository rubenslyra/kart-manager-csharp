# RL Kart 26A — Contrato de DLLs C# / .NET

> Documento oficial das funções **exportadas** que o sistema do kart espera
> encontrar em cada DLL produzida pelos alunos durante as aulas de C#/.NET.
> Cada módulo é uma DLL independente e deve ser testável isoladamente na oficina.

Versão: **1.0** · Plataforma: **.NET 8** · Target: `netstandard2.1` ou superior
Empacotamento: `*.dll` (Class Library, AnyCPU). Nome do assembly DEVE seguir
o padrão `RLKart.Module.<NomeDoModulo>.dll`.

---

## Convenções gerais

Todas as DLLs DEVEM expor uma classe pública implementando a interface base:

```csharp
public interface IKartModule
{
    string ModuleId { get; }            // ex.: "core", "gearbox" — DEVE casar com o slot
    string Version { get; }             // SemVer "x.y.z" — validado pelo loader
    bool   Initialize();                // chamada uma vez no boot
    void   Shutdown();                  // chamada no desligamento
    string GetTelemetryJson();          // snapshot JSON do estado do módulo
    bool   HandleCommand(string json);  // recebe comando do simulador
}
```

Cada classe concreta DEVE expor um construtor sem parâmetros e ser anotada com
`[KartModule("<id>")]`. O loader do sistema descobre os módulos via reflexão.

### Validação automática no upload

O painel **DLLs C#** parseia o cabeçalho PE + metadados CLI (BSJB) e valida:

| Critério | Falha bloqueia carregamento? |
|---|---|
| Cabeçalho PE válido | sim |
| Assembly .NET (BSJB) | sim |
| Nome do arquivo = `RLKart.Module.<Nome>.dll` | sim |
| `AssemblyName` = `RLKart.Module.<Nome>` | sim |
| `ModuleId` literal presente nos metadados | sim |
| `Version` no formato SemVer `x.y.z` | sim |
| Todos os métodos exportados presentes na heap `#Strings` | sim |

DLLs reprovadas em qualquer item ficam impedidas de rodar o cenário isolado.


---

## Módulo CORE — `RLKart.Module.Core.dll`

Responsável por inicializar os subsistemas, validar versões e publicar o
heartbeat. É o primeiro a ser carregado.

| Função exportada | Assinatura | Descrição |
|---|---|---|
| `BootCore` | `bool BootCore(string configJson)` | Boot do barramento principal |
| `Heartbeat` | `int  Heartbeat()` | Retorna ticks desde o boot |
| `RegisterModule` | `bool RegisterModule(string moduleId, string versionSemver)` | Registra DLL filha |
| `GetSystemState` | `string GetSystemState()` | JSON: `{state, uptimeMs, modules[]}` |
| `EmergencyStop` | `void EmergencyStop(string reason)` | Aborta toda a operação |

---

## Módulo GEARBOX — `RLKart.Module.Gearbox.dll`

Caixa de marchas eletrônica. Aceita marchas `P,R,N,D,B`.

| Função exportada | Assinatura |
|---|---|
| `SetGear` | `bool SetGear(char gear)` |
| `GetCurrentGear` | `char GetCurrentGear()` |
| `IsShiftAllowed` | `bool IsShiftAllowed(char from, char to, double speedKmh)` |
| `GetGearTelemetry` | `string GetGearTelemetry()` |

Regras: shift `P→D` proibido com `speed > 0`; `R↔D` proibido com `speed > 3 km/h`.

---

## Módulo BRAKES — `RLKart.Module.Brakes.dll`

Sistema de freio hidráulico + regen.

| Função exportada | Assinatura |
|---|---|
| `ApplyBrake` | `void ApplyBrake(double pedalPressure01)` |
| `GetDiscTemperatureC` | `double GetDiscTemperatureC()` |
| `SetRegenLevel` | `void SetRegenLevel(double level01)` |
| `GetBrakeTelemetry` | `string GetBrakeTelemetry()` |

`pedalPressure01` e `level01` são `[0.0, 1.0]`. Temperatura de disco
acima de 480 °C dispara `status = "critical"`.

---

## Módulo IGNITION — `RLKart.Module.Ignition.dll`

Partida + chave de segurança.

| Função exportada | Assinatura |
|---|---|
| `InsertSafetyKey` | `bool InsertSafetyKey(string keyId)` |
| `PressStart` | `bool PressStart()` |
| `PressStop` | `void PressStop()` |
| `GetIgnitionState` | `string GetIgnitionState()` |

---

## Módulo BATTERY — `RLKart.Module.Battery.dll` (opcional, default mock)

| Função exportada | Assinatura |
|---|---|
| `GetLevelPct` | `double GetLevelPct()` |
| `GetVoltageV` | `double GetVoltageV()` |
| `GetTemperatureC` | `double GetTemperatureC()` |
| `GetBatteryStatus` | `string GetBatteryStatus()` |

---

## Módulo STEERING — `RLKart.Module.Steering.dll` (opcional)

| Função exportada | Assinatura |
|---|---|
| `SetSteeringAngleDeg` | `void SetSteeringAngleDeg(double angle)` |
| `GetSteeringAngleDeg` | `double GetSteeringAngleDeg()` |

Ângulo válido: `[-35, +35]` graus.

---

## Empacotamento e entrega

1. Compile a DLL em `Release` modo `AnyCPU`.
2. Nomeie exatamente `RLKart.Module.<Nome>.dll`.
3. Faça upload na oficina pelo painel **DLLs C#** dentro do Simulador Real.
4. Cada DLL é validada isoladamente (header PE, assinaturas esperadas, hash SHA-256).
5. Use o botão **Testar módulo** para rodar o cenário de validação isolado
   (somente o módulo carregado responde; os demais ficam em "missing" durante
   o teste para isolar falhas).

> Falhas de assinatura ou exports faltantes bloqueiam o carregamento e são
> registradas no log de auditoria com timestamp.
