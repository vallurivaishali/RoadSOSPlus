/**
 * StatusBadge — displays incident workflow status with color.
 */
import { cn } from '@/lib/utils'
import type { IncidentStatus } from '@/types/incident'

const STATUS_CONFIG: Record<IncidentStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending Review',
    className: 'bg-slate-800 text-slate-400 border-slate-700',
  },
  verified: {
    label: 'Verified',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
}

interface StatusBadgeProps {
  status: IncidentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        config.className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}
