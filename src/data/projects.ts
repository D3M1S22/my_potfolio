/**
 * Projects shown in the Projects section (occipital lobe — "what you see").
 *
 * To add a real project: drop a screenshot in public/projects/ (1600×1000,
 * .webp or .jpg works best), then add an entry below. Tiles show `summary` and
 * the first three `tags`; the detail view shows everything else. Links are
 * optional — a button only appears when a link is set.
 *
 * Entries marked PLACEHOLDER are sample content to replace.
 */
export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  title: string;
  year: string;
  role: string;
  /** One line for the tile */
  summary: string;
  /** Paragraphs for the detail view */
  description: string[];
  tags: string[];
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  links: ProjectLink[];
}

export const PROJECTS: Project[] = [
  {
    id: 'neural-portfolio',
    title: 'Neural Portfolio',
    year: '2026',
    role: 'Design & development',
    summary: 'This site — a portfolio you explore like a brain.',
    description: [
      'A scroll-driven 3D portfolio built around one idea: each part of who I am lives in the part of the brain that does the same job. Personality sits in the prefrontal cortex, skills in the motor cortex, projects in the visual cortex.',
      'An anatomical model is split into eight functional regions by a custom glTF pipeline, then compressed to a few hundred kilobytes. The scene renders only when something moves, so it stays smooth on phones.',
    ],
    tags: ['React', 'Three.js', 'GSAP', 'TypeScript', 'glTF'],
    image: {
      src: '/projects/neural-portfolio.webp',
      alt: 'The portfolio’s Projects section: a translucent 3D brain with the occipital lobe highlighted in pink beside a text card',
      width: 1600,
      height: 1000,
    },
    links: [{ label: 'Source code', href: 'https://github.com/D3M1S22/my_potfolio' }],
  },
  // PLACEHOLDER
  {
    id: 'nebula',
    title: 'Nebula Analytics',
    year: '2025',
    role: 'Lead frontend engineer',
    summary: 'Real-time analytics dashboard for product teams.',
    description: [
      'Placeholder description. A dashboard that streams product metrics in real time, with configurable widgets, saved views and alerting.',
      'Describe the problem, your role, the hardest technical decision and the outcome (a number helps: load time, adoption, revenue).',
    ],
    tags: ['React', 'WebSockets', 'D3', 'PostgreSQL'],
    image: {
      src: '/projects/nebula.svg',
      alt: 'Placeholder image: a dark analytics dashboard with KPI cards, a line chart and bar chart',
      width: 1600,
      height: 1000,
    },
    links: [],
  },
  // PLACEHOLDER
  {
    id: 'atlas',
    title: 'Atlas Configurator',
    year: '2025',
    role: 'Creative developer',
    summary: '3D product configurator with live materials and pricing.',
    description: [
      'Placeholder description. A WebGL configurator where customers change materials, colours and parts of a product and see the price update instantly.',
      'Describe the stack, how you kept it fast on mobile, and what the client gained.',
    ],
    tags: ['Three.js', 'R3F', 'Node.js', 'Stripe'],
    image: {
      src: '/projects/atlas.svg',
      alt: 'Placeholder image: an isometric 3D cube in warm colours with material swatches',
      width: 1600,
      height: 1000,
    },
    links: [],
  },
  // PLACEHOLDER
  {
    id: 'pulse',
    title: 'Pulse',
    year: '2024',
    role: 'Full-stack developer',
    summary: 'Offline-first habit tracker PWA.',
    description: [
      'Placeholder description. A progressive web app for building habits that works fully offline and syncs when the connection returns.',
      'Describe the architecture, the sync strategy and what you learned shipping it.',
    ],
    tags: ['PWA', 'TypeScript', 'IndexedDB', 'Node.js'],
    image: {
      src: '/projects/pulse.svg',
      alt: 'Placeholder image: a phone showing a habit list next to a 68% progress ring',
      width: 1600,
      height: 1000,
    },
    links: [],
  },
];
