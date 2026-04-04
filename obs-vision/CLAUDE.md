# obs-vision

OBSのキャプチャ画像をAIで認識・解析するツール。

## 概要
- OBS WebSocket経由でキャプチャ画像を取得
- Gemma 4（ローカル/Ollama）で画像認識・解析
- 認識結果をリアルタイム表示

## 構成予定
- OBS連携: obs-websocket v5 プロトコル
- 画像認識: Ollama (gemma4:e2b)
- .env — 設定値（Git除外）
