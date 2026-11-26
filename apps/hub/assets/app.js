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
})();
