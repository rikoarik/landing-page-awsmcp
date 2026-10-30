import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const base = process.env.QA_URL || 'http://localhost:3001';
const browser = await chromium.launch();
const results = [];
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const locale of ['en', 'id']) {
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${base}${locale === 'id' ? '/id' : '/'}`);
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      for (let tab = 0; tab < 4; tab++) {
        await page.locator(`#tool-tab-${tab}`).click();
        await page.locator(`[data-tool-panel="${tab}"]`).waitFor();
        const audit = await page.evaluate(async () => {
          const rules = window.axe.getRules().filter(rule => rule.ruleId.startsWith('aria-')).map(rule => rule.ruleId);
          const { violations, incomplete } = await window.axe.run(document, { runOnly: { type: 'rule', values: rules } });
          const summarize = items => items.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }));
          return { violations: summarize(violations), incomplete: summarize(incomplete) };
        });
        results.push({ locale, width, tab, ...audit });
      }
      if (width === 375) {
        await page.locator('.menu-toggle').click();
        await page.locator('#mobile-menu').waitFor();
        const { violations } = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'rule', values: ['aria-allowed-attr', 'aria-prohibited-attr', 'aria-valid-attr-value'] } }));
        results.push({ locale, width, menu: 'open', violations: violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })) });
        await page.keyboard.press('Escape');
      }
    }
  }
  await fs.mkdir('qa', { recursive: true });
  await fs.writeFile('qa/accessibility-aria-results.json', JSON.stringify(results, null, 2));
  const violations = results.filter(result => result.violations.length);
  assert.deepEqual(violations, [], 'ARIA violations; see qa/accessibility-aria-results.json');
  assert.deepEqual(results.filter(result => result.incomplete?.length), [], 'ARIA checks requiring manual review; see qa/accessibility-aria-results.json');
  console.log('PASS: axe-core ARIA checks, EN/ID, desktop/mobile, all four panels and expanded menus. Not a full WCAG audit.');
} finally {
  await browser.close();
}
