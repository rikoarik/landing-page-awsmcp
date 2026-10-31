// Deterministic local browser rendering for the social card. Uses the site's own
// WOFF2 fonts and the SolidCraft render that ships with the site. No remote
// resources, stock imagery, AI images or runtime generation.
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';

const archivo = (await readFile(new URL('../app/fonts/archivo-latin.woff2', import.meta.url))).toString('base64');
const mono = (await readFile(new URL('../app/fonts/plexmono-latin-400.woff2', import.meta.url))).toString('base64');
const render = (await readFile(new URL('../public/assets/v2/router-hero.webp', import.meta.url))).toString('base64');

await mkdir(new URL('../public/social/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

const style = `
@font-face{font-family:Display;src:url(data:font/woff2;base64,${archivo});font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:Mono;src:url(data:font/woff2;base64,${mono});font-weight:400}
*{box-sizing:border-box}
body{margin:0;background:#F2EFE6;color:#131311;width:1200px;height:630px;font-family:Display;display:grid;grid-template-columns:1fr 470px;overflow:hidden}
.copy{padding:44px 0 40px 52px;display:flex;flex-direction:column}
header{display:flex;align-items:center;gap:9px;margin-bottom:34px}
.sq{width:8px;height:8px;background:#FF4B1F}
.logo{font:900 26px/1 Display;font-variation-settings:'wdth' 70,'wght' 900;letter-spacing:-0.02em}
.kicker{font:400 10px/1 Mono;letter-spacing:.13em;text-transform:uppercase;color:#4A463D;margin-bottom:22px}
h1{margin:0;font:900 96px/.84 Display;font-variation-settings:'wdth' 70,'wght' 900;letter-spacing:-0.04em;word-spacing:.1em}
h1 span{display:block;white-space:nowrap}
h1 .accent{color:#FF4B1F}
.routes{display:flex;gap:0;margin-top:auto;border-top:1px solid #131311;padding-top:14px;font:400 9px/1.4 Mono;letter-spacing:.11em;text-transform:uppercase;color:#3A362E}
.routes span{flex:1;border-right:1px solid #CDC7B8;padding-right:12px;margin-right:12px}
.routes span:last-child{border-right:0}
.routes b{display:block;color:#FF4B1F;font-weight:400;margin-bottom:6px}
.plate{position:relative;background:#1B1B18;border-left:6px solid #FF4B1F;display:flex;flex-direction:column;justify-content:center}
.plate img{width:112%;margin-left:-11%;height:auto;filter:drop-shadow(0 24px 30px rgba(0,0,0,.5))}
.plabel{position:absolute;top:26px;left:26px;font:400 9px/1 Mono;letter-spacing:.12em;color:#BDB7A6;text-transform:uppercase}
.caption{position:absolute;left:26px;right:26px;bottom:26px}
.caption b{display:block;font:900 26px/1.03 Display;font-variation-settings:'wdth' 70,'wght' 900;letter-spacing:-0.01em;word-spacing:.1em;color:#F2EFE6;text-transform:uppercase}
.caption i{display:block;margin-top:8px;font:400 9px/1.5 Mono;letter-spacing:.1em;color:#8E897C;text-transform:uppercase;font-style:normal}
`;

for (const locale of ['en', 'id']) {
  const en = locale === 'en';
  await page.setContent(`<!doctype html><html lang="${locale}"><head><style>${style}</style></head><body>
<div class="copy">
  <header><span class="sq"></span><span class="logo">AWSM</span></header>
  <p class="kicker">${en ? 'AWSM / LOCAL MCP FOR CODING AGENTS' : 'AWSM / MCP LOKAL UNTUK CODING AGENT'}</p>
  <h1>${en
    ? '<span>Make only</span><span>what you</span><span class="accent">meant.</span>'
    : '<span>Buat hanya</span><span>yang kamu</span><span class="accent">maksud.</span>'}</h1>
  <div class="routes">
    <span><b>01</b>${en ? 'Model' : 'Model'}</span>
    <span><b>02</b>${en ? 'Draft' : 'Gambar'}</span>
    <span><b>03</b>${en ? 'Reconstruct' : 'Rekonstruksi'}</span>
    <span><b>04</b>${en ? 'Present' : 'Presentasi'}</span>
  </div>
</div>
<div class="plate">
  <span class="plabel">${en ? 'PLATE 00 / INTENT ROUTER' : 'PLATE 00 / INTENT ROUTER'}</span>
  <img src="data:image/webp;base64,${render}" alt="">
  <div class="caption"><b>The Intent Router</b><i>${en ? '124 × 88.8 × 38 mm / 4 ports / 1 dial' : '124 × 88,8 × 38 mm / 4 port / 1 dial'}</i></div>
</div>
</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../public/social/awsm-${locale}.png`, import.meta.url).pathname });
  console.log(`wrote public/social/awsm-${locale}.png`);
}
await browser.close();
