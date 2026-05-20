import { useScrollProgress } from '@/hooks/useScrollProgress';
import { ExplodingCube } from '@/components/three/ExplodingCube';
import { HeroOverlay } from '@/components/sections/HeroOverlay';
import { SectionPanel } from '@/components/sections/SectionPanel';
import { SECTIONS_DATA } from '@/components/sections/sections-data';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { Navbar } from '@/components/ui/Navbar';

export const LandingPage = () => {
  const progressRef = useScrollProgress(9);

  return (
    <main>
      {/* Fixed UI elements */}
      <ScrollProgress />
      <Navbar />

      {/* 3D scene — fixed behind content */}
      <ExplodingCube progressRef={progressRef} />

      {/* Hero overlay — fixed, fades on scroll */}
      <HeroOverlay />

      {/* Scroll container — drives the scroll progress */}
      <div id="top" className="relative z-[1]">
        {/* Hero spacer (first 100vh is the hero) — pointer-events-none so 3D cube is interactive */}
        <div className="h-screen pointer-events-none" aria-hidden="true" />

        {/* 8 section panels */}
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

        {/* Footer spacer */}
        <footer className="h-screen flex items-center justify-center relative">
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
