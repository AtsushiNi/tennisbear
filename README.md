# README

## 概要
[テニスベア](https://www.tennisbear.net/event/prefecture/pref13)のイベント検索が使いにくかったので、自分用を作成

## 画面
https://user-images.githubusercontent.com/45954308/236655473-4310076a-8b1c-4b60-857b-2411a585e04d.mp4

## 構成
- バックエンド：Ruby on Rails
  - CORS対策でテニスベアのAPIをバックエンドから叩く
- フロントエンド：React
  - GoogleMapはreact-google-maps/apiを使用
- foremanを使って1コマンドでRailsとReactを起動

## 使用方法
1. frontend/.envに以下を記述
```
REACT_APP_GOOGLE_MAP_API_KEY=Google Cloud プラットフォームのAPIキー
```

2. ルートディレクトリで以下を実行
```
bundle exec foreman start
```

## ディレクトリ構成
```
.
├── .git
├── .gitignore
├── .ruby-version
├── Gemfile
├── Gemfile.lock
├── Procfile          // 起動コマンドの設定
├── README.md
├── app
│   └── controllers
│       ├── application_controller.rb  // イベント一覧の取得
│       └── events_controller.rb       // イベント詳細の取得
├── config
│   └── routes.rb
├── frontend
│   ├── .env
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── App.css
│       ├── App.js         // フロントの実装
│       ├── Components
│       │   └── GoogleMap.jsx // 画面に入らなかったのでコメントアウト
│       ├── index.css
│       ├── index.js
└── vendor
```
