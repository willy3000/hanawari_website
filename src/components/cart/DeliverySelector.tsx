import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { DISPATCH_POINT, MAX_DELIVERY_RADIUS_KM, NAIROBI_AREAS, type NairobiArea } from "@/data/nairobi-areas";
import { fetchDeliveryAreas } from "@/lib/api";
import { formatKes } from "@/lib/format";
import { PinIcon, StoreIcon } from "@/components/icons";
import type { DeliveryMethod } from "@/types";

const METHODS: { id: DeliveryMethod; label: string; icon: typeof PinIcon }[] = [
  { id: "delivery", label: "Delivery", icon: PinIcon },
  { id: "pickup", label: "Pick up", icon: StoreIcon },
];

type GeoStatus = "idle" | "locating" | "error";

export function DeliverySelector() {
  const {
    deliveryMethod,
    deliveryLocation,
    deliveryQuote,
    setDeliveryMethod,
    setDeliveryLocation,
  } = useCart();
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  // Areas ship pre-baked from the static data file so the picker is usable instantly;
  // this swaps them for the backend's list (the source of truth) once it responds.
  const [areas, setAreas] = useState<NairobiArea[]>(NAIROBI_AREAS);

  useEffect(() => {
    let cancelled = false;
    fetchDeliveryAreas().then((result) => {
      if (!cancelled) setAreas(result.areas);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAreaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const area = areas.find((a) => a.name === event.target.value);
    setDeliveryLocation(area ? { areaName: area.name, lat: area.lat, lng: area.lng } : null);
    setGeoStatus("idle");
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLocation({
          areaName: "Your current location",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus("idle");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="rounded-2xl border border-cream-50/10 bg-char-900 p-4">
      <div
        role="tablist"
        aria-label="Delivery method"
        className="flex gap-1.5 rounded-full border border-cream-50/12 bg-char-800/70 p-1"
      >
        {METHODS.map(({ id, label, icon: Icon }) => {
          const active = deliveryMethod === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setDeliveryMethod(id)}
              className="relative flex-1 rounded-full px-3 py-2 text-sm font-medium"
              style={{ color: active ? "var(--char-950)" : undefined }}
            >
              {active && (
                <motion.span
                  layoutId="delivery-method-pill"
                  className="absolute inset-0 rounded-full bg-gold-400"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {deliveryMethod === "delivery" ? (
        <div className="mt-4 space-y-3">
          <label htmlFor="delivery-area" className="block text-xs font-medium text-cream-50/70">
            Delivery area
          </label>
          <select
            id="delivery-area"
            value={deliveryLocation?.areaName.startsWith("Your current") ? "" : deliveryLocation?.areaName ?? ""}
            onChange={handleAreaChange}
            className="w-full rounded-lg border border-cream-50/15 bg-char-800 px-3 py-2.5 text-sm text-cream-50 outline-none focus:border-gold-400"
          >
            <option value="">Select your area…</option>
            {areas.map((area) => (
              <option key={area.name} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={geoStatus === "locating"}
            className="flex items-center gap-1.5 text-xs font-medium text-gold-300 hover:text-gold-400 disabled:opacity-60"
          >
            <PinIcon className="h-3.5 w-3.5" />
            {geoStatus === "locating" ? "Locating…" : "Use my current location"}
          </button>
          {geoStatus === "error" && (
            <p className="text-xs text-ember-500">
              Couldn&rsquo;t get your location. Choose your area from the list instead.
            </p>
          )}

          {deliveryLocation && deliveryQuote && (
            <div
              className={`rounded-lg px-3 py-2.5 text-xs ${
                deliveryQuote.withinRange
                  ? "bg-herb-400/12 text-herb-400"
                  : "bg-ember-600/12 text-ember-500"
              }`}
            >
              {deliveryQuote.withinRange ? (
                <p>
                  {deliveryLocation.areaName} is about{" "}
                  <strong>{deliveryQuote.distanceKm.toFixed(1)} km</strong> from our kitchen —
                  delivery fee <strong>{formatKes(deliveryQuote.feeKes)}</strong>.
                </p>
              ) : (
                <p>
                  {deliveryLocation.areaName} is {deliveryQuote.distanceKm.toFixed(0)} km away —
                  outside our {MAX_DELIVERY_RADIUS_KM} km delivery radius. We can&rsquo;t deliver
                  there yet. Switch to pick up instead, or choose a closer area.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-cream-50/5 px-3 py-2.5 text-xs text-cream-50/70">
          Pick up from <strong className="text-cream-50">{DISPATCH_POINT.label}</strong> — no
          delivery fee. We&rsquo;ll text you when your order is ready.
        </div>
      )}
    </div>
  );
}
