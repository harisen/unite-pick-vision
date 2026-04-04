process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.stack);
  require('fs').appendFileSync(require('path').join(__dirname, 'error.log'), `[${new Date().toISOString()}] ${err.stack}\n`);
});
process.on('unhandledRejection', (err) => { console.error('[unhandledRejection]', err); });

// .envが無ければ.env.exampleからコピー
const envPath = require('path').join(__dirname, '.env');
if (!require('fs').existsSync(envPath)) {
  const example = require('path').join(__dirname, '.env.example');
  if (require('fs').existsSync(example)) require('fs').copyFileSync(example, envPath);
}
require('dotenv').config({ path: envPath });

const { app, Tray, Menu, BrowserWindow, nativeImage, Notification } = require('electron');
const express = require('express');
const OBSWebSocket = require('obs-websocket-js').default;
const path = require('path');
const fs = require('fs');

const POKEMON_DB = JSON.parse(fs.readFileSync(path.join(__dirname, 'pokemon-db.json'), 'utf-8'));
const PORT = process.env.PORT || 3000;
const SOURCE_NAME = 'obs-vision overlay';
const TEMPLATE_SIZE = 48;
const MATCH_THRESHOLD = 55;

let tray = null, settingsWin = null, obsConnected = false, httpServer = null, pollTimer = null;
let captureSourceName_g = '';
const clients = [];
const obs = new OBSWebSocket();

// -----------------------------------------------
// トレイアイコン（BGRA on Windows）
// -----------------------------------------------
function createCircleIcon(r, g, b) {
  const size = 16, data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4, dist = Math.sqrt((x - 8) ** 2 + (y - 8) ** 2);
      if (dist <= 6) { data[i] = b; data[i+1] = g; data[i+2] = r; data[i+3] = 255; }
      else data[i+3] = 0;
    }
  return nativeImage.createFromBuffer(data, { width: size, height: size });
}
const ICON = { gray: createCircleIcon(150,150,150), yellow: createCircleIcon(230,180,40), green: createCircleIcon(50,200,80), red: createCircleIcon(220,60,60) };

function setTrayStatus(s, t) { if (tray) { tray.setImage(ICON[s]||ICON.gray); tray.setToolTip(`obs-vision\n${t}`); } }
function broadcast(data) { const p = `data: ${JSON.stringify(data)}\n\n`; clients.forEach(r => r.write(p)); }

// -----------------------------------------------
// テンプレートマッチング
// -----------------------------------------------
const RAW_SLOTS = (process.env.SLOT_REGIONS ? JSON.parse(process.env.SLOT_REGIONS) : [
  { x: 0.9227, y: 0.125,  w: 0.0594, h: 0.1028 },
  { x: 0.9227, y: 0.2594, w: 0.0594, h: 0.1028 },
  { x: 0.9227, y: 0.3937, w: 0.0594, h: 0.1028 },
  { x: 0.9227, y: 0.5281, w: 0.0594, h: 0.1028 },
  { x: 0.9227, y: 0.6625, w: 0.0594, h: 0.1028 },
]);

const POKEMON_TEMPLATES = {};
let UNPICKED_TEMPLATE = null;

function loadTemplates() {
  for (const [ja, info] of Object.entries(POKEMON_DB)) {
    if (!info.icon?.startsWith('images/t_Square_')) continue;
    const p = path.join(__dirname, info.icon);
    if (!fs.existsSync(p)) continue;
    try { POKEMON_TEMPLATES[ja] = nativeImage.createFromPath(p).resize({ width: TEMPLATE_SIZE, height: TEMPLATE_SIZE }).toBitmap(); }
    catch (e) { console.warn('[テンプレート読込失敗]', ja, e.message); }
  }
  console.log(`[テンプレート] ${Object.keys(POKEMON_TEMPLATES).length}体ロード完了`);

  const unpickedPath = path.join(__dirname, 'images', 't_Square_UNPICKED.png');
  if (fs.existsSync(unpickedPath)) {
    UNPICKED_TEMPLATE = nativeImage.createFromPath(unpickedPath).resize({ width: TEMPLATE_SIZE, height: TEMPLATE_SIZE }).toBitmap();
    console.log('[テンプレート] 未ピック枠ロード完了');
  }
}

function cropSlot(img, region) {
  const x = Math.floor(region.x * 1280), y = Math.floor(region.y * 720);
  const w = Math.max(1, Math.floor(region.w * 1280)), h = Math.max(1, Math.floor(region.h * 720));
  return img.crop({ x, y, width: w, height: h }).resize({ width: TEMPLATE_SIZE, height: TEMPLATE_SIZE }).toBitmap();
}

