# Turon — ecosystem for you(th)

The hub website for **Turon**, a student-led youth ecosystem in Fergana, Uzbekistan: **TuronMUN**, **Turon Debate** and **Vibe Turon**.

A static site with no build step. Uzbek (Latin) is the default; English comes from the UZ/EN switch.

## Run locally

```sh
python -m http.server 5173
# open http://localhost:5173
```

## Structure

| Path | What |
| --- | --- |
| `index.html` | Homepage (Uzbek copy in the markup) |
| `assets/styles.css` | All styles; brand tokens in `:root` |
| `assets/app.js` | Language switch (English strings) and mobile menu |
| `404.html` | Not-found page |
| `vercel.json` | Security headers (CSP, HSTS, etc.) for Vercel |
| `.well-known/security.txt` | Security contact |
| `designs/` | Archived design explorations (not linked) |

## Brand

- Navy `#283480` (base) · TuronMUN gold `#F6A81C` (accent; on navy only)
- Project accents: TuronMUN gold · Turon Debate red `#C92A2A` · Vibe Turon violet `#6741D9`
- Fonts: Unbounded (display), Inter (text)

## Security

- Strict Content-Security-Policy: no inline scripts or styles, `script-src 'self'`.
- Translations are applied with `textContent`, and the language value is allow-listed.
- No forms, cookies or third-party trackers.

See `CLAUDE.md` for project notes, sourced facts and the remaining placeholders.
