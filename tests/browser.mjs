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
page.on('request', (request) => {
  if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== base) remoteRequests.push(request.url());
});
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  // The dev server's HMR socket is not part of the page; production has no socket.
  if (message.type() === 'error' && !/WebSocket|hmr/.test(message.text())) errors.push(message.text());
});

const response = await page.goto(base);
const html = await response.text();
assert.ok(html.includes('Make only'), 'hero headline is server-rendered');
assert.ok(html.includes('Twenty-four tools.'), 'the tool index is server-rendered');
await page.locator('[data-language="en"]').waitFor();
await page.evaluate(() => document.fonts.ready);

// Section order and anchors follow the design frame: 00 nav … 11 answers.
const order = ['#top', '#intent', '#three-d', '#plan', '#connection', '#tools', '#canvas', '#install', '#skills', '#support', '#faq'];
const tops = [];
for (const selector of order) {
  assert.equal(await page.locator(selector).count(), 1, selector);
  tops.push(await page.locator(selector).evaluate((el) => el.getBoundingClientRect().top + window.scrollY));
}
for (let index = 1; index < tops.length; index++) assert.ok(tops[index] > tops[index - 1], `${order[index]} must follow ${order[index - 1]}`);

// The intent table links each route to a real section instead of a dead anchor.
const routeLinks = await page.locator('.intent-link').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
assert.deepEqual(routeLinks, ['#three-d', '#plan', '#plan', '#canvas']);
for (const href of routeLinks) assert.equal(await page.locator(href).count(), 1, href);

// The sticky claims: 24 tools, grouped and counted, with no invented names.
const toolRows = await page.locator('.tool-row').count();
assert.equal(toolRows, 8);
const toolNames = await page.locator('.tool-names code').allTextContents();
assert.equal(toolNames.length, 24);
assert.equal(new Set(toolNames).size, 24);
for (const expected of ['publish_3d_asset', 'review_ui', 'prepare_web_handoff', 'serve']) assert.ok(toolNames.includes(expected), expected);
const counts = await page.locator('.tool-row .tool-count .num').allTextContents();
assert.deepEqual(counts.map((value) => value.trim()), ['02', '08', '04', '02', '04', '02', '01', '01']);

// Six client choices; real command rendering, focus preservation and clipboard buffer.
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
for (const client of ['opencode', 'claude', 'codex', 'antigravity', 'copilot', 'zed']) {
  const button = page.locator(`[data-client="${client}"]`);
  await button.click();
  assert.equal(await button.getAttribute('aria-pressed'), 'true');
  assert.ok(await button.evaluate((el) => el === document.activeElement));
  const command = await page.getByTestId('install-command').textContent();
  assert.ok(command.includes(`--client ${client}`));
  assert.equal(command.includes('--global'), client === 'zed');
  await page.locator('.install-top').getByRole('button', { name: 'Copy command' }).click();
  await page.locator('.install-top').getByRole('status').filter({ hasText: 'Command copied.' }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), command);
}

// Clipboard denial degrades to a visible, selectable command.
await page.locator('[data-client="opencode"]').click();
await page.waitForFunction(() => !document.querySelector('.install-top [role="status"]').textContent.includes('Command copied'));
await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: () => Promise.reject(new Error('denied for QA')) }));
await page.locator('.install-top').getByRole('button', { name: 'Copy command' }).click();
await page.locator('.install-top').getByRole('status').filter({ hasText: 'copy it manually' }).waitFor();
assert.equal(await page.locator('#install .terminal-body pre').first().getAttribute('tabindex'), '0');
assert.equal(await page.locator('#upgrade pre').getAttribute('tabindex'), '0');

// Real crawlable locale links: URL is authoritative; metadata follows navigation.
await page.evaluate(() => localStorage.setItem('awsm-language', 'id'));
await page.goto(`${base}/#faq`);
await page.getByRole('link', { name: 'ID', exact: true }).click();
await page.waitForURL(`${base}/id#faq`);
assert.equal(await page.locator('html').getAttribute('lang'), 'id');
assert.ok((await page.locator('h1').textContent()).includes('Buat hanya'));
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
assert.ok(await page.locator('.menu-toggle').evaluate((el) => el === document.activeElement));
await page.locator('.menu-toggle').click();
await page.locator('#mobile-menu a[href="#install"]').click();
await page.locator('#mobile-menu').waitFor({ state: 'detached' });
assert.ok(page.url().endsWith('#install'));

// Honest outbound destinations, no donation is submitted.
const destinations = await page.locator('a[href^="https:"]').evaluateAll((els) => els.map((el) => el.href));
for (const expected of [
  'https://getartcraft.com/apps/figcraft',
  'https://saweria.co/arkids',
  'https://github.com/rikoarik/artcraft-mcp-awsm',
  'https://github.com/rikoarik/artcraft-mcp-awsm/issues',
  'https://github.com/rikoarik/artcraft-mcp-awsm/blob/main/LICENSE',
]) assert.ok(destinations.includes(expected), expected);
assert.ok(!destinations.some((url) => url.includes('figcraft-mcp-awsm')), 'no link may point at the retired repository');
assert.equal(destinations.filter((url) => url === 'https://saweria.co/arkids').length, 1);
assert.equal(await page.locator('a[href="#"]').count(), 0);

