import { useRef, useEffect, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { BRAIN_REGIONS, type BrainRegionId } from '@/data/brain-regions';

gsap.registerPlugin(ScrollTrigger);

interface SectionPanelProps {
  /** Anchor id used by the navbar, GSAP triggers and the 3D scene */
  id: string;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
  direction: 'left' | 'right';
  region: BrainRegionId;
  /** Extra content under the description (e.g. the projects gallery) */
  children?: ReactNode;
}

export const SectionPanel = ({
  id,
  index,
  title,
  subtitle,
  description,
  icon,
  accentColor,
  direction,
  region,
  children,
}: SectionPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!panelRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Slide the content panel in from the opposite direction of the cube
      // Reduced motion: a plain fade, no sliding or scaling.
      // Phones: rise from below instead of sliding in sideways (a sideways
      // offset would push the card past the screen edge).
      const wide = window.matchMedia('(min-width: 768px)').matches;
      const xFrom = reducedMotion || !wide ? 0 : direction === 'left' ? 120 : -120;
      const yFrom = reducedMotion || wide ? 0 : 40;
      const yTo = reducedMotion ? 0 : -30;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panelRef.current,
          start: 'top 85%',
          end: 'bottom 20%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Fully opaque for most of the scroll so the text is readable while it
      // moves; short fade in/out at the edges only.
      tl.fromTo(
        contentRef.current,
        { opacity: 0, x: xFrom, y: yFrom },
        { opacity: 1, x: 0, y: 0, duration: 16, ease: 'power2.out' }
      )
        .to({}, { duration: 72 }) // Hold text steady
        .to(contentRef.current, { opacity: 0, y: yTo, duration: 12, ease: 'power2.in' });
    }, panelRef);

    return () => ctx.revert();
  }, [direction, reducedMotion]);

  const isRight = direction === 'right';
  const brainRegion = BRAIN_REGIONS[region];
  // Phones: long descriptions start clamped so the card leaves room for the brain
  const [expanded, setExpanded] = useState(false);
  const clampable = description.length > 150;

  return (
    <section
      ref={panelRef}
      id={id}
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
      className="relative min-h-[100svh] flex items-end md:items-center pb-[7svh] md:pb-0 focus:outline-none"
      style={{ zIndex: 10, '--accent': accentColor } as React.CSSProperties}
    >
      {/* Mobile: card sits in the lower half so the 3D region above stays visible */}
      {/* Massive subtle background ambient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06]"
        style={{ background: `radial-gradient(ellipse 45% 40% at 50% 50%, ${accentColor}, transparent 70%)` }}
      />
      
      <div
        ref={contentRef}
        data-section-card
        className={`w-full max-w-xl lg:max-w-[38rem] mx-auto px-5 md:px-0 ${
          isRight ? 'md:ml-auto md:mr-[8%] lg:mr-[10%]' : 'md:mr-auto md:ml-[8%] lg:ml-[10%]'
        }`}
      >
        {/* Card — compact on phones so the brain above stays in view longer */}
        <div className="panel rounded-2xl p-5 md:p-10 relative overflow-hidden group">
          {/* Accent glow */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-20 transition-opacity duration-500 group-hover:opacity-35"
            style={{ background: `radial-gradient(circle, ${accentColor}, transparent 65%)` }}
          />

          {/* Icon + brain region this section lives in */}
          <div className="flex items-center gap-3 md:block">
            <div className="text-2xl md:text-4xl md:mb-4" aria-hidden="true">{icon}</div>
            <p className="text-accent-readable font-mono text-xs md:text-[0.8125rem] font-semibold uppercase tracking-[0.14em] md:mb-1">
              {brainRegion.name}
            </p>
          </div>
          <p className="text-text-muted text-[0.8125rem] md:text-sm leading-snug mt-1 md:mt-0 mb-4 md:mb-6">
            {brainRegion.role}
          </p>

          {/* Title */}
          <h2
            id={`${id}-title`}
            className="text-accent-readable font-display text-[1.75rem] leading-tight md:text-5xl font-bold mb-1 md:mb-2"
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-xs md:text-[0.9375rem] font-medium uppercase tracking-[0.12em] text-text-muted font-mono mb-4 md:mb-6">
            {subtitle}
          </p>

          {/* Divider (desktop only — saves height on phones) */}
          <div
            aria-hidden="true"
            className="hidden md:block w-12 h-0.5 rounded-full mb-6"
            style={{ backgroundColor: accentColor }}
          />

          {/* Description */}
          <p
            id={`${id}-description`}
            className={`text-base md:text-lg leading-[1.65] md:leading-[1.75] text-text-body ${
              clampable && !expanded ? 'line-clamp-4 md:line-clamp-none' : ''
            }`}
          >
            {description}
          </p>
          {clampable && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls={`${id}-description`}
              className="md:hidden mt-2 -ml-1 px-1 py-1.5 text-sm font-medium text-accent-readable"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}

          {children}

          {/* Section number */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute bottom-4 right-6 text-7xl font-display font-bold opacity-5"
            style={{ color: accentColor }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </section>
  );
};
