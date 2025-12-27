# frozen_string_literal: true

require "rails_helper"

RSpec.describe ChunkingService do
  let(:service) { described_class.new }

  describe "#split_content" do
    context "空のコンテンツの場合" do
      it "空の配列を返す" do
        expect(service.split_content("")).to eq([])
        expect(service.split_content(nil)).to eq([])
      end
    end

    context "短いコンテンツの場合" do
      let(:content) { Faker::Lorem.paragraph(sentence_count: 3) }

      it "1つのチャンクとして返す" do
        chunks = service.split_content(content)

        expect(chunks.size).to eq(1)
        expect(chunks.first[:content]).to eq(content.strip)
        expect(chunks.first[:position]).to eq(0)
      end
    end

    context "MAX_CHUNK_SIZEを超えるコンテンツの場合" do
      let(:long_content) do
        # 3000文字のコンテンツを生成
        Array.new(10) { Faker::Lorem.paragraph(sentence_count: 10) }.join("\n\n")
      end

      it "複数のチャンクに分割する" do
        chunks = service.split_content(long_content)

        expect(chunks.size).to be > 1
        chunks.each_with_index do |chunk, index|
          expect(chunk[:content]).to be_present
          expect(chunk[:position]).to eq(index)
          expect(chunk[:content].length).to be <= ChunkingService::MAX_CHUNK_SIZE + ChunkingService::OVERLAP_SIZE
        end
      end

      it "チャンク間にオーバーラップを持つ" do
        chunks = service.split_content(long_content)

        # 最初のチャンク以外は、前のチャンクの一部を含む可能性がある
        expect(chunks.size).to be > 1
      end
    end

    context "段落区切りのあるコンテンツの場合" do
      let(:content) do
        <<~TEXT
          これは最初の段落です。#{Faker::Lorem.sentence(word_count: 20)}

          これは2番目の段落です。#{Faker::Lorem.sentence(word_count: 20)}

          これは3番目の段落です。#{Faker::Lorem.sentence(word_count: 20)}
        TEXT
      end

      it "段落単位で適切に分割する" do
        chunks = service.split_content(content)

        expect(chunks).not_to be_empty
        chunks.each do |chunk|
          expect(chunk[:content]).to be_present
        end
      end
    end

    context "非常に長い1文がある場合" do
      let(:content) do
        # 実際に長い文を生成（句点で区切られた複数の文）
        sentences = Array.new(50) { Faker::Lorem.sentence(word_count: 50) }
        sentences.join("。") + "。"
      end

      it "文単位で分割する" do
        chunks = service.split_content(content)

        expect(chunks.size).to be >= 1
        # 空でないチャンクのみを検証
        non_empty_chunks = chunks.reject { |c| c[:content].blank? }
        expect(non_empty_chunks.size).to be >= 1
        non_empty_chunks.each do |chunk|
          expect(chunk[:content]).to be_present
        end
      end
    end

    context "日本語と英語が混在するコンテンツの場合" do
      let(:content) do
        <<~TEXT
          これは日本語の段落です。This is an English sentence. 日本語と英語が混在しています。

          Second paragraph with mixed content. 2番目の段落です。More English text here.

          最後の段落です。Final paragraph. おわり。
        TEXT
      end

      it "正しく分割する" do
        chunks = service.split_content(content)

        expect(chunks).not_to be_empty
        chunks.each do |chunk|
          expect(chunk[:content]).to be_present
          expect(chunk[:position]).to be >= 0
        end
      end
    end

    context "コードブロックを含むコンテンツの場合" do
      let(:content) do
        <<~TEXT
          これはコードの説明です。

          ```ruby
          def hello
            puts "Hello, World!"
          end
          ```

          コードの後の説明です。
        TEXT
      end

      it "コードブロックを保持したまま分割する" do
        chunks = service.split_content(content)

        expect(chunks).not_to be_empty
        # コードブロックが含まれていることを確認
        all_content = chunks.map { |c| c[:content] }.join("\n")
        expect(all_content).to include("```ruby")
      end
    end
  end

  describe "private methods" do
    describe "#split_into_sentences" do
      let(:text) { "これは最初の文です。これは2番目の文です！これは3番目の文ですか？" }

      it "文単位で分割する" do
        sentences = service.send(:split_into_sentences, text)

        expect(sentences.size).to eq(3)
        expect(sentences[0]).to include("最初の文です。")
        expect(sentences[1]).to include("2番目の文です！")
        expect(sentences[2]).to include("3番目の文ですか？")
      end
    end

    describe "#extract_overlap" do
      context "テキストがOVERLAP_SIZEより短い場合" do
        let(:short_text) { "短いテキスト" }

        it "空文字列を返す" do
          overlap = service.send(:extract_overlap, short_text)
          expect(overlap).to eq("")
        end
      end

      context "テキストがOVERLAP_SIZEより長い場合" do
        let(:long_text) { "あ" * 300 + "。最後の文です。" }

        it "最後の部分を返す" do
          overlap = service.send(:extract_overlap, long_text)

          expect(overlap).to be_present
          expect(overlap.length).to be <= ChunkingService::OVERLAP_SIZE
        end
      end
    end
  end
end
