// Deterministic local browser rendering supports the project's existing WOFF2 fonts.
// No remote resources, stock imagery, AI images or runtime generation.
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
const display = (await readFile(new URL('../app/fonts/Montserrat.woff2', import.meta.url))).toString('base64');
const body = (await readFile(new URL('../app/fonts/SourceSans3.woff2', import.meta.url))).toString('base64');
await mkdir(new URL('../public/social/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const locale of ['en', 'id']) {
  const en = locale === 'en';
  await page.setContent(`<!doctype html><html lang="${locale}"><head><style>
@font-face{font-family:Display;src:url(data:font/woff2;base64,${display});font-weight:100 900}@font-face{font-family:Body;src:url(data:font/woff2;base64,${body});font-weight:200 900}*{box-sizing:border-box}body{margin:0;background:#F4F34C;color:#202320;width:1200px;height:630px;padding:46px 56px;font-family:Body}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #202320;padding-bottom:20px}.logo{font:900 64px/.9 Display;letter-spacing:-5px}.url{font-size:22px}h1{font:800 60px/1.06 Display;letter-spacing:-2px;margin:30px 0 0;max-width:1000px}.circuit{display:flex;align-items:center;margin-top:36px;height:128px}.request,.output{border:2px solid #202320;padding:22px;background:#F4F4EC;font-size:23px;width:290px}.request{transform:rotate(-4deg)}.wire{height:2px;background:#202320;width:56px}.hub{background:#F6A7CA;border:2px solid #202320;box-shadow:8px 8px 0 #202320;width:300px;padding:18px 28px;transform:rotate(-3deg)}.hub strong{font:900 54px Display;letter-spacing:-4px}.hub span{display:block;font-size:19px}.output{background:#B9ECF0;transform:rotate(3deg)}footer{display:flex;justify-content:space-between;border-top:1px solid #202320;padding-top:20px;margin-top:35px;font-size:22px}
</style></head><body><header><span class="logo">awsm</span><span class="url">useawsm.web.id</span></header><h1>${en ? 'A local MCP toolkit.<br>For design-minded agents.' : 'Toolkit MCP lokal.<br>Untuk agent yang peduli desain.'}</h1><div class="circuit"><div class="request">${en ? 'Design context' : 'Konteks desain'}</div><div class="wire"></div><div class="hub"><strong>awsm</strong><span>${en ? 'One local connection' : 'Satu koneksi lokal'}</span></div><div class="wire"></div><div class="output">${en ? 'An interface worth<br>looking at.' : 'Antarmuka yang<br>layak dilihat.'}</div></div><footer><span>${en ? '23 typed tools / Open source' : '23 tool bertipe / Open source'}</span><span>FigCraft → code → QA</span></footer></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../public/social/awsm-${locale}.png`, import.meta.url).pathname, animations: 'disabled' });
}
await browser.close();
console.log('Generated two local branded 1200×630 PNGs.');
