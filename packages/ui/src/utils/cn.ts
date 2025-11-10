/**
 * Utility for merging class names with tailwind-merge
 * Évite les conflits de classes Tailwind CSS
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names intelligently
 * Combine clsx pour la gestion conditionnelle et twMerge pour résoudre les conflits Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
