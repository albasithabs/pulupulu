import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { findBrowser, launchBrowser } from '../../skills/pulupulu/scripts/lib/browser/cdp.mjs';

const browser = findBrowser();

describe('cdp', { skip: browser ? false : 'no Chrome, Edge, or Chromium found' }, () => {
  it('evaluates in a flat session and cleans up the process and profile', async () => {
    const b = await launchBrowser({ path: browser });
    let dir;
    try {
      dir = b.userDataDir;
      assert.ok(existsSync(dir));
      const page = await b.newPage();
      assert.ok(page.sessionId);
      const { result } = await page.send('Runtime.evaluate', { expression: '6 * 7', returnByValue: true });
      assert.equal(result.value, 42);
      await assert.rejects(page.send('No.suchMethod'), /No.suchMethod/);
    } finally {
      await b.close();
    }
    assert.notEqual(b.process.exitCode, null, 'browser process still running');
    assert.ok(!existsSync(dir), 'temp profile left behind');
  });
});
