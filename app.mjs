// Disney Dining Plan Credit Map — claude implementation.
// Pure functions exported for the shared test suite; DOM wiring only runs in a browser.

import { pinHtml, tileConfig } from './map-style.mjs';

export const QS_BENCH = 24;
export const SNACK_BENCH = 7;
export const CREDIT_CLASS = { combo: 'qs', entree: 'qs', side: 'snack', dessert: 'snack', drink: 'snack', snack: 'snack', kids: 'kids' };
const GUESTS = ['S', 'M', 'L'];
const CREDIT_TYPES = ['quick', 'snack'];
const LEDGER_KEY = 'ddp-ledger-v2';
const LEGACY_LEDGER_KEY = 'ddp-ledger-v1';

// ---- tiers / ranking / filters ------------------------------------------------
export function tierFor(rv) {
  if (rv === null || rv === undefined) return null;
  return rv >= 20 ? 1 : rv >= 16 ? 2 : 3;
}

export function bestValueFilter(venues) {
  return venues.filter(v => v.tier === 1);
}

export function rankVenues(venues) {
  return [...venues].sort((a, b) => {
    const ra = a.ranking_value, rb = b.ranking_value;
    if (ra === null && rb === null) return 0;
    if (ra === null) return 1;
    if (rb === null) return -1;
    return rb - ra;
  });
}

function bestDrink(menuItems) {
  const drinks = menuItems.filter(m => m.category === 'drink');
  const specialty = drinks.filter(m => m.specialty);
  return (specialty.length ? specialty : drinks)
    .reduce((current, drink) => !current || drink.price > current.price ? drink : current, null);
}

export function drinkPairing(menuItems) {
  const best = bestDrink(menuItems);
  if (best?.specialty) return `+ ${best.item} $${best.price.toFixed(2)}`;
  if (best) return `no specialty drink here — best drink: ${best.item} $${best.price.toFixed(2)}`;
  return 'no drink pairing at this venue';
}

export function arrowFor(item, venue) {
  if (['entree', 'combo'].includes(item.category)) {
    const drink = bestDrink(venue.menu_items || []);
    const total = Math.round((item.price + (drink?.price || 0)) * 100) / 100;
    return { dir: total >= QS_BENCH ? 'up' : total >= 20 ? 'flat' : 'down', total };
  }
  if (['side', 'dessert', 'drink', 'snack'].includes(item.category)) {
    const total = item.price;
    return { dir: total >= SNACK_BENCH ? 'up' : total >= 6 ? 'flat' : 'down', total };
  }
  return null;
}

// ---- geo -----------------------------------------------------------------------
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000, r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function walkMinutes(meters) {
  return Math.round(meters / 80);
}

export function freshPosition(pos, now) {
  return (now - pos.timestamp) <= 60_000 && pos.coords.accuracy <= 100;
}

export function bestNearby(venues, here) {
  return venues
    .filter(v => v.accepted_credits.some(c => CREDIT_TYPES.includes(c)) && typeof v.lat === 'number')
    .map(v => ({ v, d: distanceMeters(here.lat, here.lng, v.lat, v.lng) }))
    .sort((a, b) => {
      const ta = a.v.tier ?? 9, tb = b.v.tier ?? 9;
      if (ta !== tb) return ta - tb;
      return a.d - b.d;
    })
    .slice(0, 3)
    .map(x => Object.assign({ _distance: x.d }, x.v));
}

// ---- ledger (event-sourced) -----------------------------------------------------
export function initialLedger() {
  return {
    balances: Object.fromEntries(GUESTS.map(g => [g, { quick: 6, snack: 6 }])),
    totals: {
      quick: { count: 0, value: 0, knownCount: 0 },
      snack: { count: 0, value: 0, knownCount: 0 },
    },
    entries: {},        // eventId -> applied entry (for undo)
  };
}

function clone(st) { return JSON.parse(JSON.stringify(st)); }

function venueById(ds, id) {
  return ds.locations.find(l => l.id === id) || null;
}

