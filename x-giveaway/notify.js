/**
 * LINE Messaging API通知スクリプト
 * 当選時にLINEプッシュ通知を送信する
 *
 * セットアップ:
 * 1. https://developers.line.biz/ でMessaging APIチャネルを作成
 * 2. チャネルアクセストークン(長期)を発行 → LINE_CHANNEL_ACCESS_TOKEN
 * 3. ボットと友達になり、ユーザーIDを取得 → LINE_USER_ID
 * 4. .envに以下を追加:
 *    LINE_CHANNEL_ACCESS_TOKEN=your_token
 *    LINE_USER_ID=Uxxxxxxxxx
 *
 * 使用方法:
 *   node notify.js "テストメッセージ"         # 任意のメッセージ送信
 *   node notify.js --check                   # history.jsonの当選を確認して通知
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const USER_ID = process.env.LINE_USER_ID;

if (!TOKEN || !USER_ID) {
  console.error('❌ .envにLINE_CHANNEL_ACCESS_TOKENとLINE_USER_IDを設定してください');
  console.error('   詳細: https://developers.line.biz/');
  process.exit(1);
}

function sendLineMessage(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      to: USER_ID,
      messages: [{ type: 'text', text }]
    });

    const options = {
      hostname: 'api.line.me',
      path: '/v2/bot/message/push',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve('OK');
        } else {
          reject(new Error(`LINE API error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function checkAndNotify() {
  const historyPath = path.join(__dirname, 'data/history.json');
  const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

  const wins = history.filter(h => h.status === '当選' && !h.lineNotified);

  if (wins.length === 0) {
    console.log('当選なし (通知済みを除く)');
    return;
  }

  for (const win of wins) {
    const msg = `🎉 @kabochapiza 当選！\n\n${win.account}\n${win.content}\n\nツイート: ${win.tweetUrl}`;
    console.log(`送信中: ${win.account}`);
    await sendLineMessage(msg);
    win.lineNotified = true;
    console.log(`✅ 通知完了: ${win.account}`);
  }

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
  console.log(`${wins.length}件通知完了`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--check') {
    await checkAndNotify();
  } else if (args[0]) {
    const msg = args.join(' ');
    console.log(`送信: ${msg}`);
    await sendLineMessage(msg);
    console.log('✅ 送信完了');
  } else {
    // デフォルト: history.jsonの当選チェック
    await checkAndNotify();
  }
}

main().catch(e => {
  console.error('エラー:', e.message);
  process.exit(1);
});
