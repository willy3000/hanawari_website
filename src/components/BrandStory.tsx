import Image from "next/image";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ChiliIcon, FlameIcon, LeafIcon, HeartIcon } from "@/components/icons";
import { TOMATO_TEXTURE } from "@/data/images";

const TRAITS = [
  { icon: ChiliIcon, label: "100% homemade, small batch", color: "#ff4500" },
  { icon: FlameIcon, label: "Authentic Kenyan recipe", color: "#cd853f" },
  { icon: LeafIcon, label: "Fresh, local ingredients", color: "#7c9a52" },
  { icon: HeartIcon, label: "Blended by hand, every jar", color: "#8b4513" },
];

export function BrandStory() {
  return (
    <section id="story" className="bg-char-900 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center md:gap-12">
        <RevealOnScroll>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-gold-400">
            The Hanawari experience
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-cream-50 sm:text-5xl">
            Authentic Kenyan fire, bottled with care
          </h2>
          <span className="mt-6 block h-1 w-16 rounded-full bg-gradient-to-r from-ember-600 via-gold-400 to-clay-700" />
          <p className="mt-6 max-w-lg text-base leading-relaxed text-cream-50/70">
            Hanawari began in a home kitchen, built on a simple rule: real
            ingredients, real heat, no shortcuts. Each jar is a hand-blended
            mix of local chili, ripe tomato and fresh herb — the kind of
            salsa recipe that gets passed down, not printed on a label.
          </p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-cream-50/70">
            When we say &ldquo;Taste the Moto,&rdquo; we mean it — this is
            the real fire of Kenyan cuisine, made the slow way.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-cream-50/10 bg-char-800 p-8 sm:p-10">
            <Image
              src={TOMATO_TEXTURE.src}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-[0.16]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-char-800 via-char-800/95 to-char-800/70" />
            <h3 className="relative font-display text-xl font-semibold text-cream-50">
              What makes us different
            </h3>
            <ul className="relative mt-6 space-y-5">
              {TRAITS.map(({ icon: Icon, label, color }) => (
                <li key={label} className="flex items-center gap-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-cream-50/85">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
