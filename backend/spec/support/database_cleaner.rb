# frozen_string_literal: true

RSpec.configure do |config|
  # テストスイート開始時にデータベースをクリーンアップ
  config.before(:suite) do
    tables = %w[users notes projects tags note_tags chunks connections discoveries access_logs jwt_denylists]
    tables.each do |table|
      ActiveRecord::Base.connection.execute("TRUNCATE TABLE #{table} RESTART IDENTITY CASCADE")
    end
  end

  # 各テストでトランザクションを使用して冪等性を保証
  config.use_transactional_fixtures = true
end
