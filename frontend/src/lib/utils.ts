/**
 * Utility helpers shared across all components.
 *
 * cn()        — merges Tailwind classes safely (clsx + tailwind-merge)
 * formatDate  — human-readable date strings
 * formatRelativeTime — "2 hours ago" style
 * getSeverityClass   — returns the correct badge class for severity
 * getRiskColor       — color string for a 0-100 risk score
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format ISO date string → "Jun 5, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Format ISO date string → "Jun 5, 2026 at 10:32 AM" */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Format relative time → "2 hours ago" */
export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

/** Returns CSS class name for severity badge */
export function getSeverityClass(severity: string | null | undefined): string {
  switch (severity) {
    case 'high':   return 'badge-high'
    case 'medium': return 'badge-medium'
    case 'low':    return 'badge-low'
    default:       return 'badge-low'
  }
}

/** Returns a color string based on 0-100 risk score */
export function getRiskColor(score: number): string {
  if (score >= 70) return '#ef4444'  // red
  if (score >= 40) return '#f59e0b'  // amber
  return '#22c55e'                   // green
}

/** Returns risk level label */
export function getRiskLabel(score: number): string {
  if (score >= 70) return 'High Risk'
  if (score >= 40) return 'Medium Risk'
  return 'Low Risk'
}

/** Capitalize first letter */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

/** Convert snake_case enum value to Title Case label */
export function enumToLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Format distance in km */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}