function redemptionValue(ev, ds) {
  if (!ev.venue) return null;
  const v = venueById(ds, ev.venue);
  if (!v) return null;
  if (ev.credit === 'quick') {
    if (ev.guest === 'L') return v.child_value ?? null;
    // Period-specific value only matters when the venue has multiple priced periods
    // with differing values (the UI only asks the question in that case).
    const priced = v.meal_periods.filter(p => p.value_avg !== null && p.value_avg !== undefined);
    const distinct = new Set(priced.map(p => p.value_avg));
    if (ev.period && priced.length > 1 && distinct.size > 1) {
      const p = priced.find(p => p.period === ev.period);
      if (p) return p.value_avg;
    }
    return v.ranking_value ?? null;
  }
  if (ev.credit === 'snack') {
    if (ev.pick) {
      const p = (v.snack_picks || []).find(s => s.item === ev.pick);
      if (p) return p.price;
    }
    return null;
  }
  return null;
}

export function ledgerReduce(state, events, ds) {
  const st = clone(state);
  for (const raw of events) {
    const ev = { ...raw };
    const id = ev.id ?? `e${ev.ts ?? Math.floor(0)}-${JSON.stringify([ev.type, ev.guest, ev.venue, ev.credit]).length}-${Object.keys(st.entries).length}`;
    if (st.entries[id]) continue; // duplicate event id — already applied

    if (ev.type === 'redeem') {
      const bal = st.balances[ev.guest];
      if (!bal || !CREDIT_TYPES.includes(ev.credit)) continue;
      if (bal[ev.credit] <= 0) continue; // floor
      const value = redemptionValue(ev, ds);
      bal[ev.credit] -= 1;
      const t = st.totals[ev.credit];
      t.count += 1;
      if (value !== null) { t.value += value; t.knownCount += 1; }
      st.entries[id] = { type: 'redeem', guest: ev.guest, credit: ev.credit, value, undone: false };

    } else if (ev.type === 'adjust') {
      const bal = st.balances[ev.guest];
      if (!bal || !CREDIT_TYPES.includes(ev.credit)) continue;
      const before = bal[ev.credit];
      bal[ev.credit] = Math.max(0, Math.min(6, before + ev.delta));
      st.entries[id] = { type: 'adjust', guest: ev.guest, credit: ev.credit, applied: bal[ev.credit] - before, undone: false };

    } else if (ev.type === 'undo') {
      const e = st.entries[ev.target];
      if (!e || e.undone) continue;
      e.undone = true;
      if (e.type === 'redeem') {
        st.balances[e.guest][e.credit] = Math.min(6, st.balances[e.guest][e.credit] + 1);
        const t = st.totals[e.credit];
        t.count -= 1;
        if (e.value !== null) { t.value -= e.value; t.knownCount -= 1; }
      } else if (e.type === 'adjust') {
        const bal = st.balances[e.guest];
        bal[e.credit] = Math.max(0, Math.min(6, bal[e.credit] - e.applied));
      }
    }
  }
  return st;
}

function parseLedger(raw) {
  try {
    const o = JSON.parse(raw);
    if (o && [1, 2].includes(o.schema) && Array.isArray(o.events)) return o;
  } catch { /* corrupt */ }
  return null;
}

function withoutRemovedTsEvents(events) {
  const removed = events.filter(e => e && (['ts_used', 'booked_ts_used'].includes(e.type) ||
    (e.credit && !CREDIT_TYPES.includes(e.credit))));
  const removedIds = new Set(removed.map(e => e.id).filter(Boolean));
  return events.filter(e => !removed.includes(e) && !(e.type === 'undo' && removedIds.has(e.target)));
}

export function loadLedger(raw) {
  const stored = parseLedger(raw);
  if (stored) return { events: withoutRemovedTsEvents(stored.events) };
  return { events: [] };
}

// =================================================================================
// DOM app — browser only
// =================================================================================
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initApp().catch(err => showError('App failed to start: ' + err.message));
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function showError(msg) {
  const b = document.getElementById('error-banner');
  if (b) { b.textContent = msg; b.hidden = false; }
}

