/* Turon hub — mobile menu and the section dial. English only.
   Security: text is only ever set with textContent (no innerHTML). */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var links = document.getElementById('nav-links');
  function closeMenu() { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('open')) { closeMenu(); btn.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 920) closeMenu(); });
  // ---------- Section dial (option B) ----------
  // One screen at a time; the dial turns 45° per section and loops (after Contact comes Home).
  // Off without JS or on windows under 520px tall: then the page is a normal scrolling page.
  var wheelMq = window.matchMedia ? window.matchMedia('(min-height:520px)') : null;
  var panels = Array.prototype.slice.call(document.querySelectorAll('.screen'));
  var disc = document.querySelector('.dial-disc');
  var N = panels.length, STEP = 360 / N;
  var cur = 0, turns = 0, on = false;
  var GAP = 40;
  var dialNav = document.querySelector('.dial');
  var dialLinks = Array.prototype.slice.call(document.querySelectorAll('.dial a'));
  var currentLinks = document.querySelectorAll('.dial a, .nav-links a');

  function panelIndexFor(id) {
    var el = id && document.getElementById(id);
    var p = el && el.closest('.screen');
    return p ? panels.indexOf(p) : -1;
  }
  function canScroll(p, dir) {
    return dir > 0 ? p.scrollTop + p.clientHeight < p.scrollHeight - 8 : p.scrollTop > 8;
  }
  function paint() {
    panels.forEach(function (p, i) {
      var active = i === cur;
      p.classList.toggle('is-active', active);
      p.inert = !active;
    });
    var id = '#' + panels[cur].id;
    currentLinks.forEach(function (a) {
      if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    // the side rail takes the colour of the section behind it
    var dark = panels[cur].classList.contains('dark') || panels[cur].classList.contains('site-footer');
    root.setAttribute('data-tone', dark ? 'dark' : 'light');
    var ang = -turns * STEP;
    disc.style.transform = 'rotate(' + ang + 'deg)';
    if (dialNav) dialNav.style.setProperty('--a', ang + 'deg');
    dialLinks.forEach(function (l, i) {
      var s = ((i - cur) % N + N) % N; if (s > N / 2) s -= N;   // signed steps from the current section
      var k = Math.abs(s);
      l.setAttribute('data-k', k);
      // laptop layout: names evenly spaced down a curve just outside the rim
      var R = disc.offsetWidth / 2 + 22, y = s * GAP;
      var x = Math.abs(y) < R ? Math.sqrt(R * R - y * y) : 0;
      l.style.setProperty('--x', x.toFixed(1) + 'px');
      l.style.setProperty('--y', y + 'px');
      if (k > 2) l.setAttribute('tabindex', '-1'); else l.removeAttribute('tabindex');
    });
  }
  window.addEventListener('resize', function () { if (on) paint(); });
  function go(i, opts) {
    i = ((i % N) + N) % N;
    if (!on) return;
    var d = ((i - cur) % N + N) % N;
    if (d > N / 2) d -= N;           // turn the short way round
    if (d === 0 && !(opts && opts.force)) return;
    turns += d;
    root.setAttribute('data-dir', d < 0 ? 'back' : 'fwd');
    var prev = panels[cur];
    var hadFocus = prev.contains(document.activeElement);
    cur = i;
    panels[cur].scrollTop = 0;
    paint();
    // Keep keyboard users in place: if focus was in the old section, move it to the new one
    if ((opts && opts.focus) || hadFocus) panels[cur].focus({ preventScroll: true });
    onTurn();
    try {
      var u = new URL(window.location.href);
      u.hash = cur === 0 ? '' : panels[cur].id;
      history.replaceState(null, '', u);
    } catch (e) {}
  }
  function enable() {
    if (on || !disc) return;
    on = true;
    root.classList.add('wheel');
    panels.forEach(function (p) { p.setAttribute('tabindex', '-1'); });
    var start = panelIndexFor(window.location.hash.slice(1));
    cur = start < 0 ? 0 : start; turns = cur;
    disc.style.transition = 'none';
    paint();
    void disc.offsetWidth; disc.style.transition = '';
    window.scrollTo(0, 0);
    countUp(panels[cur]);
    scheduleHint();
  }
  function disable() {
    if (!on) return;
    on = false;
    root.classList.remove('wheel');
    panels.forEach(function (p) { p.inert = false; p.classList.remove('is-active'); p.removeAttribute('tabindex'); });
    panels[cur].scrollIntoView();
  }

  // Mouse wheel / trackpad: one step per gesture. If the screen itself has more to scroll, scroll it first.
  var acc = 0, blocked = false, lastEvt = 0, lastSwitch = 0;
  window.addEventListener('wheel', function (e) {
    if (!on || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || !e.deltaY) return;
    var now = Date.now(), dir = e.deltaY > 0 ? 1 : -1, gap = now - lastEvt;
    lastEvt = now;
    if (blocked) { if (gap > 180 && now - lastSwitch > 550) blocked = false; else return; }
    if (canScroll(panels[cur], dir)) { acc = 0; return; }
    if (gap > 250) acc = 0;
    acc += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
    if (Math.abs(acc) >= 40) { acc = 0; blocked = true; lastSwitch = now; go(cur + dir); }
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (!on || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var dir = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') dir = 1;
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') dir = -1;
    else if (e.key === ' ' && !(t && t.closest && t.closest('a,button,summary'))) dir = e.shiftKey ? -1 : 1;
    else if (e.key === 'Home') { e.preventDefault(); go(0); return; }
    else if (e.key === 'End') { e.preventDefault(); go(N - 1); return; }
    if (!dir || canScroll(panels[cur], dir)) return;
    e.preventDefault(); go(cur + dir);
  });

  // Touch: swipe up/down (sideways swipes belong to the card rows)
  var tx = 0, ty = 0, tEdge = null;
  document.addEventListener('touchstart', function (e) {
    if (!on || e.touches.length !== 1) return;
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    var p = panels[cur];
    tEdge = { down: !canScroll(p, 1), up: !canScroll(p, -1) };
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!on || !tEdge) return;
    var dx = tx - e.changedTouches[0].clientX, dy = ty - e.changedTouches[0].clientY, edge = tEdge;
    tEdge = null;
    if (Math.abs(dy) < 50 || Math.abs(dy) < Math.abs(dx) * 1.3) return;
    if (dy > 0 && edge.down) go(cur + 1);
    else if (dy < 0 && edge.up) go(cur - 1);
  }, { passive: true });

  // In-page links (#projects, #join-partner, dial labels…) turn the dial instead of scrolling
  document.addEventListener('click', function (e) {
    if (!on || e.defaultPrevented || e.button !== 0) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var i = panelIndexFor(id);
    if (i < 0) return;
    e.preventDefault();
    go(i, { focus: true });
    var target = document.getElementById(id);
    if (target && target !== panels[i]) target.scrollIntoView({ block: 'nearest' });
  });
  // Phone dial: ‹ › buttons
  document.querySelectorAll('.dial-step').forEach(function (btn) {
    btn.addEventListener('click', function () {
      go(cur + (btn.classList.contains('dial-next') ? 1 : -1));
    });
  });
  window.addEventListener('hashchange', function () {
    var i = panelIndexFor(window.location.hash.slice(1));
    if (i >= 0) go(i);
  });

  // ---------- small animations ----------
  var reduceMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return reduceMq && reduceMq.matches; }

  // Numbers count up when their screen turns into view. The real value stays in a
  // visually hidden span for screen readers; only the aria-hidden copy animates.
  var counters = [];
  document.querySelectorAll('.impact dd').forEach(function (dd) {
    var text = dd.textContent.trim(), m = text.match(/^(\d+)(.*)$/);
    if (!m) return;
    var real = document.createElement('span'); real.className = 'visually-hidden'; real.textContent = text;
    var shown = document.createElement('span'); shown.setAttribute('aria-hidden', 'true'); shown.textContent = text;
    dd.textContent = ''; dd.appendChild(real); dd.appendChild(shown);
    counters.push({ el: shown, to: parseInt(m[1], 10), suffix: m[2] });
  });
  function countUp(panel) {
    if (!panel || !panel.querySelector('.impact') || reduced()) return;
    counters.forEach(function (c, k) {
      var delay = 180 + k * 70, dur = 900, t0 = null;
      c.el.textContent = '0' + c.suffix;
      function frame(t) {
        if (t0 === null) t0 = t;
        var x = Math.min(1, Math.max(0, (t - t0 - delay) / dur));
        var eased = 1 - Math.pow(1 - x, 3);
        c.el.textContent = Math.round(c.to * eased) + c.suffix;
        if (x < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  // First-visit hint: after 2s on the first screen, the dial nudges and a chip says
  // "Scroll down" / "Swipe up". Gone for good after the first turn.
  var hint = document.querySelector('.dial-hint'), hintTimers = [], SEEN = 'turon-dial-seen';
  function seen() { try { return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; } }
  function nudge() {
    if (reduced() || !disc) return;
    disc.classList.remove('nudge'); void disc.offsetWidth; disc.classList.add('nudge');
  }
  function scheduleHint() {
    if (!hint || seen()) return;
    hintTimers.push(setTimeout(function () { if (on) { hint.classList.add('show'); root.classList.add('hinting'); nudge(); } }, 2000));
    hintTimers.push(setTimeout(function () { if (on) nudge(); }, 7000));
  }
  function onTurn() {
    hintTimers.forEach(clearTimeout); hintTimers = [];
    if (hint) hint.classList.remove('show');
    root.classList.remove('hinting');
    try { localStorage.setItem(SEEN, '1'); } catch (e) {}
    countUp(panels[cur]);
  }

  function sync() { if (wheelMq && wheelMq.matches) enable(); else disable(); }
  if (wheelMq) {
    if (wheelMq.addEventListener) wheelMq.addEventListener('change', sync); else wheelMq.addListener(sync);
  }
  sync();
})();
