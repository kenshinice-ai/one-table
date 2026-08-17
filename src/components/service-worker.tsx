'use client';

import { useEffect } from 'react';

/**
 * Registers the offline cache after the page is interactive, so it never
 * competes with the catalogue payloads for bandwidth on a first visit.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // Development assets are not content-hashed the way built ones are, so a
    // cache-first worker would keep serving yesterday's CSS.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => registration.unregister()))
        .catch(() => undefined);
      return;
    }
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Offline cache unavailable', error);
      });
    };
    if (document.readyState === 'complete') {
      register();
      return;
    }
    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
