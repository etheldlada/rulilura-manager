// 英雄シートフォームロジック

// 英雄能力カタログ（番号・名前・主な効果サマリー）
const HERO_ABILITIES_CATALOG = [
  { no:1,  name:'能力アップ',           summary:'好きな能力値1つを最大+3上昇' },
  { no:2,  name:'スキルUP',             summary:'指定スキルをただちに+8' },
  { no:3,  name:'十八番（おはこ）',      summary:'2D10MPで非戦闘スキルチェック+20' },
  { no:4,  name:'インテリ',             summary:'1D10MPで知識スキルを一時習得' },
  { no:5,  name:'成長ボーナス',          summary:'レベルアップ必要経験点を減らす' },
  { no:6,  name:'根性',                 summary:'1シナリオ1回、MPを3D10回復' },
  { no:7,  name:'騎士',                 summary:'防具の回避ペナルティを軽減' },
  { no:8,  name:'寄生蟲バスター',        summary:'蟲への命中+10、ダメージ+4、奇声抵抗+20' },
  { no:9,  name:'局地戦エキスパート',    summary:'選んだ地形で命中・回避・隠蔽・偵察UP' },
  { no:10, name:'対空戦闘エキスパート',  summary:'対空射撃命中+20、回避修正を無効化' },
  { no:11, name:'水中戦闘エキスパート',  summary:'水中で命中+10、水中ペナルティ無視' },
  { no:12, name:'強打',                 summary:'2D10MPで白兵ダメージ+1D10' },
  { no:13, name:'渾身の一撃',            summary:'4D10MPで両手白兵ダメージ+2D10' },
  { no:14, name:'集中攻撃Ⅰ',            summary:'2D10MPで追加1回攻撃（1戦闘1回）' },
  { no:15, name:'集中攻撃Ⅱ',            summary:'2D10MPで追加1回攻撃（何回でも）' },
  { no:16, name:'二挺射撃（個人）',      summary:'個人戦闘で両手射撃可（命中-30）' },
  { no:17, name:'二挺射撃（奏甲）',      summary:'奏甲戦でも二挺射撃可' },
  { no:18, name:'二挺射撃（大型武器）',  summary:'両手射撃武器でも二挺射撃可' },
  { no:19, name:'全力射',               summary:'3D10MPで奏甲の全射撃武器で攻撃' },
  { no:20, name:'奏甲猟兵Ⅰ',            summary:'奏甲からの追加ダメージ半減' },
  { no:21, name:'奏甲猟兵Ⅱ',            summary:'奏甲からの追加ダメージ無し' },
  { no:22, name:'奏甲回避Ⅰ',            summary:'2D10MPで命中部位を1つずらす' },
  { no:23, name:'奏甲回避Ⅱ',            summary:'命中部位を上か下にずらす' },
  { no:24, name:'緊急射撃',             summary:'2D10MPで使用条件を無視して武器使用' },
  { no:25, name:'武器エキスパート',      summary:'全武器の知識要件を満たしているとみなす' },
  { no:26, name:'圧倒',                 summary:'4レベル以上低い敵への特殊効果' },
  { no:27, name:'機先',                 summary:'6レベル以上低い敵の攻撃前に反撃可' },
  { no:28, name:'オーラ',               summary:'各種チェックでレベル+1扱い（最大3回）' },
  { no:29, name:'見切り',               summary:'6レベル以上低い敵からのダメージ半減' },
  { no:30, name:'致命的一撃',            summary:'ゾロ目命中時に防御値を無視' },
  { no:31, name:'スナイパー',            summary:'1ターン照準か2D10MPで射撃命中+20' },
  { no:32, name:'ピンポイント攻撃',      summary:'2D10MPでピンポイント攻撃可能' },
  { no:33, name:'レンジャー',            summary:'隠蔽状態を維持したまま攻撃可能' },
  { no:34, name:'受け流し',             summary:'4D10MPで白兵命中を無効化し跳ね返す' },
  { no:35, name:'身代わり',             summary:'他キャラのダメージを防御値なしで肩代わり' },
  { no:36, name:'愛機',                 summary:'同一奏甲3冒険で命中・回避・ダメージにボーナス' },
  { no:37, name:'幻糸抵抗力',            summary:'歌術・呪いへの抵抗修正+20' },
  { no:38, name:'耐性',                 summary:'毒/病気/呪いへの抵抗を2回判定可' },
  { no:39, name:'奇跡的回避',            summary:'3D10MPで失敗した抵抗/回避をやり直し' },
  { no:40, name:'幸運',                 summary:'1冒険1回、振ったダイスをすべて振り直し' },
  { no:41, name:'ダイハード',            summary:'死亡1回分を無効（1回使用で消滅）' },
  { no:42, name:'執念',                 summary:'MP0になっても1ターンは気絶しない' },
  { no:43, name:'MPの驚異的回復',        summary:'休息時のMP回復量を大幅増加' },
  { no:44, name:'主人公',               summary:'仲間からMPをもらえる（応援）' },
  { no:45, name:'精神集中',             summary:'根性でのMP回復を全MP全回復にできる' },
  { no:46, name:'MP増加',               summary:'レベルアップ時のMP増加を2D10MPに' },
  { no:47, name:'歌姫強化',             summary:'歌姫に能力を付与' },
  { no:48, name:'ユニゾン',             summary:'歌姫の能力修正2つを英雄に加える' },
  { no:49, name:'外道／鬼畜系英雄',     summary:'絆ダメージを50%で却下できる' },
  { no:50, name:'懇願',                 summary:'1シナリオ1回、歌姫の消耗チェックを無効化' },
  { no:51, name:'絆レベルアップ',        summary:'絆レベル+1（何回でも取得可）' },
  { no:52, name:'応急修理',             summary:'2D10×20分で奏甲ダメージを半分に' },
  { no:53, name:'チューンの天才',        summary:'チューン成功時にペナルティ無視可能' },
  { no:54, name:'整備の天才',            summary:'修理費か修理時間を半分にできる' },
];

