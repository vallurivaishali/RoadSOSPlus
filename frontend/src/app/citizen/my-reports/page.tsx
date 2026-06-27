'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, RefreshCw } from 'lucide-react'
import { apiClient, getErrorMessage } from '@/lib/api'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { AISummaryCard } from '@/components/shared/AISummaryCard'
import { formatRelativeTime } from '@/lib/utils'
import type { Incident } from '@/types/incident'

export default function MyReportsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/incidents/')
      setIncidents(res.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports()
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" /> My Reports
          </h1>
          <p className="text-slate-400">Track the status of your submitted accident reports.</p>
        </div>
        <button onClick={fetchReports} className="btn-secondary" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && incidents.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No reports yet</h3>
          <p className="text-slate-400">When you report an accident, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="glass-card p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={incident.status} />
                    <SeverityBadge severity={incident.ai_severity} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{incident.address}</h3>
                  <p className="text-sm text-slate-400">Reported {formatRelativeTime(incident.created_at)}</p>
                </div>
                {incident.media?.[0]?.cloudinary_url && (
                  <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-slate-700 hidden sm:block">
                    <img src={incident.media[0].cloudinary_url} alt="Incident" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-slate-400">Your Description:</span><br/>
                  {incident.description}
                </p>
                
                {incident.ai_processed ? (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <AISummaryCard summary={incident.ai_summary || ''} />
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI is currently analyzing this report...
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
