#!/usr/bin/env node
/**
 * Minimal stdio MCP client for the FigCraft app.
 *
 *   node fc.mjs <tool> '<json arguments>'
 *   node fc.mjs --tools
 *
 * Attaches to the running FigCraft app so calls act on the visible document.
 */
import { spawn } from 'node:child_process';

const HOST = process.env.FIGCRAFT_ATTACH_HOST ?? '127.0.0.1:7979';
const [tool, rawArgs] = process.argv.slice(2);

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
    if (!line || !line.startsWith('{')) continue;
    let message;
    try { message = JSON.parse(line); } catch { continue; }
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  }
});

const stderr = [];
child.stderr.on('data', (chunk) => stderr.push(chunk.toString('utf8')));

function request(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout on ${method}`)), 120000);
    pending.set(id, (message) => {
      clearTimeout(timer);
      if (message.error) reject(new Error(`${method}: ${JSON.stringify(message.error)}`));
      else resolve(message.result);
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  });
}

function notify(method, params) {
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);
}

try {
  await request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'awsm-site-agent', version: '1.0.0' },
  });
  notify('notifications/initialized', {});

  if (tool === '--tools') {
    const { tools } = await request('tools/list', {});
    console.log(tools.map((entry) => `${entry.name} — ${(entry.description ?? '').split('\n')[0].slice(0, 110)}`).join('\n'));
  } else {
    const args = rawArgs ? JSON.parse(rawArgs) : {};
    const result = await request('tools/call', { name: tool, arguments: args });
    for (const item of result.content ?? []) {
      if (item.type === 'text') console.log(item.text);
      else if (item.type === 'image') console.log(`[image ${item.mimeType}, ${item.data.length} base64 chars]`);
      else console.log(JSON.stringify(item));
    }
    if (result.isError) process.exitCode = 1;
  }
} catch (error) {
  console.error(String(error?.message ?? error));
  if (stderr.length) console.error(stderr.join('').slice(0, 2000));
  process.exitCode = 1;
} finally {
  child.stdin.end();
  child.kill();
}
