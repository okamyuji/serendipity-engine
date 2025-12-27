# frozen_string_literal: true

require "rails_helper"

RSpec.describe Tag, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:note_tags).dependent(:destroy) }
    it { is_expected.to have_many(:notes).through(:note_tags) }
  end

  describe "validations" do
    let(:user) { create(:user) }

    it { is_expected.to validate_presence_of(:name) }

    it "nameがuser_idスコープで一意である" do
      create(:tag, user: user, name: "Ruby")
      duplicate = build(:tag, user: user, name: "Ruby")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:name]).to be_present
    end

    it "異なるユーザーは同じ名前のタグを作成できる" do
      other_user = create(:user)
      create(:tag, user: user, name: "Ruby")
      tag2 = build(:tag, user: other_user, name: "Ruby")
      expect(tag2).to be_valid
    end

    describe "color validation" do
      it "有効なHEXカラーコードを受け入れる" do
        tag = build(:tag, user: user, color: "#FF5733")
        expect(tag).to be_valid
      end

      it "小文字のHEXカラーコードを受け入れる" do
        tag = build(:tag, user: user, color: "#ff5733")
        expect(tag).to be_valid
      end

      it "無効なカラーコードを拒否する" do
        tag = build(:tag, user: user, color: "red")
        expect(tag).not_to be_valid
        expect(tag.errors[:color]).to be_present
      end

      it "短いHEXカラーコードを拒否する" do
        tag = build(:tag, user: user, color: "#FFF")
        expect(tag).not_to be_valid
      end

      it "colorがnilの場合有効" do
        tag = build(:tag, user: user, color: nil)
        expect(tag).to be_valid
      end
    end
  end

  describe "factory" do
    let(:user) { create(:user) }

    it "有効なファクトリを持つ" do
      tag = create(:tag, user: user)
      expect(tag).to be_valid
    end
  end

  describe "dependent destroy" do
    let(:user) { create(:user) }
    let(:tag) { create(:tag, user: user) }
    let(:note) { create(:note, user: user) }

    it "タグを削除するとNoteTagも削除される" do
      NoteTag.create!(note: note, tag: tag)
      expect { tag.destroy }.to change { NoteTag.count }.by(-1)
    end
  end
end
