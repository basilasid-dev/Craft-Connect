/* ==========================================================================
   Pages — each page returns { title, html, after? }.
   In-place interactions (tabs, search, filters) re-render only their body.
   Exposes: Pages (render fns + Pages.actions)
   ========================================================================== */
const Pages = (() => {
  const { esc, money, compact, icon, art, avatar, rating, verifiedMark, availability, productCard,
    crafterCard, postCard, followBtn, emptyState, shopStatus, hoursLabel, $, $$ } = UI;
  const D = DATA, S = Store;

  /* ---------- shared helpers ---------- */
  const currentLocation = () => D.locations.find(l => l.id === S.get('location')) || D.locations[0];
  const shopsNear = () => {
    const here = currentLocation();
    return D.shops.map(s => ({ ...s, d: D.distanceKm(here, s) })).sort((a, b) => a.d - b.d);
  };
  const norm = t => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t);
  const matcher = q => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean).map(norm);
    return text => { const t = text.toLowerCase(); return terms.every(w => t.includes(w)); };
  };
  const km = d => (d < 10 ? d.toFixed(1) : Math.round(d)) + ' km';
  const chip = (label, attrs, on) => `<button class="chip ${on ? 'is-on' : ''}" ${attrs}>${label}</button>`;
  const tabs = (items, active, action) => `<div class="tabs" role="tablist">${items.map(t =>
    `<button class="tab ${t.id === active ? 'is-on' : ''}" role="tab" aria-selected="${t.id === active}" data-action="${action}" data-tab="${t.id}">${t.label}${t.count != null ? `<span class="tab-count">${t.count}</span>` : ''}</button>`).join('')}</div>`;
  const grid = (cls, items) => `<div class="${cls}">${items.join('')}</div>`;
  const rerender = (sel, html) => { const el = $(sel); if (el) { el.innerHTML = html; UI.sync(el); } };

  /* ======================================================================
     HOME — discovery feed
     ====================================================================== */
  function home() {
    const following = S.get('following');
    const feed = [...D.posts].sort((a, b) =>
      (following.includes(b.c) ? 1 : 0) - (following.includes(a.c) ? 1 : 0) || b.likes - a.likes);

    const suggested = D.crafters.filter(c => !following.includes(c.id)).slice(0, 6);
    const strip = `
      <section class="strip">
        <div class="section-head"><h2>Crafters you might love</h2><a href="#/search?mode=profiles">See all</a></div>
        <div class="scroll-x">${suggested.map(c => crafterCard(c, { compactCard: true })).join('')}</div>
      </section>`;
    const nearby = shopsNear().slice(0, 3);
    const nearbyStrip = `
      <section class="strip card pad">
        <div class="section-head"><h2>Craft supplies near ${esc(currentLocation().name)}</h2><a href="#/market">Open Market</a></div>
        ${nearby.map(s => shopRow(s)).join('')}
      </section>`;

    const items = [];
    feed.forEach((p, i) => {
      items.push(postCard(p));
      if (i === 2) items.push(strip);
      if (i === 6) items.push(nearbyStrip);
    });

    const aside = `
      <aside class="feed-aside">
        <section class="card pad">
          <div class="section-head"><h2>Trending</h2></div>
          <div class="chip-row">${D.trending.map(t => `<a class="chip" href="#/search?q=${encodeURIComponent(t)}">${icon('search', 13)} ${esc(t)}</a>`).join('')}</div>
        </section>
        <section class="card pad">
          <div class="section-head"><h2>Suggested crafters</h2></div>
          ${suggested.slice(0, 4).map(c => `
            <div class="row">
              <a class="who" href="#/c/${c.u}">${avatar(c, 40)}<span><strong>${esc(c.name)}</strong><small class="muted">@${esc(c.u)}</small></span></a>
              ${followBtn(c)}
            </div>`).join('')}
        </section>
        <section class="card pad">
          <div class="section-head"><h2>Nearby materials</h2></div>
          ${nearby.map(s => shopRow(s)).join('')}
        </section>
      </aside>`;

    return {
      title: 'Home',
      html: `
      <div class="feed-layout">
        <section class="feed">
          <div class="intro">
            <p class="eyebrow">Discover · Get inspired · Find the crafter · Buy · Create</p>
            <h1>Made by hand, found by you.</h1>
          </div>
          <div class="scroll-x chips-scroll">${D.categories.map(c =>
            `<a class="chip chip-cat" href="#/search?q=${encodeURIComponent(c.name)}"><span>${c.e}</span>${esc(c.name)}</a>`).join('')}</div>
          ${items.join('')}
        </section>
        ${aside}
      </div>`,
    };
  }

  function shopRow(s) {
    return `<a class="row shop-row" href="#/market/shop/${s.id}">
      <span class="shop-badge" style="--h:${s.h}">${s.e}</span>
      <span class="grow"><strong>${esc(s.name)}</strong><small class="muted">${esc(s.area)} · ${km(s.d)}</small></span>
      ${shopStatus(s) ? '<span class="badge badge-sage">Open</span>' : '<span class="badge">Closed</span>'}
    </a>`;
  }

  /* ======================================================================
     SEARCH — Products / Profiles / Posts, suggestions, recent searches
     ====================================================================== */
  const searchState = { q: '', mode: 'products', suggest: false };
  let recentSaveTimer = 0;

  function search(query) {
    searchState.q = query.q || '';
    searchState.mode = ['products', 'profiles', 'posts'].includes(query.mode) ? query.mode : 'products';
    searchState.suggest = false;
    return {
      title: 'Search',
      html: `
      <div class="page-search">
        <h1 class="visually-hidden">Search</h1>
        <div class="search-box">
          <form class="searchbar searchbar-lg" data-role="search-form" role="search">
            ${icon('search', 22)}
            <input id="search-input" type="search" placeholder="Search products, crafters or posts" value="${esc(searchState.q)}" autocomplete="off" enterkeyhint="search" aria-label="Search products, crafters or posts" aria-controls="search-suggest">
            <button type="button" class="searchbar-btn" id="search-clear" data-action="search-clear" aria-label="Clear search" hidden>${icon('close', 18)}</button>
            <button type="button" class="searchbar-btn" data-action="search-voice" aria-label="Voice search">${icon('mic', 20)}</button>
          </form>
          <div id="search-suggest" class="suggest" hidden></div>
        </div>
        <div id="search-body"></div>
      </div>`,
      after() {
        const input = $('#search-input');
        input.addEventListener('input', () => {
          searchState.q = input.value; searchState.suggest = true; renderSearch();
          clearTimeout(recentSaveTimer);
          recentSaveTimer = setTimeout(() => {
            const q = searchState.q.trim();
            if (q.length < 3) return;
            const r = searchData(q);
            if (r.products.length + r.profiles.length + r.posts.length) S.pushSearch(q);
          }, 1500);
        });
        input.addEventListener('focus', () => { if (searchState.q.trim()) { searchState.suggest = true; renderSuggest(); } });
        input.addEventListener('blur', () => setTimeout(() => {
          if (!$('#search-suggest')?.contains(document.activeElement)) { searchState.suggest = false; renderSuggest(); }
        }, 160));
        input.addEventListener('keydown', e => {
          if (e.key === 'Escape') { searchState.suggest = false; renderSuggest(); }
          if (e.key === 'ArrowDown') { $('#search-suggest .suggest-item')?.focus(); e.preventDefault(); }
        });
        $('#search-suggest').addEventListener('keydown', e => {
          const items = $$('#search-suggest .suggest-item');
          const i = items.indexOf(document.activeElement);
          if (e.key === 'ArrowDown') { items[Math.min(i + 1, items.length - 1)]?.focus(); e.preventDefault(); }
          if (e.key === 'ArrowUp') { (i > 0 ? items[i - 1] : input).focus(); e.preventDefault(); }
          if (e.key === 'Escape') { input.focus(); searchState.suggest = false; renderSuggest(); }
        });
        $('[data-role="search-form"]').addEventListener('submit', e => {
          e.preventDefault();
          S.pushSearch(input.value);
          searchState.suggest = false; input.blur(); renderSearch();
        });
        renderSearch();
        if (!searchState.q && matchMedia('(pointer:fine)').matches) input.focus();
      },
    };
  }

  /** Weighted client-side ranking. Every term must hit at least one field. */
  function makeScorer(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean).map(norm);
    return fields => {
      const f = fields.map(([t, w]) => [String(t).toLowerCase(), w]);
      let total = 0;
      for (const term of terms) {
        let hit = 0;
        for (const [t, w] of f) if (t.includes(term)) hit += w;
        if (!hit) return 0;
        total += hit;
      }
      return total;
    };
  }
  const ranked = (items, score, tie) =>
    items.map(x => [x, score(x)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1] || tie(b[0]) - tie(a[0])).map(([x]) => x);

  function searchData(q) {
    const score = makeScorer(q);
    const cr = id => D.byId.crafter[id];
    const products = ranked(D.products, p => score([[p.name, 5], [p.cat, 3], [p.tags, 2], [cr(p.c).name, 2], [cr(p.c).u, 2], [p.desc, 1]]), p => p.rating);
    const profiles = ranked(D.crafters, c => score([[c.name, 5], [c.u, 5], [c.cats.join(' '), 3], [c.loc, 2], [c.bio, 1]]), c => c.followers);
    const posts = ranked(D.posts, p => score([[p.title, 4], [p.caption, 2], [cr(p.c).name, 2], [cr(p.c).u, 2], [p.p ? D.byId.product[p.p].name : '', 2]]), p => p.likes);
    const m = matcher(q);
    const materials = D.materials.filter(x => m(`${x.name} ${x.tags} ${x.cat}`));
    return { products, profiles, posts, materials };
  }

  function renderSearch() {
    const { q, mode } = searchState;
    history.replaceState(null, '', `#/search${q || mode !== 'products' ? '?' + new URLSearchParams({ ...(q && { q }), mode }) : ''}`);
    const clear = $('#search-clear'); if (clear) clear.hidden = !q;
    renderSuggest();
    if (!q.trim()) return rerender('#search-body', searchDiscovery());

    const r = searchData(q);
    const counts = { products: r.products.length, profiles: r.profiles.length, posts: r.posts.length };
    const total = counts.products + counts.profiles + counts.posts;
    const list = r[mode];
    let body;
    if (!total) {
      body = emptyState({ emoji: '🔍', title: `Nothing found for “${q.trim()}”`, text: 'Try another product, crafter or category.',
        cta: `<div class="chip-row center-row">${D.categories.slice(0, 5).map(c => chip(esc(c.name), `data-action="search-set" data-q="${esc(c.name)}"`)).join('')}</div>` });
    } else if (!list.length) {
      const other = Object.entries(counts).filter(([k, n]) => k !== mode && n).map(([k, n]) => `${n} in ${k}`).join(' · ');
      body = emptyState({ emoji: '🧺', title: `No ${mode} match “${q.trim()}”`, text: `Try another word — or check the other tabs (${other}).` });
    } else if (mode === 'products') {
      body = grid('grid-products', list.map(p => productCard(p, { cta: true })));
    } else if (mode === 'profiles') {
      body = grid('grid-crafters', list.map(c => crafterCard(c)));
    } else {
      body = `<div class="post-results">${list.map(postResult).join('')}</div>`;
    }
    const banner = total && r.materials.length ? `
      <a class="banner" href="#/market?q=${encodeURIComponent(q)}">
        <span class="banner-icon">${icon('store', 22)}</span>
        <span class="grow"><strong>Need “${esc(q)}” as a material?</strong><small class="muted">${r.materials.length} item${r.materials.length > 1 ? 's' : ''} in nearby craft shops</small></span>
        ${icon('chevron-right', 18)}
      </a>` : '';
    rerender('#search-body', `
      ${tabs([
        { id: 'products', label: 'Products', count: counts.products },
        { id: 'profiles', label: 'Profiles', count: counts.profiles },
        { id: 'posts', label: 'Posts', count: counts.posts },
      ], mode, 'search-mode')}
      ${banner}${body}`);
  }

  /** Compact post result → links to the post detail page. */
  function postResult(p) {
    const c = D.byId.crafter[p.c], prod = p.p && D.byId.product[p.p];
    return `
    <a class="card post-result" href="#/post/${p.id}">
      <span class="post-result-art">${art(p, 'art-square')}${p.type === 'video' ? `<span class="post-result-play">${icon('play', 16)}</span>` : ''}</span>
      <span class="post-result-body">
        <span class="post-result-who">${avatar(c, 20)}<b class="truncate">${esc(c.name)}</b><span class="muted truncate">@${esc(c.u)}</span></span>
        <strong class="post-result-title">${esc(p.title)}</strong>
        <span class="post-result-caption">${esc(p.caption)}</span>
        <span class="post-result-meta">
          <span class="meta-item">${icon('heart', 14)} ${compact(p.likes)}</span>
          ${p.type === 'video' ? `<span class="meta-item">${icon('video', 14)} ${p.duration}</span>` : ''}
          ${prod ? `<span class="badge badge-accent">${icon('bag', 12)} ${esc(prod.name)} · ${money(prod.price)}</span>` : ''}
        </span>
      </span>
    </a>`;
  }

  function renderSuggest() {
    const box = $('#search-suggest');
    if (!box) return;
    const q = searchState.q.trim();
    if (!searchState.suggest || !q) { box.hidden = true; box.innerHTML = ''; return; }
    const m = matcher(q);
    const prods = D.products.filter(p => m(`${p.name} ${p.tags}`)).slice(0, 3);
    const crafters = D.crafters.filter(c => m(`${c.name} ${c.u}`)).slice(0, 2);
    const cats = D.categories.filter(c => m(c.name)).slice(0, 2);
    const group = (label, rows) => rows ? `<div class="suggest-group"><p class="suggest-label">${label}</p>${rows}</div>` : '';
    box.innerHTML = `
      <button type="button" class="suggest-item" data-action="search-set" data-q="${esc(q)}">${icon('search', 18)}<span>Search for <b>“${esc(q)}”</b></span></button>
      ${group('Products', prods.map(p => `<a class="suggest-item" href="#/product/${p.id}" data-action="suggest-go">
        <span class="suggest-art">${art(p, 'art-square')}</span><span class="grow"><strong>${esc(p.name)}</strong><small class="muted">${money(p.price)} · ${esc(D.byId.crafter[p.c].name)}</small></span>${icon('chevron-right', 16)}</a>`).join(''))}
      ${group('Crafters', crafters.map(c => `<a class="suggest-item" href="#/c/${c.u}" data-action="suggest-go">
        ${avatar(c, 32)}<span class="grow"><strong>${esc(c.name)}</strong><small class="muted">@${esc(c.u)} · ${esc(c.loc)}</small></span>${icon('chevron-right', 16)}</a>`).join(''))}
      ${group('Categories', cats.map(c => `<button type="button" class="suggest-item" data-action="search-set" data-q="${esc(c.name)}">
        <span class="suggest-emoji">${c.e}</span><span class="grow"><strong>${esc(c.name)}</strong></span>${icon('chevron-right', 16)}</button>`).join(''))}`;
    box.hidden = false;
  }

  function searchDiscovery() {
    const recents = S.get('searches');
    const viewed = S.get('recent').map(id => D.byId.product[id]).filter(Boolean).slice(0, 6);
    return `
      <p class="search-hint">Search for something handmade</p>
      ${recents.length ? `<section class="block"><div class="section-head"><h2>Recent searches</h2><button class="link" data-action="clear-searches">Clear all</button></div>
        <ul class="recent-list">${recents.map(t => `
          <li class="recent-row">
            <button class="recent-main" data-action="search-set" data-q="${esc(t)}">${icon('clock', 18)}<span class="truncate">${esc(t)}</span></button>
            <button class="icon-btn recent-x" data-action="recent-remove" data-q="${esc(t)}" aria-label="Remove ${esc(t)} from recent searches">${icon('close', 16)}</button>
          </li>`).join('')}</ul></section>` : ''}
      <section class="block"><div class="section-head"><h2>Trending now</h2></div>
        <div class="chip-row">${D.trending.map(t => chip(esc(t), `data-action="search-set" data-q="${esc(t)}"`)).join('')}</div></section>
      <section class="block"><div class="section-head"><h2>Browse by category</h2></div>
        <div class="cat-grid">${D.categories.map(c => `<button class="cat-tile" data-action="search-set" data-q="${esc(c.name)}"><span>${c.e}</span>${esc(c.name)}</button>`).join('')}</div></section>
      ${viewed.length ? `<section class="block"><div class="section-head"><h2>Recently viewed</h2></div>
        <div class="scroll-x">${viewed.map(p => `<div class="scroll-item">${productCard(p)}</div>`).join('')}</div></section>` : ''}`;
  }

  /** Post detail — the full feed card plus more from the same crafter. */
  function post(id) {
    const p = D.byId.post[id];
    if (!p) return notFound();
    const c = D.byId.crafter[p.c];
    const more = D.posts.filter(x => x.c === c.id && x.id !== id).slice(0, 3);
    return {
      title: p.title,
      html: `
      <div class="page-post">
        <div class="feed-single">${postCard(p)}</div>
        ${more.length ? `<section class="block"><div class="section-head"><h2>More from ${esc(c.name)}</h2><a href="#/c/${c.u}">View profile</a></div><div class="post-results">${more.map(postResult).join('')}</div></section>` : ''}
      </div>`,
    };
  }


  /* ======================================================================
     MARKET — craft-material shops (list + map)
     ====================================================================== */
  const marketState = { q: '', cat: '', view: 'list', sel: null };

  function market(query) {
    marketState.q = query.q || '';
    marketState.cat = '';
    marketState.sel = null;
    const loc = currentLocation();
    return {
      title: 'Market',
      html: `
      <div class="page-market">
        <div class="page-head">
          <div><p class="eyebrow">Market</p><h1>Craft materials near you</h1></div>
          <button class="loc-btn loc-btn-lg" data-action="location">${icon('pin', 16)}<span data-loc-label>${esc(loc.name)}</span>${icon('chevron-down', 14)}</button>
        </div>
        ${UI.searchInput({ id: 'market-input', role: 'market-form', placeholder: 'Search beads, yarn, ribbons, clay…', value: marketState.q, label: 'Search materials' })}
        <div class="scroll-x chips-scroll" id="market-cats">${marketCats()}</div>
        <div class="view-toggle" role="group" aria-label="View">
          <button class="${marketState.view === 'list' ? 'is-on' : ''}" data-action="market-view" data-view="list">${icon('list', 16)} List</button>
          <button class="${marketState.view === 'map' ? 'is-on' : ''}" data-action="market-view" data-view="map">${icon('map', 16)} Map</button>
        </div>
        <div id="market-body" class="market-body" data-view="${marketState.view}"></div>
      </div>`,
      after() {
        const input = $('#market-input');
        input.addEventListener('input', () => { marketState.q = input.value; marketState.sel = null; renderMarket(); });
        $('[data-role="market-form"]').addEventListener('submit', e => { e.preventDefault(); input.blur(); });
        renderMarket();
      },
    };
  }

  const marketCats = () => D.materialCategories.map(c =>
    chip(`<span>${c.e}</span>${esc(c.name)}`, `data-action="market-cat" data-cat="${esc(c.name)}"`, marketState.cat === c.name)).join('');

  function shopMatches(s) {
    const { q, cat } = marketState;
    const m = matcher(q);
    return D.materials.filter(x => x.s === s.id && (!cat || x.cat === cat) && (!q || m(`${x.name} ${x.tags} ${x.cat}`)));
  }

  function renderMarket() {
    const { q, cat, sel } = marketState;
    const filtering = !!(q.trim() || cat);
    const m = matcher(q);
    const all = shopsNear();
    const results = all.map(s => ({ s, items: shopMatches(s) }))
      .filter(r => !filtering || r.items.length || (q && m(`${r.s.name} ${r.s.area}`)));
    const ids = new Set(results.map(r => r.s.id));

    const list = results.length ? results.map(({ s, items }) => marketShopCard(s, filtering ? items : D.materials.filter(x => x.s === s.id).slice(0, 3), filtering)).join('')
      : emptyState({ emoji: '🧵', title: 'No shops stock that nearby', text: 'Try another material or change your location.', cta: '<button class="btn btn-sm" data-action="location">Change location</button>' });

    const here = currentLocation();
    const pts = [...all, here];
    const bounds = {
      minLat: Math.min(...pts.map(p => p.lat)), maxLat: Math.max(...pts.map(p => p.lat)),
      minLng: Math.min(...pts.map(p => p.lng)), maxLng: Math.max(...pts.map(p => p.lng)),
    };
    const pos = p => `left:${8 + 84 * (p.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)}%;top:${8 + 84 * (1 - (p.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat))}%`;
    const selShop = sel && ids.has(sel) ? results.find(r => r.s.id === sel) : null;

    const map = `
      <div class="map-wrap">
        <div class="map" role="application" aria-label="Map of nearby craft shops">
          <span class="map-park" style="left:12%;top:58%;width:22%;height:20%"></span>
          <span class="map-park" style="left:62%;top:14%;width:18%;height:16%"></span>
          <span class="map-water" style="left:40%;top:70%;width:34%;height:12%"></span>
          ${all.map(s => `<button class="pin ${ids.has(s.id) ? '' : 'dim'} ${sel === s.id ? 'is-sel' : ''}" style="${pos(s)}" data-action="market-pin" data-id="${s.id}" aria-label="${esc(s.name)}"><span class="pin-dot">${s.e}</span><span class="pin-label">${esc(s.name)}</span></button>`).join('')}
          <span class="you" style="${pos(here)}"><i></i><b>You</b></span>
        </div>
        <div class="map-card">${selShop ? marketShopCard(selShop.s, filtering ? selShop.items : D.materials.filter(x => x.s === selShop.s.id).slice(0, 3), filtering)
          : `<p class="muted center">Tap a pin to see that shop and its materials.</p>`}</div>
      </div>`;

    rerender('#market-body', `<div class="market-list">${list}</div>${map}`);
    $('#market-body').dataset.view = marketState.view;
  }

  function marketShopCard(s, items, filtering) {
    const open = shopStatus(s);
    return `
    <article class="card shop-card">
      <header class="shop-card-head">
        <span class="shop-badge shop-badge-lg" style="--h:${s.h}">${s.e}</span>
        <div class="grow">
          <a href="#/market/shop/${s.id}" class="shop-name">${esc(s.name)}</a>
          <small class="muted">${icon('pin', 12)} ${esc(s.area)} · <b>${km(s.d)}</b> away</small>
          <div class="meta-row">${rating(s.rating, s.reviews)}${open ? '<span class="badge badge-sage">Open now</span>' : `<span class="badge">Opens ${hoursLabel(s.opens)}</span>`}</div>
        </div>
      </header>
      <div class="material-list">
        ${items.length ? items.slice(0, 4).map(materialRow).join('') : '<p class="muted small">No matching materials.</p>'}
        ${items.length > 4 ? `<a class="link small" href="#/market/shop/${s.id}">+ ${items.length - 4} more${filtering ? ' matches' : ''}</a>` : ''}
      </div>
      <a class="btn btn-sm btn-ghost btn-block" href="#/market/shop/${s.id}">Visit shop ${icon('chevron-right', 14)}</a>
    </article>`;
  }

  function stockLabel(stock) {
    return stock === 0 ? '<span class="stock out">Out of stock</span>' : stock <= 5 ? `<span class="stock low">Only ${stock} left</span>` : '<span class="stock ok">In stock</span>';
  }

  function materialRow(x) {
    return `
    <div class="material-row">
      <span class="material-ico">${x.e}</span>
      <button class="material-main" data-action="material" data-id="${x.id}">
        <strong>${esc(x.name)}</strong>
        <small><b>${money(x.price)}</b> / ${esc(x.unit)} · ${stockLabel(x.stock)}</small>
      </button>
      <button class="btn btn-sm btn-icon-only" data-action="add-cart" data-type="m" data-id="${x.id}" aria-label="Add ${esc(x.name)} to cart" ${x.stock === 0 ? 'disabled' : ''}>${icon('plus', 16)}</button>
    </div>`;
  }

  /* ---------- single shop ---------- */
  const shopState = { cat: '', q: '' };

  function shop(id) {
    const s0 = D.byId.shop[id];
    if (!s0) return notFound();
    const s = { ...s0, d: D.distanceKm(currentLocation(), s0) };
    shopState.cat = ''; shopState.q = '';
    const cats = [...new Set(D.materials.filter(x => x.s === id).map(x => x.cat))];
    return {
      title: s.name,
      html: `
      <div class="page-shop">
        <header class="shop-hero card" style="--h:${s.h}">
          <span class="shop-badge shop-badge-xl" style="--h:${s.h}">${s.e}</span>
          <div class="grow">
            <h1>${esc(s.name)}</h1>
            <p class="muted">${icon('pin', 13)} ${esc(s.area)} · ${km(s.d)} from ${esc(currentLocation().name)}</p>
            <div class="meta-row">${rating(s.rating, s.reviews)}
              ${shopStatus(s) ? '<span class="badge badge-sage">Open now</span>' : '<span class="badge">Closed</span>'}
              <span class="muted small">${icon('clock', 13)} ${hoursLabel(s.opens)} – ${hoursLabel(s.closes)}</span></div>
            <p>${esc(s.about)}</p>
            <div class="btn-row">
              <button class="btn btn-sm" data-action="soon" data-msg="Calling ${esc(s.phone)}…">${icon('phone', 16)} Call</button>
              <button class="btn btn-sm" data-action="soon" data-msg="Opening directions…">${icon('navigate', 16)} Directions</button>
              <button class="btn btn-sm" data-action="share" data-kind="shop" data-id="${s.id}">${icon('share', 16)} Share</button>
            </div>
          </div>
        </header>
        <form class="searchbar" data-role="shop-form">${icon('search', 20)}<input id="shop-input" type="search" placeholder="Search in ${esc(s.name)}" aria-label="Search this shop"></form>
        <div class="scroll-x chips-scroll">${chip('All', 'data-action="shop-cat" data-cat=""', true)}${cats.map(c => chip(esc(c), `data-action="shop-cat" data-cat="${esc(c)}"`)).join('')}</div>
        <div id="shop-materials" class="card material-list material-list-page"></div>
      </div>`,
      after() {
        $('#shop-input').addEventListener('input', e => { shopState.q = e.target.value; renderShop(id); });
        $('[data-role="shop-form"]').addEventListener('submit', e => e.preventDefault());
        renderShop(id);
      },
    };
  }

  function renderShop(id) {
    const m = matcher(shopState.q);
    const items = D.materials.filter(x => x.s === id && (!shopState.cat || x.cat === shopState.cat) && (!shopState.q || m(`${x.name} ${x.tags} ${x.cat}`)));
    rerender('#shop-materials', items.length ? items.map(materialRow).join('') : emptyState({ emoji: '🧵', title: 'Nothing matches', text: 'Try a different word or category.' }));
  }

  /* ======================================================================
     PRODUCT — bridges social discovery and commerce
     ====================================================================== */
  function product(id) {
    const p = D.byId.product[id];
    if (!p) return notFound();
    S.pushRecent(id);
    const c = D.byId.crafter[p.c];
    const d = D.details(p);
    const loc = currentLocation();
    const out = p.stock === 0;
    const maxQ = Math.max(1, Math.min(10, p.stock));

    const more = D.products.filter(x => x.c === c.id && x.id !== id).slice(0, 6);
    const likeIds = new Set([id, ...more.map(x => x.id)]);
    const related = [
      ...D.products.filter(x => x.cat === p.cat && !likeIds.has(x.id)),
      ...D.products.filter(x => x.cat !== p.cat && x.c !== c.id).sort((a, b) => b.rating - a.rating),
    ].filter((x, i, a) => a.findIndex(y => y.id === x.id) === i && !likeIds.has(x.id)).slice(0, 6);
    const posts = D.posts.filter(x => x.p === id);

    // Gallery: product, alternate colourway, studio, packaging
    const slides = [
      { e: p.e, h: p.h, label: 'Product' },
      { e: p.e, h: (p.h + 35) % 360, label: 'Alternate light' },
      { e: c.e, h: (p.h + 340) % 360, label: 'From the studio' },
      { e: '📦', h: (p.h + 10) % 360, label: 'Packaging' },
    ];

    const rail = items => `<div class="rail">${items.map(x => `<div class="rail-item">${productCard(x)}</div>`).join('')}</div>`;
    const acc = (title, body, { open = false, meta = '' } = {}) => `
      <details class="acc" ${open ? 'open' : ''}>
        <summary><span>${title}</span>${meta ? `<small class="muted">${meta}</small>` : ''}${icon('chevron-down', 18)}</summary>
        <div class="acc-body">${body}</div>
      </details>`;

    const purchase = out ? `
      <div class="sticky-actions">
        <button class="btn btn-lg btn-primary" data-action="soon" data-msg="We will let you know when it is back">${icon('sparkle', 18)} Notify me when back</button>
      </div>` : `
      <div class="sticky-actions">
        ${UI.qty({ id: 'pdp-qty', action: 'pdp-qty', attrs: `data-max="${maxQ}"` })}
        <button class="btn btn-lg" data-action="add-cart" data-type="p" data-id="${p.id}" data-qty-from="#pdp-qty" ${d.customisable ? 'data-note-from="#pdp-note"' : ''}>Add to cart</button>
        <button class="btn btn-lg btn-primary" data-action="buy-now" data-type="p" data-id="${p.id}" data-qty-from="#pdp-qty" ${d.customisable ? 'data-note-from="#pdp-note"' : ''}>Buy now</button>
      </div>`;

    return {
      title: p.name,
      html: `
      <div class="page-product">
        <div class="pdp">
          <div class="pdp-gallery">
            <div class="gallery">
              <div class="gallery-track" id="pdp-track" tabindex="0" aria-label="Product images">
                ${slides.map((s, i) => `<div class="gallery-slide" role="group" aria-label="Image ${i + 1} of ${slides.length}: ${s.label}">${art(s, 'art-square')}</div>`).join('')}
              </div>
              ${UI.saveBtn(p.id)}
              <button class="icon-btn icon-btn-float gallery-share" data-action="share" data-kind="product" data-id="${p.id}" aria-label="Share product">${icon('share', 18)}</button>
            </div>
            <div class="thumbs">${slides.map((s, i) => `<button class="thumb ${i === 0 ? 'is-on' : ''}" data-action="pdp-thumb" data-i="${i}" aria-label="Show image ${i + 1}: ${s.label}">${art(s, 'art-square')}</button>`).join('')}</div>
          </div>

          <div class="pdp-info">
            <p class="eyebrow">${esc(p.cat)}</p>
            <h1>${esc(p.name)}</h1>
            <p class="made-by">Made by <a href="#/c/${c.u}">${esc(c.name)}</a> · ${icon('pin', 12)} ${esc(c.loc)}</p>
            <div class="meta-row">${rating(p.rating, p.reviews)}<button type="button" class="link small" data-action="goto-reviews">${p.reviews} reviews</button>${availability(p.stock)}</div>
            <div class="pdp-priceline">${UI.price(p.price, { size: 'lg' })}<small class="muted">Inclusive of all taxes</small></div>

            <a class="creator" href="#/c/${c.u}" aria-label="View ${esc(c.name)} profile">
              ${avatar(c, 52)}
              <span class="grow">
                <strong>${esc(c.name)}${c.verified ? verifiedMark : ''}</strong>
                <small class="muted">${icon('pin', 11)} ${esc(c.loc)}, Bengaluru</small>
                <small class="muted"><b data-count="followers" data-id="${c.id}" data-base="${c.followers}">${compact(c.followers)}</b> followers</small>
              </span>
            </a>
            <div class="creator-actions">
              ${followBtn(c, 'md')}
              <a class="btn btn-md" href="#/c/${c.u}">View profile</a>
            </div>

            ${d.customisable && !out ? `
            <label class="field note-field"><span>Personalisation note <small class="muted">(optional)</small></span>
              <textarea id="pdp-note" rows="2" maxlength="200" placeholder="Names, message, colours…"></textarea></label>` : ''}
            ${purchase}

            <ul class="trust-row">
              <li>${icon('lock', 16)}<span>Secure checkout</span></li>
              <li>${icon('truck', 16)}<span>Ships from ${esc(c.loc)}</span></li>
              <li>${icon('undo', 16)}<span>${d.customisable ? 'Remake if damaged' : '7-day returns'}</span></li>
            </ul>

            <div class="accordion">
              ${acc('Description', `<p>${esc(p.desc)}</p>`, { open: true })}
              ${acc('What’s included', `<ul class="check-list">${d.included.map(x => `<li>${icon('check', 16)}${esc(x)}</li>`).join('')}</ul>`, { open: true })}
              ${acc('Materials', `<div class="chip-row">${d.materials.map(x => `<span class="badge">${esc(x)}</span>`).join('')}</div>
                <p class="muted small">Looking to make something similar? <a class="link" href="#/market">Find materials near you</a></p>`)}
              ${acc('Customisation', `<p>${esc(d.customText)}</p>`, { meta: d.customisable ? 'Available' : 'Not available' })}
              ${acc('Delivery information', `
                <p>Order today and receive it <b>${UI.etaRange(...d.days)}</b> in ${esc(loc.name)}.</p>
                <p class="muted">Delivery is ${UI.money(60)}, and <b>free on orders above ${UI.money(999)}</b>. Packed by hand by ${esc(c.name)}; you will get tracking once it ships.</p>`)}
              ${acc('Returns', `<p>${esc(d.returns)}</p>`)}
              ${acc('Reviews', `
                <div class="review-summary"><b>${p.rating.toFixed(1)}</b>${rating(p.rating)}<span class="muted">${p.reviews} reviews</span></div>
                ${d.reviews.map(r => `
                  <article class="review">
                    <header><span class="avatar" style="--h:${(r.name.charCodeAt(0) * 7) % 360};--size:32px">${esc(r.name[0])}</span>
                      <span class="grow"><strong>${esc(r.name)}</strong><small class="muted">${r.when} · Verified purchase</small></span>
                      <span class="stars" aria-label="${r.rating} out of 5">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></header>
                    <p>${esc(r.text)}</p>
                  </article>`).join('')}`, { meta: `${p.reviews}` }).replace('<details class="acc"', '<details class="acc" id="pdp-reviews"')}
            </div>
          </div>
        </div>

        ${posts.length ? `<section class="block"><div class="section-head"><h2>Seen in posts</h2></div><div class="post-results">${posts.map(postResult).join('')}</div></section>` : ''}
        ${more.length ? `<section class="block"><div class="section-head"><h2>More from this crafter</h2><a href="#/c/${c.u}">View all</a></div>${rail(more)}</section>` : ''}
        ${related.length ? `<section class="block"><div class="section-head"><h2>You may also like</h2></div>${rail(related)}</section>` : ''}
      </div>`,
      after() {
        // Desktop shows every section open; mobile keeps them collapsible.
        if (matchMedia('(min-width: 900px)').matches) $$('.acc').forEach(a => { a.open = true; });
        const track = $('#pdp-track'), thumbs = $$('.thumb');
        track.addEventListener('scroll', () => {
          const i = Math.round(track.scrollLeft / track.clientWidth);
          thumbs.forEach((t, k) => t.classList.toggle('is-on', k === i));
        }, { passive: true });
      },
    };
  }

  /* ======================================================================
     CRAFTER PROFILE — creator profile + small shop
     ====================================================================== */
  const profileState = { tab: 'posts' };
  const PROFILE_TABS = ['posts', 'products', 'about'];

  function crafter(username, query = {}) {
    const c = D.crafterByUsername(username);
    if (!c) return notFound();
    profileState.tab = PROFILE_TABS.includes(query.tab) ? query.tab : 'posts';
    const prods = D.products.filter(p => p.c === c.id);
    const posts = D.posts.filter(p => p.c === c.id);
    const pattern = Array.from({ length: 18 }, (_, i) => `<span style="--r:${(i * 37) % 50 - 25}deg">${i % 3 === 0 ? c.e : i % 3 === 1 ? '✦' : '·'}</span>`).join('');
    return {
      title: c.name,
      html: `
      <div class="page-crafter" data-crafter="${c.id}">
        <header class="profile">
          <div class="profile-cover" style="--h:${c.h}"><div class="cover-pattern" aria-hidden="true">${pattern}</div></div>
          <div class="profile-main">
            <div class="profile-top">
              <span class="profile-avatar">${avatar(c, 112)}</span>
              <div class="profile-actions">
                ${followBtn(c, 'md')}
                <button class="btn btn-md" data-action="soon" data-msg="Messaging is coming soon">${icon('message', 16)} Message</button>
                <button class="icon-btn icon-btn-outline" data-action="share" data-kind="crafter" data-id="${c.id}" aria-label="Share profile">${icon('share', 18)}</button>
              </div>
            </div>
            <div class="profile-id">
              <h1>${esc(c.name)}${c.verified ? verifiedMark : ''}</h1>
              <p class="profile-handle">@${esc(c.u)}</p>
              <p class="profile-tagline">${esc(c.tagline)}</p>
              <p class="profile-where">${icon('pin', 15)} ${esc(c.loc)}, Bengaluru</p>
              <p class="profile-bio">${esc(c.bio)}</p>
              <div class="chip-row">${c.cats.map(x => `<a class="badge badge-link" href="#/search?q=${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</div>
            </div>
            <dl class="stats">
              <div><dt>Posts</dt><dd>${posts.length}</dd></div>
              <div><dt>Products</dt><dd>${prods.length}</dd></div>
              <div><dt>Followers</dt><dd data-count="followers" data-id="${c.id}" data-base="${c.followers}">${compact(c.followers)}</dd></div>
              <div><dt>Following</dt><dd>${compact(c.following)}</dd></div>
            </dl>
          </div>
        </header>
        ${featured(c, prods, posts)}
        <div id="profile-tabs"></div>
        <div id="profile-body"></div>
      </div>`,
      after() { renderProfile(c); },
    };
  }

  /** Best seller + promotional post + current offer. */
  function featured(c, prods, posts) {
    const best = [...prods].sort((a, b) => b.reviews - a.reviews)[0];
    const promo = posts.find(p => p.type === 'promo');
    const offerProd = c.offer && D.byId.product[c.offer.p];
    const cards = [];
    if (best) cards.push(`
      <a class="feat card" href="#/product/${best.id}">
        <span class="feat-art">${art(best, 'art-square')}</span>
        <span class="feat-text"><span class="badge badge-accent">${icon('star', 12)} Best seller</span>
          <strong>${esc(best.name)}</strong><span>${UI.price(best.price)} ${availability(best.stock)}</span></span>
      </a>`);
    if (promo) cards.push(`
      <button class="feat card" data-action="open-post" data-id="${promo.id}">
        <span class="feat-art">${art(promo, 'art-square')}</span>
        <span class="feat-text"><span class="badge badge-accent">${icon('sparkle', 12)} ${esc(promo.badge)}</span>
          <strong>${esc(promo.title)}</strong><span class="link small">View promotion ${icon('chevron-right', 13)}</span></span>
      </button>`);
    if (c.offer) cards.push(`
      <a class="feat card feat-offer" href="#/product/${c.offer.p}">
        <span class="feat-ico">${icon('tag', 26)}</span>
        <span class="feat-text"><span class="badge badge-sage">Current offer</span>
          <strong>${esc(c.offer.title)}</strong><small class="muted">${esc(c.offer.text)} · ${esc(c.offer.ends)}</small>
          ${offerProd ? `<span class="link small">Shop ${esc(offerProd.name)} ${icon('chevron-right', 13)}</span>` : ''}</span>
      </a>`);
    return cards.length ? `<section class="featured" aria-label="Featured"><h2 class="featured-title">Featured</h2><div class="featured-row">${cards.join('')}</div></section>` : '';
  }

  function postTile(p) {
    return `<button class="tile" data-action="open-post" data-id="${p.id}" aria-label="Open post: ${esc(p.title)}">
      ${art(p, 'art-square')}
      ${p.type === 'video' ? `<span class="tile-badge">${icon('play', 14)}</span>` : p.type === 'promo' ? `<span class="tile-badge">${icon('tag', 14)}</span>` : ''}
      <span class="tile-meta">${icon('heart', 13)} ${compact(p.likes)}${p.p ? `<span class="tile-prod">${icon('bag', 13)}</span>` : ''}</span>
    </button>`;
  }

  function aboutTab(c, prods) {
    const row = (ico, label, value) => `<div class="fact"><span class="fact-ico">${icon(ico, 18)}</span><div><dt>${label}</dt><dd>${value}</dd></div></div>`;
    return `
    <div class="about">
      <section class="card pad about-story">
        <h2>About ${esc(c.name)}</h2>
        <p>${esc(c.bio)}</p>
        <p class="muted">${esc(c.story)}</p>
      </section>
      <section class="card pad">
        <dl class="facts">
          ${row('pin', 'Location', `${esc(c.loc)}, Bengaluru<br><small class="muted">Studio pickup by appointment</small>`)}
          ${row('grid', 'Categories', `<span class="chip-row">${c.cats.map(x => `<a class="badge badge-link" href="#/search?q=${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</span>`)}
          ${row('sparkle', 'Specialities', `<span class="chip-row">${c.specialities.map(x => `<span class="badge">${esc(x)}</span>`).join('')}</span>`)}
          ${row('sparkle', 'Custom orders', `${c.custom.yes ? '<span class="badge badge-sage">Accepting custom orders</span>' : '<span class="badge">Not available</span>'}<br><small class="muted">${esc(c.custom.note)}</small>`)}
          ${row('clock', 'Response time', esc(c.response))}
          ${row('package', 'Ships', `Across India · 2–5 days<br><small class="muted">${prods.length} products in the shop</small>`)}
          ${row('verified', 'On Crafters since', c.since)}
        </dl>
        <div class="btn-row"><button class="btn btn-primary" data-action="soon" data-msg="Messaging is coming soon">${icon('message', 16)} Ask about a custom order</button></div>
      </section>
    </div>`;
  }

  function renderProfile(c) {
    const prods = D.products.filter(p => p.c === c.id);
    const posts = D.posts.filter(p => p.c === c.id);
    const t = profileState.tab;
    history.replaceState(null, '', `#/c/${c.u}${t !== 'posts' ? '?tab=' + t : ''}`);
    rerender('#profile-tabs', tabs([
      { id: 'posts', label: 'Posts', count: posts.length },
      { id: 'products', label: 'Products', count: prods.length },
      { id: 'about', label: 'About' },
    ], t, 'profile-tab'));
    const empty = emptyState({ emoji: '🪡', title: 'Nothing here yet', text: 'This crafter has not shared anything in this section.' });
    rerender('#profile-body',
      t === 'posts' ? (posts.length ? grid('grid-tiles', posts.map(postTile)) : empty)
        : t === 'products' ? (prods.length ? grid('grid-products', prods.map(productCard)) : empty)
          : aboutTab(c, prods));
  }

  /* ======================================================================
     ME — Profile tab (saved, following, recents, orders)
     ====================================================================== */
  const meState = { tab: 'saved' };

  function me() {
    const prof = S.get('profile');
    const name = prof.name || 'Guest crafter-lover';
    return {
      title: 'Profile',
      html: `
      <div class="page-me">
        <header class="card pad me-head">
          <span class="avatar" style="--h:28;--size:72px">${esc((prof.name || 'G')[0].toUpperCase())}</span>
          <div class="grow"><h1>${esc(name)}</h1>
            <button class="loc-btn" data-action="location">${icon('pin', 14)}<span data-loc-label>${esc(currentLocation().name)}</span>${icon('chevron-down', 12)}</button></div>
        </header>
        <div class="card pad cta-card">
          <div class="grow"><strong>Are you a crafter?</strong><p class="muted small">Open your own shop, share posts and reach buyers nearby.</p></div>
          <button class="btn btn-primary btn-sm" data-action="soon" data-msg="Crafter onboarding is coming soon">Start selling</button>
        </div>
        <a class="row link-row" href="#/design"><span class="grow"><strong>Design system</strong><small class="muted">Components and tokens used across the app</small></span>${icon('chevron-right', 18)}</a>
        <div id="me-tabs"></div>
        <div id="me-body"></div>
      </div>`,
      after() { renderMe(); },
    };
  }

  function renderMe() {
    const saved = S.get('saved').map(id => D.byId.product[id]).filter(Boolean);
    const following = S.get('following').map(id => D.byId.crafter[id]).filter(Boolean);
    const recent = S.get('recent').map(id => D.byId.product[id]).filter(Boolean);
    const orders = S.get('orders');
    const t = meState.tab;
    rerender('#me-tabs', tabs([
      { id: 'saved', label: 'Saved', count: saved.length }, { id: 'following', label: 'Following', count: following.length },
      { id: 'recent', label: 'Recent', count: recent.length }, { id: 'orders', label: 'Orders', count: orders.length },
    ], t, 'me-tab'));
    const browse = '<a class="btn btn-sm" href="#/search">Browse products</a>';
    let html;
    if (t === 'saved') html = saved.length ? grid('grid-products', saved.map(productCard)) : emptyState({ emoji: '🔖', title: 'Nothing saved yet', text: 'Tap the bookmark on any product to keep it here.', cta: browse });
    else if (t === 'following') html = following.length ? grid('grid-crafters', following.map(c => crafterCard(c))) : emptyState({ emoji: '👋', title: 'Not following anyone', text: 'Follow crafters to see their work first in your feed.', cta: '<a class="btn btn-sm" href="#/search?mode=profiles&q=a">Find crafters</a>' });
    else if (t === 'recent') html = recent.length ? grid('grid-products', recent.map(productCard)) : emptyState({ emoji: '👀', title: 'No recent views', text: 'Products you open will show up here.', cta: browse });
    else html = orders.length ? orders.map(o => `
        <article class="card pad order">
          <header><strong>${esc(o.id)}</strong><span class="badge badge-sage">Confirmed</span></header>
          <p class="muted small">${new Date(o.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · ${o.items.reduce((n, i) => n + i.qty, 0)} items</p>
          <ul>${o.items.map(i => `<li>${esc(i.name)} × ${i.qty}</li>`).join('')}</ul>
          <p><b>${money(o.total)}</b></p>
        </article>`).join('') : emptyState({ emoji: '📦', title: 'No orders yet', text: 'Your purchases will appear here.', cta: browse });
    rerender('#me-body', html);
  }

  /* ======================================================================
     DESIGN SYSTEM — living reference for every shared component (#/design)
     ====================================================================== */
  function design() {
    const sw = [['--bg', 'Background'], ['--surface', 'Surface'], ['--surface-elevated', 'Elevated'], ['--surface-2', 'Sunken'],
      ['--text', 'Text'], ['--text-2', 'Text 2'], ['--text-muted', 'Muted'], ['--border', 'Border'],
      ['--accent', 'Accent'], ['--success', 'Success'], ['--warning', 'Warning'], ['--error', 'Error']];
    const sample = D.products[0], c = D.crafters[0], post = D.posts[0];
    const sec = (title, body) => `<section class="block ds-section"><h2 class="t-section">${title}</h2><div class="ds-demo">${body}</div></section>`;
    return {
      title: 'Design system',
      html: `
      <div class="page-design">
        <p class="eyebrow">Design system</p>
        <h1 class="t-display">Crafters UI kit</h1>
        <p class="t-body muted">Every shared component, rendered from the same functions the app uses.</p>

        ${sec('Colour tokens', `<div class="swatches">${sw.map(([v, n]) => `<div class="swatch"><span style="background:var(${v})"></span><small>${n}</small></div>`).join('')}</div>`)}
        ${sec('Typography', `
          <p class="t-display">Display heading</p><p class="t-page">Page heading</p><p class="t-section">Section heading</p>
          <p class="t-card-title">Card title</p><p class="t-body">Body — handmade things deserve calm, readable type.</p>
          <p class="t-caption">Caption — supporting detail</p><p class="t-meta">Metadata · 2 days ago · Bengaluru</p><p class="t-button">Button text</p>`)}
        ${sec('Buttons', `<div class="btn-row">
          <button class="btn btn-primary">Primary</button><button class="btn">Secondary</button><button class="btn btn-ghost">Ghost</button>
          <button class="btn btn-primary" disabled>Disabled</button><button class="btn btn-sm">Small</button><button class="btn btn-lg">Large</button>
          <button class="icon-btn icon-btn-outline" aria-label="Share">${icon('share', 20)}</button>
          <button class="icon-btn icon-btn-outline" data-action="like" data-id="ds" aria-label="Like">${icon('heart', 20)}</button></div>`)}
        ${sec('Inputs, quantity & price', `
          ${UI.searchInput({ id: 'ds-search', role: 'ds', placeholder: 'Search input' })}
          <div class="btn-row">${UI.qty({ action: 'soon', attrs: 'data-msg="Quantity selector"' })}${UI.price(1499)}${UI.price(1199, { was: 1499 })}</div>`)}
        ${sec('Badges & avatars', `<div class="chip-row"><span class="badge">Default</span><span class="badge badge-accent">Accent</span><span class="badge badge-sage">In stock</span><span class="badge badge-warn">Only 3 left</span><span class="badge badge-danger">Sold out</span></div>
          <div class="btn-row">${[24, 40, 64].map(s => avatar(c, s)).join('')}${verifiedMark}</div>`)}
        ${sec('Tabs', tabs([{ id: 'a', label: 'Products', count: 12 }, { id: 'b', label: 'Posts', count: 4 }, { id: 'c', label: 'Videos', count: 2 }], 'a', 'soon'))}
        ${sec('Modal & toast', `<div class="btn-row">
          <button class="btn" data-action="ds-modal">Open modal</button>
          <button class="btn" data-action="ds-toast">Show toast</button></div>`)}
        ${sec('Cards', `<div class="ds-cards"><div class="ds-card-w">${productCard(sample)}</div><div class="ds-card-w">${crafterCard(c)}</div></div>
          <div class="ds-post">${postCard(post)}</div>`)}
        ${sec('Loading & empty states', `${UI.loading(2)}<div class="btn-row">${UI.spinner()}<span class="muted">Spinner</span></div>
          ${emptyState({ emoji: '🧺', title: 'Nothing here yet', text: 'Empty states explain what to do next.' })}`)}
      </div>`,
    };
  }

  function notFound() {
    return { title: 'Not found', html: emptyState({ emoji: '🧭', title: 'We could not find that', text: 'The page may have moved.', cta: '<a class="btn btn-primary" href="#/home">Back home</a>' }) };
  }

  /* ======================================================================
     Page-specific actions (merged into the global action map)
     ====================================================================== */
  const actions = {
    'search-mode': el => { searchState.mode = el.dataset.tab; renderSearch(); },
    'search-set': el => {
      searchState.q = el.dataset.q; searchState.suggest = false; S.pushSearch(searchState.q);
      const i = $('#search-input'); if (i) { i.value = searchState.q; i.blur(); }
      renderSearch();
    },
    'search-clear': () => {
      searchState.q = ''; searchState.suggest = false;
      const i = $('#search-input'); i.value = ''; i.focus();
      renderSearch();
    },
    'search-voice': () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return UI.toast('Voice search is not supported in this browser', { type: 'info' });
      const rec = new SR();
      rec.lang = 'en-IN';
      rec.onresult = e => {
        searchState.q = e.results[0][0].transcript.replace(/[.。]$/, '');
        searchState.suggest = false;
        $('#search-input').value = searchState.q;
        S.pushSearch(searchState.q);
        renderSearch();
      };
      rec.onerror = () => UI.toast('Could not hear that — try again', { type: 'info' });
      UI.toast('Listening…', { type: 'info' });
      try { rec.start(); } catch { /* already started */ }
    },
    'suggest-go': () => { const q = searchState.q.trim(); if (q) S.pushSearch(q); },
    'recent-remove': el => {
      S.set('searches', S.get('searches').filter(t => t !== el.dataset.q));
      renderSearch();
    },
    'clear-searches': () => { S.set('searches', []); renderSearch(); },
    'market-view': el => {
      marketState.view = el.dataset.view;
      $$('.view-toggle button').forEach(b => b.classList.toggle('is-on', b === el));
      $('#market-body').dataset.view = marketState.view;
    },
    'market-cat': el => {
      marketState.cat = marketState.cat === el.dataset.cat ? '' : el.dataset.cat;
      marketState.sel = null;
      $('#market-cats').innerHTML = marketCats();
      renderMarket();
    },
    'market-pin': el => { marketState.sel = el.dataset.id; renderMarket(); },
    'shop-cat': el => {
      shopState.cat = el.dataset.cat;
      $$('[data-action="shop-cat"]').forEach(b => b.classList.toggle('is-on', b === el));
      renderShop(location.hash.split('/').pop());
    },
    'profile-tab': el => { profileState.tab = el.dataset.tab; renderProfile(D.byId.crafter[$('.page-crafter').dataset.crafter]); },
    'me-tab': el => { meState.tab = el.dataset.tab; renderMe(); },
    'pdp-qty': el => {
      const out = $('#pdp-qty'); out.textContent = Math.max(1, Math.min(+el.dataset.max || 10, +out.textContent + +el.dataset.d));
    },
    'pdp-thumb': el => {
      const track = $('#pdp-track');
      track.scrollTo({ left: +el.dataset.i * track.clientWidth, behavior: 'smooth' });
      $$('.thumb').forEach(t => t.classList.toggle('is-on', t === el));
    },
    'goto-reviews': () => {
      const acc = $('#pdp-reviews'); acc.open = true;
      acc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    'open-post': el => {
      const p = D.byId.post[el.dataset.id], c = D.byId.crafter[p.c], prod = p.p && D.byId.product[p.p];
      const media = p.type === 'video'
        ? `<div class="video-frame">${art(p, 'art-post')}<span class="play-disc">${icon('play', 28)}</span><div class="video-progress"><i></i></div><span class="duration">${p.duration}</span></div>`
        : `<div class="post-modal-media">${art(p, 'art-post')}${p.badge ? `<span class="badge badge-light post-modal-badge">${esc(p.badge)}</span>` : ''}</div>`;
      UI.openModal({
        title: `@${c.u}`, variant: 'modal-post',
        html: `${media}
          <div class="post-actions post-actions-flush">
            <button class="act" data-action="like" data-id="${p.id}" aria-label="Like">${icon('heart', 22)}<span data-count="like" data-id="${p.id}" data-base="${p.likes}">${compact(p.likes)}</span></button>
            <button class="act" data-action="share" data-id="${p.id}" data-kind="post" aria-label="Share">${icon('share', 22)}</button>
            ${prod ? `<button class="act act-right" data-action="save" data-id="${prod.id}" aria-label="Save product">${icon('bookmark', 22)}</button>` : ''}
          </div>
          <div><h3>${esc(p.title)}</h3><p class="muted">${esc(p.caption)}</p></div>
          ${prod ? `<div class="post-product post-product-flush">
            <a href="#/product/${prod.id}" data-action="close-modal" class="post-product-art">${art(prod, 'art-square')}</a>
            <div class="post-product-info"><a href="#/product/${prod.id}" data-action="close-modal" class="truncate"><strong>${esc(prod.name)}</strong></a>
              <span><b class="price">${money(prod.price)}</b> ${availability(prod.stock)}</span></div>
            <a class="btn btn-sm" href="#/product/${prod.id}" data-action="close-modal">View</a>
            <button class="btn btn-sm btn-primary" data-action="buy-now" data-type="p" data-id="${prod.id}" ${prod.stock === 0 ? 'disabled' : ''}>Buy</button>
          </div>` : ''}`,
      });
    },
    play: el => {
      const p = D.byId.post[el.dataset.id], c = D.byId.crafter[p.c], prod = p.p && D.byId.product[p.p];
      UI.openModal({
        title: p.title, variant: 'modal-video',
        html: `<div class="video-frame">${art(p, 'art-video')}<div class="video-progress"><i></i></div><span class="duration">${p.duration}</span></div>
          <div class="video-meta"><a class="who" href="#/c/${c.u}" data-action="close-modal">${avatar(c, 36)}<span><strong>${esc(c.name)}</strong><small class="muted">@${esc(c.u)}</small></span></a>${followBtn(c)}</div>
          <p>${esc(p.caption)}</p>
          ${prod ? `<div class="btn-row"><a class="btn" href="#/product/${prod.id}" data-action="close-modal">View ${esc(prod.name)}</a><button class="btn btn-primary" data-action="buy-now" data-type="p" data-id="${prod.id}" ${prod.stock === 0 ? 'disabled' : ''}>Buy · ${money(prod.price)}</button></div>` : ''}`,
      });
    },
    material: el => {
      const x = D.byId.material[el.dataset.id], s = D.byId.shop[x.s];
      const note = x.stock === 0 ? 'Currently out of stock. Check back soon or try a nearby shop.'
        : x.stock <= 5 ? `Only ${x.stock} left — reserve now to pick up today.` : `${x.stock} available — ready for pickup ${shopStatus(s) ? 'today' : 'tomorrow'}.`;
      UI.openModal({
        title: x.name,
        html: `<div class="material-detail">
          <div class="material-hero" style="--h:${s.h}">${x.e}</div>
          <p class="price-lg">${money(x.price)} <small class="muted">/ ${esc(x.unit)}</small></p>
          <div class="availability-box ${x.stock === 0 ? 'out' : x.stock <= 5 ? 'low' : 'ok'}">${stockLabel(x.stock)}<p>${note}</p></div>
          <a class="crafter-strip" href="#/market/shop/${s.id}" data-action="close-modal"><span class="shop-badge" style="--h:${s.h}">${s.e}</span><span class="grow"><strong>${esc(s.name)}</strong><small class="muted">${esc(s.area)} · ${km(D.distanceKm(currentLocation(), s))}</small></span>${icon('chevron-right', 16)}</a>
          <div class="btn-row"><button class="btn" data-action="add-cart" data-type="m" data-id="${x.id}" ${x.stock === 0 ? 'disabled' : ''}>Add to cart</button><button class="btn btn-primary" data-action="buy-now" data-type="m" data-id="${x.id}" ${x.stock === 0 ? 'disabled' : ''}>Buy now</button></div>
        </div>`,
      });
    },
  };

  actions['ds-modal'] = () => UI.openModal({ title: 'Modal title', html: '<p>Modals are sheets on phones and dialogs on larger screens.</p><button class="btn btn-primary" data-action="close-modal">Got it</button>' });
  actions['ds-toast'] = () => UI.toast('This is a toast message');

  return { home, search, post, market, shop, product, crafter, me, design, notFound, actions, currentLocation, renderMe, renderMarket };
})();
