#!/usr/bin/env node
/**
 * Export the five images the V2 page uses straight out of the FigCraft design
 * document, then convert them to WebP.
 *
 *   node scripts/export-design-assets.mjs [--host 127.0.0.1:7979]
 *
 * The document is read from the **running FigCraft app**, not from the saved
 * file: the V2 page lives on page 02 and the app's autosave is off, so the
 * .figcraft on disk can lag behind what the design actually shows. Start the app
 * with `figcraft --control 7979` and open the document first.
 *
 * The PNGs are kept beside the WebPs as the untouched export.
 */
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const hostArg = process.argv.indexOf('--host');
const HOST = hostArg > -1 ? process.argv[hostArg + 1] : (process.env.FIGCRAFT_ATTACH_HOST ?? '127.0.0.1:7979');
const OUT = path.resolve('public/assets/v2');

/** Layer name → output file. Names are the design document's own. */
const LAYERS = [
  ['Hero / router render', 'router-hero'],
  ['S03 / router', 'router-body'],
  ['S03 / macro', 'macro-dial'],
  ['S04 / building render', 'plan-render'],
  ['S07 / figcraft window', 'figcraft-window'],
];

const child = spawn('figcraft-cli', ['mcp', '--attach', HOST], { stdio: ['pipe', 'pipe', 'pipe'] });
let buffer = '';
const pending = new Map();
let nextId = 1;
const stderr = [];
child.stderr.on('data', (chunk) => stderr.push(chunk.toString('utf8')));
child.stdout.on('data', (chunk) => {
  buffer += chunk.toString('utf8');
  let index;
  while ((index = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (!line.startsWith('{')) continue;
    let message;
    try { message = JSON.parse(line); } catch { continue; }
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  }
});

function request(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout on ${method}`)), 180000);
    pending.set(id, (message) => {
      clearTimeout(timer);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  });
}

try {
  await request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'awsm-export-design', version: '1.0.0' },
  });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })}\n`);

  // inspect_document truncates a large tree, so take the page's frame list from it
  // and then pull the full subtree of the desktop frame with get_node.
  const doc = await request('tools/call', { name: 'inspect_document', arguments: { depth: 2 } });
  if (doc.isError) throw new Error('inspect_document failed; is the design document open?');
  const page = JSON.parse(doc.content.find((item) => item.type === 'text').text)
    .pages.find((entry) => entry.id === JSON.parse(doc.content.find((item) => item.type === 'text').text).currentPage);
  const frame = (page?.children ?? []).find((child) => child.name?.startsWith('V2 / Desktop'));
  if (!frame) throw new Error('the current page has no "V2 / Desktop" frame');
  const treeResult = await request('tools/call', { name: 'get_node', arguments: { id: frame.id, depth: 6 } });
  if (treeResult.isError) throw new Error('get_node failed for the desktop frame');
  const tree = JSON.parse(treeResult.content.find((item) => item.type === 'text').text);
  const ids = new Map();
  const walk = (node) => {
    if (node && node.name && node.type === 'RECTANGLE') ids.set(node.name, node.id);
    for (const child of node?.children ?? []) walk(child);
  };
  walk(tree);

  for (const [layerName, file] of LAYERS) {
    const id = ids.get(layerName);
    if (!id) throw new Error(`layer "${layerName}" not found on the current page`);
    const result = await request('tools/call', {
      name: 'export',
      arguments: {
        ids: [id],
        format: 'png',
        scale: 2,
        contentsOnly: true,
        path: path.join(OUT, `${file}.png`),
      },
    });
    if (result.isError) throw new Error(`export of ${layerName} failed: ${JSON.stringify(result)}`);
    const png = path.join(OUT, `${file}.png`);
    const image = await readFile(png);
    const meta = await sharp(image).metadata();
    await sharp(image).webp({ quality: 86 }).toFile(path.join(OUT, `${file}.webp`));
    const webp = await readFile(path.join(OUT, `${file}.webp`));
    console.log(`${file}: ${meta.width}×${meta.height} → ${(webp.byteLength / 1024).toFixed(0)} KB webp`);
  }
  await writeFile(path.join(OUT, 'SOURCE.txt'), [
    'Exported from the FigCraft design document "AWSM — The creative circuit",',
    'page 02 / frame "V2 / Desktop — 1440", through the app\'s export tool at 2×.',
    'The .png files are the untouched export; the .webp files are converted with sharp.',
    'Regenerate with: node scripts/export-design-assets.mjs',
    '',
    ...LAYERS.map(([name, file]) => `${file}.png  ←  layer "${name}"`),
    '',
  ].join('\n'));
  console.log(`wrote ${path.join(OUT, 'SOURCE.txt')}`);
} catch (error) {
  console.error(String(error?.message ?? error));
  if (stderr.length) console.error(stderr.join('').slice(0, 2000));
  process.exitCode = 1;
} finally {
  child.stdin.end();
  child.kill();
}
