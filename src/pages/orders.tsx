import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { fetchMyOrders, lookupOrderRequest } from "@/lib/api";
import { formatKes } from "@/lib/format";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { PayNowButton } from "@/components/PayNowButton";
import { JarSilhouetteIcon } from "@/components/icons";
import type { Order, PaymentStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Ready", value: "ready" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

/**
 * Fallback for shoppers on a new phone/browser: the cookie-based "my orders"
 * list is empty there, but order ID + the phone it was placed with still
 * finds it.
 */
function OrderLookup({ onFound }: { onFound: (order: Order) => void }) {
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "searching">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setState("searching");
    try {
      onFound(await lookupOrderRequest(orderId.trim(), phone.trim()));
      setOrderId("");
      setPhone("");
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not find that order.",
      );
    } finally {
      setState("idle");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-sm text-gold-400 hover:underline"
      >
        Ordered on a different device? Find your order →
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-cream-50/10 bg-char-800 p-5"
    >
      <p className="text-sm font-medium text-cream-50">Find your order</p>
      <p className="mt-1 text-xs text-cream-50/55">
        Enter the order ID from your confirmation email and the phone number
        you ordered with.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value.toUpperCase())}
          required
          placeholder="Order ID, e.g. HN-ABC123"
          aria-label="Order ID"
          className="w-full rounded-full border border-cream-50/15 bg-char-950 px-4 py-2.5 font-mono text-sm text-cream-50 outline-none placeholder:font-sans placeholder:text-cream-50/35 focus:border-gold-400"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="07XX XXX XXX"
          aria-label="Phone number"
          className="w-full rounded-full border border-cream-50/15 bg-char-950 px-4 py-2.5 text-sm text-cream-50 outline-none placeholder:text-cream-50/35 focus:border-gold-400"
        />
        <button
          type="submit"
          disabled={state === "searching"}
          className="shrink-0 rounded-full bg-gold-400 px-6 py-2.5 text-sm font-semibold text-char-950 disabled:opacity-60"
        >
          {state === "searching" ? "Searching…" : "Find"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-ember-500">{error}</p>}
    </form>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadStatus, setLoadStatus] = useState<
    "loading" | "ready" | "unreachable"
  >("loading");
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce the search box so we're not firing a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoadStatus("loading");
    fetchMyOrders({ search, status: statusFilter })
      .then((result) => {
        setOrders(result.orders);
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("unreachable"));
  }, [search, statusFilter]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const result = await fetchMyOrders({
        search,
        status: statusFilter,
        cursor,
      });
      setOrders((prev) => [...prev, ...result.orders]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePaymentStatusChange = (
    orderId: string,
    paymentStatus: PaymentStatus,
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o)),
    );
  };

  return (
    <>
      <Head>
        <title>Your orders — Hanawari</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className="min-h-screen bg-char-950 px-6 py-16 text-cream-50 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm text-gold-400 hover:underline">
            &larr; Back to site
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-gold-400">
            Order tracking
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
            Your orders
          </h1>
          <p className="mt-2 text-sm text-cream-50/60">
            Orders you&rsquo;ve placed from this browser. We match them to you
            by a private ID stored on this device — no account needed.
            {loadStatus === "unreachable" && (
              <span className="text-ember-500">
                {" "}
                Could not reach the Hanawari server right now — try again in a
                moment.
              </span>
            )}
          </p>

          <OrderLookup
            onFound={(order) =>
              setOrders((prev) =>
                prev.some((o) => o.id === order.id) ? prev : [order, ...prev],
              )
            }
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order ID…"
              className="w-full rounded-full border border-cream-50/15 bg-char-800 px-4 py-2.5 text-sm text-cream-50 outline-none placeholder:text-cream-50/35 focus:border-gold-400 sm:max-w-xs"
            />
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatusFilter(f.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === f.value
                      ? "bg-gold-400 text-char-950"
                      : "bg-char-800 text-cream-50/65 hover:text-cream-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-cream-50/10 bg-char-800 px-8 py-14 text-center">
              <JarSilhouetteIcon className="h-12 w-12 text-cream-50/25" />
              <p className="mt-4 text-sm text-cream-50/60">
                {loadStatus === "loading"
                  ? "Loading your orders…"
                  : search || statusFilter !== "all"
                    ? "No orders match your search."
                    : "No orders yet from this browser."}
              </p>
              {loadStatus !== "loading" &&
                !search &&
                statusFilter === "all" && (
                  <Link
                    href="/#shop"
                    className="mt-6 rounded-full border border-cream-50/20 px-6 py-2.5 text-sm font-medium text-cream-50 hover:border-gold-400 hover:text-gold-400"
                  >
                    Shop the collection
                  </Link>
                )}
            </div>
          ) : (
            <>
              <ul className="mt-6 space-y-4">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-2xl border border-cream-50/10 bg-char-800 p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-gold-300">{order.id}</p>
                      <div className="flex gap-2">
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-cream-50/45">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>

                    <ul className="mt-4 space-y-1 text-sm text-cream-50/75">
                      {order.items.map((item) => (
                        <li
                          key={item.productId}
                          className="flex justify-between"
                        >
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>
                            {formatKes(item.priceKes * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1 border-t border-cream-50/10 pt-3 text-sm">
                      {order.discountKes > 0 && (
                        <div className="flex justify-between text-herb-400">
                          <span>Bundle discount</span>
                          <span>-{formatKes(order.discountKes)}</span>
                        </div>
                      )}
                      {(order.promoDiscountKes ?? 0) > 0 && (
                        <div className="flex justify-between text-herb-400">
                          <span>
                            Promo{order.promoCode && ` (${order.promoCode})`}
                          </span>
                          <span>-{formatKes(order.promoDiscountKes ?? 0)}</span>
                        </div>
                      )}
                      {order.deliveryMethod === "delivery" &&
                        order.deliveryFeeKes > 0 && (
                          <div className="flex justify-between text-cream-50/70">
                            <span>
                              Delivery fee
                              {order.deliveryArea && ` (${order.deliveryArea})`}
                              {typeof order.deliveryDistanceKm === "number" &&
                                ` · ${order.deliveryDistanceKm.toFixed(1)} km`}
                            </span>
                            <span>{formatKes(order.deliveryFeeKes)}</span>
                          </div>
                        )}
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatKes(order.totalKes)}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-cream-50/50">
                      {order.deliveryMethod === "pickup"
                        ? "Pickup"
                        : "Delivery"}{" "}
                      · {order.customer.name} · {order.customer.phone} ·{" "}
                      {order.customer.address}
                    </p>

                    {(order.paymentStatus === undefined ||
                      order.paymentStatus === "unpaid" ||
                      order.paymentStatus === "failed" ||
                      order.paymentStatus === "pending") && (
                      <div className="mt-4 border-t border-cream-50/10 pt-4">
                        <PayNowButton
                          orderId={order.id}
                          phone={order.customer.phone}
                          onStatusChange={(status) =>
                            handlePaymentStatusChange(order.id, status)
                          }
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-full border border-cream-50/20 px-6 py-2.5 text-sm font-medium text-cream-50 hover:border-gold-400 hover:text-gold-400 disabled:opacity-50"
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
