export const sources = {
  readme: 'https://github.com/rikoarik/artcraft-mcp-awsm#readme',
  install: 'https://github.com/rikoarik/artcraft-mcp-awsm#quick-start',
  repository: 'https://github.com/rikoarik/artcraft-mcp-awsm',
  license: 'https://github.com/rikoarik/artcraft-mcp-awsm/blob/main/LICENSE',
  figcraft: 'https://getartcraft.com/apps/figcraft',
  updates: 'https://github.com/rikoarik/artcraft-mcp-awsm#updates-and-existing-installations',
  solidcraft: 'https://github.com/tangency-labs/solidcraft',
  solidcraftMcp: 'https://github.com/tangency-labs/solidcraft/blob/main/docs/mcp.md',
  publish3d: 'https://github.com/rikoarik/artcraft-mcp-awsm#publish-3d-assets-to-a-website-and-figcraft',
};
export const supportedClients = ['OpenCode', '[CC]', 'Codex', 'Google Antigravity', 'GitHub Copilot CLI', 'Zed'];

/**
 * Search and answer-engine copy for the V2 page ("Intent, not pipeline").
 * The four routes below are the page's own model, not a product feature: they
 * describe which application answers which kind of work. Nothing here claims a
 * hosted service, an intent classifier, or a capability the tools do not have.
 */
