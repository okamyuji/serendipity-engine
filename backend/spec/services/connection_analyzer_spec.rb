# frozen_string_literal: true

require "rails_helper"

RSpec.describe ConnectionAnalyzer do
  let(:analyzer) { described_class.new }
  let(:user) { create(:user) }

  describe "#analyze_note" do
    context "チャンクを持つノートの場合" do
      let!(:note1) { create(:note, :with_chunks, user: user, title: "Note 1") }

      it "配列を返す" do
        # similar_toクエリをスタブ化
        empty_relation = Chunk.none
        allow(Chunk).to receive_message_chain(:for_user, :where, :not, :similar_to).and_return(empty_relation)

        result = analyzer.analyze_note(note1)

        expect(result).to be_an(Array)
      end
    end

    context "チャンクを持たないノートの場合" do
      let(:note) { create(:note, user: user) }

      it "空の配列を返す" do
        result = analyzer.analyze_note(note)

        expect(result).to be_empty
      end
    end
  end
end
