import { useEffect, useState } from 'react';

export const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50 w-[4px] h-[40svh] bg-[var(--color-glass-border)] rounded-full overflow-hidden">
      {/* Scrollbar Thumb */}
      <div
        className="w-full transition-none rounded-full shadow-[0_0_15px_rgba(var(--color-accent),0.5)]"
        style={{
          height: `${progress * 100}%`,
          background:
            'linear-gradient(180deg, var(--color-accent-light), var(--color-cyan), var(--color-magenta))',
        }}
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Scroll progress"
      />
    </div>
  );
};
