import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { BUNDLE_DISCOUNT_KES, PRODUCTS } from "@/data/products";
import {
  DEFAULT_DELIVERY_CONFIG,
  NAIROBI_AREAS,
  type NairobiArea,
} from "@/data/nairobi-areas";
import { getDeliveryQuote } from "@/lib/geo";
import {
  createOrderRequest,
  fetchDeliveryAreas,
  fetchProducts,
  finalizeOrderRequest,
  previewPromoRequest,
} from "@/lib/api";
import type {
  AppliedPromo,
  CartItem,
  CustomerDetails,
  DeliveryConfig,
  DeliveryLocation,
  DeliveryMethod,
  DeliveryQuote,
  Order,
  PaymentStatus,
  Product,
  StoreStatus,
} from "@/types";

type CheckoutStep = "cart" | "checkout" | "payment" | "confirmation";

interface CartState {
  items: CartItem[];
  products: Product[];
  isDrawerOpen: boolean;
  step: CheckoutStep;
  lastOrder: Order | null;
  deliveryMethod: DeliveryMethod;
  deliveryLocation: DeliveryLocation | null;
  isPlacingOrder: boolean;
  placeOrderError: string | null;
  promo: AppliedPromo | null;
  /** Set on every ADD_ITEM — drives the "added to cart" toast. */
  lastAdded: { productId: string; at: number } | null;
}

type CartAction =
  | { type: "ADD_ITEM"; productId: string; quantity?: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "SET_PRODUCTS"; products: Product[] }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "GO_TO_CHECKOUT" }
  | { type: "BACK_TO_CART" }
  | { type: "SET_DELIVERY_METHOD"; method: DeliveryMethod }
  | { type: "SET_DELIVERY_LOCATION"; location: DeliveryLocation | null }
  | { type: "PLACE_ORDER_START" }
  | { type: "PLACE_ORDER_SUCCESS"; order: Order }
  | { type: "PLACE_ORDER_ERROR"; message: string }
  | { type: "COMPLETE_PAYMENT_STEP"; paymentStatus?: PaymentStatus }
  | { type: "START_NEW_ORDER" }
  | { type: "SET_PROMO"; promo: AppliedPromo | null }
  | { type: "HYDRATE_ITEMS"; items: CartItem[] };

const initialState: CartState = {
  items: [],
  products: PRODUCTS,
  isDrawerOpen: false,
  step: "cart",
  lastOrder: null,
  deliveryMethod: "delivery",
  deliveryLocation: null,
  isPlacingOrder: false,
  placeOrderError: null,
  promo: null,
  lastAdded: null,
};

