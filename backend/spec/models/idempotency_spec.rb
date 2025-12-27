# frozen_string_literal: true

require "rails_helper"

RSpec.describe "テストの冪等性", type: :model do
  describe "データベースの状態" do
    it "テスト1: 各テストの前にデータベースがクリーンな状態である" do
      expect(User.count).to eq(0)
      expect(Note.count).to eq(0)
    end

    it "テスト2: データを作成しても次のテストに影響しない" do
      user = create(:user)
      create(:note, :without_project, user: user)

      expect(User.count).to eq(1)
      expect(Note.count).to eq(1)
    end

    it "テスト3: 前のテストのデータが残っていない" do
      expect(User.count).to eq(0)
      expect(Note.count).to eq(0)
    end

    it "テスト4: 同じ操作を繰り返しても同じ結果になる（冪等性）" do
      user = create(:user, email: "test@example.com")
      expect(User.count).to eq(1)
      expect(user.email).to eq("test@example.com")
    end

    it "テスト5: テスト4と同じ操作でも同じ結果になる" do
      user = create(:user, email: "test@example.com")
      expect(User.count).to eq(1)
      expect(user.email).to eq("test@example.com")
    end
  end

  describe "トランザクションのロールバック" do
    it "テスト内で作成したデータは自動的にロールバックされる" do
      user = create(:user)
      expect(User.count).to eq(1)
    end

    it "前のテストで作成したデータは存在しない" do
      expect(User.count).to eq(0)
    end
  end
end
