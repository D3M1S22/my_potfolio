import { useState, useEffect } from 'react';

export const useDevicePerformance = () => {
  // Assume high tier by default to prevent flashing degraded UI on fast devices
  const [isLowTier, setIsLowTier] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return;

    // 1. Hardware Concurrency (Cores)
    const cores = navigator.hardwareConcurrency || 4;

    // 2. Mobile Device Detection
    const isMobile = 
      window.matchMedia('(max-width: 768px)').matches || 
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 3. Device Memory (RAM) - Chromium only feature, fallback to 8 if unavailable
    // @ts-ignore
    const memory = navigator.deviceMemory || 8;

    // Heuristics for Low Tier:
    // - Any device with 2 or fewer cores
    // - Any device with <= 4GB RAM
    // - Mobile devices with <= 4 cores
    if (cores <= 2 || memory <= 4 || (isMobile && cores <= 4)) {
      setIsLowTier(true);
    }
  }, []);

  return { isLowTier };
};
