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
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -100,
        scrollTrigger: {
          trigger: '#hero-spacer',
          start: 'top top',
          end: '25% top',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none"
    >
      <div className="text-center px-6 max-w-3xl">
        {/* Greeting */}
        <p className="hero-greeting text-sm md:text-base uppercase tracking-[0.3em] text-white/40 font-mono mb-4 opacity-0">
          Hello, I&apos;m
        </p>

        {/* Name */}
        <h1 className="hero-name font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 opacity-0">
          <span className="text-gradient">Damiano</span>
          <br />
          <span className="text-white">Shushku</span>
        </h1>

        {/* Title */}
        <p className="hero-title text-lg md:text-xl text-white/50 font-light mb-8 opacity-0">
          Developer &amp; Creative Technologist
        </p>

        {/* CTA */}
        <div className="hero-cta opacity-0 pointer-events-auto">
          <button
            className="px-8 py-3 rounded-full glass glow-accent text-white font-medium
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

        {/* Scroll hint */}
        <div className="hero-scroll-hint absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0">
          <div className="flex flex-col items-center gap-2 animate-float">
            <span className="text-xs uppercase tracking-widest text-white/30 font-mono">
              Scroll to explore
            </span>
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-white/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
