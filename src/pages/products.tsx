import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";

export default function ProductsPage() {
  const { products, itemCount, openDrawer } = useCart();

  return (
    <>
      <Head>
        <title>All products — Hanawari</title>
        <meta
          name="description"
          content="Browse the full range of Hanawari homemade Kenyan salsa — every heat level, every jar."
        />
      </Head>

      <header className="fixed inset-x-0 top-0 z-40 bg-char-950/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(231,165,60,0.15)]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-sm text-cream-50/75 transition-colors hover:text-gold-400"
          >
            &larr; Back to site
          </Link>
          <span className="font-display text-lg font-bold tracking-[0.14em] text-cream-50">
            HANAWARI
          </span>
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/15 text-cream-50 transition-colors hover:border-gold-400 hover:text-gold-400"
          >
            <CartIcon className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-600 px-1 text-[11px] font-bold text-cream-50"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </header>

      <main className="min-h-screen bg-char-950 px-5 pt-32 pb-28 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll className="text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-gold-400">
              The full range
            </p>
            <h1 className="font-display text-4xl font-bold text-cream-50 sm:text-5xl">
              All products
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-cream-50/65">
              Every jar we make, in one place. Pick your fire and add it straight
              to your cart.
            </p>
          </RevealOnScroll>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <RevealOnScroll key={product.id} delay={Math.min(i, 5) * 0.06}>
                <ProductCard product={product} highlighted={Boolean(product.featured)} />
              </RevealOnScroll>
            ))}
          </div>

          {products.length === 0 && (
            <p className="mt-14 text-center text-sm text-cream-50/50">
              No products available right now — check back soon.
            </p>
          )}
        </div>
      </main>

      <CartDrawer />
    </>
  );
}