function comparePixels(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i += 4) s += Math.abs(a[i]-b[i]) + Math.abs(a[i+1]-b[i+1]) + Math.abs(a[i+2]-b[i+2]);
  return s / (TEMPLATE_SIZE * TEMPLATE_SIZE * 3);
}

function matchSlot(img, region) {
  const pixels = cropSlot(img, region);
  let best = null, bestScore = Infinity, secondScore = Infinity;
  for (const [ja, tmpl] of Object.entries(POKEMON_TEMPLATES)) {
    const avg = comparePixels(pixels, tmpl);
    if (avg < bestScore) { secondScore = bestScore; bestScore = avg; best = ja; }
    else if (avg < secondScore) secondScore = avg;
  }
  return { name: best, score: bestScore, gap: secondScore - bestScore, matched: bestScore < MATCH_THRESHOLD };
}

function matchAllSlots(img) { return RAW_SLOTS.map(r => matchSlot(img, r)); }

function isSlotUnpicked(img, region) {
  return UNPICKED_TEMPLATE ? comparePixels(cropSlot(img, region), UNPICKED_TEMPLATE) < 35 : false;
}

function isPickPhase(img) {
  const { width, height } = img.getSize();
  const regions = [
    { x: Math.floor(width*0.68), y: 0, w: Math.floor(width*0.20), h: Math.floor(height*0.10) },
    { x: Math.floor(width*0.83), y: Math.floor(height*0.10), w: Math.floor(width*0.15), h: Math.floor(height*0.70) },
  ];
  for (const r of regions) {
    const px = img.crop({ x: r.x, y: r.y, width: r.w, height: r.h }).toBitmap();
    let cnt = 0;
    for (let i = 0; i < px.length; i += 4) {
      const blu = px[i], grn = px[i+1], red = px[i+2];
      if (red > 200 && grn > 100 && grn < 180 && blu < 80) cnt++;
    }
    if (cnt > (px.length / 4) * 0.05) return true;
  }
  return false;
}

function dedupeResults(raw) {
  const matched = raw.map(r => r.matched ? r : null);
  const counts = {};
  matched.forEach(r => { if (r) counts[r.name] = (counts[r.name] || 0) + 1; });
  return matched.map(r => (r && counts[r.name] > 1) ? null : r);
}

function buildTeamEntry(name) {
  const info = POKEMON_DB[name] || {};
  return { name, role: info.role || '不明', cc: info.cc || [], icon: info.icon || null, jungle: !!info.jungle };
}

// -----------------------------------------------
// OBS ブラウザソース自動追加
// -----------------------------------------------
async function setupOBSSource(sceneName) {
  const { sceneItems } = await obs.call('GetSceneItemList', { sceneName });
  if (sceneItems.some(i => i.sourceName === SOURCE_NAME)) return;
  const { baseWidth, baseHeight } = await obs.call('GetVideoSettings');
  const { sceneItemId } = await obs.call('CreateInput', {
    sceneName, inputName: SOURCE_NAME, inputKind: 'browser_source',
    inputSettings: { url: `http://localhost:${PORT}/overlay.html`, width: baseWidth, height: baseHeight, css: '', shutdown: false, reroute_audio: false },
    sceneItemEnabled: true,
  });
  await obs.call('SetSceneItemTransform', { sceneName, sceneItemId, sceneItemTransform: { positionX: 0, positionY: 0, scaleX: 1, scaleY: 1, boundsType: 'OBS_BOUNDS_NONE', alignment: 5 } });
  console.log('[OBS] ブラウザソース追加完了');
}

// -----------------------------------------------
// 検出状態管理（各スロット個別ロック方式）
// -----------------------------------------------
class PickDetector {
  constructor() { this.reset(); }

  reset() {
    this.state = 'idle'; // idle → picking → confirmed
    this.locked = [null, null, null, null, null]; // 確定済みポケモン名
    this.prev   = [null, null, null, null, null]; // 前フレーム結果（2連続チェック）
    this.pickPhaseStarted = false;
    this.notPickCount = 0;
    if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
    if (this.timeoutTimer) { clearTimeout(this.timeoutTimer); this.timeoutTimer = null; }
  }

  get lockedCount() { return this.locked.filter(Boolean).length; }
  get team() { return this.locked.filter(Boolean).map(n => buildTeamEntry(n)); }

