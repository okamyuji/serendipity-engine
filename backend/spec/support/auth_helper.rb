# frozen_string_literal: true

module AuthHelper
  def auth_headers_for(user)
    # Warden::JWTAuth::UserEncoderを使用してトークンを生成
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    puts "DEBUG: Generated token for user #{user.id}: #{token[0..50]}..."
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelper, type: :request
end
