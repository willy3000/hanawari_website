export function JarPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="relative h-[70%] w-[38%] animate-pulse">
        {/* Lid */}
        <div className="absolute left-1/2 top-0 h-[8%] w-[42%] -translate-x-1/2 rounded-t-md rounded-b-sm bg-char-600" />

        {/* Neck */}
        <div className="absolute left-1/2 top-[7%] h-[10%] w-[30%] -translate-x-1/2 rounded-md bg-gradient-to-b from-char-500 to-char-700" />

        {/* Jar Body */}
        <div className="absolute bottom-0 h-[86%] w-full rounded-[40%_40%_30%_30%/25%_25%_20%_20%] bg-gradient-to-b from-char-600 via-char-700 to-char-900 shadow-[0_15px_35px_rgba(0,0,0,0.35)]" />

        {/* Glass Highlight */}
        <div className="absolute left-[18%] top-[18%] h-[55%] w-[12%] rounded-full bg-white/20 blur-sm" />

        {/* Secondary Highlight */}
        <div className="absolute right-[22%] top-[28%] h-[22%] w-[6%] rounded-full bg-white/10 blur-sm" />

        {/* Bottom Glow */}
        <div className="absolute bottom-[6%] left-1/2 h-[10%] w-[55%] -translate-x-1/2 rounded-full bg-white/10 blur-md" />
      </div>
    </div>
  );
}