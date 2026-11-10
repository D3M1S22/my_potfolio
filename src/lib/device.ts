/**
 * One-time device capability profile. Computed synchronously at import so the
 * very first render already uses the right quality settings (no high→low flash
 * that would rebuild the WebGL context).
 */
export interface DeviceProfile {
  /** Weak CPU / little RAM — use the cheapest rendering path */
  isLowTier: boolean;
  /** Phone or tablet (coarse pointer or mobile UA) */
  isMobile: boolean;
  /** iOS / iPadOS WebKit */
  isIOS: boolean;
  /** Upper bound for the WebGL device-pixel-ratio */
  maxDpr: number;
}

const detect = (): DeviceProfile => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isLowTier: false, isMobile: false, isIOS: false, maxDpr: 2 };
  }
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile =
    isIOS || /Mobi|Android/i.test(ua) || window.matchMedia('(pointer: coarse) and (hover: none)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  // deviceMemory is Chromium-only; assume a capable device when it's missing
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const isLowTier = cores <= 2 || memory <= 4 || (isMobile && cores <= 4);
  const maxDpr = isLowTier ? 1 : isMobile ? 1.5 : 2;
  return { isLowTier, isMobile, isIOS, maxDpr };
};

export const DEVICE: DeviceProfile = detect();
