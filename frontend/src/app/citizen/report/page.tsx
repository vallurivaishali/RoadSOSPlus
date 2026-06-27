'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Upload, MapPin, CheckCircle, Loader2 } from 'lucide-react'
import { apiClient, getErrorMessage } from '@/lib/api'

export default function ReportAccidentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lat || !lng) {
      setError('Please provide a location')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      let mediaUrl = null
      
      // 1. Upload image if present
      if (image) {
        const formData = new FormData()
        formData.append('file', image)
        const res = await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        mediaUrl = res.data.url
      }

      // 2. Submit incident report
      await apiClient.post('/incidents/', {
        latitude: lat,
        longitude: lng,
        address,
        description,
        media_urls: mediaUrl ? [mediaUrl] : []
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
          Your report has been received and is being analyzed by our AI system. Authorities have been notified.
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
          <AlertTriangle className="w-6 h-6 text-red-400" /> Report Accident
        </h1>
        <p className="text-slate-400">
          Provide details about the accident. If there are critical injuries, please call emergency services immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

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
              placeholder="Or enter nearest landmark / address"
              className="input-field flex-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          {lat && lng && (
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Location captured ({lat.toFixed(4)}, {lng.toFixed(4)})
            </p>
          )}
        </div>

        {/* Description Section */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">What happened?</h3>
          <textarea
            rows={4}
            placeholder="Describe the incident. E.g. Two cars collided at the intersection. No injuries visible."
            className="input-field w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Media Section */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Photo Evidence (Optional)</h3>
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-700">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md text-white hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/50 hover:border-blue-500/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">Click to upload or take a photo</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base shadow-lg shadow-blue-500/20">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Report...</>
          ) : (
            'Submit Accident Report'
          )}
        </button>
      </form>
    </div>
  )
}
