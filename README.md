# Turon — ecosystem for you(th)

Websites for **Turon**, a student-led youth ecosystem in Fergana, Uzbekistan. Domain: **turon.one** (currently in testing).

| Folder | What | Vercel project | Test URL |
| --- | --- | --- | --- |
| `apps/hub` | Hub homepage (static HTML/CSS/JS, UZ/EN) | `turon-website` | https://turon-website-roan.vercel.app |
| `apps/mun` | TuronMUN + Turon Debate + admin + chair (React/Vite/Supabase) | `turon-mun` | https://turon-mun.vercel.app |

`apps/mun` is a git subtree of [SoleSergeant/turonmun](https://github.com/SoleSergeant/turonmun), pointed at its own Supabase project (`turon-one`). turonmun.com is a separate deployment and is not affected by this repo.

## Run locally

```sh
# hub
python -m http.server 5173 --directory apps/hub

# MUN / Debate app (needs apps/mun/.env, see apps/mun/.env.example)
cd apps/mun && npm ci && npm run dev
```

On the test URL, add `?subdomain=admin`, `?subdomain=chair` or `?subdomain=debate` to open that part of the MUN app; `?subdomain=none` goes back. The Debate site is also at `/debat`.

## Deploy

Push to `main`: Vercel builds whichever app changed.

See `CLAUDE.md` for the full setup, the database notes and the go-live checklist.
