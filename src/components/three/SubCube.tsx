import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubCubeProps {
  /** Index 0–7, maps to grid position and section */
  index: number;
  /** Accent colour for this cube and its tooltip */
  color: string;
  /** Section label shown in the tooltip */
  label: string;
  /** Side-length of each sub-cube in world units */
  size?: number;
  /** Gap between cubes in the assembled state */
  gap?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** 2×2×2 home offsets — each value is −1 or +1, scaled by halfStep */
const GRID_OFFSETS: [number, number, number][] = [
  [-1,  1,  1],  // 0 top-left-front
  [ 1,  1,  1],  // 1 top-right-front
  [-1, -1,  1],  // 2 bottom-left-front
  [ 1, -1,  1],  // 3 bottom-right-front
  [-1,  1, -1],  // 4 top-left-back
  [ 1,  1, -1],  // 5 top-right-back
  [-1, -1, -1],  // 6 bottom-left-back
  [ 1, -1, -1],  // 7 bottom-right-back
];

/**
 * Active (exploded) positions — opposite side of their content panel.
 * Even index = content is on LEFT  → cube lands on RIGHT (+x).
 * Odd  index = content is on RIGHT → cube lands on LEFT  (−x).
 * High z (2–3) puts them prominently in front of the scene.
 */
const EXPLODE_TARGETS: { x: number; y: number; z: number }[] = [
  {  x:  2.2,  y:  0.2, z: 1.5 }, // 0 About       left-panel  → cube right
  {  x: -2.2,  y:  0.1, z: 1.2 }, // 1 Skills      right-panel → cube left
  {  x:  2.0,  y: -0.1, z: 1.8 }, // 2 Projects    left-panel  → cube right
  {  x: -2.0,  y:  0.3, z: 1.4 }, // 3 Experience  right-panel → cube left
  {  x:  2.3,  y:  0.0, z: 1.3 }, // 4 Education   left-panel  → cube right
  {  x: -2.3,  y: -0.2, z: 1.5 }, // 5 Contact     right-panel → cube left
  {  x:  2.1,  y:  0.2, z: 2.0 }, // 6 Testimonials left-panel → cube right
  {  x: -2.1,  y: -0.1, z: 1.7 }, // 7 Social      right-panel → cube left
];

/** Exit destination — cubes dismiss to here when their section scrolls out */
const EXIT_OFFSET = { y: 6, z: -5, opacity: 0 } as const;

// ─── Component ────────────────────────────────────────────────────────────────

export const SubCube = ({ index, color, label, size = 0.48, gap = 0.04 }: SubCubeProps) => {
  const meshRef  = useRef<THREE.Mesh>(null);
  const matRef   = useRef<THREE.MeshStandardMaterial>(null);

  const [hovered,    setHovered]    = useState(false);
  const [isAssembled, setIsAssembled] = useState(true);

  // ── Derived geometry values ─────────────────────────────────────────────────

  /** World-space position inside the assembled 2×2×2 block */
  const homePosition = useMemo<[number, number, number]>(() => {
    const offset   = GRID_OFFSETS[index];
    const halfStep = (size + gap) / 2;
    return [offset[0] * halfStep, offset[1] * halfStep, offset[2] * halfStep];
  }, [index, size, gap]);

  const explodeTarget = EXPLODE_TARGETS[index];

  // ── GSAP 3-phase scroll animation ──────────────────────────────────────────
  //
  //  Three ScrollTriggers per cube:
  //   Phase 1 STANDBY  — hero exits   → opacity fades to 0
  //   Phase 2 ENTER    — section top  → cube flies to explode target, fades in
  //   Phase 3 EXIT     — section bot  → cube dismisses up/back, fades out
  //
  //  invalidateOnRefresh: true on every ST ensures positions recalculate
  //  correctly if the browser restores scroll position after a hard-refresh.
  useGSAP(() => {
    const mesh = meshRef.current;
    const mat  = matRef.current;
    if (!mesh || !mat) return;

    const heroEl    = document.getElementById('hero-spacer');
    const sectionEl = document.getElementById(`section-${index}`);
    if (!heroEl || !sectionEl) return;

    // Guarantee correct initial state regardless of scroll position on mount.
    // Without these, a hard-refresh mid-page leaves cubes invisible or misplaced.
    gsap.set(mat,          { opacity: 1 });
    gsap.set(mesh.position, { x: homePosition[0], y: homePosition[1], z: homePosition[2] });
    gsap.set(mesh.rotation, { x: 0, z: 0 });

    // Shared rotation values so enter and exit always agree
    const enterRotX = Math.PI * 0.25 * (index % 2 === 0 ?  1 : -1);
    const enterRotZ = Math.PI * 0.15 * (index % 2 === 0 ? -1 :  1);
    const exitRotX  = enterRotX + Math.PI * 0.5;

    // ── Phase 1 — STANDBY ───────────────────────────────────────────────────
    gsap.timeline({
      scrollTrigger: {
        trigger: heroEl,
        start: 'bottom 80%',
        end:   'bottom top',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    }).to(mat, { opacity: 0, ease: 'power1.in', duration: 1 });

    // ── Phase 2 — ENTER ─────────────────────────────────────────────────────
    // Use .to() for opacity (not fromTo) so it doesn't conflict with standby.
    // Use fromTo on position/rotation so GSAP always starts from home.
    gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 70%',
        end:   'top 15%',
        scrub: 1.2,
        invalidateOnRefresh: true,
        // markers: true,
      },
    })
      .to(mat, { opacity: 1, ease: 'power2.out', duration: 0.4 }, 0)
      .fromTo(
        mesh.position,
        { x: homePosition[0], y: homePosition[1], z: homePosition[2] },
        {
          x: explodeTarget.x, y: explodeTarget.y, z: explodeTarget.z,
          ease: 'power3.inOut', duration: 1,
          onStart:           () => setIsAssembled(false),
          onReverseComplete: () => setIsAssembled(true),
        },
        0,
      )
      .fromTo(
        mesh.rotation,
        { x: 0, z: 0 },
        { x: enterRotX, z: enterRotZ, ease: 'power2.inOut', duration: 1 },
        0,
      );

    // ── Phase 3 — EXIT ──────────────────────────────────────────────────────
    gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'bottom 70%',
        end:   'bottom 5%',
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    })
      .to(mesh.position, {
        y: explodeTarget.y + EXIT_OFFSET.y, z: EXIT_OFFSET.z,
        ease: 'power2.in', duration: 1,
      }, 0)
      .to(mesh.rotation, { x: exitRotX, ease: 'power2.in', duration: 1 }, 0)
      .to(mat, { opacity: 0, ease: 'power1.in', duration: 0.6 }, 0.4);

  }, [index, explodeTarget, homePosition]);


  // ── useFrame — micro-interactions only (no base-position writes) ───────────
  //
  //  GSAP owns mesh.position and mesh.rotation.x / .z.
  //  useFrame only touches:
  //    • scale   — hover swell
  //    • emissiveIntensity — hover glow
  //    • rotation.y + position.y float — only when cube is dismissed/active,
  //      using an ADDITIVE offset on top of GSAP's absolute value.
  //
  //  We store the float offset in a ref so it doesn't fight GSAP.

  const floatOffset = useRef({ y: 0, ry: 0 });

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const mat  = matRef.current;
    if (!mesh || !mat) return;

    const t = performance.now() * 0.001;

    // Hover scale — lerp toward target
    const scaleTarget = hovered && isAssembled ? 1.2 : 1.0;
    mesh.scale.setScalar(
      THREE.MathUtils.lerp(mesh.scale.x, scaleTarget, 1 - Math.pow(0.05, delta * 60)),
    );

    // Emissive glow — lerp toward target
    const glowTarget = hovered && isAssembled ? 0.4 : 0.0;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      glowTarget,
      1 - Math.pow(0.05, delta * 60),
    );

    // Gentle float when active (not assembled, not being exited by GSAP)
    // We add a tiny sinusoidal delta each frame and track it in floatOffset.
    // On the next frame GSAP doesn't override per-frame deltas because scrub
    // only fires on scroll events; between scrolls we freely float.
    if (!isAssembled) {
      const prevRy = floatOffset.current.ry;
      const newRy  = Math.sin(t * 0.8 + index * 1.1) * 0.12;
      mesh.rotation.y += newRy - prevRy;
      floatOffset.current.ry = newRy;

      const prevY  = floatOffset.current.y;
      const newY   = Math.sin(t * 0.6 + index * 0.7) * 0.04;
      mesh.position.y += newY - prevY;
      floatOffset.current.y = newY;
    } else {
      // Snap float offset back to zero when re-assembled so GSAP's reverse
      // isn't fighting a stale offset
      const prevRy = floatOffset.current.ry;
      mesh.rotation.y -= prevRy;
      floatOffset.current.ry = 0;

      const prevY = floatOffset.current.y;
      mesh.position.y -= prevY;
      floatOffset.current.y = 0;
    }
  });

  // ── Interaction handlers ────────────────────────────────────────────────────

  const handleClick = useCallback(() => {
    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
  }, [index]);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

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
        ref={matRef}
        color={color}
        metalness={0.7}
        roughness={0.15}
        envMapIntensity={1.2}
        emissive={color}
        emissiveIntensity={0}
        transparent={true}
        opacity={1}
      />

      {/* Tooltip — only while assembled and hovered */}
      {hovered && isAssembled && (
        <Html
          center
          distanceFactor={5}
          position={[0, size * 1.4, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-mono font-semibold
                        tracking-wider uppercase"
            style={{
              background:    'hsla(225, 25%, 8%, 0.92)',
              backdropFilter:'blur(16px)',
              border:        `1px solid ${color}55`,
              color,
              boxShadow:     `0 0 24px ${color}35, 0 8px 24px rgba(0,0,0,0.6)`,
              transform:     'translateY(-12px)',
            }}
          >
            {label}
            {/* Arrow */}
            <span
              aria-hidden="true"
              style={{
                position:    'absolute',
                bottom:      '-5px',
                left:        '50%',
                transform:   'translateX(-50%) rotate(45deg)',
                width:       '8px',
                height:      '8px',
                background:  'hsla(225, 25%, 8%, 0.92)',
                borderRight: `1px solid ${color}55`,
                borderBottom:`1px solid ${color}55`,
              }}
            />
          </div>
        </Html>
      )}
    </mesh>
  );
};
