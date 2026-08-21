import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Captures the demo screenshot set from a deployed site.
 *
 *   npm run demo:shots -- https://demo-grocer.pwestudio.site
 *
 * Headless Chrome driven over the DevTools protocol, because half the shots
 * are states you cannot reach with a URL — the QR handoff, the shopping list,
 * the attract screen after ninety idle seconds. Output lands in
 * .generated/shots/ at real device sizes, ready to drop into a deck.
 */
const BASE = (process.argv[2] ?? 'https://demo-grocer.pwestudio.site').replace(/\/$/, '');
const OUT = join(process.cwd(), '.generated', 'shots');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9222;

type Shot = {
  name: string;
  path: string;
  width: number;
  height: number;
  /** Runs in the page before the shot; return when the state is ready. */
  prepare?: string;
  /** Extra settle time in ms after `prepare`. */
  settle?: number;
};

const shots: Shot[] = [
  { name: '01-kiosk-table', path: '/?kiosk=1', width: 1080, height: 1920 },
  {
    name: '02-kiosk-handoff-qr',
    path: '/?kiosk=1',
    width: 1080,
    height: 1920,
    prepare: `document.querySelector('.handoff-action').click()`,
    settle: 600,
  },
  {
    name: '03-kiosk-shopping-list',
    path: '/?kiosk=1',
    width: 1080,
    height: 1920,
    prepare: `[...document.querySelectorAll('.menu-actions button')].find(b=>b.querySelector('svg'))?.click()`,
    settle: 600,
  },
  { name: '04-desktop', path: '/', width: 1512, height: 982 },
  { name: '05-desktop-occasion', path: '/?occasion=cny', width: 1512, height: 982 },
  { name: '06-phone', path: '/?src=qr', width: 390, height: 844 },
  {
    name: '07-phone-shopping-list',
    path: '/?src=qr',
    width: 390,
    height: 844,
    prepare: `[...document.querySelectorAll('.menu-actions button')][0]?.click()`,
    settle: 600,
  },
  {
    name: '08-phone-recipe',
    path: '/?src=qr',
    width: 390,
    height: 844,
    prepare: `document.querySelector('.dish-card')?.click()`,
    settle: 900,
  },
  {
    name: '10-kiosk-route-map',
    path: '/?kiosk=1',
    width: 1080,
    height: 1920,
    prepare: `(async()=>{[...document.querySelectorAll('.menu-actions button')][0]?.click();
      await new Promise(r=>setTimeout(r,600));
      [...document.querySelectorAll('button')].find(b=>/路线|route/i.test(b.textContent||''))?.click()})()`,
    settle: 1600,
  },
  {
    name: '09-phone-route',
    path: '/?src=qr',
    width: 390,
    height: 844,
    prepare: `(async()=>{[...document.querySelectorAll('.menu-actions button')][0]?.click();
      await new Promise(r=>setTimeout(r,500));
      [...document.querySelectorAll('button')].find(b=>/路线|route/i.test(b.textContent||''))?.click()})()`,
    settle: 1400,
  },
];

mkdirSync(OUT, { recursive: true });
const profile = join(OUT, '.chrome-profile');
const chrome = spawn(
  CHROME,
  [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function endpoint() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return ((await response.json()) as { webSocketDebuggerUrl: string }).webSocketDebuggerUrl;
    } catch {
      await sleep(250);
    }
  }
  throw new Error('Chrome did not open a debugging port');
}

/** Minimal DevTools client over Node's built-in WebSocket. */
class Devtools {
  private socket: WebSocket;
  private id = 0;
  private pending = new Map<number, (value: Record<string, unknown>) => void>();
  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String((event as MessageEvent).data));
      if (message.id && this.pending.has(message.id)) {
        this.pending.get(message.id)!(message.result ?? {});
        this.pending.delete(message.id);
      }
    });
  }
  static async open(url: string) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    return new Devtools(socket);
  }
  send(method: string, params: Record<string, unknown> = {}, sessionId?: string) {
    const id = (this.id += 1);
    return new Promise<Record<string, unknown>>((resolve) => {
      this.pending.set(id, resolve);
      this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  close() {
    this.socket.close();
  }
}

const client = await Devtools.open(await endpoint());
const { targetId } = (await client.send('Target.createTarget', { url: 'about:blank' })) as {
  targetId: string;
};
const { sessionId } = (await client.send('Target.attachToTarget', {
  targetId,
  flatten: true,
})) as { sessionId: string };

const written: string[] = [];
for (const shot of shots) {
  await client.send(
    'Emulation.setDeviceMetricsOverride',
    { width: shot.width, height: shot.height, deviceScaleFactor: 2, mobile: shot.width < 700 },
    sessionId,
  );
  await client.send('Page.navigate', { url: `${BASE}${shot.path}` }, sessionId);
  // The catalogue payload and the dish photos both land after first paint.
  await sleep(4500);
  if (shot.prepare) {
    await client.send(
      'Runtime.evaluate',
      { expression: shot.prepare, awaitPromise: false },
      sessionId,
    );
    await sleep(shot.settle ?? 500);
  }
  const result = (await client.send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: false },
    sessionId,
  )) as { data?: string };
  if (!result.data) {
    console.error(`  ${shot.name}: no image returned`);
    continue;
  }
  const file = join(OUT, `${shot.name}.png`);
  writeFileSync(file, Buffer.from(result.data, 'base64'));
  written.push(`${shot.name}.png (${shot.width}×${shot.height})`);
  console.log(`  ${shot.name}.png`);
}

client.close();
chrome.kill();
console.log(JSON.stringify({ base: BASE, out: '.generated/shots', shots: written }, null, 2));
