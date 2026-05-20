import { useRef, useEffect, useCallback } from 'react';

/**
 * Maps the scroll position of the page to a normalized 0..1 progress value.
 * Uses a ref (not state) to avoid re-renders — R3F's useFrame reads this directly.
 *
 * @param totalSections - Number of scroll sections (page height = totalSections * 100vh)
 */
export const useScrollProgress = (totalSections: number = 9) => {
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, totalSections]);

  return progressRef;
};
