// 歌姫シートフォームロジック

// ===== 歌姫能力カタログ（番号1〜63） =====
const SINGER_ABILITIES_CATALOG = [
  { no:1,  name:'能力アップ',              summary:'好きな能力値1つに+3（作成時2倍）' },
  { no:2,  name:'スキルアップ',             summary:'スキル3つの値に+5（作成時は5つ）' },
  { no:3,  name:'歌姫レベルアップ',          summary:'歌姫レベル+1、好きな能力値+1、HP+5' },
  { no:4,  name:'階位上昇',                summary:'階位+1（作成時2倍）' },
  { no:5,  name:'絆レベルアップ',            summary:'絆レベル+1（作成時以外はコスト2倍）' },
  { no:6,  name:'戦闘支援（ダメージ）',      summary:'武器スキル2つに+10、戦闘支援でダメージ増加' },
  { no:7,  name:'戦闘支援（命中値）',        summary:'武器スキル2つに+10、戦闘支援で命中値UP' },
  { no:8,  name:'戦闘系歌姫',              summary:'武器スキル2つに+10、単独で戦闘参加可' },
  { no:9,  name:'突撃娘',                  summary:'【筋力】+4、両手武器を片手で扱える' },
  { no:10, name:'不戦歌姫',               summary:'戦闘参加で降伏か気絶、追加歌姫能力2個か英雄能力1つ授与' },
  { no:11, name:'九死に一生',              summary:'回避修正+10' },
  { no:12, name:'コネ',                   summary:'FP獲得、コネでの交渉に+20' },
  { no:13, name:'家宝',                   summary:'60万G以下の歌術アイテムを1〜2個獲得' },
  { no:14, name:'スーパー歌姫',            summary:'英雄の能力値低下→歌姫能力値UP、追加能力3つ' },
  { no:15, name:'ハイパー歌姫',            summary:'肉体・気力・絆ゲージ+1、消耗値+2' },
  { no:16, name:'奏甲スキー',              summary:'チューン2つを無償・ノーチェックで獲得' },
  { no:17, name:'特殊起動：パワーモード',   summary:'白兵修正+10、防御値+2、ダメージ修正+5' },
  { no:18, name:'特殊起動：射撃モード',     summary:'射撃修正+20、偵察修正+15' },
  { no:19, name:'特殊起動：甲殻モード',     summary:'防御値+5、各HP+5、抵抗修正+30' },
  { no:20, name:'特殊起動：スピードモード', summary:'白兵・回避・抵抗修正+10、不整地移動能力獲得' },
  { no:21, name:'特殊起動：待ち伏せモード', summary:'射撃・回避・抵抗・偵察修正+20、防御値+4' },
  { no:22, name:'特殊起動改善',            summary:'指定モード起動時にペアの【精神力】+4' },
  { no:23, name:'特殊起動：リミッタOffモード', summary:'攻撃回数+1、白兵・射撃・回避・抵抗+10、防御値+2' },
  { no:24, name:'起動安定',               summary:'障害モードペナルティ-10に軽減' },
  { no:25, name:'起動延長',               summary:'起動停止時に+3ターン起動継続' },
  { no:26, name:'奏甲乗り',               summary:'歌姫が英雄のごとく奏甲に搭乗・操縦可能' },
  { no:27, name:'人外',                   summary:'肉体・気力消耗値+1、肉体ゲージ+1' },
  { no:28, name:'HPアップ',               summary:'通常/負傷HP+10、自然回復量+3' },
  { no:29, name:'MPアップ',               summary:'気力消耗値+1（偶数回目は気力ゲージ+1）' },
  { no:30, name:'頭脳明晰',               summary:'絆NG行動追加、歌姫の提案、看破（80%でウソ見抜く）' },
  { no:31, name:'メガネっ子',              summary:'【知力】+3・【精神力】-3、気力消耗値+1' },
  { no:32, name:'ダンマリ',               summary:'消耗チェック+1倍（全成功でダメージ消去か獲得）' },
  { no:33, name:'天然／不思議ちゃん',      summary:'絆ダメージ/ゲイン40%で反対側に入る、回避修正+10' },
  { no:34, name:'電波',                   summary:'気力ゲージ+1、抵抗修正+10' },
  { no:35, name:'ワガママ/退屈娘',         summary:'絆NG行動追加し英雄能力1つ授与か歌姫能力2つ獲得' },
  { no:36, name:'イケイケ',               summary:'気力ゲージ+1、特殊起動効果1.5倍' },
  { no:37, name:'バカ',                   summary:'肉体・気力消耗値+1、絆獲得値+1' },
  { no:38, name:'のーてんき',             summary:'気力・絆のNG行動消耗値に+3、自然回復量2倍' },
  { no:39, name:'どじっ子',               summary:'ゾロ目失敗をトラブルに発展させ獲得チェック' },
  { no:40, name:'デレデレ',               summary:'絆レベル+1、獲得値+1、英雄のMP消費を肩代わり可' },
  { no:41, name:'スーパー英雄',            summary:'歌姫の能力値を下げて英雄の能力値をUP' },
  { no:42, name:'ハイパー英雄',            summary:'英雄の能力値合計+10、英雄能力1つ授与' },
  { no:43, name:'病弱',                   summary:'ハイパー英雄と同じ特典を英雄に、【精神力】か【知力】+3' },
  { no:44, name:'撫子',                   summary:'一般NG行動を軽減、選択NG行動の一部を選ばなくてもよい' },
  { no:45, name:'ご奉仕',                 summary:'選択/普遍NG行動での絆消耗チェックを無視' },
  { no:46, name:'無垢',                   summary:'癒しの歌の効果2倍、絆消耗値+2' },
  { no:47, name:'妹／マスコット系',         summary:'絆消耗値-1・獲得値+1、英雄MP回復、次スキルチェック+10' },
  { no:48, name:'強き絆',                 summary:'通常HP等が0になるたびに獲得チェック可' },
  { no:49, name:'お姫様',                 summary:'《交渉》《恫喝》に+10（選んだ王国出身者には+30）' },
  { no:50, name:'リーダーシップ',          summary:'歌姫スキルが英雄より高ければ最大3つに+5' },
  { no:51, name:'カリスマ歌姫',            summary:'階位+1、《交渉》《恫喝》に+20' },
  { no:52, name:'プライド',               summary:'抵抗修正+10、肉体と気力ゲージ全印まで気絶・死亡しない' },
  { no:53, name:'複雑な女心',              summary:'英雄の危機（戦闘支援使用可）、絆ゲージをリセット' },
  { no:54, name:'激情家',                 summary:'絆消耗値-2・獲得値+2、絆ゲージダメージ時に肉体・気力にも印' },
  { no:55, name:'反感（男勝り）',          summary:'絆消耗値-2・獲得値-2、英雄と同時スキルチェックで+10' },
  { no:56, name:'ツンデレ',               summary:'絆レベル+1、絆消耗値-2・獲得値+1' },
  { no:57, name:'モラルレス',              summary:'英雄の悪事NGを無視できる、禁忌歌術の抵抗修正+20' },
  { no:58, name:'破滅系',                 summary:'絆消耗値+2・獲得値-2、一部NG行動を選ばなくてよい' },
  { no:59, name:'タフ',                   summary:'抵抗修正+10、肉体ゲージ+1' },
  { no:60, name:'やり手',                 summary:'《鑑定》+5、20万G獲得、気力ゲージ+1' },
  { no:61, name:'歌術の素質',             summary:'気力消耗値+1、奏甲から歌術行使可能、歌術+1ランク' },
  { no:62, name:'歌術の天才',             summary:'ランクスキップ可、歌術ブースト' },
  { no:63, name:'忌み歌使い',             summary:'禁忌歌術習得可能' },
];

