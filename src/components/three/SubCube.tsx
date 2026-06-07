import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
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

// ─── Component ────────────────────────────────────────────────────────────────

export const SubCube = ({ index, color, label, size = 0.48, gap = 0.04 }: SubCubeProps) => {
  const meshRef  = useRef<THREE.Mesh>(null);
  const matRef   = useRef<THREE.MeshStandardMaterial>(null);

  const [hovered,    setHovered]    = useState(false);
  const [isAssembled, setIsAssembled] = useState(true);
  const [renderTooltips, setRenderTooltips] = useState(true);

  // ── Derived geometry and responsiveness ─────────────────────────────────────

  const { width, height } = useThree((state) => state.viewport);
  const isMobile = width < 5.0 || (width / height) < 1.0;
  const direction = index % 2 === 0 ? 'left' : 'right';

  /** World-space position inside the assembled 2×2×2 block */
  const homePosition = useMemo<[number, number, number]>(() => {
    const offset   = GRID_OFFSETS[index];
    const halfStep = (size + gap) / 2;
    return [offset[0] * halfStep, offset[1] * halfStep, offset[2] * halfStep];
  }, [index, size, gap]);

  /** Responsive dynamic target coordinates */
  const explodeTarget = useMemo(() => {
    const targetX = isMobile
      ? 0
      : (direction === 'left' ? width * 0.22 : -width * 0.22);

    const targetY = isMobile
      ? height * 0.22
      : 0;

    const targetZ = isMobile ? 0.8 : 1.5;

    return { x: targetX, y: targetY, z: targetZ };
  }, [width, height, isMobile, direction, index]);

  /** Explode outward off-screen target coordinates for Phase 1 (Standby) */
  const offscreenTarget = useMemo(() => {
    const vector = GRID_OFFSETS[index];
    const factorX = width * 1.5;
    const factorY = height * 1.5;
    const factorZ = 4.0;
    return {
      x: vector[0] * factorX,
      y: vector[1] * factorY,
      z: vector[2] * factorZ
    };
  }, [index, width, height]);

  /** Radiating blueprint tooltip positions around the assembled 2x2x2 cluster */
  const tooltipPosition = useMemo<[number, number, number]>(() => {
    const offset = GRID_OFFSETS[index];
    const factorX = size * 1.8;
    const factorY = size * 1.8;
    const factorZ = size * 1.2;
    return [offset[0] * factorX, offset[1] * factorY, offset[2] * factorZ];
  }, [index, size]);

  // ── Reference Tracking for GSAP ─────────────────────────────────────────────
  // We decouple GSAP's timeline from React's render cycle so that resizing the 
  // window doesn't destroy the timeline and force the cubes back to (0,0,0).
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const isMobileRef = useRef(isMobile);
  const directionRef = useRef(direction);
  const targetRef = useRef(explodeTarget);
  const offscreenRef = useRef(offscreenTarget);

  widthRef.current = width;
  heightRef.current = height;
  isMobileRef.current = isMobile;
  directionRef.current = direction;
  targetRef.current = explodeTarget;
  offscreenRef.current = offscreenTarget;

  // Fade out tooltips smoothly before unmounting
  useEffect(() => {
    if (isAssembled) {
      setRenderTooltips(true);
    } else {
      const timer = setTimeout(() => setRenderTooltips(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isAssembled]);

  // ── GSAP 3-phase scroll animation ──────────────────────────────────────────

  useGSAP(() => {
    const mesh = meshRef.current;
    const mat  = matRef.current;
    if (!mesh || !mat) return;

    const heroEl    = document.getElementById('hero-spacer');
    const sectionEl = document.getElementById(`section-${index}`);
    if (!heroEl || !sectionEl) return;

    // Reset initial states before timeline starts.
    gsap.set(mat,          { opacity: 1 });
    gsap.set(mesh.position, { x: homePosition[0], y: homePosition[1], z: homePosition[2] });
    gsap.set(mesh.rotation, { x: 0, y: 0, z: 0 });
    gsap.set(mesh.scale,    { x: 1, y: 1, z: 1 });

    const enterRotX = Math.PI * 0.25 * (index % 2 === 0 ?  1 : -1);
    const enterRotY = Math.PI * 0.3 * (index % 2 === 0 ? -1 :  1);
    const enterRotZ = Math.PI * 0.15 * (index % 2 === 0 ? -1 :  1);
    const exitRotX  = enterRotX + Math.PI * 0.5;

    // ── Phase 1 — STANDBY (Supernova Explode Outwards Off-screen) ────────────
    gsap.timeline({
      scrollTrigger: {
        trigger: heroEl,
        start: '30% top', // Start after name has disappeared
        end:   '70% top', // Finish well before Phase 2 begins
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
      .to(mesh.rotation, {
        x: () => Math.random() * Math.PI * 4,
        y: () => Math.random() * Math.PI * 4,
        z: () => Math.random() * Math.PI * 4,
        ease: 'none',
        duration: 1,
      }, 0)
      .to(mesh.position, {
        x: () => offscreenRef.current.x,
        y: () => offscreenRef.current.y,
        z: () => offscreenRef.current.z,
        ease: 'none',
        duration: 1,
      }, 0)
      .to(mat, { opacity: 0, ease: 'none', duration: 1 }, 0.2);

    // ── Phase 2 — ENTER (Sweeping Curved Pathway from Middle-Outside) ────────
    const getEnterStartX = () => isMobileRef.current ? 0 : (directionRef.current === 'left' ? widthRef.current * 0.8 : -widthRef.current * 0.8);
    const getEnterStartY = () => isMobileRef.current ? heightRef.current * 0.8 : 0;
    const enterStartZ = -6.0;

    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 85%',
        end: 'bottom 5%',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    mainTl
      // ── Phase 2: Enter (Duration: 28) ──
      .fromTo(mat, { opacity: 0 }, { opacity: 1, ease: 'power2.out', duration: 10, immediateRender: false }, 0)
      .fromTo(
        mesh.position,
        { x: getEnterStartX, y: getEnterStartY, z: enterStartZ },
        { x: () => targetRef.current.x, ease: 'power2.out', duration: 28, immediateRender: false },
        0
      )
      .to(mesh.position, { y: () => targetRef.current.y, z: () => targetRef.current.z, ease: 'power1.inOut', duration: 28 }, 0)
      .fromTo(
        mesh.rotation,
        { x: 0, y: 0, z: 0 },
        { x: enterRotX, y: enterRotY, z: enterRotZ, ease: 'sine.inOut', duration: 28, immediateRender: false },
        0
      )
      .fromTo(
        mesh.scale,
        { x: 1, y: 1, z: 1 },
        { x: 1.15, y: 0.85, z: 1.15, ease: 'sine.inOut', duration: 14, immediateRender: false },
        0
      )
      .to(mesh.scale, { x: 1.0, y: 1.0, z: 1.0, ease: 'back.out(1.5)', duration: 14 }, 14)
      
      // ── Hold (Duration: 36) implicitly defined by delay before Phase 3 ──
      
      // ── Phase 3: Exit (Starts at 64, Duration: 36) ──
      .to(mesh.position, { z: 3.5, ease: 'power1.inOut', duration: 18 }, 64)
      .to(
        mesh.position,
        { x: () => directionRef.current === 'left' ? widthRef.current * 1.2 : -widthRef.current * 1.2, y: () => -heightRef.current * 0.2, z: 5.0, ease: 'power2.in', duration: 18 },
        82
      )
      .to(mesh.rotation, { x: exitRotX, y: enterRotY * 1.5, z: enterRotZ * 1.5, ease: 'power2.in', duration: 36 }, 64)
      .to(mat, { opacity: 0, ease: 'power1.in', duration: 15 }, 85);

  }, [index, homePosition]); // Decoupled from viewport variables!

  // ── useFrame — dynamic organic states ───────────────────────────────────────

  const floatOffset  = useRef({ y: 0, ry: 0 });
  const breathOffset = useRef({ x: 0, y: 0, z: 0 });
  const assemblyWeight = useRef(1);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const mat  = matRef.current;
    if (!mesh || !mat) return;

    const t = performance.now() * 0.001;

    // Force assembly near top of page to prevent GSAP backwards-scroll race conditions
    const scrollY = window.scrollY || 0;
    const isAtTop = scrollY < window.innerHeight * 0.2;
    if (isAtTop !== isAssembled) {
      setIsAssembled(isAtTop);
    }

    // Emissive glow — lerp toward target
    const glowTarget = hovered && isAssembled ? 0.5 : 0.0;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      glowTarget,
      1 - Math.pow(0.05, delta * 60),
    );

    // Smooth weight between Assembled (1) and Disassembled (0)
    // We use a quick lerp so the transition takes a fraction of a second, preventing any instant snaps.
    const weightTarget = isAssembled ? 1 : 0;
    assemblyWeight.current = THREE.MathUtils.lerp(
      assemblyWeight.current,
      weightTarget,
      1 - Math.pow(0.01, delta * 60)
    );
    const w = assemblyWeight.current;

    // Instant snap recovery if teleported away by extreme scrolling while assembled
    if (w > 0.9) {
      const basePos = new THREE.Vector3(homePosition[0], homePosition[1], homePosition[2]);
      if (mesh.position.distanceTo(basePos) > 2.0) {
        mesh.position.copy(basePos);
        breathOffset.current = { x: 0, y: 0, z: 0 };
        floatOffset.current = { y: 0, ry: 0 };
      }
    }

    // 1. Calculate raw "Assembled" breathing offsets
    const breathTime = performance.now() * 0.0015;
    const breath = Math.sin(breathTime * 2.0 + index * 0.8) * 0.025;
    const rawBreathX = homePosition[0] * breath;
    const rawBreathY = homePosition[1] * breath;
    const rawBreathZ = homePosition[2] * breath;

    // 2. Calculate raw "Disassembled" floating offsets
    const rawRy = Math.sin(t * 0.8 + index * 1.1) * 0.15;
    const rawFloatY = Math.sin(t * 0.6 + index * 0.7) * 0.05 + Math.cos(t * 1.2 + index * 1.3) * 0.02;

    // 3. Blend them using the continuous weight 'w'
    const targetOffsetX = rawBreathX * w;
    const targetOffsetY = rawBreathY * w + rawFloatY * (1 - w);
    const targetOffsetZ = rawBreathZ * w;
    const targetOffsetRy = rawRy * (1 - w);

    // Apply additive DELTAs to mesh to ensure GSAP is not overridden
    mesh.position.x += targetOffsetX - breathOffset.current.x;
    mesh.position.y += targetOffsetY - breathOffset.current.y;
    mesh.position.z += targetOffsetZ - breathOffset.current.z;
    mesh.rotation.y += targetOffsetRy - floatOffset.current.ry;

    // Save current applied offsets to calculate deltas next frame
    breathOffset.current.x = targetOffsetX;
    breathOffset.current.y = targetOffsetY;
    breathOffset.current.z = targetOffsetZ;
    floatOffset.current.ry = targetOffsetRy;

    // 4. Smooth scale blending
    // Only enforce scale if assembled or hovered. 
    // If disassembled (w < 0.01) and not hovered, we allow GSAP to freely animate the scale without fighting it.
    if (w > 0.01 || hovered) {
      const breathScale = 1.0 + Math.sin(breathTime * 3.0 + index * 0.5) * 0.04;
      const baseScale = w * breathScale + (1 - w) * 1.0;
      const finalScaleTarget = hovered ? 1.25 : baseScale;
      
      mesh.scale.setScalar(
        THREE.MathUtils.lerp(mesh.scale.x, finalScaleTarget, 1 - Math.pow(0.05, delta * 60))
      );
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
    <RoundedBox
      ref={meshRef as any}
      args={[size, size, size]}
      radius={0.08}
      smoothness={4}
      position={homePosition}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
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

      {/* Blueprint Diagram Tooltips — fade out gracefully before unmounting */}
      {renderTooltips && (
        <Html
          center
          distanceFactor={4.5}
          position={tooltipPosition}
          occlude
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            className="whitespace-nowrap px-3 py-1.5 rounded-xl text-[10px] font-mono font-semibold
                        tracking-wider uppercase transition-all duration-200 relative"
            style={{
              background:    hovered ? 'hsla(225, 25%, 8%, 0.85)' : 'transparent',
              backdropFilter:hovered ? 'blur(12px)' : 'none',
              border:        `1px solid ${hovered ? color : 'transparent'}`,
              color:         hovered ? '#ffffff' : color,
              boxShadow:     hovered 
                ? `0 0 20px ${color}66, 0 4px 12px rgba(0,0,0,0.5)`
                : 'none',
              transform:     hovered ? 'scale(1.1)' : 'scale(1)',
              opacity:       isAssembled ? 0.9 : 0,
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </RoundedBox>
  );
};

