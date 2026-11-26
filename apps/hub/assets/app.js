/* Turon hub — language switch + mobile menu.
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
    navProjects: 'Projects', navMilestones: 'Milestones', navAbout: 'About', navJoin: 'Get involved', navFaq: 'FAQ',
    ctaJoin: 'Join Turon', ctaJoinShort: 'Join Turon', ctaProjects: 'See projects',
    nextUpLabel: 'Next up: Vibe Turon warm-up', nextUpDate: 'February 2027',
    eyebrow: 'Fergana · Uzbekistan · student-led',
    sub: 'Quality opportunities for young people in the region — right here.',
    heroAlt: 'TuronMUN delegates in a committee session, with country flags and placards on the desks',
    heroCaption: 'A TuronMUN committee session',
    impactTitle: 'In numbers',
    statDelegates: 'delegates at TuronMUN conferences', statConfs: 'conferences since July 2024',
    statCommittees: 'committees run', statProjects: 'projects in 2027',
    awardsLabel: 'MyMUN awards:',
    projectsTitle: 'Projects', projectsLead: 'One ecosystem, three doors. Each project has its own site.',
    munStatus: 'Season 8 · coming soon',
    munDesc: 'Where it all started. A student-run Model UN conference in Fergana: 8 conferences and 700+ delegates since July 2024. No experience needed.',
    munApply: 'Apply →', debateGo: 'Register →',
    debateStatus: 'Running now',
    debateDesc: 'A debate session every 1–2 months. Real motions, a real audience — learn to back up your argument.',
    vibeStatus: 'Spring 2027',
    vibeDesc: 'A two-day vibeathon in Fergana: ~150 builders, 4 tracks, 10 mln soʼm in prizes. Warm-up in February.',
    moreProjects: 'two new projects on the way.', ideaLink: 'Have an idea? Tell us →',
    milestonesTitle: 'Milestones', milestonesLead: 'From one conference to an ecosystem — and where we’re going next.',
    d1: '28 Jul 2024', m1: 'First TuronMUN', m1s: 'As FerganaPS MUN · Presidential School in Fergana · 80 delegates',
    d2: '28 Jul 2025', m2: 'TuronMUN x CAMU — first anniversary', m2s: '120 delegates · 6 committees · 3 languages',
    d3: '28 Jul 2026', m3: 'Season 7 — two-year anniversary', m3s: '120 delegates · 700+ delegates across 8 conferences',
    d4: 'Nov 2026', m4: 'Turon Debate launches — Turon becomes an ecosystem',
    here: 'WE ARE HERE',
    d5: 'Feb 2027', d6: 'Mar 2027', m6: 'Turon registers as an NNO (non-governmental non-profit)',
    d7: 'Spring 2027', d8: '28 Jul 2027', m9: 'Two new projects',
    aboutEyebrow: 'Why Turon',
    aboutTitle: 'Talent is everywhere. Opportunity shouldn’t need a bus ticket.',
    aboutText1: 'Turon started in July 2024 as a single Model UN conference in Fergana: 80 delegates, 4 committees. Two years and 700+ delegates later, it is a family of student-led projects.',
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
    q2: 'Does it cost anything?', a2: 'TuronMUN has a participation fee that depends on your delegation type, with early-bird discounts. Turon Debate and Vibe Turon: [pricing details].',
    q3: 'What language is it in?', a3: 'TuronMUN runs mainly in English, with Uzbek and Russian committees in some seasons. Turon Debate and Vibe Turon: [language].',
    q4: 'Where do I hear about new events?', a4: 'Follow our Telegram and Instagram — every announcement and registration link goes there first.',
    q5: 'How can my organisation partner with Turon?', a5: 'Email admin@turonmun.com: event sponsorship, a prize or scholarship, a workshop or mentoring — we’ll find the right format together.',
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
})();
