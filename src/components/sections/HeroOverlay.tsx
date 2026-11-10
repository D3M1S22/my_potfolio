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
        '.hero-top-text',
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
          '.hero-bottom-text',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.5',
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
        }
      });

      // INITIAL STATE: Stack the words
      gsap.set('.hero-word-1', { xPercent: 50, yPercent: -55 });
      gsap.set('.hero-word-2', { xPercent: -50, yPercent: 55 });

      // 1. Move and scale wrapper to top-left over the entire scrub
      nameScrollTl.to('.hero-name-wrapper', {
        x: () => {
          const logo = document.getElementById('navbar-logo');
          const anchor = document.getElementById('hero-name-anchor');
          if (logo && anchor) {
            const logoRect = logo.getBoundingClientRect();
            const anchorRect = anchor.getBoundingClientRect();
            return (logoRect.left + logoRect.width / 2) - (anchorRect.left + anchorRect.width / 2);
          }
          return 0;
        },
        y: () => {
          const logo = document.getElementById('navbar-logo');
          const anchor = document.getElementById('hero-name-anchor');
          if (logo && anchor) {
            const logoRect = logo.getBoundingClientRect();
            const anchorRect = anchor.getBoundingClientRect();
            return (logoRect.top + logoRect.height / 2) - (anchorRect.top + anchorRect.height / 2);
          }
          return 0;
        },
        scale: () => {
          const logo = document.getElementById('navbar-logo');
          const word = document.querySelector('.hero-word-1');
          if (logo && word) {
             const logoStyle = window.getComputedStyle(logo);
             const wordStyle = window.getComputedStyle(word);
             const targetSize = parseFloat(logoStyle.fontSize) || 20;
             const startSize = parseFloat(wordStyle.fontSize) || 96;
             return targetSize / startSize;
          }
          return 0.2;
        },
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

      // Fade out greeting, title, and CTA smoothly over a longer distance
      // Using fromTo with immediateRender: false prevents GSAP from recording the pre-intro state
      nameScrollTl.fromTo(['.hero-top-text', '.hero-bottom-text'], 
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -50,
          ease: 'power2.inOut',
          duration: 0.5,
          immediateRender: false
        }, 0
      );

      nameScrollTl.fromTo('.hero-scroll-hint', 
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.3,
          immediateRender: false
        }, 0
      );

      // The intro and the scroll timeline animate the same elements. If the
      // user scrolls before the intro ends (or the page loads already
      // scrolled, e.g. reload or a #section link), jump the intro to its end
      // and let the scroll timeline re-apply its state on top — otherwise the
      // intro would leave the greeting / scroll hint stuck on screen.
      const finishIntro = () => {
        if (tl.progress() < 1) {
          tl.progress(1);
          nameScrollTl.render(nameScrollTl.totalTime(), false, true);
        }
      };
      if (window.scrollY > 4) finishIntro();
      window.addEventListener('scroll', finishIntro, { once: true, passive: true });
      return () => window.removeEventListener('scroll', finishIntro);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col pt-24 pb-8 overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08]"
        style={{
          background:
            'radial-gradient(ellipse 35% 30% at 42% 48%, var(--color-accent), transparent 70%), radial-gradient(ellipse 30% 28% at 58% 54%, var(--color-magenta), transparent 70%)',
        }}
      />

      {/* Spacer to push content to middle safely */}
      <div className="flex-1 min-h-[2svh]" />

      <div className="text-center px-6 max-w-3xl mx-auto relative z-10 w-full shrink-0">
        <div className="hero-content flex flex-col items-center">
          
          {/* Greeting Wrapper */}
          <div className="hero-top-text opacity-0 mb-4">
            <p aria-hidden="true" className="hero-greeting text-sm md:text-base uppercase tracking-[0.3em] text-text-muted font-mono [text-shadow:0_0_16px_var(--color-surface)]">
              Hello, I&apos;m
            </p>
          </div>

          {/* Static Layout Anchor for accurate un-transformed coordinate measuring */}
          <h1 id="hero-name-anchor" className="relative inline-flex items-center justify-center mb-8">
            {/* Accessible name — the visual letters below are split for animation */}
            <span className="sr-only">Damiano Shushku</span>

            
            {/* Invisible Stacked Placeholder for perfect pill sizing */}
            <div aria-hidden="true" className="opacity-0 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold px-8 py-6 pointer-events-none select-none text-center leading-[1.1]">
              Damiano<br/>Shushku
            </div>

            {/* The Animatable Wrapper */}
            <div
              aria-hidden="true"
              className="hero-name-wrapper opacity-0 absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
               {/* Glass Background */}
               <div className={`hero-glass-bg absolute inset-0 glass-subtle rounded-3xl border border-white/5 dark:border-white/5 shadow-2xl pointer-events-none`}></div>

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
          </h1>

          {/* Bottom Text Wrapper guarantees internal layout won't overlap when animated */}
          <div className="hero-bottom-text opacity-0 flex flex-col items-center">
            {/* Title */}
            <p className="hero-title text-lg md:text-2xl text-text font-normal mb-8 [text-shadow:0_0_18px_var(--color-surface),0_0_6px_var(--color-surface)]">
              Developer &amp; Creative Technologist
            </p>

            {/* CTA */}
            <div className="hero-cta pointer-events-auto">
              <button
                type="button"
                className="px-8 py-3 rounded-full glass glow-accent text-text font-medium
                           hover:scale-105 active:scale-95 transition-transform duration-200
                           border border-white/10 hover:border-accent/30"
                onClick={() => {
                  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }}
              >
                Explore My Work
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push scroll hint to bottom safely without absolute positioning collisions */}
      <div className="flex-1 flex flex-col justify-end items-center min-h-[4svh] relative z-10 pointer-events-none">
        <div className="hero-scroll-hint opacity-0 pb-4" aria-hidden="true">
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
