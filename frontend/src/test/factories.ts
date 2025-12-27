import type { Connection, Discovery, Note, Project, Tag, User } from '@/types'

let userId = 1
let noteId = 1
let projectId = 1
let tagId = 1
let discoveryId = 1
let connectionId = 1

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: userId++,
  email: `user${userId}@example.com`,
  name: `Test User ${userId}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockNote = (overrides?: Partial<Note>): Note => ({
  id: noteId++,
  user_id: 1,
  title: `Test Note ${noteId}`,
  content: `This is test content for note ${noteId}`,
  content_html: `<p>This is test content for note ${noteId}</p>`,
  access_count: 0,
  pinned: false,
  archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockProject = (overrides?: Partial<Project>): Project => ({
  id: projectId++,
  user_id: 1,
  name: `Test Project ${projectId}`,
  description: `Description for project ${projectId}`,
  color: '#6366f1',
  archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockTag = (overrides?: Partial<Tag>): Tag => ({
  id: tagId++,
  user_id: 1,
  name: `tag${tagId}`,
  color: '#10b981',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockDiscovery = (overrides?: Partial<Discovery>): Discovery => ({
  id: discoveryId++,
  user_id: 1,
  discovery_type: 'daily',
  explanation: `Discovery explanation ${discoveryId}`,
  relevance_score: 0.8,
  viewed: false,
  acted_upon: false,
  dismissed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockConnection = (overrides?: Partial<Connection>): Connection => ({
  id: connectionId++,
  source_note_id: 1,
  target_note_id: 2,
  connection_type: 'semantic',
  strength: 0.7,
  explanation: `Connection explanation ${connectionId}`,
  ai_suggested: false,
  confirmed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const resetFactories = () => {
  userId = 1
  noteId = 1
  projectId = 1
  tagId = 1
  discoveryId = 1
  connectionId = 1
}
