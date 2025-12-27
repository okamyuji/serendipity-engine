import type { Discovery } from '@/types'
import { apiClient } from './client'

export const discoveriesApi = {
  list: async (): Promise<Discovery[]> => {
    const response = await apiClient.get<Discovery[]>('/discoveries')
    return response.data
  },

  get: async (id: number): Promise<Discovery> => {
    const response = await apiClient.get<Discovery>(`/discoveries/${id}`)
    return response.data
  },

  generate: async (): Promise<Discovery[]> => {
    const response = await apiClient.post<Discovery[]>('/discoveries/generate')
    return response.data
  },

  act: async (id: number): Promise<Discovery> => {
    const response = await apiClient.post<Discovery>(`/discoveries/${id}/act`)
    return response.data
  },

  dismiss: async (id: number): Promise<void> => {
    await apiClient.post(`/discoveries/${id}/dismiss`)
  },
}
