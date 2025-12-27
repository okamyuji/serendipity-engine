import type { Project } from '@/types'
import { apiClient } from './client'

export interface CreateProjectParams {
  name: string
  description?: string
  color?: string
}

export interface UpdateProjectParams {
  name?: string
  description?: string
  color?: string
  archived?: boolean
}

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects')
    return response.data
  },

  get: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`)
    return response.data
  },

  create: async (params: CreateProjectParams): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', { project: params })
    return response.data
  },

  update: async (id: number, params: UpdateProjectParams): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${id}`, { project: params })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`)
  },
}