// All requested viewports and languages, full page overflow, every image decoded.
const matrix = [[1440, 1000], [1280, 800], [768, 1024], [375, 812], [320, 812]];
const results = [];
for (const [width, height] of matrix) {
  await page.setViewportSize({ width, height });
  for (const lang of ['en', 'id']) {
    await page.goto(`${base}${lang === 'id' ? '/id' : '/'}`);
    await page.locator(`[data-language="${lang}"]`).waitFor();
    assert.equal(await page.locator('.support a').count(), 1);
    assert.equal(await page.locator('.support a').getAttribute('href'), 'https://saweria.co/arkids');
    assert.ok((await page.locator('.support a').textContent()).includes('saweria.co/arkids'));
    assert.ok(!/Choose your payment method|Pilih metode pembayaran/.test(await page.locator('.support').textContent()));
    await page.evaluate(() => document.fonts.ready);
    // Images below the fold are intentionally lazy; walk the page so each one is
    // requested, then assert that all of them actually decoded.
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 60)));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0), null, { timeout: 20000 });
    const dimensions = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
    assert.ok(dimensions.content <= dimensions.width + 1, `Overflow at ${width} ${lang}: ${JSON.stringify(dimensions)}`);
    const heading = await page.locator('h1').boundingBox();
    assert.ok(heading.x >= 0 && heading.x + heading.width <= width);
    // Display headings must stay on the line the design gives them.
    const wrapped = await page.evaluate(() =>
      [...document.querySelectorAll('.display')]
        .filter((h) => [...h.querySelectorAll('span')].some((span) => {
          const range = document.createRange();
          range.selectNodeContents(span);
          return range.getClientRects().length > 1;
        }))
        .map((h) => h.textContent.trim().slice(0, 40)),
    );
    assert.deepEqual(wrapped, [], `display lines wrapped at ${width} ${lang}`);
    if (width !== 320) await page.screenshot({ path: `qa/hero-${width}-${lang}.png` });
    results.push({ width, height, lang, overflow: false, imageLoaded: true, displayLines: 'single' });
  }
}

// Native reduced motion tears the smooth scroller down and leaves no reveal opacity.
await page.setViewportSize({ width: 1440, height: 1000 });
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(`${base}/`);
await page.locator('[data-language="en"]').waitFor();
assert.equal(await page.locator('html').evaluate((el) => el.classList.contains('lenis')), false);
assert.equal(await page.locator('.reveal').count(), 0);
for (const [section, name] of [['#intent', 'intent'], ['#three-d', 'three-d'], ['#plan', 'plan'], ['#connection', 'connection'], ['#tools', 'tools'], ['#canvas', 'canvas'], ['#install', 'install'], ['#skills', 'skills'], ['.support', 'support']]) {
  await page.locator(section).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `qa/section-${name}-desktop.png` });
}
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(`${base}/id`);
await page.locator('[data-language="id"]').waitFor();
await page.screenshot({ path: 'qa/reduced-mobile-id.png' });
for (const [section, name] of [['#plan', 'plan'], ['#install', 'install'], ['#tools', 'tools']]) {
  await page.locator(section).evaluate((el) => window.scrollTo(0, el.offsetTop));
  await page.screenshot({ path: `qa/${name}-mobile-id.png` });
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
    await page.locator('#faq').evaluate((el) => window.scrollTo(0, el.offsetTop));
    await page.screenshot({ path: `qa/seo-facts-${size}-${lang}.png` });
    await page.locator('.faq').evaluate((el) => window.scrollTo(0, el.offsetTop - 24));
    await page.screenshot({ path: `qa/seo-faq-${size}-${lang}.png` });
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#faq details').first().getAttribute('open'), null);
  }
}

// Reduced motion is a live preference: Lenis comes back and leaves again.
await page.emulateMedia({ reducedMotion: 'no-preference' });
await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.waitForFunction(() => !document.documentElement.classList.contains('lenis'));

assert.deepEqual(errors, []);
assert.deepEqual(remoteRequests, []);
await fs.writeFile('qa/results.json', JSON.stringify({
  base,
  matrix: results,
  checks: [
    'SSR hero and tool index',
    'section order 00–11',
    'intent routes resolve to sections',
    '24 unique tools in 8 counted groups',
    'all six client commands + clipboard success and denial',
    'canonical EN/ID document navigation + hash',
    'URL overrides stored preference',
    'mobile menu + Escape + anchor',
    'outbound links (renamed repository)',
    'no overflow at five widths',
    'no wrapped display lines',
    'all images decoded',
    'dynamic reduced motion',
    'no runtime remote requests',
    'no page or console errors',
  ],
  errors,
  remoteRequests,
}, null, 2));
await browser.close();
console.log('PASS: browser matrix and all interaction checks. Evidence: qa/results.json');
