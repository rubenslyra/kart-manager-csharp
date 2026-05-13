import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
        <Logo />
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          O projeto que começou no software · e vai construir o futuro.
        </p>
        <div className="flex gap-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>v0.1 · Fase 1</span>
          <span className="text-accent">● BUILD OK</span>
        </div>
      </div>
    </footer>
  );
}
