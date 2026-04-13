# obs-vision

ポケモンユナイトの敵チーム構成を自動検出してOBSオーバーレイで表示するツール。

## アーキテクチャ
- **検出方式**: nativeImage テンプレートマッチング（AI/GPU不要）
- **各スロット個別ロック**: 2フレーム連続一致で確定（ピンク系は5フレーム）、以後変更なし
- **カットイン検出**: オレンジ色比率でカットインを判定し、2.5秒バッファで誤確定防止
- **OBS連携**: OBS WebSocket v5 でスクリーンショット取得・ブラウザソース自動追加
- **オーバーレイ**: SSE でリアルタイム更新、ロール別カラー、レーン予測表示
- **自動リフレッシュ**: アイドル30分 or 1-4体検出が1分継続したらオーバーレイを自動リロード

## ハリーセンインジケーター
- 右上に常時表示（ツール起動中の視認確認用）
- ピック画面: GIFアニメ + レインボー色変化（hue-rotate）
- その他フェイズ: 静止PNG

## 構成
- `main.js` — Electron メインプロセス（検出・OBS連携・Express）
- `overlay.html` — OBS ブラウザソース用オーバーレイ
- `pokemon-db.json` — ポケモンDB（ロール・CC・ジャングル適性）
- `build-pokemon-db.js` — DB再生成スクリプト（UniteDiscordBot連携）
- `images/t_Square_*.png` — テンプレート画像
- `images/harisen.gif` / `images/harisen_still.png` — インジケーター用画像
- `.env` — 設定値（Git除外）
