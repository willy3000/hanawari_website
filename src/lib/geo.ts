import {
  BASE_DELIVERY_FEE_KES,
  DISPATCH_POINT,
  MAX_DELIVERY_RADIUS_KM,
  PER_KM_DELIVERY_FEE_KES,
} from "@/data/nairobi-areas";
import type { DeliveryQuote, GeoPoint } from "@/types";

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

export function getDeliveryQuote(point: GeoPoint): DeliveryQuote {
  const distanceKm = haversineDistanceKm(DISPATCH_POINT, point);
  const withinRange = distanceKm <= MAX_DELIVERY_RADIUS_KM;
  const feeKes = withinRange
    ? Math.round((BASE_DELIVERY_FEE_KES + distanceKm * PER_KM_DELIVERY_FEE_KES) / 10) * 10
    : 0;

  return { distanceKm, feeKes, withinRange };
}
