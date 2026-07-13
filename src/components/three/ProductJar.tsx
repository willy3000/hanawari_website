import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { JarCanvas } from "./JarCanvas";
import type { Product } from "@/types";

interface ProductJarProps {
  product: Product;
  /** Tilt driven by pointer position over the whole card, not just the canvas. */
  tilt?: { x: number; y: number };
  className?: string;
}

export function ProductJar({ product, tilt, className }: ProductJarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, { stiffness: 50, damping: 14 });

  useEffect(() => {
    if (inView) progress.set(1);
  }, [inView, progress]);

  return (
    <div ref={ref} className={className}>
      <JarCanvas
        labelColor={product.labelColor}
        labelColorDark={product.labelColorDark}
        entryProgress={smoothProgress}
        interactive
        controlledTilt={tilt}
        baseRotation={0.4}
        className="h-full w-full"
      />
    </div>
  );
}
