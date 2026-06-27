/**
 * SeverityBadge — displays incident severity with appropriate color.
 */
import type { IncidentSeverity } from '@/types/incident'
import { getSeverityClass, enumToLabel } from '@/lib/utils'

interface SeverityBadgeProps {
  severity: IncidentSeverity | null | undefined
  size?: 'sm' | 'md'
}

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  if (!severity) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-500 border border-slate-700">
        Processing...
      </span>
    )
  }

  return (
    <span className={getSeverityClass(severity)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {enumToLabel(severity)}
    </span>
  )
}
