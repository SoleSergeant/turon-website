# Turon website — project brief for Claude Code

> Ecosystem domain: **turon.one** (test now, production later). turonmun.com stays as is.

## What this is
The website for **Turon**, a student-led ecosystem in Fergana, Uzbekistan.
Tagline / page title: **"Turon — ecosystem for you(th)"** (style "(th)" in the gold accent).
Mission: bring quality opportunities to regional youth so they don't have to leave the region to find them.

## Rules from the user
- **Never change the `SoleSergeant/turonmun` repo** (or its Vercel project / Supabase). Copy code from it into this repo when needed.
- **One Vercel project** (`turon-website`) for all of turon.one. Don't create separate projects per app.

## Current state (2026-11-26, v4: one project)
One repo, one Vercel project (`turon-website`, built from the repo root):

| Folder | What | Test URL | Final URL |
|---|---|---|---|
| `apps/hub` | Hub (static) → built to `dist/hub/` | https://turon-website-roan.vercel.app | https://turon.one |
| `apps/mun` | TuronMUN + Turon Debate + Vibe Turon + admin + chair (React/Vite) → `dist/` | https://turon-website-roan.vercel.app/mun (Debate: `/debat`, Vibe Turon: `/vibe`, admin: `/mun?subdomain=admin`, chair: `/mun?subdomain=chair`) | mun. / debat. / vibe. / admin. / chair.turon.one |

