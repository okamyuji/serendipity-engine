module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json
        skip_before_action :verify_authenticity_token

        def create
          Rails.logger.info "SessionsController#create called"
          Rails.logger.info "Params: #{params.inspect}"

          user = User.find_for_database_authentication(email: params[:user][:email])
          Rails.logger.info "User found: #{user.present?}"

          if user&.valid_password?(params[:user][:password])
            # JWTトークンを生成
            token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

            render json: {
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                created_at: user.created_at,
                updated_at: user.updated_at
              },
              token: token
            }, status: :ok
          else
            render json: {
              error: "Invalid email or password"
            }, status: :unauthorized
          end
        rescue => e
          Rails.logger.error "SessionsController#create error: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          render json: { error: e.message }, status: :internal_server_error
        end

        def destroy
          if current_user
            # JWTトークンを無効化（JwtDenylistに追加）
            render json: {
              message: "Logged out successfully."
            }, status: :ok
          else
            render json: {
              message: "Couldn't find an active session."
            }, status: :unauthorized
          end
        end
      end
    end
  end
end
