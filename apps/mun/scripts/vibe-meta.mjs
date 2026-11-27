// Runs after `vite build` (after debate-meta): writes dist/vibe/index.html, a
// copy of the app page whose link-preview tags describe Vibe Turon. Vercel
// serves it for /vibe and (via middleware.js / vercel.json) for the root of
// vibe.turon.one, so Telegram/Instagram previews show the Vibe Turon card.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const clean = (v, d) => (v && /^https:\/\//.test(v) ? v.replace(/\/+$/, '') : d);
const SITE = clean(process.env.VITE_SITE_URL, 'https://www.turonmun.com');
const VIBE = clean(process.env.VITE_VIBE_URL, 'https://vibe.turon.one');
const TITLE = 'Vibe Turon';
const DESCRIPTION = 'An AI-aided hackathon in Fergana for everyone. Bring an idea and build a working app in a weekend. No coding needed.';
const IMAGE = `${SITE}/vibe/og-image.png`;

let html = readFileSync('dist/index.html', 'utf8');
const set = (pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`vibe-meta: tag not found: ${pattern}`);
  html = html.replace(pattern, replacement);
};

set(/<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`);
set(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${DESCRIPTION}"`);
set(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${TITLE}"`);
set(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${DESCRIPTION}"`);
set(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${VIBE}/"`);
set(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${IMAGE}"`);
set(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${IMAGE}"`);
set(/<link rel="icon"[^>]*>/, '<link rel="icon" type="image/svg+xml" href="/vibe/favicon.svg" />');

mkdirSync('dist/vibe', { recursive: true });
writeFileSync('dist/vibe/index.html', html);
console.log('vibe-meta: wrote dist/vibe/index.html');
