import test from 'node:test';
import assert from 'node:assert/strict';
import { llmsText, toolFamilies } from '../lib/llms.ts';
import { clients, installCommand } from '../lib/installer.ts';
import { PRODUCTION_ORIGIN } from '../lib/site-config.ts';

test('llms discovery has a complete unique 23-tool inventory and Markdown source lists', () => {
  const names = toolFamilies.flatMap(family => [...family.tools]);
  assert.equal(names.length, 23);
  assert.equal(new Set(names).size, 23);
  const text = llmsText();
  assert.match(text, /^# AWSM\n\n> /);
  for (const name of names) assert.ok(text.includes(`\`${name}\``), name);
  for (const section of text.split(/^## /m).slice(1)) assert.match(section, /^.+\n- \[/);
  assert.ok(text.includes(`${PRODUCTION_ORIGIN}/id`));
  assert.ok(text.includes('https://raw.githubusercontent.com/rikoarik/figcraft-mcp-awsm/main/README.md'));
});

test('llms commands use the actual installer helper, including Zed-only global setup', () => {
  const text = llmsText();
  const commands = [...text.matchAll(/```bash\n([\s\S]*?)\n```/g)].map(match => match[1]);
  assert.equal(commands.length, clients.length);
  for (const [index, client] of clients.entries()) {
    assert.equal(commands[index], installCommand(client.value));
    assert.equal(commands[index].includes('--global'), client.value === 'zed');
  }
  assert.ok(!text.includes('<client_name>'));
});

test('llms preserves local-first limitations rather than privacy or ranking promises', () => {
  const text = llmsText();
  for (const phrase of ['can contact external providers', 'not browser WebMCP registrations', 'does not edit the FigCraft canvas', 'not WCAG certification', 'not a requirement for indexing', 'No Figma integration is claimed', 'never runs them']) assert.ok(text.includes(phrase), phrase);
});
