import { useState } from "react";
import type { AuditEvent } from "./hooks/useAuditLog";

interface Props {
  events: AuditEvent[];
  onClear: () => void;
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(events: AuditEvent[]): string {
  const header = "iso,ts,module,field,before,after";
  const rows = events.map(
    (e) =>
      `${e.iso},${e.ts},${e.module},${e.field},${JSON.stringify(e.before)},${JSON.stringify(e.after)}`,
  );
  return [header, ...rows].join("\n");
}

export function AuditLog({ events, onClear }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`pointer-events-auto absolute right-3 z-30 corner-cut border border-primary/40 bg-background/85 font-mono text-[10px] backdrop-blur-sm transition-all ${
        open ? "top-[330px] w-72 p-3" : "top-[330px] w-40 p-2"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[9px] uppercase tracking-widest text-primary">
          Auditoria · {events.length}
        </div>
        <button
          className="text-muted-foreground hover:text-primary"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "—" : "+"}
        </button>
      </div>

      {open && (
        <>
          <div className="mb-2 grid grid-cols-3 gap-1">
            <button
              onClick={() => download(`audit-${Date.now()}.json`, JSON.stringify(events, null, 2), "application/json")}
              className="corner-cut border border-border px-1 py-1 uppercase tracking-widest text-muted-foreground hover:text-primary"
              disabled={events.length === 0}
            >
              JSON
            </button>
            <button
              onClick={() => download(`audit-${Date.now()}.csv`, toCSV(events), "text/csv")}
              className="corner-cut border border-border px-1 py-1 uppercase tracking-widest text-muted-foreground hover:text-primary"
              disabled={events.length === 0}
            >
              CSV
            </button>
            <button
              onClick={onClear}
              className="corner-cut border border-destructive/60 px-1 py-1 uppercase tracking-widest text-destructive hover:bg-destructive/10"
              disabled={events.length === 0}
            >
              Limpar
            </button>
          </div>
          <div className="max-h-56 overflow-auto border border-border bg-background/40 p-1">
            {events.length === 0 ? (
              <div className="py-3 text-center text-[9px] text-muted-foreground">
                Nenhum evento registrado.
              </div>
            ) : (
              events.map((e, i) => (
                <div key={i} className="border-b border-border/40 py-1 last:border-b-0">
                  <div className="text-[8px] text-muted-foreground">
                    {new Date(e.ts).toLocaleTimeString("pt-BR", { hour12: false })}.
                    {String(e.ts % 1000).padStart(3, "0")}
                  </div>
                  <div>
                    <span className="text-primary">{e.module}</span>
                    <span className="text-muted-foreground">.{e.field}: </span>
                    <span className="text-muted-foreground">{e.before}</span>
                    <span className="text-foreground"> → </span>
                    <span className="text-success">{e.after}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
