# Launch migration: TuronMUN → turon.one

Status: **decided, not run.** Nothing has been copied. The real run needs a separate, explicit go-ahead from the user.

| | |
|---|---|
| Source (live, **read-only**) | Supabase `ylqgyxibakupzxbvwgvf` (TuronMUN, serves turonmun.com) |
| Target | Supabase `turon-one` = `acqfxuvnhmmgblkmcpnh` (Frankfurt, free) |
| What moves | **All accounts + the current season only** |
| turonmun.com afterwards | **Permanent page-for-page 301 to the turon.one subdomains** |
| When | **Before Season 8 registration opens**, with a short sign-up pause |

## Decisions (2026-11-26)

1. **Accounts + current season.** Every account moves (same user IDs, same password hashes, Google links kept). Of the season data, only the current season moves. Past seasons stay in the old database, which is kept as an archive and never deleted.
2. **turonmun.com redirects** to mun.turon.one (and admin./chair. to admin./chair.turon.one), path and query kept, 301. One live database, so nothing drifts.
3. **Timing:** now-ish, while Season 8 is still "coming soon" on turonmun.com. Season 8 registration opens only on turon.one. Avoid a Turon Debate event day (Debate data is live and moves with the cutover).

### Participation history: moves in full (decided 2026-11-26)

`participations` is copied in full, all seasons. "Current season only" would have dropped it, and two features read it:
- the **returning-delegate discount** (`is_returning_delegate()`, migration 059) checks for a delegate row in an earlier season, and
- **certificates** (codes in `participations.certificate_code`, verifiable online).

It is one row per person per event (no applications, no answers, no files), so it counts as account history, not season data. With it, returning delegates get their discount and old certificate codes still verify on turon.one. It is step 4c.

## Facts that shape the plan

- **Passwords keep working.** `auth.users` is copied with the same `id` and `encrypted_password` (bcrypt). Supabase checks bcrypt hashes the same way in every project.
- **Everyone signs in once more.** Each project signs sessions with its own JWT secret, so old sessions and refresh tokens are useless on turon.one. Sessions are **not** copied.
- **Google sign-in** (`useAuth.ts` uses `signInWithOAuth({ provider: 'google' })`): `auth.identities` is copied too, so a Google user lands on the same account. turon-one needs the Google provider switched on, and the Google OAuth client must allow `https://acqfxuvnhmmgblkmcpnh.supabase.co/auth/v1/callback`.
- **Schemas match.** turon-one was built from `apps/mun/supabase/migrations/000`–`065` (006 skipped, 063/065 are turon.one-only index/policy changes) and checked against the live schema.
- **Storage is separate.** Files in the buckets `applications`, `committees` and `resources` are copied with the Storage API, not SQL. All three buckets are public, and the app saves **full public URLs** in the database (`photo_url`, `image_url`, `file_url`, `flag_url`, `certificate_url`, `ielts_certificate_url`, `sat_certificate_url`, `link_url`, plus `site_content`). Those URLs contain the old project ref, so they must be rewritten (step 6).
- **Triggers must not fire on import.** `applications` has an insert guard that recomputes the fee (043/059) and a trigger that stamps `season`; `auth.users` has a trigger that creates `public.users`. Import with `session_replication_role = replica` so rows land exactly as exported.
- **Pending Telegram messages must not move**, or they would be sent twice. Same for `activity_log` (the audit trail stays with the old database).

## What moves

