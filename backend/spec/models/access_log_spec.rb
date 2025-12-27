# frozen_string_literal: true

require "rails_helper"

RSpec.describe AccessLog, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:note) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:action_type) }
    it { is_expected.to validate_inclusion_of(:action_type).in_array(%w[view edit search_hit]) }
  end

  describe "factory" do
    let(:user) { create(:user) }
    let(:note) { create(:note, user: user) }

    it "有効なファクトリを持つ" do
      access_log = AccessLog.create!(user: user, note: note, action_type: "view")
      expect(access_log).to be_valid
    end

    it "action_typeがviewの場合有効" do
      access_log = AccessLog.new(user: user, note: note, action_type: "view")
      expect(access_log).to be_valid
    end

    it "action_typeがeditの場合有効" do
      access_log = AccessLog.new(user: user, note: note, action_type: "edit")
      expect(access_log).to be_valid
    end

    it "action_typeがsearch_hitの場合有効" do
      access_log = AccessLog.new(user: user, note: note, action_type: "search_hit")
      expect(access_log).to be_valid
    end

    it "action_typeが無効な場合エラー" do
      access_log = AccessLog.new(user: user, note: note, action_type: "invalid")
      expect(access_log).not_to be_valid
      expect(access_log.errors[:action_type]).to be_present
    end

    it "action_typeが空の場合エラー" do
      access_log = AccessLog.new(user: user, note: note, action_type: nil)
      expect(access_log).not_to be_valid
      expect(access_log.errors[:action_type]).to be_present
    end
  end
end
