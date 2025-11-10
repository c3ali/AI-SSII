import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text
}
