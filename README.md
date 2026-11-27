# Turon — ecosystem for you(th)

Websites for **Turon**, a student-led youth ecosystem in Fergana, Uzbekistan. Domain: **turon.one** (currently in testing).

One Vercel project (`turon-website`) serves everything; `middleware.js` picks the site by hostname.

| Folder | What | Test URL |
| --- | --- | --- |
| `apps/hub` | Hub homepage (static HTML/CSS/JS, English) | https://turon-website-roan.vercel.app |
| `apps/mun` | TuronMUN + Turon Debate + Vibe Turon + admin + chair (React/Vite/Supabase) | https://turon-website-roan.vercel.app/mun (Debate `/debat`, Vibe Turon `/vibe`) |

`apps/mun` is a git subtree of [SoleSergeant/turonmun](https://github.com/SoleSergeant/turonmun), pointed at its own Supabase project (`turon-one`). The turonmun repo itself is never modified from here; code is copied in when needed.

## Run locally

```sh
# hub
python -m http.server 5173 --directory apps/hub

# MUN / Debate app (needs apps/mun/.env, see apps/mun/.env.example)
cd apps/mun && npm ci && npm run dev
```

On the test address the hub keeps `/` and every other path goes to the MUN app. Open the MUN site at `/mun`, the admin panel at `/mun?subdomain=admin`, the chair site at `/mun?subdomain=chair` (`?subdomain=none` goes back), Turon Debate at `/debat` and Vibe Turon at `/vibe`.

## Deploy

Push to `main`: Vercel runs `npm run build` (MUN app build + `scripts/assemble.mjs`) and deploys both.

See `CLAUDE.md` for the full setup, the database notes and the go-live checklist.
