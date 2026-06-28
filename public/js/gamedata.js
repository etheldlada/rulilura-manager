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
  // アーカイア系（初期値あり）
  { id: 20, name: 'アーカイア知識', category: 'アーカイア' },
  { id: 21, name: '歌術知識',      category: 'アーカイア' },
  { id: 22, name: '蟲知識',        category: 'アーカイア' },
  { id: 34, name: '鑑定',          category: 'アーカイア' },
  { id: 35, name: '交感',          category: 'アーカイア' },
  // 戦闘系
  { id: 6,  name: '回避',          category: '戦闘' },
  { id: 1,  name: '接近戦',        category: '戦闘' },
  { id: 2,  name: '剣技',          category: '戦闘' },
  { id: 3,  name: '斧／槌戦闘',    category: '戦闘' },
  { id: 4,  name: '槍／棒術',      category: '戦闘' },
  { id: 5,  name: '盾防御',        category: '戦闘' },
  { id: 7,  name: '弓術',          category: '戦闘' },
  { id: 8,  name: '特殊武器',      category: '戦闘' },
  // 近代戦系
  { id: 9,  name: '拳銃射撃',      category: '近代戦' },
  { id: 10, name: 'ライフル射撃',  category: '近代戦' },
  { id: 11, name: '自動小銃射撃',  category: '近代戦' },
  { id: 12, name: 'ロケット/ミサイル', category: '近代戦' },
  { id: 13, name: 'キャノン',      category: '近代戦' },
  { id: 14, name: '爆発物',        category: '近代戦' },
  // 現世系
  { id: 15, name: '現世武器知識',  category: '現世' },
  { id: 16, name: 'エンジニアリング', category: '現世' },
  { id: 17, name: 'メンテナンス',  category: '現世' },
  { id: 18, name: '鍛冶/工作',     category: '一般' },
  { id: 19, name: '現世知識',      category: '現世' },
  // 一般系（初期値あり：隠蔽・料理）
  { id: 24, name: '隠蔽',          category: '一般' },
  { id: 31, name: '料理',          category: '一般' },
  { id: 23, name: '偵察',          category: '一般' },
  { id: 25, name: '盗賊',          category: '一般' },
  { id: 26, name: '交渉',          category: '一般' },
  { id: 27, name: '恫喝',          category: '一般' },
  { id: 28, name: '口説き',        category: '一般' },
  { id: 29, name: '救急',          category: '一般' },
  { id: 30, name: '泳ぎ',          category: '一般' },
  { id: 32, name: '演奏',          category: '一般' },
  { id: 33, name: 'ギャンブル',    category: '一般' },
  { id: 36, name: '推理',          category: '一般' },
];

const ABILITY_NAMES = ['筋力', '器用さ', '敏捷', '生命力', '知力', '精神力'];

// 符号付き数値文字列（ccfolia パラメータ参照用）
function signedStr(v) { return (v >= 0 ? '+' : '') + v; }

