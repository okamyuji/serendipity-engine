# frozen_string_literal: true

require "rails_helper"

RSpec.describe DailyDiscoveryJob, type: :job do
  # similar_toクエリをモック化して高速化
  before do
    empty_relation = Chunk.none
    allow(Chunk).to receive_message_chain(:for_user, :where, :similar_to).and_return(empty_relation)
    allow(Chunk).to receive_message_chain(:joins, :where).and_return(empty_relation)
  end

  describe "#perform" do
    context "複数のユーザーが存在する場合" do
      let!(:user1) { create(:user) }
      let!(:user2) { create(:user) }
      let!(:user3) { create(:user) }

      # user1: 十分なノートがある
      let!(:user1_notes) { create_list(:note, 10, user: user1) }

      # user2: ノートが少ない
      let!(:user2_notes) { create_list(:note, 2, user: user2) }

      # user3: ノートがない

      it "エラーを発生させない" do
        expect {
          described_class.perform_now
        }.not_to raise_error
      end
    end

    context "エラーが発生した場合" do
      let!(:user) { create(:user) }
      let!(:notes) { create_list(:note, 10, user: user) }

      before do
        allow_any_instance_of(DiscoveryEngine).to receive(:generate_daily_discoveries).and_raise(StandardError.new("Test error"))
      end

      it "他のユーザーの処理を継続する" do
        expect {
          described_class.perform_now
        }.not_to raise_error
      end

      it "エラーをログに記録する" do
        expect(Rails.logger).to receive(:error).with(/DailyDiscoveryJob failed/)
        described_class.perform_now
      end
    end

    context "ノートが5件未満のユーザー" do
      let!(:user) { create(:user) }
      let!(:notes) { create_list(:note, 3, user: user) }

      it "発見を生成しない" do
        expect {
          described_class.perform_now
        }.not_to change { user.discoveries.count }
      end
    end

    context "ノートが5件以上のユーザー" do
      let!(:user) { create(:user) }
      let!(:notes) { create_list(:note, 10, user: user) }
      let!(:forgotten_note) do
        create(:note,
               user: user,
               last_accessed_at: 60.days.ago,
               access_count: 10)
      end

      it "DiscoveryEngineを呼び出す" do
        expect_any_instance_of(DiscoveryEngine).to receive(:generate_daily_discoveries).with(user).and_call_original

        described_class.perform_now
      end
    end
  end

  describe "ジョブ設定" do
    it "defaultキューで実行される" do
      expect(described_class.new.queue_name).to eq("default")
    end
  end
end
