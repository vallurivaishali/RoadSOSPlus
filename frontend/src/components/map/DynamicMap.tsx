'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamically import the MapClient with SSR disabled.
// This prevents Next.js from throwing "window is not defined" errors during server-side rendering.
const MapClient = dynamic(
  () => import('./MapClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p>Loading interactive map...</p>
      </div>
    )
  }
)

import type { Incident } from '@/types/incident'
import type { RiskZone } from '@/app/authority/risk-zones/page'

interface DynamicMapProps {
  incidents?: Incident[]
  riskZones?: RiskZone[]
  center?: [number, number]
  zoom?: number
  userLocation?: [number, number] | null
  onLocationSelect?: (lat: number, lng: number) => void
}

export default function DynamicMap({ 
  incidents = [], 
  riskZones = [], 
  center = [28.6139, 77.2090], // Default New Delhi
  zoom = 13,
  userLocation = null,
  onLocationSelect
}: DynamicMapProps) {
  return (
    <MapClient 
      incidents={incidents}
      riskZones={riskZones}
      center={center}
      zoom={zoom}
      userLocation={userLocation}
      onLocationSelect={onLocationSelect}
    />
  )
}