  // 2フレーム連続同一 → 確定
  updateSlot(i, result) {
    if (this.locked[i]) return;
    if (!result?.matched || result.gap < 2) { this.prev[i] = null; return; }
    if (this.locked.includes(result.name)) { this.prev[i] = null; return; }
    if (this.prev[i] === result.name) {
      this.locked[i] = result.name;
      console.log(`[スロット${i}確定] ${result.name}(${result.score.toFixed(0)}g${result.gap.toFixed(0)})`);
    }
    this.prev[i] = result.name;
  }

  confirm() {
    this.state = 'confirmed';
    const team = this.team;
    const names = team.map(p => p.name).join(' / ');
    console.log(`[表示] ${team.length}体:`, names);
    broadcast({ type: 'preparation', enemyTeam: team });
    new Notification({ title: '相手チーム確定', body: names, silent: true }).show();
    setTrayStatus('green', `確定: ${names}`);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
    this.hideTimer = setTimeout(() => {
      console.log('[自動非表示]');
      broadcast({ type: 'gameplay' });
      this.reset();
      setTrayStatus('green', '待機中');
    }, 45000);
  }
}

// -----------------------------------------------
// OBS 接続 & ポーリング
// -----------------------------------------------
async function connectOBS() {
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  setTrayStatus('yellow', '接続中...');
  try {
    await obs.connect(process.env.OBS_WS_URL, process.env.OBS_WS_PASSWORD);
    obsConnected = true;
    setTrayStatus('green', '待機中');
    broadcast({ type: 'status', message: 'OBS接続済み' });

    const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
    await setupOBSSource(currentProgramSceneName);
    const { sceneItems } = await obs.call('GetSceneItemList', { sceneName: currentProgramSceneName });
    const src = sceneItems.find(i => ['dshow_input','v4l2_input','av_capture_input','window_capture','game_capture'].includes(i.inputKind));
    const captureName = process.env.CAPTURE_SOURCE || src?.sourceName || sceneItems[0]?.sourceName;
    captureSourceName_g = captureName;
    console.log('[OBS] キャプチャソース:', captureName);

    const POLL = { idle: parseInt(process.env.POLL_INTERVAL_MS) || 3000, picking: 500, confirmed: 5000 };
    const det = new PickDetector();

    const poll = async () => {
      try {
        const { imageData } = await obs.call('GetSourceScreenshot', {
          sourceName: captureName, imageFormat: 'jpg', imageWidth: 1280, imageHeight: 720, imageCompressionQuality: 90,
        });
        const jpegBuf = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const img = nativeImage.createFromBuffer(jpegBuf);

        // 初回スクショ保存
        if (!global._debugSaved) {
          global._debugSaved = true;
          const d = path.join(__dirname, 'debug');
          if (!fs.existsSync(d)) fs.mkdirSync(d);
          fs.writeFileSync(path.join(d, 'screenshot.jpg'), jpegBuf);
        }

        // --- ピックフェイズ判定 ---
        const unpickedSlots = RAW_SLOTS.map(r => isSlotUnpicked(img, r));
        const unpickedCount = unpickedSlots.filter(Boolean).length;
        if (unpickedCount >= 3) det.pickPhaseStarted = true;
        const pickPhase = det.pickPhaseStarted && isPickPhase(img);
        if (pickPhase) det.notPickCount = 0; else det.notPickCount++;

        // 新試合検出（confirmed中に空>=3）
        if (det.state === 'confirmed' && unpickedCount >= 3) {
          console.log('[リセット] 新しい試合検出');
          det.reset();
          broadcast({ type: 'gameplay' });
        }

        // ピック画面でない & idle → スキップ
        if (!pickPhase && det.state === 'idle') {
          pollTimer = setTimeout(poll, POLL.idle);
          return;
        }

        // --- テンプレートマッチング & 各スロット個別確定 ---
        const rawResults = matchAllSlots(img);
        const results = dedupeResults(rawResults);
        for (let i = 0; i < 5; i++) {
          if (!unpickedSlots[i]) det.updateSlot(i, results[i]);
        }

        // ログ
        const log = rawResults.map((r, i) => {
          const tag = det.locked[i] ? '🔒' : (unpickedSlots[i] ? '空' : (results[i] ? '*' : ''));
          return `${r.name}(${r.score.toFixed(0)}g${r.gap.toFixed(0)}${tag})`;
        });
        console.log(`[${det.state}] locked=${det.lockedCount} 空=${unpickedCount} | ${log.join(' ')}`);

        // --- 5体確定 → UI表示（1回だけ）---
        if (det.lockedCount >= 5 && det.state !== 'confirmed') {
          det.confirm();
          pollTimer = setTimeout(poll, POLL.confirmed);
          return;
        }

        // --- picking状態 & メモ帳更新 ---
        if (det.lockedCount >= 1 && det.state !== 'confirmed') {
          if (det.state !== 'picking') {
            det.state = 'picking';
            // 60秒タイムアウト: 5体揃わなくても確定
            det.timeoutTimer = setTimeout(() => {
              if (det.state === 'picking' && det.lockedCount >= 4) {
                console.log(`[タイムアウト] ${det.lockedCount}体で確定`);
                det.confirm();
              }
            }, 60000);
          }
          broadcast({ type: 'pick_update', enemyTeam: det.team });
        }

        // confirmed中はゆっくり
        const next = det.state === 'confirmed' ? POLL.confirmed : det.state === 'picking' ? POLL.picking : POLL.idle;
        pollTimer = setTimeout(poll, next);
      } catch (err) {
        console.error('[ポーリング]', err.message);
        pollTimer = setTimeout(poll, POLL.idle);
      }
    };
    poll();
  } catch (err) {
    obsConnected = false;
    setTrayStatus('red', `OBS接続失敗: ${err.message}`);
  }
}

