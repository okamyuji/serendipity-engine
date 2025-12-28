module Api
  module V1
    class DiscoveriesController < BaseController
      def index
        @discoveries = current_user.discoveries
                                   .active
                                   .unviewed
                                   .includes(:source_note, :target_note)
                                   .order(relevance_score: :desc)
                                   .limit(10)

        render json: @discoveries.as_json(include: { source_note: { only: [ :id, :title ] }, target_note: { only: [ :id, :title ] } })
      end

      def show
        # N+1 クエリ対策: 関連データを事前ロード
        @discovery = current_user.discoveries.includes(:source_note, :target_note).find(params[:id])
        @discovery.update!(viewed: true)

        render json: @discovery.as_json(include: { source_note: { only: [ :id, :title, :content ] }, target_note: { only: [ :id, :title, :content ] } })
      end

      def act
        @discovery = current_user.discoveries.find(params[:id])
        @discovery.update!(acted_upon: true)

        render json: @discovery
      end

      def dismiss
        @discovery = current_user.discoveries.find(params[:id])
        @discovery.update!(dismissed: true)

        head :no_content
      end

      def generate
        engine = DiscoveryEngine.new(current_user)
        engine.generate_daily_discoveries

        # 生成された発見を取得（N+1 クエリ対策）
        discoveries = current_user.discoveries
                                  .includes(:source_note, :target_note)
                                  .where("created_at >= ?", Time.current.beginning_of_day)

        render json: discoveries.as_json(
          include: {
            source_note: { only: [ :id, :title ] },
            target_note: { only: [ :id, :title ] }
          }
        )
      rescue StandardError => e
        render json: { error: "Failed to generate discoveries: #{e.message}" }, status: :internal_server_error
      end
    end
  end
end
