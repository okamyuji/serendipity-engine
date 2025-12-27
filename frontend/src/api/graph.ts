import { apiClient } from './client'

export interface GraphNode {
  id: string
  type: 'note'
  data: {
    label: string
    project?: string
    projectColor: string
    tags: string[]
    accessCount: number
    lastAccessed?: string
    createdAt: string
    hasChunks: boolean
  }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'smoothstep'
  data: {
    strength: number
    connectionType: 'semantic' | 'explicit' | 'temporal' | 'tag_based'
    aiSuggested: boolean
    confirmed: boolean
  }
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const graphApi = {
  get: async (minStrength?: number): Promise<GraphData> => {
    const response = await apiClient.get<GraphData>('/graph', {
      params: { min_strength: minStrength },
    })
    return response.data
  },
}