| Table / data | Moves? | Filter |
|---|---|---|
| `auth.users` | yes | all; exclude generated column `confirmed_at` |
| `auth.identities` | yes | all; exclude generated column `email` |
| `auth.sessions`, `auth.refresh_tokens`, `auth.mfa_*`, `auth.flow_state`, `auth.one_time_tokens` | **no** | users sign in again |
| `public.users` (profiles) | yes | all |
| `admin_users` (SG, academics, chairs, judges) | yes | all; inactive chair rows are harmless |
| `participations` | yes | all seasons (decided) |
| `newsletter_subscribers` | yes | all |
| `seasons` | yes | the current row only (`is_current`) |
| `season_info`, `form_settings`, `form_questions`/step labels, `site_content`, `team_members`, `schedule_events`, `award_settings`, `country_flag_overrides`, `demographic_aliases` | yes | all (site configuration for the current season) |
| `committees`, `resources`, `country_assignments`, `committee_awards`, `committee_announcements` | yes | current rows (past seasons already sit in `season_archive`) |
| `applications`, `volunteer_applications` | yes | `season = current_season()` |
| `position_papers` | yes | only rows whose application moved |
| Turon Debate: `debate_registrations`, `debate_teams`, `debate_pairings`, `debate_scores`, `debate_pair_votes` | yes | all (Debate started Nov 2026, so all of it is current) |
| `contact_messages` | yes | unanswered only |
| `telegram_templates` | yes | all |
| `season_archive` | no | past seasons stay in the old DB |
| MUN Command session data: `committee_sessions`, `attendance`, `motions`, `speakers_list`, `votes`, `session_logs`, `matrix_countries` | no | conference-day data from Season 7; Season 8 starts clean |
| `activity_log`, `telegram_outbox`, `telegram_batches`, `telegram_sender` | no | audit / pending sends / per-project bot state |
| Storage `committees`, `resources` | yes | all files |
| Storage `applications` | yes | only files referenced by moved rows |

Before the run, confirm the live table list matches this one (step 1). Any table not in this list gets a decision before the run, not during it.

## Who does what

- **The user** does everything on the live side that is not a plain read: the sign-up pause, moving the turonmun.com domains, and anything in the `turonmun` Vercel project. Claude does not touch the live project, its Vercel project or the `SoleSergeant/turonmun` repo.
- Reads from the live database (`\copy (SELECT …) TO`, Storage list/download) use a connection string the user provides for the run. They are read-only.
- The export files contain password hashes and personal data. Keep them in one folder outside the repo, never commit them, and delete them after step 9.

## Runbook

Times are for a few thousand rows; the whole run fits in about an hour. `$SRC` / `$DST` are the **session pooler** connection strings of the two projects (Project Settings → Database). Use psql 15+.

### 0. One week before

- [ ] Run the dry run below on turon-one; it must pass.
- [ ] Finish go-live checklist items 1–5 in `CLAUDE.md` (domain, env vars, Auth URLs, email via Resend). Email matters: on day one many people will press "Forgot password", and Supabase's built-in sender is rate-limited.
- [ ] Switch on Google sign-in in turon-one (same OAuth client, add the new callback URL).
- [ ] Pick the window; announce it on Telegram/Instagram ("Season 8 registration opens on mun.turon.one; you'll need to sign in again, your password stays the same").
- [ ] Back up turon-one (Database → Backups, or `pg_dump $DST`), so the target can be reset.

### 1. Check (read-only, the day before)

```sql
-- on $SRC: table list and row counts, to compare with the table above
SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables
 WHERE schemaname IN ('public','auth') ORDER BY 1,2;
SELECT number, name FROM public.seasons WHERE is_current;     -- expect 8
SELECT count(*) FROM auth.users;
-- auth column lists on both sides must match (GoTrue versions can differ):
SELECT table_name, string_agg(column_name, ',' ORDER BY ordinal_position)
  FROM information_schema.columns
 WHERE table_schema = 'auth' AND table_name IN ('users','identities')
   AND is_generated = 'NEVER' GROUP BY 1;
```

Run the last query on `$DST` too. Copy only the columns present on both sides; use that list in step 3.

### 2. Freeze (start of the window)

- [ ] **User:** live Supabase → Authentication → Sign In / Providers → turn off "Allow new users to sign up". This is a reversible setting on the live project; only the user changes it. Existing users can still sign in, so also post the window on Telegram.
- [ ] Note the time: `FREEZE_AT`.

### 3. Export (read-only on $SRC)

