import test from 'node:test';
import assert from 'node:assert/strict';
import { llmsText, toolFamilies } from '../lib/llms.ts';
import { clients, installCommand } from '../lib/installer.ts';
import { PRODUCTION_ORIGIN } from '../lib/site-config.ts';

test('llms discovery has a complete unique 24-tool inventory and Markdown source lists', () => {
  const names = toolFamilies.flatMap(family => [...family.tools]);
  assert.equal(names.length, 24);
  assert.equal(new Set(names).size, 24);
  // publish_3d_asset is the newest family and must be advertised.
  assert.ok(names.includes('publish_3d_asset'));
  const text = llmsText();
  assert.match(text, /^# AWSM\n\n> /);
  for (const name of names) assert.ok(text.includes(`\`${name}\``), name);
  // Every "## " section carries a heading and at least one list entry, so the
  // file stays machine-parseable for an inference client.
  for (const section of text.split(/^## /m).slice(1)) {
    const lines = section.split('\n').filter((line) => line.trim());
    assert.ok(lines.length > 1, `section ${lines[0]} needs a body`);
    assert.ok(lines.some((line) => line.startsWith('- ') || line === '```bash'), `section ${lines[0]} needs a list or command`);
  }
  const routes = text.split('## Routes')[1].split('## ')[0];
  for (const route of ['MODEL → SolidCraft', 'DRAFT → CADCraft', 'RECONSTRUCT → CADCraft + SolidCraft', 'PRESENT → FigCraft']) assert.ok(routes.includes(route), route);
  assert.ok(text.includes(`${PRODUCTION_ORIGIN}/id`));
  assert.ok(text.includes('https://raw.githubusercontent.com/rikoarik/artcraft-mcp-awsm/main/README.md'));
});

test('llms commands use the actual installer helper, including Zed-only global setup', () => {
  const text = llmsText();
  const commands = [...text.matchAll(/```bash\n([\s\S]*?)\n```/g)].map(match => match[1]);
  // One install command per client, plus the documented upgrade command.
  assert.equal(commands.length, clients.length + 1);
  for (const [index, client] of clients.entries()) {
    assert.equal(commands[index], installCommand(client.value));
    assert.equal(commands[index].includes('--global'), client.value === 'zed');
  }
  assert.ok(commands.at(-1)!.includes('--upgrade-config'));
  assert.ok(!text.includes('<client_name>'));
});

test('llms preserves local-first limitations rather than privacy or ranking promises', () => {
  const text = llmsText();
  for (const phrase of [
    'can contact external providers',
    'not browser WebMCP registrations',
    'does not edit the FigCraft canvas',
    'not WCAG certification',
    'not a requirement for indexing',
    'No Figma integration is claimed',
    'never runs them',
    // The 3D claims this site is allowed to make, and the ones it is not.
    'never installs or launches SolidCraft',
    'never an editable 3D scene',
    'rejects an OBJ that references an external material library',
    '--allow-any-path` is not advised',
  ]) assert.ok(text.includes(phrase), phrase);
  assert.ok(!/photoreal|seamless 3D export|native 3D in FigCraft/i.test(text));
});

test('llms documents the repository rename for existing installations', () => {
  const text = llmsText();
  assert.ok(text.includes('artcraft-mcp-awsm'));
  assert.ok(text.includes('--upgrade-config'));
  assert.ok(text.includes('moved from figcraft-mcp-awsm'));
});
