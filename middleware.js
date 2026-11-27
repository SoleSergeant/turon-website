// Vercel Routing Middleware for the single turon.one project.
// Runs before static files, so it decides which site a hostname gets:
//   turon.one, www.turon.one, turon-website*.vercel.app  -> hub   (dist/hub/)
//   debat.turon.one (bare "/")                           -> Turon Debate page with its own link previews
//   vibe.turon.one (bare "/")                            -> Vibe Turon page with its own link previews
//   everything else (mun., admin., chair. + test host)   -> TuronMUN app (dist/)
export const config = { matcher: '/:path*' };

const HUB_HOST = /^((www\.)?turon\.one|turon-website(-[a-z0-9-]+)?\.vercel\.app)$/i;
const DEBATE_HOST = /^(debat|debate)\.(turonmun\.com|turon\.one)$/i;
const VIBE_HOST = /^vibe\.turon\.one$/i;

// Hub project links. Change these when turon.one is live:
//   https://mun.turon.one/ , https://mun.turon.one/register , https://debat.turon.one/ , https://vibe.turon.one/
const GO = {
  '/go/mun': 'https://turon-one-mun.vercel.app/',
  '/go/mun-apply': 'https://turon-one-mun.vercel.app/register',
  '/go/debat': 'https://turon-one-mun.vercel.app/debat',
  '/go/vibe': 'https://turon-one-mun.vercel.app/vibe',
};

const rewrite = (path, request) =>
  new Response(null, { headers: { 'x-middleware-rewrite': new URL(path, request.url).toString() } });

export default function middleware(request) {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').split(':')[0];

  if (HUB_HOST.test(host)) {
    if (GO[url.pathname]) return Response.redirect(GO[url.pathname], 307);
    if (url.pathname.startsWith('/hub/')) return;
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
