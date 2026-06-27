'use client'

import { useEffect, useState } from 'react'
import { FileText, MapPin, AlertTriangle, ArrowUpRight, Loader2, CheckCircle, Navigation } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useLocationStore } from '@/store/locationStore'
import { calculateDistance, formatDistance } from '@/lib/geo'
import { MetricCard } from '@/components/shared/MetricCard'
import Link from 'next/link'

interface DashboardData {
  incidents: any[]
  nearMisses: any[]
  riskZones: number
}

export default function CitizenDashboard() {
  const { user } = useAuth()
  const { latitude, longitude } = useLocationStore()
  const [data, setData] = useState<DashboardData>({ incidents: [], nearMisses: [], riskZones: 0 })
  const [riskZonesList, setRiskZonesList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, nmRes, rzRes] = await Promise.all([
          apiClient.get('/incidents/'),
          apiClient.get('/near-miss/'),
          apiClient.get('/risk-zones/')
        ])
        
        setData({
          incidents: incRes.data.data || [],
          nearMisses: nmRes.data.data || [],
          riskZones: rzRes.data.data?.length || 0
        })
        setRiskZonesList(rzRes.data.data || [])
      } catch (err) {
        console.error("Failed to fetch citizen dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const recentActivity = [...data.incidents, ...data.nearMisses]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Calculate nearby alerts
  const nearbyAlerts = [...data.incidents.filter(i => i.status !== 'resolved'), ...riskZonesList]
    .map(item => {
      // RiskZones have center_latitude, Incidents have latitude
      const lat = item.center_latitude || item.latitude
      const lng = item.center_longitude || item.longitude
      const isRiskZone = !!item.center_latitude
      
      const distance = (latitude && longitude && lat && lng) 
        ? calculateDistance(latitude, longitude, lat, lng)
        : 9999
        
      return { ...item, isRiskZone, distanceVal: distance }
    })
    .filter(item => item.distanceVal < 50) // within 50km
    .sort((a, b) => a.distanceVal - b.distanceVal)
    .slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Citizen'}</h1>
        <p className="text-slate-400">Here is an overview of your reports and local safety metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Accident Reports"
          value={data.incidents.length}
          icon={FileText}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="Near Misses"
          value={data.nearMisses.length}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="Nearby Risk Zones"
          value={data.riskZones}
          icon={MapPin}
          iconColor="text-red-400"
          iconBg="bg-red-500/10 border-red-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <Link href="/citizen/my-reports" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-slate-400 py-10 text-center">You haven't submitted any reports yet.</div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        item.hazard_type ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'
                      }`}>
                        {item.hazard_type ? 'Near Miss' : 'Accident'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        item.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 
                        item.status === 'resolved' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 
                        'bg-slate-500/20 text-slate-400 border-slate-500/20'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white font-medium truncate max-w-[300px]">{item.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <Link href="/citizen/my-reports" className="btn-secondary text-sm shrink-0">View Details</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/citizen/report" className="flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
              <span className="text-sm font-medium text-white">Report Accident</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link href="/citizen/near-miss" className="flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
              <span className="text-sm font-medium text-white">Report Near Miss</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link href="/citizen/map" className="flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
              <span className="text-sm font-medium text-white">View Safety Map</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
          
          {/* Nearby Alerts */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-400" /> Nearby Alerts
            </h3>
            {!latitude ? (
              <p className="text-xs text-slate-400">Location permission required to show nearby alerts.</p>
            ) : nearbyAlerts.length === 0 ? (
              <p className="text-xs text-slate-400">No recent alerts within 50km.</p>
            ) : (
              <div className="space-y-3">
                {nearbyAlerts.map(alert => (
                  <div key={alert.id || alert.name} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                    <div>
                      <p className="text-sm text-slate-200 line-clamp-2">
                        {alert.isRiskZone ? `High Risk Zone: ${alert.name}` : `Incident: ${alert.description}`}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Navigation className="w-3 h-3" /> {formatDistance(alert.distanceVal)} away
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
