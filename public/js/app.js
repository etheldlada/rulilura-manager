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
    // detail/edit/ccfoliaはgoto時に直接レンダリングするため省略
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
      <div class="char-card" onclick="App.gotoDetail('${type}','${item.id}')">
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
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.gotoEdit('${type}','${item.id}')">編集</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.togglePublic('${type}','${item.id}',${isPublic})">${isPublic?'非公開に':'公開する'}</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.gotoCcfolia('${type}','${item.id}')">ccfolia</button>
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
            return `<div class="char-card" onclick="App.gotoDetail('${type}','${item.id}')">
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

  // ===== 詳細ページへ遷移 =====
  async gotoDetail(type, id) {
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    const item = await API.get(endpoint).catch(() => null);
    if (!item) return;
    // _prevPageは一覧系ページ（mypage/public）のみを保持する。
    // detail/edit/ccfoliaから来た場合は既存の_prevPageを維持し、上書きしない。
    if (['mypage','public'].includes(this.currentPage)) {
      this._prevPage = this.currentPage;
    }

    // 奏甲の場合、搭乗者（英雄 または 奏甲乗り歌姫のいずれか一人）の名前を表示用に取得する
    if (type === 'armor') {
      const pilotType = item.data?.pilot_type || (item.hero_id ? 'hero' : item.singer_id ? 'singer' : '');
      const pilotId   = item.data?.pilot_id   || item.hero_id || item.singer_id || '';
      if (pilotType && pilotId && Auth.isLoggedIn) {
        const endpoint2 = pilotType === 'hero' ? `/api/heroes/${pilotId}` : `/api/singers/${pilotId}`;
        const p = await API.get(endpoint2).catch(() => null);
        item._pilotType = pilotType;
        item._pilotName = p?.data?.name || null;
      }
    }

    this._detailItem = item;
    this._detailType = type;
    this.currentPage = 'detail';
    this.render();
    this._renderDetailPage(item, type);
    window.scrollTo(0, 0);
  },

  _renderDetailPage(item, type) {
    const el = document.getElementById('detail-content');
    if (!el) return;
    const d = item.data;
    const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';
    const isOwner = Auth.isLoggedIn && Auth.user?.id === item.user_id;
    const backPage = this._prevPage || 'mypage';

    let html = '';
    if (type === 'hero') html = this.heroDetailHTML(d, item);
    else if (type === 'singer') html = this.singerDetailHTML(d, item);
    else html = this.armorDetailHTML(d, item);

    el.innerHTML = `
      <div class="page-header">
        <button class="btn btn-secondary btn-sm" onclick="App.goto('${backPage}')">← 戻る</button>
        <h2><span class="type-badge badge-${type}" style="font-size:.8rem;margin-right:.5rem">${label}</span>${d.name}</h2>
        <div class="page-header-actions">
          ${isOwner ? `
            <button class="btn btn-secondary btn-sm" onclick="App.gotoEdit('${type}','${item.id}')">編集</button>
            <button class="btn btn-secondary btn-sm" onclick="App.togglePublic('${type}','${item.id}',${item.is_public})">${item.is_public?'非公開に':'公開する'}</button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="App.gotoCcfolia('${type}','${item.id}')">ccfolia</button>
          ${isOwner ? `<button class="btn btn-secondary btn-sm" onclick="App.showShareURL('${type}','${item.id}','${item.share_token}')">共有URL</button>` : ''}
          ${isOwner ? `<button class="btn btn-danger btn-sm" onclick="App.deleteChar('${type}','${item.id}')">削除</button>` : ''}
        </div>
      </div>
      ${html}`;
  },

  // ===== 作成ページへ遷移 =====
  async openCreateModal(type) {
    if (['mypage','public'].includes(this.currentPage)) {
      this._prevPage = this.currentPage;
    }
    this.editingId = null;
    this.editingType = type;
    this.currentPage = 'edit';
    this.render();
    await this._renderEditPage(type, null, null);
    window.scrollTo(0, 0);
  },

  // ===== 編集ページへ遷移 =====
  async gotoEdit(type, id) {
    // _prevPageは一覧系ページ（mypage/public）のみを保持する。
    // detail/edit/ccfoliaから来た場合は既存の_prevPageを維持し、上書きしない。
    if (['mypage','public'].includes(this.currentPage)) {
      this._prevPage = this.currentPage;
    }
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    const item = await API.get(endpoint).catch(() => null);
    if (!item) return;
    this.editingId = id;
    this.editingType = type;
    this.currentPage = 'edit';
    this.render();
    await this._renderEditPage(type, id, item.data);
    window.scrollTo(0, 0);
  },

  // 後方互換（カードの編集ボタン）
  async openEditModal(type, id) { return this.gotoEdit(type, id); },

  async _renderEditPage(type, id, data) {
    const el = document.getElementById('edit-content');
    if (!el) return;
    const label = type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲';
    const isNew = !id;

    // 奏甲フォームは搭乗ペア選択のため英雄・歌姫一覧を先に取得しておく
    if (type === 'armor' && Auth.isLoggedIn) {
      try {
        const [heroes, singers] = await Promise.all([
          API.get('/api/heroes'),
          API.get('/api/singers'),
        ]);
        ArmorForm.setPilotOptions(heroes, singers);
      } catch {
        ArmorForm.setPilotOptions([], []);
      }
    }

    const form = type==='hero'   ? HeroForm.renderForm(data)
               : type==='singer' ? SingerForm.renderForm(data)
               :                   ArmorForm.renderForm(data);

    el.innerHTML = `
      <div class="edit-page-inner">
        <div class="page-header">
          <button class="btn btn-secondary btn-sm" onclick="App._cancelEdit()">← キャンセル</button>
          <h2>${isNew ? `新規${label}作成` : `${label}編集: ${data?.name||''}`}</h2>
        </div>
        ${form}
        <div class="edit-footer">
          <button class="btn btn-secondary" onclick="App._cancelEdit()">キャンセル</button>
          <button class="btn btn-${type}" onclick="App.saveChar('${type}','${id||''}')">保存する</button>
        </div>
      </div>`;

    if (type==='hero')   HeroForm.attachAutoCalc();
    if (type==='singer') SingerForm.attachAutoCalc();
    if (type==='armor')  ArmorForm.attachAutoCalc();
  },

  _cancelEdit() {
    // 編集前に詳細ページを見ていた場合（_detailItemが現在編集中のキャラと一致する場合）は詳細に戻る
    if (this.editingId && this._detailItem && this._detailType === this.editingType && this._detailItem.id === this.editingId) {
      this.gotoDetail(this._detailType, this._detailItem.id);
    } else {
      this.goto(this._prevPage || 'mypage');
    }
  },

  async saveChar(type, id) {
    const data = type==='hero'   ? HeroForm.collectForm()
               : type==='singer' ? SingerForm.collectForm()
               :                   ArmorForm.collectForm();
    if (!data || !data.name) { alert('名前は必須です'); return; }

    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}`;
    const body = { data };
    // 奏甲の場合、搭乗者選択をDBのリレーションカラム（hero_id/singer_id）にも反映する
    // 搭乗者は英雄か歌姫のどちらか一方のみのため、選ばれなかった側は必ずnullにする
    if (type === 'armor') {
      body.hero_id   = data.pilot_type === 'hero'   ? data.pilot_id : null;
      body.singer_id = data.pilot_type === 'singer' ? data.pilot_id : null;
    }
    try {
      let saved;
      if (id) saved = await API.put(`${endpoint}/${id}`, body);
      else     saved = await API.post(endpoint, body);
      // 保存後は詳細ページへ遷移
      await this.gotoDetail(type, saved.id);
    } catch(e) {
      alert('保存に失敗しました: ' + e.message);
    }
  },

  heroDetailHTML(d, item) {
    const ab = d.abilities || {};
    const mods = d.modifiers || {};
    // 英雄能力：新形式（hero_abilities配列）と旧形式（abilities_memoテキスト）の両方に対応
    const heroAbilitiesHTML = (() => {
      if (d.hero_abilities && d.hero_abilities.length > 0) {
        const rows = d.hero_abilities.map(a => `
          <tr>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);white-space:nowrap">
              <span style="font-size:.72rem;color:var(--text-dim);margin-right:.3rem">${a.no}.</span><strong>${a.name}</strong>
            </td>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem;color:var(--text-dim)">
              ${(HERO_ABILITIES_CATALOG.find(c=>c.no===a.no)?.summary)||''}
            </td>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem">${a.memo||''}</td>
          </tr>`).join('');
        return `<div class="form-section"><h4>英雄能力（${d.hero_abilities.length}個）</h4>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.83rem;min-width:400px">
              <thead><tr>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left;white-space:nowrap">能力名</th>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">効果</th>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">メモ</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div></div>`;
      }
      // 旧形式フォールバック
      if (d.abilities_memo) {
        return `<div class="form-section"><h4>英雄能力</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.abilities_memo}</pre></div>`;
      }
      return '';
    })();

    // 歌術アイテム表示
    const songItemsHTML = (() => {
      if (!d.song_items || !d.song_items.length) return '';
      const rows = d.song_items.map(item => `
        <tr>
          <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);white-space:nowrap"><strong>${item.name}</strong></td>
          <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem;color:var(--text-dim)">${item.effect||(SONG_ITEMS_CATALOG.find(c=>c.no===item.no)?.effect)||''}</td>
          <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem">${item.memo||''}</td>
        </tr>`).join('');
      return `<div class="form-section"><h4>歌術アイテム（${d.song_items.length}個）</h4>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.83rem;min-width:400px">
            <thead><tr>
              <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left;white-space:nowrap">アイテム名</th>
              <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">効果</th>
              <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">メモ</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div></div>`;
    })();

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
            ${(d.hp?.normalBonus||d.hp?.injuredBonus||d.hp?.mpBonus) ? `<div style="font-size:.75rem;color:var(--text-dim);margin-top:.4rem">うちボーナス分： 通常HP+${d.hp?.normalBonus||0} / 負傷HP+${d.hp?.injuredBonus||0} / MP+${d.hp?.mpBonus||0}</div>` : ''}
          </div>
          <div class="form-section">
            <h4>戦闘修正</h4>
            <div style="font-size:.85rem">
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">白兵</span><strong>${mods.melee>=0?'+':''}${mods.melee||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">射撃</span><strong>${mods.ranged>=0?'+':''}${mods.ranged||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">回避の元値</span><strong>${(mods.evasionRaw??mods.evasion)>=0?'+':''}${mods.evasionRaw??mods.evasion??0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">回避修正</span><strong>${mods.evasion>=0?'+':''}${mods.evasion||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">抵抗</span><strong>${mods.resistance>=0?'+':''}${mods.resistance||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">防御値</span><strong>${mods.defense>=0?'+':''}${mods.defense||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">ダメージ修正</span><strong>${mods.damage>=0?'+':''}${mods.damage||0}</strong></div>
            </div>
          </div>
        </div>
      </div>
      ${d.weapons?.length ? `<div class="form-section"><h4>個人武器</h4>
        <div style="overflow-x:auto"><table style="width:100%;font-size:.82rem;border-collapse:collapse;min-width:360px">
          <thead><tr>${['武器名','命中値','ダメージ','射程'].map(h=>`<th style="padding:.3rem;border-bottom:1px solid var(--border);color:var(--text-dim)">${h}</th>`).join('')}</tr></thead>
          <tbody>${d.weapons.map(w=>`<tr>${[w.name,w.hit,w.damage,w.range].map(v=>`<td style="padding:.3rem;border-bottom:1px solid var(--border)">${v||'-'}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div></div>` : ''}
      ${d.armors?.length ? `<div class="form-section"><h4>防具</h4>
        <div style="overflow-x:auto"><table style="width:100%;font-size:.82rem;border-collapse:collapse;min-width:300px">
          <thead><tr>${['防具名','防御値','回避ペナルティ'].map(h=>`<th style="padding:.3rem;border-bottom:1px solid var(--border);color:var(--text-dim)">${h}</th>`).join('')}</tr></thead>
          <tbody>${d.armors.map(a=>`<tr><td style="padding:.3rem;border-bottom:1px solid var(--border)">${a.name||'-'}</td><td style="padding:.3rem;border-bottom:1px solid var(--border)">${a.defense||0}</td><td style="padding:.3rem;border-bottom:1px solid var(--border)">${a.evasionPenalty||0}</td></tr>`).join('')}</tbody>
          <tfoot><tr style="font-weight:bold;background:var(--surface)"><td style="padding:.3rem">合計</td><td style="padding:.3rem">${d.armors.reduce((s,a)=>s+(a.defense||0),0)}</td><td style="padding:.3rem">${d.armors.reduce((s,a)=>s+(a.evasionPenalty||0),0)}</td></tr></tfoot>
        </table></div></div>` : ''}
      ${heroAbilitiesHTML}
      ${songItemsHTML}
      ${d.skills && Object.keys(d.skills).length ? `<div class="form-section"><h4>スキル</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.3rem;font-size:.82rem">
          ${Object.entries(d.skills).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:.2rem .5rem;background:var(--surface);border-radius:4px"><span>${k}</span><strong>${v} <span style="color:var(--text-dim)">(${50+v})</span></strong></div>`).join('')}
        </div></div>` : ''}
      ${d.equipment ? `<div class="form-section"><h4>一般アイテム</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.equipment}</pre></div>` : ''}
      ${d.notes ? `<div class="form-section"><h4>メモ</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.notes}</pre></div>` : ''}
      ${(d.mushika?.points || d.mushika?.level) ? `<div class="form-section"><h4>蟲化</h4><div style="display:flex;gap:1.5rem"><span>蟲化ポイント：${d.mushika.points||0}</span><span>蟲化レベル：${d.mushika.level||0}</span></div></div>` : ''}`;
  },

  singerDetailHTML(d, item) {
    const ab     = d.abilities || {};
    const gauges = d.gauges    || {};
    const mods   = d.modifiers || {};

    // 歌姫能力表示
    const singerAbilitiesHTML = (() => {
      if (d.singer_abilities && d.singer_abilities.length > 0) {
        const rows = d.singer_abilities.map(a => `
          <tr>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);white-space:nowrap">
              <span style="font-size:.72rem;color:var(--text-dim);margin-right:.3rem">${a.no}.</span><strong>${a.name}</strong>
            </td>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem;color:var(--text-dim)">
              ${SINGER_ABILITIES_CATALOG.find(c=>c.no===a.no)?.summary||''}
            </td>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem">${a.memo||''}</td>
          </tr>`).join('');
        return `<div class="form-section"><h4>歌姫能力（${d.singer_abilities.length}個）</h4>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.83rem;min-width:400px">
              <thead><tr>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left;white-space:nowrap">能力名</th>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">効果</th>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">メモ</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div></div>`;
      }
      if (d.abilities_memo) {
        return `<div class="form-section"><h4>歌姫能力</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.abilities_memo}</pre></div>`;
      }
      return '';
    })();

    // 歌術表示
    const singerSongsHTML = (() => {
      if (d.singer_songs && d.singer_songs.length > 0) {
        const rows = d.singer_songs.map(s => {
          const catalog = SONGS_CATALOG.find(c => c.no === s.no);
          const effectText = catalog ? (catalog.effects[s.rank] || '') : '';
          return `
          <tr>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border)"><strong>${s.name||''}</strong></td>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);text-align:center">
              <span style="background:var(--singer);color:#fff;font-size:.72rem;padding:.1rem .4rem;border-radius:3px">R${s.rank||1}</span>
            </td>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem;color:var(--text-dim)">${effectText}</td>
            <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem">${s.memo||''}</td>
          </tr>`;}).join('');
        return `<div class="form-section"><h4>歌術（${d.singer_songs.length}種）</h4>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.83rem;min-width:500px">
              <thead><tr>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">歌術名</th>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:center;width:60px">ランク</th>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">効果</th>
                <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">メモ</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div></div>`;
      }
      if (d.songs) {
        return `<div class="form-section"><h4>歌術</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.songs}</pre></div>`;
      }
      return '';
    })();

    // 戦闘系歌姫：武器・防具
    const combatHTML = (() => {
      const hasWeapons  = d.weapons && d.weapons.length > 0;
      const hasArmors   = d.armors  && d.armors.length  > 0;
      if (!hasWeapons && !hasArmors) return '';
      return `<div class="form-section" style="border-color:var(--singer)">
        <h4 style="color:var(--singer)">⚔ 戦闘系歌姫：武器・防具</h4>
        ${hasWeapons ? `<div style="overflow-x:auto;margin-bottom:.5rem">
          <table style="width:100%;font-size:.82rem;border-collapse:collapse;min-width:380px">
            <thead><tr>${['武器名','命中値','スキル','ダメージ','射程'].map(h=>`<th style="padding:.3rem;border-bottom:1px solid var(--border);color:var(--text-dim)">${h}</th>`).join('')}</tr></thead>
            <tbody>${d.weapons.map(w=>`<tr>${[w.name,w.hit,w.skill,w.damage,w.range].map(v=>`<td style="padding:.3rem;border-bottom:1px solid var(--border)">${v||'-'}</td>`).join('')}</tr>`).join('')}</tbody>
          </table></div>` : ''}
        ${hasArmors ? `<div style="overflow-x:auto;margin-bottom:.5rem">
          <table style="width:100%;font-size:.82rem;border-collapse:collapse;min-width:300px">
            <thead><tr>${['防具名','防御値','回避ペナルティ'].map(h=>`<th style="padding:.3rem;border-bottom:1px solid var(--border);color:var(--text-dim)">${h}</th>`).join('')}</tr></thead>
            <tbody>${d.armors.map(a=>`<tr><td style="padding:.3rem;border-bottom:1px solid var(--border)">${a.name||'-'}</td><td style="padding:.3rem;border-bottom:1px solid var(--border)">${a.defense||0}</td><td style="padding:.3rem;border-bottom:1px solid var(--border)">${a.evasionPenalty||0}</td></tr>`).join('')}</tbody>
            <tfoot><tr style="font-weight:bold;background:var(--surface)"><td style="padding:.3rem">合計</td><td style="padding:.3rem">${d.armors.reduce((s,a)=>s+(a.defense||0),0)}</td><td style="padding:.3rem">${d.armors.reduce((s,a)=>s+(a.evasionPenalty||0),0)}</td></tr></tfoot>
          </table></div>` : ''}
      </div>`;
    })();

    // 歌術アイテム表示
    const songItemsHTML = (() => {
      if (!d.song_items || !d.song_items.length) return '';
      const rows = d.song_items.map(item => `
        <tr>
          <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);white-space:nowrap"><strong>${item.name}</strong></td>
          <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem;color:var(--text-dim)">${item.effect||(SONG_ITEMS_CATALOG.find(c=>c.no===item.no)?.effect)||''}</td>
          <td style="padding:.25rem .4rem;border-bottom:1px solid var(--border);font-size:.78rem">${item.memo||''}</td>
        </tr>`).join('');
      return `<div class="form-section"><h4>歌術アイテム（${d.song_items.length}個）</h4>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.83rem;min-width:400px">
            <thead><tr>
              <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left;white-space:nowrap">アイテム名</th>
              <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">効果</th>
              <th style="padding:.25rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">メモ</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div></div>`;
    })();

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
          <div class="form-section"><h4>戦闘修正</h4>
            <div style="font-size:.85rem">
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">白兵</span><strong>${mods.melee>=0?'+':''}${mods.melee||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">射撃</span><strong>${mods.ranged>=0?'+':''}${mods.ranged||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">回避の元値</span><strong>${(mods.evasionRaw??mods.evasion)>=0?'+':''}${mods.evasionRaw??mods.evasion??0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">回避修正</span><strong>${mods.evasion>=0?'+':''}${mods.evasion||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">抵抗</span><strong>${mods.resistance>=0?'+':''}${mods.resistance||0}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:.2rem .4rem"><span style="color:var(--text-dim)">防御値</span><strong>${mods.defense>=0?'+':''}${mods.defense||0}</strong></div>
            </div>
          </div>
        </div>
        <div>
          <div class="form-section"><h4>消耗ゲージ・ゲインゲージ</h4>
            ${['肉体','気力','絆'].map(g=>`<div style="margin-bottom:.5rem;padding:.4rem;background:var(--surface);border-radius:4px">
              <strong style="color:var(--accent2)">${g}消耗ゲージ</strong>
              <span style="font-size:.82rem;margin-left:.5rem;color:var(--text-dim)">消耗値:${gauges[g]?.cost??9} / ゲージ数:${gauges[g]?.boxes??3}</span>
            </div>`).join('')}
            ${d.song_cost_mod ? `<div style="margin-bottom:.5rem;padding:.4rem;background:var(--surface);border:1px solid var(--accent2);border-radius:4px">
              <strong style="color:var(--accent2)">歌術使用時の消耗値補正</strong>
              <span style="font-size:.82rem;margin-left:.5rem;color:var(--text-dim)">${d.song_cost_mod>=0?'+':''}${d.song_cost_mod}（気力消耗値${gauges['気力']?.cost??9} → 歌術使用時${(gauges['気力']?.cost??9)+d.song_cost_mod}）</span>
            </div>` : ''}
            <div style="margin-bottom:.5rem;padding:.4rem;background:var(--surface);border:1px solid var(--singer);border-radius:4px">
              <strong style="color:var(--singer)">絆ゲインゲージ</strong>
              <span style="font-size:.82rem;margin-left:.5rem;color:var(--text-dim)">獲得値:${gauges['絆ゲイン']?.gain??11} / ゲージ数:${gauges['絆ゲイン']?.boxes??3}</span>
            </div>
          </div>
          <div class="form-section"><h4>HP</h4>
            <div class="hp-row">
              <div class="hp-block"><span>通常HP</span><strong>${d.hp?.normal||0}</strong></div>
              <div class="hp-block"><span>負傷HP</span><strong>${d.hp?.injured||0}</strong></div>
            </div>
            ${(d.hp?.normalBonus||d.hp?.injuredBonus) ? `<div style="font-size:.75rem;color:var(--text-dim);margin-top:.4rem">うちボーナス分： 通常HP+${d.hp?.normalBonus||0} / 負傷HP+${d.hp?.injuredBonus||0}</div>` : ''}
          </div>
          ${d.skills && Object.keys(d.skills).length ? `<div class="form-section"><h4>スキル</h4>
            <div style="font-size:.82rem">
              ${Object.entries(d.skills).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:.15rem .3rem"><span>${k}</span><strong>${v} <span style="color:var(--text-dim)">(${50+v})</span></strong></div>`).join('')}
            </div></div>` : ''}
        </div>
      </div>
      ${singerAbilitiesHTML}
      ${singerSongsHTML}
      ${combatHTML}
      ${songItemsHTML}
      ${d.equipment ? `<div class="form-section"><h4>一般アイテム</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.equipment}</pre></div>` : ''}
      ${d.ng_actions ? `<div class="form-section"><h4>NG行動</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.ng_actions}</pre></div>` : ''}
      ${d.notes ? `<div class="form-section"><h4>メモ</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.notes}</pre></div>` : ''}`;
  },

  armorDetailHTML(d, item) {
    const adv = d.adv || {};
    const finalMelee      = (d.hero_melee||0)+(d.armor_melee||0);
    const finalRanged     = (d.hero_ranged||0)+(d.armor_ranged||0);
    const finalEvasion    = (d.hero_evasion||0)+(d.armor_evasion||0);
    const finalResistance = (d.hero_resistance||0)+(d.armor_resistance||0);
    const finalRecon      = (d.hero_recon||0)+(d.armor_recon||0);

    const pilotHtml = item?._pilotName ? `
      <div class="form-section"><h4>搭乗者</h4>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <span class="stat-chip">${item._pilotType==='hero'?'英雄':'歌姫'}: ${item._pilotName}</span>
        </div>
      </div>` : '';

    const advSection = (() => {
      // 上級ルールデータが何もない場合は表示しない
      const hasAdv = adv.move_normal || adv.move_type || adv.max_load
        || (adv.weapon_types||[]).length || adv.hardpoints
        || adv.price_g || adv.maintain_g
        || (adv.hit_locations||[]).length;
      if (!hasAdv) return '';

      const hitLocTable = (adv.hit_locations||[]).length ? `
        <div style="overflow-x:auto;margin-top:.5rem">
          <table style="width:100%;border-collapse:collapse;font-size:.8rem;min-width:480px">
            <thead><tr>
              ${['D%範囲','部位','防御値','HP','0になった時の効果'].map(h=>`<th style="padding:.25rem .4rem;border:1px solid var(--border);color:var(--text-dim);background:var(--bg)">${h}</th>`).join('')}
            </tr></thead>
            <tbody>
              ${adv.hit_locations.map(loc=>`<tr>
                <td style="padding:.25rem .4rem;border:1px solid var(--border);white-space:nowrap">${loc.range||''}</td>
                <td style="padding:.25rem .4rem;border:1px solid var(--border)">${loc.part||''}</td>
                <td style="padding:.25rem .4rem;border:1px solid var(--border);text-align:center">${loc.defense||0}</td>
                <td style="padding:.25rem .4rem;border:1px solid var(--border);text-align:center">${loc.hp||''}</td>
                <td style="padding:.25rem .4rem;border:1px solid var(--border)">${loc.effect||''}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : '<p style="color:var(--text-dim);font-size:.82rem">命中部位表なし</p>';

      return `<div class="form-section" style="border-color:var(--accent2)">
        <h4 style="color:var(--accent2)">★ 上級ルール</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.3rem;font-size:.85rem;margin-bottom:.75rem">
          ${[
            ['移動速度',`通常:${adv.move_normal||'-'} / 戦闘:${adv.move_combat||'-'}`],
            ['移動属性', adv.move_type||'-'],
            ['最大荷重', adv.max_load!=null ? `${adv.max_load}（使用:${adv.used_load||0} 残:${(adv.max_load||0)-(adv.used_load||0)}）` : '-'],
            ['武装タイプ', (adv.weapon_types||[]).join('・')||'-'],
            ['ハードポイント', adv.hardpoints||'-'],
            ['価格', [adv.price_g, adv.price_fp].filter(Boolean).join(' / ')||'-'],
            ['維持費', [adv.maintain_g, adv.maintain_fp].filter(Boolean).join(' / ')||'-'],
          ].map(([k,v])=>`<div style="background:var(--surface);padding:.4rem;border-radius:4px">
            <span style="color:var(--text-dim);font-size:.72rem;display:block">${k}</span>
            <strong style="font-size:.82rem">${v}</strong>
          </div>`).join('')}
        </div>
        <strong style="font-size:.85rem">命中部位表</strong>
        ${hitLocTable}
      </div>`;
    })();

    return `
      <div class="form-section"><h4>基本情報</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.3rem;font-size:.85rem">
          ${[['名称',d.name],['型式',d.model||'-'],['TL',d.tl||0],['工房',d.workshop||'-'],['防御値',d.defense||0]].map(([k,v])=>`<div style="background:var(--surface);padding:.4rem;border-radius:4px"><span style="color:var(--text-dim);font-size:.75rem;display:block">${k}</span><strong>${v}</strong></div>`).join('')}
        </div>
      </div>
      ${pilotHtml}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div class="form-section"><h4>奏甲HP</h4>
          <div class="hp-row">
            <div class="hp-block"><span>小破HP</span><strong>${d.hp?.small||0}</strong></div>
            <div class="hp-block"><span>中破HP</span><strong>${d.hp?.medium||0}</strong></div>
            <div class="hp-block"><span>大破HP</span><strong>${d.hp?.large||0}</strong></div>
          </div>
        </div>
        <div class="form-section"><h4>戦闘修正（最終値）</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem;font-size:.85rem">
            ${[['白兵',finalMelee],['射撃',finalRanged],['回避',finalEvasion],['抵抗',finalResistance],['偵察',finalRecon],['ダメージ修正',d.armor_damage_mod||0]].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:.2rem .4rem;background:var(--surface);border-radius:4px"><span style="color:var(--text-dim)">${k}</span><strong>${v>=0?'+':''}${v}</strong></div>`).join('')}
          </div>
        </div>
      </div>
      ${d.weapons?.length ? `<div class="form-section"><h4>搭載武器</h4>
        <div style="overflow-x:auto"><table style="width:100%;font-size:.8rem;border-collapse:collapse;min-width:680px">
          <thead><tr>${['武器名','射程','最終命中','ダメージ','回数','条件','重さ','ハードポイント','メモ'].map(h=>`<th style="padding:.3rem;border-bottom:1px solid var(--border);color:var(--text-dim)">${h}</th>`).join('')}</tr></thead>
          <tbody>${d.weapons.map(w=>`<tr>${[w.name,w.range||'-',w.finalHit||'-',w.damage||'-',w.count||'1',w.condition||'-',w.weight||0,w.hardpoint||'-',w.memo||'-'].map(v=>`<td style="padding:.3rem;border-bottom:1px solid var(--border)">${v}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div></div>` : ''}
      ${d.special_rules ? `<div class="form-section"><h4>特殊ルール</h4><pre style="white-space:pre-wrap;font-size:.83rem;font-family:inherit">${d.special_rules}</pre></div>` : ''}
      ${advSection}`;
  },

  // ===== 公開/非公開切り替え =====
  async togglePublic(type, id, isPublic) {
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    try {
      await API.put(endpoint, { is_public: !isPublic });
      if (this.currentPage === 'detail') {
        await this.gotoDetail(type, id);
      } else {
        this.goto('mypage');
      }
    } catch(e) { alert('切り替えに失敗しました: ' + e.message); }
  },

  // ===== 削除 =====
  async deleteChar(type, id) {
    if (!confirm('削除しますか？この操作は取り消せません。')) return;
    const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/${id}`;
    try {
      await API.delete(endpoint);
      this.goto('mypage');
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
      const armorsMemo = (d.armors && d.armors.length)
        ? d.armors.map(a => `${a.name}：防御値${a.defense||0}${a.evasionPenalty ? ` 回避ペナルティ-${a.evasionPenalty}` : ''}`).join('\n')
        : '';
      const abilitiesMemo = (d.hero_abilities && d.hero_abilities.length)
        ? d.hero_abilities.map(a => `${a.no}.${a.name}${a.memo ? '（'+a.memo+'）' : ''}`).join('\n')
        : (d.abilities_memo || '');
      const songItemsMemo = (d.song_items && d.song_items.length)
        ? d.song_items.map(it => `${it.name}${it.memo ? '（'+it.memo+'）' : ''}`).join('\n')
        : '';
      ccfolia = {
        kind: 'character',
        data: {
          name: d.name || '英雄',
          memo: [
            `【英雄】Lv${d.level||1} ${d.gender||''} ${d.nationality||''} ${d.job||''}`,
            `通常HP:${d.hp?.normal||0} / 負傷HP:${d.hp?.injured||0} / MP:${d.hp?.mp||0}`,
            `防御値:${d.modifiers?.defense||0}`,
            armorsMemo    ? `\n[防具]\n${armorsMemo}`         : '',
            abilitiesMemo ? `\n[英雄能力]\n${abilitiesMemo}`   : '',
            songItemsMemo ? `\n[歌術アイテム]\n${songItemsMemo}` : '',
            d.equipment   ? `\n[一般アイテム]\n${d.equipment}`  : '',
            d.notes       ? `\n[メモ]\n${d.notes}`             : '',
          ].filter(Boolean).join('\n'),
          initiative: (d.abilities?.敏捷||10) - 10,
          commands: commands.map(c => c.value).join('\n'),
          status: [
            { label: '通常HP', value: d.hp?.normal||0, max: d.hp?.normal||0 },
            { label: '負傷HP', value: d.hp?.injured||0, max: d.hp?.injured||0 },
            { label: 'MP', value: d.hp?.mp||0, max: d.hp?.mp||0 },
            ...(d.gender === '男性' ? [{ label: '蟲化ポイント', value: d.mushika?.points||0, max: d.mushika?.points||0 }] : []),
          ],
          params: [
            ...ABILITY_NAMES.map(n => ({ label: n, value: String(d.abilities?.[n]||10) })),
            ...ABILITY_NAMES.map(n => {
              const mod = (d.abilities?.[n]||10) - 10;
              return { label: `${n}修正`, value: signedStr(mod) };
            }),
            { label: '白兵修正', value: signedStr(d.modifiers?.melee||0) },
            { label: '射撃修正', value: signedStr(d.modifiers?.ranged||0) },
            { label: '抵抗修正', value: signedStr(d.modifiers?.resistance||0) },
            ...(d.gender === '男性' ? [{ label: '蟲化ポイント', value: String(d.mushika?.points||0) }] : []),
          ],
        }
      };
    } else if (type === 'singer') {
      const commands = buildSingerCcfoliaCommands(d);
      // 歌姫能力メモ：新形式優先、旧形式フォールバック
      const abilitiesMemo = (d.singer_abilities && d.singer_abilities.length)
        ? d.singer_abilities.map(a => `${a.no}.${a.name}${a.memo ? '（'+a.memo+'）' : ''}`).join('\n')
        : (d.abilities_memo || '');
      // 歌術メモ：新形式優先、旧形式フォールバック
      const songsMemo = (d.singer_songs && d.singer_songs.length)
        ? d.singer_songs.map(s => `R${s.rank} ${s.name}${s.memo ? '（'+s.memo+'）' : ''}`).join('\n')
        : (d.songs || '');
      // 武器情報
      const weaponsMemo = (d.weapons && d.weapons.length)
        ? d.weapons.map(w => `${w.name}：命中${w.hit} ${w.damage} 射程${w.range}`).join('\n')
        : '';
      // 防具情報
      const armorsMemo = (d.armors && d.armors.length)
        ? d.armors.map(a => `${a.name}：防御値${a.defense||0}${a.evasionPenalty ? ` 回避ペナルティ-${a.evasionPenalty}` : ''}`).join('\n')
        : '';
      // 歌術アイテム情報
      const songItemsMemo = (d.song_items && d.song_items.length)
        ? d.song_items.map(it => `${it.name}${it.memo ? '（'+it.memo+'）' : ''}`).join('\n')
        : '';
      ccfolia = {
        kind: 'character',
        data: {
          name: d.name || '歌姫',
          memo: [
            `【歌姫】Lv${d.level||1} 絆Lv${d.bond_level||1} 階位${d.rank||1}`,
            `通常HP:${d.hp?.normal||0} / 負傷HP:${d.hp?.injured||0}`,
            `防御値:${d.modifiers?.defense||0}`,
            abilitiesMemo ? `\n[歌姫能力]\n${abilitiesMemo}`     : '',
            songsMemo     ? `\n[歌術]\n${songsMemo}`             : '',
            weaponsMemo   ? `\n[武器]\n${weaponsMemo}`           : '',
            armorsMemo    ? `\n[防具]\n${armorsMemo}`            : '',
            songItemsMemo ? `\n[歌術アイテム]\n${songItemsMemo}` : '',
            d.equipment   ? `\n[一般アイテム]\n${d.equipment}`    : '',
            d.ng_actions  ? `\n[NG行動]\n${d.ng_actions}`        : '',
          ].filter(Boolean).join('\n'),
          commands: commands.map(c => c.value).join('\n'),
          status: [
            { label: '通常HP',     value: d.hp?.normal||0,                  max: d.hp?.normal||0 },
            { label: '負傷HP',     value: d.hp?.injured||0,                 max: d.hp?.injured||0 },
            { label: '肉体ゲージ', value: d.gauges?.肉体?.boxes??3,          max: d.gauges?.肉体?.boxes??3 },
            { label: '気力ゲージ', value: d.gauges?.気力?.boxes??3,          max: d.gauges?.気力?.boxes??3 },
            { label: '絆消耗ゲージ', value: d.gauges?.絆?.boxes??3,          max: d.gauges?.絆?.boxes??3 },
            { label: '絆ゲインゲージ', value: d.gauges?.['絆ゲイン']?.boxes??3, max: d.gauges?.['絆ゲイン']?.boxes??3 },
          ],
          params: [
            ...ABILITY_NAMES.map(n => ({ label: n, value: String(d.abilities?.[n]||10) })),
            { label: '肉体消耗値', value: String(d.gauges?.肉体?.cost ?? 9) },
            { label: '気力消耗値', value: String(d.gauges?.気力?.cost ?? 9) },
            { label: '絆消耗値',   value: String(d.gauges?.絆?.cost ?? 9) },
            { label: '絆獲得値',   value: String(d.gauges?.['絆ゲイン']?.gain ?? 11) },
            { label: '歌術補正',   value: signedStr(parseInt(d.song_cost_mod)||0) },
          ],
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
          commands: commands.map(c => c.value).join('\n'),
          status: d.use_location_hp && (d.adv?.hit_locations || []).some(loc => !isNaN(parseInt(loc.hp)))
            ? (d.adv.hit_locations || [])
                .filter(loc => !isNaN(parseInt(loc.hp)))
                .map(loc => ({ label: loc.part, value: parseInt(loc.hp), max: parseInt(loc.hp) }))
            : [
                { label: '小破HP', value: d.hp?.small||0, max: d.hp?.small||0 },
                { label: '中破HP', value: d.hp?.medium||0, max: d.hp?.medium||0 },
                { label: '大破HP', value: d.hp?.large||0, max: d.hp?.large||0 },
              ],
          params: [
            { label: '白兵',       value: signedStr(finalMelee) },
            { label: '射撃',       value: signedStr(finalRanged) },
            { label: '回避',       value: signedStr((d.hero_evasion||0)+(d.armor_evasion||0)) },
            { label: '抵抗',       value: signedStr((d.hero_resistance||0)+(d.armor_resistance||0)) },
            { label: '偵察',       value: String((d.hero_recon||0)+(d.armor_recon||0)) },
            { label: '防御値',     value: String(d.defense||0) },
            { label: 'ダメージ修正', value: signedStr(d.armor_damage_mod||0) },
          ],
        }
      };
    }

    const json = JSON.stringify(ccfolia, null, 2);
    // ccfoliaページへ遷移して表示
    App._ccfoliaJson  = json;
    App._ccfoliaLabel = `${type==='hero'?'英雄':type==='singer'?'歌姫':'奏甲'}: ${d.name}`;
    App.currentPage = 'ccfolia';
    App.render();
    App._renderCcfoliaPage(json, type, id);
    window.scrollTo(0, 0);
  },

  // ===== ccfoliaページ遷移版 =====
  async gotoCcfolia(type, id) { return this.showCcfoliaJSON(type, id); },

  _renderCcfoliaPage(json, type, id) {
    const el = document.getElementById('ccfolia-content');
    if (!el) return;
    const backPage = this._prevPage || (this._detailItem ? 'detail' : 'mypage');
    el.innerHTML = `
      <div class="page-header">
        <button class="btn btn-secondary btn-sm" onclick="App._backFromCcfolia()">← 戻る</button>
        <h2>ccfolia JSON: ${this._ccfoliaLabel||''}</h2>
        <div class="page-header-actions">
          <button class="btn btn-primary btn-sm" onclick="navigator.clipboard.writeText(App._ccfoliaJson).then(()=>alert('コピーしました'))">📋 コピー</button>
        </div>
      </div>
      <p style="font-size:.85rem;color:var(--text-dim);margin-bottom:.75rem">以下のJSONをコピーして、ccfoliaのキャラクター駒作成画面でJSONとしてインポートしてください。</p>
      <div class="json-output">${json}</div>`;
  },

  _backFromCcfolia() {
    if (this._detailItem && this._detailType) {
      this.gotoDetail(this._detailType, this._detailItem.id);
    } else {
      this.goto(this._prevPage || 'mypage');
    }
  },

  // ===== 共有URL =====
  showShareURL(type, id, token) {
    const url = `${location.origin}/share/${type}/${token}`;
    const el = document.getElementById('detail-content');
    // 詳細ページ内にインライン表示
    const existing = document.getElementById('share-url-popup');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'share-url-popup';
    div.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--accent);border-radius:var(--radius);padding:1rem 1.25rem;z-index:100;box-shadow:var(--shadow);width:min(90vw,500px)';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
        <strong style="font-size:.9rem">共有URL</strong>
        <button onclick="document.getElementById('share-url-popup').remove()" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:1.2rem">✕</button>
      </div>
      <p style="font-size:.8rem;color:var(--text-dim);margin-bottom:.5rem">このURLを知っている人なら誰でも閲覧できます。</p>
      <div class="share-url-box">
        <input value="${url}" readonly style="font-size:.8rem">
        <button class="btn btn-primary btn-sm" onclick="navigator.clipboard.writeText('${url}').then(()=>alert('コピーしました'))">コピー</button>
      </div>`;
    document.body.appendChild(div);
  },
};

// ===== 共有URL処理 =====
async function handleShareURL() {
  const m = location.pathname.match(/^\/share\/(hero|singer|armor)\/([^/]+)$/);
  if (!m) return false;
  const [, type, token] = m;
  const endpoint = `/api/${type==='hero'?'heroes':type==='singer'?'singers':'armors'}/share/${token}`;
  const item = await API.get(endpoint).catch(() => null);
  if (!item) { alert('キャラクターが見つかりません'); return false; }

  App._prevPage = 'public';
  App.currentPage = 'public';
  App.render();
  await App.renderPublic();
  // 少し待ってから詳細ページへ
  setTimeout(() => App.gotoDetail(type, item.id), 100);
  return true;
}

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  const handled = await handleShareURL();
  if (!handled) {
    App.currentPage = Auth.isLoggedIn ? 'mypage' : 'auth';
    App.render();
  }
});
