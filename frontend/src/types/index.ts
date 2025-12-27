export interface User {
  id: number
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  user_id: number
  name: string
  description?: string
  color: string
  archived: boolean
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  user_id: number
  project_id?: number
  project?: Project
  title: string
  content: string
  content_html: string
  access_count: number
  last_accessed_at?: string
  pinned: boolean
  archived: boolean
  tags?: Tag[]
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  user_id: number
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface Connection {
  id: number
  source_note_id: number
  target_note_id: number
  connection_type: 'semantic' | 'explicit' | 'temporal' | 'tag_based'
  strength: number
  explanation?: string
  ai_suggested: boolean
  confirmed: boolean
  created_at: string
  updated_at: string
}

export interface Discovery {
  id: number
  user_id: number
  discovery_type: 'bridge' | 'forgotten_gem' | 'daily' | 'learning_path'
  source_note_id?: number
  target_note_id?: number
  source_note?: { id: number; title: string }
  target_note?: { id: number; title: string }
  explanation: string
  relevance_score: number
  viewed: boolean
  acted_upon: boolean
  dismissed: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  password_confirmation: string
  name?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface GraphNode {
  id: string
  type: string
  data: {
    label: string
    project?: string
    projectColor: string
    tags: string[]
    accessCount: number
    lastAccessed?: string
    createdAt: string
    hasChunks?: boolean
  }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: string
  data: {
    strength: number
    connectionType: string
    aiSuggested: boolean
    confirmed: boolean
  }
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
