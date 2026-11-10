/**
 * Single source of truth for identity, SEO and social metadata.
 * `url` comes from VITE_SITE_URL (e.g. https://damianoshushku.dev) so canonical
 * links, the sitemap and JSON-LD only use absolute URLs once a domain exists.
 */
export interface SocialLink {
  label: string;
  href: string;
  /** Accessible name — describes the destination, not the visual label */
  ariaLabel: string;
}

export const SITE = {
  name: 'Damiano Shushku',
  shortName: 'DS.',
  role: 'Developer & Creative Technologist',
  description:
    'Portfolio of Damiano Shushku — full-stack developer and creative technologist building immersive, accessible web experiences with React, Three.js and GSAP.',
  url: (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, ''),
  socials: [
    {
      label: 'GitHub',
      href: 'https://github.com/D3M1S22',
      ariaLabel: 'Damiano Shushku on GitHub (opens in a new tab)',
    },
  ] satisfies SocialLink[],
} as const;
