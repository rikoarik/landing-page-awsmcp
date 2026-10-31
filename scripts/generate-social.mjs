// Deterministic local browser rendering supports the project's existing WOFF2 fonts
// and the SolidCraft model render that ships with the site. No remote resources,
// stock imagery, AI images or runtime generation.
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';

const display = (await readFile(new URL('../app/fonts/Montserrat.woff2', import.meta.url))).toString('base64');
const body = (await readFile(new URL('../app/fonts/SourceSans3.woff2', import.meta.url))).toString('base64');
const render = (await readFile(new URL('../public/assets/3d/awsm-router/poster.webp', import.meta.url))).toString('base64');

await mkdir(new URL('../public/social/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

const style = `
@font-face{font-family:Display;src:url(data:font/woff2;base64,${display});font-weight:100 900}
@font-face{font-family:Body;src:url(data:font/woff2;base64,${body});font-weight:200 900}
*{box-sizing:border-box}
body{margin:0;background:#F4F34C;color:#202320;width:1200px;height:630px;padding:40px 52px;font-family:Body;display:grid;grid-template-rows:auto 1fr auto;overflow:hidden}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #202320;padding-bottom:16px}
.logo{font:900 60px/.9 Display;letter-spacing:-5px}
.url{font-size:20px}
main{display:grid;grid-template-columns:1fr 400px;gap:28px;align-items:center;padding:22px 0}
h1{font:800 48px/1.1 Display;letter-spacing:-1.9px;margin:0;max-width:650px}
h1 span{display:block;white-space:nowrap}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:22px}
.tags span{border:1.5px solid #202320;border-radius:20px;padding:5px 13px;font-size:15px;font-weight:600}
.tags span:first-child{background:#202320;color:#F4F4EC}
figure{margin:0;position:relative}
figure{background:#F4F4EC}
figure img{display:block;width:400px;height:400px;object-fit:contain;padding:6px}
figure::after{content:'';position:absolute;inset:0;border:1.5px solid #202320}
footer{display:flex;justify-content:space-between;border-top:1px solid #202320;padding-top:14px;font-size:18px}
footer b{font-weight:700}
`;

for (const locale of ['en', 'id']) {
  const en = locale === 'en';
  await page.setContent(`<!doctype html><html lang="${locale}"><head><style>${style}</style></head><body>
<header><span class="logo">awsm</span><span class="url">useawsm.web.id</span></header>
<main>
  <div>
    <h1>${en
      ? '<span>One local MCP toolkit.</span><span>Design context, real 3D,</span><span>rendered evidence.</span>'
      : '<span>Satu toolkit MCP lokal.</span><span>Konteks desain, 3D nyata,</span><span>bukti hasil render.</span>'}</h1>
    <div class="tags">
      <span>24 ${en ? 'typed tools' : 'tool bertipe'}</span>
      <span>SolidCraft 3D</span>
      <span>FigCraft</span>
      <span>QA</span>
    </div>
  </div>
  <figure><img src="data:image/webp;base64,${render}" alt=""></figure>
</main>
<footer><span><b>AWSM Router</b> — ${en ? 'parametric SolidCraft model' : 'model parametrik SolidCraft'}</span><span>${en ? 'Open source · MIT' : 'Open source · MIT'}</span></footer>
</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../public/social/awsm-${locale}.png`, import.meta.url).pathname, animations: 'disabled' });
}

await browser.close();
console.log('Generated two local branded 1200×630 PNGs with the published 3D render.');
