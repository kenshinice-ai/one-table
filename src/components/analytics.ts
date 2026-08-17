/**
 * Client side of the anonymous usage beacon.
 *
 * Each event fires at most once per browser session — the point is to count
 * sessions that reached a milestone (scanned in, composed, opened the list,
 * saved a route), never to trace a path through the app. The throttle lives in
 * sessionStorage so the guarantee holds across re-renders without any state.
 */
export type BeaconEvent = 'scan' | 'compose' | 'list' | 'route';

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
