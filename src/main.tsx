import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/outfit/wght.css';
import '@fontsource-variable/roboto-mono/wght.css';
import './index.css';
import { App } from './App';
import { ThemeProvider } from '@/contexts/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
