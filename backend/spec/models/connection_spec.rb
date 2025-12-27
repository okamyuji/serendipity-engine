# frozen_string_literal: true

require "rails_helper"

RSpec.describe Connection, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:source_note).class_name("Note") }
    it { is_expected.to belong_to(:target_note).class_name("Note") }
  end

  describe "validations" do
    let(:user) { create(:user) }
    let(:note1) { create(:note, user: user) }
    let(:note2) { create(:note, user: user) }

    it "source_note_idとtarget_note_idの組み合わせが一意である" do
      create(:connection, source_note: note1, target_note: note2)
      duplicate = build(:connection, source_note: note1, target_note: note2)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:source_note_id]).to be_present
    end
  end

  describe "custom validations" do
    let(:user1) { create(:user) }
    let(:user2) { create(:user) }
    let(:note1) { create(:note, user: user1) }
    let(:note2) { create(:note, user: user2) }

    it "異なるユーザーのノート間のコネクションはエラー" do
      connection = build(:connection, source_note: note1, target_note: note2)
      expect(connection).not_to be_valid
      expect(connection.errors[:base]).to include("Notes must belong to the same user")
    end

    it "同じユーザーのノート間のコネクションは有効" do
      note3 = create(:note, user: user1)
      connection = build(:connection, source_note: note1, target_note: note3)
      expect(connection).to be_valid
    end
  end

  describe "enums" do
    let(:user) { create(:user) }
    let(:note1) { create(:note, user: user) }
    let(:note2) { create(:note, user: user) }

    it "connection_typeがsemanticの場合有効" do
      connection = build(:connection, source_note: note1, target_note: note2, connection_type: :semantic)
      expect(connection).to be_valid
      expect(connection.semantic?).to be true
    end

    it "connection_typeがexplicitの場合有効" do
      connection = build(:connection, source_note: note1, target_note: note2, connection_type: :explicit)
      expect(connection).to be_valid
      expect(connection.explicit?).to be true
    end

    it "connection_typeがtemporalの場合有効" do
      connection = build(:connection, source_note: note1, target_note: note2, connection_type: :temporal)
      expect(connection).to be_valid
      expect(connection.temporal?).to be true
    end

    it "connection_typeがtag_basedの場合有効" do
      connection = build(:connection, source_note: note1, target_note: note2, connection_type: :tag_based)
      expect(connection).to be_valid
      expect(connection.tag_based?).to be true
    end
  end

  describe "scopes" do
    let(:user) { create(:user) }
    let(:note1) { create(:note, user: user) }
    let(:note2) { create(:note, user: user) }
    let(:note3) { create(:note, user: user) }

    describe ".strong" do
      it "強度0.7以上のコネクションを返す" do
        strong_connection = create(:connection, source_note: note1, target_note: note2, strength: 0.8)
        weak_connection = create(:connection, source_note: note1, target_note: note3, strength: 0.5)

        result = Connection.strong
        expect(result).to include(strong_connection)
        expect(result).not_to include(weak_connection)
      end
    end

    describe ".ai_suggested" do
      it "AIが提案した未確認のコネクションを返す" do
        ai_suggested = create(:connection, source_note: note1, target_note: note2, ai_suggested: true, confirmed: false)
        confirmed = create(:connection, source_note: note1, target_note: note3, ai_suggested: true, confirmed: true)

        result = Connection.ai_suggested
        expect(result).to include(ai_suggested)
        expect(result).not_to include(confirmed)
      end
    end
  end
end
