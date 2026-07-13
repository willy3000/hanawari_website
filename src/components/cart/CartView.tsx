import { BUNDLE_DISCOUNT_KES } from "@/data/products";
import { formatKes } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { DeliverySelector } from "@/components/cart/DeliverySelector";
import { FlameIcon, JarSilhouetteIcon } from "@/components/icons";

export function CartView() {
  const {
    items,
    products,
    subtotalKes,
    discountKes,
    deliveryFeeKes,
    totalKes,
    hasFullBundle,
    deliveryMethod,
    canCheckout,
    goToCheckout,
    closeDrawer,
  } = useCart();

  const distinctIds = new Set(items.map((i) => i.productId));
  const missingCount = products.length - distinctIds.size;
  const showBundleNudge = items.length > 0 && !hasFullBundle && missingCount <= 2;

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
        {items.map((item) => (
          <CartLineItem key={item.productId} item={item} />
        ))}
      </ul>

      <div className="flex-1 overflow-y-auto px-6 pb-2">
        {hasFullBundle ? (
          <p className="mb-3 flex items-center gap-2 rounded-lg bg-herb-400/12 px-3 py-2 text-xs font-medium text-herb-400">
            <FlameIcon className="h-3.5 w-3.5" />
            All three heat levels — bundle discount applied.
          </p>
        ) : showBundleNudge ? (
          <p className="mb-3 rounded-lg bg-gold-400/10 px-3 py-2 text-xs text-gold-300">
            Add the remaining heat level{missingCount > 1 ? "s" : ""} to
            unlock {formatKes(BUNDLE_DISCOUNT_KES)} off as a full-range bundle.
          </p>
        ) : null}

        <DeliverySelector />
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
        {!canCheckout && deliveryMethod === "delivery" && (
          <p className="mt-2 text-center text-xs text-cream-50/45">
            Select a deliverable area or switch to pick up to continue.
          </p>
        )}
      </div>
    </div>
  );
}
