module Api
  module V1
    class NotesController < BaseController
      before_action :set_note, only: [ :show, :update, :destroy ]

      def index
        @notes = current_user.notes.active

        # プロジェクトでフィルタ
        @notes = @notes.where(project_id: params[:project_id]) if params[:project_id].present?

        # タグでフィルタ
        if params[:tag_ids].present?
          tag_ids = Array(params[:tag_ids])
          @notes = @notes.joins(:tags).where(tags: { id: tag_ids }).distinct
        end

        # アーカイブフィルタ
        @notes = @notes.where(archived: params[:archived]) if params[:archived].present?

        # ピン留めフィルタ
        @notes = @notes.where(pinned: params[:pinned]) if params[:pinned].present?

        # ソート
        @notes = @notes.order(updated_at: :desc)

        render json: @notes.as_json(
          include: {
            project: { only: [ :id, :name, :color ] },
            tags: { only: [ :id, :name, :color ] }
          }
        )
      end

      def show
        @note.touch
        AccessLog.create!(user: current_user, note: @note, action_type: "view")

        render json: @note.as_json(include: { project: { only: [ :id, :name, :color ] }, tags: { only: [ :id, :name, :color ] }, chunks: { only: [ :id, :content, :position ] } })
      end

      def create
        @note = current_user.notes.build(note_params)
        @note.save!

        render json: @note.as_json(
          include: {
            project: { only: [ :id, :name, :color ] },
            tags: { only: [ :id, :name, :color ] }
          }
        ), status: :created
      end

      def update
        @note.update!(note_params)
        render json: @note.as_json(
          include: {
            project: { only: [ :id, :name, :color ] },
            tags: { only: [ :id, :name, :color ] }
          }
        )
      end

      def destroy
        @note.destroy!
        head :no_content
      end

      private

      def set_note
        @note = current_user.notes.find(params[:id])
      end

      def note_params
        params.require(:note).permit(:title, :content, :content_html, :project_id, :pinned, tag_ids: [])
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count
        }
      end
    end
  end
end
