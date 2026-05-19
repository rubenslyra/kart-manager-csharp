# Guia Dos Alunos — DLLs C# Do RL Kart 26A

Versao: 1.0  
Plataforma alvo: .NET 8 / `netstandard2.1` ou superior  
Entrega: `Class Library` compilada em `Release`, `AnyCPU`, arquivo `.dll`

Este documento descreve o que cada equipe deve desenvolver para que suas DLLs
sejam aceitas pela Oficina do RL Kart 26A.

## Estado Do Projeto Para Receber DLLs

O projeto esta pronto para:

- receber upload de DLLs pelo painel `DLLs C# · Importar & Testar`;
- validar o arquivo no navegador por cabecalho PE e metadados .NET;
- validar nome do arquivo, nome do assembly, `ModuleId`, versao SemVer e
  funcoes esperadas;
- bloquear teste quando o contrato falhar;
- executar um cenario isolado simulado para cada modulo aprovado;
- exportar telemetria do teste em JSON e CSV.

Limite atual: a DLL ainda nao e executada dentro de um runtime .NET real neste
frontend. A validacao e estatica e o teste e simulado pelo `mockBridge`. Para
execucao real da DLL sera necessario um host .NET externo conectado via
WebSocket ao contrato de telemetria do projeto.

## Padrao Obrigatorio De Projeto

Cada modulo deve ser um projeto separado:

```text
RLKart.Module.Core/
RLKart.Module.Gearbox/
RLKart.Module.Brakes/
RLKart.Module.Ignition/
RLKart.Module.Battery/
RLKart.Module.Steering/
```

Padrao recomendado do `.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netstandard2.1</TargetFramework>
    <AssemblyName>RLKart.Module.Core</AssemblyName>
    <RootNamespace>RLKart.Module.Core</RootNamespace>
    <Version>1.0.0</Version>
    <AssemblyVersion>1.0.0.0</AssemblyVersion>
    <FileVersion>1.0.0.0</FileVersion>
    <InformationalVersion>1.0.0</InformationalVersion>
    <Nullable>enable</Nullable>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>
</Project>
```

Troque `Core` pelo nome do modulo. O arquivo final precisa se chamar exatamente
como indicado na tabela de cada modulo.

## Contrato Base Obrigatorio

Toda DLL deve expor uma classe publica com construtor sem parametros,
identificador do modulo e versao SemVer.

```csharp
[AttributeUsage(AttributeTargets.Class)]
public sealed class KartModuleAttribute : Attribute
{
    public KartModuleAttribute(string id) => Id = id;
    public string Id { get; }
}

public interface IKartModule
{
    string ModuleId { get; }
    string Version { get; }
    bool Initialize();
    void Shutdown();
    string GetTelemetryJson();
    bool HandleCommand(string json);
}
```

Exemplo minimo:

```csharp
namespace RLKart.Module.Core;

[KartModule("core")]
public sealed class CoreModule : IKartModule
{
    public string ModuleId => "core";
    public string Version => "1.0.0";

    public bool Initialize() => true;
    public void Shutdown() { }
    public string GetTelemetryJson() => "{\"loaded\":true,\"status\":\"ok\"}";
    public bool HandleCommand(string json) => true;

    public bool BootCore(string configJson) => true;
    public int Heartbeat() => Environment.TickCount;
    public bool RegisterModule(string moduleId, string versionSemver) => true;
    public string GetSystemState() => "{\"state\":\"CORE_READY\"}";
    public void EmergencyStop(string reason) { }
}
```

## Condicoes Que Bloqueiam A DLL

A Oficina rejeita a DLL se qualquer uma destas condicoes falhar:

- arquivo nao e PE valido (`MZ`/PE);
- arquivo nao e assembly .NET com metadados CLI (`BSJB`);
- nome do arquivo nao bate com o slot selecionado;
- nome do assembly nao bate com `RLKart.Module.<Modulo>`;
- literal do `ModuleId` nao aparece nos metadados;
- versao SemVer `X.Y.Z` nao aparece nos metadados;
- qualquer funcao obrigatoria do modulo esta ausente.

## Modulos E Funcoes Obrigatorias

### CORE

Arquivo: `RLKart.Module.Core.dll`  
Assembly: `RLKart.Module.Core`  
ModuleId: `core`

Funcoes:

- `bool BootCore(string configJson)`
- `int Heartbeat()`
- `bool RegisterModule(string moduleId, string versionSemver)`
- `string GetSystemState()`
- `void EmergencyStop(string reason)`

Condicoes:

- `BootCore` deve inicializar barramento e estado interno.
- `Heartbeat` deve retornar valor crescente ou tick consistente.
- `RegisterModule` deve validar `moduleId` e SemVer.
- `EmergencyStop` deve colocar o sistema em estado seguro.

### GEARBOX

Arquivo: `RLKart.Module.Gearbox.dll`  
Assembly: `RLKart.Module.Gearbox`  
ModuleId: `gearbox`

Funcoes:

- `bool SetGear(char gear)`
- `char GetCurrentGear()`
- `bool IsShiftAllowed(char from, char to, double speedKmh)`
- `string GetGearTelemetry()`

Condicoes:

- Marchas permitidas: `P`, `R`, `N`, `D`, `B`.
- `P -> D` deve ser bloqueado com velocidade acima de zero.
- `R <-> D` deve ser bloqueado acima de `3 km/h`.
- `GetGearTelemetry` deve retornar JSON valido.

### BRAKES

