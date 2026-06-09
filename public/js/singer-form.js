// 歌姫シートフォームロジック
const SingerForm = {
  defaults() {
    return {
      name: '', origin: '', age: '', level: 1, rank: 1, bond_level: 1,
      abilities: { 筋力: 10, 器用さ: 10, 敏捷: 10, 生命力: 10, 知力: 10, 精神力: 10 },
      skills: { 'アーカイア知識': 20, '歌術知識': 15, '蟲知識': 15, '回避': 10, '隠蔽': 5, '料理': 5 },
      hp: { normal: 0, injured: 0 },
      modifiers: { melee: 0, ranged: 0, evasion: 0, resistance: 0, defense: 0 },
      gauges: {
        '肉体': { cost: 9, gain: 9, boxes: 3 },
        '気力': { cost: 9, gain: 9, boxes: 3 },
        '絆':   { cost: 9, gain: 11, boxes: 3 },
      },
      ng_actions: '',
      abilities_memo: '',
      songs: '',
      notes: '',
    };
  },

  calcGaugeCost(physMod, mentalMod) {
    const tbl = [
      [-7, 6], [-4, 7], [-1, 8], [2, 9], [5, 10], [8, 11], [11, 12]
    ];
    for (const [max, val] of tbl) {
      if (physMod <= max) return val;
    }
    return 13;
  },

  renderForm(data = null) {
    const d = data ? { ...this.defaults(), ...data } : this.defaults();
    const ab = d.abilities;

    const abilityInputs = ABILITY_NAMES.map(name => `
      <div class="form-group">
        <label>${name}</label>
        <input type="number" min="2" max="20" name="sab_${name}" value="${ab[name] || 10}">
        <small style="color:var(--text-dim)">修正:${(ab[name]||10)-10>=0?'+':''}${(ab[name]||10)-10}</small>
      </div>`).join('');

    const allSingerSkills = [...SINGER_SKILLS];
    // 重複除外
    const seen = new Set();
    const uniqueSkills = allSingerSkills.filter(s => !seen.has(s.id) && seen.add(s.id));

    const skillRows = uniqueSkills.map(s => {
      const val = d.skills[s.name] || 0;
      return `<tr>
        <td>${s.name}</td>
        <td style="color:var(--text-dim);font-size:.75rem">${s.category}</td>
        <td><input type="number" min="0" max="99" name="sskill_${s.name}" value="${val}" style="width:70px"></td>
        <td style="color:var(--text-dim);font-size:.8rem">${val > 0 ? 50 + val : '-'}</td>
      </tr>`;
    }).join('');

    const gauges = d.gauges || this.defaults().gauges;

    return `
      <form id="singer-form" onsubmit="return false">
        <div class="form-section">
          <h4>基本情報</h4>
          <div class="form-row">
            <div class="form-group"><label>歌姫名 *</label><input name="sname" value="${d.name}" required></div>
            <div class="form-group"><label>年齢</label><input name="sage" value="${d.age}"></div>
            <div class="form-group"><label>出身国</label><input name="sorigin" value="${d.origin}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>歌姫レベル</label><input type="number" min="1" max="10" name="slevel" value="${d.level}"></div>
            <div class="form-group"><label>階位</label><input type="number" min="1" max="12" name="srank" value="${d.rank}"></div>
            <div class="form-group"><label>絆レベル</label><input type="number" min="1" max="6" name="sbond" value="${d.bond_level}"></div>
          </div>
        </div>

        <div class="form-section">
          <h4>能力値</h4>
          <div class="form-row" id="singer-ability-inputs">${abilityInputs}</div>
        </div>

        <div class="form-section">
          <h4>HP</h4>
          <div class="form-row">
            <div class="form-group"><label>通常HP</label><input type="number" name="shp_normal" value="${d.hp.normal}" id="shp-normal"></div>
            <div class="form-group"><label>負傷HP</label><input type="number" name="shp_injured" value="${d.hp.injured}" id="shp-injured"></div>
          </div>
        </div>

        <div class="form-section">
          <h4>戦闘修正</h4>
          <div class="form-row">
            <div class="form-group"><label>白兵修正</label><input type="number" name="smod_melee" value="${d.modifiers.melee}" id="smod-melee"></div>
            <div class="form-group"><label>射撃修正</label><input type="number" name="smod_ranged" value="${d.modifiers.ranged}" id="smod-ranged"></div>
            <div class="form-group"><label>回避修正</label><input type="number" name="smod_evasion" value="${d.modifiers.evasion}" id="smod-evasion"></div>
            <div class="form-group"><label>抵抗修正</label><input type="number" name="smod_resistance" value="${d.modifiers.resistance}" id="smod-resistance"></div>
            <div class="form-group"><label>防御値</label><input type="number" name="smod_defense" value="${d.modifiers.defense}"></div>
          </div>
        </div>

        <div class="form-section">
          <h4>消耗ゲージ</h4>
          <div class="form-row">
            ${['肉体','気力','絆'].map(g => `
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:.75rem">
              <strong style="color:var(--accent2)">${g}ゲージ</strong>
              <div class="form-group" style="margin-top:.5rem"><label>消耗値</label>
                <input type="number" min="1" max="20" name="gauge_${g}_cost" value="${gauges[g]?.cost || 9}" ${g==='絆'?'readonly':''}>
              </div>
              <div class="form-group"><label>獲得値</label>
                <input type="number" min="1" max="20" name="gauge_${g}_gain" value="${gauges[g]?.gain || (g==='絆'?11:9)}" ${g==='絆'?'readonly':''}>
              </div>
              <div class="form-group"><label>ゲージ数</label>
                <input type="number" min="1" max="10" name="gauge_${g}_boxes" value="${gauges[g]?.boxes || 3}">
              </div>
            </div>`).join('')}
          </div>
        </div>

        <div class="form-section">
          <h4>スキル</h4>
          <table class="skill-table">
            <thead><tr><th>スキル名</th><th>分類</th><th>スキル値</th><th>成功値</th></tr></thead>
            <tbody id="singer-skill-tbody">${skillRows}</tbody>
          </table>
        </div>

        <div class="form-section">
          <h4>歌姫能力・歌術</h4>
          <div class="form-group"><label>歌姫能力一覧</label><textarea name="sabilities_memo" rows="5" placeholder="取得した歌姫能力を記入（例：スキルアップ、特殊起動:パワーモード など）...">${d.abilities_memo || ''}</textarea></div>
          <div class="form-group"><label>歌術一覧</label><textarea name="ssongs" rows="4" placeholder="習得した歌術とランクを記入（例：癒しの歌R2、奏甲戦闘補助の歌R1 など）...">${d.songs || ''}</textarea></div>
        </div>

        <div class="form-section">
          <h4>NG行動・メモ</h4>
          <div class="form-group"><label>NG行動（選択分）</label><textarea name="sng_actions" rows="3" placeholder="設定したNG行動を記入...">${d.ng_actions || ''}</textarea></div>
          <div class="form-group"><label>メモ</label><textarea name="snotes" rows="3">${d.notes || ''}</textarea></div>
        </div>
      </form>`;
  },

  collectForm() {
    const f = document.getElementById('singer-form');
    if (!f) return null;
    const g = n => f.querySelector(`[name="${n}"]`)?.value || '';
    const gi = n => parseInt(g(n)) || 0;

    const abilities = {};
    for (const name of ABILITY_NAMES) abilities[name] = gi(`sab_${name}`);

    const skills = {};
    const seen = new Set();
    const uniqueSkills = [...SINGER_SKILLS].filter(s => !seen.has(s.id) && seen.add(s.id));
    for (const s of uniqueSkills) {
      const v = gi(`sskill_${s.name}`);
      if (v > 0) skills[s.name] = v;
    }

    const gauges = {};
    for (const name of ['肉体','気力','絆']) {
      gauges[name] = {
        cost:  gi(`gauge_${name}_cost`),
        gain:  gi(`gauge_${name}_gain`),
        boxes: gi(`gauge_${name}_boxes`),
      };
    }

    return {
      name: g('sname'), origin: g('sorigin'), age: g('sage'),
      level: gi('slevel'), rank: gi('srank'), bond_level: gi('sbond'),
      abilities, skills, gauges,
      hp: { normal: gi('shp_normal'), injured: gi('shp_injured') },
      modifiers: {
        melee: gi('smod_melee'), ranged: gi('smod_ranged'),
        evasion: gi('smod_evasion'), resistance: gi('smod_resistance'),
        defense: gi('smod_defense'),
      },
      abilities_memo: g('sabilities_memo'),
      songs:     g('ssongs'),
      ng_actions: g('sng_actions'),
      notes:     g('snotes'),
    };
  },

  attachAutoCalc() {
    const updateAll = () => {
      const vals = {};
      for (const name of ABILITY_NAMES) {
        vals[name] = parseInt(document.querySelector(`[name="sab_${name}"]`)?.value) || 10;
      }
      const mod = v => v - 10;

      const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      setVal('shp-normal',  vals.筋力  + vals.器用さ);
      setVal('shp-injured', vals.敏捷  + vals.生命力);
      setVal('smod-melee',  mod(vals.筋力) + mod(vals.敏捷));
      setVal('smod-ranged', mod(vals.器用さ) + mod(vals.知力));
      setVal('smod-resistance', mod(vals.精神力) + mod(vals.生命力));

      // ゲージ消耗値自動計算（肉体・気力）
      const physMod = mod(vals.筋力) + mod(vals.生命力);
      const menMod  = mod(vals.精神力) + mod(vals.知力);
      const costTbl = v => {
        if (v <= -7) return 6;
        if (v <= -4) return 7;
        if (v <= -1) return 8;
        if (v <= 2)  return 9;
        if (v <= 5)  return 10;
        if (v <= 8)  return 11;
        if (v <= 11) return 12;
        return 13;
      };
      const physCostEl = document.querySelector('[name="gauge_肉体_cost"]');
      const menCostEl  = document.querySelector('[name="gauge_気力_cost"]');
      if (physCostEl) physCostEl.value = costTbl(physMod);
      if (menCostEl)  menCostEl.value  = costTbl(menMod);

      // small修正更新
      document.querySelectorAll('[name^="sab_"]').forEach(el => {
        const v = parseInt(el.value) || 10;
        const small = el.nextElementSibling;
        if (small?.tagName === 'SMALL') small.textContent = `修正:${v-10>=0?'+':''}${v-10}`;
      });

      // スキル成功値更新
      document.querySelectorAll('#singer-skill-tbody tr').forEach(row => {
        const input = row.querySelector('input[type=number]');
        const lastTd = row.cells[3];
        if (input && lastTd) {
          const v = parseInt(input.value) || 0;
          lastTd.textContent = v > 0 ? (50 + v) : '-';
        }
      });
    };

    document.querySelectorAll('[name^="sab_"]').forEach(el => el.addEventListener('input', updateAll));
    document.querySelectorAll('[name^="sskill_"]').forEach(el => el.addEventListener('input', updateAll));
    updateAll();
  }
};