export const seoCopy = {
  en: {
    title: 'AWSM — Local MCP for 3D, drafting and interface design',
    description: 'One local MCP server, four routes: parametric 3D in SolidCraft, measured drafting in CADCraft, editable canvas in FigCraft, and browser QA. 24 typed tools, no hosted service.',
    heading: 'Know what you are opening.',
    definition: 'AWSM is an open-source local Model Context Protocol (MCP) server that routes a coding agent to four kinds of design work — parametric 3D modelling, measured drafting, editable canvas design and browser-based visual QA — through one local stdio connection, with 24 typed tools and no hosted service.',
    facts: [
      ['Connection', 'One local stdio MCP connection. No hosted service, VPS or account required for the server itself.'],
      ['Routes', 'MODEL (SolidCraft), DRAFT (CADCraft), RECONSTRUCT (CADCraft + SolidCraft), PRESENT (FigCraft). Each route is optional; nothing is staged automatically.'],
      ['Toolkit', '24 typed tools in eight families, the default awsm-design skill, and 21 optional specialist skills via --all-skills.'],
      ['Clients', supportedClients.join(', ') + '.'],
      ['Runtime & license', 'Node.js 18+ for AWSM. MIT licensed; free to use. Author: rikoarik on GitHub.'],
    ],
    faqHeading: 'A few useful answers.',
    sourceLabel: 'Read the source',
    sourceLinks: ['Product README', 'Installation guide', 'MIT license', 'FigCraft app'],
    faqs: [
      { question: 'What does MCP do in AWSM?', answer: 'Model Context Protocol lets a coding agent call tools through a standard connection. AWSM provides one local stdio MCP entry that the agent connects to once; the 24 built-in tools cover project context, assets, design foundations, handoff, browser QA, an optional gateway, 3D publishing and a local preview server. It runs on your computer, not a required hosted service.', source: sources.readme },
      { question: 'What are the four routes?', answer: 'They describe which application answers which kind of work: MODEL for a part or assembly that has to be real (SolidCraft), DRAFT for a plan someone can measure (CADCraft), RECONSTRUCT for a drawing that has to become a building (CADCraft and SolidCraft through one bridge), and PRESENT for a screen someone has to click (FigCraft). There is no hidden intent classifier: the agent decides, and any route can be skipped.', source: sources.readme },
      { question: 'Which coding agents can use AWSM?', answer: 'AWSM includes setup for OpenCode, [CC], Codex, Google Antigravity, GitHub Copilot CLI and Zed. Zed uses user-level configuration and requires --global; the other documented clients default to project-local setup.', source: sources.install },
      { question: 'Does AWSM need a server, account or API key?', answer: 'No hosted AWSM service is involved: the MCP server runs locally over stdio, and no key or account is needed for the server itself. Local-first does not mean offline-only — asset discovery, font downloads and GitHub installation checks can contact external providers, so review those terms.', source: sources.readme },
      { question: 'Does AWSM edit the FigCraft canvas?', answer: 'No. AWSM prepares FigCraft-to-code handoff context and can place a rendered PNG as an image layer through a configured FigCraft bridge; it does not edit the canvas. Canvas edits belong to FigCraft\'s own native MCP, configured separately, and FigCraft cannot hold an editable 3D scene.', source: sources.figcraft },
      { question: 'What does browser QA actually check?', answer: 'Browser QA uses locally installed Playwright and Chromium to inspect the rendered interface and collect screenshots, DOM checks and visual comparison evidence. It is not a WCAG certification or a guarantee that every accessibility issue has been found.', source: sources.readme },
    ],
  },
  id: {
    title: 'AWSM — MCP lokal untuk 3D, gambar teknik dan desain antarmuka',
    description: 'Satu server MCP lokal, empat rute: 3D parametrik di SolidCraft, gambar teknik terukur di CADCraft, kanvas yang bisa diedit di FigCraft, dan QA browser. 24 tool bertipe, tanpa layanan hosting.',
    heading: 'Kenali apa yang kamu buka.',
    definition: 'AWSM adalah server Model Context Protocol (MCP) lokal dan open source yang mengarahkan coding agent ke empat jenis pekerjaan desain — pemodelan 3D parametrik, gambar teknik yang terukur, desain kanvas yang bisa diedit, dan QA visual berbasis browser — melalui satu koneksi stdio lokal, dengan 24 tool bertipe dan tanpa layanan hosting.',
    facts: [
      ['Koneksi', 'Satu koneksi MCP stdio lokal. Tanpa layanan hosting, VPS, atau akun untuk server itu sendiri.'],
      ['Rute', 'MODEL (SolidCraft), GAMBAR (CADCraft), REKONSTRUKSI (CADCraft + SolidCraft), PRESENTASI (FigCraft). Setiap rute opsional; tidak ada yang disiapkan otomatis.'],
      ['Isi toolkit', '24 tool bertipe dalam delapan keluarga, skill bawaan awsm-design, dan 21 skill spesialis opsional melalui --all-skills.'],
      ['Agent', supportedClients.join(', ') + '.'],
      ['Runtime & lisensi', 'Node.js 18+ untuk AWSM. Lisensi MIT; gratis digunakan. Pembuat: rikoarik di GitHub.'],
    ],
    faqHeading: 'Jawaban yang perlu kamu tahu.',
    sourceLabel: 'Baca sumbernya',
    sourceLinks: ['README produk', 'Panduan instalasi', 'Lisensi MIT', 'Aplikasi FigCraft'],
    faqs: [
      { question: 'Apa fungsi MCP di AWSM?', answer: 'Model Context Protocol memungkinkan coding agent memanggil tool melalui koneksi standar. AWSM menyediakan satu pintu MCP stdio lokal yang dihubungi agent sekali; ke-24 tool bawaannya mencakup konteks proyek, aset, fondasi desain, handoff, QA browser, gateway opsional, penerbitan 3D, dan server pratinjau lokal. AWSM berjalan di komputermu, bukan pada layanan hosting wajib.', source: sources.readme },
      { question: 'Apa maksud empat rute itu?', answer: 'Rute menjelaskan aplikasi mana yang menjawab pekerjaan seperti apa: MODEL untuk part atau rakitan yang harus nyata (SolidCraft), GAMBAR untuk rencana yang bisa diukur (CADCraft), REKONSTRUKSI untuk gambar yang harus menjadi bangunan (CADCraft dan SolidCraft lewat satu bridge), dan PRESENTASI untuk layar yang harus diklik (FigCraft). Tidak ada pengelompok niat tersembunyi: agent yang memutuskan, dan rute mana pun boleh dilewati.', source: sources.readme },
      { question: 'Coding agent apa saja yang didukung AWSM?', answer: 'AWSM menyediakan setup untuk OpenCode, [CC], Codex, Google Antigravity, GitHub Copilot CLI, dan Zed. Zed memakai konfigurasi tingkat pengguna dan memerlukan --global; client lain yang didokumentasikan memakai setup lokal proyek secara default.', source: sources.install },
      { question: 'Apakah AWSM butuh server, akun, atau API key?', answer: 'Tidak ada layanan AWSM yang di-hosting: server MCP berjalan lokal lewat stdio, dan tidak perlu kunci atau akun untuk server itu sendiri. Lokal bukan berarti sepenuhnya offline — pencarian aset, unduhan font, dan pemeriksaan pembaruan di GitHub bisa menghubungi penyedia eksternal, jadi tinjau ketentuannya.', source: sources.readme },
      { question: 'Apakah AWSM mengedit kanvas FigCraft?', answer: 'Tidak. AWSM menyiapkan konteks handoff FigCraft ke kode dan bisa menaruh PNG hasil render sebagai image layer lewat bridge FigCraft yang dikonfigurasi; AWSM tidak mengedit kanvas. Pengeditan kanvas milik MCP native FigCraft yang dikonfigurasi terpisah, dan FigCraft tidak bisa menyimpan scene 3D yang bisa diedit.', source: sources.figcraft },
      { question: 'Apa yang diperiksa oleh QA browser?', answer: 'QA browser memakai Playwright dan Chromium yang terpasang lokal untuk memeriksa antarmuka yang dirender serta mengumpulkan screenshot, pemeriksaan DOM, dan bukti perbandingan visual. Ini bukan sertifikasi WCAG atau jaminan bahwa semua masalah aksesibilitas ditemukan.', source: sources.readme },
    ],
  },
} as const;
