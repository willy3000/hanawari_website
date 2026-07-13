import { ChiliIcon } from "@/components/icons";
import type { HeatLevel } from "@/types";

interface HeatMeterProps {
  level: HeatLevel;
  label?: boolean;
  size?: "sm" | "md";
  color?: string;
}

const LEVEL_LABELS: Record<HeatLevel, string> = {
  1: "Gentle heat",
  2: "Signature heat",
  3: "Volcanic heat",
};

export function HeatMeter({
  level,
  label = false,
  size = "md",
  color,
}: HeatMeterProps) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={LEVEL_LABELS[level]}
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((i) => {
          const active = i <= level;
          return (
            <ChiliIcon
              key={i}
              className={active ? dim : `${dim} opacity-20`}
              style={active ? { color: color ?? "var(--ember-600)" } : undefined}
              data-active={active}
            />
          );
        })}
      </div>
      {label && (
        <span className="text-xs uppercase tracking-[0.14em] text-cream-50/60">
          {LEVEL_LABELS[level]}
        </span>
      )}
    </div>
  );
}
