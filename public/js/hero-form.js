// 英雄シートフォームロジック
const HeroForm = {
  // デフォルトデータ
  defaults() {
    return {
      name: '', nationality: '', job: '', age: '', gender: '男性', level: 1,
      abilities: { 筋力: 10, 器用さ: 10, 敏捷: 10, 生命力: 10, 知力: 10, 精神力: 10 },
      skills: {},
      hp: { normal: 0, injured: 0, mp: 0 },
      modifiers: { melee: 0, ranged: 0, evasion: 0, resistance: 0, defense: 0, damage: 0 },
      weapons: [],
      equipment: '',
      abilities_memo: '',
      notes: '',
    };
  },

  // 修正値を計算して反映
  calcModifiers(data) {
    const a = data.abilities;
    const mod = v => v - 10;
    data.modifiers.melee   = mod(a.筋力) + mod(a.敏捷);
    data.modifiers.ranged  = mod(a.器用さ) + mod(a.知力);
    data.modifiers.resistance = mod(a.精神力) + mod(a.生命力);
    data.hp.normal  = (a.筋力 || 0) + (a.器用さ || 0);
    data.hp.injured = (a.敏捷 || 0) + (a.生命力 || 0);
    data.hp.mp      = (a.知力 || 0) + (a.精神力 || 0);
    return data;
  },

  // フォームHTML生成
  renderForm(data = null) {
    const d = data ? { ...this.defaults(), ...data } : this.defaults();
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
          <table class="weapon-table">
            <thead><tr><th>武器名</th><th>命中値</th><th>スキル</th><th>ダメージ</th><th>射程</th><th></th></tr></thead>
            <tbody id="weapon-tbody">${weaponRows}</tbody>
          </table>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-top:.5rem" onclick="HeroForm.addWeapon()">＋ 武器を追加</button>
        </div>

        <div class="form-section">
          <h4>英雄能力・備考</h4>
          <div class="form-group"><label>英雄能力一覧</label><textarea name="abilities_memo" rows="4" placeholder="取得した英雄能力を記入...">${d.abilities_memo || ''}</textarea></div>
          <div class="form-group"><label>装備品</label><textarea name="equipment" rows="2" placeholder="所持装備・アイテム...">${d.equipment || ''}</textarea></div>
          <div class="form-group"><label>メモ</label><textarea name="notes" rows="3" placeholder="自由メモ...">${d.notes || ''}</textarea></div>
        </div>
      </form>`;
  },

  // フォームからデータ収集
  collectForm() {
    const f = document.getElementById('hero-form');
    if (!f) return null;
    const g = n => f.querySelector(`[name="${n}"]`)?.value || '';
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

    return {
      name: g('name'), nationality: g('nationality'), job: g('job'),
      age: g('age'), gender: g('gender'), level: gi('level'),
      abilities,
      skills,
      hp: { normal: gi('hp_normal'), injured: gi('hp_injured'), mp: gi('hp_mp') },
      modifiers: {
        melee: gi('mod_melee'), ranged: gi('mod_ranged'),
        evasion: gi('mod_evasion'), resistance: gi('mod_resistance'),
        defense: gi('mod_defense'), damage: gi('mod_damage'),
      },
      weapons,
      equipment:      g('equipment'),
      abilities_memo: g('abilities_memo'),
      notes:          g('notes'),
    };
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

  // 能力値変更時に自動計算
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
        setVal('mod-melee',        mod(vals.筋力)   + mod(vals.敏捷));
        setVal('mod-ranged',       mod(vals.器用さ)  + mod(vals.知力));
        setVal('mod-resistance',   mod(vals.精神力) + mod(vals.生命力));

        // small修正表示更新
        document.querySelectorAll('[name^="ab_"]').forEach(el2 => {
          const v = parseInt(el2.value) || 10;
          const small = el2.nextElementSibling;
          if (small?.tagName === 'SMALL') small.textContent = `修正:${v-10>=0?'+':''}${v-10}`;
        });
      });
    });

    // スキルポイント合計
    const updateSkillPoints = () => {
      const total = SKILLS.reduce((sum, s) => {
        return sum + (parseInt(document.querySelector(`[name="skill_${s.name}"]`)?.value) || 0);
      }, 0);
      const count = SKILLS.filter(s => (parseInt(document.querySelector(`[name="skill_${s.name}"]`)?.value) || 0) > 0).length;
      const info = document.getElementById('skill-point-info');
      if (info) info.textContent = `${count}スキル選択中 / 合計${total}ポイント（推奨8スキル・80ポイント）`;

      // 成功値更新
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
