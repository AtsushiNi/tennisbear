Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # アクセスを許可するオリジン（フロントのアドレス）を指定
    origins "http://localhost:5100"

    resource '*',
      :headers => :any,
      # ユーザー認証関連
      # :expose => ['access-token', 'expiry', 'token-type', 'uid', 'client'],

      # リソースに対して許可するHTTPリクエストメソッドを指定
      :methods => [:get, :post, :options, :delete, :put, :head, :patch]

      # Cookieを利用する場合は以下を記述
      # :credentials => true
  end
end
