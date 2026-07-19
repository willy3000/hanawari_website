import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { formatKes } from "@/lib/format";
import { fetchPaymentStatus, initiatePaymentRequest } from "@/lib/api";
import { CheckIcon, PhoneIcon } from "@/components/icons";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 30; // ~90s of polling before asking the user to check back later

type Phase = "idle" | "sending" | "waiting" | "success" | "failed";

export function PaymentStep() {
  const { lastOrder, completePaymentStep } = useCart();
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayText, setDisplayText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollCountRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orderId = lastOrder?.id;

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  if (!lastOrder || !orderId) return null;

  const poll = () => {
    fetchPaymentStatus(orderId)
      .then((result) => {
        const status = result.payment?.status;
        if (status === "success") {
          setPhase("success");
          setTimeout(() => {
            void completePaymentStep("paid");
          }, 900);
          return;
        }
        if (status === "failed" || status === "abandoned") {
          setPhase("failed");
          setError(
            result.payment?.gatewayResponse ?? "Payment was not completed.",
          );
          return;
        }
        scheduleNextPoll();
      })
      .catch(() => scheduleNextPoll());
  };

  const scheduleNextPoll = () => {
    pollCountRef.current += 1;
    if (pollCountRef.current >= MAX_POLLS) {
      setPhase("failed");
      setError(
        "We haven't heard back yet. You can try again, or check My Orders in a few minutes.",
      );
      return;
    }
    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  };

  const handleSend = async () => {
    setPhase("sending");
    setError(null);
    pollCountRef.current = 0;
    try {
      const result = await initiatePaymentRequest(orderId);
      if (result.order.paymentStatus === "paid") {
        setPhase("success");
        setTimeout(() => {
          void completePaymentStep("paid");
        }, 900);
        return;
      }
      if (result.payment?.status === "failed") {
        setPhase("failed");
        setError(
          result.payment.gatewayResponse ??
            "Could not start the M-Pesa payment.",
        );
        return;
      }
      setDisplayText(result.displayText ?? result.message ?? null);
      setPhase("waiting");
      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    } catch (err) {
      setPhase("failed");
      setError(
        err instanceof Error
          ? err.message
          : "Could not start the M-Pesa payment.",
      );
    }
  };

  const handleSkip = async () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    await completePaymentStep();
  };

  const handleRetry = () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    setPhase("idle");
    setError(null);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
      <div className="mt-2 rounded-2xl border border-cream-50/10 bg-char-900 p-5">
        <div className="flex justify-between text-sm">
          <span className="text-cream-50/60">Order</span>
          <span className="font-semibold text-gold-300">{lastOrder.id}</span>
        </div>
        <div className="mt-2 flex justify-between text-base font-semibold text-cream-50">
          <span>Total due</span>
          <span>{formatKes(lastOrder.totalKes)}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
        {phase === "idle" && (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-herb-400/15 text-herb-400">
              <PhoneIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-cream-50">
              Pay with M-Pesa
            </h3>
            <p className="mt-1.5 max-w-[30ch] text-sm text-cream-50/65">
              We&rsquo;ll send a prompt to{" "}
              <strong className="text-cream-50">
                {lastOrder.customer.phone}
              </strong>
              . Enter your PIN to complete payment.
            </p>
          </>
        )}

        {(phase === "sending" || phase === "waiting") && (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-400/30 border-t-gold-400"
            />
            <h3 className="mt-4 font-display text-lg font-bold text-cream-50">
              {phase === "sending" ? "Sending prompt…" : "Check your phone"}
            </h3>
            <p className="mt-1.5 max-w-[32ch] text-sm text-cream-50/65">
              {displayText ??
                `Enter your M-Pesa PIN on ${lastOrder.customer.phone} to complete payment.`}
            </p>
          </>
        )}

        {phase === "success" && (
          <>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-herb-400/15 text-herb-400"
            >
              <CheckIcon className="h-7 w-7" />
            </motion.span>
            <h3 className="mt-4 font-display text-lg font-bold text-cream-50">
              Payment confirmed
            </h3>
          </>
        )}

        {phase === "failed" && (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ember-600/15 text-ember-500">
              <PhoneIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-cream-50">
              Payment not completed
            </h3>
            <p className="mt-1.5 max-w-[32ch] text-sm text-ember-500">
              {error}
            </p>
          </>
        )}
      </div>

      <div className="mt-auto space-y-3">
        {phase === "idle" && (
          <button
            type="button"
            onClick={handleSend}
            className="w-full rounded-full bg-ember-600 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-cream-50 transition-transform hover:scale-[1.01] active:scale-[0.98]"
          >
            Send M-Pesa prompt
          </button>
        )}
        {phase === "failed" && (
          <button
            type="button"
            onClick={handleRetry}
            className="w-full rounded-full bg-ember-600 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-cream-50 transition-transform hover:scale-[1.01] active:scale-[0.98]"
          >
            Try again
          </button>
        )}
        {phase !== "success" && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full rounded-full border border-cream-50/15 py-3 text-sm font-medium text-cream-50/75 hover:border-gold-400 hover:text-gold-400"
          >
            I&rsquo;ll pay later
          </button>
        )}
      </div>
    </div>
  );
}
