import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const HeroOverlay = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Initial reveal animation
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        '.hero-greeting',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      )
        .fromTo(
          '.hero-name',
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' },
          '-=0.4',
        )
        .fromTo(
          '.hero-title',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.5',
        )
        .fromTo(
          '.hero-cta',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.3',
        )
        .fromTo(
          '.hero-scroll-hint',
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.2',
        );

      // Fade hero out on scroll
      gsap.to('.hero-content', {
        opacity: 0,
        y: -100,
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight * 0.8,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      gsap.to('.hero-scroll-hint', {
        opacity: 0,
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight * 0.4,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-10 flex items-start justify-start"
      style={{ pointerEvents: 'none' }}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full opacity-[0.015] dark:opacity-[0.025] blur-[120px] pointer-events-none bg-gradient-to-tr from-accent via-cyan to-magenta" />

      <div className="text-left px-6 lg:px-24 pt-32 lg:pt-48 max-w-3xl relative z-10 w-full h-full flex flex-col justify-start">
        <div className="hero-content flex flex-col items-start">
          {/* Greeting */}
          <p className="hero-greeting text-sm md:text-base uppercase tracking-[0.3em] text-text-faint font-mono mb-4 opacity-0">
            Hello, I&apos;m
          </p>

          {/* Name */}
          <div className="hero-name opacity-0 mb-4">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold glass-subtle px-8 py-6 rounded-3xl backdrop-blur-md border border-white/5 dark:border-white/5 shadow-2xl">
              <span className="text-gradient">Damiano</span>
              <br />
              <span className="text-text">Shushku</span>
            </h1>
          </div>

          {/* Title */}
          <p className="hero-title text-lg md:text-xl text-text-muted font-light mb-8 opacity-0">
            Developer &amp; Creative Technologist
          </p>

          {/* CTA */}
          <div className="hero-cta opacity-0 pointer-events-auto">
            <button
              className="px-8 py-3 rounded-full glass glow-accent text-text font-medium
                         hover:scale-105 active:scale-95 transition-transform duration-200
                         border border-white/10 hover:border-accent/30"
              aria-label="Explore my work"
              onClick={() => {
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
              }}
            >
              Explore My Work
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-text-muted font-mono font-medium">
              Scroll to explore
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-[var(--color-glass-border)] flex items-start justify-center p-1.5 shadow-[0_0_15px_rgba(var(--color-accent),0.15)] relative overflow-hidden">
              <div className="w-1.5 h-2.5 rounded-full bg-gradient-to-b from-accent to-magenta opacity-90 animate-bounce relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