```bash
mkdir -p ~/turon-migration && cd ~/turon-migration     # outside the repo
S=$(psql "$SRC" -Atc "select public.current_season()")

psql "$SRC" <<SQL
\copy (SELECT <users columns from step 1> FROM auth.users) TO 'auth_users.csv' CSV HEADER
\copy (SELECT <identities columns from step 1> FROM auth.identities) TO 'auth_identities.csv' CSV HEADER
\copy public.users TO 'users.csv' CSV HEADER
\copy public.admin_users TO 'admin_users.csv' CSV HEADER
\copy public.participations TO 'participations.csv' CSV HEADER
\copy public.newsletter_subscribers TO 'newsletter_subscribers.csv' CSV HEADER
\copy (SELECT * FROM public.seasons WHERE is_current) TO 'seasons.csv' CSV HEADER
\copy (SELECT * FROM public.applications WHERE season = $S) TO 'applications.csv' CSV HEADER
\copy (SELECT * FROM public.volunteer_applications WHERE season = $S) TO 'volunteer_applications.csv' CSV HEADER
\copy (SELECT p.* FROM public.position_papers p JOIN public.applications a ON a.id = p.application_id WHERE a.season = $S) TO 'position_papers.csv' CSV HEADER
\copy (SELECT * FROM public.contact_messages WHERE responded_at IS NULL) TO 'contact_messages.csv' CSV HEADER
SQL
```

Then one plain `\copy public.<t> TO '<t>.csv' CSV HEADER` for each "all rows" table in the table above (config, committees, debate, templates). Check the real column names (`application_id`, `responded_at`) against `\d` first; adjust the filter, not the plan.

Storage: list and download the three buckets with the service-role key of `$SRC` (read). See "Storage copy" below.

### 4. Import (on $DST)

```sql
BEGIN;
SET session_replication_role = replica;   -- no triggers, no FK checks during load

-- a. empty the target's app data (it has only the seeded Season 8 and test rows)
TRUNCATE public.applications, public.volunteer_applications, public.position_papers,
         public.participations, public.admin_users, public.users, public.seasons,
         public.debate_registrations, public.debate_teams, public.debate_pairings,
         public.debate_scores, public.debate_pair_votes /* …every table in the "yes" rows */ CASCADE;
DELETE FROM auth.identities; DELETE FROM auth.users;   -- target has no real users

-- b. accounts
\copy auth.users (<same columns>) FROM 'auth_users.csv' CSV HEADER
\copy auth.identities (<same columns>) FROM 'auth_identities.csv' CSV HEADER
\copy public.users FROM 'users.csv' CSV HEADER
\copy public.admin_users FROM 'admin_users.csv' CSV HEADER
\copy public.newsletter_subscribers FROM 'newsletter_subscribers.csv' CSV HEADER

-- c. participation history (all seasons)
\copy public.participations FROM 'participations.csv' CSV HEADER

-- d. current season: seasons first, then config, committees, then applications …
\copy public.seasons FROM 'seasons.csv' CSV HEADER
-- … one \copy per exported file, parents before children

SET session_replication_role = origin;
COMMIT;
```

Load order for the rest: config tables → `committees` → `resources` → `applications`/`volunteer_applications` → `country_assignments`, `committee_awards`, `committee_announcements`, `position_papers` → debate tables (`debate_registrations` → `debate_teams` → `debate_pairings` → `debate_scores`, `debate_pair_votes`) → `contact_messages`, `telegram_templates`.

### 5. Foreign keys, sequences, orphans

FK checks were off during the load, so check them now (expect 0 everywhere):

```sql
-- example; repeat for every FK the load touched
SELECT count(*) FROM public.applications a
  LEFT JOIN auth.users u ON u.id = a.user_id WHERE a.user_id IS NOT NULL AND u.id IS NULL;
SELECT count(*) FROM public.applications a
  LEFT JOIN public.committees c ON c.id = a.assigned_committee_id
 WHERE a.assigned_committee_id IS NOT NULL AND c.id IS NULL;
```

Reset identity/serial columns on every loaded table that has one:

```sql
SELECT setval(pg_get_serial_sequence('public.<table>', 'id'),
              coalesce((SELECT max(id) FROM public.<table>), 1));
```

`current_season()` must return the same number as on the source.

### 6. Storage copy and URL rewrite

