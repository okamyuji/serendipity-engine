class Chunk < ApplicationRecord
  belongs_to :note
  has_neighbors :embedding

  validates :content, presence: true

  # セマンティック検索
  scope :similar_to, ->(embedding, limit: 10) {
    nearest_neighbors(:embedding, embedding, distance: "cosine").limit(limit)
  }

  # 特定ユーザーのチャンクのみ検索
  scope :for_user, ->(user_id) {
    joins(:note).where(notes: { user_id: user_id })
  }
end
