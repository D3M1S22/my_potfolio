interface SectionData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
  direction: 'left' | 'right';
}

export const SECTIONS_DATA: SectionData[] = [
  {
    id: 'about',
    title: 'About Me',
    subtitle: 'Developer & Creative Technologist',
    description:
      "I'm a passionate full-stack developer with a love for building immersive digital experiences. I blend clean code with creative design to craft applications that are as beautiful as they are functional. My journey spans from backend architectures to interactive 3D web experiences.",
    icon: '👋',
    accentColor: '#7c5cf7',
    direction: 'left',
  },
  {
    id: 'skills',
    title: 'Skills & Tech',
    subtitle: 'My Technical Arsenal',
    description:
      'React · TypeScript · Three.js · Node.js · GSAP · Tailwind CSS · Python · PostgreSQL · Docker · AWS · GraphQL · Figma — A full-stack toolkit for building modern, performant applications from concept to deployment.',
    icon: '⚡',
    accentColor: '#38bdf8',
    direction: 'right',
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'What I\'ve Built',
    description:
      'From interactive portfolios with 3D elements to full-scale SaaS platforms, every project is an opportunity to push boundaries. I focus on clean architecture, pixel-perfect UI, and delightful user experiences that leave a lasting impression.',
    icon: '🚀',
    accentColor: '#f472b6',
    direction: 'left',
  },
  {
    id: 'experience',
    title: 'Experience',
    subtitle: 'Where I\'ve Worked',
    description:
      'Years of professional experience across startups and established companies, delivering production-grade solutions. From leading frontend architecture to collaborating cross-functionally, I bring both technical depth and team leadership.',
    icon: '💼',
    accentColor: '#fbbf24',
    direction: 'right',
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Foundation & Growth',
    description:
      'A strong academic foundation in Computer Science complemented by continuous self-learning. I believe in staying curious — always exploring new frameworks, design patterns, and emerging technologies to stay at the cutting edge.',
    icon: '🎓',
    accentColor: '#34d399',
    direction: 'left',
  },
  {
    id: 'contact',
    title: 'Contact',
    subtitle: 'Let\'s Connect',
    description:
      "I'm always open to interesting conversations, collaboration opportunities, and new challenges. Whether it's a project idea, a job opportunity, or just a tech chat — don't hesitate to reach out. Let's build something amazing together.",
    icon: '✉️',
    accentColor: '#fb923c',
    direction: 'right',
  },
  {
    id: 'testimonials',
    title: 'Testimonials',
    subtitle: 'What People Say',
    description:
      '"An exceptional developer with an eye for detail and a commitment to quality. Consistently delivers beyond expectations, bringing both technical excellence and creative vision to every project." — A trusted collaborator.',
    icon: '💬',
    accentColor: '#a78bfa',
    direction: 'left',
  },
  {
    id: 'social',
    title: 'Social Links',
    subtitle: 'Find Me Online',
    description:
      'GitHub · LinkedIn · Twitter/X · Dribbble · Dev.to — Follow my journey, check out my open-source contributions, and connect with me across platforms. I share insights on development, design, and creative coding.',
    icon: '🌐',
    accentColor: '#f87171',
    direction: 'right',
  },
];
