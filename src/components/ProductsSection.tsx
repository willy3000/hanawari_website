import { useState } from "react";
import Link from "next/link";
import { HeatSelector } from "@/components/HeatSelector";
import { ProductCard } from "@/components/ProductCard";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { useCart } from "@/lib/cart-context";

export function ProductsSection() {
  const { featuredProducts, addItem, openDrawer } = useCart();
  const [selectedId, setSelectedId] = useState(
    featuredProducts[1]?.id ?? featuredProducts[0]?.id
  );

  // The live featured set can differ from the static fallback the selector
  // initialised from — snap back to the middle jar if the selection vanished.
  const activeId = featuredProducts.some((p) => p.id === selectedId)
    ? selectedId
    : (featuredProducts[1]?.id ?? featuredProducts[0]?.id);

  const handleBundle = () => {
    featuredProducts.forEach((p) => addItem(p.id, 1));
    openDrawer();
  };

  return (
    <section id="shop" className="bg-char-950 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-gold-400">
            Choose your heat
          </p>
          <h2 className="font-display text-4xl font-bold text-cream-50 sm:text-5xl">
            From warm to volcanic
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-cream-50/65">
            Every jar shares the same base recipe — only the chili count
            changes. Compare the range, then pick your fire.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="mt-10 flex justify-center">
          <HeatSelector
            products={featuredProducts}
            activeId={activeId}
            onSelect={setSelectedId}
          />
        </RevealOnScroll>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {featuredProducts.map((product, i) => (
            <RevealOnScroll key={product.id} delay={i * 0.08}>
              <ProductCard
                product={product}
                highlighted={product.id === activeId}
              />
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.2} className="mt-14 text-center">
          <button
            type="button"
            onClick={handleBundle}
            className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-gold-400/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.06em] text-gold-300 transition-colors hover:bg-gold-400/20"
          >
            Order all three &amp; save
          </button>
          <p className="mt-3 text-xs text-cream-50/50">
            Add one of every heat level and the bundle discount applies
            automatically at checkout.
          </p>
          <p className="mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300"
            >
              View all products
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
