module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        def create
          user = User.find_for_database_authentication(email: params[:user][:email])

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
