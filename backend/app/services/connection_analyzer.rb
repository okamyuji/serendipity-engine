# frozen_string_literal: true

class ConnectionAnalyzer
  # 関連性の閾値
  SEMANTIC_THRESHOLD = 0.7    # セマンティック類似度
  TAG_THRESHOLD = 0.5         # タグ共有による関連性
  TEMPORAL_THRESHOLD = 0.4    # 時間的近接性

  # ノートの関連性を分析してConnectionを生成
  # @param note [Note] 分析対象のノート
  # @return [Array<Connection>] 生成されたConnectionの配列
  def analyze_note(note)
    return [] unless note.chunks.exists?

    user = note.user
    connections = []

    # 1. セマンティック類似度による関連性
    connections += find_semantic_connections(note, user)

    # 2. タグ共有による関連性
    connections += find_tag_based_connections(note, user)

    # 3. 時間的近接性による関連性
    connections += find_temporal_connections(note, user)

    # 4. プロジェクト内関連性
    connections += find_project_connections(note, user) if note.project_id.present?

    # 重複を除去してConnectionレコードを作成
    create_unique_connections(connections)
  end

  private

  # セマンティック類似度による関連ノート検出
  def find_semantic_connections(note, user)
    connections = []

    # ノートの各チャンクについて類似チャンクを検索
    note.chunks.each do |chunk|
      similar_chunks = Chunk.for_user(user.id)
                            .where.not(note_id: note.id)
                            .similar_to(chunk.embedding, limit: 5)

      similar_chunks.each do |similar_chunk|
        # コサイン類似度を計算（Neighborが提供）
        distance = chunk.neighbor_distance(similar_chunk, :embedding)
        similarity = 1 - distance  # 距離を類似度に変換

        if similarity >= SEMANTIC_THRESHOLD
          connections << {
            source_note: note,
            target_note: similar_chunk.note,
            connection_type: :semantic,
            strength: similarity,
            ai_suggested: true,
            confirmed: false
          }
        end
      end
    end

    connections
  end

  # タグ共有による関連ノート検出
  def find_tag_based_connections(note, user)
    return [] if note.tags.empty?

    connections = []
    tag_ids = note.tag_ids

    # 同じタグを持つノートを検索
    related_notes = user.notes
                        .where.not(id: note.id)
                        .joins(:tags)
                        .where(tags: { id: tag_ids })
                        .distinct
                        .includes(:tags)

    related_notes.each do |related_note|
      # 共有タグ数に基づいて強度を計算
      shared_tags_count = (note.tag_ids & related_note.tag_ids).size
      total_tags_count = (note.tag_ids + related_note.tag_ids).uniq.size
      strength = shared_tags_count.to_f / total_tags_count

      if strength >= TAG_THRESHOLD
        connections << {
          source_note: note,
          target_note: related_note,
          connection_type: :tag_based,
          strength: strength,
          ai_suggested: false,
          confirmed: true
        }
      end
    end

    connections
  end

  # 時間的近接性による関連ノート検出
  def find_temporal_connections(note, user)
    connections = []

    # 作成時刻が近い（前後1時間以内）ノートを検索
    time_window = 1.hour
    nearby_notes = user.notes
                       .where.not(id: note.id)
                       .where(created_at: (note.created_at - time_window)..(note.created_at + time_window))
                       .limit(5)

    nearby_notes.each do |nearby_note|
      # 時間差に基づいて強度を計算（近いほど強い）
      time_diff = (note.created_at - nearby_note.created_at).abs
      strength = 1 - (time_diff / time_window.to_f)

      if strength >= TEMPORAL_THRESHOLD
        connections << {
          source_note: note,
          target_note: nearby_note,
          connection_type: :temporal,
          strength: strength,
          ai_suggested: true,
          confirmed: false
        }
      end
    end

    connections
  end

  # プロジェクト内関連性による関連ノート検出
  def find_project_connections(note, user)
    connections = []

    # 同じプロジェクト内のノートを検索
    project_notes = user.notes
                        .where(project_id: note.project_id)
                        .where.not(id: note.id)
                        .order(updated_at: :desc)
                        .limit(10)

    project_notes.each do |project_note|
      # プロジェクト内の関連性は中程度の強度
      connections << {
        source_note: note,
        target_note: project_note,
        connection_type: :explicit,
        strength: 0.6,
        ai_suggested: false,
        confirmed: true
      }
    end

    connections
  end

  # 重複を除去してConnectionレコードを作成
  def create_unique_connections(connections)
    created_connections = []

    # source_note_id と target_note_id のペアでグループ化
    grouped = connections.group_by do |conn|
      [ conn[:source_note].id, conn[:target_note].id ]
    end

    grouped.each do |(_source_id, _target_id), group|
      # 最も強度の高い接続を採用
      best_connection = group.max_by { |conn| conn[:strength] }

      # 既存のConnectionがあるか確認
      existing = Connection.find_by(
        source_note_id: best_connection[:source_note].id,
        target_note_id: best_connection[:target_note].id
      )

      if existing
        # 既存のConnectionの強度を更新（より高い値を採用）
        if best_connection[:strength] > existing.strength
          existing.update(
            strength: best_connection[:strength],
            connection_type: best_connection[:connection_type]
          )
          created_connections << existing
        end
      else
        # 新しいConnectionを作成
        connection = Connection.create(best_connection)
        created_connections << connection if connection.persisted?
      end
    end

    created_connections
  end
end
