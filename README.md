# Taskclear

![](./public/img/logo.svg)

* タスク管理アプリ
* ヘルプ作成しました
  * https://a-tak.github.io/taskclear/

## Remote-Container環境で開発する場合

postCreateCommand.sh.sampleをpostCreateCommand.shにリネームしてgitコミットのユーザー名を記載するとコンテナリビルド時に自動で設定される。

## リリースノート (以後のリリースノートはGithubの「リリース」の中に記載していく)
* 2019-08-12 ver. 0.11.0
  * Vuetify2.0導入に伴ってUIを修正
* 2019-08-11 ver. 0.10.2
  * オフライン対応のキャンセル(速度面の問題が出たため)
* 2019-06-22 ver. 0.10.0
  * オフライン対応
* 2019-06-22 ver. 0.9.0
  * タスクにメモをつけられるようにした
* 2019-06-22 ver. 0.8.0
  * タスク削除した際に上部に表示されるポップアップかZキーで削除前に戻せるようにしました(直前の一つのみ)
* 2019-06-16 ver. 0.7.2
  * 週間見積とヘッダを常に表示する様にしました
  * スマホでの表示を最適化しました
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
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

###  ステージングビルド
```
yarn staging
```

### パッチレベル修正
```
yarn build
```

### マイナーバージョンアップ
```
yarn minor
```

###  メジャーバージョンアップ
```
yarn major
```
### ビルドのみ(バージョン上げない)
```
yarn stay
```

### リリース

現在は以下の手順を実施するとGithub Actionにより自動でデプロイされる

1. ブランチで作業
1. ブランチをプッシュ
1. Githubでプルリクエスト作る
1. masterブランチにマージし
1. masterブランチをプル
1. ビルド `yarn build` 等
1. プッシュ
1. プッシュ(タグをフォロー)
1. Githubでリリース
    * code > xx tags にさきほどプッシュしたタグがあるので、タグの3点ドットから `Create release`
    * 内容を記載してPublish release
1. 自動的にGitHub ActionsでFirebaseにリリースされる

### セキュリティーアップデート手順

ソースにセキュリティーフィックスパッチを当てる手順

1. ブランチ作成
1. マイナーバージョンアップ適用
    ```
    yarn upgrade
    ```
1. 一旦コミット
2. メジャーアップデートが残るので確認して一つずつ適用
    ```
    yarn outdated
    yarn add パッケージ名@latest
    ```
3. 動作確認して問題なければコミット & プッシュ

### バージョンアップで動作しなくなる場合

問題のパッケージに目星をつけてPackage.jsonやyarn.lockから動いていたときのバージョンを特定。

```bash
yarn add パッケージ名@動作確認できていたときのバージョン
```
でバージョンを戻す

### なぜかビルドが失敗する場合

```node_modules```を一旦削除して```yarn install```を実行

### リリース(手動)

```
firebase use release
firebase deploy
```

### Run your tests
```
yarn test
```

### Lints and fixes files
```
yarn lint
```

### Run your end-to-end tests
```
yarn test:e2e
```

### Run your unit tests
```
yarn test:unit
```
