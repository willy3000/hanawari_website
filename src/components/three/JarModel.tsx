import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, MathUtils, type Group } from "three";

/** Duck-typed so either a framer-motion MotionValue or a plain GSAP-driven ref satisfies it. */
export interface ReadableValue {
  get(): number;
}

export interface JarModelProps {
  labelColor: string;
  labelColorDark: string;
  /** 0 -> 1 hero pin-scroll progress; drives continuous rotation and a subtle "grow toward camera" scale, hero jar only. */
  scrollProgress?: ReadableValue;
  /** 0 -> 1 settle-in progress; jar spins down from a few extra turns to rest, product cards only. */
  entryProgress?: ReadableValue;
  /** User drag-to-rotate offset in radians, additive. */
  dragRotation?: ReadableValue;
  /** Slow continuous idle auto-rotation, hero only. */
  idleSpin?: boolean;
  /** Pointer-driven tilt target, lerped toward each frame for a spring feel. */
  tiltTarget?: { x: number; y: number };
  animated?: boolean;
  baseRotation?: number;
}

const EXTRA_SPINS = Math.PI * 2 * 1.5;
const SCROLL_ROTATION_RANGE = Math.PI * 1.9;
const IDLE_SPIN_SPEED = 0.1;
const BASE_TILT_X = -0.05;
const BASE_TILT_Z = 0.04;

export function JarModel({
  labelColor,
  labelColorDark,
  scrollProgress,
  entryProgress,
  dragRotation,
  idleSpin = false,
  tiltTarget,
  animated = true,
  baseRotation = 0.5,
}: JarModelProps) {
  const groupRef = useRef<Group>(null);
  const tiltX = useRef(BASE_TILT_X);
  const tiltZ = useRef(BASE_TILT_Z);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const progress = scrollProgress?.get() ?? 0;
    const settle = entryProgress?.get() ?? 1;
    const spinOffset = (1 - settle) * EXTRA_SPINS;
    const idleOffset = idleSpin ? state.clock.elapsedTime * IDLE_SPIN_SPEED : 0;
    const dragOffset = dragRotation?.get() ?? 0;

    group.rotation.y =
      baseRotation + progress * SCROLL_ROTATION_RANGE + spinOffset + idleOffset + dragOffset;

    if (scrollProgress) {
      const targetScale = 0.94 + progress * 0.12;
      group.scale.setScalar(MathUtils.lerp(group.scale.x, targetScale, 0.15));
    }

    if (animated) {
      const targetX = BASE_TILT_X + (tiltTarget?.x ?? 0);
      const targetZ = BASE_TILT_Z + (tiltTarget?.y ?? 0);
      tiltX.current += (targetX - tiltX.current) * 0.08;
      tiltZ.current += (targetZ - tiltZ.current) * 0.08;
      group.rotation.x = tiltX.current;
      group.rotation.z = tiltZ.current;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.86, 0.96, 1.9, 48]} />
        <meshPhysicalMaterial
          color="#33210f"
          roughness={0.18}
          transmission={0.5}
          thickness={0.7}
          ior={1.4}
          clearcoat={0.35}
        />
      </mesh>

      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.99, 0.99, 0.86, 48, 1, true]} />
        <meshStandardMaterial
          color={labelColor}
          roughness={0.42}
          metalness={0.06}
          side={DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.97, 0]} castShadow>
        <cylinderGeometry args={[0.63, 0.7, 0.32, 48]} />
        <meshStandardMaterial color={labelColorDark} roughness={0.32} metalness={0.55} />
      </mesh>

      <mesh position={[0, 1.135, 0]}>
        <cylinderGeometry args={[0.635, 0.635, 0.03, 48]} />
        <meshStandardMaterial color="#170f0a" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  );
}
