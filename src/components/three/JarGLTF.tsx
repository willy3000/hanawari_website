import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import type { ReadableValue } from "./JarModel";

const MODEL_PATH = "/assets/3D/jar.glb";
useGLTF.preload(MODEL_PATH);

/** Material names baked into jar.glb: PaleRed = label band, Brown = lid, LightYellow = jar body/glass. */
const LABEL_MATERIAL = "PaleRed";
const LID_MATERIAL = "Brown";

const EXTRA_SPINS = Math.PI * 2 * 1.5;
const SCROLL_ROTATION_RANGE = Math.PI * 1.9;
const IDLE_SPIN_SPEED = 0.1;
const BASE_TILT_X = -0.05;
const BASE_TILT_Z = 0.04;
const TARGET_HEIGHT = 2;

export interface JarGLTFProps {
  labelColor: string;
  labelColorDark: string;
  scrollProgress?: ReadableValue;
  entryProgress?: ReadableValue;
  dragRotation?: ReadableValue;
  idleSpin?: boolean;
  tiltTarget?: { x: number; y: number };
  animated?: boolean;
  baseRotation?: number;
  /** Admin-uploaded per-product model; defaults to the bundled jar. */
  modelUrl?: string;
}

export function JarGLTF({
  labelColor,
  labelColorDark,
  scrollProgress,
  entryProgress,
  dragRotation,
  idleSpin = false,
  tiltTarget,
  animated = true,
  baseRotation = 0.5,
  modelUrl,
}: JarGLTFProps) {
  // Custom models won't have the jar's named materials — the normalize/center
  // logic below is generic, and the tinting simply doesn't match, so any
  // .glb/.gltf renders as authored.
  const { scene } = useGLTF(modelUrl || MODEL_PATH);
  const groupRef = useRef<Group>(null);
  const tiltX = useRef(BASE_TILT_X);
  const tiltZ = useRef(BASE_TILT_Z);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    let box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Some exporters (e.g. trimesh) write Z-up geometry with no corrective
    // rotation, but glTF/three.js are Y-up — the jar arrives lying on its
    // side. If the longest axis is Z, stand it upright before normalizing,
    // otherwise the height-based scale below blows the width out instead.
    if (size.z > size.y && size.z >= size.x) {
      clone.rotation.x = -Math.PI / 2;
      clone.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(clone);
      box.getSize(size);
    }

    const center = new THREE.Vector3();
    box.getCenter(center);

    const scale = TARGET_HEIGHT / Math.max(size.y, 0.0001);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

    clone.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const material = mesh.material as MeshStandardMaterial | undefined;
      if (!material) return;
      const tinted = material.clone();
      if (material.name === LABEL_MATERIAL) {
        tinted.color.set(labelColor);
      } else if (material.name === LID_MATERIAL) {
        tinted.color.set(labelColorDark);
      }
      mesh.material = tinted;
    });

    return clone;
  }, [scene, labelColor, labelColorDark]);

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
      group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, 0.15));
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
    <group ref={groupRef} position={[0, -1.05, 0]}>
      <primitive object={model} />
    </group>
  );
}
