import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

// Fix iOS Safari address bar layout thrashing and scroll stuttering
ScrollTrigger.normalizeScroll(true);

interface SmoothScrollProps {
  children: ReactNode;
}

export const SmoothScroll = ({ children }: SmoothScrollProps) => {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Users who ask for reduced motion get native, un-eased scrolling.
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.5, // heavier, slower maximum speed
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.7,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Keep a stable reference so cleanup actually removes the ticker callback.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
};
