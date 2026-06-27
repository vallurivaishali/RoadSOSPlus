'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface AnalyticsSummary {
  total_incidents: number
  total_near_misses: number
  active_incidents: number
  verified_incidents: number
  resolved_incidents: number
  rejected_incidents: number
  high_severity_count: number
  medium_severity_count: number
  low_severity_count: number
  high_risk_zone_count: number
  avg_risk_score: number
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/analytics/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error("Failed to load analytics", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!summary) return null

  const totalReports = summary.total_incidents + summary.total_near_misses
  const incidentPct = totalReports > 0 ? (summary.total_incidents / totalReports) * 100 : 0
  const nearMissPct = totalReports > 0 ? (summary.total_near_misses / totalReports) * 100 : 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" /> Analytics & Trends
        </h1>
        <p className="text-slate-400">Deep dive into historical accident data and near-miss predictions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Severity Breakdown Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Incident Severity Breakdown</h3>
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <div className="h-48 flex items-end justify-center gap-8 border-b border-slate-700 pb-2">
            {[
              { label: 'Low', value: summary.low_severity_count, color: 'bg-blue-500/50' },
              { label: 'Medium', value: summary.medium_severity_count, color: 'bg-amber-500/50' },
              { label: 'High', value: summary.high_severity_count, color: 'bg-red-500/50' }
            ].map((stat, i) => {
              const max = Math.max(summary.low_severity_count, summary.medium_severity_count, summary.high_severity_count, 1)
              const heightPct = (stat.value / max) * 100
              return (
                <div key={i} className="w-20 flex flex-col items-center gap-2 group relative">
                  <span className="absolute -top-6 text-xs text-slate-300 font-medium">
                    {stat.value}
                  </span>
                  <div 
                    className={`w-full ${stat.color} rounded-t-sm transition-all`}
                    style={{ height: `${heightPct}%`, minHeight: '10%' }}
                  />
                  <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Near Miss vs Accidents Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Near Misses vs Accidents</h3>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="h-48 flex items-end justify-center gap-12 border-b border-slate-700 pb-2">
            <div className="w-28 flex flex-col items-center gap-2 relative">
              <span className="absolute -top-6 text-xs text-slate-300 font-medium">
                {summary.total_near_misses}
              </span>
              <div 
                className="w-full bg-emerald-500/50 rounded-t-sm transition-all" 
                style={{ height: `${Math.max(nearMissPct, 10)}%` }} 
              />
              <span className="text-xs text-slate-500 font-medium">Near Misses</span>
            </div>
            <div className="w-28 flex flex-col items-center gap-2 relative">
              <span className="absolute -top-6 text-xs text-slate-300 font-medium">
                {summary.total_incidents}
              </span>
              <div 
                className="w-full bg-red-500/50 rounded-t-sm transition-all" 
                style={{ height: `${Math.max(incidentPct, 10)}%` }} 
              />
              <span className="text-xs text-slate-500 font-medium">Accidents</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-6">Overall Risk Assessment</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
            <p className="text-sm text-slate-400 mb-1">Average Risk Score</p>
            <p className="text-2xl font-bold text-amber-400">{summary.avg_risk_score.toFixed(1)}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
            <p className="text-sm text-slate-400 mb-1">Active Risk Zones</p>
            <p className="text-2xl font-bold text-red-400">{summary.high_risk_zone_count}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
            <p className="text-sm text-slate-400 mb-1">Resolved Incidents</p>
            <p className="text-2xl font-bold text-emerald-400">{summary.resolved_incidents}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
            <p className="text-sm text-slate-400 mb-1">Total Verified</p>
            <p className="text-2xl font-bold text-blue-400">{summary.verified_incidents}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
