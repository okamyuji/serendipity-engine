# frozen_string_literal: true

require "rails_helper"

RSpec.describe Chunk, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:note) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:content) }
  end

  describe "scopes" do
    let(:user) { create(:user) }
    let(:other_user) { create(:user) }
    let(:note) { create(:note, user: user) }
    let(:other_note) { create(:note, user: other_user) }
    let!(:chunk1) { create(:chunk, note: note, content: "Ruby programming") }
    let!(:chunk2) { create(:chunk, note: note, content: "Python programming") }
    let!(:other_chunk) { create(:chunk, note: other_note, content: "JavaScript programming") }

    describe ".for_user" do
      it "指定ユーザーのチャンクのみを返す" do
        result = Chunk.for_user(user.id)
        expect(result).to include(chunk1, chunk2)
        expect(result).not_to include(other_chunk)
      end
    end
  end

  describe "factory" do
    let(:user) { create(:user) }
    let(:note) { create(:note, user: user) }

    it "有効なファクトリを持つ" do
      chunk = create(:chunk, note: note)
      expect(chunk).to be_valid
    end

    it "contentが空の場合エラー" do
      chunk = build(:chunk, note: note, content: nil)
      expect(chunk).not_to be_valid
      expect(chunk.errors[:content]).to be_present
    end

    it "embeddingを持つチャンクを作成できる" do
      chunk = create(:chunk, :with_embedding, note: note)
      expect(chunk.embedding).to be_present
      expect(chunk.embedding.size).to eq(1536)
    end
  end
end
