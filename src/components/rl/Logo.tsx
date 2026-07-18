export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        viewBox="0 0 220 40"
        className="h-10 w-auto sm:h-12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="4" width="46" height="32" rx="4" fill="currentColor" className="text-primary" />
        <text
          x="23"
          y="27"
          textAnchor="middle"
          fill="hsl(var(--primary-foreground))"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: "18px", fontWeight: 900, letterSpacing: "1px" }}
        >
          RL
        </text>
        <text
          x="60"
          y="27"
          fill="currentColor"
          className="text-foreground"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: "20px", fontWeight: 700, letterSpacing: "4px" }}
        >
          KART
        </text>
        <text
          x="148"
          y="27"
          fill="currentColor"
          className="text-accent"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: "14px", fontWeight: 800, letterSpacing: "2px" }}
        >
          26A
        </text>
      </svg>
    </div>
  );
}