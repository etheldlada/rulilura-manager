// 奏甲シートフォームロジック

// 移動属性の選択肢
const MOVE_TYPES = ['地上（通常）', '地上（不整地）', '地上（浮遊）', '飛行', '水中', '水中/地上（通常）', '水中/地上（不整地）', '飛行/地上（通常）'];
// 武装タイプの選択肢
const WEAPON_TYPES = ['A', 'C', 'G', 'H', 'L', 'M', 'S'];

const ArmorForm = {
  // 搭乗ペアの選択肢（編集画面表示前にApp._renderEditPageから設定される）
  _pilotHeroes: [],
  _pilotSingers: [],
  setPilotOptions(heroes, singers) {
    this._pilotHeroes  = heroes  || [];
    this._pilotSingers = singers || [];
  },

  // 「奏甲乗り」歌姫能力（カタログ番号26）を持つ歌姫のみを搭乗候補として返す
  _eligibleSingers() {
    return this._pilotSingers.filter(s =>
      (s.data?.singer_abilities || []).some(a => a.no === 26)
    );
  },

  // 指定した搭乗者（type:'hero'|'singer', id）のスキル一覧を返す
  _skillsOf(type, id) {
    if (!type || !id) return {};
    if (type === 'hero') {
      return this._pilotHeroes.find(h => h.id === id)?.data?.skills || {};
    }
    return this._eligibleSingers().find(s => s.id === id)?.data?.skills || {};
  },

  // renderForm内（保存データdから）武器スキルのoptions HTMLを生成
  _skillOptionsHTMLForData(d, selectedSkill) {
    const skills = this._skillsOf(d.pilot_type, d.pilot_id);
    const names = Object.keys(skills);
    let html = '<option value="">-- スキル --</option>';
    html += names.map(sk => `<option value="${sk}" ${selectedSkill===sk?'selected':''}>${sk}</option>`).join('');
    if (selectedSkill && !names.includes(selectedSkill)) {
      html += `<option value="${selectedSkill}" selected>${selectedSkill}（手動）</option>`;
    }
    return html;
  },

  defaults() {
    return {
      name: '', model: '', tl: 1, workshop: '',
      pilot_type: '', // 搭乗者の種別（'hero' または 'singer'。空文字は未選択）
      pilot_id: '',   // 搭乗者のID（自分の英雄一覧 or 奏甲乗り歌姫一覧から選択）
      hero_melee: 0, hero_ranged: 0, hero_evasion: 0, hero_resistance: 0, hero_recon: 0,
      armor_melee: 0, armor_ranged: 0, armor_evasion: 0, armor_resistance: 0, armor_recon: 0,
      armor_damage_mod: 0,
      defense: 0,
      hp: { small: 0, medium: 0, large: 0 },
      use_location_hp: false,
      weapons: [],
      special_rules: '',
      notes: '',
      // 上級ルール項目
      adv: {
        move_normal: '',   // 通常移動速度（例: "3/1"）
        move_combat: '',   // 戦闘移動速度
        move_type: '地上（通常）',
        max_load: 0,       // 最大荷重
        used_load: 0,      // 使用荷重（自動計算）
        weapon_types: [],  // 武装タイプ（A/C/G/H/L/M/S）
        hardpoints: '',    // ハードポイント（例: "手×2、肩×2、胴"）
        price_g: '',       // 価格（G）
        price_fp: '',      // 価格（FP）
        maintain_g: '',    // 維持費（G/シナリオ）
        maintain_fp: '',   // 維持費（FP）
        hit_locations: [], // 命中部位表 [{range, part, defense, hp, effect}]
      },
    };
  },

  // 命中部位行HTML
  _hitLocRow(loc, i) {
    return `<tr data-li="${i}">
      <td><input name="hl_range" value="${loc.range||''}" placeholder="01〜54" style="width:80px"></td>
      <td><input name="hl_part"  value="${loc.part||''}"  placeholder="胴体" style="width:80px"></td>
      <td><input name="hl_def"   value="${loc.defense||''}" placeholder="6" style="width:50px" type="number" min="0"></td>
      <td><input name="hl_hp"    value="${loc.hp||''}"   placeholder="30" style="width:60px"></td>
      <td><input name="hl_eff"   value="${loc.effect||''}" placeholder="機体破壊" style="width:160px"></td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="ArmorForm.removeHitLoc(this)">×</button></td>
    </tr>`;
  },

  renderForm(data = null) {
    const d = data ? { ...this.defaults(), ...data } : this.defaults();
    // advが未定義の場合（旧データ互換）
    if (!d.adv) d.adv = this.defaults().adv;
    const adv = d.adv;

    const weaponRows = (d.weapons || []).map((w, i) => `
      <tr data-wi="${i}">
        <td><input name="awn"   value="${w.name||''}"       placeholder="武器名" style="min-width:90px"></td>
        <td>
          <select name="awr" class="armor-weapon-range" style="width:55px">
            <option value="-" ${w.range==='-'?'selected':''}>-</option>
            <option value="白" ${(w.range||'白')==='白'?'selected':''}>白</option>
            <option value="1" ${w.range==='1'?'selected':''}>1</option>
            <option value="2" ${w.range==='2'?'selected':''}>2</option>
            <option value="3" ${w.range==='3'?'selected':''}>3</option>
            <option value="4" ${w.range==='4'?'selected':''}>4</option>
          </select>
        </td>
        <td><input name="awbh"  value="${w.baseHit||''}"    placeholder="30"   style="width:50px" type="number" class="armor-weapon-calc"></td>
        <td><input name="awmod" value="${w.combatMod||0}"   style="width:50px" type="number" class="armor-weapon-mod" readonly title="射程「白」なら白兵修正、それ以外は射撃修正を自動入力"></td>
        <td>
          <select name="awsk" class="armor-weapon-skill" style="width:90px">
            ${this._skillOptionsHTMLForData(d, w.skill)}
          </select>
        </td>
        <td><input name="awskv" value="${w.skillVal||''}"   placeholder="20"   style="width:50px" type="number" class="armor-weapon-skillval" readonly title="搭乗英雄のスキル値を自動取得"></td>
        <td style="background:rgba(233,69,96,.1);font-weight:bold;text-align:center;padding:.2rem .4rem;min-width:50px" class="final-hit">${(w.baseHit||0)+(w.combatMod||0)+(w.skillVal||0)||'-'}</td>
        <td><input name="awd"   value="${w.damage||''}"     placeholder="2D10+6" style="min-width:80px"></td>
        <td><input name="awct"  value="${w.count||'1'}"     style="width:40px"></td>
        <td><input name="awcond" value="${w.condition||''}" placeholder="歌5"   style="width:55px"></td>
        <td><input name="awwt"  value="${w.weight||''}"     style="width:45px" type="number" class="armor-weapon-weight"></td>
        <td><input name="awhp"  value="${(w.hardpoint||'').replace(/"/g,'&quot;')}" placeholder="手・肩×2など" style="width:90px"></td>
        <td><input name="awmemo" value="${(w.memo||'').replace(/"/g,'&quot;')}" placeholder="メモ" style="min-width:100px"></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="ArmorForm.removeWeapon(this)">×</button></td>
      </tr>`).join('');

    const hitLocRows = (adv.hit_locations || []).map((loc, i) => this._hitLocRow(loc, i)).join('');

    const wtypeChecks = WEAPON_TYPES.map(t => `
      <label style="display:inline-flex;align-items:center;gap:.25rem;margin-right:.5rem;font-size:.85rem;cursor:pointer">
        <input type="checkbox" name="adv_wtype" value="${t}" ${(adv.weapon_types||[]).includes(t)?'checked':''}> ${t}
      </label>`).join('');

    return `
      <form id="armor-form" onsubmit="return false">

        <!-- ===== 基本情報 ===== -->
        <div class="form-section">
          <h4>基本情報</h4>
          <div class="form-row">
            <div class="form-group"><label>奏甲名称（愛称） *</label><input name="aname" value="${d.name}" required></div>
            <div class="form-group"><label>機体名（型式）</label><input name="amodel" value="${d.model}" placeholder="シャルラッハロートII"></div>
            <div class="form-group"><label>TL</label><input type="number" min="0" max="6" name="atl" value="${d.tl}"></div>
            <div class="form-group"><label>工房</label><input name="aworkshop" value="${d.workshop}" placeholder="一般"></div>
          </div>
        </div>

        <!-- ===== 搭乗者 ===== -->
        <div class="form-section">
          <h4>搭乗者</h4>
          <p style="font-size:.8rem;color:var(--text-dim);margin-bottom:.5rem">奏甲に搭乗するのは英雄、または「奏甲乗り」歌姫能力を持つ歌姫のいずれか一人です。選択すると「英雄の値」（戦闘修正）と搭載武器のスキル値が自動的に取得されます。</p>
          <div class="form-group">
            <label>搭乗者</label>
            <select name="pilot_key" id="pilot-select">
              <option value="">-- 選択しない（手動入力） --</option>
              ${this._pilotHeroes.length ? `<optgroup label="英雄">
                ${this._pilotHeroes.map(h => `<option value="hero:${h.id}" ${d.pilot_type==='hero'&&d.pilot_id===h.id?'selected':''}>${h.data?.name||'(無名)'}</option>`).join('')}
              </optgroup>` : ''}
              ${this._eligibleSingers().length ? `<optgroup label="歌姫（奏甲乗り）">
                ${this._eligibleSingers().map(s => `<option value="singer:${s.id}" ${d.pilot_type==='singer'&&d.pilot_id===s.id?'selected':''}>${s.data?.name||'(無名)'}</option>`).join('')}
              </optgroup>` : ''}
            </select>
            ${(this._pilotSingers.length && !this._eligibleSingers().length) ? `<small style="color:var(--text-dim);display:block;margin-top:.3rem">※歌姫一覧はありますが、「奏甲乗り」歌姫能力（26番）を持つ歌姫がいないため選択肢に表示されません。</small>` : ''}
          </div>
        </div>

        <!-- ===== 戦闘修正 ===== -->
        <div class="form-section">
          <h4>戦闘修正（英雄の値 + 奏甲修正 = 最終値）</h4>
          <p id="pilot-auto-note" style="font-size:.78rem;color:var(--accent2);margin-bottom:.4rem;display:none">搭乗英雄の値を自動入力しました。英雄側を編集した場合は再選択すると最新値を取得できます。</p>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.85rem">
              <thead><tr>
                <th style="padding:.4rem;border:1px solid var(--border);background:var(--bg)">項目</th>
                <th style="padding:.4rem;border:1px solid var(--border);background:var(--bg)">英雄の値</th>
                <th style="padding:.4rem;border:1px solid var(--border);background:var(--bg)">奏甲修正</th>
                <th style="padding:.4rem;border:1px solid var(--border);background:rgba(233,69,96,.1)">最終値</th>
              </tr></thead>
              <tbody>
                ${['melee:白兵','ranged:射撃','evasion:回避','resistance:抵抗','recon:偵察'].map(pair => {
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

        <!-- ===== 奏甲HP ===== -->
        <div class="form-section">
          <h4>奏甲HP</h4>
          <div class="form-row">
            <div class="form-group"><label>小破HP</label><input type="number" name="ahp_small"  value="${d.hp.small}"></div>
            <div class="form-group"><label>中破HP</label><input type="number" name="ahp_medium" value="${d.hp.medium}"></div>
            <div class="form-group"><label>大破HP</label><input type="number" name="ahp_large"  value="${d.hp.large}"></div>
          </div>
          <small style="color:var(--text-dim)">小破0→装備1つ破壊 / 中破0→乗員ダメージ / 大破0→機体破壊</small>
          <label style="display:flex;align-items:center;gap:.4rem;margin-top:.5rem;font-size:.82rem;cursor:pointer">
            <input type="checkbox" name="use_location_hp" ${d.use_location_hp ? 'checked' : ''}>
            部位HP（上級ルール）をccfoliaに出力する
          </label>
        </div>

        <!-- ===== 搭載武器 ===== -->
        <div class="form-section">
          <h4>搭載武器</h4>
          <div style="overflow-x:auto">
            <table class="weapon-table" style="min-width:900px">
              <thead><tr>
                <th>武器名</th><th>射程</th><th>基本命中</th><th style="background:rgba(255,193,7,.12)">戦闘修正<br><small style="font-weight:normal">(自動)</small></th><th>武器スキル</th>
                <th>スキル値</th><th style="background:rgba(233,69,96,.1)">最終命中</th>
                <th>ダメージ</th><th>回数</th><th>条件</th><th>重さ</th><th>ハードポイント</th><th>メモ</th><th></th>
              </tr></thead>
              <tbody id="armor-weapon-tbody">${weaponRows}</tbody>
            </table>
          </div>
          <div style="display:flex;align-items:center;gap:.75rem;margin-top:.5rem;flex-wrap:wrap">
            <button type="button" class="btn btn-sm btn-secondary" onclick="ArmorForm.addWeapon()">＋ 武器を追加</button>
            <span style="font-size:.78rem;color:var(--text-dim)">最終命中 = 基本命中 + 戦闘修正 + スキル値（戦闘修正は射程「白」なら白兵修正・それ以外は射撃修正を自動入力）</span>
            <span style="font-size:.78rem;color:var(--accent2)">使用荷重合計: <strong id="used-load-display">0</strong> / 最大荷重: <strong id="max-load-display">${adv.max_load||0}</strong>（残り: <strong id="remain-load-display">${(adv.max_load||0) - (d.weapons||[]).reduce((s,w)=>s+(w.weight||0),0)}</strong>）</span>
          </div>
        </div>

        <!-- ===== 特殊ルール ===== -->
        <div class="form-section">
          <h4>特殊ルール・メモ</h4>
          <div class="form-group"><label>特殊ルール</label><textarea name="aspecial" rows="4" placeholder="機体固有の特殊能力・ルールを記入...">${d.special_rules||''}</textarea></div>
          <div class="form-group"><label>メモ</label><textarea name="anotes" rows="3">${d.notes||''}</textarea></div>
        </div>

        <!-- ===== 上級ルール ===== -->
        <div class="form-section" style="border-color:var(--accent2)">
          <h4 style="color:var(--accent2)">★ 上級ルール</h4>

          <div class="form-row">
            <div class="form-group">
              <label>通常移動速度</label>
              <input name="adv_move_normal" value="${adv.move_normal||''}" placeholder="3" style="width:80px">
              <small style="color:var(--text-dim)">通常時</small>
            </div>
            <div class="form-group">
              <label>戦闘移動速度</label>
              <input name="adv_move_combat" value="${adv.move_combat||''}" placeholder="1" style="width:80px">
              <small style="color:var(--text-dim)">戦闘時</small>
            </div>
            <div class="form-group">
              <label>移動属性</label>
              <select name="adv_move_type" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:.4rem .6rem;border-radius:var(--radius);font-size:.88rem">
                ${MOVE_TYPES.map(t=>`<option value="${t}" ${adv.move_type===t?'selected':''}>${t}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>最大荷重</label>
              <input type="number" min="0" name="adv_max_load" value="${adv.max_load||0}" id="adv-max-load" style="width:80px">
            </div>
            <div class="form-group">
              <label>使用荷重（自動計算）</label>
              <input type="number" min="0" name="adv_used_load" value="${adv.used_load||0}" id="adv-used-load" style="width:80px" readonly>
            </div>
            <div class="form-group">
              <label>残荷重</label>
              <input type="number" name="adv_remain_load" id="adv-remain-load" value="${(adv.max_load||0)-(adv.used_load||0)}" style="width:80px" readonly>
            </div>
          </div>

          <div class="form-group">
            <label>武装タイプ</label>
            <div style="display:flex;flex-wrap:wrap;gap:.25rem;padding:.4rem;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)">
              ${wtypeChecks}
            </div>
            <small style="color:var(--text-dim)">A=対空 C=通常 G=大型 H=隠密 L=長距離 M=多目的 S=小型</small>
          </div>

          <div class="form-group">
            <label>ハードポイント</label>
            <input name="adv_hardpoints" value="${adv.hardpoints||''}" placeholder="手×2、肩×2、胴×2、脚×4" style="width:100%">
          </div>

          <div class="form-row">
            <div class="form-group"><label>価格（G）</label><input name="adv_price_g" value="${adv.price_g||''}" placeholder="200万G"></div>
            <div class="form-group"><label>価格（FP）</label><input name="adv_price_fp" value="${adv.price_fp||''}" placeholder="100FP"></div>
            <div class="form-group"><label>維持費（G）</label><input name="adv_maintain_g" value="${adv.maintain_g||''}" placeholder="25万G/シナリオ"></div>
            <div class="form-group"><label>維持費（FP）</label><input name="adv_maintain_fp" value="${adv.maintain_fp||''}" placeholder="12FP"></div>
          </div>

          <!-- 命中部位表 -->
          <div style="margin-top:.75rem">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
              <strong style="font-size:.88rem">命中部位表</strong>
              <button type="button" class="btn btn-sm btn-secondary" onclick="ArmorForm.addHitLoc()">＋ 部位を追加</button>
            </div>
            <div style="overflow-x:auto">
              <table style="width:100%;border-collapse:collapse;font-size:.8rem;min-width:560px">
                <thead>
                  <tr>
                    <th style="padding:.3rem .4rem;border:1px solid var(--border);background:var(--bg)">D%範囲</th>
                    <th style="padding:.3rem .4rem;border:1px solid var(--border);background:var(--bg)">部位</th>
                    <th style="padding:.3rem .4rem;border:1px solid var(--border);background:var(--bg)">防御値</th>
                    <th style="padding:.3rem .4rem;border:1px solid var(--border);background:var(--bg)">HP</th>
                    <th style="padding:.3rem .4rem;border:1px solid var(--border);background:var(--bg)">0になった時の効果</th>
                    <th style="width:36px"></th>
                  </tr>
                </thead>
                <tbody id="hit-loc-tbody">${hitLocRows}</tbody>
              </table>
            </div>
            <button type="button" class="btn btn-sm btn-secondary" style="margin-top:.4rem" onclick="ArmorForm.addDefaultHitLocs()">デフォルト部位を一括追加</button>
            <small style="color:var(--text-dim);margin-left:.5rem">（胴体・右腕・左腕・脚・装備・コクピット・頭部の7部位）</small>
          </div>
        </div>

      </form>`;
  },

  collectForm() {
    const f = document.getElementById('armor-form');
    if (!f) return null;
    const g  = n => f.querySelector(`[name="${n}"]`)?.value || '';
    const gi = n => parseInt(g(n)) || 0;

    const weapons = [];
    for (const row of f.querySelectorAll('#armor-weapon-tbody tr')) {
      const name = row.querySelector('[name=awn]')?.value?.trim();
      if (!name) continue;
      const baseHit   = parseInt(row.querySelector('[name=awbh]')?.value)  || 0;
      const combatMod = parseInt(row.querySelector('[name=awmod]')?.value) || 0;
      const skillVal  = parseInt(row.querySelector('[name=awskv]')?.value) || 0;
      weapons.push({
        name, baseHit, combatMod,
        skill:    row.querySelector('[name=awsk]')?.value   || '',
        skillVal,
        finalHit: baseHit + combatMod + skillVal,
        damage:   row.querySelector('[name=awd]')?.value    || '',
        range:    row.querySelector('[name=awr]')?.value    || '白',
        count:    row.querySelector('[name=awct]')?.value   || '1',
        condition:row.querySelector('[name=awcond]')?.value || '',
        weight:   parseInt(row.querySelector('[name=awwt]')?.value) || 0,
        hardpoint:row.querySelector('[name=awhp]')?.value   || '',
        memo:     row.querySelector('[name=awmemo]')?.value || '',
      });
    }

    const weapon_types = [...f.querySelectorAll('[name=adv_wtype]:checked')].map(el => el.value);
    const usedLoad = weapons.reduce((s, w) => s + (w.weight || 0), 0);
    const maxLoad  = gi('adv_max_load');

    const hit_locations = [];
    for (const row of f.querySelectorAll('#hit-loc-tbody tr')) {
      const range  = row.querySelector('[name=hl_range]')?.value?.trim();
      if (!range) continue;
      hit_locations.push({
        range,
        part:    row.querySelector('[name=hl_part]')?.value?.trim()  || '',
        defense: parseInt(row.querySelector('[name=hl_def]')?.value) || 0,
        hp:      row.querySelector('[name=hl_hp]')?.value?.trim()    || '',
        effect:  row.querySelector('[name=hl_eff]')?.value?.trim()   || '',
      });
    }

    // 搭乗者選択（"hero:xxx" or "singer:xxx" 形式）をtype/idに分解する
    const pilotKey = g('pilot_key');
    const [pilotType, pilotId] = pilotKey ? pilotKey.split(':') : ['', ''];

    return {
      name: g('aname'), model: g('amodel'), tl: gi('atl'), workshop: g('aworkshop'),
      pilot_type: pilotType || '',
      pilot_id:   pilotId   || '',
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
      use_location_hp: !!f.querySelector('[name=use_location_hp]')?.checked,
      weapons,
      special_rules: g('aspecial'),
      notes: g('anotes'),
      adv: {
        move_normal:   g('adv_move_normal'),
        move_combat:   g('adv_move_combat'),
        move_type:     g('adv_move_type'),
        max_load:      maxLoad,
        used_load:     usedLoad,
        weapon_types,
        hardpoints:    g('adv_hardpoints'),
        price_g:       g('adv_price_g'),
        price_fp:      g('adv_price_fp'),
        maintain_g:    g('adv_maintain_g'),
        maintain_fp:   g('adv_maintain_fp'),
        hit_locations,
      },
    };
  },

  // 武器1行分の戦闘修正（白兵/射撃）を、現在の射程と最終白兵・最終射撃修正から自動算出してセットする
  _recalcWeaponCombatMod(tr) {
    if (!tr) return;
    const range = tr.querySelector('[name=awr]')?.value || '白';
    const finalMelee  = (parseInt(document.querySelector('[name="hero_melee"]')?.value)  || 0) + (parseInt(document.querySelector('[name="armor_melee"]')?.value)  || 0);
    const finalRanged = (parseInt(document.querySelector('[name="hero_ranged"]')?.value) || 0) + (parseInt(document.querySelector('[name="armor_ranged"]')?.value) || 0);
    const mod = (range === '-') ? 0 : (range === '白') ? finalMelee : finalRanged;

    const modInput = tr.querySelector('[name=awmod]');
    if (modInput) modInput.value = mod;

    const bh  = parseInt(tr.querySelector('[name=awbh]')?.value)  || 0;
    const skv = parseInt(tr.querySelector('[name=awskv]')?.value) || 0;
    const finalTd = tr.querySelector('.final-hit');
    if (finalTd) finalTd.textContent = bh + mod + skv;
  },

  // 全武器行の戦闘修正を再計算する（白兵修正・射撃修正の値が変わった時に呼ぶ）
  _recalcAllWeaponCombatMod() {
    document.querySelectorAll('#armor-weapon-tbody tr').forEach(tr => this._recalcWeaponCombatMod(tr));
  },

  // 現在フォーム上で選択中の搭乗者（英雄 or 奏甲乗り歌姫）のスキル一覧（{name: value}）を返す
  _currentPilotSkills() {
    const key = document.getElementById('pilot-select')?.value;
    if (!key) return {};
    const [type, id] = key.split(':');
    return this._skillsOf(type, id);
  },

  // スキルドロップダウンのoptions HTMLを生成（現在の選択値を保持）
  _skillOptionsHTML(selectedSkill) {
    const skills = this._currentPilotSkills();
    const names = Object.keys(skills);
    let html = '<option value="">-- スキル --</option>';
    html += names.map(sk => `<option value="${sk}" ${selectedSkill===sk?'selected':''}>${sk}</option>`).join('');
    if (selectedSkill && !names.includes(selectedSkill)) {
      html += `<option value="${selectedSkill}" selected>${selectedSkill}（手動）</option>`;
    }
    return html;
  },

  addWeapon() {
    const tbody = document.getElementById('armor-weapon-tbody');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.wi = i;
    tr.innerHTML = `
      <td><input name="awn" placeholder="武器名" style="min-width:90px"></td>
      <td>
        <select name="awr" class="armor-weapon-range" style="width:55px">
          <option value="-">-</option>
          <option value="白" selected>白</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </td>
      <td><input name="awbh"  placeholder="30"   style="width:50px" type="number" class="armor-weapon-calc"></td>
      <td><input name="awmod" value="0" style="width:50px" type="number" class="armor-weapon-mod" readonly title="射程「白」なら白兵修正、それ以外は射撃修正を自動入力"></td>
      <td><select name="awsk" class="armor-weapon-skill" style="width:90px">${this._skillOptionsHTML('')}</select></td>
      <td><input name="awskv" value="0" style="width:50px" type="number" class="armor-weapon-skillval" readonly title="搭乗英雄のスキル値を自動取得"></td>
      <td style="background:rgba(233,69,96,.1);font-weight:bold;text-align:center;padding:.2rem .4rem;min-width:50px" class="final-hit">-</td>
      <td><input name="awd"  placeholder="2D10+6" style="min-width:80px"></td>
      <td><input name="awct" value="1"  style="width:40px"></td>
      <td><input name="awcond" placeholder="歌5" style="width:55px"></td>
      <td><input name="awwt" style="width:45px" type="number" class="armor-weapon-weight"></td>
      <td><input name="awhp" placeholder="手・肩×2など" style="width:90px"></td>
      <td><input name="awmemo" placeholder="メモ" style="min-width:100px"></td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="ArmorForm.removeWeapon(this)">×</button></td>`;
    tbody.appendChild(tr);
    this._attachRowCalc(tr);
    this._recalcWeaponCombatMod(tr);
    this._updateLoadDisplay();
  },

  removeWeapon(btn) {
    btn.closest('tr')?.remove();
    this._updateLoadDisplay();
  },

  addHitLoc() {
    const tbody = document.getElementById('hit-loc-tbody');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.li = i;
    tr.innerHTML = this._hitLocRow({ range:'', part:'', defense:0, hp:'', effect:'' }, i);
    tbody.appendChild(tr);
  },

  removeHitLoc(btn) {
    btn.closest('tr')?.remove();
  },

  // デフォルト7部位を一括追加
  addDefaultHitLocs() {
    const defaults = [
      { range:'01〜54', part:'胴体',     defense:0, hp:'',      effect:'機体破壊' },
      { range:'55〜60', part:'右腕',     defense:0, hp:'',      effect:'右手装備不可' },
      { range:'61〜66', part:'左腕',     defense:0, hp:'',      effect:'左手装備不可' },
      { range:'67〜79', part:'脚',       defense:0, hp:'',      effect:'移動1/0に低下' },
      { range:'80〜90', part:'装備',     defense:0, hp:'特殊',  effect:'装備破壊チェック' },
      { range:'91〜95', part:'コクピット',defense:0, hp:'特殊', effect:'搭乗者にダメージ' },
      { range:'96〜00', part:'頭部',     defense:0, hp:'',      effect:'命中−10、偵察不可' },
    ];
    const tbody = document.getElementById('hit-loc-tbody');
    if (!tbody) return;
    const offset = tbody.querySelectorAll('tr').length;
    defaults.forEach((loc, j) => {
      const tr = document.createElement('tr');
      tr.dataset.li = offset + j;
      tr.innerHTML = this._hitLocRow(loc, offset + j);
      tbody.appendChild(tr);
    });
  },

  // 行ごとの最終命中・荷重計算イベント付与
  _attachRowCalc(tr) {
    tr.querySelectorAll('.armor-weapon-calc').forEach(el => {
      el.addEventListener('input', () => {
        const row = el.closest('tr');
        if (!row) return;
        const bh  = parseInt(row.querySelector('[name=awbh]')?.value)  || 0;
        const mod = parseInt(row.querySelector('[name=awmod]')?.value) || 0;
        const skv = parseInt(row.querySelector('[name=awskv]')?.value) || 0;
        const td = row.querySelector('.final-hit');
        if (td) td.textContent = bh + mod + skv;
      });
    });
    tr.querySelectorAll('.armor-weapon-weight').forEach(el => {
      el.addEventListener('input', () => this._updateLoadDisplay());
    });
    // 射程変更時に戦闘修正（白兵/射撃）を自動で切り替える
    tr.querySelectorAll('.armor-weapon-range').forEach(el => {
      el.addEventListener('change', () => this._recalcWeaponCombatMod(tr));
    });
    // 武器スキル選択時に搭乗英雄のスキル値を自動取得する
    tr.querySelectorAll('.armor-weapon-skill').forEach(el => {
      el.addEventListener('change', () => this._recalcWeaponSkillVal(tr));
    });
  },

  // 武器1行分のスキル値を、選択中のスキル名と搭乗英雄のスキルデータから自動取得してセットする
  _recalcWeaponSkillVal(tr) {
    if (!tr) return;
    const skillName = tr.querySelector('[name=awsk]')?.value || '';
    const skills = this._currentPilotSkills();
    const val = skillName ? (skills[skillName] || 0) : 0;

    const skvInput = tr.querySelector('[name=awskv]');
    if (skvInput) skvInput.value = val;

    const bh  = parseInt(tr.querySelector('[name=awbh]')?.value)  || 0;
    const mod = parseInt(tr.querySelector('[name=awmod]')?.value) || 0;
    const finalTd = tr.querySelector('.final-hit');
    if (finalTd) finalTd.textContent = bh + mod + val;
  },

  // 全武器行のスキル選択肢を、現在選択中の搭乗英雄のスキル一覧で再構築する
  _refreshAllWeaponSkillOptions() {
    document.querySelectorAll('#armor-weapon-tbody tr').forEach(tr => {
      const sel = tr.querySelector('[name=awsk]');
      if (!sel) return;
      const current = sel.value;
      sel.innerHTML = this._skillOptionsHTML(current);
      this._recalcWeaponSkillVal(tr);
    });
  },

  _updateLoadDisplay() {
    const weights = [...document.querySelectorAll('#armor-weapon-tbody [name=awwt]')]
      .map(el => parseInt(el.value) || 0);
    const used = weights.reduce((a, b) => a + b, 0);
    const max  = parseInt(document.getElementById('adv-max-load')?.value) || 0;

    const usedEl   = document.getElementById('adv-used-load');
    const remainEl = document.getElementById('adv-remain-load');
    const dispUsed = document.getElementById('used-load-display');
    const dispMax  = document.getElementById('max-load-display');
    const dispRem  = document.getElementById('remain-load-display');

    if (usedEl)   usedEl.value   = used;
    if (remainEl) remainEl.value = max - used;
    if (dispUsed) dispUsed.textContent = used;
    if (dispMax)  dispMax.textContent  = max;
    if (dispRem)  dispRem.textContent  = max - used;
  },

  attachAutoCalc() {
    // 戦闘修正の合計（白兵・射撃が変わった時は武器の戦闘修正欄も連動して再計算する）
    ['melee','ranged','evasion','resistance','recon'].forEach(key => {
      const hEl = document.querySelector(`[name="hero_${key}"]`);
      const aEl = document.querySelector(`[name="armor_${key}"]`);
      const upd = () => {
        const td = document.getElementById(`final_${key}`);
        if (td) td.textContent = (parseInt(hEl?.value)||0) + (parseInt(aEl?.value)||0);
        if (key === 'melee' || key === 'ranged') this._recalcAllWeaponCombatMod();
      };
      hEl?.addEventListener('input', upd);
      aEl?.addEventListener('input', upd);
    });

    // 最大荷重変更時に再計算
    document.getElementById('adv-max-load')?.addEventListener('input', () => this._updateLoadDisplay());

    // 既存行のイベント付与＋初回の戦闘修正・荷重計算
    document.querySelectorAll('#armor-weapon-tbody tr').forEach(tr => this._attachRowCalc(tr));
    this._recalcAllWeaponCombatMod();
    this._updateLoadDisplay();

    // 搭乗者を選択した時：「英雄の値」欄に自動入力し、武器スキルの選択肢・値も更新する
    document.getElementById('pilot-select')?.addEventListener('change', (e) => {
      const key = e.target.value;
      const note = document.getElementById('pilot-auto-note');
      let pilotData = null;

      if (key) {
        const [type, id] = key.split(':');
        if (type === 'hero') {
          pilotData = this._pilotHeroes.find(h => h.id === id)?.data || null;
        } else if (type === 'singer') {
          pilotData = this._eligibleSingers().find(s => s.id === id)?.data || null;
        }
      }

      if (pilotData) {
        const mods = pilotData.modifiers || {};
        const setVal = (name, v) => { const el = document.querySelector(`[name="${name}"]`); if (el) el.value = v; };
        setVal('hero_melee',      mods.melee      || 0);
        setVal('hero_ranged',     mods.ranged     || 0);
        setVal('hero_evasion',    mods.evasion    || 0);
        setVal('hero_resistance', mods.resistance || 0);
        setVal('hero_recon',      pilotData.skills?.['偵察'] || 0);

        // 合計（最終値）表示も再計算
        ['melee','ranged','evasion','resistance','recon'].forEach(key => {
          const td = document.getElementById(`final_${key}`);
          const hEl = document.querySelector(`[name="hero_${key}"]`);
          const aEl = document.querySelector(`[name="armor_${key}"]`);
          if (td) td.textContent = (parseInt(hEl?.value)||0) + (parseInt(aEl?.value)||0);
        });

        if (note) note.style.display = 'block';
      } else {
        if (note) note.style.display = 'none';
      }

      // 戦闘修正・スキル選択肢を再計算
      this._recalcAllWeaponCombatMod();
      this._refreshAllWeaponSkillOptions();
    });

    // 初回ロード時：搭乗者が既に選択されている場合はスキル選択肢を構築しておく
    this._refreshAllWeaponSkillOptions();
  },

  attachWeaponCalc() { /* 互換用・attachAutoCalc内で処理 */ },
};
