# frozen_string_literal: true

class ChunkingService
  # 1チャンクの最大文字数（約500トークン相当）
  MAX_CHUNK_SIZE = 2000

  # チャンク間のオーバーラップ文字数（文脈保持のため）
  OVERLAP_SIZE = 200

  # コンテンツを複数のチャンクに分割
  # @param content [String] 分割するコンテンツ
  # @return [Array<Hash>] チャンク情報の配列 [{content: String, position: Integer}]
  def split_content(content)
    return [] if content.blank?

    # 段落で分割（改行2つ以上）
    paragraphs = content.split(/\n{2,}/).reject(&:blank?)

    chunks = []
    current_chunk = ""
    position = 0

    paragraphs.each do |paragraph|
      # 段落が単独でMAX_CHUNK_SIZEを超える場合は文単位で分割
      if paragraph.length > MAX_CHUNK_SIZE
        # 現在のチャンクを保存
        if current_chunk.present?
          chunks << { content: current_chunk.strip, position: position }
          position += 1
          current_chunk = ""
        end

        # 長い段落を文単位で分割
        sentences = split_into_sentences(paragraph)
        sentences.each do |sentence|
          if current_chunk.length + sentence.length > MAX_CHUNK_SIZE
            # チャンクを保存
            chunks << { content: current_chunk.strip, position: position }
            position += 1

            # オーバーラップを持たせる
            overlap = extract_overlap(current_chunk)
            current_chunk = overlap + sentence
          else
            current_chunk += sentence
          end
        end
      else
        # 段落を追加しても MAX_CHUNK_SIZE を超えない場合
        if current_chunk.length + paragraph.length + 2 <= MAX_CHUNK_SIZE
          current_chunk += "\n\n" if current_chunk.present?
          current_chunk += paragraph
        else
          # 現在のチャンクを保存して新しいチャンクを開始
          chunks << { content: current_chunk.strip, position: position }
          position += 1

          # オーバーラップを持たせる
          overlap = extract_overlap(current_chunk)
          current_chunk = overlap + paragraph
        end
      end
    end

    # 最後のチャンクを保存
    if current_chunk.present?
      chunks << { content: current_chunk.strip, position: position }
    end

    chunks
  end

  private

  # テキストを文単位で分割
  def split_into_sentences(text)
    # 句点、疑問符、感嘆符で分割
    text.scan(/[^。！？\.!?]+[。！？\.!?]+|[^。！？\.!?]+$/)
  end

  # チャンクの最後からオーバーラップ部分を抽出
  def extract_overlap(text)
    return "" if text.length <= OVERLAP_SIZE

    # 最後のOVERLAP_SIZE文字を取得
    overlap_text = text[-OVERLAP_SIZE..]

    # 文の途中で切れないように、最初の句点まで進める
    if overlap_text =~ /[。！？\.!?]/
      overlap_text = overlap_text.split(/[。！？\.!?]/, 2).last || ""
    end

    overlap_text.strip
  end
end
