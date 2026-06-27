'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Loader2, RefreshCw } from 'lucide-react'
import { apiClient, getErrorMessage } from '@/lib/api'

interface ContributingFactors {
  trend_direction: 'up' | 'down' | 'flat'
  trend_percentage: number
  common_categories: string[]
  recommendations: string[]
}

export interface RiskZone {
  id: string
  name: string
  description: string
  center_latitude: number
  center_longitude: number
  radius_meters: number
  risk_score: number
  accident_count: number
  near_miss_count: number
  high_severity_count: number
  contributing_factors?: ContributingFactors
  last_calculated_at: string
}

export default function HotspotDetectionPage() {
  const [zones, setZones] = useState<RiskZone[]>([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchZones = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/risk-zones/')
      setZones(res.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchZones()
  }, [])

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      await apiClient.post('/risk-zones/recalculate')
      await fetchZones()
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setRecalculating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400 border-red-500/30 bg-red-500/10'
    if (score >= 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" /> Hotspot Detection
          </h1>
          <p className="text-slate-400">AI-driven analysis of accident clusters, trends, and targeted safety recommendations.</p>
        </div>
        <button 
          onClick={handleRecalculate} 
          disabled={recalculating}
          className="btn-primary whitespace-nowrap"
        >
          {recalculating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Recalculating...</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Run Risk Engine</>
          )}
        </button>
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
      ) : zones.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Risk Zones Detected</h3>
          <p className="text-slate-400 mb-6">The Risk Engine has not generated any clusters yet, or there is not enough data.</p>
          <button onClick={handleRecalculate} className="btn-secondary">Run Engine Now</button>
        </div>
      ) : (
        <div className="space-y-6">
          {zones.map((zone) => (
            <div key={zone.id} className="glass-card overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-slate-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-white">{zone.name}</h2>
                    {zone.contributing_factors?.trend_direction === 'up' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        <TrendingUp className="w-3 h-3" /> +{zone.contributing_factors.trend_percentage}% trend
                      </span>
                    )}
                    {zone.contributing_factors?.trend_direction === 'down' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <TrendingDown className="w-3 h-3" /> -{zone.contributing_factors.trend_percentage}% trend
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {zone.center_latitude.toFixed(4)}, {zone.center_longitude.toFixed(4)} ({zone.radius_meters}m radius)
                  </p>
                </div>
                
                <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[100px] ${getScoreColor(zone.risk_score)}`}>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-0.5">Risk Score</span>
                  <span className="text-2xl font-black">{zone.risk_score}<span className="text-sm opacity-60">/100</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
                {/* Stats */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Incidents</p>
                    <p className="text-xl font-semibold text-white">{zone.accident_count}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">High Severity</p>
                      <p className="text-lg font-medium text-red-400">{zone.high_severity_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Near Misses</p>
                      <p className="text-lg font-medium text-amber-400">{zone.near_miss_count}</p>
                    </div>
                  </div>
                </div>

                {/* Common Categories */}
                <div className="p-6">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Common Incident Types
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {zone.contributing_factors?.common_categories.map((cat, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-slate-300 capitalize">
                        {cat.replace('_', ' ')}
                      </span>
                    ))}
                    {(!zone.contributing_factors?.common_categories || zone.contributing_factors.common_categories.length === 0) && (
                      <span className="text-sm text-slate-500 italic">Not enough data points yet.</span>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-6 bg-blue-900/10">
                  <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Authority Recommendations
                  </p>
                  <ul className="space-y-3">
                    {zone.contributing_factors?.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                    {(!zone.contributing_factors?.recommendations || zone.contributing_factors.recommendations.length === 0) && (
                      <li className="text-sm text-slate-500 italic">Run risk engine to generate insights.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
