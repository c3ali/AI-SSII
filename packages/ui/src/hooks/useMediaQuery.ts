/**
 * useMediaQuery hook
 * Hook pour gérer les media queries
 */

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define callback for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * Preset breakpoint hooks
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

export function useIsSmall(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsMedium(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1280px)');
}

export function useIsLarge(): boolean {
  return useMediaQuery('(min-width: 1281px)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}
