import { clients, installCommand } from './installer.ts';
import { seoCopy, sources } from './seo-content.ts';
import { absoluteUrl } from './site-config.ts';

// Tool names verified against the upstream README's “What's included” inventory.
// Keep this inventory in sync when the upstream MCP server changes.
export const toolFamilies = [
  { name: 'Project context', tools: ['inspect_ui_project', 'design_quickstart'] },
  { name: 'Icons and images', tools: ['find_design_assets', 'find_icons', 'get_icon', 'find_images', 'save_icon_set', 'download_asset'] },
  { name: 'Design foundations', tools: ['google_font', 'palette', 'extract_design_tokens', 'check_contrast'] },
  { name: 'FigCraft handoff', tools: ['prepare_web_handoff', 'sync_figcraft_assets'] },
  { name: 'Browser visual QA', tools: ['review_ui', 'audit_ui_page', 'capture_ui_screenshots', 'compare_ui_screenshots'] },
  { name: 'Optional local MCP gateway', tools: ['bridge_list', 'bridge_call'] },
  { name: 'Utilities', tools: ['draw_icon', 'make_asset', 'serve'] },
] as const;

export function llmsText(): string {
  const copy = seoCopy.en;
  const inventory = toolFamilies.map(family => `- ${family.name}: ${family.tools.map(tool => `\`${tool}\``).join(', ')}.`).join('\n');
  const commands = clients.map(client => `${client.name} (\`--client ${client.value}\`):\n\n\`\`\`bash\n${installCommand(client.value)}\n\`\`\``).join('\n\n');
  return `# AWSM

> ${copy.definition}

${copy.facts.map(([label, value]) => `- ${label}: ${value}`).join('\n')}

Architecture: coding agent → one local AWSM MCP connection over stdio → built-in tools and, optionally, explicitly configured downstream stdio MCP processes. AWSM supplies context and rendered evidence; the coding agent implements and fixes the interface. No hosted AWSM service or VPS is required. Local-first does not mean offline-only or that every operation is private: asset discovery, font downloads and GitHub installation/update checks can contact external providers. Review provider terms and downloaded assets.

The 23 typed tools are local MCP tools, not browser WebMCP registrations or a hosted API. This inventory describes names and purpose families, not input schemas; obtain each tool's actual schema from your running MCP connection before calling it.

${inventory}

Installation requires Node.js 18+, npx and a supported MCP client. Review the GitHub source before executing third-party code. AWSM installs from GitHub, not the npm package my-awsm-mcp. These commands are examples only; this website never runs them.

Run the matching command inside your project. Zed uses user-level configuration and requires --global. Restart or reconnect the coding agent afterward. The default setup installs awsm-design; --all-skills adds 21 optional specialists.

${commands}

FigCraft handoff uses the separately installed and configured native FigCraft MCP for document inspection, canvas edits and exports. AWSM prepares handoff context and synchronizes existing exports; it does not edit the FigCraft canvas or promise one-click pixel-perfect output. No Figma integration is claimed here.

Browser QA requires project-local Playwright and Chromium plus a running local app. Screenshots, DOM checks and comparisons are evidence, not WCAG certification. The optional gateway only starts explicitly configured trusted local stdio servers. Use exact discovered tool names, restrict allowedTools, and obtain approval before write or destructive actions; downstream processes run with local account permissions.

This file is an optional inference discovery aid using an emerging convention. It is not a requirement for indexing, a training or crawl permission policy, or a guarantee of search visibility or AI citations.

## Pages and sources
- [English](${absoluteUrl('/')}): Product overview, facts and FAQ.
- [Bahasa Indonesia](${absoluteUrl('/id')}): Ringkasan produk, fakta dan FAQ.
- [Product README](https://raw.githubusercontent.com/rikoarik/figcraft-mcp-awsm/main/README.md): Authoritative Markdown documentation, architecture and current tool inventory.
- [Installation](${sources.install}): Client configuration, requirements and installer options.
- [Source code](${sources.repository}): Review implementation before running setup.
- [MIT license](${sources.license}): Product code license; third-party assets have separate terms.
- [FigCraft app](${sources.figcraft}): Separately configured native design app.

## Product limits and guidance
- [FigCraft handoff boundaries](${sources.readme}): AWSM does not edit the canvas; native FigCraft MCP editing is separate.
- [Browser QA requirements](${sources.readme}): Local Playwright and Chromium provide evidence, not WCAG certification.
- [Default awsm-design skill](https://raw.githubusercontent.com/rikoarik/figcraft-mcp-awsm/main/skills/awsm-design/SKILL.md): Design-to-code workflow and operational boundaries.
`;
}
