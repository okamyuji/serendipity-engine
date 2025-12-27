import type { Tag } from '@/types'
import { apiClient } from './client'

export interface CreateTagParams {
  name: string
  color?: string
}

export interface UpdateTagParams {
  name?: string
  color?: string
}

export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>('/tags')
    return response.data
  },

  get: async (id: number): Promise<Tag> => {
    const response = await apiClient.get<Tag>(`/tags/${id}`)
    return response.data
  },

  create: async (params: CreateTagParams): Promise<Tag> => {
    const response = await apiClient.post<Tag>('/tags', { tag: params })
    return response.data
  },

  update: async (id: number, params: UpdateTagParams): Promise<Tag> => {
    const response = await apiClient.patch<Tag>(`/tags/${id}`, { tag: params })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tags/${id}`)
  },
}
