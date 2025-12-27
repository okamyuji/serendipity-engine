Rails.application.routes.draw do
  devise_for :users,
             path: "",
             path_names: {
               sign_in: "api/v1/auth/login",
               sign_out: "api/v1/auth/logout",
               registration: "api/v1/auth/signup"
             },
             controllers: {
               sessions: "api/v1/auth/sessions",
               registrations: "api/v1/auth/registrations"
             }

  namespace :api do
    namespace :v1 do
      resources :notes
      resources :projects
      resources :tags
      resources :discoveries, only: [ :index, :show ] do
        member do
          post :act
          post :dismiss
        end
        collection do
          post :generate
        end
      end
      get "search", to: "search#index"
      get "search/semantic", to: "search#semantic"
      get "graph", to: "graph#show"
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
