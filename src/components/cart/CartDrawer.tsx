import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { CloseIcon } from "@/components/icons";
import { CartView } from "@/components/cart/CartView";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { PaymentStep } from "@/components/cart/PaymentStep";
import { OrderConfirmation } from "@/components/cart/OrderConfirmation";

const TITLES = {
  cart: "Your cart",
  checkout: "Checkout",
  payment: "Payment",
  confirmation: "Order received",
} as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const { isDrawerOpen, step, closeDrawer } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      lastFocused.current = document.activeElement as HTMLElement;
      panelRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      lastFocused.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-char-950/70 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={TITLES[step]}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-char-800 shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-cream-50/10 px-6 py-5">
              <h2 className="font-display text-lg font-bold text-cream-50">
                {TITLES[step]}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full text-cream-50/70 hover:bg-cream-50/10 hover:text-cream-50"
              >
                <CloseIcon className="h-4.5 w-4.5" />
              </button>
            </div>

            {step === "cart" && <CartView />}
            {step === "checkout" && <CheckoutForm />}
            {step === "payment" && <PaymentStep />}
            {step === "confirmation" && <OrderConfirmation />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
