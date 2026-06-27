'use client'

import { useEffect, useState } from 'react'
import { AlertOctagon, CheckCircle, ShieldAlert, Activity, ArrowUpRight } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { MetricCard } from '@/components/shared/MetricCard'

interface AnalyticsSummary {
  total_incidents: number
  active_incidents: number
  total_near_misses: number
  pending_verifications: number
  high_severity_count: number
}

export default function AuthorityDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/analytics/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error("Failed to load summary", err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Authority Dashboard</h1>
        <p className="text-slate-400">Overview of road safety metrics and pending action items.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Pending Verification"
          value={loading ? "..." : summary?.pending_verifications || 0}
          icon={AlertOctagon}
          trend={{ value: 3, label: "today", positive: false }}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="Active Incidents"
          value={loading ? "..." : summary?.active_incidents || 0}
          icon={Activity}
          trend={{ value: 12, label: "resolved", positive: true }}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="High Severity Incidents"
          value={loading ? "..." : summary?.high_severity_count || 0}
          icon={ShieldAlert}
          trend={{ value: 5, label: "critical", positive: false }}
          iconColor="text-red-400"
          iconBg="bg-red-500/10 border-red-500/20"
        />
        <MetricCard
          title="Total Near Misses"
          value={loading ? "..." : summary?.total_near_misses || 0}
          icon={CheckCircle}
          trend={{ value: 24, label: "this week", positive: true }}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Pending Incidents list (mocked layout) */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Needs Attention</h3>
            <a href="/authority/incidents" className="text-sm text-blue-400 hover:text-blue-300">View All</a>
          </div>
          
          {loading ? (
            <div className="text-slate-400 py-10 text-center animate-pulse">Loading items...</div>
          ) : summary?.pending_verifications === 0 ? (
            <div className="text-slate-400 py-10 text-center">No pending verifications. Good job!</div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20">Action Required</span>
                  </div>
                  <p className="text-white font-medium">There are {summary?.pending_verifications || 0} incident(s) waiting for your review.</p>
                </div>
                <a href="/authority/incidents" className="btn-secondary text-sm">Review Now</a>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/authority/incidents" className="flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
              <span className="text-sm font-medium text-white">Review Pending Incidents</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </a>
            <a href="/authority/risk-zones" className="flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
              <span className="text-sm font-medium text-white">Manage Risk Zones</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </a>
            <a href="/authority/map" className="flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
              <span className="text-sm font-medium text-white">View Heatmap</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
