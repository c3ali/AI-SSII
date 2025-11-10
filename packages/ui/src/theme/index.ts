/**
 * Design System Theme
 * Export central pour tous les tokens de design
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './animations';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, sizes, zIndex } from './spacing';

/**
 * Theme complet
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  sizes,
  zIndex,
} as const;

export type Theme = typeof theme;
