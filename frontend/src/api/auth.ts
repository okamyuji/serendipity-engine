import type { AuthResponse, LoginCredentials, SignupCredentials } from '@/types'
import { apiClient } from './client'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      user: credentials,
    })
    return response.data
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', {
      user: credentials,
    })
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.delete('/auth/logout')
  },
}
