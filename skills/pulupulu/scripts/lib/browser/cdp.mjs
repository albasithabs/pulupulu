import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

const CANDIDATES = {
  win32: () => {
    const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA,
      'C:\\Program Files', 'C:\\Program Files (x86)'].filter(Boolean);
    const rel = [
      'Google\\Chrome\\Application\\chrome.exe',
      'Microsoft\\Edge\\Application\\msedge.exe',
      'Chromium\\Application\\chrome.exe',
      'BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    ];
    return rel.flatMap((r) => roots.map((root) => join(root, r)));
  },
  darwin: () => [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ],
  linux: () => [
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
    '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable',
  ],
};

const PATH_NAMES = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'microsoft-edge-stable', 'chrome', 'msedge'];

export function findBrowser() {
  const env = process.env.PULUPULU_BROWSER;
  if (env && existsSync(env)) return env;
  const list = (CANDIDATES[process.platform] || CANDIDATES.linux)();
  for (const p of list) if (existsSync(p)) return p;
  const exts = process.platform === 'win32' ? ['.exe', ''] : [''];
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    if (!dir) continue;
    for (const name of PATH_NAMES) {
      for (const ext of exts) {
        const p = join(dir, name + ext);
        if (existsSync(p)) return p;
      }
    }
  }
  return null;
}

// Browsers still alive, so an abrupt exit of the Node process does not leave
// headless Chrome running in the background with a locked temp profile.
const live = new Set();
let hooksInstalled = false;

function killTree(child) {
  if (!child || child.exitCode !== null || child.signalCode) return;
  try {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else child.kill('SIGKILL');
  } catch {
    // already gone
  }
}

function cleanupAllSync() {
  for (const b of live) {
    killTree(b.child);
    try {
      rmSync(b.userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // profile still locked; the OS temp cleaner gets it
    }
  }
  live.clear();
}

function onSignal(sig) {
  cleanupAllSync();
  removeHooks();
  if (process.listenerCount(sig) === 0) process.exit(sig === 'SIGINT' ? 130 : 143);
}
const sigint = () => onSignal('SIGINT');
const sigterm = () => onSignal('SIGTERM');

function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;
  process.on('exit', cleanupAllSync);
  process.on('SIGINT', sigint);
  process.on('SIGTERM', sigterm);
}

function removeHooks() {
  if (!hooksInstalled || live.size) return;
  hooksInstalled = false;
  process.off('exit', cleanupAllSync);
  process.off('SIGINT', sigint);
  process.off('SIGTERM', sigterm);
}

export async function launchBrowser({ path = findBrowser(), headless = true, timeoutMs = 20000 } = {}) {
  if (typeof globalThis.WebSocket !== 'function') {
    throw new Error(`pulupulu: browser checks need Node 22 or newer (global WebSocket). This is Node ${process.versions.node}.`);
  }
  if (!path) throw new Error('pulupulu: no Chrome, Edge, or Chromium found. Set PULUPULU_BROWSER to the browser executable.');

  const userDataDir = mkdtempSync(join(tmpdir(), 'pulupulu-chrome-'));
  const args = [
    headless ? '--headless=new' : null,
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu',
    '--hide-scrollbars', '--mute-audio', '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--disable-breakpad', '--disable-default-apps', '--password-store=basic',
    'about:blank',
  ].filter(Boolean);

  const child = spawn(path, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
  const record = { child, userDataDir };
  live.add(record);
  installHooks();

  let wsUrl;
  try {
    wsUrl = await new Promise((resolve, reject) => {
      let buf = '';
      const timer = setTimeout(() => reject(new Error(`pulupulu: browser did not start within ${timeoutMs}ms`)), timeoutMs);
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (chunk) => {
        buf += chunk;
        const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
        if (m) {
          clearTimeout(timer);
          resolve(m[1]);
        }
        if (buf.length > 65536) buf = buf.slice(-4096);
      });
      child.once('error', (err) => {
        clearTimeout(timer);
        reject(new Error(`pulupulu: could not start ${path}: ${err.message}`));
      });
      child.once('exit', (code) => {
        clearTimeout(timer);
        reject(new Error(`pulupulu: browser exited early (code ${code}). ${buf.trim().split('\n').slice(-3).join(' ')}`));
      });
    });
  } catch (err) {
    await disposeRecord(record);
    throw err;
  }
  child.stderr.resume();

  let client;
  try {
    client = await CdpClient.connect(wsUrl);
  } catch (err) {
    await disposeRecord(record);
    throw err;
  }

  let closed = false;
  return {
    path,
    wsUrl,
    client,
    userDataDir,
    process: child,
    async newPage() {
      const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
      return {
        targetId,
        sessionId,
        send: (method, params, opts) => client.send(method, params, { ...opts, sessionId }),
        on: (method, handler) => client.on(method, handler, sessionId),
        waitFor: (method, ms, predicate) => client.waitFor(method, ms, sessionId, predicate),
        close: () => client.send('Target.closeTarget', { targetId }, { timeoutMs: 5000 }).catch(() => {}),
      };
    },
    async close() {
      if (closed) return;
      closed = true;
      try {
        await client.send('Browser.close', {}, { timeoutMs: 2000 });
      } catch {
        // falls through to the kill
      }
      await disposeRecord(record);
      client.dispose();
    },
  };
}

