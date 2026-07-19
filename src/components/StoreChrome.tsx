import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatAssistant } from "@/components/ChatAssistant";
import { useCart } from "@/lib/cart-context";

/** How long the "added to cart" toast stays up. */
const TOAST_MS = 2600;

const DISMISS_KEY = "hanawari_announcement_dismissed_v1";

function AddedToCartToast() {
  const { lastAdded, getProduct, openDrawer, isDrawerOpen } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAdded || isDrawerOpen) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), TOAST_MS);
    return () => clearTimeout(timer);
  }, [lastAdded, isDrawerOpen]);

  const product = lastAdded ? getProduct(lastAdded.productId) : undefined;

  return (
    <AnimatePresence>
      {visible && product && !isDrawerOpen && (
        <motion.button
          type="button"
          key={lastAdded?.at}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          onClick={() => {
            setVisible(false);
            openDrawer();
          }}
          className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-cream-50/15 bg-char-800 py-2.5 pr-5 pl-3 text-sm text-cream-50 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)]"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-char-950"
            style={{ backgroundColor: product.accent }}
          >
            ✓
          </span>
          <span>
            <strong className="font-semibold">{product.name}</strong> added
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-gold-300">
            View cart →
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Admin-controlled announcement, shown as a dismissible pill that drops in
 * just below the fixed nav — it overlays nothing important, never blocks the
 * bottom of the viewport, and stays out of the chat button's way. Dismissal
 * is remembered per message per session; a changed announcement reappears.
 */
function AnnouncementBanner() {
  const { storeStatus } = useCart();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const paused = storeStatus.ordersPaused;
  const message = paused
    ? storeStatus.announcement ||
      "We're not taking orders right now — back soon!"
    : storeStatus.announcement;

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY));
    } catch {
      // Storage blocked — banner just shows every page view.
    }
    setHydrated(true);
  }, []);

  const dismiss = () => {
    setDismissed(message);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, message);
    } catch {
      // Best effort.
    }
  };

  const show = hydrated && Boolean(message) && dismissed !== message;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.4 }}
          className="pointer-events-none fixed inset-x-0 top-20 z-30 flex justify-center px-4"
        >
          <div
            role="status"
            className={`pointer-events-auto flex max-w-xl items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md ${
              paused
                ? "border-ember-600/50 bg-char-900/95"
                : "border-gold-400/40 bg-char-900/95"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                paused ? "bg-ember-600/20" : "bg-gold-400/15"
              }`}
            >
              {paused ? "⏸" : "📣"}
            </span>
            <p className="text-sm leading-snug text-cream-50">
              {paused && (
                <strong className="mr-1 font-semibold text-ember-500">
                  Orders paused:
                </strong>
              )}
              <span className={paused ? "text-cream-50/85" : ""}>{message}</span>
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss announcement"
              className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-cream-50/50 transition-colors hover:bg-cream-50/10 hover:text-cream-50"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Global overlay chrome on every page: the announcement pill (top, below the
 * nav), the floating AI assistant (bottom right), and the add-to-cart toast.
 */
export function StoreChrome() {
  return (
    <>
      <AnnouncementBanner />
      <AddedToCartToast />
      <ChatAssistant />
    </>
  );
}
