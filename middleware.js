// Vercel Routing Middleware for the single turon.one project.
// Runs before static files, so it decides which site a request gets:
//   turon.one, www.turon.one                     -> hub (dist/hub/)
//   old test addresses (turon-website-roan.vercel.app, turon-one-mun.vercel.app)
//                                                -> 308 to the same page on turon.one (OLD_HOST)
//   other turon-website*.vercel.app (previews)   -> hub for "/" and the hub's own files;
//                                                   every other path -> TuronMUN app (dist/),
//                                                   e.g. /mun, /debat, /vibe, /register
//   debat.turon.one (bare "/")                   -> Turon Debate page with its own link previews
//   vibe.turon.one (bare "/")                    -> Vibe Turon page with its own link previews
//   research.turon.one                           -> Turon Research site (dist/research/, static);
//                                                   on preview addresses it lives at /research/
//   everything else (mun., admin., chair.)       -> TuronMUN app (dist/)
export const config = { matcher: '/:path*' };

const HUB_HOST = /^((www\.)?turon\.one|turon-website(-[a-z0-9-]+)?\.vercel\.app)$/i;
const TEST_HOST = /^turon-website(-[a-z0-9-]+)?\.vercel\.app$/i;
// Retired addresses: send visitors (and old shared links) to the same page on turon.one.
const OLD_HOST = /^(turon-website-roan|turon-one-mun)\.vercel\.app$/i;
const DEBATE_HOST = /^(debat|debate)\.(turonmun\.com|turon\.one)$/i;
const VIBE_HOST = /^vibe\.turon\.one$/i;
const RESEARCH_HOST = /^research\.turon\.one$/i;

// The hub's own files (apps/hub). Keep in sync with HUB_FILES in vercel.json.
// MUN app files never clash: its assets have hashed names (index-AbC123.js).
const HUB_FILES = /^\/(index\.html|404\.html|robots\.txt|sitemap\.xml|\.well-known\/security\.txt|assets\/(app\.js|styles\.css|favicon\.svg|apple-touch-icon\.png))$/;

// Hub project links: [on the test address, on turon.one].
const GO = {
  '/go/mun': ['/mun', 'https://mun.turon.one/'],
  '/go/mun-apply': ['/register', 'https://mun.turon.one/register'],
  '/go/debat': ['/debat', 'https://debat.turon.one/'],
  '/go/vibe': ['/vibe', 'https://vibe.turon.one/'],
  '/go/research': ['/research/', 'https://research.turon.one/'],
};

// Where a page on an old test address lives now.
function newHome(url) {
  const p = url.pathname, q = url.search;
  const rest = (prefix) => p.slice(prefix.length) || '/';
  if (GO[p]) return GO[p][1];
  if (p === '/' || HUB_FILES.test(p)) return `https://turon.one${p}${q}`;
  if (p === '/mun' || p === '/mun/') {
    const sub = url.searchParams.get('subdomain');
    const host = sub === 'admin' || sub === 'chair' ? sub : 'mun';
    return `https://${host}.turon.one/`;
  }
  if (p === '/debat' || p.startsWith('/debat/')) return `https://debat.turon.one${rest('/debat')}${q}`;
  if (p === '/vibe' || p.startsWith('/vibe/')) return `https://vibe.turon.one${rest('/vibe')}${q}`;
  if (p === '/research' || p === '/research/') return 'https://research.turon.one/';
  return `https://mun.turon.one${p}${q}`;
}

const rewrite = (path, request) =>
  new Response(null, { headers: { 'x-middleware-rewrite': new URL(path, request.url).toString() } });

export default function middleware(request) {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').split(':')[0];

  if (OLD_HOST.test(host)) return Response.redirect(newHome(url), 308);

  // Turon Research: a static site in dist/research/. Its pages link to /research/... paths,
  // which pass straight through; everything else on the host is mapped into that folder.
  if (RESEARCH_HOST.test(host)) {
    if (url.pathname === '/research' || url.pathname === '/research/') return rewrite('/research/index.html', request);
    if (url.pathname.startsWith('/research/')) return;
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    return rewrite(`/research${path}${url.search}`, request);
  }

  if (HUB_HOST.test(host)) {
    const test = TEST_HOST.test(host);
    const go = GO[url.pathname];
    if (go) return Response.redirect(new URL(go[test ? 0 : 1], request.url).toString(), 307);
    if (url.pathname.startsWith('/hub/')) return;
    // Test address: /research/ is the Research site; anything else that isn't the hub goes on to the MUN app.
    if (test && url.pathname === '/research') return Response.redirect(new URL('/research/', request.url).toString(), 308);
    if (test && url.pathname === '/research/') return rewrite('/research/index.html', request);
    if (test && url.pathname !== '/' && !HUB_FILES.test(url.pathname)) return;
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    return rewrite(`/hub${path}${url.search}`, request);
  }

  if (DEBATE_HOST.test(host) && (url.pathname === '/' || url.pathname === '/index.html')) {
    return rewrite('/debat/index.html', request);
  }

  if (VIBE_HOST.test(host) && (url.pathname === '/' || url.pathname === '/index.html')) {
    return rewrite('/vibe/index.html', request);
  }
}
