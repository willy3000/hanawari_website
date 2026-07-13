type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-gold-400/15 text-gold-300",
  confirmed: "bg-ember-600/15 text-ember-500",
  ready: "bg-herb-400/15 text-herb-400",
  completed: "bg-herb-400/25 text-herb-400",
  cancelled: "bg-cream-50/10 text-cream-50/50",
};

const LABELS: Record<OrderStatus, string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status?: OrderStatus }) {
  const resolved = status ?? "pending";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STYLES[resolved]}`}
    >
      {LABELS[resolved]}
    </span>
  );
}
