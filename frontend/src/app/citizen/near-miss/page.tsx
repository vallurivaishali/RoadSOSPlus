'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, AlertOctagon, CheckCircle, Loader2 } from 'lucide-react'
import { apiClient, getErrorMessage } from '@/lib/api'

const HAZARD_TYPES = [
  { id: 'blind_turn', label: 'Blind Turn' },
  { id: 'poor_lighting', label: 'Poor Lighting' },
  { id: 'missing_signboard', label: 'Missing Signboard' },
  { id: 'dangerous_intersection', label: 'Dangerous Intersection' },
  { id: 'pothole', label: 'Pothole/Bad Road' },
  { id: 'frequent_speeding', label: 'Frequent Speeding Area' },
  { id: 'waterlogging', label: 'Waterlogging' },
  { id: 'other', label: 'Other Hazard' },
]

export default function NearMissPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [hazardType, setHazardType] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [address, setAddress] = useState('')

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        setError(null)
      },
      (err) => setError(`Location error: ${err.message}`)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lat || !lng) {
      setError('Please provide a location')
      return
    }
    if (!hazardType) {
      setError('Please select a hazard type')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      await apiClient.post('/near-miss/', {
        latitude: lat,
        longitude: lng,
        address,
        hazard_type: hazardType,
        description,
        injury_involved: false,
        media_urls: []
      })

      setSuccess(true)
      setTimeout(() => router.push('/citizen/my-reports'), 2000)

    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-12 glass-card p-10 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
        <p className="text-slate-400 mb-6">
          Thank you. Your near-miss report helps us identify risk zones before accidents happen.
        </p>
        <button onClick={() => router.push('/citizen/my-reports')} className="btn-primary w-full">
          View My Reports
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-amber-400" /> Log Near Miss / Hazard
        </h1>
        <p className="text-slate-400">
          Did you almost have an accident? Is there a dangerous pothole? Report it here to build our safety map.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Hazard Type Selection */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">What kind of hazard?</h3>
          <div className="grid grid-cols-2 gap-3">
            {HAZARD_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setHazardType(type.id)}
                className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                  hazardType === type.id 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Location</h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLocationClick}
              className="btn-secondary whitespace-nowrap"
            >
              <MapPin className="w-4 h-4" /> Get Current Location
            </button>
            <input
              type="text"
              placeholder="Nearest landmark"
              className="input-field flex-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Additional Details</h3>
          <textarea
            rows={3}
            placeholder="Describe the near-miss or hazard in more detail..."
            className="input-field w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base !bg-amber-600 hover:!bg-amber-700 shadow-lg shadow-amber-500/20 border-amber-500">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
          ) : (
            'Submit Hazard Report'
          )}
        </button>
      </form>
    </div>
  )
}
