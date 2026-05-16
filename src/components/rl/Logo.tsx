export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo_kart_A26.png"
        alt="RL Kart 26A"
        className="h-10 w-auto max-w-[11rem] object-contain sm:h-12 sm:max-w-[15rem]"
      />
    </div>
  );
}
