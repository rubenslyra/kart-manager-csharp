import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const links = [
  { href: "#projeto", label: "Projeto" },
  { href: "#aulas", label: "Aulas" },
  { href: "#estados", label: "Estados" },
  { href: "#stack", label: "Stack" },
  { href: "#sprints", label: "Sprints" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/simulator"
            className="corner-cut border border-border bg-card/60 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground transition-all hover:border-primary hover:text-primary"
          >
            Arena
          </Link>
          <Link
            to="/simulador-real"
            className="corner-cut bg-primary px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary-glow hover:glow"
          >
            Oficina
          </Link>
        </div>
      </div>
    </header>
  );
}
