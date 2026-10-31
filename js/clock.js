(() => {
  const t = document.getElementById('time'), d = document.getElementById('today'), b = document.getElementById('fmt');
  let h24 = false;
  try { h24 = localStorage.getItem('h24') === '1'; } catch {}
  const p = n => String(n).padStart(2, '0');
  function draw(now) {
    let h = now.getHours();
    const sfx = h24 ? '' : (h < 12 ? ' AM' : ' PM');
    if (!h24) h = h % 12 || 12;
    t.textContent = `${p(h)}:${p(now.getMinutes())}:${p(now.getSeconds())}${sfx}`;
    d.textContent = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    b.textContent = h24 ? '12-hour' : '24-hour';
    b.setAttribute('aria-pressed', h24);
  }
  function tick() {
    const n = new Date();
    draw(n);
    document.dispatchEvent(new CustomEvent('tick', { detail: n }));
    setTimeout(tick, 1000 - n.getMilliseconds());
  }
  b.addEventListener('click', () => {
    h24 = !h24;
    try { localStorage.setItem('h24', h24 ? '1' : '0'); } catch {}
    draw(new Date());
  });
  tick();
})();
