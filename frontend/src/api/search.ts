import type { Note } from '@/types'
import { apiClient } from './client'

export interface SearchResult {
  results: Note[]
  query: string
  search_type: 'keyword' | 'semantic'
}

export interface SemanticSearchResult {
  results: (Note & { similarity_score: number })[]
  query: string
  search_type: 'semantic'
}

export const searchApi = {
  search: async (query: string, limit?: number): Promise<SearchResult> => {
    const response = await apiClient.get<SearchResult>('/search', {
      params: { q: query, limit },
    })
    return response.data
  },

  semanticSearch: async (query: string, limit?: number): Promise<SemanticSearchResult> => {
    const response = await apiClient.get<SemanticSearchResult>('/search/semantic', {
      params: { q: query, limit },
    })
    return response.data
  },
}
