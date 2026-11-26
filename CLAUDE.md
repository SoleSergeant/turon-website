# Turon website — project brief for Claude Code

> Ecosystem domain: **turon.one** (test now, production later). turonmun.com stays as is.

## What this is
The website for **Turon**, a student-led ecosystem in Fergana, Uzbekistan.
Tagline / page title: **"Turon — ecosystem for you(th)"** (the pun only works in English, so the title stays English on every language version; style "(th)" in the gold accent).
Mission: bring quality opportunities to regional youth so they don't have to leave the region to find them.

## Current state (2026-11-26, v3: turon.one test)
Monorepo, one Vercel project per app, all deployed from this repo:

| Folder | Vercel project | Test URL (now) | Final URL |
|---|---|---|---|
| `apps/hub` | `turon-website` (root dir `apps/hub`) | https://turon-website-roan.vercel.app | https://turon.one |
| `apps/mun` | `turon-mun` (root dir `apps/mun`) | https://turon-mun.vercel.app | mun. / debat. / admin. / chair.turon.one |

- **turonmun.com stays live and untouched.** It deploys from the separate `SoleSergeant/turonmun` repo with its own Supabase (`ylqgyxibakupzxbvwgvf`). Never point turon.one code at that database.
- `apps/mun` is a **git subtree** of `SoleSergeant/turonmun` at `f6bd6c3` (TuronMUN + Turon Debate + admin + chair in one React/Vite app, chosen by hostname). Pull upstream changes with:
  `git subtree pull --prefix apps/mun https://github.com/SoleSergeant/turonmun.git main`
- Changes made in `apps/mun` for turon.one (keep them when pulling):
  - `src/lib/domains.ts`: all public URLs come from `VITE_SITE_URL`, `VITE_ADMIN_URL`, `VITE_CHAIR_URL`, `VITE_DEBATE_URL` and `VITE_HUB_URL`. The defaults are the turonmun.com URLs.
  - `use-subdomain.ts`: `?subdomain=admin|chair|debate` is remembered per tab (sessionStorage), and `?subdomain=none` clears it. This lets the vercel.app test URL act as every subdomain.
  - `middleware.js` + `vercel.json`: the debat host rule also matches `debat.turon.one`.
  - `scripts/debate-meta.mjs`: link-preview URLs come from the env vars.
  - `supabase/migrations/000_base_tables.sql` (base tables that used to come from archive scripts) and `063_turon_one_alignment.sql`.
- **Supabase for turon.one:** project `turon-one`, ref `acqfxuvnhmmgblkmcpnh`, Frankfurt (eu-central-1), free plan. The schema is 000 → 062 (006 skipped) + 063, and was checked against the live schema: same tables, triggers, storage buckets and functions; policies are as strict or stricter. It has no data and no accounts yet.
  - A disabled one-off function `run-migrations-once` is left in Supabase; it returns 410. Delete it in Dashboard → Edge Functions.
- Hub project links go through `/go/mun`, `/go/mun-apply`, `/go/debat` redirects in `apps/hub/vercel.json`. **When turon.one is live, change those three destinations** to `https://mun.turon.one/`, `https://mun.turon.one/register`, `https://debat.turon.one/`.
- The hub sends `X-Robots-Tag: noindex` during the test. Remove it in `apps/hub/vercel.json` at launch.
- `designs/` holds the archived design explorations.
- Local hub preview: `.claude/launch.json` serves `apps/hub` on :5173. MUN app: `cd apps/mun && npm ci && npm run dev`.

## Going live on turon.one (checklist)
1. Buy turon.one (ideally in Vercel, so DNS is automatic).
2. Add domains in Vercel: `turon.one` + `www.turon.one` → hub; `mun.`, `debat.`, `admin.` and `chair.turon.one` → `turon-mun`.
3. Set the `turon-mun` env vars to the turon.one URLs (see `src/lib/domains.ts`) and redeploy.
4. Supabase `turon-one` → Authentication → URL Configuration: Site URL `https://mun.turon.one`; Redirect URLs `https://*.turon.one/**` (+ the vercel.app test URL while testing).
5. Email: deploy `apps/mun/supabase/functions/send-email` and set `RESEND_API_KEY` / `EMAIL_FROM` secrets (verify turon.one in Resend). Until then, the app's own emails don't send; Supabase's built-in auth emails (confirm, reset) still work, rate-limited.
6. First admin: sign up on the MUN site, then add that email to `admin_users` with role `sg` (Supabase SQL editor). See `apps/mun/docs/ADMIN_PANEL_SETUP.md`.
7. Change the hub `/go/*` redirects, remove noindex, update canonical/sitemap if needed.

