# frozen_string_literal: true

class DailyDiscoveryJob < ApplicationJob
  queue_as :default

  # 全ユーザーの日次発見を生成
  def perform
    User.find_each do |user|
      generate_discoveries_for_user(user)
    end
  end

  private

  def generate_discoveries_for_user(user)
    # ノートが5件未満のユーザーはスキップ
    return if user.notes.active.count < 5

    engine = DiscoveryEngine.new
    discoveries = engine.generate_daily_discoveries(user)

    Rails.logger.info("DailyDiscoveryJob: Generated #{discoveries.size} discoveries for user #{user.id}")
  rescue StandardError => e
    Rails.logger.error("DailyDiscoveryJob failed for user #{user.id}: #{e.message}")
    # 1ユーザーの失敗で全体を止めないため、エラーをログに記録して続行
  end
end
