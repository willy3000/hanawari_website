export type HeatLevel = 1 | 2 | 3;

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heatLevel: HeatLevel;
  priceKes: number;
  accent: string;
  accentSoft: string;
  labelColor: string;
  labelColorDark: string;
  badge?: string;
  /** Featured products (max 3, curated in the admin) headline the landing page. */
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

/** An order's line item as returned by the backend — name/price are
 * snapshotted at order time, so they stay accurate even if the product is
 * later renamed or repriced. */
export interface OrderLineItem extends CartItem {
  name: string;
  priceKes: number;
}

export type DeliveryMethod = "delivery" | "pickup";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface DeliveryLocation extends GeoPoint {
  areaName: string;
}

export interface DeliveryQuote {
  distanceKm: number;
  feeKes: number;
  withinRange: boolean;
}

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export interface Order {
  id: string;
  createdAt: string;
  items: OrderLineItem[];
  subtotalKes: number;
  discountKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  deliveryMethod: DeliveryMethod;
  deliveryArea?: string;
  deliveryDistanceKm?: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    note?: string;
    email?: string;
  };
  status?: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  paymentStatus?: PaymentStatus;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  note?: string;
  email?: string;
}

export type PaymentAttemptStatus = "pending" | "success" | "failed" | "abandoned";

export interface PaymentAttempt {
  reference: string;
  status: PaymentAttemptStatus;
  gatewayResponse?: string;
  amountKes: number;
}
