# Taskclear

![](./public/img/logo.svg)

* タスク管理アプリ
* お試しページ
  * https://tc.a-tak.com
  * データを消す場合がありますのであくまでお試しで
  * メールや登録したデータは管理者は見えてしまいますので、ほんとあくまでお試しで
* ヘルプ作成しました
  * https://github.com/a-tak/taskclear/tree/master/help/README.md

## リリースノート

* 2019-06-02 ver. 0.6.0
  * 週間見積に終了予定時刻を表示するようにしました
* 2019-06-02 ver. 0.5.0
  * 週間見積に終了予定時刻を表示するようにしました
* 2019-05-26 ver. 0.4.0
  * 日付を1日進めるショートカットFと一日戻すＲを追加しました
  * タスク入力欄でグローバルショートカットキーが利いて入力しづらい問題を解消
* 2019-02-04 ver. 0.3.1
  * セクション機能を追加しました。詳細はヘルプを参照。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

###  ステージングビルド
```
npm run staging
```

### パッチレベル修正
```
npm run build
```

### マイナーバージョンアップ
```
npm run minor
```

###  メジャーバージョンアップ
```
npm run major
```

### リリース

```
firebase use release
firebase deploy
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Run your unit tests
```
npm run test:unit
```
