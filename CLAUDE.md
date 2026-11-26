# Turon website — project brief for Claude Code

## What this is
The website for **Turon**, a student-led ecosystem in Fergana, Uzbekistan.
Tagline / page title: **"Turon — ecosystem for you(th)"** (the pun only works in English, so the title stays English on every language version; style "(th)" in the gold accent).
Mission: bring quality opportunities to regional youth so they don't have to leave the region to find them.

## Current state (2026-11-26, v2)
- `index.html` + `assets/styles.css` + `assets/app.js` — **the hub homepage**. Static, no build step. Uzbek is the default; English comes from the UZ/EN switch.
- `404.html`, `robots.txt`, `sitemap.xml`, `.well-known/security.txt`, `vercel.json` (security headers), `assets/favicon.svg`.
- `designs/midnight.html`, `designs/daylight.html` — archived explorations. Don't edit; don't link from the site (`robots.txt` disallows `/designs/`).
- Local preview: `.claude/launch.json` runs `python -m http.server 5173`.

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
