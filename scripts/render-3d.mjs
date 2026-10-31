#!/usr/bin/env node
/**
 * Renders the published GLB in a real Chromium/WebGL context using the same shared
 * studio module the landing page imports (lib/three-scene.mjs). This verifies the
 * browser asset before it ships and produces the static fallback poster from the
 * exact scene the page renders.
 *
 * Usage: node scripts/render-3d.mjs
 * Output: qa/3d/*.png (verification frames), public/assets/3d/awsm-router/poster.webp
 */
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = process.cwd();
const PORT = 4319;
const ASSET = '/assets/3d/awsm-router';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const HARNESS = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;height:100%;background:transparent}
  canvas{display:block;width:100vw;height:100vh}
</style></head><body>
<script type="importmap">{"imports":{"three":"/vendor/three.module.js","three/addons/":"/vendor/addons/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SCENE, createRenderer, createStudio, placeCamera } from '/lib/three-scene.mjs';

const params = new URLSearchParams(location.search);
const width = Number(params.get('w') ?? 1200);
const height = Number(params.get('h') ?? 1200);
const base = SCENE.detail[params.get('view')] ?? SCENE[params.get('view')] ?? SCENE.camera;
const num = (key, fallback) => (params.has(key) ? Number(params.get(key)) : fallback);
const view = {
  azimuth: num('az', base.azimuth),
  elevation: num('el', base.elevation),
  distance: num('d', base.distance),
  fov: num('fov', base.fov),
  target: [num('tx', base.target[0]), num('ty', base.target[1]), num('tz', base.target[2])],
};
const ground = params.get('ground') !== '0';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const renderer = createRenderer(THREE, canvas, { ground });
renderer.setSize(width, height, false);
renderer.setPixelRatio(1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(view.fov, width / height, 0.01, 20);

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
createStudio(THREE, scene, { ground, environment });

const gltf = await new GLTFLoader().loadAsync('${ASSET}/model.glb');
gltf.scene.traverse((node) => {
  if (!node.isMesh) return;
  node.castShadow = ground;
  node.receiveShadow = ground;
});
scene.add(gltf.scene);

placeCamera(THREE, camera, view);
renderer.render(scene, camera);
window.__ready = true;
</script></body></html>`;

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/') {
    response.writeHead(200, { 'Content-Type': MIME['.html'] });
    response.end(HARNESS);
    return;
  }
  const rel = url.pathname.startsWith('/vendor/addons/')
    ? `/node_modules/three/examples/jsm/${url.pathname.slice('/vendor/addons/'.length)}`
    : url.pathname.startsWith('/vendor/')
      ? `/node_modules/three/build/${url.pathname.slice('/vendor/'.length)}`
      : url.pathname.startsWith('/assets/')
        ? `/public${url.pathname}`
        : url.pathname;
  const resolved = path.join(ROOT, decodeURIComponent(rel));
  try {
    if (!resolved.startsWith(ROOT)) throw new Error('outside root');
    const data = await fs.readFile(resolved);
    response.writeHead(200, { 'Content-Type': MIME[path.extname(resolved)] ?? 'application/octet-stream' });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end('not found');
  }
});

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
await fs.mkdir(path.join(ROOT, 'qa/3d'), { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

async function frame(name, query) {
  await page.setViewportSize({ width: Number(query.w ?? 1200), height: Number(query.h ?? 1200) });
  await page.goto(`http://127.0.0.1:${PORT}/?${new URLSearchParams(query)}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(ROOT, 'qa/3d', `${name}.png`), omitBackground: true });
}

const views = {
  hero: { view: 'camera', w: 1400, h: 1200, ground: 1 },
  'detail-dial': { view: 'dial', w: 1200, h: 1200, ground: 0 },
  'detail-ports': { view: 'ports', w: 1200, h: 1200, ground: 0 },
  poster: { view: 'camera', w: 1100, h: 1100, ground: 1 },
};

for (const [name, query] of Object.entries(views)) await frame(name, query);
await browser.close();
server.close();

const poster = await sharp(path.join(ROOT, 'qa/3d/poster.png'))
  .resize(1100, 1100, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 88, alphaQuality: 92, effort: 6 })
  .toBuffer();
await fs.writeFile(path.join(ROOT, 'public/assets/3d/awsm-router/poster.webp'), poster);

if (errors.length) {
  console.error('Browser errors:', errors);
  process.exitCode = 1;
} else {
  console.log('Rendered hero, detail-dial, detail-ports and poster frames with no browser errors.');
  console.log(`poster.webp — ${(poster.byteLength / 1024).toFixed(1)} KiB`);
}
