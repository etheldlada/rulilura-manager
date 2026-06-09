// API通信ユーティリティ
const API = {
  _token: localStorage.getItem('rl_token'),

  setToken(t) {
    this._token = t;
    if (t) localStorage.setItem('rl_token', t);
    else localStorage.removeItem('rl_token');
  },

  async request(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (this._token) opts.headers['Authorization'] = `Bearer ${this._token}`;
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },

  get:    (path)        => API.request('GET',    path),
  post:   (path, body)  => API.request('POST',   path, body),
  put:    (path, body)  => API.request('PUT',    path, body),
  delete: (path)        => API.request('DELETE', path),
};

// 認証状態
const Auth = {
  get user() {
    try {
      const t = API._token;
      if (!t) return null;
      return JSON.parse(atob(t.split('.')[1]));
    } catch { return null; }
  },
  get isLoggedIn() { return !!this.user; },
  logout() {
    API.setToken(null);
    App.render();
  }
};
