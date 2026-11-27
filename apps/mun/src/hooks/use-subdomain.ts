import { useMemo } from 'react';

export type Subdomain = 'admin' | 'chair' | 'debate' | 'vibe' | 'none';

export const useSubdomain = (): Subdomain => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    
    // For local development, treat localhost as 'none' 
    // but allow forced subdomain via query param for testing
    // ?subdomain=admin|chair|debate|vibe is remembered for this browser tab, so the
    // test deployments on *.vercel.app (no real subdomains) keep working after
    // in-app navigation. ?subdomain=none clears it.
    const urlParams = new URLSearchParams(window.location.search);
    const allowed = ['admin', 'chair', 'debate', 'vibe'];
    let forcedSubdomain = urlParams.get('subdomain');
    try {
      if (forcedSubdomain === 'none') sessionStorage.removeItem('forced-subdomain');
      else if (forcedSubdomain && allowed.includes(forcedSubdomain)) sessionStorage.setItem('forced-subdomain', forcedSubdomain);
      else forcedSubdomain = sessionStorage.getItem('forced-subdomain');
    } catch { /* storage blocked */ }
    if (forcedSubdomain && allowed.includes(forcedSubdomain)) {
      return forcedSubdomain as Subdomain;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'none';
    }

    if (hostname.startsWith('admin.')) {
      return 'admin';
    }
    
    if (hostname.startsWith('chair.')) {
      return 'chair';
    }

    // Turon Debate — debat.turonmun.com / debat.turon.one (debate.* works too)
    if (hostname.startsWith('debat.') || hostname.startsWith('debate.')) {
      return 'debate';
    }

    // Vibe Turon — vibe.turon.one
    if (hostname.startsWith('vibe.')) {
      return 'vibe';
    }

    return 'none';
  }, []);
};
