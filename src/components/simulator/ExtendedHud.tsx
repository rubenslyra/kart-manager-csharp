export interface ExtendedPhysics {
  rpm: number;
  torque: number; // Nm (simulated)
  grip: number; // 0..1
  latG: number;
  longG: number;
  drift: boolean;
}

export function ExtendedHud({ p }: { p: ExtendedPhysics | null }) {
  if (!p) return null;
  const rpmPct = Math.min(p.rpm / 12000, 1);
  const gripColor = p.grip > 0.6 ? "var(--accent)" : p.grip > 0.3 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-40 -translate-x-1/2 corner-cut border border-primary/40 bg-background/75 px-4 py-2 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm">
      <div className="flex items-center gap-5">
        <div>
          <div className="text-muted-foreground">RPM</div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-base font-bold text-primary">{p.rpm.toFixed(0)}</span>
          </div>
          <div className="mt-0.5 h-1 w-24 overflow-hidden rounded-sm border border-border bg-card/40">
            <div className="h-full bg-primary" style={{ width: `${rpmPct * 100}%` }} />
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Torque</div>
          <div className="font-display text-base font-bold text-foreground">{p.torque.toFixed(0)} Nm</div>
        </div>
        <div>
          <div className="text-muted-foreground">Grip</div>
          <div className="font-display text-base font-bold" style={{ color: gripColor }}>
            {(p.grip * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">G-Lat</div>
          <div className="font-display text-base font-bold text-foreground">{p.latG.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">G-Long</div>
          <div className="font-display text-base font-bold text-foreground">{p.longG.toFixed(2)}</div>
        </div>
        {p.drift && (
          <div className="rounded-sm border border-warning bg-warning/10 px-2 py-1 text-warning">
            ▲ DRIFT
          </div>
        )}
      </div>
    </div>
  );
}
