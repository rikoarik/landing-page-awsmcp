import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.QA_URL || 'http://localhost:3001';
await fs.mkdir('qa', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
const remoteRequests = [];
page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== base) remoteRequests.push(request.url()); });
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const response = await page.goto(base);
const html = await response.text();
assert.ok(html.includes('Good code.'));
assert.ok(html.includes('Install AWSM'));
await page.locator('[data-language="en"]').waitFor();
await page.evaluate(() => document.fonts.ready);

// Six client choices; real command rendering, focus preservation and clipboard buffer.
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
for (const client of ['opencode', 'claude', 'codex', 'antigravity', 'copilot', 'zed']) {
  const button = page.locator(`[data-client="${client}"]`);
  await button.click();
  assert.equal(await button.getAttribute('aria-pressed'), 'true');
  assert.ok(await button.evaluate(el => el === document.activeElement));
  const command = await page.getByTestId('install-command').textContent();
  assert.ok(command.includes(`--client ${client}`));
  assert.equal(command.includes('--global'), client === 'zed');
  await page.getByRole('button', { name: 'Copy command' }).click();
  await page.getByRole('status').filter({ hasText: 'Command copied.' }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), command);
}
await page.locator('[data-client="opencode"]').click();
await page.waitForFunction(() => !document.querySelector('[role="status"]').textContent.includes('Command copied'));
await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: () => Promise.reject(new Error('denied for QA')) }));
await page.getByRole('button', { name: 'Copy command' }).click();
await page.getByRole('status').filter({ hasText: 'copy it manually' }).waitFor();
assert.equal(await page.locator('.command-box pre').getAttribute('tabindex'), '0');

// Tabs: keyboard automatic activation, relationships, and full set of tool panels.
await page.locator('#tool-tab-1').focus();
await page.keyboard.press('ArrowLeft');
await page.locator('[data-tool-panel="0"]').waitFor();
assert.equal(await page.locator('#tool-tab-0').getAttribute('aria-selected'), 'true');
await page.keyboard.press('End');
await page.locator('[data-tool-panel="3"]').waitFor();
assert.equal(await page.locator('#tool-tab-3').getAttribute('aria-selected'), 'true');
for (let i = 0; i < 4; i++) { await page.locator(`#tool-tab-${i}`).click(); await page.locator(`[data-tool-panel="${i}"]`).waitFor(); }
await page.locator('#tool-tab-1').click();
await page.locator('[data-tool-panel="1"]').waitFor();

// Real crawlable locale links: URL is authoritative; metadata follows navigation.
await page.evaluate(() => { localStorage.setItem('awsm-language', 'id'); });
await page.goto(`${base}/#faq`);
await page.getByRole('link', { name: 'ID', exact: true }).click();
await page.waitForURL(`${base}/id#faq`);
assert.equal(await page.locator('html').getAttribute('lang'), 'id');
assert.ok((await page.locator('h1').textContent()).includes('Kode rapi.'));
assert.ok((await page.title()).includes('MCP lokal'));
await page.reload();
await page.locator('[data-language="id"]').waitFor();
await page.goto(base);
await page.locator('[data-language="en"]').waitFor();
await page.goto(`${base}/id`);

// Mobile navigation: expansion, Escape focus return, and real anchor close.
await page.setViewportSize({ width: 375, height: 812 });
await page.getByRole('button', { name: 'Menu', exact: true }).click();
await page.locator('#mobile-menu').waitFor();
assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
await page.keyboard.press('Escape');
await page.locator('#mobile-menu').waitFor({ state: 'detached' });
assert.ok(await page.locator('.menu-toggle').evaluate(el => el === document.activeElement));
await page.locator('.menu-toggle').click();
await page.locator('#mobile-menu').getByRole('link', { name: 'Pasang', exact: false }).click();
await page.locator('#mobile-menu').waitFor({ state: 'detached' });
assert.ok(page.url().endsWith('#install'));

// Honest outbound destinations, no donation is submitted.
const destinations = await page.locator('a[href^="https:"]').evaluateAll(els => els.map(el => el.href));
for (const expected of ['https://getartcraft.com/apps/figcraft', 'https://saweria.co/arkids', 'https://github.com/rikoarik/figcraft-mcp-awsm', 'https://github.com/rikoarik/figcraft-mcp-awsm/issues', 'https://github.com/rikoarik/figcraft-mcp-awsm/blob/main/LICENSE']) assert.ok(destinations.includes(expected), expected);
assert.equal(destinations.filter(url => url === 'https://saweria.co/arkids').length, 1);
assert.equal(await page.locator('a[href="#"]').count(), 0);

