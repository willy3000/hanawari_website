import type { GeoPoint } from "@/types";

/** Our dispatch kitchen — the point delivery distance and fees are measured from. */
export const DISPATCH_POINT: GeoPoint & { label: string } = {
  label: "Hanawari Kitchen, Kilimani",
  lat: -1.2921,
  lng: 36.7872,
};

export const MAX_DELIVERY_RADIUS_KM = 25;
export const BASE_DELIVERY_FEE_KES = 150;
export const PER_KM_DELIVERY_FEE_KES = 25;

export interface NairobiArea extends GeoPoint {
  name: string;
}

/** Curated list of Nairobi-area neighborhoods with approximate coordinates. */
export const NAIROBI_AREAS: NairobiArea[] = [
  { name: "Nairobi CBD", lat: -1.2864, lng: 36.8172 },
  { name: "Westlands", lat: -1.2676, lng: 36.8108 },
  { name: "Kilimani", lat: -1.2921, lng: 36.7872 },
  { name: "Kileleshwa", lat: -1.2833, lng: 36.7833 },
  { name: "Lavington", lat: -1.2793, lng: 36.7712 },
  { name: "Karen", lat: -1.3194, lng: 36.7085 },
  { name: "Langata", lat: -1.3667, lng: 36.75 },
  { name: "South B", lat: -1.3167, lng: 36.8333 },
  { name: "South C", lat: -1.3167, lng: 36.8167 },
  { name: "Nairobi West", lat: -1.3078, lng: 36.8206 },
  { name: "Eastleigh", lat: -1.2833, lng: 36.85 },
  { name: "Embakasi", lat: -1.3167, lng: 36.8833 },
  { name: "Donholm", lat: -1.2939, lng: 36.8814 },
  { name: "Kasarani", lat: -1.2167, lng: 36.8833 },
  { name: "Roysambu", lat: -1.2189, lng: 36.8894 },
  { name: "Ruaka", lat: -1.2167, lng: 36.7833 },
  { name: "Runda", lat: -1.2167, lng: 36.8167 },
  { name: "Ngong Road", lat: -1.3, lng: 36.7667 },
  { name: "Rongai", lat: -1.3958, lng: 36.7517 },
  { name: "Kikuyu", lat: -1.25, lng: 36.6667 },
  { name: "Kiambu Town", lat: -1.1714, lng: 36.8356 },
  { name: "Ruiru", lat: -1.15, lng: 36.9667 },
  { name: "Athi River", lat: -1.4556, lng: 36.9776 },
  { name: "Thika", lat: -1.0333, lng: 37.0833 },
  { name: "Machakos", lat: -1.5167, lng: 37.2667 },
];
