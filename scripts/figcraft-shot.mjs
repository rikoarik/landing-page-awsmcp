#!/usr/bin/env node
/**
 * Screenshot a FigCraft layer through its MCP control channel and save the PNG.
 *   node scripts/figcraft-shot.mjs <layerId> <out.png>
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const [ids, out] = process.argv.slice(2);
const HOST = process.env.FIGCRAFT_ATTACH_HOST ?? '127.0.0.1:7979';

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

try {
  await request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'awsm-site', version: '1.0.0' } });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })}\n`);
  const result = await request('tools/call', { name: 'screenshot', arguments: { ids: ids.split(',').map(Number) } });
  const image = (result.content ?? []).find((item) => item.type === 'image');
  if (!image) throw new Error(`no image in response: ${JSON.stringify(result).slice(0, 300)}`);
  await fs.writeFile(out, Buffer.from(image.data, 'base64'));
  console.log(`wrote ${out}`);
} catch (error) {
  console.error(String(error?.message ?? error));
  process.exitCode = 1;
} finally {
  child.stdin.end();
  child.kill();
}