// All requested viewports and languages, full page overflow, actual local image.
const matrix = [[1440,1000],[1280,800],[768,1024],[375,812],[320,812]];
const results = [];
for (const [width, height] of matrix) {
  await page.setViewportSize({ width, height });
  for (const lang of ['en','id']) {
    await page.goto(`${base}${lang === 'id' ? '/id' : '/'}`);
    await page.locator(`[data-language="${lang}"]`).waitFor();
    assert.equal(await page.locator('.support a').count(), 1);
    assert.equal(await page.locator('.support a').getAttribute('href'), 'https://saweria.co/arkids');
    assert.equal(await page.locator('.support a').textContent(), lang === 'en' ? 'Trakteer a coffee' : 'Traktir kopi');
    assert.ok(!/QRIS|SAWERIA\.CO\/ARKIDS|Choose your payment method|Pilih metode pembayaran/.test(await page.locator('.support').textContent()));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
    const dimensions = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
    assert.ok(dimensions.content <= dimensions.width + 1, `Overflow at ${width} ${lang}: ${JSON.stringify(dimensions)}`);
    const heading = await page.locator('h1').boundingBox();
    assert.ok(heading.x >= 0 && heading.x + heading.width <= width);
    const imageRatio = await page.locator('.reference-figure img').evaluate(img => img.clientWidth / img.clientHeight);
    assert.ok(Math.abs(imageRatio - 1440/840) < 0.02);
    // Wait for the finite circuit-assembly animation, not arbitrary network idleness.
    await page.waitForFunction(() => [...document.querySelectorAll('.cable')].every(el => !el.style.strokeDasharray));
    if (width !== 320) await page.screenshot({ path: `qa/hero-${width}-${lang}.png` });
    results.push({ width, height, lang, overflow: false, imageLoaded: true });
  }
}

// Native reduced motion dynamically tears down Lenis; no all-page visibility tricks.
await page.setViewportSize({ width: 1440, height: 1000 });
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(`${base}/`);
await page.locator('[data-language="en"]').waitFor();
assert.equal(await page.locator('html').evaluate(el => el.classList.contains('lenis')), false);
for (const [section, name] of [['#workflow','workflow'],['#playground','playground'],['#handoff','handoff'],['#install','install'],['.support','support']]) {
  await page.locator(section).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `qa/section-${name}-desktop.png` });
}
await page.setViewportSize({ width:375,height:812 });
await page.goto(`${base}/id`);
await page.locator('[data-language="id"]').waitFor();
await page.screenshot({ path:'qa/reduced-mobile-id.png' });
await page.locator('#playground').evaluate(el => window.scrollTo(0, el.offsetTop));
await page.screenshot({ path:'qa/playground-mobile-id.png' });
await page.locator('#install').evaluate(el => window.scrollTo(0, el.offsetTop));
await page.screenshot({ path:'qa/install-mobile-id.png' });
for (const [width, height, size] of [[1440, 1000, 'desktop'], [375, 812, 'mobile']]) {
  await page.setViewportSize({ width, height });
  for (const lang of ['en', 'id']) {
    await page.goto(`${base}${lang === 'id' ? '/id' : '/'}`);
    await page.locator(`[data-language="${lang}"]`).waitFor();
    await page.locator('.support').evaluate(el => window.scrollTo(0, el.offsetTop));
    await page.screenshot({ path: `qa/support-${size}-${lang}.png` });
  }
}
// Native FAQs remain keyboard operable at each viewport and locale.
for (const [width, height, size] of [[1440, 1000, 'desktop'], [375, 812, 'mobile']]) {
  await page.setViewportSize({ width, height });
  for (const lang of ['en', 'id']) {
    await page.goto(`${base}${lang === 'id' ? '/id' : '/'}`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('#faq details').count(), 6);
    const summary = page.locator('#faq summary').first();
    await summary.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#faq details').first().getAttribute('open'), '');
    await page.locator('#faq').evaluate(el => window.scrollTo(0, el.offsetTop));
    await page.screenshot({ path: `qa/seo-facts-${size}-${lang}.png` });
    await page.locator('.faq-layout').evaluate(el => window.scrollTo(0, el.offsetTop - 24));
    await page.screenshot({ path: `qa/seo-faq-${size}-${lang}.png` });
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#faq details').first().getAttribute('open'), null);
  }
}
assert.equal(await page.locator('[role="tab"]').evaluateAll(tabs => tabs.every(tab => document.getElementById(tab.getAttribute('aria-controls')))), true);
await page.emulateMedia({ reducedMotion:'no-preference' });
await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
await page.emulateMedia({ reducedMotion:'reduce' });
await page.waitForFunction(() => !document.documentElement.classList.contains('lenis'));
assert.deepEqual(errors, []);
assert.deepEqual(remoteRequests, []);
await fs.writeFile('qa/results.json', JSON.stringify({ base, matrix:results, checks:['SSR', 'all six client commands','clipboard success + denial','tabs keyboard','canonical EN/ID document navigation + hash','URL overrides stored preference','mobile menu + Escape + anchor','outbound links','no overflow','full aspect image','dynamic reduced motion','no runtime remote requests','no page or console errors'], errors, remoteRequests }, null, 2));
await browser.close();
console.log('PASS: browser matrix and all interaction checks. Evidence: qa/results.json');
