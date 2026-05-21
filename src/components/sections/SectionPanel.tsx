import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionPanelProps {
  index: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
  direction: 'left' | 'right';
}

export const SectionPanel = ({
  index,
  title,
  subtitle,
  description,
  icon,
  accentColor,
  direction,
}: SectionPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Slide the content panel in from the opposite direction of the cube
      const xFrom = direction === 'left' ? 120 : -120;

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
        { opacity: 0, x: xFrom, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 30, ease: 'power3.out' }
      )
        .to({}, { duration: 45 }) // Hold text steady
        .to(contentRef.current, { opacity: 0, y: -40, duration: 25, ease: 'power2.in' });
    }, panelRef);

    return () => ctx.revert();
  }, [direction]);

  const isRight = direction === 'right';

  return (
    <div
      ref={panelRef}
      id={`section-${index}`}
      className="relative h-screen flex items-center"
      style={{ zIndex: 10 }}
    >
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
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
            style={{ backgroundColor: accentColor }}
          />

          {/* Icon */}
          <div className="text-4xl mb-4">{icon}</div>

          {/* Title */}
          <h2
            className="font-display text-3xl md:text-4xl font-bold mb-2"
            style={{ color: accentColor }}
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-sm uppercase tracking-widest text-white/40 font-mono mb-6">
            {subtitle}
          </p>

          {/* Divider */}
          <div
            className="w-12 h-0.5 rounded-full mb-6"
            style={{ backgroundColor: accentColor }}
          />

          {/* Description */}
          <p className="text-base md:text-lg leading-relaxed text-white/75">
            {description}
          </p>

          {/* Section number */}
          <div
            className="absolute bottom-4 right-6 text-7xl font-display font-bold opacity-5"
            style={{ color: accentColor }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};
