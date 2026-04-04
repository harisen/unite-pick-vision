// UniteDiscordBot のデータから pokemon-db.json を自動生成するスクリプト
// 使い方: node build-pokemon-db.js
const fs = require('fs');
const path = require('path');

const BOT_DIR = process.env.UNITE_BOT_DIR || require('path').join(__dirname, '..', 'UniteDiscordBot');
const OUT_PATH = path.join(__dirname, 'pokemon-db.json');
const IMG_DIR = path.join(__dirname, 'images');

// --- ソースデータ読み込み ---
const nameMapping = JSON.parse(fs.readFileSync(`${BOT_DIR}/data/name-mapping.json`, 'utf-8')).pokemon;
const uniteDb = JSON.parse(fs.readFileSync(`${BOT_DIR}/data/unite-db-pokemon.json`, 'utf-8'));

// --- t_Square 画像マップ ---
const SQUARE_MAP = {
  'Mega-Charizard-X': 'MegaCharizardX', 'Mega-Charizard-Y': 'MegaCharizardY',
  'Mega-Gyarados': 'MegaGyarados', 'Mega-Lucario': 'MegaLucario',
  'Ho-Oh': 'HoOh', 'Meowscarada': 'Meowscara', 'Mr.Mime': 'MrMime',
  'Raichu': 'AlolanRaichu', 'Rapidash': 'GalarianRapidash', 'Urshifu': 'Urshifu_Single',
};

const squareFiles = new Set(
  fs.readdirSync(IMG_DIR)
    .filter(f => f.startsWith('t_Square_') && f.endsWith('.png') && !f.includes('UNPICKED') && !f.includes('TRANSITION'))
    .map(f => f.slice('t_Square_'.length, -'.png'.length))
);

function getIcon(enName) {
  const key = SQUARE_MAP[enName] || enName;
  return squareFiles.has(key) ? `images/t_Square_${key}.png` : null;
}

// --- ロール変換 ---
const roleJa = { 'Speedster': 'スピーダー', 'Attacker': 'アタッカー', 'Defender': 'ディフェンダー', 'All-Rounder': 'バランス', 'Supporter': 'サポート' };
const rangeJa = { 'Melee': '近接', 'Ranged': '遠距離' };

// --- CC マッピング ---
const CC_MAP = {
  'Absol': ['スロー'], 'Aegislash': ['スタン'], 'Alcremie': ['スロー'], 'Armarouge': ['スロー'],
  'Azumarill': ['スタン'], 'Blastoise': ['スロー', 'ノックバック'], 'Blaziken': ['スタン'],
  'Blissey': ['スタン'], 'Buzzwole': ['スタン'], 'Ceruledge': ['スロー'],
  'Chandelure': ['スロー', '拘束'], 'Charizard': ['ノックバック'], 'Cinderace': ['ノックバック'],
  'Clefable': ['スタン', 'スロー'], 'Comfey': ['スロー'], 'Cramorant': ['スタン'],
  'Crustle': ['スタン', 'ノックバック'], 'Darkrai': ['眠り', 'スロー'],
  'Decidueye': ['スロー', '拘束'], 'Delphox': ['ノックバック', '拘束'], 'Dhelmise': ['スロー'],
  'Dodrio': ['スロー'], 'Dragapult': ['スロー'], 'Dragonite': ['ノックバック', 'スロー'],
  'Duraludon': ['スロー'], 'Eldegoss': ['スロー'], 'Empoleon': ['スロー', 'ノックバック'],
  'Espeon': ['スタン'], 'Falinks': ['スタン'], 'Garchomp': ['スロー', 'ノックバック'],
  'Gardevoir': ['スロー'], 'Gengar': ['スロー', '眠り'], 'Glaceon': ['凍り', 'スロー'],
  'Goodra': ['スロー'], 'Greedent': ['スタン'], 'Greninja': ['ノックバック'],
  'Gyarados': ['スタン', 'ノックバック'], 'Ho-Oh': ['スタン'], 'Hoopa': ['スロー'],
  'Inteleon': ['スロー'], 'Lapras': ['凍り', 'スロー'], 'Latias': ['スロー'], 'Latios': ['スロー'],
  'Leafeon': ['スロー'], 'Lucario': ['ノックバック', 'スタン'], 'Machamp': ['スタン'],
  'Mamoswine': ['スタン', 'スロー'], 'Meowscarada': ['スロー'], 'Meowth': ['スロー'],
  'Metagross': ['スタン'], 'Mew': ['スロー'], 'MewtwoX': ['スタン'], 'MewtwoY': ['スロー'],
  'Mimikyu': ['スタン'], 'Miraidon': ['スタン', 'スロー'], 'Moltres': ['スロー'],
  'Mr.Mime': ['スタン', '拘束'], 'Ninetales': ['凍り', 'スロー'], 'Pawmot': ['スタン'],
  'Pikachu': ['スタン'], 'Psyduck': ['スロー'], 'Raichu': ['スタン', 'スロー'],
  'Rapidash': ['スロー'], 'Sableye': ['スロー'], 'Scizor': ['スロー'], 'Scyther': ['スロー'],
  'Sirfetchd': ['スタン'], 'Slowbro': ['スタン', '拘束'], 'Snorlax': ['ノックバック', 'スタン'],
  'Suicune': ['凍り', 'ノックバック'], 'Sylveon': ['スロー'], 'Talonflame': ['ノックバック'],
  'Tinkaton': ['ノックバック', 'スタン'], 'Trevenant': ['スタン', 'スロー'],
  'Tsareena': ['スタン'], 'Tyranitar': ['スタン', 'スロー'], 'Umbreon': ['スロー'],
  'Urshifu': ['スタン'], 'Vaporeon': ['スロー'], 'Venusaur': ['スロー'],
  'Wigglytuff': ['眠り', 'スタン'], 'Zacian': ['ノックバック'], 'Zapdos': ['スタン'],
  'Zeraora': ['スロー'], 'Zoroark': ['スロー'],
  // メガ進化
  'Mega-Charizard-X': ['ノックバック'], 'Mega-Charizard-Y': ['ノックバック'],
  'Mega-Gyarados': ['スタン', 'ノックバック'], 'Mega-Lucario': ['ノックバック', 'スタン'],
};

