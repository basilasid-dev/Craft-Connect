/* ==========================================================================
   UI — icons, formatters, reusable components, toast, modal.
   Components return HTML strings; behaviour is attached via data-action.
   Exposes: UI
   ========================================================================== */
const UI = (() => {
  /* ---------- helpers ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => DATA.CURRENCY + Number(n).toLocaleString('en-IN');
  const compact = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'k' : String(n);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- icons ---------- */
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5 12v8h14v-8"/><path d="M10 20v-4h4v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    share: '<path d="M12 3v13"/><path d="M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    'chevron-right': '<path d="M9 5l7 7-7 7"/>',
    'chevron-left': '<path d="M15 5l-7 7 7 7"/>',
    'chevron-down': '<path d="M6 9l6 6 6-6"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    verified: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    message: '<path d="M4 5h16v11H9l-5 4z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    package: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    navigate: '<path d="M4 11l16-7-7 16-2-7z"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  };
  const icon = (name, size = 20) =>
    `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /** Replace <i data-icon="name" data-size="20"> placeholders in static markup. */
  function hydrateIcons(root = document) {
    $$('i[data-icon]', root).forEach(el => {
      el.outerHTML = icon(el.dataset.icon, +el.dataset.size || 20);
    });
  }

  /* ---------- visual primitives ---------- */
  /** Warm generated artwork standing in for photography. item needs {e, h}. */
  const art = (item, cls = '') =>
    `<div class="art ${cls}" style="--h:${item.h}"><span class="art-emoji">${item.e}</span></div>`;

  const initials = name => name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const avatar = (c, size = 40) =>
    `<span class="avatar" style="--h:${c.h};--size:${size}px">${esc(initials(c.name))}</span>`;

  const rating = (r, count) =>
    `<span class="rating">${icon('star', 14)}<b>${r.toFixed(1)}</b>${count != null ? `<span class="muted">(${compact(count)})</span>` : ''}</span>`;

  const verifiedMark = `<span class="verified" title="Verified crafter">${icon('verified', 15)}</span>`;

  function availability(stock) {
    if (stock === 0) return '<span class="badge badge-danger">Sold out</span>';
    if (stock <= 5) return `<span class="badge badge-warn">Only ${stock} left</span>`;
    return '<span class="badge badge-sage">In stock</span>';
  }

  const followBtn = (c, size = 'sm') =>
    `<button class="btn btn-${size} btn-follow" data-action="follow" data-id="${c.id}"><span class="lbl">Follow</span></button>`;

  const saveBtn = id =>
    `<button class="icon-btn icon-btn-float" data-action="save" data-id="${id}" aria-label="Save product">${icon('bookmark', 18)}</button>`;

  /* ---------- cards ---------- */
  function productCard(p, opts = {}) {
    const c = DATA.byId.crafter[p.c];
    return `
    <article class="card product-card">
      <div class="product-media">
        <a href="#/product/${p.id}" aria-label="${esc(p.name)}">${art(p, 'art-square')}</a>
        ${saveBtn(p.id)}
        ${p.stock === 0 ? '<span class="soldout-veil">Sold out</span>' : ''}
      </div>
      <div class="product-body">
        <a href="#/product/${p.id}" class="product-name">${esc(p.name)}</a>
        <div class="product-meta">${price(p.price)}${rating(p.rating, p.reviews)}</div>
        <a href="#/c/${c.u}" class="mini-crafter">${avatar(c, 28)}<span class="mini-crafter-text"><b class="truncate">${esc(c.name)}</b><small class="muted truncate">${icon('pin', 11)} ${esc(c.loc)}</small></span></a>
        ${availability(p.stock)}
        ${opts.cta ? `<div class="product-cta"><a class="btn btn-sm" href="#/product/${p.id}">View</a><button class="btn btn-sm btn-primary" data-action="buy-now" data-type="p" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>Buy</button></div>` : ''}
      </div>
    </article>`;
  }

  function crafterCard(c, { compactCard = false } = {}) {
    return `
    <article class="card crafter-card ${compactCard ? 'is-compact' : ''}">
      <a href="#/c/${c.u}" class="crafter-card-link">
        <span class="crafter-card-art">${avatar(c, compactCard ? 64 : 72)}</span>
        <strong class="truncate">${esc(c.name)}${c.verified ? verifiedMark : ''}</strong>
        <small class="muted truncate">@${esc(c.u)}</small>
        <small class="muted truncate">${icon('pin', 12)} ${esc(c.loc)}</small>
        <small class="muted"><b>${compact(c.followers)}</b> followers</small>
        <small class="chip-row">${c.cats.map(x => `<span class="badge">${esc(x)}</span>`).join('')}</small>
      </a>
      ${followBtn(c, 'sm')}
    </article>`;
  }

  /** Feed post. Product-aware: shows an attached product with View + Buy. */
  function postCard(post) {
    const c = DATA.byId.crafter[post.c];
    const prod = post.p ? DATA.byId.product[post.p] : null;
    const target = prod ? `#/product/${prod.id}` : `#/c/${c.u}`;
    let media;
    if (post.type === 'video') {
      media = `<button class="post-media" data-action="play" data-id="${post.id}" aria-label="Play video: ${esc(post.title)}">
        ${art(post, 'art-post')}<span class="play-disc">${icon('play', 28)}</span><span class="duration">${post.duration}</span></button>`;
    } else if (post.type === 'promo') {
      media = `<a class="post-media" href="${target}">${art(post, 'art-post')}
        <span class="promo-overlay"><span class="badge badge-light">${esc(post.badge || 'Promotion')}</span><strong>${esc(post.title)}</strong><span class="btn btn-sm btn-light">Shop now ${icon('chevron-right', 14)}</span></span></a>`;
    } else {
      media = `<a class="post-media" href="${target}" aria-label="${esc(post.title)}">${art(post, 'art-post')}</a>`;
    }

    return `
    <article class="card post" id="${post.id}">
      <header class="post-head">
        <a class="who" href="#/c/${c.u}">${avatar(c, 40)}
          <span><strong>${esc(c.name)}${c.verified ? verifiedMark : ''}</strong><small class="muted">${icon('pin', 11)} ${esc(c.loc)}${post.badge && post.type !== 'promo' ? ' · ' + esc(post.badge) : ''}</small></span></a>
        ${post.type === 'promo' ? `<span class="badge badge-accent">${esc(post.badge)}</span>` : ''}
        ${followBtn(c)}
      </header>
      ${media}
      <div class="post-actions">
        <button class="act" data-action="like" data-id="${post.id}" aria-label="Like">${icon('heart', 22)}<span data-count="like" data-id="${post.id}" data-base="${post.likes}">${compact(post.likes)}</span></button>
        <button class="act" data-action="share" data-id="${post.id}" data-kind="post" aria-label="Share">${icon('share', 22)}</button>
        ${prod ? `<button class="act act-right" data-action="save" data-id="${prod.id}" aria-label="Save product">${icon('bookmark', 22)}</button>` : ''}
      </div>
      <div class="post-body">
        ${post.type !== 'promo' ? `<h3 class="post-title">${esc(post.title)}</h3>` : ''}
        <p>${esc(post.caption)}</p>
      </div>
      ${prod ? `
      <div class="post-product">
        <a href="#/product/${prod.id}" class="post-product-art">${art(prod, 'art-square')}</a>
        <div class="post-product-info">
          <a href="#/product/${prod.id}" class="truncate"><strong>${esc(prod.name)}</strong></a>
          <span><b class="price">${money(prod.price)}</b> ${availability(prod.stock)}</span>
        </div>
        <button class="btn btn-sm btn-primary" data-action="buy-now" data-type="p" data-id="${prod.id}" ${prod.stock === 0 ? 'disabled' : ''}>Buy</button>
      </div>` : ''}
    </article>`;
  }

  /* ---------- small reusable components ---------- */
  const price = (amount, { was, size = '' } = {}) =>
    `<span class="price-display ${size}"><b>${money(amount)}</b>${was ? `<s>${money(was)}</s><span class="badge badge-accent">−${Math.round((1 - amount / was) * 100)}%</span>` : ''}</span>`;

  /** Quantity selector. `attrs` are extra data-* attributes passed to both buttons. */
  const qty = ({ value = 1, action, attrs = '', id = '', size = '' }) => `
    <div class="qty ${size ? 'qty-' + size : ''}" role="group" aria-label="Quantity">
      <button type="button" data-action="${action}" data-d="-1" ${attrs} aria-label="Decrease quantity">${icon('minus', 16)}</button>
      <output ${id ? `id="${id}"` : ''}>${value}</output>
      <button type="button" data-action="${action}" data-d="1" ${attrs} aria-label="Increase quantity">${icon('plus', 16)}</button>
    </div>`;

  const searchInput = ({ id, role, placeholder, value = '', label = 'Search' }) => `
    <form class="searchbar" data-role="${role}" role="search">
      ${icon('search', 20)}
      <input id="${id}" type="search" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off" enterkeyhint="search" aria-label="${esc(label)}">
    </form>`;

  /** "Mon 13 Oct – Wed 15 Oct" for an order placed today (lo/hi are days from now). */
  function etaRange(lo, hi) {
    if (hi <= 1) return 'Within 24 hours';
    const f = n => new Date(Date.now() + n * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    return `${f(lo)} – ${f(hi)}`;
  }

  const spinner = () => '<span class="spinner" role="status" aria-label="Loading"></span>';
  const loading = (n = 4) => `<div class="grid-products" aria-busy="true" aria-label="Loading">${Array.from({ length: n }, () => `
    <div class="card skeleton-card"><div class="skeleton sk-art"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div></div>`).join('')}</div>`;

  function shopStatus(shop) {
    const h = new Date().getHours();
    return h >= shop.opens && h < shop.closes;
  }
  const hoursLabel = h => (h > 12 ? h - 12 : h) + (h >= 12 ? ' PM' : ' AM');

  function emptyState({ emoji = '🧺', title, text, cta }) {
    return `<div class="empty"><div class="empty-emoji">${emoji}</div><h3>${esc(title)}</h3><p class="muted">${esc(text || '')}</p>${cta || ''}</div>`;
  }

  /* ---------- toast ---------- */
  function toast(message, { type = 'ok', action } = {}) {
    const host = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.setAttribute('role', 'status');
    el.innerHTML = `${icon(type === 'ok' ? 'check' : 'sparkle', 16)}<span>${esc(message)}</span>${action ? `<button class="toast-action" data-action="${action.act}">${esc(action.label)}</button>` : ''}`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 250); }, 2800);
  }

  /* ---------- modal ---------- */
  let lastFocus = null;
  function openModal({ title = '', html = '', variant = '', onClose } = {}) {
    closeModal(true);
    lastFocus = document.activeElement;
    const root = $('#modal-root');
    root.innerHTML = `
      <div class="modal-backdrop" data-action="close-modal"></div>
      <div class="modal ${variant}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <header class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-action="close-modal" aria-label="Close">${icon('close', 20)}</button></header>
        <div class="modal-body">${html}</div>
      </div>`;
    root.hidden = false;
    document.body.classList.add('modal-open');
    root._onClose = onClose;
    requestAnimationFrame(() => root.classList.add('open'));
    sync(root);
    return $('.modal', root);
  }
  function closeModal(silent) {
    const root = $('#modal-root');
    if (root.hidden) return;
    const cb = root._onClose;
    root._onClose = null;
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
    document.body.classList.remove('modal-open');
    if (!silent) { lastFocus?.focus?.(); cb?.(); }
  }
  const setModalBody = html => { const b = $('#modal-root .modal-body'); if (b) { b.innerHTML = html; sync(b); } };

  /* ---------- state → DOM sync (like / save / follow / counts / cart badge) ---------- */
  function sync(root = document) {
    $$('[data-action="like"]', root).forEach(el => {
      const on = Store.has('liked', el.dataset.id);
      el.classList.toggle('is-on', on); el.setAttribute('aria-pressed', on);
    });
    $$('[data-action="save"]', root).forEach(el => {
      const on = Store.has('saved', el.dataset.id);
      el.classList.toggle('is-on', on); el.setAttribute('aria-pressed', on);
    });
    $$('[data-action="follow"]', root).forEach(el => {
      const on = Store.has('following', el.dataset.id);
      el.classList.toggle('is-on', on); el.setAttribute('aria-pressed', on);
      const lbl = $('.lbl', el); if (lbl) lbl.textContent = on ? 'Following' : 'Follow';
    });
    $$('[data-count="like"]', root).forEach(el => {
      el.textContent = compact(+el.dataset.base + (Store.has('liked', el.dataset.id) ? 1 : 0));
    });
    $$('[data-count="followers"]', root).forEach(el => {
      el.textContent = compact(+el.dataset.base + (Store.has('following', el.dataset.id) ? 1 : 0));
    });
    const n = Store.cartCount();
    $$('[data-cart-count]').forEach(b => { b.textContent = n; b.hidden = n === 0; });
  }

  return {
    esc, money, compact, $, $$, icon, hydrateIcons, art, avatar, rating, verifiedMark, availability,
    followBtn, saveBtn, productCard, crafterCard, postCard, shopStatus, hoursLabel, emptyState,
    price, qty, searchInput, spinner, loading, etaRange,
    toast, openModal, closeModal, setModalBody, sync,
  };
})();
