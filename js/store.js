/* ==========================================================================
   Store — tiny localStorage-backed state with change subscriptions.
   Exposes: Store
   ========================================================================== */
const Store = (() => {
  const PREFIX = 'crafters:v1:';
  const defaults = {
    liked: [],                 // post ids
    saved: [],                 // product ids
    following: ['c1', 'c2'],   // crafter ids
    cart: [],                  // { t: 'p' | 'm', id, qty }
    location: 'koramangala',   // DATA.locations id
    recent: [],                // recently viewed product ids
    searches: ['hamper', 'crochet', 'candles', 'wedding gifts'], // recent search strings (seeded for first run)
    orders: [],                // placed orders
    profile: { name: '', phone: '', address: '' },
  };

  const state = {};
  Object.keys(defaults).forEach(k => {
    try {
      const raw = localStorage.getItem(PREFIX + k);
      state[k] = raw ? JSON.parse(raw) : structuredClone(defaults[k]);
    } catch { state[k] = structuredClone(defaults[k]); }
  });

  const listeners = new Set();
  const subscribe = fn => (listeners.add(fn), () => listeners.delete(fn));

  function commit(key) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(state[key])); } catch { /* storage full/blocked */ }
    listeners.forEach(fn => fn(key));
  }

  const get = key => state[key];
  const set = (key, value) => { state[key] = value; commit(key); };
  const has = (key, id) => state[key].includes(id);

  function toggle(key, id) {
    const list = state[key];
    const i = list.indexOf(id);
    i === -1 ? list.unshift(id) : list.splice(i, 1);
    commit(key);
    return i === -1;
  }

  /* ----- cart ----- */
  const cartKey = (t, id) => t + ':' + id;
  function cartAdd(t, id, qty = 1, max = 99, note = '') {
    const line = state.cart.find(l => l.t === t && l.id === id);
    if (line) { line.qty = Math.min(max, line.qty + qty); if (note) line.note = note; }
    else state.cart.push({ t, id, qty: Math.min(max, qty), ...(note && { note }) });
    commit('cart');
  }
  function cartSetQty(t, id, qty, max = 99) {
    const line = state.cart.find(l => l.t === t && l.id === id);
    if (!line) return;
    line.qty = Math.max(1, Math.min(max, qty));
    commit('cart');
  }
  function cartRemove(t, id) {
    state.cart = state.cart.filter(l => !(l.t === t && l.id === id));
    commit('cart');
  }
  const cartClear = () => set('cart', []);
  const cartCount = () => state.cart.reduce((n, l) => n + l.qty, 0);

  /* ----- recents ----- */
  function pushRecent(id) {
    state.recent = [id, ...state.recent.filter(x => x !== id)].slice(0, 12);
    commit('recent');
  }
  function pushSearch(q) {
    q = q.trim();
    if (!q) return;
    state.searches = [q, ...state.searches.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
    commit('searches');
  }

  return { get, set, has, toggle, subscribe, cartKey, cartAdd, cartSetQty, cartRemove, cartClear, cartCount, pushRecent, pushSearch };
})();
