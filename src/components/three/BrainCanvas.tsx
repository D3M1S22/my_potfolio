import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { DEVICE } from '@/lib/device';

interface BrainCanvasProps {
  children: ReactNode;
}

/**
 * The canvas renders on demand: a frame is drawn only when something changed
 * (scroll, resize, or an animation that asks for the next frame by calling
 * `invalidate()` from useFrame). When the brain is at rest the GPU is idle,
 * which keeps scrolling smooth on phones and saves battery.
 */
const ScrollInvalidator = () => {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const onChange = () => invalidate();
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange, { passive: true });
    return () => {
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [invalidate]);

  return null;
};

/**
 * Lowers the pixel ratio when the device can't keep up. drei's
 * PerformanceMonitor can't be used with on-demand rendering (idle gaps read as
 * low FPS), so this only measures back-to-back frames, i.e. real animation.
 */
const AdaptiveDpr = ({ onDecline }: { onDecline: () => void }) => {
  const samples = useRef({ time: 0, frames: 0, declined: false });

  useFrame((_, delta) => {
    const s = samples.current;
    if (s.declined || delta > 0.25) return; // gap between on-demand renders, not a slow frame
    s.time += delta;
    s.frames += 1;
    if (s.frames < 90) return;
    const fps = s.frames / s.time;
    s.time = 0;
    s.frames = 0;
    if (fps < 40) {
      s.declined = true;
      onDecline();
    }
  });

  return null;
};

/** Cheap, environment-map-free lighting (no HDR download, no PMREM pass). */
const Lights = () => (
  <>
    <ambientLight intensity={0.55} />
    <hemisphereLight args={['#ffffff', '#3b2a6b', 0.7]} />
    <directionalLight position={[4, 5, 6]} intensity={1.6} />
    <directionalLight position={[-5, 1, -4]} intensity={0.8} color="#38bdf8" />
    <directionalLight position={[0, -4, 3]} intensity={0.35} color="#f472b6" />
  </>
);

/**
 * Fixed, transparent WebGL layer behind the page, plus an event-capture
 * overlay that lets the scene receive hover/tap only while the hero is visible
 * (section cards stay fully interactive afterwards).
 */
export const BrainCanvas = ({ children }: BrainCanvasProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [heroActive, setHeroActive] = useState(true);
  const [maxDpr, setMaxDpr] = useState(DEVICE.maxDpr);

  useEffect(() => {
    const onScroll = () => setHeroActive(window.scrollY < window.innerHeight * 0.85);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-30"
        aria-hidden="true"
        style={{ pointerEvents: heroActive ? 'auto' : 'none', touchAction: 'pan-y' }}
      />

      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Canvas
          frameloop="demand"
          dpr={[1, maxDpr]}
          camera={{ position: [0, 0, 7], fov: 40, near: 0.1, far: 50 }}
          gl={{
            alpha: true,
            antialias: !DEVICE.isMobile && !DEVICE.isLowTier,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
          eventSource={overlayRef as React.MutableRefObject<HTMLElement>}
          eventPrefix="client"
        >
          {/* Drop to 1x pixel ratio if the device can't hold the frame rate */}
          <AdaptiveDpr onDecline={() => setMaxDpr(1)} />
          <ScrollInvalidator />
          <Lights />
          {children}
        </Canvas>
      </div>
    </>
  );
};
