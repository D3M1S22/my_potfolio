import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { SubCube } from './SubCube';
import { SECTIONS_DATA } from '@/components/sections/sections-data';

/** 8 curated colors — one per sub-cube */
const CUBE_COLORS = [
  '#7c5cf7', // accent violet
  '#38bdf8', // cyan
  '#f472b6', // magenta/pink
  '#fbbf24', // gold
  '#34d399', // emerald
  '#fb923c', // orange
  '#a78bfa', // lavender
  '#f87171', // coral
];

interface ExplodingCubeSceneProps {
  progressRef: React.RefObject<number>;
}

/** Inner scene — reads scroll progress via useFrame */
const CubeGroup = ({ progressRef }: ExplodingCubeSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Slow auto-rotation that fades out as cubes explode
  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const progress = progressRef.current ?? 0;
    const rotationSpeed = Math.max(0, 1 - progress * 3); // Fades out by ~33% scroll
    groupRef.current.rotation.y += delta * 0.3 * rotationSpeed;
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1 * rotationSpeed;
  });

  return (
    <group ref={groupRef}>
      {CUBE_COLORS.map((color, index) => (
        <SubCube
          key={index}
          index={index}
          progressRef={progressRef}
          color={color}
          label={SECTIONS_DATA[index].title}
          size={0.48}
          gap={0.04}
        />
      ))}
    </group>
  );
};

interface ExplodingCubeProps {
  progressRef: React.RefObject<number>;
}

export const ExplodingCube = ({ progressRef }: ExplodingCubeProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeroVisible(window.scrollY < window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/*
        Event overlay — sits at the highest z-index to capture mouse events.
        Only active during hero section. R3F uses this as its event source,
        so pointer events hit this div first, then R3F raycasts into the scene.
      */}
      <div
        ref={wrapperRef}
        className="fixed inset-0 z-30"
        style={{
          pointerEvents: isHeroVisible ? 'auto' : 'none',
        }}
      />

      {/* Canvas container — behind everything visually, renders transparently */}
      <div
        className="fixed inset-0 z-0"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
          eventSource={wrapperRef as React.MutableRefObject<HTMLElement>}
          eventPrefix="client"
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1.2}
              castShadow={false}
            />
            <pointLight position={[-5, -3, 3]} intensity={0.6} color="#7c5cf7" />
            <pointLight position={[5, 3, -3]} intensity={0.4} color="#38bdf8" />

            {/* The exploding cube */}
            <CubeGroup progressRef={progressRef} />

            {/* Environment map for reflections */}
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
};