async function initApp() {
  let data;
  try {
    const res = await fetch('./data/locations.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    data = await res.json();
    data.locations = data.locations.filter(l => !l.closed);
  } catch (e) {
    showError('Could not load venue data (' + e.message + '). Ledger still works from your last session; reload when you have signal.');
    return;
  }

  const currentLedgerRaw = localStorage.getItem(LEDGER_KEY);
  const legacyLedgerRaw = currentLedgerRaw === null ? localStorage.getItem(LEGACY_LEDGER_KEY) : null;
  const storedLedgerRaw = currentLedgerRaw ?? legacyLedgerRaw;
  const storedLedger = parseLedger(storedLedgerRaw);
  const state = {
    data,
    area: localStorage.getItem('ddp-tab') || 'mk',
    filters: { quick: true, snack: true, bestOnly: false },
    view: 'map',
    events: loadLedger(storedLedgerRaw).events,
    here: null,
    map: null,
    markers: [],
    seq: Date.now(),
  };
  const ledger = () => ledgerReduce(initialLedger(), state.events, state.data);
  const persist = () => localStorage.setItem(LEDGER_KEY, JSON.stringify({ schema: 2, events: state.events }));
  const pushEvent = ev => { ev.id = 'e' + (++state.seq); ev.ts = Date.now(); state.events.push(ev); persist(); renderLedger(); return ev.id; };
  persist();
  if (!storedLedger) showError('Ledger storage was missing or corrupt. Started with fresh balances.');

  let toastTimer = null;
  function toast(msg, undoId) {
    const t = document.getElementById('toast');
    t.replaceChildren(el('span', null, msg));
    if (undoId) {
      const u = el('button', 'toast-undo', 'Undo');
      u.addEventListener('click', () => { pushEvent({ type: 'undo', target: undoId }); t.hidden = true; });
      t.appendChild(u);
    }
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 5000);
  }

  document.getElementById('captured').textContent =
    'Data captured ' + data.captured + ' · values are estimates — the register is the authority.';

  // --- tabs
  const tabbar = document.getElementById('tabs');
  for (const a of data.areas) {
    const b = el('button', 'tab', a.name);
    b.dataset.area = a.id;
    b.addEventListener('click', () => { state.area = a.id; localStorage.setItem('ddp-tab', a.id); renderAll(); });
    tabbar.appendChild(b);
  }

  // --- filter chips
  const chips = document.getElementById('chips');
  const chipDefs = [['quick', 'QS'], ['snack', 'Snack'], ['bestOnly', '🔥 best value only']];
  for (const [key, label] of chipDefs) {
    const c = el('button', 'chip', label);
    c.dataset.key = key;
    c.addEventListener('click', () => { state.filters[key] = !state.filters[key]; renderAll(); });
    chips.appendChild(c);
  }

  document.getElementById('view-toggle').addEventListener('click', () => {
    state.view = state.view === 'map' ? 'list' : 'map';
    renderAll();
  });

  // --- banner
  const banner = document.getElementById('snack-banner');
  if (localStorage.getItem('ddp-banner-dismissed')) banner.hidden = true;
  document.getElementById('banner-close').addEventListener('click', () => {
    banner.hidden = true; localStorage.setItem('ddp-banner-dismissed', '1');
  });

  // --- map
  const areaById = Object.fromEntries(data.areas.map(a => [a.id, a]));
  state.map = L.map('map', { zoomControl: false, attributionControl: true });
  state.map.attributionControl.setPrefix(false);
  const tiles = tileConfig(true);
  const primaryTiles = L.tileLayer(tiles.primary.url, tiles.primary.options).addTo(state.map);
  primaryTiles.once('tileerror', () => {
    state.map.removeLayer(primaryTiles);
    L.tileLayer(tiles.fallback.url, tiles.fallback.options).addTo(state.map);
  });

  // --- geolocate
  let hereMarker = null;
  document.getElementById('locate').addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      if (!freshPosition(pos, Date.now())) return;
      state.here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (hereMarker) hereMarker.remove();
      hereMarker = L.circleMarker([state.here.lat, state.here.lng],
        { radius: 7, color: '#fff', weight: 2, fillColor: '#1a73e8', fillOpacity: 1 }).addTo(state.map);
      document.getElementById('nearby').hidden = false;
      renderNearby();
    }, () => { /* denied — button stays, nearby hidden */ }, { enableHighAccuracy: true, timeout: 10000 });
  });

  function visibleVenues() {
    let vs = state.data.locations.filter(l => l.area === state.area);
    vs = vs.filter(l => l.accepted_credits.some(c => CREDIT_TYPES.includes(c)));
    vs = vs.filter(l => l.accepted_credits.some(c => state.filters[c]));
    if (state.filters.bestOnly) vs = vs.filter(l => l.tier === 1);
    return vs;
  }

  function fmt(n) { return '$' + n.toFixed(2); }

  function popupFor(l) {
    const box = el('div', 'popup');
    box.appendChild(el('h3', null, l.name));
    const kinds = l.accepted_credits.filter(c => CREDIT_TYPES.includes(c))
      .map(c => ({ quick: 'Quick service', snack: 'Snack' })[c]).join(' · ');
    box.appendChild(el('p', 'muted', kinds + (l.mobile_order ? ' · Mobile Order' : '')));

    for (const p of l.meal_periods) {
      if (p.value_avg === null) continue;
      const pct = Math.round((p.value_avg / QS_BENCH) * 100);
      box.appendChild(el('p', null, `${p.period}: avg ${fmt(p.value_avg)} · max ${fmt(p.value_max)} · ${pct}% of $24 break-even`));
    }
    if (l.trip_value_nonalc) {
      box.appendChild(el('p', null, `Best current order ${fmt(l.trip_value_nonalc)}: ${l.trip_value_order || ''}`));
    }
    if (l.child_value) box.appendChild(el('p', null, `Liza (child menu): best ~${fmt(l.child_value)}`));
    else if (l.child_menu === false) box.appendChild(el('p', 'muted', 'No child menu — regular items allowed, confirm at register'));

    for (const s of l.snack_picks) {
      const mark = s.eligibility === 'verified' ? '✓' : s.eligibility === 'listed' ? '◐' : '?';
      box.appendChild(el('p', null, `${mark} ${s.item} ${fmt(s.price)}` + (s.eligibility === 'verified' ? '' : ' — verify at register')));
    }
    if (l.menu_items.length) {
      const mb = el('button', 'btn', `DDP menu (${l.menu_items.length} items)`);
      mb.addEventListener('click', () => menuSheet(l));
      box.appendChild(mb);
    } else {
      box.appendChild(el('p', 'muted', 'Full DDP menu pending verification pass — items with the DDP symbol at the register are eligible.'));
    }
    if (l.notes) box.appendChild(el('p', 'muted', l.notes));

    const btn = el('button', 'btn', 'Use credit here');
    btn.addEventListener('click', () => redeemFlow(l));
    box.appendChild(btn);
    return box;
  }

  // --- redemption modal flow
  const modal = document.getElementById('modal');
  function alertBox(msg) {
    modal.replaceChildren(el('div', 'sheet'));
    const sheet = modal.firstChild;
    sheet.appendChild(el('p', null, msg));
    const ok = el('button', 'btn', 'OK');
    ok.addEventListener('click', closeModal);
    sheet.appendChild(ok);
    modal.hidden = false;
  }
  function closeModal() { modal.hidden = true; modal.replaceChildren(); }
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  const CAT_ORDER = ['combo', 'entree', 'side', 'dessert', 'drink', 'snack', 'kids'];
  const CAT_LABEL = { combo: 'Combos', entree: 'Entrées', side: 'Sides', dessert: 'Desserts', drink: 'Drinks', snack: 'Snacks', kids: 'Kids (Liza orders here)' };
  function menuSheet(l) {
    const sheet = el('div', 'sheet');
    modal.replaceChildren(sheet); modal.hidden = false;
    sheet.appendChild(el('h3', null, l.name + ' — DDP-eligible menu'));
    const legend = el('div', 'menu-legend');
    for (const [credit, label] of [['qs', 'QS credit'], ['snack', 'Snack credit'], ['kids', 'Kids']]) {
      const key = el('span', 'legend-item');
      key.append(el('i', `legend-swatch credit-${credit}`), el('span', null, label));
      legend.appendChild(key);
    }
    legend.appendChild(el('span', 'legend-breaks', 'arrows: value vs $24 QS / $7 snack break-even'));
    sheet.appendChild(legend);

    const pairing = drinkPairing(l.menu_items);

    const wrap = el('div', 'menu-scroll');
    for (const cat of CAT_ORDER) {
      const items = l.menu_items.filter(m => m.category === cat);
      if (!items.length) continue;
      wrap.appendChild(el('h4', null, CAT_LABEL[cat]));
      for (const m of items) {
        const mark = m.eligibility === 'verified' ? '✓' : m.eligibility === 'listed' ? '◐' : '?';
        const row = el('div', `menu-row credit-${CREDIT_CLASS[m.category]}`);
        const itemLine = el('p', 'menu-item', `${mark} ${m.item} — $${m.price.toFixed(2)}`);
        const value = arrowFor(m, l);
        if (value) {
          const symbol = { up: '▲', flat: '▶', down: '▼' }[value.dir];
          const basis = CREDIT_CLASS[m.category] === 'qs' ? ' including drink' : ' item value';
          const label = `${symbol} $${value.total.toFixed(2)}${basis}`;
          const arrow = el('span', `value-arrow arrow-${value.dir}`, symbol);
          arrow.title = label;
          arrow.setAttribute('aria-label', label);
          itemLine.appendChild(arrow);
        }
        row.appendChild(itemLine);
        if (CREDIT_CLASS[m.category] === 'qs') {
          row.appendChild(el('p', 'menu-pairing', `${pairing} · total $${value.total.toFixed(2)}`));
        }
        wrap.appendChild(row);
      }
    }
    wrap.appendChild(el('p', 'muted', '✓ verified on Disney menu · ◐/? verify symbol at register'));
    sheet.appendChild(wrap);
    const close = el('button', 'btn', 'Close');
    close.addEventListener('click', closeModal);
    sheet.appendChild(close);
  }

  function redeemFlow(l) {
    const sheet = el('div', 'sheet');
    modal.replaceChildren(sheet); modal.hidden = false;
    sheet.appendChild(el('h3', null, l.name));
    sheet.appendChild(el('p', 'muted', 'Whose credit?'));
    const row = el('div', 'btn-row');
    for (const g of GUESTS) {
      const b = el('button', 'btn big', g);
      b.addEventListener('click', () => pickCredit(l, g));
      row.appendChild(b);
    }
    sheet.appendChild(row);
  }

  function pickCredit(l, guest) {
    const kinds = l.accepted_credits.filter(c => CREDIT_TYPES.includes(c));
    if (kinds.length === 1) return pickDetail(l, guest, kinds[0]);
    const sheet = modal.firstChild;
    sheet.replaceChildren(el('h3', null, l.name), el('p', 'muted', `${guest} — which credit?`));
    const row = el('div', 'btn-row');
    for (const k of kinds) {
      const b = el('button', 'btn big', k === 'quick' ? 'QS meal' : 'Snack');
      b.addEventListener('click', () => pickDetail(l, guest, k));
      row.appendChild(b);
    }
    sheet.appendChild(row);
  }

  function pickDetail(l, guest, credit) {
    const st = ledger();
    if (st.balances[guest][credit] <= 0) { alertBox(`${guest} has no ${credit} credits left.`); return; }

    if (credit === 'snack') {
      const sheet = modal.firstChild;
      sheet.replaceChildren(el('h3', null, l.name), el('p', 'muted', 'Which snack?'));
      if (!l.snack_picks.length) {
        sheet.appendChild(el('p', 'muted', 'No named picks loaded for this spot yet — any item showing the DDP symbol at the register works. Aim for $7+.'));
      }
      const rowd = el('div', 'btn-col');
      for (const s of l.snack_picks) {
        const b = el('button', 'btn', `${s.item} — $${s.price.toFixed(2)}`);
        b.addEventListener('click', () => {
          const id = pushEvent({ type: 'redeem', guest, credit, venue: l.id, pick: s.item });
          closeModal();
          toast(`✓ ${guest}: snack credit at ${l.name} (est. $${s.price.toFixed(2)})`, id);
        });
        rowd.appendChild(b);
      }
      const other = el('button', 'btn', l.snack_picks.length ? 'Other item (value unknown)' : 'Use snack credit here (value unknown)');
      other.addEventListener('click', () => {
        const id = pushEvent({ type: 'redeem', guest, credit, venue: null });
        closeModal();
        toast(`✓ ${guest}: snack credit at ${l.name} (value unknown)`, id);
      });
      rowd.appendChild(other);
      sheet.appendChild(rowd);
      return;
    }

    // quick: ask period only when multiple periods carry different values (adults)
    const priced = l.meal_periods.filter(p => p.value_avg !== null);
    const distinct = new Set(priced.map(p => p.value_avg));
    if (guest !== 'L' && priced.length > 1 && distinct.size > 1) {
      const sheet = modal.firstChild;
      sheet.replaceChildren(el('h3', null, l.name), el('p', 'muted', 'Which meal?'));
      const row = el('div', 'btn-col');
      for (const p of priced) {
        const b = el('button', 'btn', `${p.period} — avg $${p.value_avg.toFixed(2)}`);
        b.addEventListener('click', () => {
          const id = pushEvent({ type: 'redeem', guest, credit, venue: l.id, period: p.period });
          closeModal();
          toast(`✓ ${guest}: QS credit at ${l.name} (est. $${p.value_avg.toFixed(2)})`, id);
        });
        row.appendChild(b);
      }
      sheet.appendChild(row);
      return;
    }
    const id = pushEvent({ type: 'redeem', guest, credit, venue: l.id, period: priced[0]?.period });
    const est = guest === 'L' ? l.child_value : l.ranking_value;
    closeModal();
    toast(`✓ ${guest}: QS credit at ${l.name}` + (est ? ` (est. $${est.toFixed(2)})` : ' (value unknown)'), id);
  }

  // --- markers / list / nearby
  function markerFor(l) {
    const icon = L.divIcon({ className: '', html: pinHtml(l), iconSize: [34, 42], iconAnchor: [17, 40], popupAnchor: [0, -36] });
    const m = L.marker([l.lat, l.lng], { icon, alt: l.name });
    m.bindPopup(() => popupFor(l), { maxWidth: 290 });
    m.on('popupopen', () => m.getElement()?.querySelector('.disney-pin')?.classList.add('is-selected'));
    m.on('popupclose', () => m.getElement()?.querySelector('.disney-pin')?.classList.remove('is-selected'));
    return m;
  }

  function renderMap() {
    const a = areaById[state.area];
    state.map.setView(a.center, a.zoom);
    for (const m of state.markers) m.remove();
    state.markers = visibleVenues().filter(l => typeof l.lat === 'number').map(markerFor);
    for (const m of state.markers) m.addTo(state.map);
  }

  function renderList() {
    const list = document.getElementById('list');
    list.replaceChildren();
    for (const l of rankVenues(visibleVenues())) {
      const row = el('div', 'row tier-' + (l.tier ?? 'none'));
      const left = el('div');
      left.appendChild(el('strong', null, (l.tier === 1 ? '🔥 ' : '') + l.name));
      left.appendChild(el('div', 'muted', l.accepted_credits.filter(c => CREDIT_TYPES.includes(c)).join(' · ')));
      row.appendChild(left);
      row.appendChild(el('div', 'val', l.ranking_value !== null ? '$' + l.ranking_value.toFixed(2) : '—'));
      row.addEventListener('click', () => {
        state.view = 'map'; renderAll();
        const m = state.markers[visibleVenues().filter(x => typeof x.lat === 'number').findIndex(x => x.id === l.id)];
        if (m) { state.map.setView(m.getLatLng(), 18); m.openPopup(); }
      });
      list.appendChild(row);
    }
  }

  function renderNearby() {
    if (!state.here) return;
    const wrap = document.getElementById('nearby-cards');
    wrap.replaceChildren();
    for (const v of bestNearby(visibleVenues(), state.here)) {
      const c = el('div', 'card');
      c.appendChild(el('strong', null, (v.tier === 1 ? '🔥 ' : '') + v.name));
      const bits = [];
      if (v.ranking_value !== null) bits.push('$' + v.ranking_value.toFixed(2));
      bits.push('~' + walkMinutes(v._distance) + ' min walk (est.)');
      c.appendChild(el('div', 'muted', bits.join(' · ')));
      wrap.appendChild(c);
    }
  }

  // --- ledger drawer
  function renderLedger() {
    const st = ledger();
    const drawer = document.getElementById('ledger-body');
    drawer.replaceChildren();

    const totals = el('div', 'totals');
    for (const [k, bench, label] of [['quick', QS_BENCH, 'QS'], ['snack', SNACK_BENCH, 'Snack']]) {
      const t = st.totals[k];
      const avg = t.knownCount ? t.value / t.knownCount : 0;
      totals.appendChild(el('div', null,
        `${label}: ${t.count} used · est. ${'$' + t.value.toFixed(2)} redeemed (modeled)` +
        (t.knownCount ? ` · avg $${avg.toFixed(2)}/credit vs $${bench}` : '')));
    }
    drawer.appendChild(totals);

    for (const g of GUESTS) {
      const row = el('div', 'guest-row');
      row.appendChild(el('strong', null, g));
      for (const k of ['quick', 'snack']) {
        const cell = el('span', 'bal', `${k === 'quick' ? 'QS' : 'Sn'} ${st.balances[g][k]}`);
        const minus = el('button', 'mini', '−');
        minus.addEventListener('click', () => { if (st.balances[g][k] > 0) pushEvent({ type: 'redeem', guest: g, credit: k, venue: null }); });
        const plus = el('button', 'mini', '+');
        plus.addEventListener('click', () => pushEvent({ type: 'adjust', guest: g, credit: k, delta: +1 }));
        row.append(cell, minus, plus);
      }
      drawer.appendChild(row);
    }

    const actions = el('div', 'btn-row');
    const undo = el('button', 'btn', 'Undo last');
    undo.addEventListener('click', () => {
      const last = [...state.events].reverse().find(e => e.type !== 'undo' && !state.events.some(u => u.type === 'undo' && u.target === e.id));
      if (last) pushEvent({ type: 'undo', target: last.id });
    });
    const reset = el('button', 'btn danger', 'Reset');
    reset.addEventListener('click', () => {
      if (confirm('Reset the whole ledger? This clears all redemptions.')) {
        state.events = []; persist(); renderLedger();
      }
    });
    actions.append(undo, reset);
    drawer.appendChild(actions);
  }

  document.getElementById('ledger-toggle').addEventListener('click', () => {
    const d = document.getElementById('ledger');
    d.classList.toggle('open');
  });

  function renderAll() {
    for (const b of tabbar.children) b.classList.toggle('active', b.dataset.area === state.area);
    for (const c of chips.children) c.classList.toggle('active', !!state.filters[c.dataset.key]);
    const isMap = state.view === 'map';
    document.getElementById('map').style.display = isMap ? '' : 'none';
    document.getElementById('list').style.display = isMap ? 'none' : '';
    document.getElementById('view-toggle').textContent = isMap ? 'List' : 'Map';
    if (isMap) { renderMap(); state.map.invalidateSize(); } else renderList();
    renderNearby();
    renderLedger();
  }

  renderAll();
}