1. Upload the downloaded files to the same bucket and the same path in turon-one (service-role key of `$DST`, `upsert: true`, keep `contentType`).
2. Rewrite saved URLs. Find every text column that still holds the old host, then update it:

```sql
-- list candidates
SELECT table_name, column_name FROM information_schema.columns
 WHERE table_schema = 'public' AND data_type IN ('text','character varying','jsonb');
-- per column found:
UPDATE public.<t> SET <col> = replace(<col>, 'ylqgyxibakupzxbvwgvf.supabase.co', 'acqfxuvnhmmgblkmcpnh.supabase.co')
 WHERE <col> LIKE '%ylqgyxibakupzxbvwgvf%';
-- jsonb columns (site_content): replace on <col>::text, cast back to jsonb
```

3. Check: `SELECT count(*) … WHERE <col> LIKE '%ylqgyxibakupzxbvwgvf%'` is 0 for every column, and five random image URLs open in a browser.

### 7. Verify before opening

- [ ] Row counts: target = source for every copied table (season tables filtered the same way).
- [ ] Sign in on mun.turon.one with a real team account (password) and a Google account. Both land on the same user ID as on turonmun.com.
- [ ] SG account opens admin.turon.one and sees Season 8 config and the Debate data.
- [ ] A test application in Season 8 gets the right fee, with the returning discount for a returning delegate. Delete it afterwards.
- [ ] A Season 7 certificate code verifies on turon.one.
- [ ] Supabase advisors (security + performance) show nothing new.

### 8. Cutover

- [ ] Deploy the redirect in this repo: in `middleware.js`, for the hostnames `turonmun.com` / `www.turonmun.com` → 301 to `https://mun.turon.one` + same path and query; `admin.turonmun.com` → `admin.turon.one`, `chair.turonmun.com` → `chair.turon.one`. Ship it before moving the domains.
- [ ] **User:** in Vercel, remove `turonmun.com`, `www.` and the other turonmun.com subdomains from the `turonmun` project and add them to `turon-website` (or set a domain-level redirect there). This changes the turonmun Vercel project's domain list, so only the user does it.
- [ ] Open Season 8 registration on turon.one; post on Telegram/Instagram.
- [ ] Items 6–7 of the go-live checklist in `CLAUDE.md` (the first admin step is already done, since `admin_users` moved).

### 9. After

- [ ] Delta check: `SELECT id, email FROM auth.users WHERE created_at > 'FREEZE_AT'` on `$SRC`. Expect none. Copy any stragglers by hand (steps 3–4, filtered by id).
- [ ] Watch sign-in errors and password-reset volume for a few days (Auth logs).
- [ ] Delete `~/turon-migration` once turon.one has run cleanly for a week.
- [ ] The old project stays as the archive of Seasons 1–7. Don't delete it; whether to pause it later is the user's call.

### Rollback

- Before step 8: nothing public changed. Turn live sign-ups back on, reset turon-one from the backup in step 0.
- After step 8: move the domains back to the `turonmun` project and turn sign-ups on again. Anything people did on turon.one in between (new accounts, Season 8 applications) is not in the old database; export it from turon-one before switching back.

## Storage copy

A small Node script, run from the migration folder (not the repo), with `SRC_URL`, `SRC_SERVICE_KEY`, `DST_URL`, `DST_SERVICE_KEY` in the environment:

```js
// copy-storage.mjs — reads from SRC, writes to DST. node copy-storage.mjs [only-paths.txt]
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
const src = createClient(process.env.SRC_URL, process.env.SRC_SERVICE_KEY);
const dst = createClient(process.env.DST_URL, process.env.DST_SERVICE_KEY);
const only = process.argv[2] && existsSync(process.argv[2])
  ? new Set(readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean)) : null;

async function walk(bucket, prefix = '') {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await src.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const f of data) {
      const path = prefix ? `${prefix}/${f.name}` : f.name;
      if (f.id === null) out.push(...await walk(bucket, path)); else out.push(path);
    }
    if (data.length < 1000) return out;
  }
}
for (const bucket of ['committees', 'resources', 'applications']) {
  let paths = await walk(bucket);
  if (bucket === 'applications' && only) paths = paths.filter(p => only.has(p));
  for (const p of paths) {
    const { data, error } = await src.storage.from(bucket).download(p);
    if (error) { console.error('download', bucket, p, error.message); continue; }
    const up = await dst.storage.from(bucket).upload(p, data, { upsert: true, contentType: data.type });
    console.log(up.error ? `FAIL ${bucket}/${p} ${up.error.message}` : `ok ${bucket}/${p}`);
  }
}
```

