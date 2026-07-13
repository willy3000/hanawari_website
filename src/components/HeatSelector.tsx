import { motion } from "framer-motion";
import type { Product } from "@/types";
import { HeatMeter } from "@/components/HeatMeter";

interface HeatSelectorProps {
  products: Product[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function HeatSelector({ products, activeId, onSelect }: HeatSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Compare heat levels"
      className="mx-auto flex w-full max-w-md flex-col gap-2 rounded-full border border-cream-50/12 bg-char-800/70 p-1.5 sm:flex-row"
    >
      {products.map((product) => {
        const active = product.id === activeId;
        return (
          <button
            key={product.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onSelect(product.id)}
            className="relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ color: active ? "var(--char-950)" : undefined }}
          >
            {active && (
              <motion.span
                layoutId="heat-selector-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: product.accent }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {product.name}
              <span className={active ? "opacity-90" : ""}>
                <HeatMeter
                  level={product.heatLevel}
                  size="sm"
                  color={active ? "#140d0c" : product.accent}
                />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
