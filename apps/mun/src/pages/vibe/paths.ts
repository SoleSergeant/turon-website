import { useSubdomain } from '@/hooks/use-subdomain';
import { VIBE_URL } from '@/lib/domains';

/**
 * Vibe Turon lives at the root of vibe.turon.one, and also at /vibe on the
 * main app host (handy on the vercel.app test URL).
 */
export const VIBE_BASE = '/vibe';

/** Public address of the Vibe Turon site (used by admin links). */
export const VIBE_SITE_URL = VIBE_URL;

export function useVibePath() {
  const base = useSubdomain() === 'vibe' ? '' : VIBE_BASE;
  return (path: string) => (path === '/' ? base || '/' : `${base}${path}`);
}
