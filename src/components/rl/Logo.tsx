export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-display font-black ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/40 text-primary-foreground glow">
        <span className="text-sm">RL</span>
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent led" />
      </div>
      <div className="leading-none">
        <div className="text-sm tracking-[0.3em] text-muted-foreground">LABS</div>
        <div className="text-base text-foreground">KART 26A</div>
      </div>
    </div>
  );
}
