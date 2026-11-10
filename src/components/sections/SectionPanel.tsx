import { useRef, useEffect } from 'react';
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
      const scaleFrom = reducedMotion ? 1 : 0.9;
      const yTo = reducedMotion ? 0 : -40;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panelRef.current,
          start: 'top 85%',
          end: 'bottom 20%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        contentRef.current,
        { opacity: 0, x: xFrom, y: yFrom, scale: scaleFrom },
        { opacity: 1, x: 0, y: 0, scale: 1, duration: 30, ease: 'power3.out' }
      )
        .to({}, { duration: 45 }) // Hold text steady
        .to(contentRef.current, { opacity: 0, y: yTo, duration: 25, ease: 'power2.in' });
    }, panelRef);

    return () => ctx.revert();
  }, [direction, reducedMotion]);

  const isRight = direction === 'right';
  const brainRegion = BRAIN_REGIONS[region];

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
        className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.09]"
        style={{ background: `radial-gradient(ellipse 45% 40% at 50% 50%, ${accentColor}, transparent 70%)` }}
      />
      
      <div
        ref={contentRef}
        className={`w-full max-w-xl mx-auto px-6 md:px-0 ${
          isRight ? 'md:ml-auto md:mr-[12%]' : 'md:mr-auto md:ml-[12%]'
        }`}
      >
        {/* Card */}
        <div className="glass rounded-2xl p-8 md:p-10 relative overflow-hidden group">
          {/* Accent glow */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-25 transition-opacity duration-500 group-hover:opacity-45"
            style={{ background: `radial-gradient(circle, ${accentColor}, transparent 65%)` }}
          />

          {/* Icon */}
          <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>

          {/* Brain region this section lives in */}
          <p className="text-accent-readable font-mono text-xs uppercase tracking-[0.2em] mb-1">
            {brainRegion.name}
          </p>
          <p className="text-text-faint text-xs mb-5">{brainRegion.role}</p>

          {/* Title */}
          <h2
            id={`${id}-title`}
            className="text-accent-readable font-display text-3xl md:text-4xl font-bold mb-2"
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-sm uppercase tracking-widest text-text-muted font-mono mb-6">
            {subtitle}
          </p>

          {/* Divider */}
          <div
            aria-hidden="true"
            className="w-12 h-0.5 rounded-full mb-6"
            style={{ backgroundColor: accentColor }}
          />

          {/* Description */}
          <p className="text-base md:text-lg leading-relaxed text-text-muted">
            {description}
          </p>

          {/* Section number */}
          <div
            aria-hidden="true"
            className="absolute bottom-4 right-6 text-7xl font-display font-bold opacity-5"
            style={{ color: accentColor }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </section>
  );
};
