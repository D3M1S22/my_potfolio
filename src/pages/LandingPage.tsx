import { ExplodingCube } from '@/components/three/ExplodingCube';
import { HeroOverlay } from '@/components/sections/HeroOverlay';
import { SectionPanel } from '@/components/sections/SectionPanel';
import { SECTIONS_DATA } from '@/components/sections/sections-data';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { Navbar } from '@/components/ui/Navbar';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { SITE } from '@/config/site';

export const LandingPage = () => {
  return (
    <SmoothScroll>
      <a href={`#${SECTIONS_DATA[0].id}`} className="skip-link">
        Skip to content
      </a>

      {/* Fixed UI chrome */}
      <ScrollProgress />
      <Navbar />

      {/* 3D scene — fixed, transparent canvas behind all content */}
      <ExplodingCube />

      <main id="top" className="relative z-[1]">
        {/* Hero text overlay — fixed, fades on scroll; holds the page <h1> */}
        <HeroOverlay />

        {/*
          Hero spacer — gives the assembled scene time to be seen.
          id="hero-spacer" is the GSAP ScrollTrigger anchor for the hero timeline.
          pointer-events-none so the 3D event overlay can receive hover / click.
        */}
        <div id="hero-spacer" className="h-[300svh] pointer-events-none" aria-hidden="true" />

        {SECTIONS_DATA.map((section, index) => (
          <SectionPanel
            key={section.id}
            id={section.id}
            index={index}
            title={section.title}
            subtitle={section.subtitle}
            description={section.description}
            icon={section.icon}
            accentColor={section.accentColor}
            direction={section.direction}
          />
        ))}
      </main>

      <footer className="relative z-[1] h-[100svh] flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-text-faint font-mono text-sm uppercase tracking-widest mb-4">
            Thanks for scrolling
          </p>
          <p className="font-display text-2xl md:text-3xl font-bold text-gradient">
            Let&apos;s build something amazing.
          </p>
          <ul className="mt-8 flex items-center justify-center gap-6" aria-label="Social links">
            {SITE.socials.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={link.ariaLabel}
                  className="inline-block py-2 text-text-faint hover:text-text transition-colors duration-200 text-sm font-mono"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-text-faint text-xs font-mono">
            © {new Date().getFullYear()} {SITE.name}
          </p>
        </div>
      </footer>
    </SmoothScroll>
  );
};
