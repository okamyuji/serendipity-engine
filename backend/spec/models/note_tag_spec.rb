# frozen_string_literal: true

require "rails_helper"

RSpec.describe NoteTag, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:note) }
    it { is_expected.to belong_to(:tag) }
  end

  describe "validations" do
    let(:user) { create(:user) }
    let(:note) { create(:note, user: user) }
    let(:tag) { create(:tag, user: user) }

    it "note_idとtag_idの組み合わせが一意である" do
      NoteTag.create!(note: note, tag: tag)
      duplicate = NoteTag.new(note: note, tag: tag)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:note_id]).to be_present
    end

    it "異なるノートに同じタグを付けられる" do
      note2 = create(:note, user: user)
      NoteTag.create!(note: note, tag: tag)
      note_tag2 = NoteTag.new(note: note2, tag: tag)
      expect(note_tag2).to be_valid
    end

    it "同じノートに異なるタグを付けられる" do
      tag2 = create(:tag, user: user)
      NoteTag.create!(note: note, tag: tag)
      note_tag2 = NoteTag.new(note: note, tag: tag2)
      expect(note_tag2).to be_valid
    end
  end

  describe "factory" do
    let(:user) { create(:user) }
    let(:note) { create(:note, user: user) }
    let(:tag) { create(:tag, user: user) }

    it "有効なNoteTagを作成できる" do
      note_tag = NoteTag.create!(note: note, tag: tag)
      expect(note_tag).to be_valid
    end
  end
end
