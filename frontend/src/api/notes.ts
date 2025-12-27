import type { Note } from '@/types'
import { apiClient } from './client'

export interface CreateNoteParams {
  title: string
  content: string
  project_id?: number
  tag_ids?: number[]
}

export interface UpdateNoteParams {
  title?: string
  content?: string
  project_id?: number
  tag_ids?: number[]
  pinned?: boolean
  archived?: boolean
}

export const notesApi = {
  list: async (params?: { project_id?: number; tag_ids?: number[]; archived?: boolean; pinned?: boolean }): Promise<Note[]> => {
    const response = await apiClient.get<Note[]>('/notes', { params })
    return response.data
  },

  get: async (id: number): Promise<Note> => {
    const response = await apiClient.get<Note>(`/notes/${id}`)
    return response.data
  },

  create: async (params: CreateNoteParams): Promise<Note> => {
    const response = await apiClient.post<Note>('/notes', { note: params })
    return response.data
  },

  update: async (id: number, params: UpdateNoteParams): Promise<Note> => {
    const response = await apiClient.patch<Note>(`/notes/${id}`, { note: params })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notes/${id}`)
  },
}