async function disposeRecord(record) {
  const { child } = record;
  if (child.exitCode === null && !child.signalCode) {
    const exited = new Promise((r) => child.once('exit', r));
    const waited = await Promise.race([exited.then(() => true), sleep(5000).then(() => false)]);
    if (!waited) {
      killTree(child);
      await Promise.race([exited, sleep(10000)]);
    }
  }
  // Windows keeps profile files locked until the child processes finish
  // exiting, which can take several seconds after the main process is gone.
  const deadline = Date.now() + 10000;
  while (existsSync(record.userDataDir) && Date.now() < deadline) {
    try {
      await rm(record.userDataDir, { recursive: true, force: true });
    } catch {
      await sleep(250);
    }
  }
  live.delete(record);
  removeHooks();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class CdpClient {
  static connect(wsUrl, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      const timer = setTimeout(() => {
        try { ws.close(); } catch { /* ignore */ }
        reject(new Error('pulupulu: DevTools connection timed out'));
      }, timeoutMs);
      ws.addEventListener('open', () => {
        clearTimeout(timer);
        resolve(new CdpClient(ws));
      }, { once: true });
      ws.addEventListener('error', () => {
        clearTimeout(timer);
        reject(new Error('pulupulu: could not connect to DevTools'));
      }, { once: true });
    });
  }

  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.closed = false;
    ws.addEventListener('message', (ev) => this.#onMessage(ev.data));
    ws.addEventListener('close', () => this.#failAll(new Error('pulupulu: DevTools connection closed')));
  }

  #onMessage(data) {
    let msg;
    try {
      msg = JSON.parse(typeof data === 'string' ? data : Buffer.from(data).toString('utf8'));
    } catch {
      return;
    }
    if (msg.id !== undefined) {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`));
      else p.resolve(msg.result || {});
      return;
    }
    const set = this.listeners.get(msg.method);
    if (!set) return;
    for (const l of [...set]) {
      if (l.sessionId !== undefined && l.sessionId !== msg.sessionId) continue;
      try {
        l.handler(msg.params || {}, msg.sessionId);
      } catch {
        // a listener bug must not break the message pump
      }
    }
  }

  #failAll(err) {
    this.closed = true;
    for (const p of this.pending.values()) {
      clearTimeout(p.timer);
      p.reject(err);
    }
    this.pending.clear();
  }

  send(method, params = {}, { sessionId, timeoutMs = 15000 } = {}) {
    if (this.closed) return Promise.reject(new Error(`${method}: DevTools connection closed`));
    const id = this.nextId++;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method}: timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer, method });
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(err);
      }
    });
  }

  on(method, handler, sessionId) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    const entry = { handler, sessionId };
    this.listeners.get(method).add(entry);
    return () => this.listeners.get(method)?.delete(entry);
  }

  waitFor(method, timeoutMs, sessionId, predicate = () => true) {
    return new Promise((resolve, reject) => {
      const off = this.on(method, (params) => {
        if (!predicate(params)) return;
        clearTimeout(timer);
        off();
        resolve(params);
      }, sessionId);
      const timer = setTimeout(() => {
        off();
        reject(new Error(`${method}: not received within ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  dispose() {
    this.#failAll(new Error('pulupulu: DevTools client disposed'));
    try {
      this.ws.close();
    } catch {
      // already closed
    }
  }
}
