import { RevealOnScroll } from "@/components/RevealOnScroll";
import { StarIcon } from "@/components/icons";

const TESTIMONIALS = [
  {
    quote:
      "This salsa is unlike anything I've had before — the blend of spices is incredible.",
    name: "Sarah K.",
    offset: "md:mt-0",
  },
  {
    quote:
      "I'm addicted to the Volcanic jar. Perfect heat level and real, honest flavor.",
    name: "Mike R.",
    offset: "md:mt-10",
  },
  {
    quote:
      "Finally, a salsa with actual character. Hanawari is the real deal.",
    name: "Elena M.",
    offset: "md:mt-0",
  },
];

export function Testimonials() {
  return (
    <section id="reviews" className="bg-char-900 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-gold-400">
            Hanawari lovers say
          </p>
          <h2 className="font-display text-4xl font-bold text-cream-50 sm:text-5xl">
            Trusted by taste
          </h2>
        </RevealOnScroll>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <RevealOnScroll key={t.name} delay={i * 0.1} className={t.offset}>
              <figure className="h-full rounded-2xl border border-cream-50/10 bg-char-800 p-7">
                <div className="flex gap-1 text-gold-400">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <StarIcon key={starIndex} className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-cream-50/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm font-semibold text-cream-50">
                  {t.name}
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
