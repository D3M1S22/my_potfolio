import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector<HTMLElement>(href);
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Move keyboard / screen-reader focus to the section that was jumped to
      el.focus({ preventScroll: true });
    }
    history.replaceState(null, '', href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-500 py-4 ${
        scrolled ? 'glass' : 'bg-transparent'
      }`}
    >
      <nav aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo (Invisible Anchor for Hero Animation) */}
        <a
          id="navbar-logo"
          href="#top"
          className="font-display text-xl font-bold text-gradient opacity-0 pointer-events-none"
          aria-hidden="true"
        >
          DS.
        </a>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="text-[0.8125rem] font-medium text-text-muted hover:text-text transition-colors duration-200
                           uppercase tracking-wider font-mono"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Theme Toggle & Mobile Menu */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Mobile Menu Toggle */}
          <button
          type="button"
          className="md:hidden flex flex-col justify-center gap-1.5 w-11 h-11 p-2.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            aria-hidden="true"
            className={`w-6 h-0.5 bg-text transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            aria-hidden="true"
            className={`w-6 h-0.5 bg-text transition-all duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            aria-hidden="true"
            className={`w-6 h-0.5 bg-text transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden glass overflow-hidden transition-all duration-300 ${
          menuOpen
            ? 'max-h-[28rem] py-4 opacity-100 visible'
            : 'max-h-0 opacity-0 pointer-events-none invisible'
        }`}
      >
        <ul className="flex flex-col items-center gap-4 px-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="block px-4 py-2 text-sm text-text-muted hover:text-text transition-colors
                           uppercase tracking-wider font-mono"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      </nav>
    </header>
  );
};
