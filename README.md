# Turon — ecosystem for you(th)

Websites for **Turon**, a student-led youth ecosystem in Fergana, Uzbekistan. Domain: **turon.one** (currently in testing).

One Vercel project (`turon-website`) serves everything; `middleware.js` picks the site by hostname.

| Folder | What | Test URL |
| --- | --- | --- |
| `apps/hub` | Hub homepage (static HTML/CSS/JS, UZ/EN) | https://turon-website-roan.vercel.app |
| `apps/mun` | TuronMUN + Turon Debate + admin + chair (React/Vite/Supabase) | https://turon-one-mun.vercel.app |

`apps/mun` is a git subtree of [SoleSergeant/turonmun](https://github.com/SoleSergeant/turonmun), pointed at its own Supabase project (`turon-one`). The turonmun repo itself is never modified from here; code is copied in when needed.

## Run locally

```sh
# hub
python -m http.server 5173 --directory apps/hub

# MUN / Debate app (needs apps/mun/.env, see apps/mun/.env.example)
cd apps/mun && npm ci && npm run dev
```

On the test URL, add `?subdomain=admin`, `?subdomain=chair` or `?subdomain=debate` to open that part of the MUN app; `?subdomain=none` goes back. The Debate site is also at `/debat`.

## Deploy

Push to `main`: Vercel runs `npm run build` (MUN app build + `scripts/assemble.mjs`) and deploys both.

See `CLAUDE.md` for the full setup, the database notes and the go-live checklist.
