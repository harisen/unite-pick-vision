# Unite Pick Vision

ポケモンユナイトの敵チームピックを自動検出し、OBSオーバーレイで表示するツールです。

![preview](https://img.shields.io/badge/platform-Windows-blue) ![license](https://img.shields.io/badge/license-MIT-green)

## 機能

- **敵チーム5体の自動検出** — テンプレートマッチングによるリアルタイム検出（AI/GPU不要）
- **OBSオーバーレイ** — ピック中はメモ帳風、確定後はロール別カラーカードで大表示
- **レーン予測** — ロール＋ジャングル適性から上/中央/下ルートを自動推定
- **ロール別カラー** — アタック(赤)/ディフェンス(緑)/スピード(青)/バランス(紫)/サポート(黄)
- **CC情報表示** — スタン・スロー・ノックバック等のCC種別を表示
- **キャリブレーションツール** — スロット座標をGUIで簡単設定
- **テスト動画検証** — 録画した動画でオフラインテスト可能
- **完全オフライン** — インターネット接続不要

## 必要環境

- **Windows 10/11**
- **OBS Studio** 28+（WebSocket標準搭載）
- OBSで映像キャプチャデバイス（キャプチャボード等）が設定済み

## セットアップ

### 1. ダウンロード

[Releases](https://github.com/harisen/unite-pick-vision/releases) から最新の `unite-pick-vision-vX.X.X-win64.zip` をダウンロードして展開します。

### 2. OBS WebSocket の設定

OBS Studio を開いて以下を確認:
1. **ツール → WebSocket サーバー設定** を開く
2. 「WebSocket サーバーを有効にする」を **ON**
3. ポート: **4455**（デフォルトのまま）
4. パスワードをメモしておく

### 3. 初回起動

1. 展開したフォルダ内の `Unite Pick Vision.exe` をダブルクリック

> **SmartScreen の警告が出た場合:** 「詳細情報」→「実行」をクリックしてください。コード署名がないため警告が表示されますが、ソースコードは全て公開されており安全です。
2. 初回起動時にトレイアイコン（右下）から **設定** を開く
3. OBS パスワードを入力して保存
4. OBSに `obs-vision overlay` ブラウザソースが自動で追加されます

### 4. 2回目以降

`Unite Pick Vision.exe` を起動するだけでOKです。

## 使い方

1. OBSを起動し、ゲーム画面のキャプチャが映っている状態にする
2. `Unite Pick Vision.exe` を起動（システムトレイに常駐）
3. ゲームのピック画面になると自動検出開始
4. 敵チーム確定後、レーン予測付きオーバーレイが表示（45秒後に自動非表示）
5. 次の試合で自動的にリセットされ、再検出が始まります

> **開発者向け:** ソースから起動する場合は `git clone` → `npm install` → `npm start`

## スロット座標の調整

初回や画面レイアウトが変わった場合:

1. ピック画面を映した状態で `http://localhost:3000/capture` をブラウザで開く
2. `http://localhost:3000/calibrate.html` を開く
3. 1番上のアイコンの左上 → 右下 → 1番下のアイコンの中央 を順にクリック
4. 「この座標を適用」ボタンで保存

## テスト動画での検証

1. ピック画面を含む動画を録画
2. `.env` に `TEST_VIDEOS=C:/path/to/video1.mp4;C:/path/to/video2.mp4` を追加
3. トレイアイコン右クリック → 「▶ テスト動画で検証」

## プレビュー

- `http://localhost:3000/preview-ingame.html` — UI プレビュー（ランダムPT生成、クリックで切替）
- `http://localhost:3000/preview.html` — スロット検出リアルタイムプレビュー

## ポケモンDBの更新

[UniteDiscordBot](https://github.com/harisen/UniteDiscordBot) のデータから再生成:

```bash
node build-pokemon-db.js
```

画像とポケモン情報が自動同期されます。

## 技術詳細

- **検出方式**: Electron `nativeImage.toBitmap()` によるピクセル差分比較（BGRA）
- **各スロット個別ロック**: 2フレーム連続一致で確定、以後変更不可
- **未ピック枠検出**: テンプレートマッチングでオレンジカウントダウンを判別
- **レーン予測**: ロール優先度スコア + ジャングル適性ボーナス
- **OBS連携**: OBS WebSocket v5 で GetSourceScreenshot / CreateInput

## ファイル構成

```
unite-pick-vision/
  main.js            — Electron メインプロセス
  overlay.html       — OBS ブラウザソース用オーバーレイ
  settings.html      — 設定ウィンドウ
  calibrate.html     — スロット座標キャリブレーション
  preview-slots.html — リアルタイム検出プレビュー
  preview-ingame.html— UIプレビュー
  pokemon-db.json    — ポケモンDB（89体）
  build-pokemon-db.js— DB再生成スクリプト
  images/            — テンプレート画像（t_Square_*.png）
  .env.example       — 設定テンプレート
  start.bat          — Windows起動スクリプト
```

## 注意事項

- Pokemon および Pokemon UNITE は株式会社ポケモン / TiMi Studios の商標です
- ゲーム内画像はコミュニティツール目的で使用しています
- 本ツールは非公式のファンメイドツールです

## ライセンス

MIT
