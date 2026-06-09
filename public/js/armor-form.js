// 奏甲シートフォームロジック
const ArmorForm = {
  defaults() {
    return {
      name: '', model: '', tl: 1, workshop: '',
      hero_melee: 0, hero_ranged: 0, hero_evasion: 0, hero_resistance: 0,
      armor_melee: 0, armor_ranged: 0, armor_evasion: 0, armor_resistance: 0, armor_recon: 0,
      armor_damage_mod: 0,
      final_melee: 0, final_ranged: 0, final_evasion: 0, final_resistance: 0, final_recon: 0,
      defense: 0,
      hp: { small: 0, medium: 0, large: 0 },
      weapons: [],
      special_rules: '',
      notes: '',
    };
  },

  renderForm(data = null) {
    const d = data ? { ...this.defaults(), ...data } : this.defaults();

    const weaponRows = (d.weapons || []).map((w, i) => `
      <tr data-wi="${i}">
        <td><input name="awn" value="${w.name||''}" placeholder="武器名"></td>
        <td><input name="awbh" value="${w.baseHit||''}" placeholder="30" style="width:50px"></td>
        <td><input name="awmod" value="${w.combatMod||''}" placeholder="±0" style="width:50px"></td>
        <td><input name="awsk" value="${w.skill||''}" placeholder="剣技" style="width:60px"></td>
        <td><input name="awskv" value="${w.skillVal||''}" placeholder="20" style="width:50px"></td>
        <td style="background:rgba(233,69,96,.1);font-weight:bold" class="final-hit">-</td>
        <td><input name="awd" value="${w.damage||''}" placeholder="2D10+6"></td>
        <td><input name="awr" value="${w.range||'白'}" style="width:40px"></td>
        <td><input name="awct" value="${w.count||'1'}" style="width:40px"></td>
        <td><input name="awcond" value="${w.condition||''}" placeholder="歌5"></td>
        <td><input name="awwt" value="${w.weight||''}" style="width:40px"></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="ArmorForm.removeWeapon(${i})">×</button></td>
      </tr>`).join('');

    return `
      <form id="armor-form" onsubmit="return false">
        <div class="form-section">
          <h4>基本情報</h4>
          <div class="form-row">
            <div class="form-group"><label>奏甲名称（愛称） *</label><input name="aname" value="${d.name}" required></div>
            <div class="form-group"><label>機体名（型式）</label><input name="amodel" value="${d.model}" placeholder="シャルラッハロートII"></div>
            <div class="form-group"><label>TL</label><input type="number" min="0" max="6" name="atl" value="${d.tl}"></div>
            <div class="form-group"><label>工房</label><input name="aworkshop" value="${d.workshop}" placeholder="一般"></div>
          </div>
        </div>

        <div class="form-section">
          <h4>戦闘修正（英雄の値 + 奏甲修正 = 最終値）</h4>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.85rem">
              <thead>
                <tr>
                  <th style="padding:.4rem;border:1px solid var(--border);background:var(--bg)">項目</th>
                  <th style="padding:.4rem;border:1px solid var(--border);background:var(--bg)">英雄の値</th>
                  <th style="padding:.4rem;border:1px solid var(--border);background:var(--bg)">奏甲修正</th>
                  <th style="padding:.4rem;border:1px solid var(--border);background:rgba(233,69,96,.1)">最終値</th>
                </tr>
              </thead>
              <tbody>
                ${['melee:白兵', 'ranged:射撃', 'evasion:回避', 'resistance:抵抗', 'recon:偵察'].map(pair => {
                  const [key, label] = pair.split(':');
                  return `<tr>
                    <td style="padding:.4rem;border:1px solid var(--border)">${label}</td>
                    <td style="border:1px solid var(--border);padding:.2rem .4rem">
                      <input type="number" name="hero_${key}" value="${d['hero_'+key]||0}" style="width:80px" class="armor-calc-input">
                    </td>
                    <td style="border:1px solid var(--border);padding:.2rem .4rem">
                      <input type="number" name="armor_${key}" value="${d['armor_'+key]||0}" style="width:80px" class="armor-calc-input">
                    </td>
                    <td style="border:1px solid var(--border);padding:.4rem;background:rgba(233,69,96,.05);font-weight:bold;text-align:center" id="final_${key}">
                      ${(d['hero_'+key]||0)+(d['armor_'+key]||0)}
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="form-row" style="margin-top:.75rem">
            <div class="form-group"><label>ダメージ修正</label><input type="number" name="armor_damage_mod" value="${d.armor_damage_mod||0}"></div>
            <div class="form-group"><label>防御値</label><input type="number" name="adefense" value="${d.defense||0}"></div>
          </div>
        </div>

        <div class="form-section">
          <h4>奏甲HP</h4>
          <div class="form-row">
            <div class="form-group"><label>小破HP</label><input type="number" name="ahp_small" value="${d.hp.small}"></div>
            <div class="form-group"><label>中破HP</label><input type="number" name="ahp_medium" value="${d.hp.medium}"></div>
            <div class="form-group"><label>大破HP</label><input type="number" name="ahp_large" value="${d.hp.large}"></div>
          </div>
          <small style="color:var(--text-dim)">小破0→装備1つ破壊 / 中破0→乗員ダメージ / 大破0→機体破壊</small>
        </div>

        <div class="form-section">
          <h4>搭載武器</h4>
          <div style="overflow-x:auto">
            <table class="weapon-table" style="min-width:700px">
              <thead>
                <tr>
                  <th>武器名</th><th>基本命中</th><th>戦闘修正</th><th>武器スキル</th>
                  <th>スキル値</th><th style="background:rgba(233,69,96,.1)">最終命中</th>
                  <th>ダメージ</th><th>射程</th><th>回数</th><th>条件</th><th>重さ</th><th></th>
                </tr>
              </thead>
              <tbody id="armor-weapon-tbody">${weaponRows}</tbody>
            </table>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-top:.5rem" onclick="ArmorForm.addWeapon()">＋ 武器を追加</button>
          <small style="color:var(--text-dim);display:block;margin-top:.3rem">最終命中 = 基本命中 + 戦闘修正 + スキル値</small>
        </div>

        <div class="form-section">
          <h4>特殊ルール・メモ</h4>
          <div class="form-group"><label>特殊ルール</label><textarea name="aspecial" rows="4" placeholder="機体固有の特殊能力・ルールを記入...">${d.special_rules||''}</textarea></div>
          <div class="form-group"><label>メモ</label><textarea name="anotes" rows="3">${d.notes||''}</textarea></div>
        </div>
      </form>`;
  },

  collectForm() {
    const f = document.getElementById('armor-form');
    if (!f) return null;
    const g = n => f.querySelector(`[name="${n}"]`)?.value || '';
    const gi = n => parseInt(g(n)) || 0;

    const weapons = [];
    for (const row of f.querySelectorAll('#armor-weapon-tbody tr')) {
      const name = row.querySelector('[name=awn]')?.value?.trim();
      if (!name) continue;
      const baseHit   = parseInt(row.querySelector('[name=awbh]')?.value) || 0;
      const combatMod = parseInt(row.querySelector('[name=awmod]')?.value) || 0;
      const skillVal  = parseInt(row.querySelector('[name=awskv]')?.value) || 0;
      weapons.push({
        name,
        baseHit,
        combatMod,
        skill:    row.querySelector('[name=awsk]')?.value || '',
        skillVal,
        finalHit: baseHit + combatMod + skillVal,
        damage:   row.querySelector('[name=awd]')?.value || '',
        range:    row.querySelector('[name=awr]')?.value || '白',
        count:    row.querySelector('[name=awct]')?.value || '1',
        condition:row.querySelector('[name=awcond]')?.value || '',
        weight:   parseInt(row.querySelector('[name=awwt]')?.value) || 0,
      });
    }

    return {
      name: g('aname'), model: g('amodel'), tl: gi('atl'), workshop: g('aworkshop'),
      hero_melee:      gi('hero_melee'),
      hero_ranged:     gi('hero_ranged'),
      hero_evasion:    gi('hero_evasion'),
      hero_resistance: gi('hero_resistance'),
      hero_recon:      gi('hero_recon'),
      armor_melee:      gi('armor_melee'),
      armor_ranged:     gi('armor_ranged'),
      armor_evasion:    gi('armor_evasion'),
      armor_resistance: gi('armor_resistance'),
      armor_recon:      gi('armor_recon'),
      armor_damage_mod: gi('armor_damage_mod'),
      defense: gi('adefense'),
      hp: { small: gi('ahp_small'), medium: gi('ahp_medium'), large: gi('ahp_large') },
      weapons,
      special_rules: g('aspecial'),
      notes: g('anotes'),
    };
  },

  addWeapon() {
    const tbody = document.getElementById('armor-weapon-tbody');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.wi = i;
    tr.innerHTML = `
      <td><input name="awn" placeholder="武器名"></td>
      <td><input name="awbh" placeholder="30" style="width:50px" class="armor-weapon-calc"></td>
      <td><input name="awmod" placeholder="±0" style="width:50px" class="armor-weapon-calc"></td>
      <td><input name="awsk" placeholder="剣技" style="width:60px"></td>
      <td><input name="awskv" placeholder="20" style="width:50px" class="armor-weapon-calc"></td>
      <td style="background:rgba(233,69,96,.1);font-weight:bold;text-align:center;padding:.2rem .4rem" class="final-hit">-</td>
      <td><input name="awd" placeholder="2D10+6"></td>
      <td><input name="awr" value="白" style="width:40px"></td>
      <td><input name="awct" value="1" style="width:40px"></td>
      <td><input name="awcond" placeholder="歌5"></td>
      <td><input name="awwt" style="width:40px"></td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="ArmorForm.removeWeapon(${i})">×</button></td>`;
    tbody.appendChild(tr);
    ArmorForm.attachWeaponCalc(tr);
  },

  removeWeapon(i) {
    const rows = document.querySelectorAll('#armor-weapon-tbody tr');
    if (rows[i]) rows[i].remove();
  },

  attachWeaponCalc(rowEl) {
    const row = rowEl || document;
    const inputs = row.querySelectorAll ? row.querySelectorAll('.armor-weapon-calc') : document.querySelectorAll('#armor-weapon-tbody .armor-weapon-calc');
    inputs.forEach(el => {
      el.addEventListener('input', () => {
        const tr = el.closest('tr');
        if (!tr) return;
        const bh  = parseInt(tr.querySelector('[name=awbh]')?.value) || 0;
        const mod = parseInt(tr.querySelector('[name=awmod]')?.value) || 0;
        const skv = parseInt(tr.querySelector('[name=awskv]')?.value) || 0;
        const finalTd = tr.querySelector('.final-hit');
        if (finalTd) finalTd.textContent = bh + mod + skv;
      });
    });
  },

  attachAutoCalc() {
    // 戦闘修正の合計を自動計算
    const keys = ['melee', 'ranged', 'evasion', 'resistance', 'recon'];
    keys.forEach(key => {
      const heroEl  = document.querySelector(`[name="hero_${key}"]`);
      const armorEl = document.querySelector(`[name="armor_${key}"]`);
      const update = () => {
        const h = parseInt(heroEl?.value) || 0;
        const a = parseInt(armorEl?.value) || 0;
        const td = document.getElementById(`final_${key}`);
        if (td) td.textContent = h + a;
      };
      heroEl?.addEventListener('input', update);
      armorEl?.addEventListener('input', update);
    });

    // 武器の最終命中
    this.attachWeaponCalc();
    document.querySelectorAll('#armor-weapon-tbody tr').forEach(tr => this.attachWeaponCalc(tr));
  }
};
