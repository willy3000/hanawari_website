import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { GetServerSideProps } from "next";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { HeatMeter } from "@/components/HeatMeter";
import { CartIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { JarPlaceholder } from "@/components/three/JarPlaceholder";
import { useCart } from "@/lib/cart-context";
import { formatKes } from "@/lib/format";
import type { Product } from "@/types";

const ProductJar = dynamic(
  () => import("@/components/three/ProductJar").then((m) => m.ProductJar),
  { ssr: false, loading: () => <JarPlaceholder className="h-full w-full" /> },
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hanawari.store";

const HEAT_LABELS: Record<1 | 2 | 3, string> = {
  1: "Gentle",
  2: "Classic",
  3: "Volcanic",
};

interface ProductPageProps {
  product: Product;
}

/**
 * Rendered server-side so crawlers and link previews get real markup +
 * JSON-LD; the interactive cart still hydrates from the shared provider.
 */
export const getServerSideProps: GetServerSideProps<ProductPageProps> = async ({
  params,
}) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  let products: Product[] = [];
  try {
    const response = await fetch(`${apiUrl}/api/products`);
    if (response.ok) {
      products = ((await response.json()) as { products: Product[] }).products;
    }
  } catch {
    // Backend down — fall back to the bundled catalog below.
  }
  if (products.length === 0) {
    products = (await import("@/data/products")).PRODUCTS;
  }

  const product = products.find((p) => p.slug === slug || p.id === slug);
  if (!product) return { notFound: true };
  return { props: { product } };
};

export default function ProductPage({ product }: ProductPageProps) {
  const { addItem, openDrawer, itemCount, getProduct } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Prefer the live client-side copy (price/stock may have changed since SSR).
  const live = getProduct(product.id) ?? product;
  const soldOut = live.stockQty === 0;
  const lowStock =
    live.stockQty != null && live.stockQty > 0 && live.stockQty <= 5;

  const handleAdd = () => {
    if (soldOut) return;
    addItem(live.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl || `${SITE_URL}/assets/logo-bg.png`,
    url: `${SITE_URL}/products/${product.slug}`,
    brand: { "@type": "Brand", name: "Hanawari" },
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: product.priceKes,
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };

  return (
    <>
      <Head>
        <title>{`${product.name} — Hanawari Kenyan Salsa`}</title>
        <meta name="description" content={product.description} />
        <meta
          property="og:title"
          content={`${product.name} — Hanawari Kenyan Salsa`}
        />
        <meta property="og:description" content={product.tagline} />
        <meta property="og:type" content="product" />
        {product.imageUrl && (
          <meta property="og:image" content={product.imageUrl} />
        )}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <header className="fixed inset-x-0 top-0 z-40 bg-char-950/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(231,165,60,0.15)]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/products"
            className="text-sm text-cream-50/75 transition-colors hover:text-gold-400"
          >
            &larr; All products
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/15 text-cream-50/80 transition-colors hover:border-gold-400 hover:text-gold-400"
          >
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-600 px-1 text-[11px] font-bold text-cream-50">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </header>

      <main className="min-h-screen bg-char-950 px-5 pb-24 pt-28 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-sm"
          >
            {/* Media precedence: custom 3D model → photo → default 3D jar.
                ProductJar itself swaps in live.modelUrl when present. */}
            {live.imageUrl && !live.modelUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={live.imageUrl}
                alt={live.name}
                className="w-full rounded-3xl border border-cream-50/10 bg-char-800 object-cover"
              />
            ) : (
              <div className="h-[380px]">
                <ProductJar product={live} className="h-full w-full" />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: live.accent }}
            >
              Heat level {live.heatLevel} — {HEAT_LABELS[live.heatLevel]}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-cream-50 sm:text-5xl">
              {live.name}
            </h1>
            <p className="mt-2 text-lg text-cream-50/60">{live.tagline}</p>

            <div className="mt-5">
              <HeatMeter level={live.heatLevel} color={live.accent} />
            </div>

            <p className="mt-6 max-w-prose leading-relaxed text-cream-50/75">
              {live.description}
            </p>

            <p className="mt-8 font-display text-3xl font-bold text-cream-50">
              {formatKes(live.priceKes)}
            </p>
            {lowStock && (
              <p className="mt-1 text-sm font-medium text-ember-500">
                Only {live.stockQty} jars left — don't sleep on it.
              </p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-cream-50/15">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center text-cream-50/80 transition-colors hover:text-gold-400"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span
                  className="w-8 text-center text-sm font-semibold text-cream-50"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(9, q + 1))}
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center text-cream-50/80 transition-colors hover:text-gold-400"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={soldOut}
                className="flex-1 rounded-full py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-cream-50 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:flex-none sm:px-10"
                style={{ backgroundColor: soldOut ? "#3f2a19" : live.accent }}
              >
                {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      <CartDrawer />
    </>
  );
}
