import { motion } from "framer-motion";
import type { CartItem } from "@/types";
import { formatKes } from "@/lib/format";
import { JarSilhouetteIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";

export function CartLineItem({ item }: { item: CartItem }) {
  const { getProduct, updateQuantity, removeItem } = useCart();
  const product = getProduct(item.productId);
  if (!product) return null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24, height: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="flex items-center gap-4 overflow-hidden py-4">
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${product.accent}22` }}
      >
        <JarSilhouetteIcon className="h-7 w-7" style={{ color: product.accent }} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-cream-50">
          {product.name}
        </p>
        <p className="text-xs text-cream-50/50">{formatKes(product.priceKes)} each</p>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-cream-50/15">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, item.quantity - 1)}
              aria-label={`Decrease ${product.name} quantity`}
              className="flex h-7 w-7 items-center justify-center text-cream-50/70 hover:text-gold-400"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-xs font-semibold text-cream-50">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(product.id, item.quantity + 1)}
              aria-label={`Increase ${product.name} quantity`}
              className="flex h-7 w-7 items-center justify-center text-cream-50/70 hover:text-gold-400"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="text-xs text-cream-50/45 underline-offset-2 hover:text-ember-500 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="shrink-0 text-sm font-semibold text-cream-50">
        {formatKes(product.priceKes * item.quantity)}
      </p>
    </motion.li>
  );
}