// ccfoliaのコマンド生成
function buildCcfoliaCommands(heroData) {
  const d = heroData;
  const cmds = [];

  // 修正値を取得
  const strMod = (d.abilities?.['筋力'] || 10) - 10; // 筋力修正（白兵ダメージ用）
  const dmgMod = d.modifiers?.damage || 0;            // ダメージ修正（能力ボーナス等）

  // 能力チェック（パラメータ参照: {筋力修正} 等）
  for (const ab of ABILITY_NAMES) {
    cmds.push({
      label: `${ab}チェック`,
      value: `1D100<=50{${ab}修正} [${ab}チェック]`
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
    if (!w.name) continue;

    const isMelee  = (w.range === '白');
    const modLabel = isMelee ? '白兵修正' : '射撃修正';
    const baseHit  = w.hit || 0;

    // 命中: 基本命中 ＋ {白兵修正} or {射撃修正}（パラメータ参照）
    cmds.push({
      label: `攻撃:${w.name}`,
      value: `1D100<=${baseHit}{${modLabel}} [${w.name}命中 基本${baseHit}+{${modLabel}}]`
    });

    // ダメージ: 白兵＝筋力修正＋ダメージ修正、射撃＝ダメージ修正のみ
    if (w.damage) {
      const dmgBonus = isMelee ? strMod + dmgMod : dmgMod;
      let dmgExpr = w.damage;
      let dmgNote = w.name;
      if (dmgBonus !== 0) {
        const sign = signedStr(dmgBonus);
        dmgExpr = `${w.damage}${sign}`;
        dmgNote = `${w.name} 修正${sign}込み`;
      }
      cmds.push({
        label: `ダメージ:${w.name}`,
        value: `${dmgExpr} [${dmgNote}]`
      });
    }
  }

  return cmds;
}

function buildSingerCcfoliaCommands(singerData) {
  const d = singerData;
  const cmds = [];

  // 消耗チェック（肉体・気力・絆消耗ゲージ）：パラメータ「○○消耗値」を参照する1行コマンド
  for (const gauge of ['肉体', '気力', '絆']) {
    cmds.push({
      value: `2D10<={${gauge}消耗値} [${gauge}消耗チェック 消耗値:{${gauge}消耗値}]`
    });
  }

  // 絆獲得チェック（絆ゲインゲージ：消耗チェックとは別の独立した判定）：パラメータ「絆獲得値」を参照
  cmds.push({
    value: `2D10<={絆獲得値} [絆獲得チェック 獲得値:{絆獲得値}]`
  });

  // 歌姫スキルチェック
  for (const [name, val] of Object.entries(d.skills || {})) {
    if (val > 0) {
      cmds.push({
        value: `1D100<=${50 + val} [${name} スキル${val}]`
      });
    }
  }

  // 特殊起動チェック（パラメータ参照: {精神力}）
  cmds.push({
    value: `2D10<={精神力} [特殊起動【精神力】チェック]`
  });

  // 歌術判定（汎用）：パラメータ「気力消耗値」「歌術補正」を参照
  cmds.push({
    value: `2D10<={気力消耗値}{歌術補正} [歌術判定 気力消耗チェック 消耗値:{気力消耗値}{歌術補正}（歌姫能力・歌術アイテム補正込み）]`
  });

  // 戦闘系歌姫：武器攻撃コマンド（weapons配列がある場合のみ）
  const meleeMod  = d.modifiers?.melee  || 0;
  const rangedMod = d.modifiers?.ranged || 0;
  const strMod    = (d.abilities?.['筋力'] || 10) - 10;

  for (const w of d.weapons || []) {
    if (!w.name) continue;
    const isMelee   = (w.range === '白');
    const combatMod = isMelee ? meleeMod : rangedMod;
    const modLabel  = isMelee ? '白兵修正' : '射撃修正';
    const baseHit   = w.hit || 0;
    const finalHit  = baseHit + combatMod;
    const hitSign   = combatMod >= 0 ? `+${combatMod}` : `${combatMod}`;

    cmds.push({
      value: `1D100<=${finalHit} [${w.name}命中 基本${baseHit}${hitSign}(${modLabel})]`
    });

    if (w.damage) {
      let dmgExpr = w.damage;
      let dmgNote = w.name;
      if (isMelee && strMod !== 0) {
        const strSign = strMod >= 0 ? `+${strMod}` : `${strMod}`;
        dmgExpr = `${w.damage}${strSign}`;
        dmgNote = `${w.name} 筋力修正${strSign}込み`;
      }
      cmds.push({
        value: `${dmgExpr} [${dmgNote}]`
      });
    }
  }

  return cmds;
}

function buildArmorCcfoliaCommands(armorData) {
  const d = armorData;
  const cmds = [];
  const damageMod  = d.armor_damage_mod || 0;
  const dmgSign    = damageMod >= 0 ? `+${damageMod}` : `${damageMod}`;
  const finalRecon = (d.hero_recon || 0) + (d.armor_recon || 0);

  // 偵察チェック（基本値50＋修正値）
  cmds.push({
    label: '偵察',
    value: `1D100<=50+{偵察} [偵察チェック 修正{偵察}]`
  });

  // 武器攻撃
  for (const w of d.weapons || []) {
    if (!w.name) continue;
    if (w.range === '-') continue;  // 非武器装備はコマンド生成しない
    const finalHit = w.finalHit || 0;
    if (finalHit > 0) {
      cmds.push({
        label: `攻撃:${w.name}`,
        value: `1D100<=${finalHit} [${w.name}命中]`
      });
    }
    if (w.damage) {
      // ダメージ修正が0でなければ式に付加
      let dmgExpr = w.damage;
      let dmgNote = w.name;
      if (damageMod !== 0) {
        dmgExpr = `${w.damage}${dmgSign}`;
        dmgNote = `${w.name} ダメージ修正${dmgSign}込み`;
      }
      cmds.push({
        label: `ダメージ:${w.name}`,
        value: `${dmgExpr} [${dmgNote}]`
      });
    }
  }

  return cmds;
}
