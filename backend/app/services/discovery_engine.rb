# frozen_string_literal: true

class DiscoveryEngine
  FORGOTTEN_DAYS_THRESHOLD = 30  # 忘れられたノートの基準日数
  MIN_ACCESS_COUNT = 3           # Forgotten Gemsの最小アクセス数
  BRIDGE_SIMILARITY_THRESHOLD = 0.75  # Bridge発見の類似度閾値
  MAX_DISCOVERIES_PER_TYPE = 5   # 各タイプの最大発見数

  # ユーザーの日次発見を生成
  # @param user [User] 対象ユーザー
  # @return [Array<Discovery>] 生成されたDiscoveryの配列
  def generate_daily_discoveries(user)
    discoveries = []

    # 1. Forgotten Gems: 忘れられた価値あるノート
    discoveries += find_forgotten_gems(user)

    # 2. Bridge: 異なるプロジェクト間の意外な関連性
    discoveries += find_bridges(user)

    # 3. Learning Path: 知識の習得経路提案
    discoveries += find_learning_paths(user)

    discoveries
  end

  # 忘れられた価値あるノートを発見
  def find_forgotten_gems(user)
    forgotten_notes = user.notes
                          .active
                          .where("last_accessed_at < ?", FORGOTTEN_DAYS_THRESHOLD.days.ago)
                          .where("access_count >= ?", MIN_ACCESS_COUNT)
                          .order(access_count: :desc)
                          .limit(MAX_DISCOVERIES_PER_TYPE)

    forgotten_notes.map do |note|
      # 既存の同じ発見があるか確認
      existing = Discovery.find_by(
        user: user,
        discovery_type: :forgotten_gem,
        target_note: note,
        viewed: false
      )

      next existing if existing

      # 新しい発見を作成
      Discovery.create!(
        user: user,
        discovery_type: :forgotten_gem,
        target_note: note,
        explanation: generate_forgotten_gem_explanation(note),
        relevance_score: calculate_forgotten_gem_score(note),
        expires_at: 7.days.from_now
      )
    end.compact
  end

  # 異なるプロジェクト間の意外な関連性を発見
  def find_bridges(user)
    return [] unless user.projects.count >= 2

    bridges = []
    projects = user.projects.active.to_a

    # プロジェクトの全ペアについて調査
    projects.combination(2).each do |project1, project2|
      bridge = find_bridge_between_projects(user, project1, project2)
      bridges << bridge if bridge
    end

    bridges.take(MAX_DISCOVERIES_PER_TYPE)
  end

  # 知識の習得経路を提案
  def find_learning_paths(user)
    learning_paths = []

    # アクセス頻度の高いノートを起点とする
    popular_notes = user.notes
                        .active
                        .where("access_count >= ?", 5)
                        .order(access_count: :desc)
                        .limit(3)

    popular_notes.each do |note|
      # このノートに関連する未読・低アクセスのノートを探す
      related_unread = find_related_unread_notes(user, note)

      if related_unread.any?
        # 既存の同じ発見があるか確認
        existing = Discovery.find_by(
          user: user,
          discovery_type: :learning_path,
          source_note: note,
          viewed: false
        )

        next if existing

        learning_paths << Discovery.create!(
          user: user,
          discovery_type: :learning_path,
          source_note: note,
          target_note: related_unread.first,
          explanation: "「#{note.title}」を深く学んでいますね。関連する「#{related_unread.first.title}」も読むと理解が深まるかもしれません。",
          relevance_score: 0.8,
          expires_at: 7.days.from_now
        )
      end
    end

    learning_paths.take(MAX_DISCOVERIES_PER_TYPE)
  end

  private

  def generate_forgotten_gem_explanation(note)
    days_ago = ((Time.current - note.last_accessed_at) / 1.day).to_i
    "「#{note.title}」は#{note.access_count}回アクセスされた重要なノートですが、#{days_ago}日間見られていません。再確認してみませんか？"
  end

  def calculate_forgotten_gem_score(note)
    # アクセス数と経過日数から関連性スコアを計算
    days_ago = ((Time.current - note.last_accessed_at) / 1.day).to_f
    access_weight = [ note.access_count / 10.0, 1.0 ].min
    time_weight = [ days_ago / 60.0, 1.0 ].min

    (access_weight * 0.6 + time_weight * 0.4).round(2)
  end

  def find_bridge_between_projects(user, project1, project2)
    # 各プロジェクトのノートのチャンクを取得
    chunks1 = Chunk.joins(:note).where(notes: { project_id: project1.id, user_id: user.id })
    chunks2 = Chunk.joins(:note).where(notes: { project_id: project2.id, user_id: user.id })

    return nil if chunks1.empty? || chunks2.empty?

    # 最も類似度の高いペアを探す
    best_similarity = 0
    best_pair = nil

    chunks1.limit(20).each do |chunk1|
      similar_chunks = chunks2.similar_to(chunk1.embedding, limit: 1)

      similar_chunks.each do |chunk2|
        distance = chunk1.neighbor_distance(chunk2, :embedding)
        similarity = 1 - distance

        if similarity > best_similarity && similarity >= BRIDGE_SIMILARITY_THRESHOLD
          best_similarity = similarity
          best_pair = [ chunk1.note, chunk2.note ]
        end
      end
    end

    return nil unless best_pair

    # 既存の同じ発見があるか確認
    existing = Discovery.find_by(
      user: user,
      discovery_type: :bridge,
      source_note: best_pair[0],
      target_note: best_pair[1],
      viewed: false
    )

    return existing if existing

    # 新しい発見を作成
    Discovery.create!(
      user: user,
      discovery_type: :bridge,
      source_note: best_pair[0],
      target_note: best_pair[1],
      explanation: "「#{project1.name}」の「#{best_pair[0].title}」と「#{project2.name}」の「#{best_pair[1].title}」に意外な関連性を発見しました。",
      relevance_score: best_similarity,
      expires_at: 7.days.from_now
    )
  end

  def find_related_unread_notes(user, note)
    return [] unless note.chunks.exists?

    related_note_ids = []

    # ノートのチャンクから類似ノートを探す
    note.chunks.limit(3).each do |chunk|
      similar_chunks = Chunk.for_user(user.id)
                            .where.not(note_id: note.id)
                            .similar_to(chunk.embedding, limit: 5)

      similar_chunks.each do |similar_chunk|
        related_note_ids << similar_chunk.note_id
      end
    end

    # 低アクセス（3回以下）のノートに絞る
    user.notes
        .active
        .where(id: related_note_ids.uniq)
        .where("access_count <= ?", 3)
        .order(access_count: :asc)
        .limit(3)
  end
end
