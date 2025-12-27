import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  initFromStorage: () => void
}

const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
    set({ user, token, isAuthenticated: true })
  },
  
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  initFromStorage: () => {
    const token = getStoredToken()
    set({ token, isAuthenticated: !!token })
  },
}))
