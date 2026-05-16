import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import heroKart from "@/assets/hero-kart.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-card/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent led" />
            Projeto Educacional · Fase 1
          </div>
          <h1 className="font-display text-5xl font-black leading-[1.05] text-foreground md:text-6xl lg:text-7xl">
            RL <span className="text-glow text-primary">KART</span>
            <br />
            26<span className="text-accent">A</span>
          </h1>
          <p className="mt-5 max-w-xl font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Mini Kart Elétrico · Plataforma Modular
            <br />
            Software · Hardware · Realidade Virtual · Física
          </p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            O informático modela. O software dá vida.{" "}
            <span className="text-foreground">A vida real executa.</span> Cada aula compila uma DLL
            em C# que libera uma função real do kart — da arena de corrida ao protótipo físico.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/simulator"
              className="corner-cut bg-gradient-to-r from-primary to-primary-glow px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground glow transition-transform hover:scale-[1.02]"
            >
              Entrar na Arena
            </Link>
            <Link
              to="/simulador-real"
              className="corner-cut border border-primary/60 bg-background/60 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
            >
              Abrir Oficina
            </Link>
            <a
              href="#projeto"
              className="corner-cut border border-border bg-card/60 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Ver Blueprint
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              { k: "3000W", v: "Motor Pico" },
              { k: "70 km/h", v: "Vel. Máx." },
              { k: "48V 20Ah", v: "LiFePO4" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-display text-xl font-bold text-primary">{s.k}</dt>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          <div className="scanline panel corner-cut relative overflow-hidden">
            <img
              src={heroKart}
              alt="RL Kart 26A — render cinematográfico"
              width={1920}
              height={1080}
              className="h-auto w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between font-mono text-[10px] uppercase tracking-widest">
              <div>
                <div className="text-muted-foreground">Telemetria</div>
                <div className="text-accent">● ONLINE</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">SoC</div>
                <div className="text-primary">78%</div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-4 -z-10 bg-primary/20 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
