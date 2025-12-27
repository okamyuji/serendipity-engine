class Note < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true

  has_many :chunks, dependent: :destroy
  has_many :note_tags, dependent: :destroy
  has_many :tags, through: :note_tags
  has_many :access_logs, dependent: :destroy

  # 双方向のコネクション
  has_many :outgoing_connections,
           class_name: "Connection",
           foreign_key: :source_note_id,
           dependent: :destroy
  has_many :incoming_connections,
           class_name: "Connection",
           foreign_key: :target_note_id,
           dependent: :destroy
  has_many :connected_notes,
           through: :outgoing_connections,
           source: :target_note

  validates :title, presence: true, length: { maximum: 255 }
  validates :content, length: { maximum: 100_000 }, allow_nil: true

  after_save :schedule_embedding_job, if: :saved_change_to_content?
  after_touch :update_last_accessed

  scope :recent, -> { order(updated_at: :desc) }
  scope :forgotten, -> {
    where("last_accessed_at < ?", 30.days.ago)
      .where("access_count > ?", 3)
      .order(access_count: :desc)
  }
  scope :active, -> { where(archived: false) }

  private

  def schedule_embedding_job
    EmbeddingJob.perform_later(id)
  end

  def update_last_accessed
    update_columns(
      last_accessed_at: Time.current,
      access_count: access_count + 1
    )
  end
end
