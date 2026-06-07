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

      // Animate name ON SCROLL
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

      // INITIAL STATE: Stack the words
      gsap.set('.hero-word-1', { xPercent: 50, yPercent: -55 });
      gsap.set('.hero-word-2', { xPercent: -50, yPercent: 55 });

      // 1. Move and scale wrapper to top-left over the entire scrub
      nameScrollTl.to('.hero-name-wrapper', {
        x: () => {
          const logo = document.getElementById('navbar-logo');
          const wrapper = document.querySelector('.hero-name-wrapper');
          if (logo && wrapper) {
            const logoRect = logo.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            return (logoRect.left + logoRect.width / 2) - (wrapperRect.left + wrapperRect.width / 2);
          }
          return 0;
        },
        y: () => {
          const logo = document.getElementById('navbar-logo');
          const wrapper = document.querySelector('.hero-name-wrapper');
          if (logo && wrapper) {
            const logoRect = logo.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            return (logoRect.top + logoRect.height / 2) - (wrapperRect.top + wrapperRect.height / 2);
          }
          return 0;
        },
        scale: 0.2,
        ease: 'none',
        duration: 1
      }, 0);

      // 2. Fade out glass early
      nameScrollTl.to('.hero-glass-bg', { opacity: 0, duration: 0.15 }, 0);

      // 3. Form row (unstack)
      nameScrollTl.to('.hero-word-1', { xPercent: 0, yPercent: 0, ease: 'power2.out', duration: 0.3 }, 0.15);
      nameScrollTl.to('.hero-word-2', { xPercent: 0, yPercent: 0, ease: 'power2.out', duration: 0.3 }, 0.15);

      // 4. Typographic Collapse
      nameScrollTl.to(['.hero-letters-1', '.hero-letters-2'], { 
        maxWidth: 0, 
        opacity: 0, 
        ease: 'power3.inOut', 
        duration: 0.3 
      }, 0.5);
      
      // Animate the gap to 0 so D and S touch perfectly
      nameScrollTl.to('.hero-name-row', { 
        gap: 0, 
        ease: 'power3.inOut', 
        duration: 0.3 
      }, 0.5);

      nameScrollTl.to('.hero-dot', { 
        maxWidth: '1em', 
        opacity: 1, 
        ease: 'power3.inOut', 
        duration: 0.2 
      }, 0.6);

      // 5. Hide wrapper exactly when logo is swapped
      nameScrollTl.to('.hero-name-wrapper', {
        opacity: 0,
        ease: 'expo.in',
        duration: 0.05
      }, 0.95);

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
          <div className="hero-name-wrapper opacity-0 mb-4 relative flex items-center justify-center w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px] h-[140px] sm:h-[180px] md:h-[220px] lg:h-[260px]">
             {/* Glass Background */}
             <div className="hero-glass-bg absolute inset-0 glass-subtle rounded-3xl backdrop-blur-md border border-white/5 dark:border-white/5 shadow-2xl pointer-events-none"></div>

             {/* True DOM is a ROW, positioned absolute center */}
             <div className="hero-name-row absolute flex flex-row items-center justify-center gap-2 sm:gap-4">
               <div className="hero-word-1 flex items-center justify-center font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">
                 <span className="text-gradient">D</span>
                 <div className="hero-letters-1 overflow-hidden text-gradient" style={{ maxWidth: '1000px' }}>amiano</div>
               </div>
               
               <div className="hero-word-2 flex items-center justify-center font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">
                 <span className="text-text">S</span>
                 <div className="hero-letters-2 overflow-hidden text-text" style={{ maxWidth: '1000px' }}>hushku</div>
                 <div className="hero-dot overflow-hidden text-gradient opacity-0" style={{ maxWidth: '0px' }}>.</div>
               </div>
             </div>
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
