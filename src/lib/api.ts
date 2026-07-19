import type {
  AppliedPromo,
  CartItem,
  Category,
  CustomerDetails,
  DeliveryConfig,
  DeliveryMethod,
  DeliveryQuote,
  GeoPoint,
  Order,
  PaymentAttempt,
  Product,
  StoreStatus,
} from "@/types";
import type { NairobiArea } from "@/data/nairobi-areas";
import { DEFAULT_DELIVERY_CONFIG } from "@/data/nairobi-areas";
import { getVisitorId } from "@/lib/visitor";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiUnavailableError extends Error {
  constructor(message = "Could not reach the Hanawari server.") {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Visitor-Id": getVisitorId(),
      },
      ...options,
    });
  } catch {
    throw new ApiUnavailableError();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error ?? `Request failed with status ${response.status}`,
    );
  }
  return data as T;
}

/**
 * Delivery areas plus the admin-configured store location and pricing
 * (editable via HANAWARI_ADMIN). Falls back to the bundled static defaults
 * if the backend is unreachable.
 */
const DEFAULT_STORE_STATUS: StoreStatus = {
  ordersPaused: false,
  announcement: "",
};

export async function fetchDeliveryAreas(): Promise<{
  areas: NairobiArea[];
  config: DeliveryConfig;
  status: StoreStatus;
}> {
  try {
    const result = await request<{
      areas: NairobiArea[];
      dispatchPoint: DeliveryConfig["dispatchPoint"];
      maxRadiusKm: number;
      baseFeeKes: number;
      perKmFeeKes: number;
      ordersPaused?: boolean;
      announcement?: string;
    }>("/api/delivery/areas");
    return {
      areas: result.areas,
      // Tolerate an older backend that doesn't send pricing fields yet.
      config: {
        dispatchPoint:
          result.dispatchPoint ?? DEFAULT_DELIVERY_CONFIG.dispatchPoint,
        maxRadiusKm: result.maxRadiusKm ?? DEFAULT_DELIVERY_CONFIG.maxRadiusKm,
        baseFeeKes: result.baseFeeKes ?? DEFAULT_DELIVERY_CONFIG.baseFeeKes,
        perKmFeeKes: result.perKmFeeKes ?? DEFAULT_DELIVERY_CONFIG.perKmFeeKes,
      },
      status: {
        ordersPaused: Boolean(result.ordersPaused),
        announcement: result.announcement ?? "",
      },
    };
  } catch (err) {
    if (err instanceof ApiUnavailableError) {
      const { NAIROBI_AREAS } = await import("@/data/nairobi-areas");
      return {
        areas: NAIROBI_AREAS,
        config: DEFAULT_DELIVERY_CONFIG,
        status: DEFAULT_STORE_STATUS,
      };
    }
    throw err;
  }
}

export async function fetchDeliveryQuote(
  point: GeoPoint,
): Promise<DeliveryQuote> {
  try {
    return await request<DeliveryQuote>("/api/delivery/quote", {
      method: "POST",
      body: JSON.stringify(point),
    });
  } catch (err) {
    if (err instanceof ApiUnavailableError) {
      const { getDeliveryQuote } = await import("@/lib/geo");
      return getDeliveryQuote(point);
    }
    throw err;
  }
}

export interface CreateOrderPayload {
  items: CartItem[];
  deliveryMethod: DeliveryMethod;
  deliveryLocation: { areaName: string; lat: number; lng: number } | null;
  customer: CustomerDetails;
  promoCode?: string;
}

export async function createOrderRequest(
  payload: CreateOrderPayload,
): Promise<Order> {
  const { order } = await request<{ order: Order }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return order;
}

export async function finalizeOrderRequest(
  orderId: string,
  paymentStatus: "paid" | "unpaid" = "unpaid",
): Promise<Order> {
  const { order } = await request<{ order: Order }>(
    `/api/orders/${orderId}/finalize`,
    {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    },
  );
  return order;
}

export interface MyOrdersParams {
  search?: string;
  status?: string;
  cursor?: string;
}

export interface MyOrdersResult {
  orders: Order[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Orders placed by this browser's visitor ID — see src/lib/visitor.ts. */
export async function fetchMyOrders(
  params: MyOrdersParams = {},
): Promise<MyOrdersResult> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.cursor) query.set("cursor", params.cursor);
  const qs = query.toString();
  return request<MyOrdersResult>(`/api/orders/mine${qs ? `?${qs}` : ""}`);
}

export interface InitiatePaymentResult {
  payment: PaymentAttempt | null;
  order: { paymentStatus: string };
  displayText?: string;
  message?: string;
}

/** Triggers an M-Pesa STK push for the given order's total. */
export async function initiatePaymentRequest(
  orderId: string,
): Promise<InitiatePaymentResult> {
  return request<InitiatePaymentResult>("/api/payments/initiate", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export interface PaymentStatusResult {
  payment: PaymentAttempt | null;
  order: { paymentStatus: string };
}

/** Polls payment status; the backend actively re-verifies with Paystack while pending. */
export async function fetchPaymentStatus(
  orderId: string,
): Promise<PaymentStatusResult> {
  return request<PaymentStatusResult>(`/api/payments/${orderId}/status`);
}

/**
 * Live product copy/pricing from the backend (editable via HANAWARI_ADMIN).
 * Falls back to the bundled static list — which also renders instantly as the
 * initial state — if the backend is unreachable.
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { products } = await request<{ products: Product[] }>(
      "/api/products",
    );
    return products;
  } catch (err) {
    if (err instanceof ApiUnavailableError) {
      const { PRODUCTS } = await import("@/data/products");
      return PRODUCTS;
    }
    throw err;
  }
}

/**
 * Admin-managed categories for grouping/filtering the all-products page.
 * Categories only exist on the backend, so an unreachable backend simply
 * means no grouping — the page falls back to a flat grid.
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const { categories } = await request<{ categories: Category[] }>(
      "/api/categories",
    );
    return categories;
  } catch {
    return [];
  }
}

/**
 * Validates a promo code for instant checkout feedback. The backend re-checks
 * at order time, so this can only ever be optimistic, never authoritative.
 */
export async function previewPromoRequest(
  code: string,
  subtotalKes: number,
): Promise<AppliedPromo> {
  return request<AppliedPromo>(
    `/api/marketing/promo/${encodeURIComponent(code)}?subtotalKes=${subtotalKes}`,
  );
}

/** Order lookup for a different device: order id + the phone it was placed with. */
export async function lookupOrderRequest(
  orderId: string,
  phone: string,
): Promise<Order> {
  const query = new URLSearchParams({ orderId, phone });
  const { order } = await request<{ order: Order }>(
    `/api/orders/lookup?${query.toString()}`,
  );
  return order;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

/** One turn with the storefront AI assistant — full history in, reply out. */
export async function assistantChatRequest(
  messages: AssistantMessage[],
): Promise<string> {
  const { reply } = await request<{ reply: string }>("/api/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
  return reply;
}

/** Footer newsletter signup. */
export async function subscribeNewsletterRequest(email: string): Promise<void> {
  await request("/api/marketing/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
