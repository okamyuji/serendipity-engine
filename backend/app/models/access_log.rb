class AccessLog < ApplicationRecord
  belongs_to :user
  belongs_to :note

  validates :action_type, presence: true, inclusion: { in: %w[view edit search_hit] }
end
