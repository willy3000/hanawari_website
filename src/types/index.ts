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
  /** Category id (slug) assigned in the admin; missing/null = uncategorised. */
  category?: string | null;
  /** Product photo from the admin; missing = 3D jar rendering only. */
  imageUrl?: string | null;
  /** Custom 3D model (.glb/.gltf); takes precedence over imageUrl. */
  modelUrl?: string | null;
  /** null/undefined = stock not tracked; 0 = sold out. */
  stockQty?: number | null;
  /** false = hidden (the public API already filters these out). */
  isActive?: boolean;
}

/** A promo code validated by the backend, held in the cart until checkout. */
export interface AppliedPromo {
  code: string;
  type: "percent" | "fixed";
  value: number;
}

/** Admin-controlled storefront flags, delivered with the delivery config. */
export interface StoreStatus {
  ordersPaused: boolean;
  announcement: string;
}

/** Admin-managed product grouping, used to organise and filter the all-products page. */
export interface Category {
  id: string;
  name: string;
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

/** Admin-configured store location and delivery pricing — the source every
 * delivery label, radius check, and fee estimate derives from. */
export interface DeliveryConfig {
  dispatchPoint: GeoPoint & { label: string };
  maxRadiusKm: number;
  baseFeeKes: number;
  perKmFeeKes: number;
}

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export interface Order {
  id: string;
  createdAt: string;
  items: OrderLineItem[];
  subtotalKes: number;
  discountKes: number;
  promoCode?: string;
  promoDiscountKes?: number;
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
  marketingConsent?: boolean;
}

export type PaymentAttemptStatus =
  | "pending"
  | "success"
  | "failed"
  | "abandoned";

export interface PaymentAttempt {
  reference: string;
  status: PaymentAttemptStatus;
  gatewayResponse?: string;
  amountKes: number;
}
