/* ==========================================================================
   Cart & checkout (modal flow). Handles products and craft materials.
   Two modes share one checkout:
     - cart mode   → lines come from the persisted cart
     - direct mode → "Buy now": a single line, cart untouched
   Exposes: Cart (with Cart.actions)
   ========================================================================== */
const Cart = (() => {
  const { esc, money, icon, art, avatar } = UI;
  const D = DATA, S = Store;
  const FREE_DELIVERY_OVER = 999, DELIVERY_FEE = 60;

  let direct = null; // [{ t, id, qty, note }] while a Buy-now checkout is open

  const lookup = l => (l.t === 'p' ? D.byId.product : D.byId.material)[l.id];
  const maxQty = item => Math.max(1, Math.min(item.stock, 99));

  function lines() {
    return (direct || S.get('cart')).map(l => {
      const item = lookup(l);
      if (!item) return null;
      const seller = l.t === 'p' ? D.byId.crafter[item.c] : D.byId.shop[item.s];
      return { ...l, item, seller, sub: item.price * l.qty };
    }).filter(Boolean);
  }
  function totals() {
    const ls = lines();
    const subtotal = ls.reduce((n, l) => n + l.sub, 0);
    const delivery = !ls.length || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    return { subtotal, delivery, total: subtotal + delivery };
  }

  /** Estimated delivery window for a set of lines (latest item decides). */
  function eta(ls) {
    const days = ls.map(l => (l.t === 'p' ? D.details(l.item).days : [0, 1]));
    const lo = Math.max(...days.map(d => d[0])), hi = Math.max(...days.map(d => d[1]));
    return UI.etaRange(lo, hi);
  }

  /** Add an item to the persisted cart; returns false if unavailable. */
  function add(t, id, qty = 1, note = '') {
    const item = (t === 'p' ? D.byId.product : D.byId.material)[id];
    if (!item) return false;
    if (item.stock === 0) { UI.toast('Sorry, that is out of stock', { type: 'info' }); return false; }
    S.cartAdd(t, id, qty, maxQty(item), note);
    return true;
  }

  const readQty = el => (el.dataset.qtyFrom ? +UI.$(el.dataset.qtyFrom).textContent : 1);
  const readNote = el => (el.dataset.noteFrom ? (UI.$(el.dataset.noteFrom)?.value || '').trim() : '');

  const summary = () => {
    const { subtotal, delivery, total } = totals();
    return `<dl class="summary">
      <div><dt>Subtotal</dt><dd>${money(subtotal)}</dd></div>
      <div><dt>Delivery</dt><dd>${delivery ? money(delivery) : 'Free'}</dd></div>
      <div class="total"><dt>Total</dt><dd>${money(total)}</dd></div>
    </dl>`;
  };

  /* ---------- cart ---------- */
  function cartHtml() {
    const ls = lines();
    if (!ls.length) {
      return UI.emptyState({ emoji: '🧺', title: 'Your cart is empty', text: 'Find something handmade — or the materials to make it.',
        cta: '<button class="btn btn-primary" data-action="close-modal">Keep exploring</button>' });
    }
    const groups = new Map();
    ls.forEach(l => { const k = l.t + l.seller.id; (groups.get(k) || groups.set(k, { seller: l.seller, t: l.t, ls: [] }).get(k)).ls.push(l); });
    const { subtotal } = totals();
    const left = FREE_DELIVERY_OVER - subtotal;
    return `
      ${left > 0 ? `<p class="free-ship">Add ${money(left)} more for free delivery</p>` : '<p class="free-ship ok">You have free delivery 🎉</p>'}
      ${[...groups.values()].map(g => `
        <section class="cart-group">
          <header>${g.t === 'p' ? avatar(g.seller, 24) : `<span class="shop-badge" style="--h:${g.seller.h}">${g.seller.e}</span>`}
            <strong>${esc(g.seller.name)}</strong><span class="badge">${g.t === 'p' ? 'Crafter' : 'Material shop'}</span></header>
          ${g.ls.map(l => `
            <div class="cart-line">
              <div class="cart-thumb">${l.t === 'p' ? art(l.item, 'art-square') : `<span class="material-ico">${l.item.e}</span>`}</div>
              <div class="grow">
                <a href="${l.t === 'p' ? '#/product/' + l.id : '#/market/shop/' + l.item.s}" data-action="close-modal"><strong>${esc(l.item.name)}</strong></a>
                <small class="muted">${money(l.item.price)}${l.t === 'm' ? ' / ' + esc(l.item.unit) : ''}</small>
                ${l.note ? `<small class="line-note">“${esc(l.note)}”</small>` : ''}
                ${UI.qty({ value: l.qty, action: 'cart-qty', attrs: `data-type="${l.t}" data-id="${l.id}"`, size: 'sm' })}
              </div>
              <div class="cart-line-end"><b>${money(l.sub)}</b>
                <button class="icon-btn" data-action="cart-remove" data-type="${l.t}" data-id="${l.id}" aria-label="Remove ${esc(l.item.name)}">${icon('trash', 16)}</button></div>
            </div>`).join('')}
        </section>`).join('')}
      ${summary()}
      <button class="btn btn-primary btn-lg btn-block" data-action="checkout">Checkout · ${money(totals().total)}</button>`;
  }

  function open() {
    direct = null;
    UI.openModal({ title: 'Your cart', html: cartHtml(), variant: 'modal-sheet' });
  }
  const refresh = () => UI.setModalBody(cartHtml());

  /* ---------- checkout ---------- */
  function checkoutHtml() {
    const p = S.get('profile');
    const ls = lines();
    return `
      <form class="form" data-role="checkout" novalidate>
        <section class="co-section">
          <h3 class="co-title">Order summary</h3>
          <ul class="co-items">${ls.map(l => `
            <li>
              <span class="co-thumb">${l.t === 'p' ? art(l.item, 'art-square') : `<span class="material-ico">${l.item.e}</span>`}</span>
              <span class="grow"><strong>${esc(l.item.name)}</strong>
                <small class="muted">${esc(l.seller.name)} · Qty ${l.qty}</small>
                ${l.note ? `<small class="line-note">“${esc(l.note)}”</small>` : ''}</span>
              <b>${money(l.sub)}</b>
            </li>`).join('')}</ul>
          ${summary()}
          <p class="co-eta">${icon('truck', 16)} Estimated delivery <b>${eta(ls)}</b></p>
        </section>

        <section class="co-section">
          <h3 class="co-title">Delivery details</h3>
          <label class="field"><span>Full name</span><input name="name" value="${esc(p.name)}" autocomplete="name" required></label>
          <label class="field"><span>Phone</span><input name="phone" value="${esc(p.phone)}" inputmode="tel" autocomplete="tel"></label>
          <label class="field"><span>Delivery address</span><textarea name="address" rows="3" autocomplete="street-address" required>${esc(p.address)}</textarea></label>
        </section>

        <section class="co-section">
          <fieldset class="field"><legend>Payment method</legend>
            <label class="radio"><input type="radio" name="pay" value="upi" checked> UPI</label>
            <label class="radio"><input type="radio" name="pay" value="card"> Card</label>
            <label class="radio"><input type="radio" name="pay" value="cod"> Cash on delivery / pickup</label>
          </fieldset>
          <p class="trust">${icon('lock', 14)} This is a demo checkout — no real payment is taken.</p>
        </section>

        <p class="form-error" role="alert" hidden></p>
        <button class="btn btn-primary btn-lg btn-block" data-action="place-order" type="button">Place order · ${money(totals().total)}</button>
        ${direct
          ? '<button class="btn btn-ghost btn-block" data-action="close-modal" type="button">Cancel</button>'
          : '<button class="btn btn-ghost btn-block" data-action="cart" type="button">Back to cart</button>'}
      </form>`;
  }

  function openCheckout() {
    if (!lines().length) return;
    UI.openModal({ title: 'Checkout', html: checkoutHtml(), variant: 'modal-sheet' });
  }

  let placing = false;
  function placeOrder(btn) {
    if (placing) return;
    const form = UI.$('[data-role="checkout"]');
    const f = Object.fromEntries(new FormData(form));
    const err = UI.$('.form-error', form);
    if (!f.name.trim() || !f.address.trim()) {
      err.textContent = 'Please add your name and delivery address.'; err.hidden = false;
      UI.$(!f.name.trim() ? '[name="name"]' : '[name="address"]', form).focus();
      return;
    }
    err.hidden = true;
    placing = true;
    btn.disabled = true;
    btn.innerHTML = `${UI.spinner()} Placing order…`;
    setTimeout(() => {
      placing = false;
      if (UI.$('[data-role="checkout"]')) finishOrder(f); // skip if the user closed the modal meanwhile
    }, 800);
  }

  function finishOrder(f) {
    S.set('profile', { name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim() });
    const ls = lines();
    const t = totals();
    const order = {
      id: 'CR' + Date.now().toString().slice(-7), date: Date.now(), total: t.total, eta: eta(ls),
      items: ls.map(l => ({ name: l.item.name, qty: l.qty })),
    };
    S.set('orders', [order, ...S.get('orders')]);
    if (direct) direct = null; else S.cartClear();
    UI.setModalBody(`
      <div class="success">
        <div class="success-ico">${icon('check', 36)}</div>
        <h3>Order placed successfully</h3>
        <p class="muted">Thank you, ${esc(f.name.trim().split(' ')[0])}! A confirmation is on its way.</p>
        <dl class="receipt">
          <div><dt>Order number</dt><dd>${order.id}</dd></div>
          <div><dt>${order.items.length > 1 ? 'Items' : 'Product'}</dt><dd>${order.items.map(i => `${esc(i.name)} × ${i.qty}`).join('<br>')}</dd></div>
          <div><dt>Total paid</dt><dd>${money(order.total)}</dd></div>
          <div><dt>Estimated delivery</dt><dd>${order.eta}</dd></div>
        </dl>
        <div class="btn-row center"><a class="btn" href="#/me" data-action="close-modal">View orders</a><button class="btn btn-primary" data-action="close-modal">Continue shopping</button></div>
      </div>`);
  }

  /* ---------- actions ---------- */
  const actions = {
    cart: open,
    'add-cart': el => {
      if (add(el.dataset.type, el.dataset.id, readQty(el), readNote(el))) {
        UI.toast('Added to cart', { action: { label: 'View cart', act: 'cart' } });
      }
    },
    'buy-now': el => {
      const item = (el.dataset.type === 'p' ? D.byId.product : D.byId.material)[el.dataset.id];
      if (!item) return;
      if (item.stock === 0) return UI.toast('Sorry, that is out of stock', { type: 'info' });
      direct = [{ t: el.dataset.type, id: el.dataset.id, qty: Math.min(readQty(el), maxQty(item)), note: readNote(el) }];
      openCheckout();
    },
    'cart-qty': el => {
      const l = S.get('cart').find(x => x.t === el.dataset.type && x.id === el.dataset.id);
      if (!l) return;
      S.cartSetQty(l.t, l.id, l.qty + +el.dataset.d, maxQty(lookup(l)));
      refresh();
    },
    'cart-remove': el => { S.cartRemove(el.dataset.type, el.dataset.id); refresh(); },
    checkout: () => { direct = null; openCheckout(); },
    'place-order': placeOrder,
  };

  return { actions, open, add };
})();