## Projects (as of now)
- **TuronMUN**: live at https://www.turonmun.com (apply: `/register`). Season 8 is "coming soon" there.
- **Turon Debate**: running since Nov 2026.
- **Vibe Turon**: warm-up in Feb 2027, then the vibeathon in spring 2027.
- **Turon Research is NOT running.** It was removed from the site (projects, milestones, numbers, copy). Don't add it back unless the user says so.

## Design direction
- Started from Direction B (Daylight): light body, navy #283480, Unbounded + Inter, white cards, vertical milestones list.
- v2 changes: **navy hero** (gradient #33409A → #283480 → #141B4D) so the gold "(th)" and the real photo stand out. The light sections below keep the page calm and credible.
- **Brand colours:** navy `--navy:#283480` is the base. The hub accent is **TuronMUN gold `--gold:#F6A81C`**, taken from turonmun.com's `--accent` (hsl 39 93% 54%). Gold is only for navy backgrounds (5.6:1) or as a fill behind navy text. On light backgrounds use `--gold-ink:#8A5A00` for gold-coloured text.
- Project accents: MUN gold `--mun`, Debate red `--debate:#C92A2A`, Vibe Turon violet `--vibe:#6741D9` (kept off orange/gold so it doesn't clash with the hub; not final).
- UX patterns borrowed from Hack Club / MLH: separate calls to action per audience (participate / join the team / partner), social proof up front (numbers + MyMUN awards + hosts), real event photos, FAQ, Telegram as the "stay updated" channel.

## Facts used (all from turonmun.com, checked 2026-11-26)
- First TuronMUN: 28 Jul 2024, as "FerganaPS MUN", Presidential School in Fergana, 80 delegates, 4 committees.
- 8 conferences (Seasons 1–7 + TuronMUN x CAMU). Delegate counts: 80, 50, 105, 80, 120, 100, 80, 120 = 735 → shown as **700+** (turonmun.com says 700+ too). **15+** committees.
- TuronMUN x CAMU: 28 Jul 2025, Central Asian Medical University, 120 delegates, 6 committees, 3 languages.
- Season 7: 28 Jul 2026, two-year anniversary, 120 delegates, Presidential School.
- Hosts/partners: Presidential School in Fergana (S1–3, S7), Rahimov School Fergana branch (S4), Registan Private School (S5–6), SATashkent (S6 partner), CAMU (2025).
- MyMUN awards: Best Small Conference, Best Socials, Best Logistics.
- Contact: admin@turonmun.com · Telegram t.me/TuronMUN · Instagram instagram.com/turon.mun (these are the TuronMUN channels, used for the hub until it has its own).
- **Replaced from the old brief:** "1,000+ students" and "3 regions" were dropped because they don't match the public turonmun.com figures (700+ delegates; "3 countries represented"). Use them again only if the team confirms them with a source.
- Photos are hot-linked from turonmun.com (`/images/hero.jpg`, `/seasons/season 1/1.jpg`, `/seasons/Turonxcamu/3.jpg`, `/seasons/season 7/1.jpg`). Better: copy them into `assets/img/` (and compress to WebP), then drop `https://www.turonmun.com` from `img-src` in the CSP.

## How the code works
- i18n: Uzbek text is in the HTML. English is in the `EN` object in `assets/app.js`. Elements carry `data-i18n="key"`; attributes use `data-i18n-attr="attr:key"`. **Translations are applied with `textContent` only** (no HTML in strings). Language is stored in localStorage and in `?lang=en`, and both are checked against an allow-list. The H1 is always English (`lang="en"`).
- Uzbek uses ʻ (U+02BB) in oʻ/gʻ and ʼ (U+02BC) for the tutuq belgisi.
- **CSP:** no inline `<script>`, no inline `style=""` attributes, no `on*=` handlers. The CSP (in the meta tag and in `vercel.json`) allows only self + Google Fonts + turonmun.com images. If you add a new external resource, update both.

## Security checklist (done)
- Strict CSP (meta + header): `script-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` (header only).
- `vercel.json` headers: HSTS (2 years, includeSubDomains, preload), nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy (camera/mic/geo/payment off), COOP.
- External links use `rel="noopener noreferrer"`. No forms, cookies or trackers. `security.txt` points to admin@turonmun.com (expires 2027-11-26, so renew it).
- Remaining privacy note: Google Fonts loads from Google. Self-host Unbounded + Inter (woff2 in `assets/fonts/`) to remove that.
- Notes on turonmun.com (separate site): headers are good (HSTS, nosniff, SAMEORIGIN), but its CSP is only `frame-ancestors`. Adding a `script-src` would harden it. Its contact FAQ also lists `chairs@munconference.org`, which looks like a template leftover.

## Remaining placeholders (visible as [like this] or marked `<!-- [ ... ] -->`)
- Subdomain links: `debat.[domain]`, `vibe.[domain]` (shown as plain text, not links)
- Vibe Turon warm-up registration link (hero "Next up" currently jumps to #milestones)
- Team application form (the "Join the team" card uses mailto for now)
- FAQ: Turon Debate / Vibe Turon **[narx maʼlumoti] / [pricing details]** and **[til] / [language]**
- Partner logos (partners show as text names; use logos once each partner approves)
- Hub-specific Telegram/Instagram (currently the TuronMUN ones)
- Final domain: `canonical`, `og:url` and `sitemap.xml` all say `https://turonmun.com/`
- Have a native speaker proofread the Uzbek copy

## Site architecture (agreed)
Hub + subdomains:
- Hub (turonmun.com for now; a new domain later — turon.uz is taken): Home, About, Projects, Calendar, Get involved, Contact.
- Project sites on subdomains: `mun.` (or the existing turonmun.com), `debat.`, `vibe.` — all share ONE template: hero (name, date, register) → what it is → format & schedule → who can join → what you get → past editions/photos → FAQ → register. Each shows a small `turon.` mark linking back to the hub (no "a Turon initiative" text). Reuse `assets/styles.css`: same navy shell, swap the accent.

## Homepage section order (current)
1. Hero (navy): title, Uzbek subtitle, Join / See projects, next-up pill (Vibe Turon warm-up, Feb 2027), real TuronMUN photo
2. Impact numbers: 700+ delegates · 8 conferences · 15+ committees · 3 projects in 2027; MyMUN awards
3. Projects: TuronMUN (Season 8 soon) · Turon Debate (running) · Vibe Turon (spring 2027); "2028: two new projects"
4. Milestones: Jul 2024 → Jul 2025 → Jul 2026 → Nov 2026 Debate → WE ARE HERE → Feb 2027 warm-up → Mar 2027 NNO → spring Vibe Turon → 28 Jul 2027 TuronMUN → 2028
5. Why Turon (story) + 3 real photos
6. Hosts & partners + "Become a partner"
7. Get involved: Participate / Join the team / Partner or mentor
8. FAQ
9. Footer: Telegram, Instagram, email, UZ · EN

## Brand rules
- Navy **#283480** is the base across the whole ecosystem; each project gets ONE accent.
- Language: Uzbek (Latin) first, English second; Russian later.
- Mobile-first: most visitors come from Instagram/Telegram on phones.
- No stock photos; real Turon photos only. No invented stats: every number needs a source (see "Facts used").

## Suggested next steps
1. Fill the placeholders; proofread the Uzbek.
2. Move photos and fonts into the repo (self-host), then tighten the CSP.
3. Deploy on Vercel (`vercel.json` is ready), then point the domain.
4. Build the shared project-site template for `debat.` and `vibe.`.
5. Registration: Google Forms / Telegram bot for now.
