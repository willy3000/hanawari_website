import Image from "next/image";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ArrowIcon } from "@/components/icons";
import { SMOKY_TEXTURE } from "@/data/images";

export function CTASection() {
  const scrollToShop = (event: React.MouseEvent) => {
    event.preventDefault();
    document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-char-950 px-5 py-28 text-center sm:px-8 sm:py-32">
      <Image
        src={SMOKY_TEXTURE.src}
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover opacity-[0.18]"
      />
      <div className="pointer-events-none absolute inset-0 bg-char-950/70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,69,0,0.14),transparent_65%)]" />
      <RevealOnScroll className="relative mx-auto max-w-2xl">
        <h2 className="font-display text-4xl font-bold text-cream-50 sm:text-5xl">
          Ready to taste the Moto?
        </h2>
        <p className="mt-4 text-base text-cream-50/65">
          Every jar is made to order and hand-delivered — your fire is
          waiting.
        </p>
        <a
          href="#shop"
          onClick={scrollToShop}
          className="group mt-9 inline-flex items-center gap-2 rounded-full bg-ember-600 px-9 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-cream-50 shadow-[0_8px_30px_-8px_rgba(255,69,0,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Shop the collection
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </RevealOnScroll>
    </section>
  );
}
