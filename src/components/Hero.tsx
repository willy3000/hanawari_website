import { useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { JarPlaceholder } from "@/components/three/JarPlaceholder";
import { ArrowIcon } from "@/components/icons";
import { CHILI_TEXTURE } from "@/data/images";

const HeroJar = dynamic(
  () => import("@/components/three/HeroJar").then((m) => m.HeroJar),
  { ssr: false, loading: () => <JarPlaceholder className="h-full w-full" /> }
);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToShop = (event: React.MouseEvent) => {
    event.preventDefault();
    document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden px-5 pt-28 sm:px-8"
    >
      <Image
        src={CHILI_TEXTURE.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover opacity-[0.14]"
      />
      <div className="pointer-events-none absolute inset-0 bg-char-950/75" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,69,0,0.18),transparent_60%)]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center md:text-left"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-gold-400">
            Homemade Kenyan salsa
          </p>
          <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight text-cream-50 sm:text-7xl md:text-8xl">
            HANAWARI
          </h1>
          <p className="mt-5 font-display text-2xl italic text-gold-300 sm:text-3xl">
            Taste the Moto
          </p>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-cream-50/70 md:mx-0">
            Small-batch salsa, hand-blended in Kenya from fresh tomato, chili
            and herb — three heat levels, one unmistakable fire.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
            <a
              href="#shop"
              onClick={scrollToShop}
              className="group inline-flex items-center gap-2 rounded-full bg-ember-600 px-8 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-cream-50 shadow-[0_8px_30px_-8px_rgba(255,69,0,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Shop the collection
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>

        <div className="relative z-0 mx-auto flex h-[420px] w-[320px] items-center justify-center sm:h-[520px] sm:w-[400px] md:h-[600px] md:w-[460px]">
          <HeroJar pinTargetRef={sectionRef} />
        </div>
      </div>
    </section>
  );
}
