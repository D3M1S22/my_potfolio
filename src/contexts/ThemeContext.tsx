import { createContext, useEffect, useState, ReactNode } from 'react';
import { THEME_COLORS, ThemeMode } from '@/styles/colors';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Check local storage or system preference on load
    const saved = localStorage.getItem('portfolio-theme') as ThemeMode;
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; // Default to dark
  });

  useEffect(() => {
    // Update local storage
    localStorage.setItem('portfolio-theme', theme);
    
    // Apply dataset for Tailwind/CSS selectors if needed
    document.documentElement.dataset.theme = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Inject CSS variables directly into root
    const root = document.documentElement;
    const colors = THEME_COLORS[theme];
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
