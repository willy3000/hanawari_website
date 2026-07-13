import type {
  CartItem,
  CustomerDetails,
  DeliveryMethod,
  DeliveryQuote,
  GeoPoint,
  Order,
  PaymentAttempt,
  Product,
} from "@/types";
import type { NairobiArea } from "@/data/nairobi-areas";
import { DISPATCH_POINT, MAX_DELIVERY_RADIUS_KM } from "@/data/nairobi-areas";
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
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }
  return data as T;
}

export async function fetchDeliveryAreas(): Promise<{
  areas: NairobiArea[];
  dispatchPoint: typeof DISPATCH_POINT;
  maxRadiusKm: number;
}> {
  try {
    return await request("/api/delivery/areas");
  } catch (err) {
    if (err instanceof ApiUnavailableError) {
      const { NAIROBI_AREAS } = await import("@/data/nairobi-areas");
      return {
        areas: NAIROBI_AREAS,
        dispatchPoint: DISPATCH_POINT,
        maxRadiusKm: MAX_DELIVERY_RADIUS_KM,
      };
    }
    throw err;
  }
}

export async function fetchDeliveryQuote(point: GeoPoint): Promise<DeliveryQuote> {
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
}

export async function createOrderRequest(payload: CreateOrderPayload): Promise<Order> {
  const { order } = await request<{ order: Order }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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
export async function fetchMyOrders(params: MyOrdersParams = {}): Promise<MyOrdersResult> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
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
export async function initiatePaymentRequest(orderId: string): Promise<InitiatePaymentResult> {
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
export async function fetchPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
  return request<PaymentStatusResult>(`/api/payments/${orderId}/status`);
}

/**
 * Live product copy/pricing from the backend (editable via HANAWARI_ADMIN).
 * Falls back to the bundled static list — which also renders instantly as the
 * initial state — if the backend is unreachable.
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { products } = await request<{ products: Product[] }>("/api/products");
    return products;
  } catch (err) {
    if (err instanceof ApiUnavailableError) {
      const { PRODUCTS } = await import("@/data/products");
      return PRODUCTS;
    }
    throw err;
  }
}
