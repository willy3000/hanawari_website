import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartIcon } from "@/components/icons";
import { fetchCategories } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import type { Category, Product } from "@/types";

interface ProductGroup {
  id: string;
  name: string;
  products: Product[];
}

export default function ProductsPage() {
  const { products, itemCount, openDrawer } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    fetchCategories().then((live) => {
      if (!cancelled) setCategories(live);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // One group per category that actually has products, plus a trailing group
  // for anything uncategorised. No categorised products at all -> no groups,
  // and the page renders the classic flat grid without filters.
  const groups = useMemo<ProductGroup[]>(() => {
    const result: ProductGroup[] = [];
    const known = new Set(categories.map((c) => c.id));
    for (const category of categories) {
      const inCategory = products.filter((p) => p.category === category.id);
      if (inCategory.length > 0) {
        result.push({ id: category.id, name: category.name, products: inCategory });
      }
    }
    if (result.length > 0) {
      const other = products.filter((p) => !p.category || !known.has(p.category));
      if (other.length > 0) {
        result.push({ id: "other", name: "Everything else", products: other });
      }
    }
    return result;
  }, [categories, products]);

  // The selected category can disappear (admin deletes it, live data swaps
  // in) — fall back to showing everything rather than an empty page.
  const activeFilter = groups.some((g) => g.id === selectedFilter)
    ? selectedFilter
    : "all";
  const visibleGroups =
    activeFilter === "all" ? groups : groups.filter((g) => g.id === activeFilter);

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

          {groups.length > 0 && (
            <RevealOnScroll
              delay={0.05}
              className="mt-10 flex flex-wrap justify-center gap-2"
            >
              <FilterPill
                label="All"
                count={products.length}
                active={activeFilter === "all"}
                onClick={() => setSelectedFilter("all")}
              />
              {groups.map((group) => (
                <FilterPill
                  key={group.id}
                  label={group.name}
                  count={group.products.length}
                  active={activeFilter === group.id}
                  onClick={() => setSelectedFilter(group.id)}
                />
              ))}
            </RevealOnScroll>
          )}

          {groups.length === 0 ? (
            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => (
                <RevealOnScroll key={product.id} delay={Math.min(i, 5) * 0.06}>
                  <ProductCard product={product} highlighted={Boolean(product.featured)} />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            visibleGroups.map((group) => (
              <section key={group.id} aria-label={group.name} className="mt-14">
                <RevealOnScroll>
                  <h2 className="flex items-baseline gap-3 font-display text-2xl font-bold text-cream-50">
                    {group.name}
                    <span className="text-sm font-normal text-cream-50/40">
                      {group.products.length}{" "}
                      {group.products.length === 1 ? "product" : "products"}
                    </span>
                  </h2>
                </RevealOnScroll>
                <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {group.products.map((product, i) => (
                    <RevealOnScroll key={product.id} delay={Math.min(i, 5) * 0.06}>
                      <ProductCard
                        product={product}
                        highlighted={Boolean(product.featured)}
                      />
                    </RevealOnScroll>
                  ))}
                </div>
              </section>
            ))
          )}

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

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-gold-400 bg-gold-400/15 text-gold-300"
          : "border-cream-50/15 text-cream-50/65 hover:border-gold-400/50 hover:text-gold-300"
      }`}
    >
      {label}
      <span className={`ml-1.5 text-xs ${active ? "text-gold-300/70" : "text-cream-50/35"}`}>
        {count}
      </span>
    </button>
  );
}