`only-paths.txt` = the `applications` bucket paths referenced by the moved application rows (pull them from the exported URL columns: the part after `/object/public/applications/`).

---

# Dry run (turon-one only)

Goal: run every step of the runbook once, end to end, **with turon-one as both source and target** and only dummy accounts. The live project is not read or touched. Run it before step 0 is ticked.

Setup: `$SRC` and `$DST` both point at turon-one; `SRC_URL`/`DST_URL` and the keys are turon-one's too. Use a separate folder, e.g. `~/turon-dryrun`.

### D1. Seed dummy data in turon-one

Use addresses on a domain nobody owns for mail (e.g. `dryrun1@example.com` … `dryrun3@example.com`) and one test password, recorded in the dry-run notes, not in chat.

1. Sign up two accounts through the app on the test URL (https://turon-one-mun.vercel.app) so `auth.users`, `auth.identities` and `public.users` are filled the normal way. Confirm them in the dashboard (Authentication → Users) since email may not send.
2. Make the first one SG: `INSERT INTO admin_users (…) VALUES (…, 'sg', …)`.
3. Add a Season 7 row to `seasons` (not current) next to Season 8 (current), then insert:
   - one **Season 7** application and one **Season 8** application for account 2, each with an uploaded file (upload through the app so a public URL is saved);
   - a `participations` row: account 2, `role = 'delegate'`, `season = 7`;
   - one committee with an image, one resource file;
   - one Debate registration;
   - one `telegram_outbox` row and one `activity_log` row (must **not** survive);
   - one answered and one unanswered `contact_messages` row.
4. Note every dummy id and the row counts.

### D2. Export

Run step 1 (check) and step 3 (export) against turon-one exactly as written. Run the storage script with the "download" half only (or let it upload to the same paths; harmless).

Expected: `applications.csv` has the Season 8 row only; `contact_messages.csv` has one row; no telegram/activity files.

### D3. Simulate an empty target

Run step 4a (truncate + delete from `auth.*`) on turon-one, then delete the dummy files from the three buckets. Check: sign-in with dummy account 2 now fails.

### D4. Import and fix up

Run steps 4b–4d, 5 and 6 as written. For the URL rewrite, rewrite a fake host instead: before D2, `UPDATE` one saved URL to use `old-ref.supabase.co`, and in step 6 replace `old-ref` with the turon-one ref. That exercises the rewrite query.

### D5. Verify

All must hold:

- [ ] Dummy accounts have the **same `id`** as noted in D1.
- [ ] Sign-in with the **unchanged password** works for both accounts on the test URL (the old browser session is gone, matching the "sign in once more" behaviour after migrating projects).
- [ ] Account 1 opens the admin panel as SG.
- [ ] Season 8 application exists with its **original fee** (the insert guard did not recompute it); Season 7 application does **not** exist.
- [ ] `is_returning_delegate()` is true for account 2 (signed in), i.e. the participations copy works.
- [ ] Uploaded files open from their saved URLs; no URL still contains `old-ref`.
- [ ] `telegram_outbox`, `activity_log` empty; only the unanswered contact message is there.
- [ ] FK orphan checks return 0; a new test application gets a fresh id (sequences OK).
- [ ] `public.users` has exactly one row per auth user (the `auth.users` trigger did not double-insert).

### D6. Clean up

Delete the dummy accounts (Authentication → Users), dummy rows, dummy files and the Season 7 row; restore Season 8 as the only `seasons` row (or restore the backup). Delete `~/turon-dryrun`. Write down anything that needed fixing and correct this runbook before the real run.
