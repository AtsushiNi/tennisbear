Rails.application.routes.draw do
  get "search" => "application#search"
  resources :events, only: [:show]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
