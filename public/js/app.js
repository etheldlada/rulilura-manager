// メインアプリケーション
const App = {
  currentPage: 'home',
  editingId: null,
  editingType: null,

  render() {
    const loggedIn = Auth.isLoggedIn;
    const user = Auth.user;

    // ナビゲーション
    document.getElementById('nav-links').innerHTML = loggedIn ? `
      <span style="color:var(--text-dim);font-size:.82rem;padding:.35rem .5rem">${user.username}</span>
      <button class="nav-btn ${this.currentPage==='mypage'?'active':''}" onclick="App.goto('mypage')">マイページ</button>
      <button class="nav-btn ${this.currentPage==='public'?'active':''}" onclick="App.goto('public')">公開一覧</button>
      <button class="nav-btn" onclick="Auth.logout()">ログアウト</button>
    ` : `
      <button class="nav-btn" onclick="App.goto('auth')">ログイン / 登録</button>
      <button class="nav-btn ${this.currentPage==='public'?'active':''}" onclick="App.goto('public')">公開一覧</button>
    `;

    // ページ表示
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${this.currentPage}`)?.classList.add('active');

    // ページレンダリング
    if (this.currentPage === 'auth') this.renderAuth();
    if (this.currentPage === 'mypage' && loggedIn) this.renderMypage();
    if (this.currentPage === 'public') this.renderPublic();
  },

  goto(page) {
    this.currentPage = page;
    this.render();
  },

  // ===== 認証ページ =====
  renderAuth() {
    const box = document.getElementById('auth-box');
    if (!box) return;
    box.innerHTML = `
      <h2>⚙ RuLiLuRa Manager</h2>
      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-login" onclick="App.switchAuthTab('login')">ログイン</button>
        <button class="auth-tab" id="tab-register" onclick="App.switchAuthTab('register')">新規登録</button>
      </div>
      <div id="auth-form-area">${this.loginForm()}</div>`;
  },

  loginForm() {
    return `
      <div id="auth-alert"></div>
      <div class="form-group"><label>ユーザー名</label><input id="auth-username" placeholder="username" autocomplete="username"></div>
      <div class="form-group"><label>パスワード</label><input id="auth-password" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')App.doLogin()"></div>
      <button class="btn btn-primary btn-full" onclick="App.doLogin()">ログイン</button>`;
  },

  registerForm() {
    return `
      <div id="auth-alert"></div>
      <div class="form-group"><label>ユーザー名（英数字・3〜20文字）</label><input id="auth-username" placeholder="username"></div>
      <div class="form-group"><label>パスワード（6文字以上）</label><input id="auth-password" type="password" onkeydown="if(event.key==='Enter')App.doRegister()"></div>
      <button class="btn btn-primary btn-full" onclick="App.doRegister()">登録</button>`;
  },

  switchAuthTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab==='login');
    document.getElementById('tab-register').classList.toggle('active', tab==='register');
    document.getElementById('auth-form-area').innerHTML = tab==='login' ? this.loginForm() : this.registerForm();
  },

  async doLogin() {
    const u = document.getElementById('auth-username')?.value;
    const p = document.getElementById('auth-password')?.value;
    try {
      const res = await API.post('/api/auth/login', { username: u, password: p });
      API.setToken(res.token);
      this.goto('mypage');
    } catch(e) {
      document.getElementById('auth-alert').innerHTML = `<div class="alert alert-error">${e.message}</div>`;
    }
  },

  async doRegister() {
    const u = document.getElementById('auth-username')?.value;
    const p = document.getElementById('auth-password')?.value;
    try {
      const res = await API.post('/api/auth/register', { username: u, password: p });
      API.setToken(res.token);
      this.goto('mypage');
    } catch(e) {
      document.getElementById('auth-alert').innerHTML = `<div class="alert alert-error">${e.message}</div>`;
    }
  },

  // ===== マイページ =====
  async renderMypage() {
    const el = document.getElementById('mypage-content');
    if (!el) return;
    el.innerHTML = '<p style="color:var(--text-dim)">読み込み中...</p>';

    try {
      const [heroes, singers, armors] = await Promise.all([
        API.get('/api/heroes'),
        API.get('/api/singers'),
        API.get('/api/armors'),
      ]);

      el.innerHTML = `
        <div class="tab-bar">
          <button class="tab-btn active" id="mp-tab-hero"   onclick="App.switchMpTab('hero')">英雄 (${heroes.length})</button>
          <button class="tab-btn"        id="mp-tab-singer" onclick="App.switchMpTab('singer')">歌姫 (${singers.length})</button>
          <button class="tab-btn"        id="mp-tab-armor"  onclick="App.switchMpTab('armor')">奏甲 (${armors.length})</button>
        </div>
        <div id="mp-tab-content"></div>`;

      this._mpHeroes  = heroes;
      this._mpSingers = singers;
      this._mpArmors  = armors;
      this.switchMpTab('hero');
    } catch(e) {
      el.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
    }
  },

  switchMpTab(tab) {
    ['hero','singer','armor'].forEach(t => {
      document.getElementById(`mp-tab-${t}`)?.classList.toggle('active', t===tab);
    });
    this._mpTab = tab;
    const content = document.getElementById('mp-tab-content');
    if (!content) return;

    const items = tab==='hero' ? this._mpHeroes : tab==='singer' ? this._mpSingers : this._mpArmors;
    const type  = tab;
    const btnCls = `btn-${tab}`;
    const badgeCls = `badge-${tab}`;
    const label = tab==='hero' ? '英雄' : tab==='singer' ? '歌姫' : '奏甲';

    let html = `
      <div class="section-header">
        <h2>${label}一覧</h2>
        <button class="btn ${btnCls}" onclick="App.openCreateModal('${type}')">＋ ${label}を作成</button>
      </div>`;

    if (!items.length) {
      html += `<p style="color:var(--text-dim);padding:2rem 0;text-align:center">${label}がまだありません。「＋ ${label}を作成」から作成してください。</p>`;
    } else {
      html += `<div class="card-grid">${items.map(item => this.renderCard(item, type)).join('')}</div>`;
    }

    content.innerHTML = html;
  },

  renderCard(item, type) {
    const d = item.data;
    const isPublic = item.is_public;
    const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';
    const badgeCls = `badge-${type}`;

    let statsHtml = '';
    if (type === 'hero') {
      statsHtml = `
        <div class="char-card-stats">
          <span class="stat-chip">Lv${d.level}</span>
          <span class="stat-chip">通常HP:${d.hp?.normal||0}</span>
          <span class="stat-chip">MP:${d.hp?.mp||0}</span>
          <span class="stat-chip">白兵:${d.modifiers?.melee>=0?'+':''}${d.modifiers?.melee||0}</span>
        </div>`;
    } else if (type === 'singer') {
      statsHtml = `
        <div class="char-card-stats">
          <span class="stat-chip">歌姫Lv${d.level}</span>
          <span class="stat-chip">絆Lv${d.bond_level||1}</span>
          <span class="stat-chip">階位:${d.rank||1}</span>
        </div>`;
    } else {
      const hw = (d.weapons||[]).length;
      statsHtml = `
        <div class="char-card-stats">
          <span class="stat-chip">TL${d.tl||0}</span>
          <span class="stat-chip">防御値:${d.defense||0}</span>
          <span class="stat-chip">HP:${d.hp?.small||0}/${d.hp?.medium||0}/${d.hp?.large||0}</span>
          <span class="stat-chip">武器${hw}種</span>
        </div>`;
    }

    return `
      <div class="char-card" onclick="App.openViewModal('${type}','${item.id}')">
        <div class="char-card-header">
          <span class="type-badge ${badgeCls}">${label}</span>
          <span class="char-card-name">${d.name}</span>
          <span class="public-badge ${isPublic?'on':'off'}">${isPublic?'公開':'非公開'}</span>
        </div>
        ${type==='hero' ? `<div class="char-card-meta">${d.gender||''} ${d.nationality||''} ${d.job||''}</div>` : ''}
        ${type==='singer' ? `<div class="char-card-meta">${d.origin||''}</div>` : ''}
        ${type==='armor' ? `<div class="char-card-meta">${d.model||''} ${d.workshop||''}</div>` : ''}
        ${statsHtml}
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.openEditModal('${type}','${item.id}')">編集</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.togglePublic('${type}','${item.id}',${isPublic})">${isPublic?'非公開に':'公開する'}</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.showCcfoliaJSON('${type}','${item.id}')">ccfolia</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.showShareURL('${type}','${item.id}','${item.share_token}')">共有URL</button>
          <button class="btn btn-sm btn-danger"    onclick="event.stopPropagation();App.deleteChar('${type}','${item.id}')">削除</button>
        </div>
      </div>`;
  },

  // ===== 公開一覧 =====
  async renderPublic() {
    const el = document.getElementById('public-content');
    if (!el) return;
    el.innerHTML = '<p style="color:var(--text-dim)">読み込み中...</p>';
    try {
      const [heroes, singers, armors] = await Promise.all([
        API.get('/api/heroes/public'),
        API.get('/api/singers/public'),
        API.get('/api/armors/public'),
      ]);
      const all = [
        ...heroes.map(x=>({...x,_type:'hero'})),
        ...singers.map(x=>({...x,_type:'singer'})),
        ...armors.map(x=>({...x,_type:'armor'})),
      ].sort((a,b) => b.updated_at > a.updated_at ? 1 : -1);

      el.innerHTML = `
        <div class="section-header"><h2>公開キャラクター</h2></div>
        ${!all.length ? '<p style="color:var(--text-dim)">公開されているキャラクターはありません</p>' :
          `<div class="card-grid">${all.map(item => {
            const d = item.data;
            const type = item._type;
            const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';
            return `<div class="char-card" onclick="App.openViewModal('${type}','${item.id}')">
              <div class="char-card-header">
                <span class="type-badge badge-${type}">${label}</span>
                <span class="char-card-name">${d.name}</span>
              </div>
              <div class="char-card-meta" style="color:var(--text-dim)">by ${item.username}</div>
            </div>`;
          }).join('')}</div>`}`;
    } catch(e) {
      el.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
    }
  },

  // ===== モーダル: 作成/編集 =====
  openCreateModal(type) {
    this.editingId = null;
    this.editingType = type;
    const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';
    const form = type==='hero' ? HeroForm.renderForm() : type==='singer' ? SingerForm.renderForm() : ArmorForm.renderForm();

    ModalManager.open(`新規${label}作成`, form, [
      { label: '保存', cls: `btn-${type}`, action: () => App.saveChar(type, null) },
      { label: 'キャンセル', cls: 'btn-secondary', action: () => ModalManager.close() },
    ]);

    if (type==='hero') HeroForm.attachAutoCalc();
    if (type==='singer') SingerForm.attachAutoCalc();
    if (type==='armor') ArmorForm.attachAutoCalc();
  },

  async openEditModal(type, id) {
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    const item = await API.get(endpoint).catch(() => null);
    if (!item) return;

    this.editingId = id;
    this.editingType = type;
    const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';
    const form = type==='hero' ? HeroForm.renderForm(item.data) : type==='singer' ? SingerForm.renderForm(item.data) : ArmorForm.renderForm(item.data);

    ModalManager.open(`${label}編集`, form, [
      { label: '保存', cls: `btn-${type}`, action: () => App.saveChar(type, id) },
      { label: 'キャンセル', cls: 'btn-secondary', action: () => ModalManager.close() },
    ]);

    if (type==='hero') HeroForm.attachAutoCalc();
    if (type==='singer') SingerForm.attachAutoCalc();
    if (type==='armor') ArmorForm.attachAutoCalc();
  },

  async saveChar(type, id) {
    const data = type==='hero' ? HeroForm.collectForm() : type==='singer' ? SingerForm.collectForm() : ArmorForm.collectForm();
    if (!data || !data.name) { alert('名前は必須です'); return; }

    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}`;
    try {
      if (id) await API.put(`${endpoint}/${id}`, { data });
      else     await API.post(endpoint, { data });
      ModalManager.close();
      this.renderMypage();
    } catch(e) {
      alert('保存に失敗しました: ' + e.message);
    }
  },

  // ===== モーダル: 詳細表示 =====
  async openViewModal(type, id) {
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    const item = await API.get(endpoint).catch(() => null);
    if (!item) return;
    const d = item.data;
    const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';

    let html = '';
    if (type === 'hero') html = this.heroDetailHTML(d, item);
    else if (type === 'singer') html = this.singerDetailHTML(d, item);
    else html = this.armorDetailHTML(d, item);

    const btns = [];
    if (Auth.isLoggedIn && Auth.user.id === item.user_id) {
      btns.push({ label: '編集', cls: 'btn-secondary', action: () => { ModalManager.close(); App.openEditModal(type, id); } });
    }
    btns.push({ label: '閉じる', cls: 'btn-secondary', action: () => ModalManager.close() });

    ModalManager.open(`${label}詳細: ${d.name}`, html, btns);
  },

  heroDetailHTML(d, item) {
    const ab = d.abilities || {};
    const mods = d.modifiers || {};
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div>
          <div class="form-section">
            <h4>基本情報</h4>
            <table style="width:100%;font-size:.85rem">
              ${[['名前',d.name],['性別',d.gender||'-'],['年齢',d.age||'-'],['レベル',d.level||1],['国籍',d.nationality||'-'],['職業',d.job||'-']].map(([k,v])=>`<tr><td style="color:var(--text-dim);padding:.2rem .4rem">${k}</td><td style="padding:.2rem .4rem">${v}</td></tr>`).join('')}
            </table>
          </div>
          <div class="form-section">
            <h4>能力値</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem;font-size:.85rem">
              ${ABILITY_NAMES.map(n=>`<div style="display:flex;justify-content:space-between;padding:.2rem .4rem;background:var(--surface);border-radius:4px"><span style="color:var(--text-dim)">${n}</span><strong>${ab[n]||10}<span style="font-size:.75rem;color:var(--text-dim)"> (${(ab[n]||10)-10>=0?'+':''}${(ab[n]||10)-10})</span></strong></div>`).join('')}
            </div>
          </div>
        </div>
        <div>
          <div class="form-section">
            <h4>HP / MP</h4>
            <div class="hp-row">
              ${[['通常HP',d.hp?.normal||0],['負傷HP',d.hp?.injured||0],['MP',d.hp?.mp||0]].map(([k,v])=>`<div class="hp-block"><span>${k}</span><strong>${v}</strong></div>`).join('')}
            </div>
          </div>
          <div class="form-section">
            <h4>戦闘修正</h4>
            <div style="font-size:.85rem">
              ${[['白兵',mods.melee||0],['射撃',mods.ranged||0],['回避',mods.evasion||0],['抵抗',mods.resistance||0],['防御値',mods.defense||0],['ダメージ修正',mods.damage||0]].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">${k}</span><strong>${v>=0?'+':''}${v}</strong></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
      ${d.weapons?.length ? `<div class="form-section"><h4>武器</h4>
        <table style="width:100%;font-size:.82rem;border-collapse:collapse">
          <thead><tr>${['武器名','命中値','ダメージ','射程'].map(h=>`<th style="padding:.3rem;border-bottom:1px solid var(--border);color:var(--text-dim)">${h}</th>`).join('')}</tr></thead>
          <tbody>${d.weapons.map(w=>`<tr>${[w.name,w.hit,w.damage,w.range].map(v=>`<td style="padding:.3rem;border-bottom:1px solid var(--border)">${v||'-'}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>` : ''}
      ${d.abilities_memo ? `<div class="form-section"><h4>英雄能力</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.abilities_memo}</pre></div>` : ''}
      ${d.skills && Object.keys(d.skills).length ? `<div class="form-section"><h4>スキル</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.3rem;font-size:.82rem">
          ${Object.entries(d.skills).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:.2rem .5rem;background:var(--surface);border-radius:4px"><span>${k}</span><strong>${v} <span style="color:var(--text-dim)">(${50+v})</span></strong></div>`).join('')}
        </div></div>` : ''}`;
  },

  singerDetailHTML(d, item) {
    const ab = d.abilities || {};
    const gauges = d.gauges || {};
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div>
          <div class="form-section"><h4>基本情報</h4>
            <table style="width:100%;font-size:.85rem">
              ${[['名前',d.name],['年齢',d.age||'-'],['出身',d.origin||'-'],['歌姫Lv',d.level||1],['階位',d.rank||1],['絆Lv',d.bond_level||1]].map(([k,v])=>`<tr><td style="color:var(--text-dim);padding:.2rem .4rem">${k}</td><td style="padding:.2rem .4rem">${v}</td></tr>`).join('')}
            </table>
          </div>
          <div class="form-section"><h4>能力値</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem;font-size:.85rem">
              ${ABILITY_NAMES.map(n=>`<div style="display:flex;justify-content:space-between;padding:.2rem .4rem;background:var(--surface);border-radius:4px"><span style="color:var(--text-dim)">${n}</span><strong>${ab[n]||10}<span style="font-size:.75rem;color:var(--text-dim)"> (${(ab[n]||10)-10>=0?'+':''}${(ab[n]||10)-10})</span></strong></div>`).join('')}
            </div>
          </div>
        </div>
        <div>
          <div class="form-section"><h4>消耗ゲージ</h4>
            ${['肉体','気力','絆'].map(g=>`<div style="margin-bottom:.5rem;padding:.4rem;background:var(--surface);border-radius:4px"><strong style="color:var(--accent2)">${g}</strong>
              <span style="font-size:.82rem;margin-left:.5rem;color:var(--text-dim)">消耗値:${gauges[g]?.cost||9} / 獲得値:${gauges[g]?.gain||9} / ゲージ数:${gauges[g]?.boxes||3}</span></div>`).join('')}
          </div>
          ${d.skills && Object.keys(d.skills).length ? `<div class="form-section"><h4>スキル</h4>
            <div style="font-size:.82rem">
              ${Object.entries(d.skills).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:.15rem .3rem"><span>${k}</span><strong>${v}(${50+v})</strong></div>`).join('')}
            </div></div>` : ''}
        </div>
      </div>
      ${d.abilities_memo ? `<div class="form-section"><h4>歌姫能力</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.abilities_memo}</pre></div>` : ''}
      ${d.songs ? `<div class="form-section"><h4>歌術</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.songs}</pre></div>` : ''}`;
  },

  armorDetailHTML(d, item) {
    return `
      <div class="form-section"><h4>基本情報</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.3rem;font-size:.85rem">
          ${[['名称',d.name],['型式',d.model||'-'],['TL',d.tl||0],['工房',d.workshop||'-'],['防御値',d.defense||0]].map(([k,v])=>`<div style="background:var(--surface);padding:.4rem;border-radius:4px"><span style="color:var(--text-dim);font-size:.75rem;display:block">${k}</span><strong>${v}</strong></div>`).join('')}
        </div>
      </div>
      <div class="form-section"><h4>奏甲HP</h4>
        <div class="hp-row">
          <div class="hp-block"><span>小破HP</span><strong>${d.hp?.small||0}</strong></div>
          <div class="hp-block"><span>中破HP</span><strong>${d.hp?.medium||0}</strong></div>
          <div class="hp-block"><span>大破HP</span><strong>${d.hp?.large||0}</strong></div>
        </div>
      </div>
      <div class="form-section"><h4>戦闘修正</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.3rem;font-size:.85rem">
          ${[['白兵',(d.hero_melee||0)+(d.armor_melee||0)],['射撃',(d.hero_ranged||0)+(d.armor_ranged||0)],['回避',(d.hero_evasion||0)+(d.armor_evasion||0)],['抵抗',(d.hero_resistance||0)+(d.armor_resistance||0)],['偵察',(d.hero_recon||0)+(d.armor_recon||0)],['ダメージ修正',d.armor_damage_mod||0]].map(([k,v])=>`<div style="background:var(--surface);padding:.4rem;border-radius:4px"><span style="color:var(--text-dim);font-size:.75rem;display:block">${k}</span><strong>${v>=0?'+':''}${v}</strong></div>`).join('')}
        </div>
      </div>
      ${d.weapons?.length ? `<div class="form-section"><h4>搭載武器</h4>
        <div style="overflow-x:auto"><table style="width:100%;font-size:.8rem;border-collapse:collapse;min-width:500px">
          <thead><tr>${['武器名','最終命中','ダメージ','射程','回数'].map(h=>`<th style="padding:.3rem;border-bottom:1px solid var(--border);color:var(--text-dim)">${h}</th>`).join('')}</tr></thead>
          <tbody>${d.weapons.map(w=>`<tr>${[w.name,w.finalHit||'-',w.damage||'-',w.range||'-',w.count||'1'].map(v=>`<td style="padding:.3rem;border-bottom:1px solid var(--border)">${v}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div></div>` : ''}
      ${d.special_rules ? `<div class="form-section"><h4>特殊ルール</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.special_rules}</pre></div>` : ''}`;
  },

  // ===== 公開/非公開切り替え =====
  async togglePublic(type, id, isPublic) {
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    try {
      await API.put(endpoint, { is_public: !isPublic });
      this.renderMypage();
    } catch(e) { alert('切り替えに失敗しました: ' + e.message); }
  },

  // ===== 削除 =====
  async deleteChar(type, id) {
    if (!confirm('削除しますか？この操作は取り消せません。')) return;
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    try {
      await API.delete(endpoint);
      this.renderMypage();
    } catch(e) { alert('削除に失敗しました: ' + e.message); }
  },

  // ===== ccfolia JSON出力 =====
  async showCcfoliaJSON(type, id) {
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    const item = await API.get(endpoint).catch(() => null);
    if (!item) return;
    const d = item.data;

    let ccfolia;
    if (type === 'hero') {
      const commands = buildCcfoliaCommands(d);
      ccfolia = {
        kind: 'character',
        data: {
          name: d.name || '英雄',
          memo: [
            `【英雄】Lv${d.level||1} ${d.gender||''} ${d.nationality||''} ${d.job||''}`,
            `通常HP:${d.hp?.normal||0} / 負傷HP:${d.hp?.injured||0} / MP:${d.hp?.mp||0}`,
            `防御値:${d.modifiers?.defense||0}`,
            d.abilities_memo ? `\n[英雄能力]\n${d.abilities_memo}` : '',
            d.notes ? `\n[メモ]\n${d.notes}` : '',
          ].filter(Boolean).join('\n'),
          initiative: (d.abilities?.敏捷||10) - 10,
          commands: commands.map(c => `${c.label}\n${c.value}`).join('\n\n'),
          status: [
            { label: '通常HP', value: d.hp?.normal||0, max: d.hp?.normal||0 },
            { label: '負傷HP', value: d.hp?.injured||0, max: d.hp?.injured||0 },
            { label: 'MP', value: d.hp?.mp||0, max: d.hp?.mp||0 },
          ],
          params: ABILITY_NAMES.map(n => ({ label: n, value: String(d.abilities?.[n]||10) })),
        }
      };
    } else if (type === 'singer') {
      const commands = buildSingerCcfoliaCommands(d);
      ccfolia = {
        kind: 'character',
        data: {
          name: d.name || '歌姫',
          memo: [
            `【歌姫】Lv${d.level||1} 絆Lv${d.bond_level||1} 階位${d.rank||1}`,
            `通常HP:${d.hp?.normal||0} / 負傷HP:${d.hp?.injured||0}`,
            d.abilities_memo ? `\n[歌姫能力]\n${d.abilities_memo}` : '',
            d.songs ? `\n[歌術]\n${d.songs}` : '',
            d.ng_actions ? `\n[NG行動]\n${d.ng_actions}` : '',
          ].filter(Boolean).join('\n'),
          commands: commands.map(c => `${c.label}\n${c.value}`).join('\n\n'),
          status: [
            { label: '通常HP', value: d.hp?.normal||0, max: d.hp?.normal||0 },
            { label: '肉体ゲージ', value: d.gauges?.肉体?.boxes||3, max: d.gauges?.肉体?.boxes||3 },
            { label: '気力ゲージ', value: d.gauges?.気力?.boxes||3, max: d.gauges?.気力?.boxes||3 },
            { label: '絆ゲージ', value: d.gauges?.絆?.boxes||3, max: d.gauges?.絆?.boxes||3 },
          ],
          params: ABILITY_NAMES.map(n => ({ label: n, value: String(d.abilities?.[n]||10) })),
        }
      };
    } else {
      const commands = buildArmorCcfoliaCommands(d);
      const finalMelee = (d.hero_melee||0)+(d.armor_melee||0);
      const finalRanged= (d.hero_ranged||0)+(d.armor_ranged||0);
      ccfolia = {
        kind: 'character',
        data: {
          name: d.name || '奏甲',
          memo: [
            `【奏甲】${d.model||''} TL${d.tl||0} 工房:${d.workshop||''}`,
            `防御値:${d.defense||0} ダメージ修正:${d.armor_damage_mod||0}`,
            d.special_rules ? `\n[特殊ルール]\n${d.special_rules}` : '',
          ].filter(Boolean).join('\n'),
          commands: commands.map(c => `${c.label}\n${c.value}`).join('\n\n'),
          status: [
            { label: '小破HP', value: d.hp?.small||0, max: d.hp?.small||0 },
            { label: '中破HP', value: d.hp?.medium||0, max: d.hp?.medium||0 },
            { label: '大破HP', value: d.hp?.large||0, max: d.hp?.large||0 },
          ],
          params: [
            { label: '白兵', value: String(finalMelee>=0?'+':'') + finalMelee },
            { label: '射撃', value: String(finalRanged>=0?'+':'') + finalRanged },
            { label: '回避', value: String((d.hero_evasion||0)+(d.armor_evasion||0)) },
            { label: '抵抗', value: String((d.hero_resistance||0)+(d.armor_resistance||0)) },
            { label: '防御値', value: String(d.defense||0) },
          ],
        }
      };
    }

    const json = JSON.stringify(ccfolia, null, 2);
    const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';
    ModalManager.open(`ccfolia JSON: ${d.name}`, `
      <p style="font-size:.85rem;color:var(--text-dim);margin-bottom:.75rem">以下のJSONをコピーして、ccfoliaのキャラクター駒作成画面でJSONとしてインポートしてください。</p>
      <div class="json-output" id="ccfolia-json">${json}</div>`,
      [
        { label: 'コピー', cls: 'btn-primary', action: () => { navigator.clipboard.writeText(json).then(() => alert('コピーしました')); } },
        { label: '閉じる', cls: 'btn-secondary', action: () => ModalManager.close() },
      ]);
  },

  // ===== 共有URL =====
  showShareURL(type, id, token) {
    const url = `${location.origin}/share/${type}/${token}`;
    ModalManager.open('共有URL', `
      <p style="font-size:.85rem;color:var(--text-dim);margin-bottom:.75rem">このURLを共有することで、誰でもこのキャラクターを閲覧できます（公開設定に関わらず）。</p>
      <div class="share-url-box">
        <input id="share-url-input" value="${url}" readonly>
        <button class="btn btn-primary btn-sm" onclick="navigator.clipboard.writeText('${url}').then(()=>alert('コピーしました'))">コピー</button>
      </div>`,
      [{ label: '閉じる', cls: 'btn-secondary', action: () => ModalManager.close() }]);
  },
};