function computeCartTotals(
  items: CartItem[],
  products: Product[],
  deliveryMethod: DeliveryMethod,
  deliveryLocation: DeliveryLocation | null,
  deliveryConfig: DeliveryConfig,
  promo: AppliedPromo | null,
  ordersPaused: boolean,
) {
  const productMap = new Map(products.map((p) => [p.id, p]));

  const subtotalKes = items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + (product ? product.priceKes * item.quantity : 0);
  }, 0);

  // Mirrors the backend: the bundle deal is "one of every featured product"
  // (the trio on the landing page), not the whole catalog, so adding new
  // products in the admin doesn't make the discount unreachable.
  const distinctProductIds = new Set(items.map((i) => i.productId));
  const featuredProducts = products.filter((p) => p.featured);
  const hasFullBundle =
    featuredProducts.length > 0 &&
    featuredProducts.every((p) => distinctProductIds.has(p.id)) &&
    items.every((i) => i.quantity >= 1);

  const discountKes = hasFullBundle ? BUNDLE_DISCOUNT_KES : 0;

  // Mirrors the backend's promo math: percent rounds, both clamp so the
  // combined discounts never push the total below zero.
  const promoDiscountKes = promo
    ? Math.min(
        promo.type === "percent"
          ? Math.round((subtotalKes * promo.value) / 100)
          : promo.value,
        Math.max(0, subtotalKes - discountKes),
      )
    : 0;

  const deliveryQuote: DeliveryQuote | null =
    deliveryMethod === "delivery" && deliveryLocation
      ? getDeliveryQuote(deliveryLocation, deliveryConfig)
      : null;

  const deliveryFeeKes =
    deliveryMethod === "delivery" && deliveryQuote?.withinRange
      ? deliveryQuote.feeKes
      : 0;

  const canCheckout =
    items.length > 0 &&
    !ordersPaused &&
    (deliveryMethod === "pickup" || Boolean(deliveryQuote?.withinRange));

  const totalKes = Math.max(
    0,
    subtotalKes - discountKes - promoDiscountKes + deliveryFeeKes,
  );

  return {
    subtotalKes,
    discountKes,
    promoDiscountKes,
    deliveryFeeKes,
    totalKes,
    hasFullBundle,
    deliveryQuote,
    canCheckout,
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const quantity = action.quantity ?? 1;
      const existing = state.items.find(
        (i) => i.productId === action.productId,
      );
      const items = existing
        ? state.items.map((i) =>
            i.productId === action.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          )
        : [...state.items, { productId: action.productId, quantity }];
      return {
        ...state,
        items,
        lastAdded: { productId: action.productId, at: Date.now() },
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.productId),
      };
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.productId !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    }
    case "SET_PRODUCTS":
      return { ...state, products: action.products };
    case "OPEN_DRAWER":
      return { ...state, isDrawerOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false, step: "cart" };
    case "GO_TO_CHECKOUT":
      return { ...state, step: "checkout", placeOrderError: null };
    case "BACK_TO_CART":
      return { ...state, step: "cart" };
    case "SET_DELIVERY_METHOD":
      return { ...state, deliveryMethod: action.method };
    case "SET_DELIVERY_LOCATION":
      return { ...state, deliveryLocation: action.location };
    case "PLACE_ORDER_START":
      return { ...state, isPlacingOrder: true, placeOrderError: null };
    case "PLACE_ORDER_SUCCESS":
      return {
        ...state,
        lastOrder: action.order,
        items: [],
        step: "payment",
        isPlacingOrder: false,
      };
    case "PLACE_ORDER_ERROR":
      return {
        ...state,
        isPlacingOrder: false,
        placeOrderError: action.message,
      };
    case "COMPLETE_PAYMENT_STEP":
      return {
        ...state,
        step: "confirmation",
        lastOrder:
          state.lastOrder && action.paymentStatus
            ? { ...state.lastOrder, paymentStatus: action.paymentStatus }
            : state.lastOrder,
      };
    case "START_NEW_ORDER":
      return {
        ...state,
        step: "cart",
        lastOrder: null,
        isDrawerOpen: false,
        deliveryMethod: "delivery",
        deliveryLocation: null,
        promo: null,
      };
    case "SET_PROMO":
      return { ...state, promo: action.promo };
    case "HYDRATE_ITEMS":
      // Refresh-survival only — never clobber items added before hydration.
      return state.items.length > 0 ? state : { ...state, items: action.items };
    default:
      return state;
  }
}

const CART_STORAGE_KEY = "hanawari_cart_v1";

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is CartItem =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as CartItem).productId === "string" &&
        typeof (entry as CartItem).quantity === "number" &&
        (entry as CartItem).quantity > 0,
    );
  } catch {
    return [];
  }
}

