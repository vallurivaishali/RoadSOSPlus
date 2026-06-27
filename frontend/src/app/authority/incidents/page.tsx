'use client'

import { useState, useEffect } from 'react'
import { Filter, Loader2, CheckCircle2, XCircle, FileText, Search } from 'lucide-react'
import { apiClient, getErrorMessage } from '@/lib/api'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { AISummaryCard } from '@/components/shared/AISummaryCard'
import { formatRelativeTime } from '@/lib/utils'
import type { Incident, IncidentStatus } from '@/types/incident'

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all')

  const fetchIncidents = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/incidents/all')
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
    fetchIncidents()
  }, [])

  const handleStatusUpdate = async (incidentId: string, newStatus: IncidentStatus, notes?: string) => {
    try {
      await apiClient.patch(`/incidents/${incidentId}/status`, {
        status: newStatus,
        authority_notes: notes || `Marked as ${newStatus}`
      })
      // Optimistic update
      setIncidents(prev => prev.map(inc => 
        inc.id === incidentId ? { ...inc, status: newStatus } : inc
      ))
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  const filteredIncidents = incidents.filter(inc => 
    statusFilter === 'all' ? true : inc.status === statusFilter
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" /> Incident Management
          </h1>
          <p className="text-slate-400">Review, verify, and resolve reports submitted by citizens.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search address..." 
              className="input-field pl-9 w-full"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              className="input-field pl-9 appearance-none bg-slate-800"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-sm font-medium">
                  <th className="p-4">Location & Time</th>
                  <th className="p-4">AI Analysis</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No incidents found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 align-top">
                        <p className="font-medium text-white mb-1">{incident.address || `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}</p>
                        <p className="text-xs text-slate-400 mb-3">{formatRelativeTime(incident.created_at)}</p>
                        
                        <p className="text-sm text-slate-300 max-w-xs line-clamp-2">
                          <span className="text-slate-500">Citizen:</span> {incident.description}
                        </p>
                      </td>
                      
                      <td className="p-4 align-top">
                        <div className="mb-2">
                          <SeverityBadge severity={incident.ai_severity} />
                        </div>
                        {incident.ai_processed ? (
                          <div className="mt-3">
                            <AISummaryCard summary={incident.ai_summary || ''} />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">AI processing...</span>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <StatusBadge status={incident.status} />
                      </td>

                      <td className="p-4 align-top text-right space-y-2">
                        {incident.status === 'pending' && (
                          <div className="flex flex-col gap-2 items-end">
                            <button 
                              onClick={() => handleStatusUpdate(incident.id, 'verified')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(incident.id, 'rejected', 'Spam report')}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        {incident.status === 'verified' && (
                          <button 
                            onClick={() => handleStatusUpdate(incident.id, 'resolved', 'Issue cleared by authority')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                          </button>
                        )}
                        {incident.status === 'resolved' && (
                          <span className="text-xs text-emerald-500 font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
