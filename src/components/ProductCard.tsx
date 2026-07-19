import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart-context";
import { formatKes } from "@/lib/format";
import { HeatMeter } from "@/components/HeatMeter";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { JarPlaceholder } from "@/components/three/JarPlaceholder";

const ProductJar = dynamic(
  () => import("@/components/three/ProductJar").then((m) => m.ProductJar),
  { ssr: false, loading: () => <JarPlaceholder className="h-full w-full" /> }
);

interface ProductCardProps {
  product: Product;
  highlighted?: boolean;
}

export function ProductCard({ product, highlighted = false }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [bump, setBump] = useState(0);
  const [tilt, setTilt] = useState<{ x: number; y: number } | undefined>(undefined);
  const [cardHovered, setCardHovered] = useState(false);
  const { addItem } = useCart();

  const soldOut = product.stockQty === 0;
  const lowStock =
    product.stockQty != null && product.stockQty > 0 && product.stockQty <= 5;

  const handleAdd = () => {
    if (soldOut) return;
    addItem(product.id, quantity);
    setBump((b) => b + 1);
    setQuantity(1);
  };

  const handleCardMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: ny * 0.3, y: nx * 0.3 });
  };

  const handleCardLeave = () => {
    setTilt({ x: 0, y: 0 });
    setCardHovered(false);
  };

  return (
    <div
      onPointerMove={handleCardMove}
      onPointerEnter={() => setCardHovered(true)}
      onPointerLeave={handleCardLeave}
      className={`relative flex flex-col rounded-3xl border bg-char-800 p-6 transition-[colors,transform] duration-300 sm:p-8 ${
        cardHovered ? "-translate-y-1" : ""
      } ${
        highlighted
          ? "border-gold-400/70 shadow-[0_0_0_1px_rgba(231,165,60,0.35),0_20px_50px_-20px_rgba(231,165,60,0.35)]"
          : "border-cream-50/10"
      }`}
    >
      {product.badge && !soldOut && (
        <span className="absolute -top-3 left-6 rounded-full bg-gold-400 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-char-950">
          {product.badge}
        </span>
      )}
      {soldOut && (
        <span className="absolute -top-3 left-6 rounded-full bg-char-700 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-cream-50/70">
          Sold out
        </span>
      )}
      {lowStock && (
        <span className="absolute -top-3 right-6 rounded-full bg-ember-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-cream-50">
          Only {product.stockQty} left
        </span>
      )}

      <motion.div
        animate={bump > 0 ? { scale: [1, 1.08, 1], rotate: [0, 6, 0] } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto h-[220px] w-[190px]"
      >
        {/* Media precedence: custom 3D model → photo → default 3D jar.
            ProductJar itself swaps in product.modelUrl when present. */}
        {product.imageUrl && !product.modelUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : (
          <ProductJar product={product} tilt={tilt} className="h-full w-full" />
        )}
      </motion.div>

      <div className="mt-2 text-center">
        <h3 className="font-display text-2xl font-bold text-cream-50">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors hover:text-gold-400"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-cream-50/55">{product.tagline}</p>

        <div className="mt-4 flex justify-center">
          <HeatMeter level={product.heatLevel} color={product.accent} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-cream-50/70">
          {product.description}
        </p>

        <p className="mt-5 font-display text-2xl font-bold text-cream-50">
          {formatKes(product.priceKes)}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center rounded-full border border-cream-50/15">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label={`Decrease ${product.name} quantity`}
            className="flex h-9 w-9 items-center justify-center text-cream-50/80 transition-colors hover:text-gold-400"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span
            className="w-6 text-center text-sm font-semibold text-cream-50"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(9, q + 1))}
            aria-label={`Increase ${product.name} quantity`}
            className="flex h-9 w-9 items-center justify-center text-cream-50/80 transition-colors hover:text-gold-400"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-cream-50 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        style={{ backgroundColor: soldOut ? "#3f2a19" : product.accent }}
      >
        {soldOut ? "Sold out" : "Add to cart"}
      </button>
    </div>
  );
}
