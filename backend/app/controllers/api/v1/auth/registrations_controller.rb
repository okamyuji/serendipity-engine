module Api
  module V1
    module Auth
      class RegistrationsController < Devise::RegistrationsController
        respond_to :json

        def create
          build_resource(sign_up_params)

          resource.save
          if resource.persisted?
            # JWTトークンを生成
            token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first

            render json: {
              user: {
                id: resource.id,
                email: resource.email,
                name: resource.name,
                created_at: resource.created_at,
                updated_at: resource.updated_at
              },
              token: token
            }, status: :created
          else
            render json: {
              errors: resource.errors.full_messages
            }, status: :unprocessable_entity
          end
        end

        private

        def sign_up_params
          params.require(:user).permit(:email, :password, :password_confirmation, :name)
        end
      end
    end
  end
end