// --- ジャングル適性を自動抽出（Center系レーン or スピーダー） ---
function extractJunglers() {
  const junglers = new Set();
  for (const p of uniteDb) {
    const lanes = (p.builds || []).map(b => b.lane).filter(Boolean);
    if (lanes.some(l => /center/i.test(l))) {
      const ja = nameMapping[p.name];
      if (ja) junglers.add(ja);
    }
    // スピーダーは全員
    if (p.tags?.role === 'Speedster') {
      const ja = nameMapping[p.name];
      if (ja) junglers.add(ja);
    }
  }
  return junglers;
}

// --- 画像同期（UniteDiscordBot/images → obs-vision/images） ---
function syncImages() {
  const srcDir = `${BOT_DIR}/images`;
  if (!fs.existsSync(srcDir)) { console.log('[画像同期] ソースなし:', srcDir); return; }

  // t_Square_*.png を同期
  const srcFiles = fs.readdirSync(srcDir).filter(f => f.startsWith('t_Square_') && f.endsWith('.png'));
  let copied = 0;
  for (const f of srcFiles) {
    const src = path.join(srcDir, f);
    const dst = path.join(IMG_DIR, f);
    const srcStat = fs.statSync(src);
    const dstExists = fs.existsSync(dst);
    if (!dstExists || fs.statSync(dst).mtimeMs < srcStat.mtimeMs) {
      fs.copyFileSync(src, dst);
      copied++;
    }
  }

  // pokemon/ フォルダも同期
  const srcPokemon = path.join(srcDir, 'pokemon');
  const dstPokemon = path.join(IMG_DIR, 'pokemon');
  if (fs.existsSync(srcPokemon)) {
    if (!fs.existsSync(dstPokemon)) fs.mkdirSync(dstPokemon, { recursive: true });
    const pFiles = fs.readdirSync(srcPokemon).filter(f => f.endsWith('.png'));
    for (const f of pFiles) {
      const src = path.join(srcPokemon, f);
      const dst = path.join(dstPokemon, f);
      if (!fs.existsSync(dst) || fs.statSync(dst).mtimeMs < fs.statSync(src).mtimeMs) {
        fs.copyFileSync(src, dst);
        copied++;
      }
    }
  }

  console.log(`[画像同期] ${copied}枚コピー (合計: ${srcFiles.length} t_Square)`);
}

syncImages();
// squareFilesを再読み込み
squareFiles.clear();
fs.readdirSync(IMG_DIR)
  .filter(f => f.startsWith('t_Square_') && f.endsWith('.png') && !f.includes('UNPICKED') && !f.includes('TRANSITION'))
  .forEach(f => squareFiles.add(f.slice('t_Square_'.length, -'.png'.length)));

// --- DB生成 ---
const junglers = extractJunglers();
const db = {};

for (const p of uniteDb) {
  const jaName = nameMapping[p.name];
  if (!jaName) continue;

  db[jaName] = {
    en: p.name,
    role: roleJa[p.tags?.role] || p.tags?.role || '不明',
    range: rangeJa[p.tags?.range] || p.tags?.range || '不明',
    cc: CC_MAP[p.name] || [],
    icon: getIcon(p.name),
    jungle: junglers.has(jaName) || false,
  };
}

fs.writeFileSync(OUT_PATH, JSON.stringify(db, null, 2), 'utf-8');

// --- レポート ---
const total = Object.keys(db).length;
const withIcon = Object.values(db).filter(v => v.icon).length;
const withCC = Object.values(db).filter(v => v.cc.length > 0).length;
const withJungle = Object.values(db).filter(v => v.jungle).length;
const noIcon = Object.entries(db).filter(([,v]) => !v.icon);
const noCC = Object.entries(db).filter(([,v]) => v.cc.length === 0);

console.log(`生成完了: ${total}体`);
console.log(`  アイコン: ${withIcon}/${total}  CC: ${withCC}/${total}  ジャングル: ${withJungle}/${total}`);
if (noIcon.length) console.log(`  アイコンなし: ${noIcon.map(([ja]) => ja).join(', ')}`);
if (noCC.length) console.log(`  CCなし: ${noCC.map(([ja]) => ja).join(', ')}`);
