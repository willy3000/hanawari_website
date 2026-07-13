import type { Product } from "@/types";

export const PRODUCTS: Product[] = [
  {
    id: "gentle",
    slug: "gentle",
    name: "Gentle",
    tagline: "Fire, dialed in",
    description:
      "Ripe tomato, fresh coriander and a single chili, slow-blended for a mellow, rounded warmth. The easy way into real Kenyan heat.",
    heatLevel: 1,
    priceKes: 899,
    accent: "#CD853F",
    accentSoft: "#E3B272",
    labelColor: "#CD853F",
    labelColorDark: "#8B4513",
  },
  {
    id: "classic",
    slug: "classic",
    name: "Classic",
    tagline: "The one that started it all",
    description:
      "Our founding recipe — two chilis, charred onion and lime, blended by hand until the balance felt right. Confident heat, every jar the same.",
    heatLevel: 2,
    priceKes: 899,
    accent: "#FF4500",
    accentSoft: "#FF6347",
    labelColor: "#FF4500",
    labelColorDark: "#8B4513",
    badge: "Most popular",
  },
  {
    id: "volcanic",
    slug: "volcanic",
    name: "Volcanic",
    tagline: "No apology",
    description:
      "Three chilis, deep and smoky, built to build on you. This is the full power of the Moto — made for the ones who ask for more heat, not less.",
    heatLevel: 3,
    priceKes: 899,
    accent: "#7A2410",
    accentSoft: "#A13618",
    labelColor: "#5C1B0C",
    labelColorDark: "#20150d",
  },
];

export const BUNDLE_DISCOUNT_KES = 150;

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
