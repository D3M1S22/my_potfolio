import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { SubCube } from './SubCube';
import { SECTIONS_DATA } from '@/components/sections/sections-data';

gsap.registerPlugin(ScrollTrigger);

// ─── Cube palette — one colour per sub-cube / section ────────────────────────

const CUBE_COLORS = [
  '#7c5cf7', // 0 About       — violet
  '#38bdf8', // 1 Skills      — cyan
  '#f472b6', // 2 Projects    — pink
  '#fbbf24', // 3 Experience  — gold
  '#34d399', // 4 Education   — emerald
  '#fb923c', // 5 Contact     — orange
  '#a78bfa', // 6 Testimonials— lavender
  '#f87171', // 7 Social      — coral
];

// ─── CubeGroup ────────────────────────────────────────────────────────────────
//
// Owns the global slow rotation of the assembled cube.
// A GSAP ScrollTrigger (bound to the hero spacer #top) fades the rotation
// speed to zero as the hero leaves, so the cluster cleanly stops spinning
// before the first cube explodes. useFrame reads a simple speed ref — no
// progressRef maths needed.

const CubeGroup = () => {
  const groupRef    = useRef<THREE.Group>(null);
  const speedRef    = useRef(1); // 1 = full speed, 0 = stopped

  // GSAP ScrollTrigger: fade out the global rotation speed AND snap rotation to 0
  useGSAP(() => {
    const heroEl = document.getElementById('hero-spacer');
    if (!heroEl) return;

    const group = groupRef.current;
    if (!group) return;

    // Fade speed to 0 — stops the useFrame from adding more rotation
    gsap.to(speedRef, {
      current: 0,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: heroEl,
        start: 'top top',
        end:   'bottom top',
        scrub: true,
      },
    });

    // Simultaneously tween the group's rotation back to 0 so that by the
    // time any SubCube starts flying to its explode target the group
    // transform is identity — guaranteeing +x = right, -x = left on screen.
    gsap.to(group.rotation, {
      y: 0,
      x: 0,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: heroEl,
        start: 'bottom 90%',  // start snapping near end of hero
        end:   'bottom top',  // fully zeroed by the time hero is off screen
        scrub: true,
      },
    });
  }, []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const speed = speedRef.current;
    if (speed <= 0) return;

    groupRef.current.rotation.y += delta * 0.35 * speed;
    groupRef.current.rotation.x  =
      Math.sin(performance.now() * 0.0003) * 0.12 * speed;
  });

  return (
    <group ref={groupRef}>
      {CUBE_COLORS.map((color, i) => (
        <SubCube
          key={i}
          index={i}
          color={color}
          label={SECTIONS_DATA[i].title}
          size={0.48}
          gap={0.04}
        />
      ))}
    </group>
  );
};

// ─── ExplodingCube (Canvas shell) ─────────────────────────────────────────────

export const ExplodingCube = () => {
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const [heroActive, setHeroActive] = useState(true);

  // Enable the event-capture overlay only while in the hero section so the
  // canvas intercepts hover / click for cube interaction. Once scrolled past
  // the hero the overlay is removed so section panels are fully interactive.
  useEffect(() => {
    const onScroll = () =>
      setHeroActive(window.scrollY < window.innerHeight * 0.85);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/*
        Transparent event-capture overlay.
        R3F uses this div as its eventSource, meaning pointer events registered
        here are raycasted into the 3D scene even though the <canvas> element
        sits behind the DOM overlay stack. Only active in the hero section.
      */}
      <div
        ref={wrapperRef}
        className="fixed inset-0 z-30"
        aria-hidden="true"
        style={{ pointerEvents: heroActive ? 'auto' : 'none' }}
      />

      {/* Canvas — transparent, behind everything visually */}
      <div
        className="fixed inset-0 z-0"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      >
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
          eventSource={wrapperRef as React.MutableRefObject<HTMLElement>}
          eventPrefix="client"
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <pointLight position={[-5, -3, 3]} intensity={0.6} color="#7c5cf7" />
            <pointLight position={[ 5,  3, -3]} intensity={0.4} color="#38bdf8" />

            <CubeGroup />

            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
};