// -----------------------------------------------
// 設定ウィンドウ
// -----------------------------------------------
function openSettings() {
  if (settingsWin) { settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({ width: 400, height: 320, resizable: true, title: 'obs-vision 設定',
    webPreferences: { nodeIntegration: true, contextIsolation: false }, icon: ICON.green });
  settingsWin.loadFile(path.join(__dirname, 'settings.html'));
  settingsWin.setMenu(null);
  settingsWin.on('closed', () => { settingsWin = null; });
}

// -----------------------------------------------
// Electron 起動
// -----------------------------------------------
app.whenReady().then(() => {
  app.setAppUserModelId('obs-vision');
  loadTemplates();

  const server = express();
  server.use('/images', express.static(path.join(__dirname, 'images')));
  server.get('/overlay.html', (_, res) => res.sendFile(path.join(__dirname, 'overlay.html')));
  server.get('/calibrate.html', (_, res) => res.sendFile(path.join(__dirname, 'calibrate.html')));
  server.get('/preview.html', (_, res) => res.sendFile(path.join(__dirname, 'preview-slots.html')));
  server.get('/preview-ingame.html', (_, res) => res.sendFile(path.join(__dirname, 'preview-ingame.html')));
  server.get('/pokemon-db.json', (_, res) => res.sendFile(path.join(__dirname, 'pokemon-db.json')));
  server.use('/debug', express.static(path.join(__dirname, 'debug')));

  server.get('/capture', async (_, res) => {
    try {
      const { sceneItems } = await obs.call('GetSceneItemList', { sceneName: (await obs.call('GetCurrentProgramScene')).currentProgramSceneName });
      const src = sceneItems.find(i => ['dshow_input','v4l2_input','av_capture_input','window_capture','game_capture'].includes(i.inputKind));
      const { imageData } = await obs.call('GetSourceScreenshot', { sourceName: process.env.CAPTURE_SOURCE || src?.sourceName || sceneItems[0]?.sourceName, imageFormat: 'jpg', imageWidth: 1280, imageHeight: 720, imageCompressionQuality: 95 });
      const buf = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const d = path.join(__dirname, 'debug'); if (!fs.existsSync(d)) fs.mkdirSync(d);
      fs.writeFileSync(path.join(d, 'screenshot.jpg'), buf);
      res.json({ ok: true, size: buf.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  server.get('/slot-preview', async (_, res) => {
    try {
      const { imageData } = await obs.call('GetSourceScreenshot', { sourceName: process.env.CAPTURE_SOURCE || captureSourceName_g, imageFormat: 'jpg', imageWidth: 1280, imageHeight: 720, imageCompressionQuality: 90 });
      const img = nativeImage.createFromBuffer(Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
      const slots = RAW_SLOTS.map(region => {
        const cropped = img.crop({ x: Math.floor(region.x*1280), y: Math.floor(region.y*720), width: Math.max(1,Math.floor(region.w*1280)), height: Math.max(1,Math.floor(region.h*720)) });
        return { png: cropped.toPNG().toString('base64'), ...matchSlot(img, region), unpicked: isSlotUnpicked(img, region) };
      });
      res.json({ screenshot: imageData, slots });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  server.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    clients.push(res);
    req.on('close', () => { const i = clients.indexOf(res); if (i !== -1) clients.splice(i, 1); });
  });

  server.get('/config', (_, res) => res.json({ OBS_WS_URL: process.env.OBS_WS_URL, OBS_WS_PASSWORD: process.env.OBS_WS_PASSWORD ? '********' : '', POLL_INTERVAL_MS: process.env.POLL_INTERVAL_MS }));
  server.use(express.json());
  server.post('/config', (req, res) => {
    const lines = [`OBS_WS_URL=${req.body.OBS_WS_URL||'ws://localhost:4455'}`, `OBS_WS_PASSWORD=${req.body.OBS_WS_PASSWORD||process.env.OBS_WS_PASSWORD||''}`, `POLL_INTERVAL_MS=${req.body.POLL_INTERVAL_MS||'3000'}`, `PORT=${PORT}`];
    if (req.body.SLOT_REGIONS) lines.push(`SLOT_REGIONS=${req.body.SLOT_REGIONS}`);
    fs.writeFileSync(path.join(__dirname, '.env'), lines.join('\n') + '\n', 'utf-8');
    res.json({ ok: true });
  });

  httpServer = server.listen(PORT, '127.0.0.1', () => console.log(`[Server] http://localhost:${PORT}`));
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') { console.error(`[Server] ポート${PORT}使用中、3秒後リトライ`); setTimeout(() => httpServer.listen(PORT), 3000); }
    else console.error('[Server]', err.message);
  });

  // トレイ
  tray = new Tray(ICON.gray);
  tray.setToolTip('obs-vision — 起動中...');

  const TEST_SOURCE = 'obs-vision テスト動画';
  let testMode = false;

  async function startTestMode() {
    try {
      const scene = (await obs.call('GetCurrentProgramScene')).currentProgramSceneName;
      try { await obs.call('RemoveInput', { inputName: TEST_SOURCE }); } catch {}
      await new Promise(r => setTimeout(r, 500));
      const videos = (process.env.TEST_VIDEOS || '').split(';').filter(Boolean);
      const file = videos.length ? videos[Math.floor(Math.random() * videos.length)] : '';
      const { sceneItemId } = await obs.call('CreateInput', { sceneName: scene, inputName: TEST_SOURCE, inputKind: 'ffmpeg_source', inputSettings: { local_file: file, looping: true, restart_on_activate: true }, sceneItemEnabled: true });
      const { baseWidth, baseHeight } = await obs.call('GetVideoSettings');
      await obs.call('SetSceneItemTransform', { sceneName: scene, sceneItemId, sceneItemTransform: { boundsType: 'OBS_BOUNDS_STRETCH', boundsWidth: baseWidth, boundsHeight: baseHeight, boundsAlignment: 0 } });
      const items = (await obs.call('GetSceneItemList', { sceneName: scene })).sceneItems;
      const overlay = items.find(i => i.sourceName === SOURCE_NAME);
      if (overlay) await obs.call('SetSceneItemIndex', { sceneName: scene, sceneItemId, sceneItemIndex: Math.max(0, overlay.sceneItemIndex - 1) });
      process.env.CAPTURE_SOURCE = TEST_SOURCE;
      testMode = true;
      console.log('[テスト] 開始:', file);
      obs.disconnect(); await connectOBS();
    } catch (e) { console.error('[テスト]', e.message); }
  }

  async function stopTestMode() {
    try {
      await obs.call('RemoveInput', { inputName: TEST_SOURCE }).catch(() => {});
      delete process.env.CAPTURE_SOURCE;
      testMode = false;
      console.log('[テスト] 停止');
      obs.disconnect(); await connectOBS();
    } catch (e) { console.error('[テスト]', e.message); }
  }

  const buildMenu = () => Menu.buildFromTemplate([
    { label: obsConnected ? '● 動作中' : '○ 未接続', enabled: false },
    { type: 'separator' },
    { label: testMode ? '■ テスト停止' : '▶ テスト動画で検証', click: () => testMode ? stopTestMode() : startTestMode() },
    { label: '設定', click: openSettings },
    { label: 'OBSに再接続', click: () => { obs.disconnect(); connectOBS(); } },
    { type: 'separator' },
    { label: '終了', click: () => app.quit() },
  ]);
  tray.setContextMenu(buildMenu());
  tray.on('click', () => tray.setContextMenu(buildMenu()));
  connectOBS();
});

app.on('before-quit', () => { if (pollTimer) clearTimeout(pollTimer); if (httpServer) httpServer.close(); });
app.on('window-all-closed', (e) => e.preventDefault());