// ===== モーダルマネージャー =====
const ModalManager = {
  open(title, body, buttons = []) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-footer').innerHTML = buttons.map((b, i) =>
      `<button class="btn ${b.cls}" id="modal-btn-${i}">${b.label}</button>`
    ).join('');
    buttons.forEach((b, i) => {
      document.getElementById(`modal-btn-${i}`)?.addEventListener('click', b.action);
    });
    document.getElementById('modal-overlay').classList.add('open');
  },
  close() {
    document.getElementById('modal-overlay').classList.remove('open');
  }
};

// ===== 共有URL処理 =====
async function handleShareURL() {
  const m = location.pathname.match(/^\/share\/(hero|singer|armor)\/([^/]+)$/);
  if (!m) return false;
  const [, type, token] = m;
  const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/share/${token}`;
  const item = await API.get(endpoint).catch(() => null);
  if (!item) { alert('キャラクターが見つかりません'); return false; }

  const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';
  App.currentPage = 'public';
  App.render();

  const html = type==='hero' ? App.heroDetailHTML(item.data, item)
              : type==='singer' ? App.singerDetailHTML(item.data, item)
              : App.armorDetailHTML(item.data, item);
  ModalManager.open(`${label}: ${item.data.name} (by ${item.username})`, html,
    [{ label: '閉じる', cls: 'btn-secondary', action: () => ModalManager.close() }]);
  return true;
}

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  // モーダルの外クリックで閉じる
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) ModalManager.close();
  });

  // 共有URLの処理
  const handled = await handleShareURL();
  if (!handled) {
    App.currentPage = Auth.isLoggedIn ? 'mypage' : 'auth';
    App.render();
  }
});
