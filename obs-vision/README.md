# Unite Pick Vision

ポケモンユナイトの敵チームピックを自動検出し、OBSオーバーレイで表示するツールです。

![preview](https://img.shields.io/badge/platform-Windows-blue) ![license](https://img.shields.io/badge/license-MIT-green)

**[デモ動画を見る](https://github.com/harisen/unite-pick-vision/releases/download/v1.0.0/demo.mp4)**

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

- **Windows 10/11** または **macOS**
- **OBS Studio** 28+（WebSocket標準搭載）
- OBSで映像キャプチャデバイス（キャプチャボード等）が設定済み

## セットアップ

### 1. ダウンロード

[Releases](https://github.com/harisen/unite-pick-vision/releases) から最新の `unite-pick-vision-vX.X.X-win64.zip` をダウンロードして展開します。

### 2. OBS の準備

#### OBS WebSocket を有効にする

1. OBS Studio を起動
2. メニューバーの **ツール → WebSocket サーバー設定** を開く
3. 「**WebSocket サーバーを有効にする**」にチェック
4. サーバーポート: **4455**（デフォルトのまま）
5. 「**認証を有効にする**」にチェックが入っている場合、表示されているパスワードをメモ
6. 「**OK**」で閉じる

> OBS Studio 28 以降は WebSocket が標準搭載されています。28 未満の場合は [obs-websocket プラグイン](https://github.com/obsproject/obs-websocket) を別途インストールしてください。

#### ゲーム画面のキャプチャ設定

1. OBS のソース欄で **＋ → 映像キャプチャデバイス** を追加
2. キャプチャボード（Switchの映像を取り込むデバイス）を選択
3. ゲーム画面が OBS のプレビューに映っていることを確認

### 3. Unite Pick Vision の起動

1. 展開したフォルダ内の `Unite Pick Vision.exe` をダブルクリック

> **SmartScreen の警告が出た場合:** 「**詳細情報**」→「**実行**」をクリックしてください。コード署名がないため警告が表示されますが、ソースコードは全て公開されており安全です。

2. 画面右下のタスクバーに小さな丸いアイコン（トレイアイコン）が表示されます
   - 見つからない場合は、タスクバー右下の **∧**（上矢印）をクリックして隠れたアイコンを確認
3. トレイアイコンを **右クリック →「設定」** を開く
4. **OBS パスワード** を入力して「保存」
5. OBS のソース欄に `obs-vision overlay` が自動追加されます

#### オーバーレイの表示順を確認

OBS のソース欄で `obs-vision overlay` が**一番上（最前面）**にあることを確認してください。ゲームキャプチャより下にあるとオーバーレイが見えません。ドラッグで順番を入れ替えられます。

### 4. 2回目以降

OBS を起動した状態で `Unite Pick Vision.exe` を起動するだけでOKです。設定は保存されています。

## 使い方

1. OBS を起動し、ゲーム画面が映っている状態にする
2. `Unite Pick Vision.exe` を起動
3. ポケモンユナイトのピック画面（選択フェイズ）になると**自動で検出開始**
4. 敵チームのピックがリアルタイムでメモ帳に表示されます
5. 全員のピック完了後、ロール別カラー＋レーン予測付きのオーバーレイが大きく表示されます
6. 45秒後に自動で非表示になります
7. 次の試合では自動的にリセットされ、再検出が始まります

### トレイメニュー

トレイアイコンを右クリックすると以下の操作ができます:

| メニュー | 説明 |
|---|---|
| ▶ テスト動画で検証 | 録画した動画で動作テスト |
| 設定 | OBS接続設定 |
| OBSに再接続 | 接続が切れた場合の再接続 |
| 終了 | アプリを終了 |

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

## 免責事項・著作権について

- 本ツールは**非公式のファンメイドツール**であり、株式会社ポケモン、TiMi Studios、任天堂とは一切関係ありません
- Pokemon、Pokemon UNITE およびゲーム内画像は各権利者の商標・著作物です
- ゲーム内画像はコミュニティツール目的で使用しており、商用利用を意図するものではありません
- **権利者から削除要請があった場合は速やかに対応いたします**
- 本ツールの使用によって生じた損害について、開発者は一切の責任を負いません

## ライセンス

[MIT License](LICENSE) — ソースコードは自由に利用・改変・再配布できます
