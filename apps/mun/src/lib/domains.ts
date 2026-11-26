/**
 * Public addresses of the four sites this app serves. Set per deployment with
 * VITE_* env vars; the defaults are the live turonmun.com addresses.
 *
 * turon.one (test, then production):
 *   VITE_SITE_URL=https://mun.turon.one   VITE_ADMIN_URL=https://admin.turon.one
 *   VITE_CHAIR_URL=https://chair.turon.one VITE_DEBATE_URL=https://debat.turon.one
 */
const env = import.meta.env as Record<string, string | undefined>;
const clean = (v: string | undefined, fallback: string) => (v && /^https:\/\//.test(v) ? v.replace(/\/+$/, '') : fallback);

export const SITE_URL = clean(env.VITE_SITE_URL, 'https://www.turonmun.com');
export const ADMIN_URL = clean(env.VITE_ADMIN_URL, 'https://admin.turonmun.com');
export const CHAIR_URL = clean(env.VITE_CHAIR_URL, 'https://chair.turonmun.com');
export const DEBATE_URL = clean(env.VITE_DEBATE_URL, 'https://debat.turonmun.com');
/** Turon ecosystem hub (turon.one). */
export const HUB_URL = clean(env.VITE_HUB_URL, 'https://turon.one');
