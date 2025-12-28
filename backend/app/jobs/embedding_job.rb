# frozen_string_literal: true

class EmbeddingJob < ApplicationJob
  queue_as :default

  # 高優先度（ユーザーが作成/更新したノートの処理）
  self.priority = 10

  # リトライ設定（最大3回、指数バックオフ: 3秒、9秒、27秒）
  retry_on EmbeddingService::EmbeddingError, wait: :polynomially_longer, attempts: 3
  retry_on Faraday::ConnectionFailed, wait: :polynomially_longer, attempts: 3

  # ノートのコンテンツからEmbeddingを生成
  # @param note_id [Integer] ノートID
  def perform(note_id)
    note = Note.find(note_id)

    return if note.content.blank?

    # 既存のチャンクを削除
    note.chunks.destroy_all

    # コンテンツをチャンクに分割
    chunking_service = ChunkingService.new
    chunks_data = chunking_service.split_content(note.content)

    return if chunks_data.empty?

    # 各チャンクのテキストを抽出
    chunk_texts = chunks_data.map { |chunk| chunk[:content] }

    # Embeddingを一括生成
    embedding_service = EmbeddingService.new
    embeddings = embedding_service.generate_embeddings(chunk_texts)

    # Chunkレコードを作成
    chunks_data.each_with_index do |chunk_data, index|
      note.chunks.create!(
        content: chunk_data[:content],
        position: chunk_data[:position],
        embedding: embeddings[index]
      )
    end

    # Embedding生成後にConnection分析ジョブをキュー
    ConnectionBuildJob.perform_later(note_id)
  rescue EmbeddingService::EmbeddingError => e
    Rails.logger.error("EmbeddingJob failed for note #{note_id}: #{e.message}")
    raise  # ジョブを失敗させてリトライ可能にする
  end
end
