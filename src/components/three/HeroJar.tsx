import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JarCanvas } from "./JarCanvas";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface HeroJarProps {
  pinTargetRef: RefObject<HTMLElement | null>;
}

/**
 * The jar is visible and gently animating (idle spin, drag-to-inspect) from
 * first paint. Scrolling adds an Apple-style pinned reveal on top: the hero
 * holds in place for a scroll distance while `progress` (0 -> 1) drives extra
 * rotation/scale in JarModel/JarGLTF.
 */
export function HeroJar({ pinTargetRef }: HeroJarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const scrollProgressSource = useRef({ get: () => progressRef.current });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!wrapperRef.current) return;

    if (!reducedMotion) {
      // y-only: the placeholder overlay lives inside this wrapper, so fading
      // the wrapper would blink it out during the dynamic-import handoff.
      gsap.fromTo(
        wrapperRef.current,
        { y: 24 },
        { y: 0, duration: 0.9, ease: "power2.out", delay: 0.15 }
      );
    }

    if (reducedMotion || !pinTargetRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: pinTargetRef.current,
        start: "top top",
        end: "+=100%",
        scrub: 0.6,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
      return () => trigger.kill();
    });

    return () => ctx.revert();
  }, [pinTargetRef, reducedMotion]);

  return (
    <div ref={wrapperRef} className="h-full w-full opacity-100">
      <JarCanvas
        labelColor="#ff4500"
        labelColorDark="#8b4513"
        scrollProgress={reducedMotion ? undefined : scrollProgressSource.current}
        baseRotation={0.5}
        idleSpin
        draggable
        className="h-full w-full"
      />
    </div>
  );
}
