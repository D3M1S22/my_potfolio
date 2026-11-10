import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Non-hook read for module scope / GSAP setup code. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

/** Live-updating flag for the OS "reduce motion" accessibility setting. */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
};
