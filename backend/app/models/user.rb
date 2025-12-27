# frozen_string_literal: true

class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :trackable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  has_many :projects, dependent: :destroy
  has_many :notes, dependent: :destroy
  has_many :tags, dependent: :destroy
  has_many :discoveries, dependent: :destroy
  has_many :access_logs, dependent: :destroy

  validates :name, length: { maximum: 100 }, allow_nil: true
  validates :email, format: { with: /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/, message: "must be a valid email" }, if: -> { email.present? }

  # Override Devise's password minimum length
  def self.password_length
    8..128
  end
end