- **How it routes:** root `middleware.js` reads the hostname. `turon.one` and `www.turon.one` get the hub, rewritten to `/hub/...`. On the test address `turon-website*.vercel.app` (the old `turon-one-mun.vercel.app` is retired, 2026-11-27) the hub keeps `/` and its own files (`HUB_FILES`, kept in sync with `vercel.json`) and every other path goes to the MUN app; `/mun` is the MUN app's entry (`MunEntry` in `App.tsx`). A full reload of `/` there always shows the hub. `debat.turon.one/` gets the Debate page and `vibe.turon.one/` the Vibe Turon page. Every other hostname gets the MUN app, which picks admin/chair/debate by subdomain (`use-subdomain.ts`).
- **Build:** root `package.json` → `npm --prefix apps/mun run build` + `scripts/assemble.mjs`. Root `vercel.json` holds the install/build/output settings, rewrites and per-host security headers. The hub keeps its strict CSP; the MUN app keeps its original headers. `apps/mun/vercel.json` and `apps/mun/middleware.js` are upstream copies and are **not used**.
- **Hub project links:** the `GO` map in `middleware.js` (`/go/mun`, `/go/mun-apply`, `/go/debat`, `/go/vibe`). On the test address they stay on the same host (`/mun`, `/register`, `/debat`, `/vibe`); on turon.one they go to the subdomains. Nothing to change at launch.
- **Env vars** (on `turon-website`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (turon-one DB), plus `VITE_SITE_URL`, `VITE_ADMIN_URL`, `VITE_CHAIR_URL`, `VITE_DEBATE_URL`, `VITE_VIBE_URL` (defaults to https://vibe.turon.one) and `VITE_HUB_URL`, currently set to the test address (`…/mun?subdomain=admin`, `…/debat`, `…/vibe`).
- All header blocks send `X-Robots-Tag: noindex` during the test; remove it in `vercel.json` at launch. On the test address the hub's strict headers cover only the hub's files; the MUN app's headers cover the rest.
- `apps/mun` is a copy of `SoleSergeant/turonmun` at `f6bd6c3` (git subtree). To bring in newer turonmun code (this only reads that repo):
  `git subtree pull --prefix apps/mun https://github.com/SoleSergeant/turonmun.git main`
  Keep the turon.one changes listed below when resolving conflicts.
- turon.one changes inside `apps/mun`: `src/lib/domains.ts` (URLs from `VITE_*` env, turonmun.com defaults); `use-subdomain.ts` (sticky `?subdomain=` for test URLs); navbar/email/debate links use `domains.ts`; `DebateLayout.tsx` header (smaller name + Register padding under 380px so "Turon Debate" isn't cut off on phones); `scripts/debate-meta.mjs` reads the env; migrations `000_base_tables.sql` and `063_turon_one_alignment.sql`.
- **Season 8 = the ninth conference** (Seasons 1–7 plus TuronMUN x CAMU). It's set as the current season in `turon-one` (`066_season_8.sql`) and in the app defaults (`sections.ts`). The homepage card text lives in the `site_content` table (Admin → Site content), and that overrides the code defaults.
- **Hub cache:** `index.html` and `404.html` load `assets/styles.css?v=…` and `assets/app.js?v=…`. **Bump the `?v=` value whenever you change those files**, or returning visitors can see old text (this happened once).
- **Hub content:** past milestones only (founding 28 Jun 2024, MyMUN 2024 awards, rename to TuronMUN 12 May 2025, MyMUN 2025 3rd place, Turon Debate Nov 2026). No future plans: Vibe Turon is off the hub until the user decides (see the decision chat).
- **Supabase:** project `turon-one`, ref `acqfxuvnhmmgblkmcpnh`, Frankfurt, free. Schema 000 → 062 (006 skipped) + 063, checked against the live schema. No data yet. The disabled function `run-migrations-once` (answers 410) can be deleted in the dashboard.
- **Supabase security check (2026-11-27):** no errors. `068_revoke_trigger_fn_execute.sql` (applied) stops the API from calling trigger functions (`trg_*`). The remaining warnings are deliberate: every admin/staff RPC checks the role itself (`is_academic_staff`, `is_sg`, `is_active_admin`), and the anon-callable ones (`form_approved_count`, `verify_certificate`, `debate_public_results`, role checks used by RLS) are meant to be public. Performance notes (unused indexes, several permissive policies) can wait: the database is empty.
- **Auth URLs (launch step 4) still to do:** email sign-up needs confirmation, so Site URL must point at the site, not `localhost`.
- `designs/` holds the archived design explorations. Local hub preview: `.claude/launch.json` serves `apps/hub` on :5173.

## Going live on turon.one (checklist)
1. Buy turon.one (ideally in Vercel, so DNS is automatic).
2. Add all domains to the one project `turon-website`: `turon.one`, `www.turon.one`, `mun.`, `debat.`, `vibe.`, `admin.` and `chair.turon.one`. Routing is automatic (middleware.js).
3. Set the `turon-website` env vars to the turon.one URLs (see `src/lib/domains.ts`) and redeploy.
4. Supabase `turon-one` → Authentication → URL Configuration: Site URL `https://mun.turon.one`; Redirect URLs `https://*.turon.one/**` (+ `https://turon-website-roan.vercel.app/**` while testing).
5. Email: deploy `apps/mun/supabase/functions/send-email` and set `RESEND_API_KEY` / `EMAIL_FROM` secrets (verify turon.one in Resend). Until then, the app's own emails don't send; Supabase's built-in auth emails (confirm, reset) still work, rate-limited.
6. First admin: sign up on the MUN site, then add that email to `admin_users` with role `sg` (Supabase SQL editor). See `apps/mun/docs/ADMIN_PANEL_SETUP.md`.
7. Remove `X-Robots-Tag` from `vercel.json`, check canonical/sitemap. (The `GO` links already point at turon.one on the real domain.)

## Projects (as of now)
- **TuronMUN**: live at https://www.turonmun.com (apply: `/register`). Season 8 is "coming soon" there.
- **Turon Debate**: running since Nov 2026.
- **Vibe Turon**: an AI-aided hackathon ("hackathon" first, AI-aided second; don't call it a vibeathon on the site). Warm-up Feb 2027, the 2-day event planned for March 2027 (Day 1 build + workshops, Day 2 fair + finals). Landing page: `apps/mun/src/pages/vibe/VibeLanding.tsx`, all text in Admin → Website → Content → **Vibe Turon** (`vibe` section in `sections.ts`). The **Status** dropdown switches Coming soon (Telegram button) / Registration open (Register button → the Registration link) / Finished. Logo files: `apps/mun/public/vibe/` (V mark only, no wordmark on the page); link preview `og-image.png` + `scripts/vibe-meta.mjs`. Prize pool, 150 places, coins and track names stay off the page until announced. Registration itself is an external link for now.
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
- **Language: the hub is English only** (`<html lang="en">`; decided 2026-11-27). The Uzbek version, the UZ · EN switch and the translation code were removed. All text lives directly in `index.html`; JS only ever sets text with `textContent`. Old `?lang=en` links still work (the parameter is ignored).
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
- FAQ: Turon Debate / Vibe Turon **[pricing details]** and **[language]**
- Partner logos (partners show as text names; use logos once each partner approves)
- Hub-specific Telegram/Instagram (currently the TuronMUN ones)
- Final domain: `canonical`, `og:url` and `sitemap.xml` all say `https://turonmun.com/`

## Site architecture (agreed)
Hub + subdomains:
- Hub (turonmun.com for now; a new domain later — turon.uz is taken): Home, About, Projects, Calendar, Get involved, Contact.
- Project sites on subdomains: `mun.` (or the existing turonmun.com), `debat.`, `vibe.` — all share ONE template: hero (name, date, register) → what it is → format & schedule → who can join → what you get → past editions/photos → FAQ → register. Each shows a small `turon.` mark linking back to the hub (no "a Turon initiative" text). Reuse `assets/styles.css`: same navy shell, swap the accent.

## Homepage section order (current) — the section dial ("option B")
With JS and a window ≥520px tall, `html.wheel` is on: the page doesn't scroll. One `.screen` is shown at a time, next to a small dial (`nav.dial`) that turns 45° per section and loops (after Contact comes Home). On laptops the dial is a small half-wheel on the left edge (`--dial-d`, `--dial-w`) with the hub logo's gold centre and 8 rim ticks; the section names sit outside the rim on an evenly spaced curve and stay level (5 shown: current in gold, ±1, ±2 faded; positions `--x/--y` set in `paint()`). The rail has no colour of its own: each screen runs under it (`padding-left:var(--dial-w)`), and `html[data-tone]` switches the label colours for light sections; under 1000px wide it's a low arc along the bottom (`--dial-v`). Wheel/trackpad (one step per gesture), arrow keys/PageUp/PageDown/Home/End, vertical swipes, the dial labels, the header links and any `#id` link turn the dial. Inactive screens are `inert`, and the URL hash follows the section (deep links like `/#faq` work). Without JS, or on very short windows, it's a normal scrolling page. Logic: the "Section dial" block in `app.js`; styles: "the dial" / "the stage" in `styles.css`.
Animations (all off with reduced motion): first-visit hint chip + dial nudge after 2s (remembered in localStorage `turon-dial-seen`), numbers count up on the Numbers stop (real value kept in a visually hidden span), each stop's parts rise in one after another (`rise`, `--d` delays). Focus moves to the new section when it was inside the old one.
**When you add content, re-check that every stop still fits** (no inner scrolling) at 1366×633, 1024×768, 768×1024, 390×664 and 360×640. Numbers are sized to their row (`cqi`) so "700+" never runs into the next number; milestones are 3 + 2 columns from 768 to 1279px.
1. Home (navy, `#top`): title, subtitle, Join / See projects, real TuronMUN photo
2. In numbers (navy, `#numbers`): 700+ · 8 · 15+ · 3; MyMUN award chips
3. Projects (`#projects`): TuronMUN · Turon Debate · Vibe Turon (a sideways swipe row on phones)
4. Milestones (`#milestones`): horizontal timeline, 5 past milestones
5. Why Turon (`#about`): story + 3 photos (1 on tall phones, none on short ones)
6. Get involved + Hosts & partners (`#join`)
7. FAQ (`#faq`)
8. Contact (the footer, `#contact`)

## Brand rules
- **Logo (chosen 2026-11-26): "the hub"**: a white ring with three white dots (the projects) around a gold centre, next to the wordmark "turon" (Unbounded 800, no dot). Inline SVG `.logo-mark` in the header and footer (`currentColor` = ring colour); `assets/favicon.svg` and `assets/apple-touch-icon.png` use a thicker small-size version. Master files and avatar/app-icon PNGs are in `designs/logo/`.
- Navy **#283480** is the base across the whole ecosystem; each project gets ONE accent.
- Language: English only on the hub (see "How the code works").
- Mobile-first: most visitors come from Instagram/Telegram on phones.
- No stock photos; real Turon photos only. No invented stats: every number needs a source (see "Facts used").

## Suggested next steps
1. Fill the placeholders.
2. Move photos and fonts into the repo (self-host), then tighten the CSP.
3. Deploy on Vercel (`vercel.json` is ready), then point the domain.
4. Build the shared project-site template for `debat.` and `vibe.`.
5. Registration: Google Forms / Telegram bot for now.
