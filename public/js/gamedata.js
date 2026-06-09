// ルリルラ ゲームデータ定数

const SKILLS = [
  { id: 1,  name: '接近戦',      category: '戦闘' },
  { id: 2,  name: '剣技',        category: '戦闘' },
  { id: 3,  name: '斧／槌戦闘',  category: '戦闘' },
  { id: 4,  name: '槍／棒術',    category: '戦闘' },
  { id: 5,  name: '盾防御',      category: '戦闘' },
  { id: 6,  name: '回避',        category: '戦闘' },
  { id: 7,  name: '弓術',        category: '戦闘' },
  { id: 8,  name: '特殊武器',    category: '戦闘' },
  { id: 9,  name: '拳銃射撃',    category: '近代戦' },
  { id: 10, name: 'ライフル射撃', category: '近代戦' },
  { id: 11, name: '自動小銃射撃', category: '近代戦' },
  { id: 12, name: 'ロケット/ミサイル', category: '近代戦' },
  { id: 13, name: 'キャノン',    category: '近代戦' },
  { id: 14, name: '爆発物',      category: '近代戦' },
  { id: 15, name: '現世武器知識', category: '現世' },
  { id: 16, name: 'エンジニアリング', category: '現世' },
  { id: 17, name: 'メンテナンス', category: '現世' },
  { id: 18, name: '鍛冶/工作',   category: '一般' },
  { id: 19, name: '現世知識',    category: '現世' },
  { id: 20, name: 'アーカイア知識', category: 'アーカイア' },
  { id: 21, name: '歌術知識',    category: 'アーカイア' },
  { id: 22, name: '蟲知識',      category: 'アーカイア' },
  { id: 23, name: '偵察',        category: '一般' },
  { id: 24, name: '隠蔽',        category: '一般' },
  { id: 25, name: '盗賊',        category: '一般' },
  { id: 26, name: '交渉',        category: '一般' },
  { id: 27, name: '恫喝',        category: '一般' },
  { id: 28, name: '口説き',      category: '一般' },
  { id: 29, name: '救急',        category: '一般' },
  { id: 30, name: '泳ぎ',        category: '一般' },
  { id: 31, name: '料理',        category: '一般' },
  { id: 32, name: '演奏',        category: '一般' },
  { id: 33, name: 'ギャンブル',  category: '一般' },
  { id: 34, name: '鑑定',        category: 'アーカイア' },
  { id: 35, name: '交感',        category: 'アーカイア' },
  { id: 36, name: '推理',        category: '一般' },
];

const SINGER_SKILLS = [
  { id: 20, name: 'アーカイア知識', category: 'アーカイア' },
  { id: 21, name: '歌術知識',    category: 'アーカイア' },
  { id: 22, name: '蟲知識',      category: 'アーカイア' },
  { id: 6,  name: '回避',        category: '戦闘' },
  { id: 24, name: '隠蔽',        category: '一般' },
  { id: 31, name: '料理',        category: '一般' },
  { id: 1,  name: '接近戦',      category: '戦闘' },
  { id: 2,  name: '剣技',        category: '戦闘' },
  { id: 3,  name: '斧／槌戦闘',  category: '戦闘' },
  { id: 4,  name: '槍／棒術',    category: '戦闘' },
  { id: 5,  name: '盾防御',      category: '戦闘' },
  { id: 7,  name: '弓術',        category: '戦闘' },
  { id: 26, name: '交渉',        category: '一般' },
  { id: 27, name: '恫喝',        category: '一般' },
  { id: 35, name: '交感',        category: 'アーカイア' },
  { id: 36, name: '推理',        category: '一般' },
  { id: 16, name: 'エンジニアリング', category: '現世' },
  { id: 17, name: 'メンテナンス', category: '現世' },
];

const ABILITY_NAMES = ['筋力', '器用さ', '敏捷', '生命力', '知力', '精神力'];

// ccfoliaのコマンド生成
function buildCcfoliaCommands(heroData) {
  const d = heroData;
  const cmds = [];

  // 能力チェック
  for (const ab of ABILITY_NAMES) {
    const val = d.abilities?.[ab] || 10;
    const mod = val - 10;
    const suc = 50 + mod;
    cmds.push({
      label: `${ab}チェック`,
      value: `1D100<=${suc} [${ab}チェック 成功値:${suc}]`
    });
  }

  // スキルチェック
  for (const [name, val] of Object.entries(d.skills || {})) {
    if (val > 0) {
      cmds.push({
        label: `${name}`,
        value: `1D100<=${50 + val} [${name} スキル${val}]`
      });
    }
  }

  // 攻撃ロール（個人武器）
  for (const w of d.weapons || []) {
    if (w.name && w.hit) {
      cmds.push({
        label: `攻撃:${w.name}`,
        value: `1D100<=${w.hit} [${w.name}命中]`
      });
      if (w.damage) {
        cmds.push({
          label: `ダメージ:${w.name}`,
          value: `${w.damage} [${w.name}ダメージ]`
        });
      }
    }
  }

  return cmds;
}

function buildSingerCcfoliaCommands(singerData) {
  const d = singerData;
  const cmds = [];

  // 消耗チェック
  for (const gauge of ['肉体', '気力', '絆']) {
    const val = d.gauges?.[gauge]?.cost || 9;
    cmds.push({
      label: `${gauge}消耗チェック`,
      value: `2D10<=${val} [${gauge}消耗チェック 消耗値:${val}]`
    });
  }

  // 歌姫スキル
  for (const [name, val] of Object.entries(d.skills || {})) {
    if (val > 0) {
      cmds.push({
        label: `${name}`,
        value: `1D100<=${50 + val} [${name} スキル${val}]`
      });
    }
  }

  // 特殊起動チェック
  cmds.push({
    label: '特殊起動チェック',
    value: `2D10<=${d.abilities?.['精神力'] || 10} [特殊起動【精神力】チェック]`
  });

  return cmds;
}

function buildArmorCcfoliaCommands(armorData) {
  const d = armorData;
  const cmds = [];

  // 武器攻撃
  for (const w of d.weapons || []) {
    if (w.name && w.finalHit) {
      cmds.push({
        label: `攻撃:${w.name}`,
        value: `1D100<=${w.finalHit} [${w.name}命中]`
      });
      if (w.damage) {
        cmds.push({
          label: `ダメージ:${w.name}`,
          value: `${w.damage} [${w.name}ダメージ]`
        });
      }
    }
  }

  return cmds;
}
