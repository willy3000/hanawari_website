import type { PaymentStatus } from "@/types";

const STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-cream-50/10 text-cream-50/50",
  pending: "bg-gold-400/15 text-gold-300",
  paid: "bg-herb-400/15 text-herb-400",
  failed: "bg-ember-600/15 text-ember-500",
};

const LABELS: Record<PaymentStatus, string> = {
  unpaid: "Payment pending",
  pending: "Confirming payment",
  paid: "Paid",
  failed: "Payment failed",
};

export function PaymentStatusBadge({ status }: { status?: PaymentStatus }) {
  const resolved = status ?? "unpaid";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STYLES[resolved]}`}
    >
      {LABELS[resolved]}
    </span>
  );
}
