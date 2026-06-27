'use client'

import { useState, useEffect } from 'react'
import { MapPin, Crosshair, Loader2, Layers } from 'lucide-react'
import { apiClient } from '@/lib/api'
import DynamicMap from '@/components/map/DynamicMap'

export default function AuthorityMapPage() {
  const [riskZones, setRiskZones] = useState([])
  const [allIncidents, setAllIncidents] = useState([])
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]) // Default New Delhi
  const [zoom, setZoom] = useState(13)
  
  // Layer toggles
  const [showZones, setShowZones] = useState(true)
  const [showIncidents, setShowIncidents] = useState(true)

  useEffect(() => {
    // Fetch all Risk Zones
    apiClient.get('/risk-zones/')
      .then(res => setRiskZones(res.data.data))
      .catch(err => console.error("Failed to load risk zones", err))
      
    // Fetch ALL incidents (Authority privilege)
    apiClient.get('/incidents/all?limit=500')
      .then(res => setAllIncidents(res.data.data))
      .catch(err => console.error("Failed to load incidents", err))
  }, [])

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" /> City Overview Map
          </h1>
          <p className="text-slate-400">Macro-level view of all active incidents and generated risk clusters.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass-card p-1.5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400 ml-2" />
            <label className="flex items-center gap-2 px-3 border-l border-slate-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showZones} 
                onChange={(e) => setShowZones(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
              />
              <span className="text-sm text-slate-300">Risk Zones</span>
            </label>
            <label className="flex items-center gap-2 px-3 border-l border-slate-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showIncidents} 
                onChange={(e) => setShowIncidents(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
              />
              <span className="text-sm text-slate-300">Incidents</span>
            </label>
          </div>
        </div>
      </div>

      <div className="w-full min-h-[700px] flex flex-col">
        <DynamicMap 
          incidents={showIncidents ? allIncidents : []}
          riskZones={showZones ? riskZones : []}
          center={center}
          zoom={zoom}
        />
      </div>
    </div>
  )
}
