import { create } from 'zustand'

interface LocationState {
  latitude: number | null
  longitude: number | null
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'loading'
  setLocation: (lat: number, lng: number) => void
  setPermissionStatus: (status: 'prompt' | 'granted' | 'denied' | 'loading') => void
  requestLocation: () => void
}

// Default to New Delhi if denied/unavailable, but start as null to wait for GPS
const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.2090;

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  permissionStatus: 'loading',
  
  setLocation: (lat, lng) => set({ latitude: lat, longitude: lng, permissionStatus: 'granted' }),
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  
  requestLocation: async () => {
    set({ permissionStatus: 'loading' })

    // Try IP Geolocation first as a quick fallback so they don't stare at Delhi
    try {
      const ipRes = await fetch('https://ipapi.co/json/')
      const ipData = await ipRes.json()
      if (ipData.latitude && ipData.longitude) {
        set((state) => {
          // Only use IP location if we haven't already gotten GPS location
          if (state.permissionStatus === 'loading') {
            return {
              latitude: ipData.latitude,
              longitude: ipData.longitude,
            }
          }
          return state
        })
      }
    } catch (e) {
      console.log("IP Geolocation failed", e)
    }

    if (typeof navigator !== 'undefined' && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          set({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            permissionStatus: 'granted'
          })
        },
        (error) => {
          console.warn("Geolocation error or blocked by browser:", error)
          set((state) => ({
            // Keep the IP location if we got it, otherwise Delhi
            latitude: state.latitude || DEFAULT_LAT,
            longitude: state.longitude || DEFAULT_LNG,
            permissionStatus: 'denied'
          }))
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      )
    } else {
      set((state) => ({
        latitude: state.latitude || DEFAULT_LAT,
        longitude: state.longitude || DEFAULT_LNG,
        permissionStatus: 'denied'
      }))
    }
  }
}))
