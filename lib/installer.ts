export const clients = [
  { value: 'opencode', name: 'OpenCode', config: '.opencode/opencode.json' },
  { value: 'claude', name: '[CC]', config: '.mcp.json' },
  { value: 'codex', name: 'Codex', config: '.codex/config.toml' },
  { value: 'antigravity', name: 'Google Antigravity', config: '.agents/mcp_config.json' },
  { value: 'copilot', name: 'GitHub Copilot CLI', config: '.github/mcp.json' },
  { value: 'zed', name: 'Zed', config: 'Zed settings (user)' },
] as const;
export type Client = (typeof clients)[number]['value'];

/** Canonical source of the installer: the renamed artcraft-mcp-awsm repository. */
export const SOURCE = 'github:rikoarik/artcraft-mcp-awsm';

export function installCommand(client: Client): string {
  return `npx -y ${SOURCE} setup \\\n  --client ${client} \\\n  --source ${SOURCE}${client === 'zed' ? ' \\\n  --global' : ''}`;
}

/** Re-runs setup against an existing configuration, including one from the old repository URL. */
export function upgradeCommand(client: Client): string {
  return `npx -y --prefer-online ${SOURCE} setup \\\n  --client ${client} \\\n  --source ${SOURCE} \\\n  --upgrade-config${client === 'zed' ? ' \\\n  --global' : ''}`;
}

export const links = {
  github: 'https://github.com/rikoarik/artcraft-mcp-awsm',
  readme: 'https://github.com/rikoarik/artcraft-mcp-awsm#readme',
  issues: 'https://github.com/rikoarik/artcraft-mcp-awsm/issues',
  license: 'https://github.com/rikoarik/artcraft-mcp-awsm/blob/main/LICENSE',
  quickstart: 'https://github.com/rikoarik/artcraft-mcp-awsm#quick-start',
  updates: 'https://github.com/rikoarik/artcraft-mcp-awsm#updates-and-existing-installations',
  solidcraft: 'https://github.com/tangency-labs/solidcraft',
  solidcraftMcp: 'https://github.com/tangency-labs/solidcraft/blob/main/docs/mcp.md',
  figcraft: 'https://getartcraft.com/apps/figcraft',
  saweria: 'https://saweria.co/arkids',
};
