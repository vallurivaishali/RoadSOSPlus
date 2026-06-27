'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Crosshair, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useLocationStore } from '@/store/locationStore'
import DynamicMap from '@/components/map/DynamicMap'

export default function CitizenMapPage() {
  const [riskZones, setRiskZones] = useState([])
  const [myIncidents, setMyIncidents] = useState([])
  const { latitude, longitude, permissionStatus, requestLocation } = useLocationStore()
  const [zoom, setZoom] = useState(13)

  // Use the store location, or default to Delhi
  const center: [number, number] = latitude && longitude 
    ? [latitude, longitude] 
    : [28.6139, 77.2090]

  useEffect(() => {
    // Fetch Risk Zones (public)
    apiClient.get('/risk-zones/')
      .then(res => setRiskZones(res.data.data))
      .catch(err => console.error("Failed to load risk zones", err))
      
    // Fetch user's own reported incidents
    apiClient.get('/incidents/')
      .then(res => setMyIncidents(res.data.data))
      .catch(err => console.error("Failed to load incidents", err))
  }, [])

  useEffect(() => {
    // If the user hasn't granted location or it's not set, request it when visiting map
    if (permissionStatus === 'loading') {
      requestLocation()
    }
  }, [permissionStatus, requestLocation])

  const handleLocateMe = () => {
    requestLocation()
    setZoom(15)
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" /> Interactive Safety Map
          </h1>
          <p className="text-slate-400">View high-risk corridors and your reported incidents.</p>
        </div>
        <button 
          onClick={handleLocateMe}
          disabled={permissionStatus === 'loading'}
          className="btn-secondary flex items-center gap-2"
        >
          {permissionStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          My Location
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        <div className="lg:col-span-3 min-h-[600px] flex flex-col relative">
          {permissionStatus === 'denied' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 text-white px-4 py-2 rounded-full border border-red-500 shadow-xl text-sm flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
               Location permission denied. Click anywhere on the map to set your location manually.
            </div>
          )}
          <DynamicMap 
            incidents={myIncidents}
            riskZones={riskZones}
            center={center}
            zoom={zoom}
            userLocation={latitude && longitude ? [latitude, longitude] : null}
            onLocationSelect={(lat, lng) => {
              if (permissionStatus === 'denied') {
                setLocation(lat, lng)
              }
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-slate-400" /> Map Legend
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Risk Zones</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-500/20 border-2 border-red-500"></span>
                    <span className="text-sm text-slate-300">High Risk (Score 70+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 border-2 border-amber-500"></span>
                    <span className="text-sm text-slate-300">Medium Risk (Score 40-69)</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">My Reports</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 border border-white"></span>
                    <span className="text-sm text-slate-300">High Severity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
                    <span className="text-sm text-slate-300">Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 bg-blue-900/20 border-blue-500/20">
            <h3 className="font-medium text-blue-400 text-sm mb-2">Driving Mode</h3>
            <p className="text-xs text-slate-400">
              When entering a High Risk zone, the app will automatically notify you. Keep the app open while driving.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
