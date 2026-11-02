/* ==========================================================================
   App — hash router, global action delegation, bootstrap.
   To add a page: add a route below + a function in pages.js.
   To add an interaction: add a handler to `actions` (data-action="name").
   ========================================================================== */
(() => {
  const { $, $$, esc, icon } = UI;
  const view = $('#view');

  /* ---------- routes ---------- */
  const routes = [
    { re: /^\/home$/, nav: 'home', fn: () => Pages.home() },
    { re: /^\/search$/, nav: 'search', fn: (m, q) => Pages.search(q) },
    { re: /^\/market$/, nav: 'market', fn: (m, q) => Pages.market(q) },
    { re: /^\/market\/shop\/([\w-]+)$/, nav: 'market', detail: true, fn: m => Pages.shop(m[1]) },
    { re: /^\/me$/, nav: 'profile', fn: () => Pages.me() },
    { re: /^\/post\/([\w-]+)$/, nav: 'search', detail: true, fn: m => Pages.post(m[1]) },
    { re: /^\/design$/, nav: 'profile', detail: true, fn: () => Pages.design() },
    { re: /^\/c\/([\w.-]+)$/, nav: null, detail: true, fn: (m, q) => Pages.crafter(m[1], q) },
    { re: /^\/product\/([\w-]+)$/, nav: null, detail: true, fn: m => Pages.product(m[1]) },
  ];

  let lastNav = 'home';
  let depth = 0;

  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/home';
    const [path, qs = ''] = raw.split('?');
    return { path: path.replace(/\/+$/, '') || '/home', query: Object.fromEntries(new URLSearchParams(qs)) };
  }

  function render() {
    const { path, query } = parseHash();
    let route, match;
    for (const r of routes) { match = path.match(r.re); if (match) { route = r; break; } }
    if (!route) { location.replace('#/home'); return; }

    UI.closeModal(true);
    const page = route.fn(match, query);
    document.title = `${page.title} · Crafters`;
    view.innerHTML = page.html;
    view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
    UI.sync(view);
    page.after?.();

    if (route.nav) lastNav = route.nav;
    $$('[data-nav]').forEach(a => {
      const on = a.dataset.nav === lastNav;
      a.classList.toggle('is-active', on);
      on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
    $('#back-btn').hidden = !route.detail;
    $('.brand').classList.toggle('brand-hide-mobile', !!route.detail);
    window.scrollTo(0, 0);
  }

  /* ---------- global actions ---------- */
  const actions = {
    ...Pages.actions,
    ...Cart.actions,

    like: el => {
      const on = Store.toggle('liked', el.dataset.id);
      UI.sync();
      if (on) el.classList.add('pop');
    },
    save: el => {
      const on = Store.toggle('saved', el.dataset.id);
      UI.sync();
      UI.toast(on ? 'Saved to your profile' : 'Removed from saved');
    },
    follow: el => {
      const c = DATA.byId.crafter[el.dataset.id];
      const on = Store.toggle('following', c.id);
      UI.sync();
      UI.toast(on ? `Following ${c.name}` : `Unfollowed ${c.name}`);
    },
    share: async el => {
      const { kind, id } = el.dataset;
      const paths = {
        post: () => `#/post/${id}`, product: () => `#/product/${id}`,
        crafter: () => `#/c/${DATA.byId.crafter[id].u}`, shop: () => `#/market/shop/${id}`,
      };
      const url = location.href.split('#')[0] + paths[kind]();
      try {
        if (navigator.share) { await navigator.share({ title: 'Crafters', url }); return; }
        await navigator.clipboard.writeText(url);
        UI.toast('Link copied');
      } catch { /* user cancelled or clipboard blocked */ UI.toast('Sharing is not available here', { type: 'info' }); }
    },
    soon: el => UI.toast(el.dataset.msg || 'Coming soon', { type: 'info' }),
    back: () => (depth > 1 ? history.back() : (location.hash = '#/home')),
    'close-modal': () => UI.closeModal(),
    location: () => {
      const cur = Store.get('location');
      UI.openModal({
        title: 'Choose your area', variant: 'modal-sheet',
        html: `<p class="muted">We use this to show the nearest craft-material shops.</p>
          <div class="loc-list">${DATA.locations.map(l => `
            <button class="loc-item ${l.id === cur ? 'is-on' : ''}" data-action="set-location" data-id="${l.id}">
              ${icon('pin', 18)}<span class="grow"><strong>${esc(l.name)}</strong><small class="muted">${esc(l.city)}</small></span>${l.id === cur ? icon('check', 18) : ''}
            </button>`).join('')}</div>`,
      });
    },
    'set-location': el => {
      Store.set('location', el.dataset.id);
      UI.closeModal();
      refreshLocation();
      if (/^\/(market|home)/.test(parseHash().path) || parseHash().path === '/me') render();
      UI.toast(`Location set to ${Pages.currentLocation().name}`);
    },
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    // Let real links navigate; everything else is handled here.
    if (el.tagName !== 'A') e.preventDefault();
    fn(el, e);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') UI.closeModal();
  });

  function refreshLocation() {
    const name = Pages.currentLocation().name;
    $$('[data-loc-label]').forEach(el => { el.textContent = name; });
  }

  /* ---------- bootstrap ---------- */
  UI.hydrateIcons();
  Store.subscribe(key => { if (key === 'cart') UI.sync(); });
  window.addEventListener('hashchange', () => { depth++; render(); });
  depth = 1;
  refreshLocation();
  render();
})();
