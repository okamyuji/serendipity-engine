# frozen_string_literal: true

require "rails_helper"

RSpec.describe EmbeddingJob, type: :job do
  let(:user) { create(:user) }
  let(:note) { create(:note, user: user, content: Faker::Lorem.paragraph(sentence_count: 10)) }
  let(:mock_embedding) { Array.new(1536) { rand } }

  before do
    # OpenAI APIをモック化
    allow_any_instance_of(OpenAI::Client).to receive(:embeddings).and_return(
      { "data" => [ { "embedding" => mock_embedding } ] }
    )
  end

  describe "#perform" do
    context "ノートが存在する場合" do
      it "埋め込みを生成する" do
        expect {
          described_class.perform_now(note.id)
        }.to change { note.reload.chunks.count }.from(0)

        note.reload
        expect(note.chunks).not_to be_empty
        note.chunks.each do |chunk|
          expect(chunk.embedding).to be_present
        end
      end

      it "ConnectionBuildJobをエンキューする" do
        expect {
          described_class.perform_now(note.id)
        }.to have_enqueued_job(ConnectionBuildJob).with(note.id)
      end
    end

    context "ノートが存在しない場合" do
      it "ActiveRecord::RecordNotFoundエラーを発生させる" do
        expect {
          described_class.perform_now(99999)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context "OpenAI APIがエラーを返す場合" do
      before do
        allow_any_instance_of(EmbeddingService).to receive(:generate_embeddings).and_raise(OpenAI::Error.new("API Error"))
      end

      it "エラーを再発生させる" do
        expect {
          described_class.perform_now(note.id)
        }.to raise_error(OpenAI::Error)
      end
    end

    context "ネットワークエラーが発生する場合" do
      before do
        allow_any_instance_of(EmbeddingService).to receive(:generate_embeddings).and_raise(Faraday::ConnectionFailed.new("Connection failed"))
      end

      it "リトライ可能なエラーとして処理される" do
        expect {
          described_class.perform_now(note.id)
        }.to raise_error(Faraday::ConnectionFailed)
      end
    end
  end

  describe "ジョブ設定" do
    it "defaultキューで実行される" do
      expect(described_class.new.queue_name).to eq("default")
    end
  end

  describe "統合テスト" do
    context "実際のノートで埋め込み生成とコネクション構築を行う場合" do
      let!(:note1) { create(:note, user: user, content: "Ruby is a programming language.") }
      let!(:note2) { create(:note, user: user, content: "Python is also a programming language.") }

      it "埋め込み生成後にConnectionBuildJobがエンキューされる" do
        # 最初のノートの埋め込みを生成
        expect {
          described_class.perform_now(note1.id)
        }.to have_enqueued_job(ConnectionBuildJob).with(note1.id)

        # 2番目のノートの埋め込みを生成
        expect {
          described_class.perform_now(note2.id)
        }.to have_enqueued_job(ConnectionBuildJob).with(note2.id)

        # チャンクが作成されているか確認
        note1.reload
        note2.reload

        expect(note1.chunks).not_to be_empty
        expect(note2.chunks).not_to be_empty
      end
    end
  end
end
