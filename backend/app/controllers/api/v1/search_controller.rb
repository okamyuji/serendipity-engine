module Api
  module V1
    class SearchController < BaseController
      def index
        return render json: { results: [] } if params[:q].blank?

        # キーワード検索
        @notes = current_user.notes
                             .active
                             .where("title ILIKE ? OR content ILIKE ?", "%#{params[:q]}%", "%#{params[:q]}%")
                             .limit(params[:limit]&.to_i || 10)

        render json: {
          results: @notes.as_json(include: { project: { only: [ :id, :name, :color ] }, tags: { only: [ :id, :name, :color ] } }),
          query: params[:q],
          search_type: "keyword"
        }
      end

      def semantic
        return render json: { results: [] } if params[:q].blank?

        begin
          # クエリのEmbeddingを生成
          embedding_service = EmbeddingService.new
          query_embedding = embedding_service.generate_embedding(params[:q])

          # 類似チャンクを検索
          similar_chunks = Chunk.for_user(current_user.id)
                                .similar_to(query_embedding, limit: params[:limit]&.to_i || 10)

          # チャンクからノートを取得（重複除去）
          note_ids = similar_chunks.pluck(:note_id).uniq
          @notes = current_user.notes
                               .active
                               .where(id: note_ids)
                               .includes(:project, :tags)

          # 類似度スコアを付与
          notes_with_scores = @notes.map do |note|
            # このノートに属するチャンクの最高類似度を取得
            best_chunk = similar_chunks.find { |chunk| chunk.note_id == note.id }
            distance = best_chunk ? best_chunk.neighbor_distance(query_embedding, :embedding) : 1.0
            similarity = 1 - distance

            note.as_json(
              include: {
                project: { only: [ :id, :name, :color ] },
                tags: { only: [ :id, :name, :color ] }
              }
            ).merge(similarity_score: similarity.round(3))
          end

          # 類似度でソート
          notes_with_scores.sort_by! { |n| -n[:similarity_score] }

          render json: {
            results: notes_with_scores,
            query: params[:q],
            search_type: "semantic"
          }
        rescue EmbeddingService::EmbeddingError => e
          render json: { error: "Semantic search failed: #{e.message}" }, status: :service_unavailable
        end
      end
    end
  end
end
