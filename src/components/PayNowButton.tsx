import { useEffect, useRef, useState } from "react";
import { fetchPaymentStatus, initiatePaymentRequest } from "@/lib/api";
import type { PaymentStatus } from "@/types";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 30;

type Phase = "idle" | "sending" | "waiting" | "success" | "failed";

export function PayNowButton({
  orderId,
  phone,
  onStatusChange,
}: {
  orderId: string;
  phone: string;
  onStatusChange: (status: PaymentStatus) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const pollCountRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const poll = () => {
    fetchPaymentStatus(orderId)
      .then((result) => {
        const status = result.payment?.status;
        if (status === "success") {
          setPhase("success");
          onStatusChange("paid");
          return;
        }
        if (status === "failed" || status === "abandoned") {
          setPhase("failed");
          setMessage(result.payment?.gatewayResponse ?? "Payment was not completed.");
          onStatusChange("failed");
          return;
        }
        scheduleNext();
      })
      .catch(scheduleNext);
  };

  const scheduleNext = () => {
    pollCountRef.current += 1;
    if (pollCountRef.current >= MAX_POLLS) {
      setPhase("failed");
      setMessage("Still waiting — try again in a moment.");
      return;
    }
    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  };

  const handleClick = async () => {
    setPhase("sending");
    setMessage(null);
    pollCountRef.current = 0;
    try {
      const result = await initiatePaymentRequest(orderId);
      if (result.order.paymentStatus === "paid") {
        setPhase("success");
        onStatusChange("paid");
        return;
      }
      if (result.payment?.status === "failed") {
        setPhase("failed");
        setMessage(result.payment.gatewayResponse ?? "Could not start the M-Pesa payment.");
        onStatusChange("failed");
        return;
      }
      setMessage(result.displayText ?? `Check ${phone} to complete payment.`);
      setPhase("waiting");
      onStatusChange("pending");
      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    } catch (err) {
      setPhase("failed");
      setMessage(err instanceof Error ? err.message : "Could not start the M-Pesa payment.");
    }
  };

  if (phase === "success") {
    return <p className="text-xs font-medium text-herb-400">Payment confirmed.</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={phase === "sending" || phase === "waiting"}
        className="rounded-full bg-ember-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cream-50 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {phase === "sending" ? "Sending…" : phase === "waiting" ? "Check your phone…" : "Pay now"}
      </button>
      {message && (
        <p className={`mt-1.5 text-xs ${phase === "failed" ? "text-ember-500" : "text-cream-50/50"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
