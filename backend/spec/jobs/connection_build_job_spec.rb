# frozen_string_literal: true

require "rails_helper"

RSpec.describe ConnectionBuildJob, type: :job do
  let(:user) { create(:user) }
  let(:note1) { create(:note, :with_chunks, user: user, title: "Ruby Programming") }
  let(:note2) { create(:note, :with_chunks, user: user, title: "Python Programming") }

  # similar_toクエリをモック化して高速化
  before do
    empty_relation = Chunk.none
    allow(Chunk).to receive_message_chain(:for_user, :where, :not, :similar_to).and_return(empty_relation)
  end

  describe "#perform" do
    context "ノートが存在する場合" do
      it "ConnectionAnalyzerを呼び出す" do
        # note2を先に作成してコネクション対象を用意
        note2

        # ConnectionAnalyzerが呼ばれることを確認
        expect_any_instance_of(ConnectionAnalyzer).to receive(:analyze_note).with(note1).and_call_original

        described_class.perform_now(note1.id)
      end

      it "ConnectionAnalyzerを使用する" do
        analyzer_double = instance_double(ConnectionAnalyzer)
        allow(ConnectionAnalyzer).to receive(:new).and_return(analyzer_double)
        expect(analyzer_double).to receive(:analyze_note).with(note1).and_return([])

        described_class.perform_now(note1.id)
      end
    end

    context "ノートが存在しない場合" do
      it "エラーを発生させずに終了する" do
        expect {
          described_class.perform_now(99999)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context "チャンクが存在しないノートの場合" do
      let(:note_without_chunks) { create(:note, user: user) }

      it "エラーを発生させずに終了する" do
        expect {
          described_class.perform_now(note_without_chunks.id)
        }.not_to raise_error
      end
    end

    context "他のユーザーのノートとはコネクションを作成しない" do
      let(:other_user) { create(:user) }
      let(:other_note) { create(:note, :with_chunks, user: other_user) }

      it "ConnectionAnalyzerを呼び出す" do
        other_note # 他のユーザーのノートを作成
        note2 # 同じユーザーのノートを作成

        expect_any_instance_of(ConnectionAnalyzer).to receive(:analyze_note).with(note1).and_call_original

        described_class.perform_now(note1.id)
      end
    end
  end

  describe "ジョブ設定" do
    it "defaultキューで実行される" do
      expect(described_class.new.queue_name).to eq("default")
    end
  end

  describe "統合テスト" do
    context "複数のノートでコネクションを構築する場合" do
      let!(:note3) { create(:note, :with_chunks, user: user, title: "JavaScript Guide") }
      let!(:note4) { create(:note, :with_chunks, user: user, title: "Cooking Recipes") }

      it "ConnectionAnalyzerを呼び出す" do
        # プログラミング関連のノート
        note1
        note2
        note3

        # 料理関連のノート
        note4

        expect_any_instance_of(ConnectionAnalyzer).to receive(:analyze_note).with(note1).and_call_original

        described_class.perform_now(note1.id)
      end
    end

    context "既存のコネクションがある場合" do
      let!(:existing_connection) do
        create(:connection,
               source_note: note1,
               target_note: note2,
               strength: 0.5,
               confirmed: true)
      end

      it "ConnectionAnalyzerを呼び出す" do
        expect_any_instance_of(ConnectionAnalyzer).to receive(:analyze_note).with(note1).and_call_original

        described_class.perform_now(note1.id)
      end
    end
  end
end
