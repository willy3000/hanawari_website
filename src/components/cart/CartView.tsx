import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BUNDLE_DISCOUNT_KES } from "@/data/products";
import { formatKes } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { DeliverySelector } from "@/components/cart/DeliverySelector";
import { FlameIcon, JarSilhouetteIcon } from "@/components/icons";

export function CartView() {
  const {
    items,
    subtotalKes,
    discountKes,
    promoDiscountKes,
    deliveryFeeKes,
    totalKes,
    hasFullBundle,
    deliveryMethod,
    canCheckout,
    goToCheckout,
    closeDrawer,
    missingFeaturedProducts,
    addItem,
    promo,
    applyPromo,
    removePromo,
    storeStatus,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError(null);
    setApplyingPromo(true);
    try {
      await applyPromo(promoInput);
      setPromoInput("");
    } catch (err) {
      setPromoError(
        err instanceof Error ? err.message : "That code didn't work.",
      );
    } finally {
      setApplyingPromo(false);
    }
  };

  const showBundleNudge =
    items.length > 0 &&
    !hasFullBundle &&
    missingFeaturedProducts.length > 0 &&
    missingFeaturedProducts.length <= 2;

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <JarSilhouetteIcon className="h-12 w-12 text-cream-50/25" />
        <p className="mt-4 text-sm text-cream-50/60">
          Your cart is empty — add a jar to get the fire started.
        </p>
        <button
          type="button"
          onClick={closeDrawer}
          className="mt-6 rounded-full border border-cream-50/20 px-6 py-2.5 text-sm font-medium text-cream-50 hover:border-gold-400 hover:text-gold-400"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ul className="divide-y divide-cream-50/10 overflow-y-auto px-6">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <CartLineItem key={item.productId} item={item} />
          ))}
        </AnimatePresence>
      </ul>

      <div className="flex-1 overflow-y-auto px-6 pb-2">
        {hasFullBundle ? (
          <p className="mb-3 flex items-center gap-2 rounded-lg bg-herb-400/12 px-3 py-2 text-xs font-medium text-herb-400">
            <FlameIcon className="h-3.5 w-3.5" />
            All three heat levels — bundle discount applied.
          </p>
        ) : showBundleNudge ? (
          <div className="mb-3 rounded-lg bg-gold-400/10 px-3 py-2.5">
            <p className="text-xs text-gold-300">
              Complete the trio and save{" "}
              <strong>{formatKes(BUNDLE_DISCOUNT_KES)}</strong>:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingFeaturedProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addItem(product.id, 1)}
                  className="flex items-center gap-1.5 rounded-full border border-gold-400/40 px-3 py-1.5 text-xs font-medium text-gold-300 transition-colors hover:bg-gold-400/15"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: product.accent }}
                    aria-hidden="true"
                  />
                  + Add {product.name} · {formatKes(product.priceKes)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <DeliverySelector />

        <div className="mt-3">
          {promo ? (
            <p className="flex items-center justify-between rounded-lg bg-herb-400/12 px-3 py-2 text-xs font-medium text-herb-400">
              <span>
                Code <strong className="font-mono">{promo.code}</strong> applied
              </span>
              <button
                type="button"
                onClick={removePromo}
                className="text-herb-400/80 underline hover:text-herb-400"
              >
                Remove
              </button>
            </p>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleApplyPromo();
                    }
                  }}
                  placeholder="Promo code"
                  aria-label="Promo code"
                  className="w-full rounded-full border border-cream-50/15 bg-char-900 px-4 py-2 font-mono text-xs uppercase text-cream-50 outline-none placeholder:font-sans placeholder:normal-case placeholder:text-cream-50/35 focus:border-gold-400"
                />
                <button
                  type="button"
                  onClick={() => void handleApplyPromo()}
                  disabled={applyingPromo || !promoInput.trim()}
                  className="shrink-0 rounded-full border border-cream-50/20 px-4 py-2 text-xs font-medium text-cream-50/75 hover:border-gold-400 hover:text-gold-400 disabled:opacity-40"
                >
                  {applyingPromo ? "…" : "Apply"}
                </button>
              </div>
              {promoError && (
                <p className="mt-1.5 text-xs text-ember-500">{promoError}</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="border-t border-cream-50/10 px-6 pb-6 pt-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-cream-50/70">
            <span>Subtotal</span>
            <span>{formatKes(subtotalKes)}</span>
          </div>
          {discountKes > 0 && (
            <div className="flex justify-between text-herb-400">
              <span>Bundle discount</span>
              <span>-{formatKes(discountKes)}</span>
            </div>
          )}
          {promoDiscountKes > 0 && promo && (
            <div className="flex justify-between text-herb-400">
              <span>Promo ({promo.code})</span>
              <span>-{formatKes(promoDiscountKes)}</span>
            </div>
          )}
          {deliveryMethod === "delivery" && deliveryFeeKes > 0 && (
            <div className="flex justify-between text-cream-50/70">
              <span>Delivery fee</span>
              <span>{formatKes(deliveryFeeKes)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1.5 text-base font-semibold text-cream-50">
            <span>Total</span>
            <span>{formatKes(totalKes)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={goToCheckout}
          disabled={!canCheckout}
          className="mt-5 w-full rounded-full bg-ember-600 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-cream-50 transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Checkout
        </button>
        {storeStatus.ordersPaused ? (
          <p className="mt-2 text-center text-xs text-gold-300">
            We're not taking orders right now — check back soon!
          </p>
        ) : (
          !canCheckout &&
          deliveryMethod === "delivery" && (
            <p className="mt-2 text-center text-xs text-cream-50/45">
              Select a deliverable area or switch to pick up to continue.
            </p>
          )
        )}
      </div>
    </div>
  );
}
