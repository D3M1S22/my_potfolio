import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

const SITE_NAME = 'Damiano Shushku';
const SITE_ROLE = 'Developer & Creative Technologist';
const GITHUB = 'https://github.com/D3M1S22';

/**
 * Injects URL-dependent SEO tags (canonical, og:url, absolute og:image) and
 * JSON-LD, and emits robots.txt + sitemap.xml at build time.
 */
const seo = (siteUrl: string): Plugin => {
  const url = siteUrl.replace(/\/$/, '');
  const abs = (path: string) => (url ? `${url}${path}` : path);
  return {
    name: 'portfolio-seo',
    transformIndexHtml(html) {
      const person = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: SITE_NAME,
        jobTitle: SITE_ROLE,
        ...(url ? { url } : {}),
        sameAs: [GITHUB],
        knowsAbout: ['React', 'TypeScript', 'Three.js', 'WebGL', 'GSAP', 'UI/UX'],
      };
      const tags = [
        url && `<link rel="canonical" href="${url}/" />`,
        url && `<meta property="og:url" content="${url}/" />`,
        `<meta property="og:image" content="${abs('/og-image.png')}" />`,
        `<meta name="twitter:image" content="${abs('/og-image.png')}" />`,
        `<script type="application/ld+json">${JSON.stringify(person)}</script>`,
      ].filter(Boolean);
      return html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', url && `Sitemap: ${url}/sitemap.xml`]
        .filter(Boolean)
        .join('\n');
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots}\n` });
      if (url) {
        const today = new Date().toISOString().slice(0, 10);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>\n</urlset>\n`,
        });
      }
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), seo(env.VITE_SITE_URL ?? '')],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