Arquivo: `RLKart.Module.Brakes.dll`  
Assembly: `RLKart.Module.Brakes`  
ModuleId: `brakes`

Funcoes:

- `void ApplyBrake(double pedalPressure01)`
- `double GetDiscTemperatureC()`
- `void SetRegenLevel(double level01)`
- `string GetBrakeTelemetry()`

Condicoes:

- `pedalPressure01` deve ser limitado entre `0.0` e `1.0`.
- `level01` deve ser limitado entre `0.0` e `1.0`.
- Temperatura acima de `480 C` deve gerar status critico no JSON.
- Nao aceitar valores `NaN`, infinito ou negativos.

### IGNITION

Arquivo: `RLKart.Module.Ignition.dll`  
Assembly: `RLKart.Module.Ignition`  
ModuleId: `ignition`

Funcoes:

- `bool InsertSafetyKey(string keyId)`
- `bool PressStart()`
- `void PressStop()`
- `string GetIgnitionState()`

Condicoes:

- `PressStart` so deve retornar `true` com chave valida.
- `PressStop` deve desligar de forma idempotente.
- `GetIgnitionState` deve indicar se a ignicao esta habilitada.

### BATTERY

Arquivo: `RLKart.Module.Battery.dll`  
Assembly: `RLKart.Module.Battery`  
ModuleId: `battery`

Funcoes:

- `double GetLevelPct()`
- `double GetVoltageV()`
- `double GetTemperatureC()`
- `string GetBatteryStatus()`

Condicoes:

- Nivel deve ficar entre `0` e `100`.
- Tensao deve ser positiva e plausivel para o projeto.
- Temperatura alta deve retornar `warning` ou `critical`.
- Abaixo de `15%` deve impedir liberacao segura do pit.

### STEERING

Arquivo: `RLKart.Module.Steering.dll`  
Assembly: `RLKart.Module.Steering`  
ModuleId: `steering`

Funcoes:

- `void SetSteeringAngleDeg(double angle)`
- `double GetSteeringAngleDeg()`

Condicoes:

- Angulo deve ser limitado a `[-35, +35]` graus.
- Entrada invalida deve ser normalizada ou rejeitada sem quebrar o modulo.
- O valor retornado deve refletir o ultimo comando aceito.

## Checklist Para Liberar O Kart

Para a Oficina marcar o kart como pronto para sair do pit, o estado de
telemetria precisa satisfazer:

- `core.loaded = true`
- `gearbox.loaded = true`
- `brakes.loaded = true`
- `ignition.loaded = true`
- bateria acima de `15%`
- nenhum modulo em `critical`
- freios respondendo
- ignicao e cambio em estado coerente

## Boas Praticas Obrigatorias

- Validar todas as entradas publicas.
- Nunca deixar excecao escapar de metodo publico chamado pelo simulador.
- Usar retornos `false` ou JSON com `status = "warning"`/`"critical"` para
  falhas controladas.
- Manter estado interno encapsulado.
- Evitar variaveis globais compartilhadas entre modulos.
- Usar nomes claros e namespaces `RLKart.Module.<Modulo>`.
- Usar SemVer de verdade: `1.0.0`, `1.1.0`, `2.0.0`.
- Garantir que `Shutdown` possa ser chamado mais de uma vez sem erro.
- Garantir que `Initialize` possa falhar com retorno `false` sem travar.
- Retornar JSON simples, sem ciclos, sem objetos gigantes.
- Cobrir regras principais com testes unitarios.

## Padroes De Projeto Recomendados

- **Strategy:** regras de frenagem, troca de marcha ou controle podem variar
  sem alterar a classe principal.
- **State:** estados como `Off`, `Ready`, `Running`, `Fault` ficam explicitos.
- **Command:** comandos JSON podem ser convertidos para objetos de comando.
- **Adapter:** isola o contrato do simulador da logica interna do aluno.
- **Guard Clauses:** entradas invalidas sao rejeitadas cedo.

Evite:

- God class com todas as regras misturadas.
- Metodo publico que altera estado sem validação.
- Nomes genericos como `Class1`, `Manager`, `Helper` sem contexto.
- JSON montado por concatenacao insegura quando houver biblioteca disponivel.
- Dependencias externas desnecessarias para uma DLL de aula.

## Roteiro De Teste Antes Da Entrega

1. Compilar em `Release`.
2. Confirmar nome do arquivo final.
3. Conferir `AssemblyName`.
4. Conferir `ModuleId`.
5. Conferir `Version`.
6. Rodar testes unitarios.
7. Abrir `/simulador-real`.
8. Selecionar o slot correto no painel `DLLs C#`.
9. Fazer upload da DLL.
10. Corrigir qualquer falha indicada no painel.
11. Clicar em `Testar modulo`.
12. Exportar JSON/CSV se precisar entregar evidencias.

## Nomes Exatos Esperados

| Slot | Arquivo | Assembly | ModuleId |
|---|---|---|---|
| core | `RLKart.Module.Core.dll` | `RLKart.Module.Core` | `core` |
| gearbox | `RLKart.Module.Gearbox.dll` | `RLKart.Module.Gearbox` | `gearbox` |
| brakes | `RLKart.Module.Brakes.dll` | `RLKart.Module.Brakes` | `brakes` |
| ignition | `RLKart.Module.Ignition.dll` | `RLKart.Module.Ignition` | `ignition` |
| battery | `RLKart.Module.Battery.dll` | `RLKart.Module.Battery` | `battery` |
| steering | `RLKart.Module.Steering.dll` | `RLKart.Module.Steering` | `steering` |

