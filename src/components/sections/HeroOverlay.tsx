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
          '.hero-name-wrapper',
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

      // Animate name to top-left and morph states ON SCROLL
      const nameScrollTl = gsap.timeline({
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight * 0.8,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress > 0.95) {
               window.dispatchEvent(new CustomEvent('heroNameDocked', { detail: true }));
            } else {
               window.dispatchEvent(new CustomEvent('heroNameDocked', { detail: false }));
            }
          }
        }
      });

      // 1. Move and scale wrapper over the entire scrub
      nameScrollTl.to('.hero-name-wrapper', {
        x: () => {
          const logo = document.getElementById('navbar-logo');
          if (logo) {
            const rect = logo.getBoundingClientRect();
            return rect.left + rect.width / 2 - window.innerWidth / 2;
          }
          return -window.innerWidth / 2 + 100;
        },
        y: () => {
          const logo = document.getElementById('navbar-logo');
          if (logo) {
            const rect = logo.getBoundingClientRect();
            return rect.top + rect.height / 2 - window.innerHeight / 2;
          }
          return -window.innerHeight / 2 + 60;
        },
        scale: 0.2,
        ease: 'none',
        duration: 1
      }, 0);

      // 2. Crossfade Stacked -> Row (10% to 40% of scroll)
      nameScrollTl.to('.name-stacked', { opacity: 0, ease: 'none', duration: 0.3 }, 0.1);
      nameScrollTl.to('.name-row', { opacity: 1, ease: 'none', duration: 0.3 }, 0.1);

      // 3. Crossfade Row -> DS Logo (60% to 90% of scroll)
      nameScrollTl.to('.name-row', { opacity: 0, ease: 'none', duration: 0.3 }, 0.6);
      nameScrollTl.to('.name-ds', { opacity: 1, ease: 'none', duration: 0.3 }, 0.6);

      // 4. Final hide of wrapper to swap to actual navbar logo
      nameScrollTl.to('.hero-name-wrapper', {
        opacity: 0,
        ease: 'expo.in',
        duration: 0.1
      }, 0.9);

      // Fade out greeting, title, and CTA smoothly over a longer distance
      gsap.to(['.hero-greeting', '.hero-title', '.hero-cta'], {
        opacity: 0,
        y: -50,
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight * 0.6,
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ pointerEvents: 'none' }}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full opacity-[0.015] dark:opacity-[0.025] blur-[120px] pointer-events-none bg-gradient-to-tr from-accent via-cyan to-magenta" />

      <div className="text-center px-6 max-w-3xl relative z-10 w-full">
        <div className="hero-content flex flex-col items-center">
          {/* Greeting */}
          <p className="hero-greeting text-sm md:text-base uppercase tracking-[0.3em] text-text-faint font-mono mb-4 opacity-0">
            Hello, I&apos;m
          </p>

          {/* Name Container for morphing states */}
          <div className="hero-name-wrapper opacity-0 mb-4 relative flex items-center justify-center">
            {/* 1. Stacked Name */}
            <h1 className="name-stacked font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold glass-subtle px-8 py-6 rounded-3xl backdrop-blur-md border border-white/5 dark:border-white/5 shadow-2xl text-center">
              <span className="text-gradient">Damiano</span>
              <br />
              <span className="text-text">Shushku</span>
            </h1>

            {/* 2. Row Name */}
            <h1 className="name-row absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold glass-subtle px-12 py-6 rounded-3xl backdrop-blur-md border border-white/5 dark:border-white/5 shadow-2xl flex items-center justify-center whitespace-nowrap opacity-0 pointer-events-none">
              <span className="text-gradient mr-4 lg:mr-6">Damiano</span>
              <span className="text-text">Shushku</span>
            </h1>

            {/* 3. DS Logo Name */}
            <h1 className="name-ds absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold glass-subtle px-8 py-6 rounded-3xl backdrop-blur-md border border-white/5 dark:border-white/5 shadow-2xl flex items-center justify-center opacity-0 pointer-events-none">
              <span className="text-gradient">DS.</span>
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
              Scroll to know me better
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
