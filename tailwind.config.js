/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit Variable"', 'Outfit', '"Inter Variable"', 'sans-serif'],
        mono: ['"Roboto Mono Variable"', '"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--color-surface)',
          50: 'var(--color-surface-50)',
          100: 'var(--color-surface-100)',
          200: 'var(--color-surface-200)',
        },
        accent: {
          DEFAULT: 'hsl(250, 90%, 65%)',
          light: 'hsl(250, 90%, 78%)',
          dark: 'hsl(250, 80%, 50%)',
        },
        cyan: {
          DEFAULT: 'hsl(185, 85%, 55%)',
          light: 'hsl(185, 85%, 70%)',
        },
        magenta: {
          DEFAULT: 'hsl(320, 80%, 60%)',
          light: 'hsl(320, 80%, 75%)',
        },
        gold: {
          DEFAULT: 'hsl(42, 90%, 60%)',
          light: 'hsl(42, 90%, 75%)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          faint: 'var(--color-text-faint)',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};