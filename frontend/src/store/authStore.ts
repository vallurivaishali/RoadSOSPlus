/**
 * Zustand Auth Store
 *
 * Token storage strategy:
 * - localStorage('roadsos_token')  → read by Axios request interceptor
 * - document.cookie('roadsos_token') → read by Next.js Edge middleware
 *
 * Both must be written on login and cleared on logout.
 * This dual-write is the MVP solution; production would use httpOnly cookies exclusively.
 */
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse } from '@/types/auth'

/** Write token to a JS-accessible cookie readable by Next.js middleware */
function setTokenCookie(token: string, expiresInSeconds: number): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + expiresInSeconds * 1000).toUTCString()
  // SameSite=Strict prevents CSRF. Not httpOnly — middleware needs to read it.
  document.cookie = `roadsos_token=${token}; path=/; expires=${expires}; SameSite=Strict`
}

function clearTokenCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = 'roadsos_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (response: AuthResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (response: AuthResponse) => {
        // Write to localStorage for Axios interceptor
        localStorage.setItem('roadsos_token', response.access_token)
        // Write to cookie for Next.js Edge middleware
        setTokenCookie(response.access_token, response.expires_in)

        set({
          user: response.user,
          token: response.access_token,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        localStorage.removeItem('roadsos_token')
        clearTokenCookie()
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'roadsos_auth',       // Single localStorage key for Zustand persist state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // On hydration from localStorage, also re-set the cookie if token exists
      onRehydrateStorage: () => (state) => {
        if (state?.token && state.isAuthenticated) {
          // Re-establish cookie after page refresh (token may still be valid)
          setTokenCookie(state.token, 86400) // 24h default
        }
      },
    }
  )
)
