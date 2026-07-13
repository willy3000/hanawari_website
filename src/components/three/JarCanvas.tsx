import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { JarModel, type ReadableValue } from "./JarModel";
import { JarGLTF } from "./JarGLTF";
import { useReducedMotion } from "@/lib/useReducedMotion";

export interface JarCanvasProps {
  labelColor: string;
  labelColorDark: string;
  scrollProgress?: ReadableValue;
  entryProgress?: ReadableValue;
  /** Hover-tilt driven by pointer position over the canvas itself (product cards). */
  interactive?: boolean;
  /** Tilt supplied by a parent that tracks pointer position over a larger area (e.g. the whole card). Overrides internal pointer tracking when set. */
  controlledTilt?: { x: number; y: number };
  /** Click-and-drag to spin the jar manually (hero). */
  draggable?: boolean;
  /** Slow continuous idle rotation so the jar never looks static (hero). */
  idleSpin?: boolean;
  baseRotation?: number;
  className?: string;
}

export function JarCanvas({
  labelColor,
  labelColorDark,
  scrollProgress,
  entryProgress,
  interactive = false,
  controlledTilt,
  draggable = false,
  idleSpin = false,
  baseRotation = 0.5,
  className,
}: JarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tiltTarget, setTiltTarget] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRotationValue = useRef(0);
  const dragRotationSource = useRef<ReadableValue>({ get: () => dragRotationValue.current });
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStartX.current;
      dragRotationValue.current = dragStartRotation.current + deltaX * 0.012;
      return;
    }
    if (!interactive || controlledTilt || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    setTiltTarget({ x: ny * 0.35, y: nx * 0.35 });
  };

  const handlePointerLeave = () => {
    if (interactive && !controlledTilt) setTiltTarget({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || reducedMotion) return;
    event.preventDefault();
    setIsDragging(true);
    dragStartX.current = event.clientX;
    dragStartRotation.current = dragRotationValue.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const effectiveTilt = controlledTilt ?? tiltTarget;

  return (
    <div
      ref={containerRef}
      className={className}
      style={
        draggable
          ? {
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "pan-y",
              userSelect: "none",
              WebkitUserSelect: "none",
            }
          : undefined
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop={reducedMotion ? "demand" : isVisible ? "always" : "never"}
        camera={{ position: [0, 0.35, 4.3], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 2]} intensity={1.5} castShadow />
        <directionalLight position={[-3, 1.2, -2]} intensity={0.4} color="#cd853f" />
        <pointLight position={[0, 2.2, -1.6]} intensity={0.6} color="#ff4500" />
        <Suspense
          fallback={
            <JarModel
              labelColor={labelColor}
              labelColorDark={labelColorDark}
              scrollProgress={reducedMotion ? undefined : scrollProgress}
              entryProgress={reducedMotion ? undefined : entryProgress}
              dragRotation={reducedMotion ? undefined : dragRotationSource.current}
              idleSpin={!reducedMotion && idleSpin}
              tiltTarget={reducedMotion ? undefined : effectiveTilt}
              animated={!reducedMotion}
              baseRotation={baseRotation}
            />
          }
        >
          <JarGLTF
            labelColor={labelColor}
            labelColorDark={labelColorDark}
            scrollProgress={reducedMotion ? undefined : scrollProgress}
            entryProgress={reducedMotion ? undefined : entryProgress}
            dragRotation={reducedMotion ? undefined : dragRotationSource.current}
            idleSpin={!reducedMotion && idleSpin}
            tiltTarget={reducedMotion ? undefined : effectiveTilt}
            animated={!reducedMotion}
            baseRotation={baseRotation}
          />
        </Suspense>
        <ContactShadows
          position={[0, -1.18, 0]}
          opacity={0.55}
          blur={2.4}
          far={2.2}
          scale={5}
          color="#0a0605"
        />
      </Canvas>
    </div>
  );
}
