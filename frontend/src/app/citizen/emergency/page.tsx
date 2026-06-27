'use client'

import { useState } from 'react'
import { Phone, Navigation, Hospital, ShieldAlert, Loader2, MapPin } from 'lucide-react'

import { useLocationStore } from '@/store/locationStore'
import { calculateDistance, formatDistance } from '@/lib/geo'

// Base coordinates roughly around Delhi to calculate against if user is also in Delhi
const MOCK_SERVICES_COORDS = [
  { id: 1, type: 'hospital', name: 'City General Hospital', lat: 28.6149, lng: 77.2100, phone: '+91 11 2345 6789' },
  { id: 2, type: 'police', name: 'Central Police Station', lat: 28.6250, lng: 77.2150, phone: '100' },
  { id: 3, type: 'hospital', name: 'Metro Trauma Center', lat: 28.6000, lng: 77.2200, phone: '+91 11 9876 5432' },
]

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const { latitude, longitude, requestLocation, permissionStatus } = useLocationStore()

  const handleSearch = () => {
    setLoading(true)
    
    // If not located yet, request it
    if (permissionStatus === 'prompt' || permissionStatus === 'loading') {
      requestLocation()
    }

    // Simulate OSM API Call delay
    setTimeout(() => {
      let mappedServices = MOCK_SERVICES_COORDS.map(s => ({
        ...s,
        distanceVal: (latitude && longitude) ? calculateDistance(latitude, longitude, s.lat, s.lng) : Math.random() * 5 + 1
      }))
      
      mappedServices.sort((a, b) => a.distanceVal - b.distanceVal)
      
      setServices(mappedServices.map(s => ({
        ...s,
        distance: formatDistance(s.distanceVal)
      })))

      setLoading(false)
      setSearched(true)
    }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Phone className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Emergency Assistance</h1>
        <p className="text-slate-400 text-lg">
          If someone is seriously injured, call <span className="text-white font-bold tracking-widest bg-red-500/20 px-2 py-0.5 rounded">112</span> immediately.
        </p>
      </div>

      <div className="glass-card p-6 mb-8 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Find Nearby Services</h3>
        <p className="text-sm text-slate-400 mb-6">
          We will use your GPS location to find the closest hospitals and police stations using OpenStreetMap data.
        </p>
        <button 
          onClick={handleSearch} 
          disabled={loading}
          className="btn-primary py-3 px-8 text-base !bg-red-600 hover:!bg-red-700 border-red-500 shadow-lg shadow-red-500/20"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Locating...</>
          ) : (
            <><MapPin className="w-5 h-5" /> Locate Nearby Help</>
          )}
        </button>
      </div>

      {searched && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-white mb-4">Closest Services Found:</h3>
          {services.map((service) => (
            <div key={service.id} className="glass-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  service.type === 'hospital' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                } border`}>
                  {service.type === 'hospital' ? <Hospital className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg">{service.name}</h4>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                    <Navigation className="w-3.5 h-3.5" /> {service.distance} away
                  </p>
                </div>
              </div>
              <a href={`tel:${service.phone.replace(/\s+/g, '')}`} className="btn-secondary">
                <Phone className="w-4 h-4" /> Call
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
