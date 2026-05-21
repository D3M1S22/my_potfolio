import { ExplodingCube } from '@/components/three/ExplodingCube';
import { HeroOverlay } from '@/components/sections/HeroOverlay';
import { SectionPanel } from '@/components/sections/SectionPanel';
import { SECTIONS_DATA } from '@/components/sections/sections-data';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { Navbar } from '@/components/ui/Navbar';

export const LandingPage = () => {
  return (
    <main>
      {/* Fixed UI chrome */}
      <ScrollProgress />
      <Navbar />

      {/* 3D scene — fixed, transparent canvas behind all content */}
      <ExplodingCube />

      {/* Hero text overlay — fixed, fades on scroll */}
      <HeroOverlay />

      {/* Scrollable content — drives the page height */}
      <div id="top" className="relative z-[1]">

        {/*
          Hero spacer — gives the assembled cube time to be seen.
          id="hero-spacer" is the GSAP ScrollTrigger anchor for the
          global rotation fade-out in CubeGroup.
          pointer-events-none so the 3D event overlay can receive
          hover / click during the hero.
        */}
        <div
          id="hero-spacer"
          className="h-screen pointer-events-none"
          aria-hidden="true"
        />

        {/* 8 section panels — each has id="section-N" for GSAP anchors */}
        {SECTIONS_DATA.map((section, index) => (
          <SectionPanel
            key={section.id}
            index={index}
            title={section.title}
            subtitle={section.subtitle}
            description={section.description}
            icon={section.icon}
            accentColor={section.accentColor}
            direction={section.direction}
          />
        ))}

        {/* Footer */}
        <footer className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/30 font-mono text-sm uppercase tracking-widest mb-4">
              Thanks for scrolling
            </p>
            <p className="font-display text-2xl md:text-3xl font-bold text-gradient">
              Let&apos;s build something amazing.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors duration-200 text-sm font-mono"
                aria-label="GitHub profile"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors duration-200 text-sm font-mono"
                aria-label="LinkedIn profile"
              >
                LinkedIn
              </a>
              <a
                href="mailto:hello@example.com"
                className="text-white/40 hover:text-white transition-colors duration-200 text-sm font-mono"
                aria-label="Email me"
              >
                Email
              </a>
            </div>
            <p className="mt-12 text-white/15 text-xs font-mono">
              © {new Date().getFullYear()} Damiano Shushku
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
};
