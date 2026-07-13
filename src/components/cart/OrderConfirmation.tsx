import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { formatKes } from "@/lib/format";
import { CheckIcon } from "@/components/icons";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";

export function OrderConfirmation() {
  const { lastOrder, startNewOrder, closeDrawer } = useCart();
  if (!lastOrder) return null;

  const handleDone = () => {
    startNewOrder();
    closeDrawer();
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
      <div className="flex flex-col items-center pt-6 text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-herb-400/15 text-herb-400"
        >
          <CheckIcon className="h-7 w-7" />
        </motion.span>
        <h3 className="mt-4 font-display text-xl font-bold text-cream-50">
          Order received
        </h3>
        <p className="mt-1.5 max-w-[26ch] text-sm text-cream-50/65">
          {lastOrder.deliveryMethod === "pickup"
            ? "We'll text you when it's ready for pickup."
            : "We'll call you shortly to confirm delivery."}{" "}
          Order <span className="text-gold-300">{lastOrder.id}</span>
        </p>
        <div className="mt-3">
          <PaymentStatusBadge status={lastOrder.paymentStatus} />
        </div>
        {lastOrder.paymentStatus !== "paid" && (
          <p className="mt-2 max-w-[30ch] text-xs text-cream-50/50">
            You can complete payment any time from{" "}
            <Link href="/orders" className="text-gold-300 hover:underline">
              My orders
            </Link>
            .
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-cream-50/10 bg-char-900 p-5">
        <ul className="space-y-2 text-sm text-cream-50/75">
          {lastOrder.items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatKes(item.priceKes * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-cream-50/10 pt-3 text-sm">
          {lastOrder.discountKes > 0 && (
            <div className="flex justify-between text-herb-400">
              <span>Bundle discount</span>
              <span>-{formatKes(lastOrder.discountKes)}</span>
            </div>
          )}
          {lastOrder.deliveryMethod === "delivery" && lastOrder.deliveryFeeKes > 0 && (
            <div className="flex justify-between text-cream-50/70">
              <span>
                Delivery fee
                {lastOrder.deliveryArea && ` (${lastOrder.deliveryArea})`}
              </span>
              <span>{formatKes(lastOrder.deliveryFeeKes)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-cream-50">
            <span>Total</span>
            <span>{formatKes(lastOrder.totalKes)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-xs text-cream-50/50">
        <p>{lastOrder.customer.name}</p>
        <p>{lastOrder.customer.phone}</p>
        <p>{lastOrder.customer.address}</p>
        {lastOrder.customer.note && <p>Note: {lastOrder.customer.note}</p>}
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={handleDone}
          className="w-full shrink-0 rounded-full bg-ember-600 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-cream-50 transition-transform hover:scale-[1.01] active:scale-[0.98]"
        >
          Continue shopping
        </button>
        <Link
          href="/orders"
          onClick={handleDone}
          className="block w-full rounded-full border border-cream-50/15 py-3 text-center text-sm font-medium text-cream-50/75 hover:border-gold-400 hover:text-gold-400"
        >
          Track your orders
        </Link>
      </div>
    </div>
  );
}
