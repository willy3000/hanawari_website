export function JarPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="h-3/5 w-2/5 animate-pulse rounded-[40%] bg-gradient-to-b from-char-700 to-char-800" />
    </div>
  );
}