interface CartContextValue extends CartState {
  /** The admin-curated trio shown on the landing page (falls back to the
   * first three products if nothing is marked featured yet). */
  featuredProducts: Product[];
  /** Featured products not yet in the cart — the bundle-upsell targets. */
  missingFeaturedProducts: Product[];
  /** Admin-controlled: paused checkout + announcement bar text. */
  storeStatus: StoreStatus;
  /** Validates with the backend and applies; throws with a reason if invalid. */
  applyPromo: (code: string) => Promise<void>;
  removePromo: () => void;
  promoDiscountKes: number;
  /** Admin-configured store location + delivery pricing (live from the backend). */
  deliveryConfig: DeliveryConfig;
  /** Selectable delivery areas, refreshed from the backend. */
  deliveryAreas: NairobiArea[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getProduct: (productId: string) => Product | undefined;
  openDrawer: () => void;
  closeDrawer: () => void;
  goToCheckout: () => void;
  backToCart: () => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setDeliveryLocation: (location: DeliveryLocation | null) => void;
  placeOrder: (customer: CustomerDetails) => Promise<void>;
  completePaymentStep: (paymentStatus?: PaymentStatus) => void;
  startNewOrder: () => void;
  subtotalKes: number;
  discountKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  hasFullBundle: boolean;
  deliveryQuote: DeliveryQuote | null;
  canCheckout: boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>(
    DEFAULT_DELIVERY_CONFIG,
  );
  const [deliveryAreas, setDeliveryAreas] =
    useState<NairobiArea[]>(NAIROBI_AREAS);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    ordersPaused: false,
    announcement: "",
  });

  // Products render instantly from the bundled static list, then swap in the
  // live copy/pricing from the backend (editable via HANAWARI_ADMIN). Cart
  // math, product cards, and the heat selector all read from this single
  // source so a price never differs between what's displayed and what's
  // charged.
  // Survive refreshes: hydrate the cart from localStorage after mount (not
  // in initial state, which must match the server render), then mirror every
  // change back.
  const hydrated = useRef(false);
  useEffect(() => {
    const stored = readStoredCart();
    if (stored.length > 0) dispatch({ type: "HYDRATE_ITEMS", items: stored });
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(state.items),
      );
    } catch {
      // Storage full/blocked — the cart still works for this session.
    }
  }, [state.items]);

  useEffect(() => {
    let cancelled = false;
    fetchProducts().then((live) => {
      if (!cancelled && live.length > 0)
        dispatch({ type: "SET_PRODUCTS", products: live });
    });
    // Same instant-render-then-swap pattern for delivery: static defaults
    // first, then the admin-configured store location and pricing, so every
    // fee estimate matches what the backend will charge at order time.
    fetchDeliveryAreas().then(({ areas, config, status }) => {
      if (cancelled) return;
      if (areas.length > 0) setDeliveryAreas(areas);
      setDeliveryConfig(config);
      setStoreStatus(status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addItem = useCallback(
    (productId: string, quantity?: number) =>
      dispatch({ type: "ADD_ITEM", productId, quantity }),
    [],
  );
  const removeItem = useCallback(
    (productId: string) => dispatch({ type: "REMOVE_ITEM", productId }),
    [],
  );
  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
    [],
  );
  const getProduct = useCallback(
    (productId: string) => state.products.find((p) => p.id === productId),
    [state.products],
  );
  const openDrawer = useCallback(() => dispatch({ type: "OPEN_DRAWER" }), []);
  const closeDrawer = useCallback(() => dispatch({ type: "CLOSE_DRAWER" }), []);
  const goToCheckout = useCallback(
    () => dispatch({ type: "GO_TO_CHECKOUT" }),
    [],
  );
  const backToCart = useCallback(() => dispatch({ type: "BACK_TO_CART" }), []);
  const setDeliveryMethod = useCallback(
    (method: DeliveryMethod) =>
      dispatch({ type: "SET_DELIVERY_METHOD", method }),
    [],
  );
  const setDeliveryLocation = useCallback(
    (location: DeliveryLocation | null) =>
      dispatch({ type: "SET_DELIVERY_LOCATION", location }),
    [],
  );

  // Validate against the backend before applying, so the shopper gets the
  // real rejection reason (expired, min order, etc.) at the moment of entry.
  const applyPromo = useCallback(
    async (code: string) => {
      const subtotal = state.items.reduce((sum, item) => {
        const product = state.products.find((p) => p.id === item.productId);
        return sum + (product ? product.priceKes * item.quantity : 0);
      }, 0);
      const promo = await previewPromoRequest(code.trim(), subtotal);
      dispatch({ type: "SET_PROMO", promo });
    },
    [state.items, state.products],
  );

  const removePromo = useCallback(
    () => dispatch({ type: "SET_PROMO", promo: null }),
    [],
  );

  // Order creation is delegated to the backend (HANAWARI_BACKEND, Express + MongoDB):
  // it re-validates the cart, recomputes the delivery fee from the dispatch point, and
  // persists the order. The client never writes totals directly. Placing the order
  // moves to the "payment" step — PaymentStep drives the M-Pesa STK push from there.
  const placeOrder = useCallback(
    async (customer: CustomerDetails) => {
      dispatch({ type: "PLACE_ORDER_START" });
      try {
        const order = await createOrderRequest({
          items: state.items,
          deliveryMethod: state.deliveryMethod,
          deliveryLocation: state.deliveryLocation,
          customer,
          promoCode: state.promo?.code,
        });
        dispatch({ type: "PLACE_ORDER_SUCCESS", order });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Could not place your order. Try again.";
        dispatch({ type: "PLACE_ORDER_ERROR", message });
      }
    },
    [state.items, state.deliveryMethod, state.deliveryLocation, state.promo],
  );

  const completePaymentStep = useCallback(
    async (paymentStatus?: PaymentStatus) => {
      if (!state.lastOrder) return;
      try {
        await finalizeOrderRequest(
          state.lastOrder.id,
          paymentStatus === "paid" ? "paid" : "unpaid",
        );
      } catch {
        // Keep the UI flowing even if the finalize call fails; the order still exists as a draft
        // on the backend and can be retried from My Orders.
      }
      dispatch({ type: "COMPLETE_PAYMENT_STEP", paymentStatus });
    },
    [state.lastOrder],
  );

  const startNewOrder = useCallback(
    () => dispatch({ type: "START_NEW_ORDER" }),
    [],
  );

  const {
    subtotalKes,
    discountKes,
    promoDiscountKes,
    deliveryFeeKes,
    totalKes,
    hasFullBundle,
    deliveryQuote,
    canCheckout,
  } = useMemo(
    () =>
      computeCartTotals(
        state.items,
        state.products,
        state.deliveryMethod,
        state.deliveryLocation,
        deliveryConfig,
        state.promo,
        storeStatus.ordersPaused,
      ),
    [
      state.items,
      state.products,
      state.deliveryMethod,
      state.deliveryLocation,
      deliveryConfig,
      state.promo,
      storeStatus.ordersPaused,
    ],
  );
  const itemCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items],
  );
  const featuredProducts = useMemo(() => {
    const featured = state.products.filter((p) => p.featured);
    return featured.length > 0 ? featured : state.products.slice(0, 3);
  }, [state.products]);
  const missingFeaturedProducts = useMemo(() => {
    const inCart = new Set(state.items.map((i) => i.productId));
    return featuredProducts.filter(
      (p) => !inCart.has(p.id) && p.stockQty !== 0,
    );
  }, [featuredProducts, state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      featuredProducts,
      missingFeaturedProducts,
      storeStatus,
      applyPromo,
      removePromo,
      promoDiscountKes,
      deliveryConfig,
      deliveryAreas,
      addItem,
      removeItem,
      updateQuantity,
      getProduct,
      openDrawer,
      closeDrawer,
      goToCheckout,
      backToCart,
      setDeliveryMethod,
      setDeliveryLocation,
      placeOrder,
      completePaymentStep,
      startNewOrder,
      subtotalKes,
      discountKes,
      deliveryFeeKes,
      totalKes,
      hasFullBundle,
      deliveryQuote,
      canCheckout,
      itemCount,
    }),
    [
      state,
      featuredProducts,
      missingFeaturedProducts,
      storeStatus,
      applyPromo,
      removePromo,
      promoDiscountKes,
      deliveryConfig,
      deliveryAreas,
      addItem,
      removeItem,
      updateQuantity,
      getProduct,
      openDrawer,
      closeDrawer,
      goToCheckout,
      backToCart,
      setDeliveryMethod,
      setDeliveryLocation,
      placeOrder,
      completePaymentStep,
      startNewOrder,
      subtotalKes,
      discountKes,
      deliveryFeeKes,
      totalKes,
      hasFullBundle,
      deliveryQuote,
      canCheckout,
      itemCount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
