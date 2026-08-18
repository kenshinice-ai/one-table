/**
 * Client side of the anonymous usage beacon.
 *
 * Each event fires at most once per browser session — the point is to count
 * sessions that reached a milestone (scanned in, composed, opened the list,
 * saved a route), never to trace a path through the app. The throttle lives in
 * sessionStorage so the guarantee holds across re-renders without any state.
 */
export type BeaconEvent = 'scan' | 'compose' | 'list' | 'route' | 'kiosk' | 'handoff';

/**
 * A kiosk serves one customer after another from a single browser session, so
 * the attract screen clears the throttle: the next person's compose is their
 * own, not a repeat of the last person's.
 */
export function resetSession() {
  try {
    for (const event of ['scan', 'compose', 'list', 'route', 'kiosk', 'handoff'])
      sessionStorage.removeItem(`onetable.beacon.${event}`);
  } catch {
    // Private browsing; the counts were never being recorded anyway.
  }
}

export function track(event: BeaconEvent) {
  try {
    const key = `onetable.beacon.${event}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    navigator.sendBeacon('/api/v1/beacon', JSON.stringify({ event }));
  } catch {
    // Private browsing can refuse sessionStorage; losing a count is fine.
  }
}