// ===== 歌術カタログ（効果テキスト付き） =====
const SONGS_CATALOG = [
  { no:64, name:'癒しの歌「花びらの子守唄」', maxRank:4,
    effects: {
      1: '気力×2回消耗。対象のHP+2D10回復（ペア英雄は+絆LV分追加）',
      2: '上記＋病気を治療',
      3: '上記＋毒を解除',
      4: '上記＋呪いを解除',
    }},
  { no:65, name:'個人戦闘補助の歌「早足のワルツ」', maxRank:4,
    effects: {
      1: '気力×1回消耗。A:命中値+10 または B:HP+20（1戦闘中）',
      2: '上記＋回避修正+10',
      3: '上記＋防御値+[3+絆LV]',
      4: '上記の効果を可聴範囲内の全員に適用',
    }},
  { no:66, name:'奏甲戦闘補助の歌「歌楽器ソナタ」', maxRank:3,
    effects: {
      1: '気力×1回消耗。奏甲の白兵命中+10（1戦闘中）',
      2: 'A:射撃命中+10 または B:回避修正+10',
      3: 'A:防御値+3 または B:他の奏甲1機にも適用可',
    }},
  { no:67, name:'打撃増加の歌「剣と盾のノクターン」', maxRank:3,
    effects: {
      1: '気力×1回消耗。個人戦闘のダメージ+[3+絆LV]（1戦闘中）',
      2: '上記＋奏甲のダメージ+[3+絆LV]',
      3: '可聴範囲内の他1人/1機にも適用可',
    }},
  { no:68, name:'身代わりの歌「偉大なる精霊の葬送曲」', maxRank:4,
    effects: {
      1: '気力×2回消耗。ペア英雄への攻撃を歌姫が肩代わり（1戦闘中）',
      2: '上記＋ペア奏甲への攻撃を肩代わり',
      3: '可聴範囲内の任意キャラへの攻撃を肩代わり',
      4: '可聴範囲内の任意奏甲への攻撃を肩代わり',
    }},
  { no:69, name:'探知の歌「大地の調べ」', maxRank:5,
    effects: {
      1: '気力×1回消耗。A:周囲照明 または B:幻糸の乱れ探知（30分）',
      2: '歌術の存在を探知',
      3: '1日前の足跡を探知',
      4: '透明な存在を探知',
      5: '1週間前の足跡を探知',
    }},
  { no:70, name:'蟲退治の歌「常しえの巨人の狂い歌」', maxRank:4,
    effects: {
      1: '気力×1回消耗。全味方の奇声抵抗+20（1戦闘中）',
      2: '奇声1種を打ち消す',
      3: '蟲1体に3D10ダメージ（瞬間）',
      4: 'R3の効果＋1D10ターン麻痺',
    }},
  { no:71, name:'抵抗の歌「夢見る白馬のアリア」', maxRank:4,
    effects: {
      1: '気力×1回消耗。本人とペア英雄の抵抗修正+20（30分）',
      2: '可聴範囲内の全員の抵抗修正+20',
      3: '歌術効果1つを無視可',
      4: '歌術1つを解除（コスト×2）',
    }},
  { no:72, name:'特殊起動補助の歌「ザ・トッカータ」', maxRank:4,
    effects: {
      1: '気力×1回消耗。特殊起動時【精神力】+1（1戦闘中）',
      2: '障害モードのペナルティを無視',
      3: '起動延長と同じ効果',
      4: '英雄なしで特殊起動可（コスト×3）',
    }},
  { no:73, name:'リンクの歌「姫と英雄の二重奏」', maxRank:4,
    effects: {
      1: '気力×1回消耗。ペア英雄の方角・距離を感知（30分）',
      2: 'テレパシーで会話可',
      3: '絆レベルを一時的に+1',
      4: '絆レベルを一時的に+2',
    }},
  { no:74, name:'奏甲補修の歌「彷徨い者のヒム」', maxRank:4,
    effects: {
      1: '気力×2回消耗。奏甲の部位HP0の効果を1つ半減（瞬間）',
      2: '2部位のHPを回復',
      3: '部位HP0の効果1つを無視',
      4: '維持費0（R2以上は上級ルール要）',
    }},
  { no:75, name:'奏甲サポートの歌「ストラーマイン序曲」', maxRank:5,
    effects: {
      1: '気力×1回消耗。移動速度UP（偶数ターンに2回移動可・30分）',
      2: '水中移動が可能に',
      3: '地表1m浮遊が可能に',
      4: '水上1m浮遊が可能に',
      5: '効果が8時間持続',
    }},
  { no:76, name:'結界の歌「小鳥のための小練習曲」', maxRank:4,
    effects: {
      1: '気力×1回消耗。歌姫自身に防御値5の結界（30分）',
      2: 'ペア英雄に防御値[絆LV+3]の結界',
      3: 'A:指定対象に防御値5 または B:魔物への障壁',
      4: '精霊を退散させる',
    }},
  { no:77, name:'転移とリンクの歌「金と銀と鋼の組曲」', maxRank:5,
    effects: {
      1: '気力×1回消耗。接触対象の居場所を感知（30分）',
      2: '2人でお互いに会話可（30分）',
      3: 'A:持続1D10日 または B:念話',
      4: '奏甲をテレポート',
      5: '恒久的な転移門を設置',
    }},
  { no:78, name:'支配の歌（禁忌）「唾棄されし者どもの変奏曲」', maxRank:4,
    effects: {
      1: '気力×2回消耗。接触した対象の記憶を操作（30分）',
      2: '生物1体を精神支配',
      3: '持続を24時間延長',
      4: '3体まで同時支配',
    }},
  { no:79, name:'打撃の歌（禁忌）「神々の雄たけび」', maxRank:6,
    effects: {
      1: '気力×2回消耗。生物1体に1D10ダメージ（瞬間）',
      2: '生物1体に2D10ダメージ',
      3: '生物2体に2D10ダメージ',
      4: '可聴範囲内の全生物に2D10ダメージ',
      5: '生物1体に4D10ダメージ・複数HP適用',
      6: 'R5の効果＋対象の回避修正-20',
    }},
  { no:80, name:'精神攻撃の歌（禁忌）「宮廷道化のサンバ」', maxRank:4,
    effects: {
      1: '気力×2回消耗。A:歌姫に気力消耗×2 または B:2D10MPダメージ（瞬間）',
      2: '奇声効果1つをコピー',
      3: '対象を気絶またはMP0に',
      4: '可聴範囲内の全員に効果',
    }},
  { no:81, name:'幻糸操作の歌（禁忌）「落ちて崩れし人形の前奏曲」', maxRank:6,
    effects: {
      1: '気力×1回消耗。対象が話せなくなる（1D10ターン）',
      2: '歌姫を行動不能にする',
      3: '奏甲を障害モード化・特殊起動解除',
      4: '奏甲の機能を停止',
      5: '聖霊を破壊',
      6: '歌姫を死亡させる',
    }},
];

