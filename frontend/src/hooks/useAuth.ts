/**
 * useAuth hook — wraps auth store + API calls for components.
 * Handles loading states, error messages, and post-login navigation.
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import apiClient, { getErrorMessage } from '@/lib/api'
import type { LoginPayload, RegisterPayload } from '@/types/auth'

export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.post('/auth/register', payload)
      setAuth(data)
      router.push('/citizen')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (payload: LoginPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.post('/auth/login', payload)
      setAuth(data)
      // Role-based redirect
      if (data.user.role === 'authority') {
        router.push('/authority')
      } else {
        router.push('/citizen')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuth()
    router.push('/auth/login')
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
  }
}
