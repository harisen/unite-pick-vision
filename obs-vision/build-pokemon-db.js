// UniteDiscordBot のデータから pokemon-db.json を生成するスクリプト
const fs = require('fs');

const nameMapping = JSON.parse(
  fs.readFileSync('C:/Users/akuta/UniteDiscordBot/data/name-mapping.json', 'utf-8')
).pokemon;

const uniteDb = JSON.parse(
  fs.readFileSync('C:/Users/akuta/UniteDiscordBot/data/unite-db-pokemon.json', 'utf-8')
);

// uniteDb英語名 → t_Square ファイル名の例外マップ（直接一致しないもののみ）
const SQUARE_MAP = {
  'Mega-Charizard-X': 'MegaCharizardX',
  'Mega-Charizard-Y': 'MegaCharizardY',
  'Mega-Gyarados':    'MegaGyarados',
  'Mega-Lucario':     'MegaLucario',
  'Ho-Oh':            'HoOh',
  'Meowscarada':      'Meowscara',
  'Mr.Mime':          'MrMime',
  'Raichu':           'AlolanRaichu',
  'Rapidash':         'GalarianRapidash',
  'Urshifu':          'Urshifu_Single',
};

// 利用可能な t_Square ファイル一覧
const squareFiles = new Set(
  fs.readdirSync('C:/Users/akuta/misc-tools/obs-vision/images')
    .filter(f => f.startsWith('t_Square_') && f.endsWith('.png'))
    .map(f => f.slice('t_Square_'.length, -'.png'.length))
);

function getIcon(enName) {
  const key = SQUARE_MAP[enName] || enName;
  return squareFiles.has(key) ? `images/t_Square_${key}.png` : null;
}

const roleJa = {
  'Speedster':    'スピーダー',
  'Attacker':     'アタッカー',
  'Defender':     'ディフェンダー',
  'All-Rounder':  'バランス',
  'Supporter':    'サポート',
};

const rangeJa = {
  'Melee':  '近接',
  'Ranged': '遠距離',
};

// CC マッピング（英語名 → CCタグ配列）
// スタン/眠り/凍り = ハードCC、スロー/ノックバック/拘束 = ソフトCC
const CC_MAP = {
  'Absol':          ['スロー'],
  'Aegislash':      ['スタン'],
  'Alcremie':       ['スロー'],
  'Armarouge':      ['スロー'],
  'Azumarill':      ['スタン'],
  'Blastoise':      ['スロー', 'ノックバック'],
  'Blaziken':       ['スタン'],
  'Blissey':        ['スタン'],
  'Buzzwole':       ['スタン'],
  'Ceruledge':      ['スロー'],
  'Chandelure':     ['スロー', '拘束'],
  'Charizard':      ['ノックバック'],
  'Cinderace':      ['ノックバック'],
  'Clefable':       ['スタン', 'スロー'],
  'Comfey':         ['スロー'],
  'Cramorant':      ['スタン'],
  'Crustle':        ['スタン', 'ノックバック'],
  'Darkrai':        ['眠り', 'スロー'],
  'Decidueye':      ['スロー', '拘束'],
  'Delphox':        ['ノックバック', '拘束'],
  'Dhelmise':       ['スロー'],
  'Dodrio':         ['スロー'],
  'Dragapult':      ['スロー'],
  'Dragonite':      ['ノックバック', 'スロー'],
  'Duraludon':      ['スロー'],
  'Eldegoss':       ['スロー'],
  'Empoleon':       ['スロー', 'ノックバック'],
  'Espeon':         ['スタン'],
  'Falinks':        ['スタン'],
  'Garchomp':       ['スロー', 'ノックバック'],
  'Gardevoir':      ['スロー'],
  'Gengar':         ['スロー', '眠り'],
  'Glaceon':        ['凍り', 'スロー'],
  'Goodra':         ['スロー'],
  'Greedent':       ['スタン'],
  'Greninja':       ['ノックバック'],
  'Gyarados':       ['スタン', 'ノックバック'],
  'Ho-Oh':          ['スタン'],
  'Hoopa':          ['スロー'],
  'Inteleon':       ['スロー'],
  'Lapras':         ['凍り', 'スロー'],
  'Latias':         ['スロー'],
  'Latios':         ['スロー'],
  'Leafeon':        ['スロー'],
  'Lucario':        ['ノックバック', 'スタン'],
  'Mewtwo X':       ['スタン'],
  'Mewtwo Y':       ['スロー'],
  'Mimikyu':        ['スタン'],
  'Mew':            ['スロー'],
  'Mamoswine':      ['スタン', 'スロー'],
  'Mr. Mime':       ['スタン', '拘束'],
  'Ninetales':      ['凍り', 'スロー'],
  'Pikachu':        ['スタン'],
  'Scizor':         ['スロー'],
  'Slowbro':        ['スタン', '拘束'],
  'Snorlax':        ['ノックバック', 'スタン'],
  'Sylveon':        ['スロー'],
  'Talonflame':     ['ノックバック'],
  'Tsareena':       ['スタン'],
  'Umbreon':        ['スロー'],
  'Urshifu':        ['スタン'],
  'Venusaur':       ['スロー'],
  'Wigglytuff':     ['眠り', 'スタン'],
  'Zacian':         ['ノックバック'],
  'Zoroark':        ['スロー'],
  'Sableye':        ['スロー'],
  'Tyranitar':      ['スタン', 'スロー'],
  'Buzzwole':       ['スタン'],
  'Tinkaton':       ['ノックバック', 'スタン'],
  'Metagross':      ['スタン'],
};

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
  };
}

fs.writeFileSync(
  'C:/Users/akuta/misc-tools/obs-vision/pokemon-db.json',
  JSON.stringify(db, null, 2),
  'utf-8'
);

console.log(`生成完了: ${Object.keys(db).length} 体`);
console.log(Object.entries(db).slice(0, 5).map(([k,v]) => `${k}: ${v.role}`).join('\n'));
