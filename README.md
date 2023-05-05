# README

## 概要
[テニスベア](https://www.tennisbear.net/event/prefecture/pref13)のイベント検索が使いにくかったので、自分用を作成

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
