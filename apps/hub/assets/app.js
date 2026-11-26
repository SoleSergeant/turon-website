/* Turon hub — language switch, mobile menu and the section dial.
   Security: translations are applied with textContent only (no innerHTML),
   and the stored/URL language value is checked against an allow-list. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var LANGS = ['uz', 'en'];
  var EN = {
    skip: 'Skip to content', navLabel: 'Main menu', menu: 'Menu',
    dotsLabel: 'Sections', dotTop: 'Home', dotContact: 'Contact',
    hintScroll: 'Scroll down', hintSwipe: 'Swipe up',
    navProjects: 'Projects', navMilestones: 'Milestones', navAbout: 'About', navJoin: 'Get involved', navFaq: 'FAQ',
    ctaJoin: 'Join Turon', ctaJoinShort: 'Join Turon', ctaProjects: 'See projects',
    eyebrow: 'Fergana · Uzbekistan · student-led',
    sub: 'Quality opportunities for young people in the region — right here.',
    heroAlt: 'TuronMUN delegates in a committee session, with country flags and placards on the desks',
    heroCaption: 'A TuronMUN committee session',
    impactTitle: 'In numbers',
    statDelegates: 'delegates at TuronMUN conferences', statConfs: 'conferences since July 2024',
    statCommittees: 'committees run',
    awardsLabel: 'MyMUN 2024, 1st place:',
    projectsTitle: 'Projects', projectsLead: 'Two projects are running now, and a third is coming soon.',
    vibeStatus: 'Coming soon',
    vibeDesc: 'A vibeathon in Fergana: turn your idea into a working project with the help of AI. Dates and registration will be announced on Telegram.',
    vibeFollow: 'Follow on Telegram →',
    munStatus: 'Season 8 · coming soon',
    munDesc: 'Where it all started. A student-run Model UN conference in Fergana: 8 conferences and 700+ delegates since July 2024. Season 8 will be our ninth conference. No experience needed.',
    munApply: 'Apply →', debateGo: 'Register →',
    debateStatus: 'Running now',
    debateDesc: 'A debate session every 1–2 months. Real motions, a real audience. You learn to back up your argument.',
    milestonesTitle: 'Milestones', milestonesLead: 'From one conference to today.',
    d1: '28 Jun 2024', m1: 'FerganaPS MUN is founded', m1s: 'Presidential School in Fergana. First conference on 28 July: 80 delegates, 4 committees',
    d2: '1 May 2025', m2: 'MyMUN 2024 awards: three 1st places',
    d3: '12 May 2025', m3: 'FerganaPS MUN becomes TuronMUN', m3s: 'New name and logo',
m4: 'Best Medium Conference: 3rd place',
    d5: 'Nov 2026',
    aboutEyebrow: 'Why Turon',
    aboutTitle: 'Talent is everywhere. Opportunity shouldn’t need a bus ticket.',
    aboutText1: 'Turon was founded in June 2024 at the Presidential School in Fergana as FerganaPS MUN. It became TuronMUN in 2025, and Turon Debate followed in November 2026. It is still run by students.',
    aboutText2: 'Our goal is simple: young people in the region shouldn’t have to move to another city to find serious opportunities.',
    p1Alt: 'Delegates at the first TuronMUN in a committee room, with small country flags on the desks',
    p1Cap: 'Season 1 · July 2024',
    p2Alt: 'TuronMUN 2025 placards and country flags on committee desks',
    p2Cap: 'TuronMUN x CAMU · 2025',
    p3Alt: 'A “TuronMUN second anniversary” wall covered in delegates’ handwritten messages',
    p3Cap: 'Season 7 · two-year anniversary',
    partnersTitle: 'Hosts & partners so far',
    ptCamu: 'TuronMUN x CAMU, 2025', ptSat: 'Season 6 partner',
    ptPs: 'Presidential School in Fergana', ptPsS: 'Seasons 1–3 and 7',
    ptReg: 'Registan Private School', ptRegS: 'Seasons 5–6',
    ptRah: 'Rahimov School, Fergana branch', ptRahS: 'Season 4',
    becomePartner: 'Become a partner →',
    joinTitle: 'Find your place',
    c1Title: 'Participate', c1Text: 'Any school or university student in the region. Pick a project and sign up.', c1Go: 'Choose a project →',
    c2Title: 'Join the team', c2Text: 'We’re looking for organisers, designers, media and logistics volunteers for every project.', c2Go: 'Write to us →',
    c3Title: 'Partner or mentor', c3Text: 'Fund a prize or scholarship, host a workshop, or mentor participants.', c3Go: 'Work with us →',
    faqTitle: 'FAQ', faqLead: 'Can’t find an answer? Write to us on Telegram or by email.',
    q1: 'Who can take part?', a1: 'School and university students. No experience needed: most TuronMUN delegates came to their first conference with us.',
    q2: 'Does it cost anything?', a2: 'TuronMUN has a participation fee that depends on your delegation type, with early-bird discounts. Turon Debate announces its terms on its own page.',
    q3: 'What language is it in?', a3: 'TuronMUN runs mainly in English, with Uzbek and Russian committees in some seasons. Each Turon Debate session announces its language.',
    q4: 'Where do I hear about new events?', a4: 'Follow our Telegram and Instagram. Announcements and registration links go there first.',
    q5: 'How can my organisation partner with Turon?', a5: 'Email admin@turonmun.com: event sponsorship, a prize or scholarship, a workshop or mentoring. We’ll pick the format together.',
    statAwards: '1st places at the MyMUN 2024 awards',
    awards2025: 'MyMUN 2025, 3rd place:',
    m4s: 'TuronMUN x CAMU, 28 July 2025: 120 delegates, 6 committees, 3 languages',
    m5: 'Turon Debate launches',
    m5s: 'With a second project, Turon becomes an ecosystem',
    city: 'Fergana, Uzbekistan', footNote: 'By students, for young people.'
  };
  var UZ = {}, UZ_ATTR = {};
  var textEls = document.querySelectorAll('[data-i18n]');
  var attrEls = document.querySelectorAll('[data-i18n-attr]');
  textEls.forEach(function (el) { var k = el.getAttribute('data-i18n'); if (!(k in UZ)) UZ[k] = el.textContent; });
  attrEls.forEach(function (el) { var p = el.getAttribute('data-i18n-attr').split(':'); UZ_ATTR[p[1]] = el.getAttribute(p[0]); });
  var descMeta = document.querySelector('meta[name="description"]');
  var DESC = {
    uz: descMeta.getAttribute('content'),
    en: 'Turon is a student-led youth ecosystem in Fergana, Uzbekistan: TuronMUN, Turon Debate and Vibe Turon. Quality opportunities for young people in the region — right here.'
  };
  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = 'uz';
    textEls.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = lang === 'en' ? EN[k] : UZ[k];
      if (typeof v === 'string') el.textContent = v;
    });
    attrEls.forEach(function (el) {
      var p = el.getAttribute('data-i18n-attr').split(':');
      var v = lang === 'en' ? EN[p[1]] : UZ_ATTR[p[1]];
      if (typeof v === 'string') el.setAttribute(p[0], v);
    });
    root.setAttribute('lang', lang);
    descMeta.setAttribute('content', DESC[lang]);
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    try { localStorage.setItem('turon-lang', lang); } catch (e) { /* storage blocked */ }
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var lang = b.getAttribute('data-lang');
      setLang(lang);
      try {
        var u = new URL(window.location.href);
        if (lang === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
        history.replaceState(null, '', u);
      } catch (e) { /* file:// or old browser */ }
    });
  });
  var initial = null;
  try { initial = new URLSearchParams(window.location.search).get('lang'); } catch (e) {}
  if (!initial) { try { initial = localStorage.getItem('turon-lang'); } catch (e) {} }
  if (initial === 'en') setLang('en');
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
    disc.style.transform = 'rotate(' + (-turns * STEP) + 'deg)';
  }
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
    hintTimers.push(setTimeout(function () { if (on) { hint.classList.add('show'); nudge(); } }, 2000));
    hintTimers.push(setTimeout(function () { if (on) nudge(); }, 7000));
  }
  function onTurn() {
    hintTimers.forEach(clearTimeout); hintTimers = [];
    if (hint) hint.classList.remove('show');
    try { localStorage.setItem(SEEN, '1'); } catch (e) {}
    countUp(panels[cur]);
  }

  function sync() { if (wheelMq && wheelMq.matches) enable(); else disable(); }
  if (wheelMq) {
    if (wheelMq.addEventListener) wheelMq.addEventListener('change', sync); else wheelMq.addListener(sync);
  }
  sync();
})();
