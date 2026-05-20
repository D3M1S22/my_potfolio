import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SubCubeProps {
  /** Index 0–7, determines position in the 2×2×2 grid */
  index: number;
  /** Scroll progress ref (0..1) */
  progressRef: React.RefObject<number>;
  /** Color for this cube */
  color: string;
  /** Label for the tooltip (section name) */
  label: string;
  /** Size of each sub-cube */
  size?: number;
  /** Gap between cubes in the assembled state */
  gap?: number;
}

/** Positions for each of the 8 cubes in a 2×2×2 grid (centered at origin) */
const GRID_OFFSETS: [number, number, number][] = [
  [-1, 1, 1],   // 0: top-left-front
  [1, 1, 1],    // 1: top-right-front
  [-1, -1, 1],  // 2: bottom-left-front
  [1, -1, 1],   // 3: bottom-right-front
  [-1, 1, -1],  // 4: top-left-back
  [1, 1, -1],   // 5: top-right-back
  [-1, -1, -1], // 6: bottom-left-back
  [1, -1, -1],  // 7: bottom-right-back
];

/**
 * Exploded positions — cubes go to the OPPOSITE side of their content panel.
 * Even indices (content LEFT) → cube goes RIGHT (+x)
 * Odd indices (content RIGHT) → cube goes LEFT (-x)
 * Positioned closer to camera (z ~2–3) and vertically centered
 * for a prominent "companion" look next to the content.
 */
const EXPLODE_TARGETS: [number, number, number][] = [
  [3.5, 0.3, 2.5],   // 0: About (content left → cube right)
  [-3.5, 0.2, 2.0],  // 1: Skills (content right → cube left)
  [3.3, -0.2, 2.8],  // 2: Projects (content left → cube right)
  [-3.3, 0.5, 2.2],  // 3: Experience (content right → cube left)
  [3.7, 0.0, 2.3],   // 4: Education (content left → cube right)
  [-3.7, -0.3, 2.5], // 5: Contact (content right → cube left)
  [3.0, 0.4, 3.0],   // 6: Testimonials (content left → cube right)
  [-3.0, -0.1, 2.7], // 7: Social (content right → cube left)
];

/** Each cube explodes during its own scroll segment */
const getExplodeRange = (index: number): [number, number] => {
  const segmentSize = 1 / 9; // 9 total sections (hero + 8 cubes)
  const start = (index + 1) * segmentSize;
  const end = start + segmentSize;
  return [start, end];
};

/** Smooth step function for easing */
const smoothStep = (t: number): number => {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
};

export const SubCube = ({ index, progressRef, color, label, size = 0.48, gap = 0.02 }: SubCubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [isAssembled, setIsAssembled] = useState(true);

  const homePosition = useMemo(() => {
    const offset = GRID_OFFSETS[index];
    const halfStep = (size + gap) / 2;
    return new THREE.Vector3(
      offset[0] * halfStep,
      offset[1] * halfStep,
      offset[2] * halfStep,
    );
  }, [index, size, gap]);

  const explodePosition = useMemo(() => {
    const target = EXPLODE_TARGETS[index];
    return new THREE.Vector3(target[0], target[1], target[2]);
  }, [index]);

  const [rangeStart, rangeEnd] = useMemo(() => getExplodeRange(index), [index]);

  const tempVec = useMemo(() => new THREE.Vector3(), []);

  // Click handler — scroll to the corresponding section
  const handleClick = useCallback(() => {
    const section = document.getElementById(`section-${index}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, [index]);

  // Hover handlers
  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;
    const progress = progressRef.current ?? 0;

    // Calculate local progress for this cube's explosion
    let localProgress = 0;
    if (progress >= rangeStart) {
      localProgress = Math.min((progress - rangeStart) / (rangeEnd - rangeStart), 1);
    }
    const easedProgress = smoothStep(localProgress);

    // Track whether cube is still in assembled form
    const assembled = localProgress < 0.05;
    if (assembled !== isAssembled) {
      setIsAssembled(assembled);
    }

    // Lerp position from home to explode target
    tempVec.lerpVectors(homePosition, explodePosition, easedProgress);
    meshRef.current.position.copy(tempVec);

    // Hover scale effect (only when assembled)
    const targetScale = hovered && assembled ? 1.2 : 1.0;
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.12);
    meshRef.current.scale.setScalar(newScale);

    // Emissive glow on hover
    const targetEmissive = hovered && assembled ? 0.35 : 0;
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      materialRef.current.emissiveIntensity,
      targetEmissive,
      0.12,
    );

    // Opacity: fade out cubes that haven't exploded yet but are past the hero
    // This prevents the cluster from overlapping content panels
    const heroProgress = progress * 9; // 0..9 scale
    const cubeSection = index + 1;
    if (heroProgress > 0.5 && heroProgress < cubeSection) {
      // Cube hasn't exploded yet, but we've scrolled past hero — fade it
      const fadeAmount = Math.min((heroProgress - 0.5) / 0.5, 1);
      materialRef.current.opacity = THREE.MathUtils.lerp(1, 0.08, fadeAmount);
      materialRef.current.transparent = true;
    } else {
      materialRef.current.opacity = 1;
      materialRef.current.transparent = false;
    }

    // Add subtle rotation during explosion + gentle float when at exploded position
    if (easedProgress > 0) {
      meshRef.current.rotation.x = easedProgress * Math.PI * 0.3;
      meshRef.current.rotation.z = easedProgress * Math.PI * 0.2 * (index % 2 === 0 ? 1 : -1);
      // Gentle floating at rest
      if (localProgress >= 1) {
        meshRef.current.rotation.y = Math.sin(Date.now() * 0.001 + index) * 0.15;
        meshRef.current.position.y += Math.sin(Date.now() * 0.0008 + index * 0.5) * 0.02;
      }
    } else {
      meshRef.current.rotation.x = 0;
      meshRef.current.rotation.z = 0;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={homePosition}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        metalness={0.7}
        roughness={0.15}
        envMapIntensity={1.2}
        emissive={color}
        emissiveIntensity={0}
      />

      {/* Tooltip — visible on hover when cube is assembled */}
      {hovered && isAssembled && (
        <Html
          center
          distanceFactor={5}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          position={[0, size * 1.2, 0]}
        >
          <div
            className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-mono font-medium
                        tracking-wider uppercase animate-fade-in"
            style={{
              background: 'hsla(225, 25%, 8%, 0.92)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${color}50`,
              color: color,
              boxShadow: `0 0 24px ${color}30, 0 8px 24px rgba(0,0,0,0.5)`,
              transform: 'translateY(-16px)',
            }}
          >
            {label}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45"
              style={{
                background: 'hsla(225, 25%, 8%, 0.92)',
                borderRight: `1px solid ${color}50`,
                borderBottom: `1px solid ${color}50`,
              }}
            />
          </div>
        </Html>
      )}
    </mesh>
  );
};
