# frozen_string_literal: true

require "rails_helper"

RSpec.describe Discovery, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:source_note).class_name("Note").optional }
    it { is_expected.to belong_to(:target_note).class_name("Note").optional }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:discovery_type) }
  end

  describe "enums" do
    let(:user) { create(:user) }

    it "discovery_typeがbridgeの場合有効" do
      discovery = build(:discovery, user: user, discovery_type: :bridge)
      expect(discovery).to be_valid
      expect(discovery.bridge?).to be true
    end

    it "discovery_typeがforgotten_gemの場合有効" do
      discovery = build(:discovery, user: user, discovery_type: :forgotten_gem)
      expect(discovery).to be_valid
      expect(discovery.forgotten_gem?).to be true
    end

    it "discovery_typeがdailyの場合有効" do
      discovery = build(:discovery, user: user, discovery_type: :daily)
      expect(discovery).to be_valid
      expect(discovery.daily?).to be true
    end

    it "discovery_typeがlearning_pathの場合有効" do
      discovery = build(:discovery, user: user, discovery_type: :learning_path)
      expect(discovery).to be_valid
      expect(discovery.learning_path?).to be true
    end
  end

  describe "scopes" do
    let(:user) { create(:user) }

    describe ".unviewed" do
      it "未閲覧かつ未削除の発見を返す" do
        unviewed = create(:discovery, user: user, viewed: false, dismissed: false)
        viewed = create(:discovery, user: user, viewed: true, dismissed: false)
        dismissed = create(:discovery, user: user, viewed: false, dismissed: true)

        result = Discovery.unviewed
        expect(result).to include(unviewed)
        expect(result).not_to include(viewed, dismissed)
      end
    end

    describe ".today" do
      it "本日作成された発見を返す" do
        today_discovery = create(:discovery, user: user, created_at: Time.current)
        yesterday_discovery = create(:discovery, user: user, created_at: 1.day.ago)

        result = Discovery.today
        expect(result).to include(today_discovery)
        expect(result).not_to include(yesterday_discovery)
      end
    end

    describe ".active" do
      it "有効期限内または有効期限なしの発見を返す" do
        no_expiry = create(:discovery, user: user, expires_at: nil)
        future_expiry = create(:discovery, user: user, expires_at: 1.day.from_now)
        expired = create(:discovery, user: user, expires_at: 1.day.ago)

        result = Discovery.active
        expect(result).to include(no_expiry, future_expiry)
        expect(result).not_to include(expired)
      end
    end
  end

  describe "factory" do
    let(:user) { create(:user) }
    let(:note) { create(:note, user: user) }

    it "有効なファクトリを持つ" do
      discovery = create(:discovery, user: user)
      expect(discovery).to be_valid
    end

    it "source_noteとtarget_noteを持つ発見を作成できる" do
      note2 = create(:note, user: user)
      discovery = create(:discovery, user: user, source_note: note, target_note: note2)
      expect(discovery.source_note).to eq(note)
      expect(discovery.target_note).to eq(note2)
    end
  end
end
