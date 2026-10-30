export const clients = [
  { value: 'opencode', name: 'OpenCode', config: '.opencode/opencode.json' },
  { value: 'claude', name: 'Claude Code', config: '.mcp.json' },
  { value: 'codex', name: 'Codex', config: '.codex/config.toml' },
  { value: 'antigravity', name: 'Google Antigravity', config: '.agents/mcp_config.json' },
  { value: 'copilot', name: 'GitHub Copilot CLI', config: '.github/mcp.json' },
  { value: 'zed', name: 'Zed', config: 'Zed settings (user)' },
] as const;
export type Client = (typeof clients)[number]['value'];
export function installCommand(client: Client): string {
  return `npx -y github:rikoarik/figcraft-mcp-awsm setup \\\n  --client ${client} \\\n  --source github:rikoarik/figcraft-mcp-awsm${client === 'zed' ? ' \\\n  --global' : ''}`;
}
export const links = {
  github: 'https://github.com/rikoarik/figcraft-mcp-awsm',
  readme: 'https://github.com/rikoarik/figcraft-mcp-awsm#readme',
  issues: 'https://github.com/rikoarik/figcraft-mcp-awsm/issues',
  license: 'https://github.com/rikoarik/figcraft-mcp-awsm/blob/main/LICENSE',
  figcraft: 'https://getartcraft.com/apps/figcraft',
  saweria: 'https://saweria.co/arkids',
};
