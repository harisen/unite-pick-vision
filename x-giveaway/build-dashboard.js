const fs = require('fs');
const path = require('path');

// ---- Load survey-deep.json ----
const deep = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/survey-deep.json'), 'utf8'));

// ---- Load history.json ----
const history = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/history.json'), 'utf8'));

function normalizeMethod(m) {
  const lower = m.toLowerCase();
  if (lower.includes('引用')) return 'quote';
  if (lower.includes('リプライ') || lower.includes('リプ')) return 'rt+reply';
  if (lower.includes('写真') || lower.includes('投稿')) return 'rt+reply';
  if (lower.includes('アンケート')) return 'rt+reply';
  if (lower.includes('ハッシュタグ')) return 'rt+reply';
  return 'rt';
}

function buildApplyUrl(entry) {
  if (entry.tweetUrl && entry.tweetUrl.startsWith('https://x.com/')) return entry.tweetUrl;
  if (entry.tweetUrl && entry.tweetUrl.startsWith('http')) return entry.tweetUrl;
  if (entry.externalUrl) return entry.externalUrl;
  if (entry.account) return 'https://x.com/' + entry.account.replace('@', '');
  return '';
}

function buildDetailUrl(entry) {
  if (entry.externalUrl) return entry.externalUrl;
  if (entry.tweetUrl && entry.tweetUrl.startsWith('http')) return entry.tweetUrl;
  if (entry.account) return 'https://x.com/' + entry.account.replace('@', '');
  return '';
}

const converted = deep.map(e => ({
  name: e.name,
  provider: e.provider || e.account || '',
  winners: e.winners,
  deadline: e.deadline,
  method: normalizeMethod(e.method),
  applyUrl: buildApplyUrl(e),
  detailUrl: buildDetailUrl(e),
  source: e.source || 'survey'
}));

