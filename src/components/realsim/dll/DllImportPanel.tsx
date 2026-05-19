import { useEffect, useMemo, useRef, useState } from "react";
import { mockBridge, type ModuleTestSnapshot } from "@/bridge/mockExternalData";
import {
  inspectDll,
  MODULE_CONTRACT,
  type InspectionResult,
  type ModuleId,
} from "@/lib/csharp/dllInspector";

const MODULES: ModuleId[] = ["core", "gearbox", "brakes", "ignition", "battery", "steering"];

type ModuleResult = InspectionResult | { error: string } | "pending" | undefined;
type State = Record<string, ModuleResult>;
type RunMode = "single" | "repeat";

export function DllImportPanel() {
  const [results, setResults] = useState<State>({});
  const [open, setOpen] = useState(false);
  const [activeTest, setActiveTest] = useState<ModuleId | null>(null);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<RunMode>("single");
  const [runs, setRuns] = useState(3);
  const [log, setLog] = useState<string[]>([]);
  const [stream, setStream] = useState<ModuleTestSnapshot[]>([]);
  const [archive, setArchive] = useState<ModuleTestSnapshot[]>([]); // last completed test
  const streamRef = useRef<HTMLPreElement>(null);

  const append = (line: string) =>
    setLog((l) => [`${new Date().toLocaleTimeString()}  ${line}`, ...l].slice(0, 80));

  useEffect(() => {
    return mockBridge.subscribeTest((s) => {
      setStream((prev) => [...prev, s]);
    });
  }, []);

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = 0;
  }, [stream]);

  const onPick = async (mod: ModuleId, file: File) => {
    setResults((r) => ({ ...r, [mod]: "pending" }));
    try {
      const res = await inspectDll(file, mod);
      setResults((r) => ({ ...r, [mod]: res }));
      append(
        `[${mod.toUpperCase()}] ${res.fileName}  ${(res.sizeBytes / 1024).toFixed(1)} KB · ` +
          `PE=${res.isPe ? "ok" : "FAIL"} · .NET=${res.isDotNet ? "ok" : "FAIL"} · ` +
          `name=${res.assemblyNameOk ? "ok" : "FAIL"} · id=${res.moduleIdOk ? "ok" : "FAIL"} · ` +
          `ver=${res.declaredVersion ?? "—"} · exports ${res.found.length}/${res.expected.length}`,
      );
      for (const f of res.failures) {
        append(
          `[${mod.toUpperCase()}] ✕ ${f.field}: esperado=${f.expected} · atual=${f.actual}${f.detail ? ` (${f.detail})` : ""}`,
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setResults((r) => ({ ...r, [mod]: { error: msg } }));
      append(`[${mod.toUpperCase()}] ERRO ao inspecionar: ${msg}`);
    }
  };

  const isolatedTest = async (mod: ModuleId) => {
    const r = results[mod];
    if (!r || r === "pending" || "error" in r) {
      append(`[${mod.toUpperCase()}] ✕ teste BLOQUEADO — sem inspeção válida`);
      return;
    }
    if (!r.contractOk) {
      append(`[${mod.toUpperCase()}] ✕ teste BLOQUEADO — contrato falhou:`);
      for (const f of r.failures) {
        append(`  → ${f.field}: esperado=${f.expected} · atual=${f.actual}`);
      }
      return;
    }
    setActiveTest(mod);
    setPaused(false);
    setStream([]);
    const totalRuns = mode === "repeat" ? runs : 1;
    append(
      `[${mod.toUpperCase()}] cenário isolado iniciado · v${r.declaredVersion} · runs=${totalRuns}`,
    );
    try {
      await mockBridge.runModuleScenario(mod, { runs: totalRuns });
      append(`[${mod.toUpperCase()}] ✓ cenário concluído`);
    } catch (e) {
      append(`[${mod.toUpperCase()}] ✕ cenário falhou: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveTest(null);
      setPaused(false);
      // Auto-archive the just-completed stream
      setStream((s) => {
        setArchive(s);
        return s;
      });
    }
  };

  const onPause = () => {
    mockBridge.pauseScenario();
    setPaused(true);
    append("⏸ teste pausado");
  };
  const onResume = () => {
    mockBridge.resumeScenario();
    setPaused(false);
    append("▶ teste retomado");
  };
  const onStop = () => {
    mockBridge.stopScenario();
    append("⏹ teste interrompido");
  };

  const exportData = useMemo(() => (stream.length ? stream : archive), [stream, archive]);

  const downloadJson = () => {
    if (!exportData.length) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    triggerDownload(blob, `module-test-${exportData[0].moduleId}-${Date.now()}.json`);
  };

  const downloadCsv = () => {
    if (!exportData.length) return;
    const headers = [
      "timestamp",
      "moduleId",
      "phase",
      "tick",
      "telemetryJson",
      "systemStateJson",
      "log",
    ];
    const rows = exportData.map((s) =>
      headers
        .map((h) => {
          const v = String((s as unknown as Record<string, unknown>)[h] ?? "");
          return `"${v.replace(/"/g, '""')}"`;
        })
        .join(","),
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    triggerDownload(blob, `module-test-${exportData[0].moduleId}-${Date.now()}.csv`);
  };

  const last = stream[stream.length - 1];

  return (
    <div className="pointer-events-auto absolute left-3 top-1/2 z-30 w-[26rem] -translate-y-1/2 corner-cut border border-accent/40 bg-background/85 font-mono text-[10px] backdrop-blur-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border-b border-border px-3 py-2 uppercase tracking-widest text-accent"
      >
        <span>DLLs C# · Importar &amp; Testar</span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="max-h-[78vh] space-y-2 overflow-auto p-3">
          <a
            href="/docs/CSHARP_MODULE_CONTRACT.md"
            target="_blank"
            rel="noreferrer"
            className="block text-[9px] uppercase tracking-widest text-primary underline"
          >
            Ver contrato (.md)
          </a>
          <a
            href="/docs/DLL_STUDENT_GUIDE.md"
            target="_blank"
            rel="noreferrer"
            className="block text-[9px] uppercase tracking-widest text-primary underline"
          >
            Guia dos alunos: funcoes, condicoes e boas praticas
          </a>

          {/* Run-mode controls */}
          <div className="border border-border p-2">
            <div className="mb-1 uppercase tracking-widest text-muted-foreground">
              Modo de execução
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode("single")}
                className={`flex-1 corner-cut px-2 py-1 ${mode === "single" ? "bg-accent/30 text-accent" : "border border-border text-muted-foreground"}`}
              >
                1 execução
              </button>
              <button
                onClick={() => setMode("repeat")}
                className={`flex-1 corner-cut px-2 py-1 ${mode === "repeat" ? "bg-accent/30 text-accent" : "border border-border text-muted-foreground"}`}
              >
                Repetir N
              </button>
              <input
                type="number"
                min={1}
                max={50}
                value={runs}
                disabled={mode !== "repeat"}
                onChange={(e) => setRuns(Math.max(1, Math.min(50, +e.target.value || 1)))}
                className="w-14 border border-border bg-background px-1 py-1 text-foreground disabled:opacity-40"
              />
            </div>
            {activeTest && (
              <div className="mt-2 flex items-center gap-2">
                {!paused ? (
                  <button
                    onClick={onPause}
                    className="flex-1 corner-cut bg-warning/20 px-2 py-1 uppercase tracking-widest text-warning"
                  >
                    ⏸ Pausar
                  </button>
                ) : (
                  <button
                    onClick={onResume}
                    className="flex-1 corner-cut bg-success/20 px-2 py-1 uppercase tracking-widest text-success"
                  >
                    ▶ Retomar
                  </button>
                )}
                <button
                  onClick={onStop}
                  className="flex-1 corner-cut bg-destructive/20 px-2 py-1 uppercase tracking-widest text-destructive"
                >
                  ⏹ Parar
                </button>
              </div>
            )}
          </div>

          {MODULES.map((mod) => {
            const r = results[mod];
            const ok = r && r !== "pending" && !("error" in r) && r.contractOk;
            const expected = MODULE_CONTRACT[mod].exports;
            const fc = r && r !== "pending" && !("error" in r) ? r.found.length : 0;
            return (
              <div key={mod} className={`border p-2 ${ok ? "border-success/60" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-widest text-foreground">{mod}</span>
                  <span
                    className={
                      r === "pending"
                        ? "text-warning"
                        : ok
                          ? "text-success"
                          : r
                            ? "text-destructive"
                            : "text-muted-foreground"
                    }
                  >
                    {r === "pending" ? "..." : ok ? `✓ ${fc}/${expected.length}` : r ? "✕" : "—"}
                  </span>
                </div>
                <div className="mt-1 text-[9px] text-muted-foreground">
                  {MODULE_CONTRACT[mod].assembly}
                </div>
                <label className="mt-1 block cursor-pointer text-primary underline">
                  {r && r !== "pending" && !("error" in r) ? "Trocar .dll" : "Selecionar .dll"}
                  <input
                    type="file"
                    accept=".dll,application/octet-stream"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onPick(mod, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {r && r !== "pending" && !("error" in r) && (
                  <>
                    <div className="mt-1 grid grid-cols-[8rem_1fr] gap-x-2 text-[9px]">
                      <span className="text-muted-foreground">PE</span>
                      <span className={r.isPe ? "text-success" : "text-destructive"}>
                        {r.isPe ? "ok" : "fail"}
                      </span>
                      <span className="text-muted-foreground">.NET (BSJB)</span>
                      <span className={r.isDotNet ? "text-success" : "text-destructive"}>
                        {r.isDotNet ? "ok" : "fail"}
                      </span>
                      <span className="text-muted-foreground">FileName</span>
                      <span className={r.fileNameOk ? "text-success" : "text-destructive"}>
                        {r.fileNameOk ? r.fileName : `esperado: ${r.expectedFileName}`}
                      </span>
                      <span className="text-muted-foreground">AssemblyName</span>
                      <span className={r.assemblyNameOk ? "text-success" : "text-destructive"}>
                        {r.assemblyNameOk
                          ? `${r.assemblyName} · #Strings[${r.assemblyNameAt}]`
                          : `esperado: ${r.expectedAssemblyName} · atual: ${r.assemblyName ?? "—"}`}
                      </span>
                      <span className="text-muted-foreground">ModuleId</span>
                      <span className={r.moduleIdOk ? "text-success" : "text-destructive"}>
                        {r.moduleIdOk
                          ? `"${mod}" · #Strings[${r.moduleIdAt}]`
                          : `esperado: "${mod}" · atual: ${r.declaredModuleId ?? "ausente"}`}
                      </span>
                      <span className="text-muted-foreground">Version (SemVer)</span>
                      <span className={r.versionOk ? "text-success" : "text-destructive"}>
                        {r.versionOk
                          ? `${r.declaredVersion} · #Strings[${r.versionAt}]`
                          : `esperado: X.Y.Z · atual: ${r.declaredVersion ?? "ausente"}`}
                      </span>
                      <span className="text-muted-foreground">SHA-256</span>
                      <span className="truncate text-foreground">{r.sha256.slice(0, 16)}…</span>
                    </div>

                    {/* Detailed failures */}
                    {r.failures.length > 0 && (
                      <div className="mt-2 border border-destructive/40 bg-destructive/5 p-1">
                        <div className="text-[9px] uppercase tracking-widest text-destructive">
                          Falhas de contrato
                        </div>
                        <ul className="mt-1 space-y-0.5 text-[9px] text-destructive">
                          {r.failures.map((f, i) => (
                            <li key={i}>
                              <span className="font-bold">{f.field}</span> — esperado{" "}
                              <code className="text-foreground">{f.expected}</code>, atual{" "}
                              <code className="text-foreground">{f.actual}</code>
                              {f.detail && (
                                <span className="text-muted-foreground"> · {f.detail}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Exports map (found vs expected, with #Strings position) */}
                    <div className="mt-2 border border-border p-1">
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        Exports {r.found.length}/{expected.length}
                      </div>
                      <ul className="mt-1 grid grid-cols-1 gap-0.5 text-[9px]">
                        {expected.map((name) => {
                          const at = r.foundAt[name];
                          const present = at && at > 0;
                          return (
                            <li
                              key={name}
                              className={`flex items-center justify-between ${present ? "text-success" : "text-destructive font-bold"}`}
                            >
                              <span>
                                {present ? "✓" : "✕"} {name}
                              </span>
                              <span className="text-muted-foreground">
                                {present ? `#Strings[${at}]` : "AUSENTE"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <button
                      disabled={!r.contractOk || activeTest !== null}
                      onClick={() => isolatedTest(mod)}
                      className={`mt-2 w-full corner-cut px-2 py-1 uppercase tracking-widest ${
                        r.contractOk
                          ? "bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-40"
                          : "border border-border text-muted-foreground"
                      }`}
                    >
                      {activeTest === mod
                        ? paused
                          ? "Pausado"
                          : "Rodando…"
                        : !r.contractOk
                          ? "Bloqueado"
                          : "Testar módulo"}
                    </button>
                  </>
                )}
                {r && r !== "pending" && "error" in r && (
                  <div className="mt-1 text-[9px] text-destructive">{r.error}</div>
                )}
              </div>
            );
          })}

          {/* Live telemetry from isolated test */}
          <div className="mt-2 border border-accent/40 p-2">
            <div className="mb-1 flex items-center justify-between uppercase tracking-widest text-accent">
              <span>Telemetria do módulo testado</span>
              <span className="text-[9px] text-muted-foreground">
                {activeTest
                  ? paused
                    ? `⏸ ${activeTest}`
                    : `▶ ${activeTest}`
                  : last
                    ? `■ ${last.moduleId}`
                    : "—"}
              </span>
            </div>
            {last ? (
              <>
                <div className="grid grid-cols-3 gap-x-2 text-[9px] text-muted-foreground">
                  <span>phase</span>
                  <span className="col-span-2 text-foreground">{last.phase}</span>
                  <span>tick</span>
                  <span className="col-span-2 text-foreground">{last.tick}</span>
                  <span>ts</span>
                  <span className="col-span-2 text-foreground">
                    {last.timestamp.split("T")[1]?.replace("Z", "")}
                  </span>
                </div>
                <div className="mt-1 text-[9px] uppercase text-muted-foreground">
                  GetTelemetryJson()
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all text-[9px] text-success">
                  {last.telemetryJson}
                </pre>
                <div className="mt-1 text-[9px] uppercase text-muted-foreground">
                  GetSystemState()
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all text-[9px] text-primary">
                  {last.systemStateJson}
                </pre>
                <details className="mt-1">
                  <summary className="cursor-pointer text-[9px] uppercase tracking-widest text-muted-foreground">
                    Stream ({stream.length})
                  </summary>
                  <pre
                    ref={streamRef}
                    className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-[9px] text-muted-foreground"
                  >
                    {stream
                      .slice()
                      .reverse()
                      .map((s) => `t${s.tick} ${s.phase.padEnd(12)} ${s.log}`)
                      .join("\n")}
                  </pre>
                </details>
              </>
            ) : (
              <div className="text-[9px] text-muted-foreground">
                Selecione uma DLL válida e pressione "Testar módulo" para ver o stream em tempo
                real.
              </div>
            )}

            {/* Export controls */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={downloadJson}
                disabled={!exportData.length}
                className="flex-1 corner-cut border border-primary/40 px-2 py-1 uppercase tracking-widest text-primary disabled:opacity-40"
              >
                ↓ JSON ({exportData.length})
              </button>
              <button
                onClick={downloadCsv}
                disabled={!exportData.length}
                className="flex-1 corner-cut border border-primary/40 px-2 py-1 uppercase tracking-widest text-primary disabled:opacity-40"
              >
                ↓ CSV
              </button>
            </div>
          </div>

          <details className="mt-2 border border-border p-2">
            <summary className="cursor-pointer uppercase tracking-widest text-muted-foreground">
              Log de interpretação ({log.length})
            </summary>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap text-[9px] text-muted-foreground">
              {log.join("\n") || "—"}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
