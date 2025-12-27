class Connection < ApplicationRecord
  belongs_to :source_note, class_name: "Note"
  belongs_to :target_note, class_name: "Note"

  validates :source_note_id, uniqueness: { scope: :target_note_id }
  validate :notes_belong_to_same_user

  enum :connection_type, {
    semantic: "semantic",      # AI検出の意味的関連
    explicit: "explicit",      # ユーザー明示的リンク
    temporal: "temporal",      # 時間的近接
    tag_based: "tag_based"     # タグ共有
  }, validate: true

  scope :strong, -> { where("strength >= ?", 0.7) }
  scope :ai_suggested, -> { where(ai_suggested: true, confirmed: false) }

  private

  def notes_belong_to_same_user
    return if source_note&.user_id == target_note&.user_id

    errors.add(:base, "Notes must belong to the same user")
  end
end
