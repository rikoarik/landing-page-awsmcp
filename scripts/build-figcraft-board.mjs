#!/usr/bin/env node
/**
 * Builds the "05b / 3D asset" FigCraft board around the placed SolidCraft render:
 * editorial annotation, a spec table and an honest boundary note.
 *
 * Everything here is a real FigCraft layer (text, rectangles, rules) except the
 * product render itself, which is an image layer — FigCraft has no editable 3D.
 */
import { spawn } from 'node:child_process';

const HOST = process.env.FIGCRAFT_ATTACH_HOST ?? '127.0.0.1:7979';
const FRAME = 8589934594;

const INK = '#202320';
const PAPER = '#F4F4EC';
const CORAL = '#FF6B42';
const ACID = '#F4F34C';
const CYAN = '#B9ECF0';
const PINK = '#F6A7CA';

const child = spawn('figcraft-cli', ['mcp', '--attach', HOST], { stdio: ['pipe', 'pipe', 'pipe'] });
let buffer = '';
const pending = new Map();
let nextId = 1;

child.stdout.on('data', (chunk) => {
  buffer += chunk.toString('utf8');
  let index;
  while ((index = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (!line.startsWith('{')) continue;
    let message;
    try { message = JSON.parse(line); } catch { continue; }
    if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
  }
});
child.stderr.on('data', () => {});

const request = (method, params) => new Promise((resolve, reject) => {
  const id = nextId++;
  const timer = setTimeout(() => reject(new Error(`timeout on ${method}`)), 180000);
  pending.set(id, (message) => {
    clearTimeout(timer);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
});

const call = async (tool, args) => {
  const result = await request('tools/call', { name: tool, arguments: args });
  const text = (result.content ?? []).filter((item) => item.type === 'text').map((item) => item.text).join('\n');
  if (result.isError) throw new Error(text);
  return text;
};

const batch = (commands) => call('batch', { commands });

const text = (name, characters, x, y, width, props = {}) => ({
  command: 'node.create',
  params: {
    type: 'text', name, x, y, width, parent: FRAME,
    text: characters,
    props: { fontFamily: 'Montserrat', fontStyle: 'Regular', fontSize: 16, lineHeight: '150%', fills: [{ type: 'solid', color: INK }], ...props },
  },
});

const rule = (name, x, y, width, height, color = INK) => ({
  command: 'node.create',
  params: { type: 'rectangle', name, x, y, width, height, parent: FRAME, props: { fills: [{ type: 'solid', color }] } },
});

try {
  await request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'awsm-site', version: '1.0.0' } });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })}\n`);

  const commands = [
    // ── Header band ────────────────────────────────────────────────────────────
    rule('Rule / header', 40, 40, 820, 2),
    text('Label / eyebrow', 'SOLIDCRAFT → WEB · PUBLISHED ASSET', 40, 54, 500, {
      fontSize: 13, fontStyle: 'Bold', letterSpacing: '4%', fills: [{ type: 'solid', color: INK }],
    }),
    text('Label / right', 'AWSM ROUTER · 124 × 86 × 38 MM', 520, 54, 340, {
      fontSize: 13, fontStyle: 'Bold', letterSpacing: '4%', textAlign: 'right', fills: [{ type: 'solid', color: INK }],
    }),
    rule('Rule / header 2', 40, 80, 820, 1),

    // ── The render sits between 96 and 470 (image layer placed separately) ─────
    rule('Rule / under render', 40, 484, 820, 1),

    // ── Spec block ─────────────────────────────────────────────────────────────
    text('Spec / title', 'One body. Four sockets.', 40, 506, 420, {
      fontSize: 30, fontStyle: 'Bold', letterSpacing: '-2%', lineHeight: '110%',
    }),
    text('Spec / body',
      'A parametric SolidCraft part: sketched, dimensioned, filleted and measured in millimetres. The four machined sockets carry context, assets, handoff and visual QA.',
      40, 566, 400, { fontSize: 15, lineHeight: '160%' }),

    // Spec table rows
    rule('Rule / table top', 480, 506, 380, 2),
    ...['ENVELOPE|124 × 86 × 38 mm', 'BODIES|10 solids', 'MASS|364.6 g', 'FEATURES|39 parametric',
      'MESH|25,186 triangles', 'DELIVERY|GLB 718 KB · 10 primitives'].flatMap((row, index) => {
      const [key, value] = row.split('|');
      return [
        text(`Spec / ${key}`, key, 480, 516 + index * 27, 150, {
          fontSize: 12, fontStyle: 'Bold', letterSpacing: '6%', fills: [{ type: 'solid', color: '#6B6F6A' }],
        }),
        text(`Spec / ${key} value`, value, 630, 514 + index * 27, 230, { fontSize: 14 }),
        rule(`Rule / ${key}`, 480, 532 + index * 27, 380, 1, 'rgba(32,35,32,0.18)'),
      ];
    }),

    // ── Honest boundary note ───────────────────────────────────────────────────
    rule('Rule / footnote', 40, 700, 820, 1),
    text('Note / label', 'SCOPE', 40, 712, 80, {
      fontSize: 12, fontStyle: 'Bold', letterSpacing: '8%', fills: [{ type: 'solid', color: INK }],
    }),
    text('Note / body',
      'This is a PNG render of the SolidCraft model, placed as an image layer. FigCraft is a 2D design tool: the layer is editable as an image, not as a 3D scene. The editable geometry stays in awsm-router.sc, and the website loads the real GLB mesh.',
      120, 710, 740, { fontSize: 13, lineHeight: '150%' }),

    // Accent chip tying the board to the page palette
    rule('Chip / coral', 40, 800, 64, 10, CORAL),
    rule('Chip / acid', 110, 800, 64, 10, ACID),
    rule('Chip / cyan', 180, 800, 64, 10, CYAN),
    rule('Chip / pink', 250, 800, 64, 10, PINK),
    text('Note / palette', 'PAGE TOKENS — material finishes in the model reuse these four.', 330, 795, 530, {
      fontSize: 12, fontStyle: 'Bold', letterSpacing: '4%', fills: [{ type: 'solid', color: '#6B6F6A' }],
    }),
  ];

  const output = await batch(commands);
  console.log(output.slice(0, 400));
  console.log(`\n${commands.length} layers written into frame ${FRAME}.`);
} catch (error) {
  console.error(String(error?.message ?? error));
  process.exitCode = 1;
} finally {
  child.stdin.end();
  child.kill();
}
