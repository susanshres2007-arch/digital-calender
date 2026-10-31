(() => {
  const $ = id => document.getElementById(id);
  const grid = $('grid'), title = $('title'), list = $('list'), ptitle = $('ptitle'), dlg = $('dlg'), ef = $('ef'), toast = $('toast');
  const p2 = n => String(n).padStart(2, '0');
  const key = (y, m, d) => `${y}-${p2(m + 1)}-${p2(d)}`;
  const keyOf = d => key(d.getFullYear(), d.getMonth(), d.getDate());
  const long = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
  let store = {};
  try { store = JSON.parse(localStorage.getItem('events') || '{}'); } catch {}
  const save = () => { try { localStorage.setItem('events', JSON.stringify(store)); } catch {} };
  let now = new Date(), view = new Date(now.getFullYear(), now.getMonth(), 1), sel = keyOf(now);
  const alerted = new Set();

  function render() {
    const y = view.getFullYear(), m = view.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), today = keyOf(now);
    title.textContent = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    grid.textContent = '';
    for (let i = 0; i < first; i++) grid.append(document.createElement('span'));
    for (let d = 1; d <= days; d++) {
      const k = key(y, m, d), n = (store[k] || []).length, dow = new Date(y, m, d).getDay(), b = document.createElement('button');
      b.type = 'button'; b.textContent = d; b.dataset.key = k;
      b.className = 'day' + (dow % 6 === 0 ? ' wknd' : '') + (k === today ? ' today' : '') + (k === sel ? ' sel' : '') + (n ? ' has' : '');
      b.setAttribute('aria-label', `${long(k)}${k === today ? ', today' : ''}, ${n ? n + (n > 1 ? ' events' : ' event') : 'no events'}`);
      b.setAttribute('aria-pressed', k === sel);
      grid.append(b);
    }
    panel();
  }
  function panel() {
    ptitle.textContent = long(sel); list.textContent = '';
    const ev = (store[sel] || []).slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
    if (!ev.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'No events on this day.'; list.append(li); }
    ev.forEach(e => {
      const li = document.createElement('li'), t = document.createElement('strong'), m = document.createElement('span'), x = document.createElement('button');
      t.textContent = e.title; m.textContent = [e.time, e.note].filter(Boolean).join(', ');
      x.type = 'button'; x.className = 'del'; x.textContent = 'Delete'; x.dataset.id = e.id; x.setAttribute('aria-label', 'Delete ' + e.title);
      li.append(t, m, x); list.append(li);
    });
  }
  function select(k) {
    const old = grid.querySelector('.sel'); if (old) { old.classList.remove('sel'); old.setAttribute('aria-pressed', 'false'); }
    sel = k; const b = grid.querySelector(`[data-key="${k}"]`);
    if (b) { b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); }
    panel();
  }
  function openDlg() { ef.reset(); $('dlabel').textContent = long(sel); dlg.showModal(); $('etitle').focus(); }
  function show(msg) { toast.textContent = msg; toast.classList.add('on'); setTimeout(() => toast.classList.remove('on'), 6000); }

  grid.addEventListener('click', e => { const b = e.target.closest('.day'); if (b) select(b.dataset.key); });
  grid.addEventListener('dblclick', e => { const b = e.target.closest('.day'); if (b) { select(b.dataset.key); openDlg(); } });
  $('add').addEventListener('click', openDlg);
  $('cancel').addEventListener('click', () => dlg.close());
  ef.addEventListener('submit', e => {
    e.preventDefault();
    const t = $('etitle').value.trim(); if (!t) { $('etitle').focus(); return; }
    (store[sel] = store[sel] || []).push({ id: Date.now() + Math.random().toString(36).slice(2, 6), title: t, time: $('etime').value, note: $('enote').value.trim() });
    save(); dlg.close(); render();
  });
  list.addEventListener('click', e => {
    const x = e.target.closest('.del'); if (!x) return;
    store[sel] = (store[sel] || []).filter(v => v.id !== x.dataset.id);
    if (!store[sel].length) delete store[sel];
    save(); render();
  });
  $('prev').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
  $('next').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
  $('goToday').addEventListener('click', () => { now = new Date(); view = new Date(now.getFullYear(), now.getMonth(), 1); sel = keyOf(now); render(); });
  // Clock tick: roll over at midnight and fire reminders
  document.addEventListener('tick', e => {
    const n = e.detail, was = keyOf(now); now = n;
    if (keyOf(n) !== was) render();
    const hm = `${p2(n.getHours())}:${p2(n.getMinutes())}`;
    (store[keyOf(n)] || []).forEach(v => { if (v.time === hm && !alerted.has(v.id)) { alerted.add(v.id); show(`Reminder: ${v.title}`); } });
  });
  render();
})();
