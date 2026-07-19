import { DEFAULT_DELIVERY_CONFIG } from "@/data/nairobi-areas";
import type { DeliveryConfig, DeliveryQuote, GeoPoint } from "@/types";

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometers. */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_KM * c;
}

/** Estimate a quote from the admin-configured store location and rates.
 * Mirrors the backend formula; the backend recomputes authoritatively at
 * order time. */
export function getDeliveryQuote(
  point: GeoPoint,
  config: DeliveryConfig = DEFAULT_DELIVERY_CONFIG
): DeliveryQuote {
  const distanceKm = haversineDistanceKm(config.dispatchPoint, point);
  const withinRange = distanceKm <= config.maxRadiusKm;
  const feeKes = withinRange
    ? Math.round((config.baseFeeKes + distanceKm * config.perKmFeeKes) / 10) * 10
    : 0;

  return { distanceKm, feeKes, withinRange };
}
