# frozen_string_literal: true

class EmbeddingService
  MODEL = "text-embedding-3-small"
  DIMENSION = 1536

  class EmbeddingError < StandardError; end

  def initialize(api_key: ENV.fetch("OPENAI_API_KEY", nil))
    raise EmbeddingError, "OPENAI_API_KEY is not set" if api_key.blank?

    @client = OpenAI::Client.new(access_token: api_key)
  end

  # テキストからEmbeddingベクトルを生成
  # @param text [String] Embedding化するテキスト
  # @return [Array<Float>] 1536次元のベクトル
  def generate_embedding(text)
    raise ArgumentError, "Text cannot be blank" if text.blank?

    # テキストを正規化（改行・余分な空白を削除）
    normalized_text = normalize_text(text)

    response = @client.embeddings(
      parameters: {
        model: MODEL,
        input: normalized_text
      }
    )

    embedding = response.dig("data", 0, "embedding")
    raise EmbeddingError, "Failed to generate embedding" if embedding.nil?

    embedding
  rescue Faraday::Error => e
    raise EmbeddingError, "OpenAI API error: #{e.message}"
  end

  # 複数テキストのEmbeddingを一括生成（効率化）
  # @param texts [Array<String>] Embedding化するテキストの配列
  # @return [Array<Array<Float>>] Embeddingベクトルの配列
  def generate_embeddings(texts)
    raise ArgumentError, "Texts cannot be empty" if texts.empty?

    normalized_texts = texts.map { |text| normalize_text(text) }

    response = @client.embeddings(
      parameters: {
        model: MODEL,
        input: normalized_texts
      }
    )

    embeddings = response["data"].map { |item| item["embedding"] }
    raise EmbeddingError, "Failed to generate embeddings" if embeddings.any?(&:nil?)

    embeddings
  rescue Faraday::Error => e
    raise EmbeddingError, "OpenAI API error: #{e.message}"
  end

  private

  def normalize_text(text)
    text.to_s
        .gsub(/\s+/, " ")  # 複数の空白を1つに
        .strip             # 前後の空白を削除
        .slice(0, 8000)    # OpenAI APIの制限に合わせて切り詰め
  end
end