// ---- Existing 54 entries from chanceit ----
const existing = [
  {name:"牛乳でつくるココア 2個",provider:"meito",winners:"25名",deadline:"2026-04-10",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707583",detailUrl:"https://www.chance.com/present/detail/707583/",source:"chanceit"},
  {name:"Amazonギフト券3,000円分",provider:"あしふみ健幸ライフ",winners:"3名",deadline:"2026-04-10",method:"rt+reply",applyUrl:"https://www.chance.com/jump.srv?id=707587",detailUrl:"https://www.chance.com/present/detail/707587/",source:"chanceit"},
  {name:"ゴンチャクーポン",provider:"Gong cha",winners:"毎日100名",deadline:"2026-04-10",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707591",detailUrl:"https://www.chance.com/present/detail/707591/",source:"chanceit"},
  {name:"Amazonギフトカード1,000円分",provider:"ライジングフード",winners:"5名",deadline:"2026-04-10",method:"rt+reply",applyUrl:"https://www.chance.com/jump.srv?id=707590",detailUrl:"https://www.chance.com/present/detail/707590/",source:"chanceit"},
  {name:"ALLIE×ちいかわコラボUVクリーム",provider:"ALLIE official",winners:"150名",deadline:"2026-04-10",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707569",detailUrl:"https://www.chance.com/present/detail/707569/",source:"chanceit"},
  {name:"ジェットストリーム+うまい棒",provider:"やおきん",winners:"10名",deadline:"2026-04-10",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707568",detailUrl:"https://www.chance.com/present/detail/707568/",source:"chanceit"},
  {name:"角型着脱鍋18cm 4点セット",provider:"和平フレイズ",winners:"5名",deadline:"2026-04-10",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707575",detailUrl:"https://www.chance.com/present/detail/707575/",source:"chanceit"},
  {name:"Amazonギフト券10,000円分",provider:"ラングリッサーモバイル",winners:"7名",deadline:"2026-04-10",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707576",detailUrl:"https://www.chance.com/present/detail/707576/",source:"chanceit"},
  {name:"のんある酒場「梅酒ソーダ」",provider:"TBSラジオ",winners:"5名",deadline:"2026-04-11",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707602",detailUrl:"https://www.chance.com/present/detail/707602/",source:"chanceit"},
  {name:"ケンミン焼ビーフン&春にんじん",provider:"ケンミン食品",winners:"30名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707612",detailUrl:"https://www.chance.com/present/detail/707612/",source:"chanceit"},
  {name:"富士急ハイランド ワンデイパスペア 他",provider:"農心ジャパン",winners:"15名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707614",detailUrl:"https://www.chance.com/present/detail/707614/",source:"chanceit"},
  {name:"ロッテ「アジアに恋して」4品詰合せ",provider:"エバグリーン廣甚",winners:"12名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707616",detailUrl:"https://www.chance.com/present/detail/707616/",source:"chanceit"},
  {name:"マグネットヘアプロ ドライヤーゼロ",provider:"エディオン豊田本店",winners:"1名",deadline:"2026-04-12",method:"rt+reply",applyUrl:"https://www.chance.com/jump.srv?id=707627",detailUrl:"https://www.chance.com/present/detail/707627/",source:"chanceit"},
  {name:"QUOカードPay 3,000円分",provider:"サンセイR&D",winners:"80名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707628",detailUrl:"https://www.chance.com/present/detail/707628/",source:"chanceit"},
  {name:"MOA自然農法 甘夏",provider:"東京療院",winners:"2名",deadline:"2026-04-12",method:"rt+like",applyUrl:"https://www.chance.com/jump.srv?id=707631",detailUrl:"https://www.chance.com/present/detail/707631/",source:"chanceit"},
  {name:"ノラネコぐんだんコインケース",provider:"ノラネコぐんだん",winners:"3名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707632",detailUrl:"https://www.chance.com/present/detail/707632/",source:"chanceit"},
  {name:"DECOREふわんとろんフルーツミルク",provider:"ふわんとろん",winners:"5名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707633",detailUrl:"https://www.chance.com/present/detail/707633/",source:"chanceit"},
  {name:"スプラウト野菜詰め合わせ",provider:"セイル・オン農園",winners:"5名",deadline:"2026-04-12",method:"rt+reply",applyUrl:"https://www.chance.com/jump.srv?id=707634",detailUrl:"https://www.chance.com/present/detail/707634/",source:"chanceit"},
  {name:"楽天ポイント10,000円相当",provider:"RakutenTV",winners:"1名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707636",detailUrl:"https://www.chance.com/present/detail/707636/",source:"chanceit"},
  {name:"CJ商品詰合せセット",provider:"CJ JAPAN",winners:"10名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707652",detailUrl:"https://www.chance.com/present/detail/707652/",source:"chanceit"},
  {name:"QUOカード2,000円分",provider:"ピザハット",winners:"5名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707653",detailUrl:"https://www.chance.com/present/detail/707653/",source:"chanceit"},
  {name:"つけ旨オイル2点セット",provider:"ダイショー",winners:"10名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707654",detailUrl:"https://www.chance.com/present/detail/707654/",source:"chanceit"},
  {name:"お菓子6品詰合せ",provider:"お菓子と、わたし",winners:"10名",deadline:"2026-04-12",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707556",detailUrl:"https://www.chance.com/present/detail/707556/",source:"chanceit"},
  {name:"Google Pixel 10a 128GB (UQ)",provider:"UQ",winners:"1名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707800",detailUrl:"https://www.chance.com/present/detail/707800/",source:"chanceit"},
  {name:"Google Pixel 10a 128GB (au)",provider:"au",winners:"1名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707801",detailUrl:"https://www.chance.com/present/detail/707801/",source:"chanceit"},
  {name:"Google Pixel 10a (SoftBank)",provider:"SoftBank",winners:"1名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707799",detailUrl:"https://www.chance.com/present/detail/707799/",source:"chanceit"},
  {name:"カネテツ商品セット",provider:"カネテツ",winners:"3名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707798",detailUrl:"https://www.chance.com/present/detail/707798/",source:"chanceit"},
  {name:"神州一味噌 詰め合わせセット",provider:"神州一味噌",winners:"10名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707797",detailUrl:"https://www.chance.com/present/detail/707797/",source:"chanceit"},
  {name:"おいしい水 レモン水 無糖 1ケース",provider:"アサヒ飲料",winners:"100名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707751",detailUrl:"https://www.chance.com/present/detail/707751/",source:"chanceit"},
  {name:"オリジナルバスタオル",provider:"セブン-イレブン",winners:"100名",deadline:"2026-04-13",method:"reply",applyUrl:"https://www.chance.com/jump.srv?id=707753",detailUrl:"https://www.chance.com/present/detail/707753/",source:"chanceit"},
  {name:"Tシャツ&モンスターエナジー新フレーバー",provider:"Monster Energy",winners:"50名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707754",detailUrl:"https://www.chance.com/present/detail/707754/",source:"chanceit"},
  {name:"MEMEME スムースセット",provider:"サンドラッグ",winners:"10名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707755",detailUrl:"https://www.chance.com/present/detail/707755/",source:"chanceit"},
  {name:"ガチャピン・ムック グッズ",provider:"めざましテレビ",winners:"5名",deadline:"2026-04-13",method:"quote",applyUrl:"https://www.chance.com/jump.srv?id=707735",detailUrl:"https://www.chance.com/present/detail/707735/",source:"chanceit"},
  {name:"特選のり食べくらべセット",provider:"のり推進協",winners:"8名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707742",detailUrl:"https://www.chance.com/present/detail/707742/",source:"chanceit"},
  {name:"いかの姿あげ骨付き肉風味&わたあめ風味",provider:"合食",winners:"5名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707743",detailUrl:"https://www.chance.com/present/detail/707743/",source:"chanceit"},
  {name:"パリパリ焙煎いりこ",provider:"大阪スケジュール",winners:"5名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707744",detailUrl:"https://www.chance.com/present/detail/707744/",source:"chanceit"},
  {name:"HN高校生イラストQUOカード500円分",provider:"ハンドレッドノート",winners:"3名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707745",detailUrl:"https://www.chance.com/present/detail/707745/",source:"chanceit"},
  {name:"recolte自動調理ポットラージ",provider:"エディオン広島本店",winners:"2名",deadline:"2026-04-13",method:"rt+reply",applyUrl:"https://www.chance.com/jump.srv?id=707746",detailUrl:"https://www.chance.com/present/detail/707746/",source:"chanceit"},
  {name:"Leinaサイン付きB2ポスター",provider:"日本三國",winners:"2名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707747",detailUrl:"https://www.chance.com/present/detail/707747/",source:"chanceit"},
  {name:"音カルタ(毎日応募可)",provider:"銀鳥産業",winners:"5名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707748",detailUrl:"https://www.chance.com/present/detail/707748/",source:"chanceit"},
  {name:"丸亀製麺 500円引きクーポン",provider:"丸亀製麺",winners:"500名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707588",detailUrl:"https://www.chance.com/present/detail/707588/",source:"chanceit"},
  {name:"コナン×ベビースターラーメン",provider:"小学館集英社プロダクション",winners:"15名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707727",detailUrl:"https://www.chance.com/present/detail/707727/",source:"chanceit"},
  {name:"日東紅茶 春夏新商品6点セット",provider:"三井農林",winners:"10名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707728",detailUrl:"https://www.chance.com/present/detail/707728/",source:"chanceit"},
  {name:"QUOカード10,000円分",provider:"ローソン",winners:"1名",deadline:"2026-04-13",method:"quote",applyUrl:"https://www.chance.com/jump.srv?id=707729",detailUrl:"https://www.chance.com/present/detail/707729/",source:"chanceit"},
  {name:"オリジナルQUOカード500円分",provider:"サミー",winners:"50名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707730",detailUrl:"https://www.chance.com/present/detail/707730/",source:"chanceit"},
  {name:"giftee Box Select 1,000円分",provider:"楽天証券",winners:"44名",deadline:"2026-04-13",method:"quote",applyUrl:"https://www.chance.com/jump.srv?id=707731",detailUrl:"https://www.chance.com/present/detail/707731/",source:"chanceit"},
  {name:"LIAR GAMEサイン入りアフレコ台本 他",provider:"集英社",winners:"103名",deadline:"2026-04-13",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707734",detailUrl:"https://www.chance.com/present/detail/707734/",source:"chanceit"},
  {name:"赤玉パンチ QUOカードPay1,000円分",provider:"サントリー",winners:"500名",deadline:"2026-04-14",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707733",detailUrl:"https://www.chance.com/present/detail/707733/",source:"chanceit"},
  {name:"sleep hug ボディソープスクラブ",provider:"フレーバーライフ社",winners:"500名",deadline:"2026-04-15",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707821",detailUrl:"https://www.chance.com/present/detail/707821/",source:"chanceit"},
  {name:"オリジナルミトン",provider:"雪印メグミルク",winners:"25名",deadline:"2026-04-15",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707822",detailUrl:"https://www.chance.com/present/detail/707822/",source:"chanceit"},
  {name:"Amazonギフトカード1,000円分",provider:"みんなのランキング",winners:"5名",deadline:"2026-04-15",method:"rt+reply",applyUrl:"https://www.chance.com/jump.srv?id=707352",detailUrl:"https://www.chance.com/present/detail/707352/",source:"chanceit"},
  {name:"なでしこジャパン戦チケット",provider:"クレディセゾン",winners:"6組",deadline:"2026-04-15",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707819",detailUrl:"https://www.chance.com/present/detail/707819/",source:"chanceit"},
  {name:"Amazonギフト券2万円分 他",provider:"聖闘士星矢 Galaxy Soldiers",winners:"21名",deadline:"2026-04-15",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707824",detailUrl:"https://www.chance.com/present/detail/707824/",source:"chanceit"},
  {name:"JTBトラベルギフト 5万円分",provider:"NHK出版",winners:"3名",deadline:"2026-04-21",method:"rt",applyUrl:"https://www.chance.com/jump.srv?id=707551",detailUrl:"https://www.chance.com/present/detail/707551/",source:"chanceit"},
];

// ---- Merge & deduplicate ----
const all = [...existing, ...converted];
const seen = new Set();
const merged = [];
for (const item of all) {
  const key = item.name;
  if (!seen.has(key)) {
    seen.add(key);
    merged.push(item);
  }
}
merged.sort((a, b) => a.deadline.localeCompare(b.deadline));

console.log(`Existing: ${existing.length}, Survey-deep: ${converted.length}, Merged: ${merged.length}`);

// ---- Generate JS array literal ----
function esc(s) { return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'"); }

const jsEntries = merged.map(g => {
  return `  {name:"${esc(g.name)}",provider:"${esc(g.provider)}",winners:"${esc(g.winners)}",deadline:"${g.deadline}",method:"${g.method}",applyUrl:"${esc(g.applyUrl)}",detailUrl:"${esc(g.detailUrl)}",source:"${esc(g.source)}"}`;
}).join(',\n');

// ---- Generate history JS literal ----
const historyEntries = history.map(h => {
  const r = h.resultType ? `,"resultType":"${esc(h.resultType)}"` : '';
  const ru = h.resultUrl ? `,"resultUrl":"${esc(h.resultUrl)}"` : '';
  const rc = h.resultChecked ? `,"resultChecked":true` : '';
  return `  {id:${h.id},date:"${h.date}",account:"${esc(h.account)}",tweetUrl:"${esc(h.tweetUrl)}",content:"${esc(h.content)}",deadline:"${h.deadline}",status:"${esc(h.status)}"${r}${ru}${rc}}`;
}).join(',\n');

// Applied tweet URLs from history
const appliedUrls = history.map(h => `"${esc(h.tweetUrl)}"`).join(',\n  ');

// Applied account names from history (for account-based matching)
const appliedAccounts = [...new Set(history.map(h => h.account.replace('@', '').toLowerCase()))];
const appliedAccountsJs = appliedAccounts.map(a => `"${a}"`).join(',\n  ');

// ---- Build HTML ----
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>X\u61F8\u8CDE\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
    background: #0f1419;
    color: #e7e9ea;
    padding: 16px;
    line-height: 1.5;
  }
  h1 {
    text-align: center;
    margin-bottom: 8px;
    font-size: 1.5rem;
    color: #1d9bf0;
  }
  .meta {
    text-align: center;
    color: #71767b;
    font-size: 0.85rem;
    margin-bottom: 16px;
  }
  .stats {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .stat-card {
    background: #16202a;
    border: 1px solid #2f3336;
    border-radius: 12px;
    padding: 12px 20px;
    text-align: center;
    min-width: 120px;
  }
  .stat-card .num {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1d9bf0;
  }
  .stat-card .label {
    font-size: 0.75rem;
    color: #71767b;
  }
  .filters {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    align-items: center;
  }
  .filters input, .filters select {
    background: #16202a;
    border: 1px solid #2f3336;
    color: #e7e9ea;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
  }
  .filters input { flex: 1; min-width: 200px; }
  .filters select { min-width: 140px; }
  .filters button {
    background: #1d9bf0;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .filters button:hover { background: #1a8cd8; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  thead th {
    background: #16202a;
    color: #71767b;
    padding: 10px 8px;
    text-align: left;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 2px solid #2f3336;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }
  thead th:hover { color: #1d9bf0; }
  tbody tr {
    border-bottom: 1px solid #2f3336;
    transition: background 0.15s;
  }
  tbody tr:hover { background: #1c2732; }
  tbody td {
    padding: 10px 8px;
    vertical-align: top;
  }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .badge-rt { background: #1d3a2e; color: #00ba7c; }
  .badge-reply { background: #2a1f3a; color: #a78bfa; }
  .badge-quote { background: #3a2a1f; color: #f59e0b; }
  .badge-like { background: #3a1f2a; color: #f91880; }
  .badge-daily { background: #1f2a3a; color: #60a5fa; }
  .badge-won { background: #1a3a1f; color: #22c55e; }
  .badge-lost { background: #2f3336; color: #71767b; }
  .badge-instant { background: #2a1f10; color: #f59e0b; }
  .tab-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    border-bottom: 2px solid #2f3336;
  }
  .tab-btn {
    background: none;
    border: none;
    color: #71767b;
    padding: 10px 16px;
    font-size: 0.9rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: color 0.15s;
  }
  .tab-btn.active { color: #1d9bf0; border-bottom-color: #1d9bf0; font-weight: 700; }
  .tab-btn:hover { color: #e7e9ea; }
  .tab-section { display: none; }
  .tab-section.active { display: block; }
  .history-table .won-row td { color: #22c55e; }
  .history-table .lost-row td { color: #71767b; }
  .history-table .instant-row td { color: #f59e0b; }
  .deadline-urgent { color: #f4212e; font-weight: 700; }
  .deadline-soon { color: #ffd400; font-weight: 600; }
  .deadline-ok { color: #00ba7c; }
  .deadline-expired { color: #71767b; text-decoration: line-through; }
  .btn {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 16px;
    text-decoration: none;
    font-size: 0.78rem;
    font-weight: 600;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .btn:hover { opacity: 0.85; }
  .btn-apply {
    background: #1d9bf0;
    color: #fff;
  }
  .btn-done {
    background: #2f3336;
    color: #71767b;
    pointer-events: none;
  }
  .btn-detail {
    background: transparent;
    border: 1px solid #2f3336;
    color: #71767b;
    margin-left: 4px;
  }
  tr.applied {
    opacity: 0.45;
  }
  tr.applied td { color: #71767b; }
  .winners { color: #ffd400; font-weight: 600; }
  .source-tag {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    background: #2f3336;
    color: #71767b;
  }
  .prize-name {
    font-weight: 600;
    color: #e7e9ea;
    display: block;
    margin-bottom: 2px;
  }
  .provider {
    color: #71767b;
    font-size: 0.8rem;
  }
  @media (max-width: 768px) {
    table { font-size: 0.78rem; }
    .hide-mobile { display: none; }
    .filters { flex-direction: column; }
    .filters input, .filters select { min-width: 100%; }
    .stat-card { min-width: 80px; padding: 8px 12px; }
    .stat-card .num { font-size: 1.2rem; }
  }
  .no-results {
    text-align: center;
    padding: 40px;
    color: #71767b;
  }
</style>
</head>
<body>

<h1>X\u61F8\u8CDE\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9</h1>
<p class="meta">Generated: ${new Date().toLocaleDateString('ja-JP')} | Sources: chanceit, ke-ma, ken-kaku, knshow, kojinabi, x-search | Account: @kabochapiza</p>

<div class="stats" id="stats"></div>

<div class="tab-bar">
  <button class="tab-btn active" onclick="switchTab('giveaway')">懸賞一覧</button>
  <button class="tab-btn" onclick="switchTab('history')">応募履歴 (${history.length}件)</button>
</div>

<div id="tab-giveaway" class="tab-section active">
<div class="filters">
  <input type="text" id="searchInput" placeholder="\u691C\u7D22..." oninput="filterTable()">
  <select id="statusFilter" onchange="filterTable()">
    <option value="all">\u3059\u3079\u3066</option>
    <option value="open">\u672A\u5FDC\u52DF</option>
    <option value="applied">\u5FDC\u52DF\u6E08</option>
    <option value="expired">\u671F\u9650\u5207\u308C</option>
  </select>
  <select id="methodFilter" onchange="filterTable()">
    <option value="all">\u3059\u3079\u3066\u306E\u5FDC\u52DF\u65B9\u6CD5</option>
    <option value="rt">\u30D5\u30A9\u30ED\u30FC&RT</option>
    <option value="reply">\u30EA\u30D7\u30E9\u30A4</option>
    <option value="quote">\u5F15\u7528</option>
  </select>
  <select id="sourceFilter" onchange="filterTable()">
    <option value="all">\u3059\u3079\u3066\u306E\u30BD\u30FC\u30B9</option>
    <option value="chanceit">chanceit</option>
    <option value="ke-ma">ke-ma</option>
    <option value="ken-kaku">ken-kaku</option>
    <option value="knshow">knshow</option>
    <option value="kojinabi">kojinabi</option>
    <option value="x-search">x-search</option>
  </select>
  <button onclick="resetFilters()">\u30EA\u30BB\u30C3\u30C8</button>
</div>

<table>
  <thead>
    <tr>
      <th onclick="sortTable(0)">#</th>
      <th onclick="sortTable(1)">\u8CDE\u54C1 / \u63D0\u4F9B\u5143</th>
      <th onclick="sortTable(2)">\u5F53\u9078\u6570</th>
      <th onclick="sortTable(3)">\u7DE0\u5207</th>
      <th onclick="sortTable(4)" class="hide-mobile">\u5FDC\u52DF\u65B9\u6CD5</th>
      <th class="hide-mobile">\u30BD\u30FC\u30B9</th>
      <th>\u72B6\u614B</th>
      <th>\u30A2\u30AF\u30B7\u30E7\u30F3</th>
    </tr>
  </thead>
  <tbody id="tableBody"></tbody>
</table>
<div class="no-results" id="noResults" style="display:none;">\u8A72\u5F53\u3059\u308B\u61F8\u8CDE\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002</div>
</div><!-- /tab-giveaway -->

<div id="tab-history" class="tab-section">
<table class="history-table">
  <thead>
    <tr>
      <th>#</th>
      <th>日付</th>
      <th>アカウント / 内容</th>
      <th>締切</th>
      <th>結果</th>
      <th>アクション</th>
    </tr>
  </thead>
  <tbody id="historyBody"></tbody>
</table>
</div><!-- /tab-history -->

<script>
const APPLIED_URLS = [
  ${appliedUrls}
];

const APPLIED_ACCOUNTS = [
  ${appliedAccountsJs}
];

const GIVEAWAYS = [
${jsEntries}
];

const TODAY = new Date();
TODAY.setHours(0,0,0,0);

const HISTORY = [
${historyEntries}
];

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b,i) => {
    const t = ['giveaway','history'][i];
    b.classList.toggle('active', t === tab);
  });
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'history') renderHistory();
}

function renderHistory() {
  const tbody = document.getElementById('historyBody');
  const sorted = [...HISTORY].reverse();
  tbody.innerHTML = sorted.map((h, i) => {
    const status = h.status;
    const isWon = status === '当選';
    const isLost = status === '落選';
    const isInstant = h.resultType === 'instant';
    const rowClass = isWon ? 'won-row' : isLost ? 'lost-row' : isInstant ? 'instant-row' : '';
    const statusBadge = isWon
      ? '<span class="badge badge-won">🎉当選</span>'
      : isLost
        ? '<span class="badge badge-lost">落選</span>'
        : isInstant
          ? '<span class="badge badge-instant">⚡その場で</span>'
          : '<span style="color:#71767b">応募済</span>';
    const resultBtn = isInstant && h.resultUrl && !h.resultChecked
      ? '<a class="btn btn-apply" href="' + h.resultUrl + '" target="_blank" rel="noopener">結果確認</a> '
      : '';
    const tweetBtn = h.tweetUrl
      ? '<a class="btn btn-detail" href="' + h.tweetUrl + '" target="_blank" rel="noopener">ツイート</a>'
      : '';
    const deadline = h.deadline ? h.deadline.replace(/^2026-/, '').replace(/-/, '/') : '-';
    return '<tr class="' + rowClass + '">' +
      '<td>' + (sorted.length - i) + '</td>' +
      '<td style="white-space:nowrap">' + h.date.replace(/^2026-/, '') + '</td>' +
      '<td><span style="color:#1d9bf0;font-weight:600">' + h.account + '</span><br><span style="color:#71767b;font-size:0.8rem">' + h.content + '</span></td>' +
      '<td style="white-space:nowrap">' + deadline + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' + resultBtn + tweetBtn + '</td>' +
      '</tr>';
  }).join('');
}

function getDaysLeft(dateStr) {
  // Handle fuzzy dates like "2026-04\\u6708\\u4E2D" or "2026-04-\\u9803"
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(dateStr)) {
    // Extract year-month, assume end of month
    const m = dateStr.match(/(\\d{4})-(\\d{2})/);
    if (m) {
      const lastDay = new Date(parseInt(m[1]), parseInt(m[2]), 0).getDate();
      dateStr = m[1] + '-' + m[2] + '-' + lastDay;
    } else {
      return 999;
    }
  }
  const d = new Date(dateStr);
  return Math.ceil((d - TODAY) / 86400000);
}

function deadlineClass(days) {
  if (days < 0) return "deadline-expired";
  if (days === 0) return "deadline-urgent";
  if (days <= 2) return "deadline-soon";
  return "deadline-ok";
}

function deadlineText(dateStr) {
  const days = getDaysLeft(dateStr);
  // For display, show the original date string if fuzzy
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(dateStr)) {
    const m = dateStr.match(/(\\d{4})-(\\d{2})/);
    if (m) {
      return parseInt(m[2]) + "\\u6708\\u4E2D (\\u3042\\u3068" + days + "\\u65E5)";
    }
    return dateStr;
  }
  const d = new Date(dateStr);
  const mo = d.getMonth() + 1;
  const dd = d.getDate();
  if (days < 0) return mo + "/" + dd + " (\\u671F\\u9650\\u5207\\u308C)";
  if (days === 0) return mo + "/" + dd + " (\\u672C\\u65E5)";
  return mo + "/" + dd + " (\\u3042\\u3068" + days + "\\u65E5)";
}

function methodBadges(m) {
  const parts = m.split("+");
  return parts.map(p => {
    if (p === "rt") return '<span class="badge badge-rt">F&RT</span>';
    if (p === "reply") return '<span class="badge badge-reply">\\u30EA\\u30D7\\u30E9\\u30A4</span>';
    if (p === "quote") return '<span class="badge badge-quote">\\u5F15\\u7528</span>';
    if (p === "like") return '<span class="badge badge-like">\\u3044\\u3044\\u306D</span>';
    if (p === "daily") return '<span class="badge badge-daily">\\u6BCE\\u65E5</span>';
    return '<span class="badge">' + p + '</span>';
  }).join(" ");
}

function isApplied(url) {
  const u = url.toLowerCase();
  if (APPLIED_URLS.some(au => u === au.toLowerCase())) return true;
  return APPLIED_ACCOUNTS.some(a => u.includes('x.com/' + a + '/') || u.includes('x.com/' + a));
}

function renderStats() {
  const total = GIVEAWAYS.length;
  const applied = GIVEAWAYS.filter(g => isApplied(g.applyUrl)).length;
  const todayCount = GIVEAWAYS.filter(g => getDaysLeft(g.deadline) === 0).length;
  const urgent = GIVEAWAYS.filter(g => { const d = getDaysLeft(g.deadline); return d >= 0 && d <= 2; }).length;
  const active = GIVEAWAYS.filter(g => getDaysLeft(g.deadline) >= 0).length;
  document.getElementById("stats").innerHTML =
    '<div class="stat-card"><div class="num">' + total + '</div><div class="label">\\u5408\\u8A08</div></div>' +
    '<div class="stat-card"><div class="num" style="color:#00ba7c">' + active + '</div><div class="label">\\u53D7\\u4ED8\\u4E2D</div></div>' +
    '<div class="stat-card"><div class="num">' + applied + '</div><div class="label">\\u5FDC\\u52DF\\u6E08</div></div>' +
    '<div class="stat-card"><div class="num" style="color:#f4212e">' + todayCount + '</div><div class="label">\\u672C\\u65E5\\u7DE0\\u5207</div></div>' +
    '<div class="stat-card"><div class="num" style="color:#ffd400">' + urgent + '</div><div class="label">\\u7DCA\\u6025(2\\u65E5\\u4EE5\\u5185)</div></div>';
}

let sortCol = 3, sortAsc = true;

function renderTable() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const statusF = document.getElementById("statusFilter").value;
  const methodF = document.getElementById("methodFilter").value;
  const sourceF = document.getElementById("sourceFilter").value;

  let data = GIVEAWAYS.map((g, i) => ({...g, idx: i}));

  data = data.filter(g => {
    const days = getDaysLeft(g.deadline);
    const applied = isApplied(g.applyUrl);
    if (statusF === "open" && (applied || days < 0)) return false;
    if (statusF === "applied" && !applied) return false;
    if (statusF === "expired" && days >= 0) return false;
    if (methodF === "rt" && !g.method.includes("rt")) return false;
    if (methodF === "reply" && !g.method.includes("reply")) return false;
    if (methodF === "quote" && !g.method.includes("quote")) return false;
    if (sourceF !== "all" && g.source !== sourceF) return false;
    if (search && !(g.name + g.provider + g.winners + g.source).toLowerCase().includes(search)) return false;
    return true;
  });

  data.sort((a, b) => {
    let va, vb;
    if (sortCol === 0) { va = a.idx; vb = b.idx; }
    else if (sortCol === 1) { va = a.name; vb = b.name; }
    else if (sortCol === 2) { va = parseInt(a.winners.replace(/,/g,'')) || 0; vb = parseInt(b.winners.replace(/,/g,'')) || 0; }
    else if (sortCol === 3) { va = a.deadline; vb = b.deadline; }
    else if (sortCol === 4) { va = a.method; vb = b.method; }
    else { va = a.idx; vb = b.idx; }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  const tbody = document.getElementById("tableBody");
  if (data.length === 0) {
    tbody.innerHTML = "";
    document.getElementById("noResults").style.display = "block";
    return;
  }
  document.getElementById("noResults").style.display = "none";

  tbody.innerHTML = data.map((g, i) => {
    const days = getDaysLeft(g.deadline);
    const applied = isApplied(g.applyUrl);
    const rowClass = applied ? "applied" : "";
    const dlClass = deadlineClass(days);
    const statusHtml = applied
      ? '<span style="color:#71767b">\\u5FDC\\u52DF\\u6E08</span>'
      : (days < 0 ? '<span style="color:#71767b">\\u671F\\u9650\\u5207\\u308C</span>' : '<span style="color:#00ba7c">\\u672A\\u5FDC\\u52DF</span>');
    const actionHtml = applied
      ? '<a class="btn btn-done">\\u6E08</a>'
      : (days < 0
        ? '<span style="color:#71767b">-</span>'
        : (g.applyUrl
          ? '<a class="btn btn-apply" href="' + g.applyUrl + '" target="_blank" rel="noopener">\\u5FDC\\u52DF\\u3059\\u308B</a>'
          : '<span style="color:#71767b">-</span>'));
    const detailHtml = g.detailUrl
      ? ' <a class="btn btn-detail" href="' + g.detailUrl + '" target="_blank" rel="noopener">\\u8A73\\u7D30</a>'
      : '';

    return '<tr class="' + rowClass + '">' +
      '<td>' + (i + 1) + '</td>' +
      '<td><span class="prize-name">' + g.name + '</span><span class="provider">' + g.provider + '</span></td>' +
      '<td class="winners">' + g.winners + '</td>' +
      '<td class="' + dlClass + '">' + deadlineText(g.deadline) + '</td>' +
      '<td class="hide-mobile">' + methodBadges(g.method) + '</td>' +
      '<td class="hide-mobile"><span class="source-tag">' + g.source + '</span></td>' +
      '<td>' + statusHtml + '</td>' +
      '<td>' + actionHtml + detailHtml + '</td>' +
      '</tr>';
  }).join("");
}

function filterTable() { renderTable(); }

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "all";
  document.getElementById("methodFilter").value = "all";
  document.getElementById("sourceFilter").value = "all";
  renderTable();
}

function sortTable(col) {
  if (sortCol === col) sortAsc = !sortAsc;
  else { sortCol = col; sortAsc = true; }
  renderTable();
}

renderStats();
renderTable();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'dashboard.html'), html, 'utf8');
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist/index.html'), html, 'utf8');

console.log('Done! dashboard.html and dist/index.html written.');
