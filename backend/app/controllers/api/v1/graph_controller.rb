module Api
  module V1
    class GraphController < BaseController
      def show
        analyzer = ConnectionAnalyzer.new(current_user)
        graph_data = analyzer.generate_graph_data(
          limit: params[:limit]&.to_i || 100,
          min_strength: params[:min_strength]&.to_f || 0.5
        )

        render json: graph_data
      end
    end
  end
end
