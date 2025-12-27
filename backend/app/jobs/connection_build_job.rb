# frozen_string_literal: true

class ConnectionBuildJob < ApplicationJob
  queue_as :default

  # ノートの関連性を分析してConnectionを構築
  # @param note_id [Integer] ノートID
  def perform(note_id)
    note = Note.find(note_id)

    # Chunkが存在しない場合は処理をスキップ
    return unless note.chunks.exists?

    # ConnectionAnalyzerで関連性を分析
    analyzer = ConnectionAnalyzer.new
    connections = analyzer.analyze_note(note)

    Rails.logger.info("ConnectionBuildJob: Created #{connections.size} connections for note #{note_id}")
  rescue StandardError => e
    Rails.logger.error("ConnectionBuildJob failed for note #{note_id}: #{e.message}")
    raise  # ジョブを失敗させてリトライ可能にする
  end
end
