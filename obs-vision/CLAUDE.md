# obs-vision

ポケモンユナイトの敵チーム構成を自動検出してOBSオーバーレイで表示するツール。

## アーキテクチャ
- **検出方式**: nativeImage テンプレートマッチング（AI/GPU不要）
- **各スロット個別ロック**: 2フレーム連続一致で確定、以後変更なし
- **OBS連携**: OBS WebSocket v5 でスクリーンショット取得・ブラウザソース自動追加
- **オーバーレイ**: SSE でリアルタイム更新、ロール別カラー、レーン予測表示

## 構成
- `main.js` — Electron メインプロセス（検出・OBS連携・Express）
- `overlay.html` — OBS ブラウザソース用オーバーレイ
- `pokemon-db.json` — ポケモンDB（ロール・CC・ジャングル適性）
- `build-pokemon-db.js` — DB再生成スクリプト（UniteDiscordBot連携）
- `images/t_Square_*.png` — テンプレート画像
- `.env` — 設定値（Git除外）
