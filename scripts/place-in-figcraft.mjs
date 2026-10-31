#!/usr/bin/env node
/**
 * Places the AWSM Router render into the "AWSM — The creative circuit" FigCraft
 * document as a real image layer, through FigCraft's own MCP control channel.
 *
 *   node scripts/place-in-figcraft.mjs <png> <x> <y> <width> <height> <parentId> "<layer name>"
 *
 * FigCraft is a 2D design tool: this inserts a PNG image layer, not an editable
 * 3D scene. The editable geometry stays in SolidCraft.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const [file, x, y, width, height, parent, name] = process.argv.slice(2);
if (!file || !parent) {
  console.error('usage: node scripts/place-in-figcraft.mjs <png> <x> <y> <width> <height> <parentId> "<layer name>"');
  process.exit(2);
}

const HOST = process.env.FIGCRAFT_ATTACH_HOST ?? '127.0.0.1:7979';
const data = (await fs.readFile(file)).toString('base64');

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

try {
  await request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'awsm-site', version: '1.0.0' } });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })}\n`);

  const placed = await call('run_command', {
    command: 'image.place',
    params: {
      data,
      x: Number(x), y: Number(y), width: Number(width), height: Number(height),
      parent: Number(parent),
      mode: 'fit',
    },
  });
  const info = JSON.parse(placed);
  const id = info.id ?? info.result?.id;
  if (!id) throw new Error(`image.place returned no layer id: ${placed.slice(0, 400)}`);

  if (name) {
    await call('run_command', { command: 'node.set', params: { ids: [id], name } });
  }
  console.log(JSON.stringify({ placed: id, width: info.width, height: info.height, name }, null, 2));
} catch (error) {
  console.error(String(error?.message ?? error));
  process.exitCode = 1;
} finally {
  child.stdin.end();
  child.kill();
}
