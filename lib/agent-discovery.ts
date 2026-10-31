import { site } from './site-config.ts';

/** ARD v0.91: a discovery reference to an actual skill, not a hosted MCP API. */
export function ardManifest() {
  return { entries: [{
    '@context': 'https://agenticresourcediscovery.org/context/v1',
    identifier: `urn:air:${new URL(site.origin).hostname}:skill:awsm-design`,
    displayName: 'AWSM awsm-design skill guide',
    type: 'application/agent-skills+md',
    url: 'https://raw.githubusercontent.com/rikoarik/artcraft-mcp-awsm/main/skills/awsm-design/SKILL.md',
    description: 'The default AWSM skill guide for interface design, responsive implementation, asset discovery, SolidCraft parametric 3D, FigCraft-to-code handoff and visual QA. Markdown instructions for a coding agent using locally installed tools; not a hosted execution endpoint.',
    representativeQueries: [
      'How can my coding agent use AWSM to design a responsive interface?',
      'Where is the default awsm-design skill guide?',
      'How do I model a 3D asset in SolidCraft and publish it with AWSM?',
      'How do I prepare FigCraft-to-code handoff and browser QA with AWSM?',
    ],
    capabilities: ['ui-design-guidance', 'solidcraft-3d-guidance', 'figcraft-handoff-guidance', 'visual-qa-guidance'],
  }] };
}