// 戦闘系スキル（射程「白」判定用）
const MELEE_SKILLS = new Set(['接近戦','剣技','斧／槌戦闘','槍／棒術','盾防御','特殊武器']);

const SingerForm = {
  defaults() {
    return {
      name: '', origin: '', age: '', level: 1, rank: 1, bond_level: 1,
      abilities: { 筋力: 10, 器用さ: 10, 敏捷: 10, 生命力: 10, 知力: 10, 精神力: 10 },
      skills: { 'アーカイア知識': 20, '歌術知識': 15, '蟲知識': 15, '回避': 10, '隠蔽': 5, '料理': 5 },
      hp: { normal: 0, injured: 0 },
      modifiers: { melee: 0, ranged: 0, evasion: 0, resistance: 0, defense: 0 },
      gauges: {
        '肉体': { cost: 9, gain: 9,  boxes: 3 },
        '気力': { cost: 9, gain: 9,  boxes: 3 },
        '絆':   { cost: 9, gain: 11, boxes: 3 },
      },
      singer_abilities: [], // [{no, name, memo}]
      singer_songs:     [], // [{no, name, rank, memo}]
      weapons: [],          // 戦闘系歌姫用武器
      equipment: '',        // 戦闘系歌姫用防具・装備
      ng_actions: '',
      notes: '',
      // 旧互換フィールド
      abilities_memo: '',
      songs: '',
    };
  },

  // 歌姫能力行HTML
  _abilityRow(ab, i) {
    const noOpts = SINGER_ABILITIES_CATALOG.map(c =>
      `<option value="${c.no}" ${ab.no == c.no ? 'selected' : ''}>${c.no}. ${c.name}</option>`
    ).join('');
    return `<tr data-sai="${i}">
      <td style="min-width:220px">
        <select name="sab_no" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.25rem .4rem;border-radius:4px;font-size:.8rem" onchange="SingerForm._updateAbilitySummary(this)">
          <option value="">-- 選択 --</option>
          ${noOpts}
        </select>
      </td>
      <td style="min-width:160px;font-size:.75rem;color:var(--text-dim)" class="sab-summary">${ab.no ? (SINGER_ABILITIES_CATALOG.find(c=>c.no==ab.no)?.summary||'') : ''}</td>
      <td style="min-width:200px"><input name="sab_memo" value="${(ab.memo||'').replace(/"/g,'&quot;')}" placeholder="習得時のメモ（適用対象など）" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.2rem .4rem;border-radius:4px;font-size:.8rem"></td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="SingerForm.removeAbility(${i})">×</button></td>
    </tr>`;
  },

  _updateAbilitySummary(sel) {
    const tr = sel.closest('tr');
    const td = tr?.querySelector('.sab-summary');
    const no = parseInt(sel.value);
    if (td) td.textContent = no ? (SINGER_ABILITIES_CATALOG.find(c=>c.no===no)?.summary||'') : '';
  },

  // 歌術行HTML
  _songRow(s, i) {
    const noOpts = SONGS_CATALOG.map(c =>
      `<option value="${c.no}" ${s.no == c.no ? 'selected' : ''}>${c.no}. ${c.name}</option>`
    ).join('');
    const rankOpts = [1,2,3,4,5,6].map(r =>
      `<option value="${r}" ${s.rank == r ? 'selected' : ''}>R${r}</option>`
    ).join('');
    // 効果テキストを取得
    const catalog  = SONGS_CATALOG.find(c => c.no == s.no);
    const effectText = catalog && s.rank ? (catalog.effects[s.rank] || '') : '';
    return `<tr data-ssi="${i}">
      <td style="min-width:240px">
        <select name="ssong_no" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.25rem .4rem;border-radius:4px;font-size:.8rem" onchange="SingerForm._updateSongEffect(this)">
          <option value="">-- 選択 --</option>
          ${noOpts}
        </select>
      </td>
      <td style="width:70px">
        <select name="ssong_rank" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.25rem .4rem;border-radius:4px;font-size:.8rem" onchange="SingerForm._updateSongEffect(this)">
          ${rankOpts}
        </select>
      </td>
      <td style="min-width:220px;font-size:.74rem;color:var(--text-dim)" class="ssong-effect">${effectText}</td>
      <td style="min-width:160px"><input name="ssong_memo" value="${(s.memo||'').replace(/"/g,'&quot;')}" placeholder="メモ（コスト・注意など）" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.2rem .4rem;border-radius:4px;font-size:.8rem"></td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="SingerForm.removeSong(${i})">×</button></td>
    </tr>`;
  },

  _updateSongEffect(el) {
    const tr  = el.closest('tr');
    const td  = tr?.querySelector('.ssong-effect');
    if (!td) return;
    const no   = parseInt(tr.querySelector('[name=ssong_no]')?.value)   || 0;
    const rank = parseInt(tr.querySelector('[name=ssong_rank]')?.value) || 1;
    const catalog = SONGS_CATALOG.find(c => c.no === no);
    td.textContent = catalog ? (catalog.effects[rank] || '') : '';
  },

  renderForm(data = null) {
    const d = data ? { ...this.defaults(), ...data } : this.defaults();
    if (!d.singer_abilities) d.singer_abilities = [];
    if (!d.singer_songs)     d.singer_songs     = [];
    if (!d.weapons)          d.weapons          = [];
    const ab     = d.abilities;
    const gauges = d.gauges || this.defaults().gauges;

    const abilityInputs = ABILITY_NAMES.map(name => `
      <div class="form-group">
        <label>${name}</label>
        <input type="number" min="2" max="20" name="sab_${name}" value="${ab[name] || 10}">
        <small style="color:var(--text-dim)">修正:${(ab[name]||10)-10>=0?'+':''}${(ab[name]||10)-10}</small>
      </div>`).join('');

    const skillRows = SINGER_SKILLS.map(s => {
      const val = d.skills[s.name] || 0;
      return `<tr>
        <td>${s.name}</td>
        <td style="color:var(--text-dim);font-size:.75rem">${s.category}</td>
        <td><input type="number" min="0" max="99" name="sskill_${s.name}" value="${val}" style="width:70px"></td>
        <td style="color:var(--text-dim);font-size:.8rem">${val > 0 ? 50 + val : '-'}</td>
      </tr>`;
    }).join('');

    // 歌姫能力行
    const abilityRows = d.singer_abilities.map((ab, i) => this._abilityRow(ab, i)).join('');
    // 旧データ互換
    const legacyAbilityMemo = (!d.singer_abilities.length && d.abilities_memo)
      ? `<div class="alert alert-error" style="font-size:.8rem;margin-bottom:.5rem">⚠ 旧形式のテキストデータが存在します。以下を参照して上の表に移してください。<br><pre style="white-space:pre-wrap;margin-top:.3rem">${d.abilities_memo}</pre></div>`
      : '';

    // 歌術行
    const songRows = d.singer_songs.map((s, i) => this._songRow(s, i)).join('');
    const legacySongMemo = (!d.singer_songs.length && d.songs)
      ? `<div class="alert alert-error" style="font-size:.8rem;margin-bottom:.5rem">⚠ 旧形式のテキストデータが存在します。以下を参照して上の表に移してください。<br><pre style="white-space:pre-wrap;margin-top:.3rem">${d.songs}</pre></div>`
      : '';

    // 武器行（戦闘系歌姫用）
    const weaponRows = d.weapons.map((w, i) => `
      <tr data-wi="${i}">
        <td><input name="swn" value="${w.name||''}" placeholder="武器名"></td>
        <td><input name="swh" value="${w.hit||''}" placeholder="40" style="width:55px" type="number"></td>
        <td><input name="swsk" value="${w.skill||''}" placeholder="剣技"></td>
        <td><input name="swd" value="${w.damage||''}" placeholder="1D10+5"></td>
        <td><input name="swr" value="${w.range||'白'}" style="width:45px"></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="SingerForm.removeWeapon(${i})">×</button></td>
      </tr>`).join('');

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
            <div class="form-group"><label>通常HP（自動計算:筋+器）</label><input type="number" name="shp_normal" value="${d.hp.normal}" id="shp-normal"></div>
            <div class="form-group"><label>負傷HP（自動計算:敏+生）</label><input type="number" name="shp_injured" value="${d.hp.injured}" id="shp-injured"></div>
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
          <h4>歌姫能力</h4>
          ${legacyAbilityMemo}
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.82rem">
              <thead>
                <tr>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">能力名</th>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">効果サマリー</th>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">メモ</th>
                  <th style="width:36px"></th>
                </tr>
              </thead>
              <tbody id="singer-ability-tbody">${abilityRows}</tbody>
            </table>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-top:.5rem" onclick="SingerForm.addAbility()">＋ 歌姫能力を追加</button>
        </div>

        <div class="form-section">
          <h4>歌術</h4>
          ${legacySongMemo}
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.82rem">
              <thead>
                <tr>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">歌術名</th>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left;width:70px">ランク</th>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">効果（自動表示）</th>
                  <th style="padding:.3rem .4rem;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:left">メモ</th>
                  <th style="width:36px"></th>
                </tr>
              </thead>
              <tbody id="singer-song-tbody">${songRows}</tbody>
            </table>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-top:.5rem" onclick="SingerForm.addSong()">＋ 歌術を追加</button>
        </div>

        <div class="form-section" style="border-color:var(--singer)">
          <h4 style="color:var(--singer)">⚔ 戦闘系歌姫：武器・装備</h4>
          <p style="font-size:.8rem;color:var(--text-dim);margin-bottom:.75rem">「戦闘支援（6番/7番）」または「戦闘系歌姫（8番）」を取得した歌姫のみ入力してください。</p>
          <div style="overflow-x:auto">
            <table class="weapon-table" style="min-width:420px">
              <thead><tr><th>武器名</th><th>命中値</th><th>スキル</th><th>ダメージ</th><th>射程</th><th></th></tr></thead>
              <tbody id="singer-weapon-tbody">${weaponRows}</tbody>
            </table>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-top:.5rem" onclick="SingerForm.addWeapon()">＋ 武器を追加</button>
          <div class="form-group" style="margin-top:.75rem">
            <label>防具・装備品</label>
            <textarea name="sequipment" rows="2" placeholder="例：皮ヨロイ（防御値3）、小盾（防御値2）...">${d.equipment||''}</textarea>
          </div>
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
    const g  = n => f.querySelector(`[name="${n}"]`)?.value || '';
    const gi = n => parseInt(g(n)) || 0;

    const abilities = {};
    for (const name of ABILITY_NAMES) abilities[name] = gi(`sab_${name}`);

    const skills = {};
    for (const s of SINGER_SKILLS) {
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

    // 歌姫能力
    const singer_abilities = [];
    for (const row of f.querySelectorAll('#singer-ability-tbody tr')) {
      const no   = parseInt(row.querySelector('[name=sab_no]')?.value) || 0;
      const memo = row.querySelector('[name=sab_memo]')?.value?.trim() || '';
      if (!no) continue;
      const catalog = SINGER_ABILITIES_CATALOG.find(c => c.no === no);
      singer_abilities.push({ no, name: catalog?.name || '', memo });
    }

    // 歌術
    const singer_songs = [];
    for (const row of f.querySelectorAll('#singer-song-tbody tr')) {
      const no   = parseInt(row.querySelector('[name=ssong_no]')?.value) || 0;
      const rank = parseInt(row.querySelector('[name=ssong_rank]')?.value) || 1;
      const memo = row.querySelector('[name=ssong_memo]')?.value?.trim() || '';
      if (!no) continue;
      const catalog = SONGS_CATALOG.find(c => c.no === no);
      singer_songs.push({ no, name: catalog?.name || '', rank, memo });
    }

    // 武器
    const weapons = [];
    for (const row of f.querySelectorAll('#singer-weapon-tbody tr')) {
      const name = row.querySelector('[name=swn]')?.value?.trim();
      if (!name) continue;
      weapons.push({
        name,
        hit:    parseInt(row.querySelector('[name=swh]')?.value) || 0,
        skill:  row.querySelector('[name=swsk]')?.value || '',
        damage: row.querySelector('[name=swd]')?.value || '',
        range:  row.querySelector('[name=swr]')?.value || '白',
      });
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
      singer_abilities,
      singer_songs,
      weapons,
      equipment:  g('sequipment'),
      ng_actions: g('sng_actions'),
      notes:      g('snotes'),
      // 旧フィールドはクリア
      abilities_memo: '',
      songs: '',
    };
  },

  addAbility() {
    const tbody = document.getElementById('singer-ability-tbody');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.sai = i;
    tr.innerHTML = this._abilityRow({ no: '', memo: '' }, i);
    tbody.appendChild(tr);
  },

  removeAbility(i) {
    const rows = document.querySelectorAll('#singer-ability-tbody tr');
    if (rows[i]) rows[i].remove();
  },

  addSong() {
    const tbody = document.getElementById('singer-song-tbody');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.ssi = i;
    tr.innerHTML = this._songRow({ no: '', rank: 1, memo: '' }, i);
    tbody.appendChild(tr);
  },

  removeSong(i) {
    const rows = document.querySelectorAll('#singer-song-tbody tr');
    if (rows[i]) rows[i].remove();
  },

  addWeapon() {
    const tbody = document.getElementById('singer-weapon-tbody');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.wi = i;
    tr.innerHTML = `
      <td><input name="swn" placeholder="武器名"></td>
      <td><input name="swh" placeholder="40" style="width:55px" type="number"></td>
      <td><input name="swsk" placeholder="剣技"></td>
      <td><input name="swd" placeholder="1D10+5"></td>
      <td><input name="swr" value="白" style="width:45px"></td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="SingerForm.removeWeapon(${i})">×</button></td>`;
    tbody.appendChild(tr);
  },

  removeWeapon(i) {
    const rows = document.querySelectorAll('#singer-weapon-tbody tr');
    if (rows[i]) rows[i].remove();
  },

  attachAutoCalc() {
    const updateAll = () => {
      const vals = {};
      for (const name of ABILITY_NAMES) {
        vals[name] = parseInt(document.querySelector(`[name="sab_${name}"]`)?.value) || 10;
      }
      const mod = v => v - 10;

      const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      setVal('shp-normal',      vals.筋力   + vals.器用さ);
      setVal('shp-injured',     vals.敏捷   + vals.生命力);
      setVal('smod-melee',      mod(vals.筋力)   + mod(vals.敏捷));
      setVal('smod-ranged',     mod(vals.器用さ)  + mod(vals.知力));
      setVal('smod-resistance', mod(vals.精神力) + mod(vals.生命力));

      const costTbl = v => {
        if (v <= -7) return 6; if (v <= -4) return 7; if (v <= -1) return 8;
        if (v <= 2)  return 9; if (v <= 5)  return 10; if (v <= 8)  return 11;
        if (v <= 11) return 12; return 13;
      };
      const physCostEl = document.querySelector('[name="gauge_肉体_cost"]');
      const menCostEl  = document.querySelector('[name="gauge_気力_cost"]');
      if (physCostEl) physCostEl.value = costTbl(mod(vals.筋力) + mod(vals.生命力));
      if (menCostEl)  menCostEl.value  = costTbl(mod(vals.精神力) + mod(vals.知力));

      document.querySelectorAll('[name^="sab_"]').forEach(el => {
        if (!el.name.startsWith('sab_') || el.name === 'sab_no' || el.name === 'sab_memo') return;
        const v = parseInt(el.value) || 10;
        const small = el.nextElementSibling;
        if (small?.tagName === 'SMALL') small.textContent = `修正:${v-10>=0?'+':''}${v-10}`;
      });

      document.querySelectorAll('#singer-skill-tbody tr').forEach(row => {
        const input = row.querySelector('input[type=number]');
        const lastTd = row.cells[3];
        if (input && lastTd) {
          const v = parseInt(input.value) || 0;
          lastTd.textContent = v > 0 ? (50 + v) : '-';
        }
      });
    };

    document.querySelectorAll('[name^="sab_"]:not([name=sab_no]):not([name=sab_memo])').forEach(el => el.addEventListener('input', updateAll));
    document.querySelectorAll('[name^="sskill_"]').forEach(el => el.addEventListener('input', () => {
      // スキル成功値のリアルタイム更新
      document.querySelectorAll('#singer-skill-tbody tr').forEach(row => {
        const input = row.querySelector('input[type=number]');
        const lastTd = row.cells[3];
        if (input && lastTd) {
          const v = parseInt(input.value) || 0;
          lastTd.textContent = v > 0 ? (50 + v) : '-';
        }
      });
    }));
    updateAll();
  }
};
