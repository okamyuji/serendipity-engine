module Api
  module V1
    class ProjectsController < BaseController
      before_action :set_project, only: [ :show, :update, :destroy ]

      def index
        @projects = current_user.projects.active.order(created_at: :desc)
        render json: @projects
      end

      def show
        render json: @project
      end

      def create
        @project = current_user.projects.build(project_params)
        @project.save!

        render json: @project, status: :created
      end

      def update
        @project.update!(project_params)
        render json: @project
      end

      def destroy
        @project.destroy!
        head :no_content
      end

      private

      def set_project
        @project = current_user.projects.find(params[:id])
      end

      def project_params
        params.require(:project).permit(:name, :description, :color, :archived)
      end
    end
  end
end
