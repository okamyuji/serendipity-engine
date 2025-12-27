# frozen_string_literal: true

class AddIndexesToOptimizeQueries < ActiveRecord::Migration[8.1]
  def change
    # Chunks table - vector search optimization
    add_index :chunks, :embedding, using: :hnsw, opclass: :vector_cosine_ops,
              if_not_exists: true

    # Connections table - query optimization
    add_index :connections, [ :source_note_id, :strength ], if_not_exists: true
    add_index :connections, [ :target_note_id, :strength ], if_not_exists: true
    add_index :connections, :connection_type, if_not_exists: true

    # Discoveries table - filtering optimization
    add_index :discoveries, [ :user_id, :viewed, :expires_at ], if_not_exists: true
    add_index :discoveries, :discovery_type, if_not_exists: true

    # Notes table - common queries optimization
    add_index :notes, [ :user_id, :archived, :updated_at ], if_not_exists: true
    add_index :notes, [ :user_id, :pinned ], if_not_exists: true
    add_index :notes, :last_accessed_at, if_not_exists: true

    # Projects table - filtering optimization
    add_index :projects, [ :user_id, :archived ], if_not_exists: true

    # Tags table - search optimization
    add_index :tags, [ :user_id, :name ], if_not_exists: true

    # NotesTags join table - association queries optimization
    add_index :note_tags, [ :note_id, :tag_id ], unique: true, if_not_exists: true
    add_index :note_tags, :tag_id, if_not_exists: true
  end
end
