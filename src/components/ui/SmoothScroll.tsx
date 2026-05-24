import { useEffect, useRef, ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const SmoothScroll = ({ children }: { children: ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize physics-based smooth scrolling
    const lenis = new Lenis({
      duration: 1.5, // Increased from 1.0 to create a heavier, slower maximum speed
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom ease out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.7, // Reduced from 1.0 to limit distance covered per scroll flick
      touchMultiplier: 1.5, // Reduced slightly to match slower aesthetic
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Add lenis requestAnimationFrame to GSAP's ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); // GSAP's time is in seconds, lenis wants ms
    });
    gsap.ticker.lagSmoothing(0); // Prevent GSAP from messing with delta timing

    return () => {
      // Cleanup
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
