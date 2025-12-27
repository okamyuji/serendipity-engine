class Discovery < ApplicationRecord
  belongs_to :user
  belongs_to :source_note, class_name: "Note", optional: true
  belongs_to :target_note, class_name: "Note", optional: true

  enum :discovery_type, {
    bridge: "bridge",              # 異ドメイン間のつながり
    forgotten_gem: "forgotten_gem", # 忘れられた知識
    daily: "daily",                # 日次レコメンド
    learning_path: "learning_path"  # 学習経路提案
  }, validate: true

  validates :discovery_type, presence: true

  scope :unviewed, -> { where(viewed: false, dismissed: false) }
  scope :today, -> { where("created_at >= ?", Time.current.beginning_of_day) }
  scope :active, -> { where("expires_at IS NULL OR expires_at > ?", Time.current) }
end
