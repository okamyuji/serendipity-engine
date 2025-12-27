# frozen_string_literal: true

require "rails_helper"

RSpec.describe EmbeddingService do
  let(:service) { described_class.new }
  let(:mock_embedding) { Array.new(1536) { rand } }

  before do
    # OpenAI APIをモック化
    allow_any_instance_of(OpenAI::Client).to receive(:embeddings).and_return(
      { "data" => [ { "embedding" => mock_embedding } ] }
    )
  end

  describe "#generate_embedding" do
    let(:text) { "This is a test text." }

    it "埋め込みベクトルを返す" do
      embedding = service.generate_embedding(text)

      expect(embedding).to be_present
      expect(embedding).to be_an(Array)
      expect(embedding.size).to eq(1536)
    end

    it "空のテキストの場合はエラーを発生させる" do
      expect {
        service.generate_embedding("")
      }.to raise_error(ArgumentError, "Text cannot be blank")
    end
  end

  describe "#generate_embeddings" do
    let(:texts) { [ "Text 1", "Text 2", "Text 3" ] }

    before do
      # 複数のembeddingを返すようにモック化
      allow_any_instance_of(OpenAI::Client).to receive(:embeddings).and_return(
        { "data" => texts.map { { "embedding" => mock_embedding } } }
      )
    end

    it "複数の埋め込みベクトルを返す" do
      embeddings = service.generate_embeddings(texts)

      expect(embeddings).to be_an(Array)
      expect(embeddings.size).to eq(3)
      embeddings.each do |embedding|
        expect(embedding).to be_an(Array)
        expect(embedding.size).to eq(1536)
      end
    end

    it "空の配列の場合はエラーを発生させる" do
      expect {
        service.generate_embeddings([])
      }.to raise_error(ArgumentError, "Texts cannot be empty")
    end
  end

  describe "エラーハンドリング" do
    it "OpenAI APIがエラーを返す場合" do
      allow_any_instance_of(OpenAI::Client).to receive(:embeddings).and_raise(Faraday::Error.new("API Error"))

      expect {
        service.generate_embedding("test")
      }.to raise_error(EmbeddingService::EmbeddingError, /OpenAI API error/)
    end
  end
end
