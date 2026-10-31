import assert from 'node:assert/strict';
import test from 'node:test';
import { clients, installCommand, upgradeCommand, SOURCE } from '../lib/installer.ts';

test('all six clients generate the exact GitHub setup command', () => {
  assert.equal(clients.length, 6);
  for (const { value } of clients) {
    const expected = [`npx -y ${SOURCE} setup \\`, `  --client ${value} \\`, `  --source ${SOURCE}${value === 'zed' ? ' \\' : ''}`, ...(value === 'zed' ? ['  --global'] : [])].join('\n');
    assert.equal(installCommand(value), expected);
    assert.equal(installCommand(value).includes('--global'), value === 'zed');
  }
});

test('installer points at the renamed artcraft-mcp-awsm repository', () => {
  assert.equal(SOURCE, 'github:rikoarik/artcraft-mcp-awsm');
  for (const { value } of clients) {
    assert.ok(installCommand(value).includes('github:rikoarik/artcraft-mcp-awsm'));
    assert.ok(!installCommand(value).includes('figcraft-mcp-awsm'));
  }
});

test('upgrade command re-runs setup against an existing configuration', () => {
  for (const { value } of clients) {
    const command = upgradeCommand(value);
    assert.ok(command.includes('--prefer-online'), 'upgrade must bypass a stale cache');
    assert.ok(command.includes('--upgrade-config'), 'upgrade must update the recognised config');
    assert.ok(command.includes(`--client ${value}`));
    assert.ok(command.includes(`--source ${SOURCE}`));
    assert.equal(command.includes('--global'), value === 'zed');
    // Never fall back to the old repository URL, and never silently rewrite skills.
    assert.ok(!command.includes('figcraft-mcp-awsm'));
    assert.ok(!command.includes('--force-skills'));
  }
});

test('OpenCode is the default documented project-local client', () => {
  assert.equal(clients[0].value, 'opencode');
  assert.equal(clients[0].config, '.opencode/opencode.json');
  assert.ok(!installCommand('opencode').includes('--global'));
});