const HeroForm = {
  defaults() {
    return {
      name: '', nationality: '', job: '', age: '', gender: '男性', level: 1,
      abilities: { 筋力: 10, 器用さ: 10, 敏捷: 10, 生命力: 10, 知力: 10, 精神力: 10 },
      skills: {},
      hp: { normal: 0, injured: 0, mp: 0 },
      modifiers: { melee: 0, ranged: 0, evasion: 0, resistance: 0, defense: 0, damage: 0 },
      weapons: [],
      hero_abilities: [], // [{no, name, memo}] 個別管理
      equipment: '',
      notes: '',
      // 旧データ互換
      abilities_memo: '',
    };
  },

  // 英雄能力行HTMLを生成（フォーム用）
  _abilityRow(ab, i) {
    const noOpts = HERO_ABILITIES_CATALOG.map(c =>
      `<option value="${c.no}" ${ab.no == c.no ? 'selected' : ''}>${c.no}. ${c.name}</option>`
    ).join('');
    return `<tr data-ai="${i}">
      <td style="min-width:220px">
        <select name="hab_no" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.25rem .4rem;border-radius:4px;font-size:.8rem" onchange="HeroForm._updateAbilitySummary(this)">
          <option value="">-- 選択 --</option>
          ${noOpts}
        </select>
      </td>
      <td style="min-width:160px;font-size:.75rem;color:var(--text-dim)" class="hab-summary">${ab.no ? (HERO_ABILITIES_CATALOG.find(c=>c.no==ab.no)?.summary||'') : ''}</td>
      <td style="min-width:200px"><input name="hab_memo" value="${(ab.memo||'').replace(/"/g,'&quot;')}" placeholder="習得時のメモ（適用対象など）" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.2rem .4rem;border-radius:4px;font-size:.8rem"></td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="HeroForm.removeAbility(${i})">×</button></td>
    </tr>`;
  },

  _updateAbilitySummary(sel) {
    const tr = sel.closest('tr');
    const td = tr?.querySelector('.hab-summary');
    const no = parseInt(sel.value);
    if (td) td.textContent = no ? (HERO_ABILITIES_CATALOG.find(c=>c.no===no)?.summary||'') : '';
  },

  renderForm(data = null) {
    const d = data ? { ...this.defaults(), ...data } : this.defaults();
    // 旧テキスト形式との互換：abilities_memoがあればhero_abilitiesが空の場合に引き継ぎ表示用メモとして残す
    const ab = d.abilities;

    const abilityInputs = ABILITY_NAMES.map(name => `
      <div class="form-group">
        <label>${name}</label>
        <input type="number" min="2" max="20" name="ab_${name}" value="${ab[name] || 10}">
        <small style="color:var(--text-dim)">修正:${(ab[name] || 10) - 10 >= 0 ? '+' : ''}${(ab[name] || 10) - 10}</small>
      </div>`).join('');

    const skillRows = SKILLS.map(s => {
      const val = d.skills[s.name] || 0;
      return `<tr>
        <td>${s.name}</td>
        <td style="color:var(--text-dim);font-size:.75rem">${s.category}</td>
        <td><input type="number" min="0" max="99" name="skill_${s.name}" value="${val}" style="width:70px"></td>
        <td style="color:var(--text-dim);font-size:.8rem">${val > 0 ? 50 + val : '-'}</td>
      </tr>`;
    }).join('');

    const weaponRows = (d.weapons || []).map((w, i) => `
      <tr data-wi="${i}">
        <td><input name="wn" value="${w.name || ''}" placeholder="武器名"></td>
        <td><input name="wh" value="${w.hit || ''}" placeholder="40" style="width:55px"></td>
        <td><input name="wsk" value="${w.skill || ''}" placeholder="剣技"></td>
        <td><input name="wd" value="${w.damage || ''}" placeholder="1D10+5"></td>
        <td><input name="wr" value="${w.range || '白'}" style="width:45px"></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="HeroForm.removeWeapon(${i})">×</button></td>
      </tr>`).join('');

    // 英雄能力行（旧データ互換：abilities_memoのみある場合は空行1つを用意）
    const heroAbilities = (d.hero_abilities && d.hero_abilities.length > 0)
      ? d.hero_abilities
      : [];
    const abilityRows = heroAbilities.map((ab, i) => this._abilityRow(ab, i)).join('');

    // 旧データのabilities_memoを引き継ぎ表示する互換メモ
    const legacyMemo = (!heroAbilities.length && d.abilities_memo)
      ? `<div class="alert alert-error" style="font-size:.8rem;margin-bottom:.5rem">⚠ 旧形式のテキストデータが存在します。以下を参照して上の表に移してください。<br><pre style="white-space:pre-wrap;margin-top:.3rem">${d.abilities_memo}</pre></div>`
      : '';

    return `
      <form id="hero-form" onsubmit="return false">
        <div class="form-section">
          <h4>基本情報</h4>
          <div class="form-row">
            <div class="form-group"><label>英雄名 *</label><input name="name" value="${d.name}" required></div>
            <div class="form-group"><label>性別</label>
              <select name="gender">
                <option ${d.gender==='男性'?'selected':''}>男性</option>
                <option ${d.gender==='女性'?'selected':''}>女性</option>
              </select>
            </div>
            <div class="form-group"><label>年齢</label><input name="age" value="${d.age}"></div>
            <div class="form-group"><label>レベル</label><input type="number" min="1" max="20" name="level" value="${d.level}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>現世の国籍</label><input name="nationality" value="${d.nationality}"></div>
            <div class="form-group"><label>現世の職業</label><input name="job" value="${d.job}"></div>
          </div>
        </div>

        <div class="form-section">
          <h4>能力値（合計70ポイント）</h4>
          <div class="form-row" id="ability-inputs">${abilityInputs}</div>
          <div id="auto-calc" style="font-size:.8rem;color:var(--text-dim);margin-top:.5rem"></div>
        </div>

        <div class="form-section">
          <h4>HP / MP</h4>
          <div class="form-row">
            <div class="form-group"><label>通常HP（自動計算:筋+器）</label><input type="number" name="hp_normal" value="${d.hp.normal}" id="hp-normal-input"></div>
            <div class="form-group"><label>負傷HP（自動計算:敏+生）</label><input type="number" name="hp_injured" value="${d.hp.injured}" id="hp-injured-input"></div>
            <div class="form-group"><label>MP（自動計算:知+精）</label><input type="number" name="hp_mp" value="${d.hp.mp}" id="hp-mp-input"></div>
          </div>
        </div>

        <div class="form-section">
          <h4>戦闘修正</h4>
          <div class="form-row">
            <div class="form-group"><label>白兵修正</label><input type="number" name="mod_melee" value="${d.modifiers.melee}" id="mod-melee"></div>
            <div class="form-group"><label>射撃修正</label><input type="number" name="mod_ranged" value="${d.modifiers.ranged}" id="mod-ranged"></div>
            <div class="form-group"><label>回避修正</label><input type="number" name="mod_evasion" value="${d.modifiers.evasion}"></div>
            <div class="form-group"><label>抵抗修正</label><input type="number" name="mod_resistance" value="${d.modifiers.resistance}" id="mod-resistance"></div>
            <div class="form-group"><label>防御値</label><input type="number" name="mod_defense" value="${d.modifiers.defense}"></div>
            <div class="form-group"><label>ダメージ修正</label><input type="number" name="mod_damage" value="${d.modifiers.damage}"></div>
          </div>
        </div>

        <div class="form-section">
          <h4>スキル（8つ選択・合計80ポイント）</h4>
          <div id="skill-point-info" style="font-size:.8rem;color:var(--accent2);margin-bottom:.5rem"></div>
          <table class="skill-table">
            <thead><tr><th>スキル名</th><th>分類</th><th>スキル値</th><th>成功値</th></tr></thead>
            <tbody id="skill-tbody">${skillRows}</tbody>
          </table>
        </div>

        <div class="form-section">
          <h4>個人武器</h4>
          <div style="overflow-x:auto">
            <table class="weapon-table" style="min-width:420px">
              <thead><tr><th>武器名</th><th>命中値</th><th>スキル</th><th>ダメージ</th><th>射程</th><th></th></tr></thead>
              <tbody id="weapon-tbody">${weaponRows}</tbody>
            </table>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-top:.5rem" onclick="HeroForm.addWeapon()">＋ 武器を追加</button>
        </div>

        <div class="form-section">
          <h4>英雄能力</h4>
          ${legacyMemo}
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.82rem">
              <thead>
                <tr>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">能力名</th>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">効果サマリー</th>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">メモ（適用対象・回数など）</th>
                  <th style="width:36px"></th>
                </tr>
              </thead>
              <tbody id="hero-ability-tbody">${abilityRows}</tbody>
            </table>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-top:.5rem" onclick="HeroForm.addAbility()">＋ 英雄能力を追加</button>
        </div>

        <div class="form-section">
          <h4>装備品・メモ</h4>
          <div class="form-group"><label>装備品</label><textarea name="equipment" rows="2" placeholder="所持装備・アイテム...">${d.equipment || ''}</textarea></div>
          <div class="form-group"><label>メモ</label><textarea name="notes" rows="3" placeholder="自由メモ...">${d.notes || ''}</textarea></div>
        </div>
      </form>`;
  },

  collectForm() {
    const f = document.getElementById('hero-form');
    if (!f) return null;
    const g  = n => f.querySelector(`[name="${n}"]`)?.value || '';
    const gi = n => parseInt(g(n)) || 0;

    const abilities = {};
    for (const name of ABILITY_NAMES) abilities[name] = gi(`ab_${name}`);

    const skills = {};
    for (const s of SKILLS) {
      const v = gi(`skill_${s.name}`);
      if (v > 0) skills[s.name] = v;
    }

    const weapons = [];
    for (const row of f.querySelectorAll('#weapon-tbody tr')) {
      const name = row.querySelector('[name=wn]')?.value?.trim();
      if (!name) continue;
      weapons.push({
        name,
        hit:    parseInt(row.querySelector('[name=wh]')?.value) || 0,
        skill:  row.querySelector('[name=wsk]')?.value || '',
        damage: row.querySelector('[name=wd]')?.value || '',
        range:  row.querySelector('[name=wr]')?.value || '白',
      });
    }

    const hero_abilities = [];
    for (const row of f.querySelectorAll('#hero-ability-tbody tr')) {
      const no   = parseInt(row.querySelector('[name=hab_no]')?.value) || 0;
      const memo = row.querySelector('[name=hab_memo]')?.value?.trim() || '';
      if (!no) continue;
      const catalog = HERO_ABILITIES_CATALOG.find(c => c.no === no);
      hero_abilities.push({ no, name: catalog?.name || '', memo });
    }

    return {
      name: g('name'), nationality: g('nationality'), job: g('job'),
      age: g('age'), gender: g('gender'), level: gi('level'),
      abilities, skills,
      hp: { normal: gi('hp_normal'), injured: gi('hp_injured'), mp: gi('hp_mp') },
      modifiers: {
        melee: gi('mod_melee'), ranged: gi('mod_ranged'),
        evasion: gi('mod_evasion'), resistance: gi('mod_resistance'),
        defense: gi('mod_defense'), damage: gi('mod_damage'),
      },
      weapons,
      hero_abilities,
      equipment: g('equipment'),
      notes:     g('notes'),
      abilities_memo: '', // 旧フィールドはクリア
    };
  },

  addAbility() {
    const tbody = document.getElementById('hero-ability-tbody');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.ai = i;
    tr.innerHTML = this._abilityRow({ no: '', memo: '' }, i);
    tbody.appendChild(tr);
  },

  removeAbility(i) {
    const rows = document.querySelectorAll('#hero-ability-tbody tr');
    if (rows[i]) rows[i].remove();
  },

  addWeapon() {
    const tbody = document.getElementById('weapon-tbody');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.wi = i;
    tr.innerHTML = `
      <td><input name="wn" placeholder="武器名"></td>
      <td><input name="wh" placeholder="40" style="width:55px"></td>
      <td><input name="wsk" placeholder="剣技"></td>
      <td><input name="wd" placeholder="1D10+5"></td>
      <td><input name="wr" value="白" style="width:45px"></td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="HeroForm.removeWeapon(${i})">×</button></td>`;
    tbody.appendChild(tr);
  },

  removeWeapon(i) {
    const rows = document.querySelectorAll('#weapon-tbody tr');
    if (rows[i]) rows[i].remove();
  },

  attachAutoCalc() {
    document.querySelectorAll('[name^="ab_"]').forEach(el => {
      el.addEventListener('input', () => {
        const vals = {};
        for (const ab of ABILITY_NAMES) {
          vals[ab] = parseInt(document.querySelector(`[name="ab_${ab}"]`)?.value) || 10;
        }
        const total = Object.values(vals).reduce((a, b) => a + b, 0);
        const info = document.getElementById('auto-calc');
        if (info) info.textContent = `合計: ${total}ポイント（推奨70）`;

        const mod = v => v - 10;
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        setVal('hp-normal-input',  vals.筋力   + vals.器用さ);
        setVal('hp-injured-input', vals.敏捷   + vals.生命力);
        setVal('hp-mp-input',      vals.知力   + vals.精神力);
        setVal('mod-melee',        mod(vals.筋力)    + mod(vals.敏捷));
        setVal('mod-ranged',       mod(vals.器用さ)  + mod(vals.知力));
        setVal('mod-resistance',   mod(vals.精神力)  + mod(vals.生命力));

        document.querySelectorAll('[name^="ab_"]').forEach(el2 => {
          const v = parseInt(el2.value) || 10;
          const small = el2.nextElementSibling;
          if (small?.tagName === 'SMALL') small.textContent = `修正:${v-10>=0?'+':''}${v-10}`;
        });
      });
    });

    const updateSkillPoints = () => {
      const total = SKILLS.reduce((sum, s) => sum + (parseInt(document.querySelector(`[name="skill_${s.name}"]`)?.value) || 0), 0);
      const count = SKILLS.filter(s => (parseInt(document.querySelector(`[name="skill_${s.name}"]`)?.value) || 0) > 0).length;
      const info = document.getElementById('skill-point-info');
      if (info) info.textContent = `${count}スキル選択中 / 合計${total}ポイント（推奨8スキル・80ポイント）`;
      document.querySelectorAll('#skill-tbody tr').forEach(row => {
        const input = row.querySelector('input[type=number]');
        const lastTd = row.cells[3];
        if (input && lastTd) {
          const v = parseInt(input.value) || 0;
          lastTd.textContent = v > 0 ? (50 + v) : '-';
        }
      });
    };
    document.querySelectorAll('[name^="skill_"]').forEach(el => el.addEventListener('input', updateSkillPoints));
    updateSkillPoints();
  }
};
