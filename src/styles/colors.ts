export type ThemeMode = 'light' | 'dark';

export const THEME_COLORS = {
  light: {
    // Backgrounds
    '--color-surface': 'hsl(0, 0%, 98%)',
    '--color-surface-50': 'hsl(0, 0%, 94%)',
    '--color-surface-100': 'hsl(0, 0%, 90%)',
    '--color-surface-200': 'hsl(0, 0%, 82%)',
    
    // Text
    '--color-text': 'hsl(0, 0%, 12%)',
    '--color-text-muted': 'hsl(0, 0%, 36%)', // 6.9:1
    '--color-text-faint': 'hsl(0, 0%, 42%)', // 4.9:1 on surface (WCAG AA)
    
    // Glass & Overlays
    '--color-glass-bg': 'hsla(0, 0%, 100%, 0.7)',
    '--color-glass-border': 'hsla(0, 0%, 0%, 0.08)',
    '--color-glass-subtle-bg': 'hsla(0, 0%, 100%, 0.4)',
    '--color-glass-subtle-border': 'hsla(0, 0%, 0%, 0.05)',
    '--color-glass-solid-bg': 'hsla(0, 0%, 100%, 0.9)',
  },
  dark: {
    // Grayscale Backgrounds
    '--color-surface': 'hsl(0, 0%, 6%)',
    '--color-surface-50': 'hsl(0, 0%, 10%)',
    '--color-surface-100': 'hsl(0, 0%, 14%)',
    '--color-surface-200': 'hsl(0, 0%, 18%)',
    
    // Text
    '--color-text': 'hsl(0, 0%, 95%)',
    '--color-text-muted': 'hsl(0, 0%, 60%)',
    '--color-text-faint': 'hsl(0, 0%, 54%)', // 5.6:1 on surface (WCAG AA)
    
    // Glass & Overlays
    '--color-glass-bg': 'hsla(0, 0%, 12%, 0.6)',
    '--color-glass-border': 'hsla(0, 0%, 100%, 0.1)',
    '--color-glass-subtle-bg': 'hsla(0, 0%, 10%, 0.35)',
    '--color-glass-subtle-border': 'hsla(0, 0%, 100%, 0.05)',
    '--color-glass-solid-bg': 'hsla(0, 0%, 9%, 0.9)',
  }
};
