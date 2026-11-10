import { useEffect, useRef } from 'react';

/**
 * Decorative scroll indicator. Hidden from assistive tech (the browser's own
 * scroll position already conveys this) and updated through a ref so scrolling
 * never triggers React re-renders.
 */
export const ScrollProgress = () => {
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      if (thumbRef.current) thumbRef.current.style.transform = `scaleY(${progress})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-1/2 right-3 md:right-6 -translate-y-1/2 z-50 w-[3px] md:w-[4px] h-[40svh] bg-[var(--color-glass-border)] rounded-full overflow-hidden pointer-events-none"
    >
      <div
        ref={thumbRef}
        className="w-full h-full rounded-full origin-top will-change-transform"
        style={{
          transform: 'scaleY(0)',
          background:
            'linear-gradient(180deg, var(--color-accent-light), var(--color-cyan), var(--color-magenta))',
        }}
      />
    </div>
  );
};
