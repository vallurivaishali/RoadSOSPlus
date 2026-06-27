// TypeScript types for all auth-related structures

export type UserRole = 'citizen' | 'authority'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  is_active: boolean
}

export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface LoginPayload {
  email: string
  password: string
}
