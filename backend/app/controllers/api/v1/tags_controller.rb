module Api
  module V1
    class TagsController < BaseController
      before_action :set_tag, only: [ :show, :update, :destroy ]

      def index
        @tags = current_user.tags.order(name: :asc)
        render json: @tags
      end

      def show
        render json: @tag
      end

      def create
        @tag = current_user.tags.build(tag_params)
        @tag.save!

        render json: @tag, status: :created
      end

      def update
        @tag.update!(tag_params)
        render json: @tag
      end

      def destroy
        @tag.destroy!
        head :no_content
      end

      private

      def set_tag
        @tag = current_user.tags.find(params[:id])
      end

      def tag_params
        params.require(:tag).permit(:name, :color)
      end
    end
  end
end
