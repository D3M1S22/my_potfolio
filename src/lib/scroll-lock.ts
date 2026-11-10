/**
 * Locks page scrolling while a modal is open. SmoothScroll listens for the
 * event to pause Lenis (and iOS scroll normalisation), so wheel/touch input
 * inside the modal scrolls the modal and the page stays put.
 */
export const SCROLL_LOCK_EVENT = 'portfolio:scroll-lock';

export const setScrollLocked = (locked: boolean) => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.overflow = locked ? 'hidden' : '';
  window.dispatchEvent(new CustomEvent<boolean>(SCROLL_LOCK_EVENT, { detail: locked }));
};
