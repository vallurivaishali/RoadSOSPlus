/**
 * Axios API Client
 *
 * Central HTTP client with:
 * - Base URL from environment
 * - JWT injection via request interceptor
 * - 401 redirect handling via response interceptor
 * - Consistent error formatting
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ── Request interceptor: inject JWT ──────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token is stored in memory (authStore) — accessed here via localStorage
    // as a fallback for page refreshes. HttpOnly cookie is the ideal production approach.
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('roadsos_token')
      : null

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401s ────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Do not hard-redirect if the 401 came from the login endpoint itself
      const isLoginRoute = error.config?.url?.includes('/auth/login');
      if (!isLoginRoute && typeof window !== 'undefined') {
        localStorage.removeItem('roadsos_token')
        // Also clear zustand state from localStorage to ensure complete logout
        localStorage.removeItem('roadsos_auth')
        document.cookie = 'roadsos_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── API Error helper ──────────────────────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ')
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

export default apiClient
