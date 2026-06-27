'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatRelativeTime } from '@/lib/utils'
import type { Incident } from '@/types/incident'
import type { RiskZone } from '@/app/authority/risk-zones/page'
import { AISummaryCard } from '@/components/shared/AISummaryCard'

// Fix Leaflet's default marker icon paths in Next.js
// @ts-expect-error leaflet hack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom markers based on severity/status
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })
}

const highSeverityIcon = createIcon('#ef4444') // red
const mediumSeverityIcon = createIcon('#f59e0b') // amber
const lowSeverityIcon = createIcon('#3b82f6') // blue
const resolvedIcon = createIcon('#10b981') // emerald
const youAreHereIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #8b5cf6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(139,92,246,0.8); display: flex; align-items: center; justify-content: center;"><div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
})

// Component to handle dynamic map recentering
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 })
  }, [center, zoom, map])
  return null
}

function LocationSelector({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    }
  })
  return null
}

interface MapClientProps {
  incidents: Incident[]
  riskZones: RiskZone[]
  center: [number, number]
  zoom: number
  userLocation?: [number, number] | null
  onLocationSelect?: (lat: number, lng: number) => void
}

export default function MapClient({ incidents, riskZones, center, zoom, userLocation, onLocationSelect }: MapClientProps) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapController center={center} zoom={zoom} />
        {onLocationSelect && <LocationSelector onLocationSelect={onLocationSelect} />}
        
        {/* Free OSM Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Risk Zones as colored circles */}
        {riskZones.map((zone) => {
          let color = '#10b981' // emerald
          if (zone.risk_score >= 70) color = '#ef4444' // red
          else if (zone.risk_score >= 40) color = '#f59e0b' // amber

          return (
            <Circle
              key={zone.id}
              center={[zone.center_latitude, zone.center_longitude]}
              radius={zone.radius_meters}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-slate-800 text-base mb-1">{zone.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Risk Score</span>
                    <span className="font-black text-lg" style={{ color }}>{zone.risk_score}/100</span>
                  </div>
                  
                  {zone.contributing_factors && (
                    <div className="mb-3 space-y-2">
                      <div className="flex justify-between text-sm border-b pb-1">
                        <span className="text-slate-600">Total Accidents</span>
                        <span className="font-bold text-slate-800">{zone.accident_count}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b pb-1">
                        <span className="text-slate-600">Near Misses</span>
                        <span className="font-bold text-slate-800">{zone.near_miss_count}</span>
                      </div>
                    </div>
                  )}
                  {zone.contributing_factors?.recommendations?.[0] && (
                    <div className="bg-slate-50 p-2 rounded text-xs text-slate-700 italic border-l-2 border-blue-500">
                      &quot; {zone.contributing_factors.recommendations[0]} &quot;
                    </div>
                  )}
                </div>
              </Popup>
            </Circle>
          )
        })}

        {/* Render Incidents as markers */}
        {incidents.map((incident) => {
          let icon = lowSeverityIcon
          if (incident.status === 'resolved') icon = resolvedIcon
          else if (incident.ai_severity === 'high') icon = highSeverityIcon
          else if (incident.ai_severity === 'medium') icon = mediumSeverityIcon

          return (
            <Marker 
              key={incident.id} 
              position={[incident.latitude, incident.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
                      incident.status === 'resolved' ? 'bg-emerald-500' :
                      incident.ai_severity === 'high' ? 'bg-red-500' :
                      incident.ai_severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {incident.status === 'resolved' ? 'RESOLVED' : incident.ai_severity}
                    </span>
                    <span className="text-xs text-slate-500">{formatRelativeTime(incident.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mb-2">{incident.description}</p>
                  {incident.ai_summary && (
                    <div className="mt-2 min-w-[300px]">
                      <AISummaryCard summary={incident.ai_summary} />
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* You Are Here Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={youAreHereIcon}>
            <Popup>
              <div className="p-1 text-center">
                <span className="font-bold text-violet-600 text-sm block">📍 You Are Here</span>
                <span className="text-xs text-slate-500">Current GPS Location</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
