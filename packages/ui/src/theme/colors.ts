/**
 * Design System Colors
 * Palette complète pour la plateforme SSII IA
 */

export const colors = {
  // Primary - Bleu (Identité de marque)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary - Violet (Accents)
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Gray - Niveaux de gris
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic colors - États
  success: {
    DEFAULT: '#10b981',
    light: '#34d399',
    dark: '#059669',
    bg: '#d1fae5',
    border: '#6ee7b7',
  },

  warning: {
    DEFAULT: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    bg: '#fef3c7',
    border: '#fcd34d',
  },

  error: {
    DEFAULT: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    bg: '#fee2e2',
    border: '#fca5a5',
  },

  info: {
    DEFAULT: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    bg: '#dbeafe',
    border: '#93c5fd',
  },

  // Neutral - Texte et backgrounds
  neutral: {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },

  // Agent Status colors
  agent: {
    idle: '#6b7280',
    running: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },

  // Gradient presets
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    cool: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    sunset: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
  },
} as const;

export type ColorScale = keyof typeof colors.primary;
export type ColorName = keyof typeof colors;

/**
 * Get color value from palette
 */
export function getColor(color: ColorName, shade?: ColorScale): string {
  const colorObj = colors[color];
  if (typeof colorObj === 'string') return colorObj;
  if (shade && typeof colorObj === 'object' && shade in colorObj) {
    return (colorObj as any)[shade];
  }
  return (colorObj as any).DEFAULT || (colorObj as any)[500] || '#000000';
}

/**
 * Convert hex to rgba
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
