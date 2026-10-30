import assert from 'node:assert/strict';
import test from 'node:test';
import { clients, installCommand } from '../lib/installer.ts';

test('all six clients generate the exact GitHub setup command', () => {
  assert.equal(clients.length, 6);
  for (const { value } of clients) {
    const expected = ['npx -y github:rikoarik/figcraft-mcp-awsm setup \\', `  --client ${value} \\`, `  --source github:rikoarik/figcraft-mcp-awsm${value === 'zed' ? ' \\' : ''}`, ...(value === 'zed' ? ['  --global'] : [])].join('\n');
    assert.equal(installCommand(value), expected);
    assert.equal(installCommand(value).includes('--global'), value === 'zed');
  }
});
test('OpenCode is the default documented project-local client', () => {
  assert.equal(clients[0].value, 'opencode');
  assert.equal(clients[0].config, '.opencode/opencode.json');
  assert.ok(!installCommand('opencode').includes('--global'));
});
