import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { DEVICE } from '@/lib/device';
import { SCROLL_LOCK_EVENT } from '@/lib/scroll-lock';

gsap.registerPlugin(ScrollTrigger);

// Mobile browser toolbars resize the viewport while scrolling; don't recalculate
// every trigger when that happens (layout uses svh units, which don't change).
ScrollTrigger.config({ ignoreMobileResize: true });

// iOS Safari needs JS-normalised scrolling to stop address-bar layout jumps.
// Elsewhere native touch scrolling is smoother, so leave it alone.
if (DEVICE.isIOS) ScrollTrigger.normalizeScroll(true);

interface SmoothScrollProps {
  children: ReactNode;
}

export const SmoothScroll = ({ children }: SmoothScrollProps) => {
  const reducedMotion = usePrefersReducedMotion();

  // Pause scroll hijacking while a modal locks the page
  useEffect(() => {
    const onLock = (e: Event) => {
      const locked = (e as CustomEvent<boolean>).detail;
      if (DEVICE.isIOS) ScrollTrigger.normalizeScroll(!locked);
      window.dispatchEvent(new CustomEvent(locked ? 'lenis:stop' : 'lenis:start'));
    };
    window.addEventListener(SCROLL_LOCK_EVENT, onLock);
    return () => window.removeEventListener(SCROLL_LOCK_EVENT, onLock);
  }, []);

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

    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener('lenis:stop', stop);
    window.addEventListener('lenis:start', start);

    // Keep a stable reference so cleanup actually removes the ticker callback.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener('lenis:stop', stop);
      window.removeEventListener('lenis:start', start);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
};
