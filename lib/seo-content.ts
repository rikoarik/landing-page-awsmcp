export const sources = {
  readme: 'https://github.com/rikoarik/figcraft-mcp-awsm#readme',
  install: 'https://github.com/rikoarik/figcraft-mcp-awsm#quick-start',
  repository: 'https://github.com/rikoarik/figcraft-mcp-awsm',
  license: 'https://github.com/rikoarik/figcraft-mcp-awsm/blob/main/LICENSE',
  figcraft: 'https://getartcraft.com/apps/figcraft',
};
export const supportedClients = ['OpenCode', 'Claude Code', 'Codex', 'Google Antigravity', 'GitHub Copilot CLI', 'Zed'];
export const seoCopy = {
  en: {
    title: 'AWSM — Local MCP toolkit for UI design & coding agents',
    description: 'Give coding agents UI design context, assets, FigCraft handoff and browser QA. AWSM is an open-source local MCP server with 23 typed tools. No VPS required.',
    heading: 'Know what you’re connecting.',
    definition: 'AWSM is an open-source local Model Context Protocol (MCP) server that gives coding agents UI design utilities, asset discovery, FigCraft-to-code handoff and browser-based visual QA through one MCP connection.',
    facts: [['Connection', 'Local stdio. No hosted service or VPS required.'], ['Toolkit', '23 typed tools, the default awsm-design skill and 21 optional specialist skills via --all-skills.'], ['Clients', supportedClients.join(', ') + '.'], ['Runtime & license', 'Node.js 18+ for AWSM. MIT licensed; free to use. Author: rikoarik on GitHub.']],
    faqHeading: 'A few useful answers.',
    sourceLabel: 'Read the source',
    sourceLinks: ['Product README', 'Installation guide', 'MIT license', 'FigCraft app'],
    faqs: [
      { question: 'What does MCP do in AWSM?', answer: 'Model Context Protocol lets a coding agent call tools through a standard connection. AWSM provides one local stdio MCP entry for design utilities, asset discovery, handoff preparation and browser QA. It runs on your computer, not a required hosted service.', source: sources.readme },
      { question: 'Which coding agents can use AWSM?', answer: 'AWSM includes setup for OpenCode, Claude Code, Codex, Google Antigravity, GitHub Copilot CLI and Zed. Zed uses user-level configuration and requires --global; the other documented clients default to project-local setup.', source: sources.install },
      { question: 'What is included, and what do I need to run it?', answer: 'AWSM includes 23 typed tools and the default awsm-design skill. The --all-skills option installs 21 additional specialist skills. AWSM requires Node.js 18 or newer and runs locally over stdio; no VPS is required.', source: sources.readme },
      { question: 'Does AWSM edit the FigCraft canvas?', answer: 'No. AWSM prepares FigCraft-to-code handoff context; it does not edit the canvas. Native FigCraft MCP editing is a separate connection configured with the FigCraft app. Handoff is not a promise of one-click pixel-perfect export.', source: sources.figcraft },
      { question: 'What does browser QA actually check?', answer: 'Browser QA uses locally installed Playwright and Chromium to inspect the rendered interface and collect screenshots, DOM checks and visual comparison evidence. It is not a WCAG certification or a guarantee that every accessibility issue has been found.', source: sources.readme },
      { question: 'Where does the installation command come from?', answer: 'The command shown here uses the setup entry point in the public rikoarik/figcraft-mcp-awsm GitHub repository. Review the installation guide and MIT license before running it. This website never executes the command for you.', source: sources.install },
    ],
  },
  id: {
    title: 'AWSM — Toolkit MCP lokal untuk desain UI & coding agent',
    description: 'Bekali coding agent dengan konteks desain UI, aset, handoff FigCraft dan QA browser. AWSM adalah server MCP lokal open source dengan 23 tool. Tanpa VPS.',
    heading: 'Kenali yang kamu hubungkan.',
    definition: 'AWSM adalah server Model Context Protocol (MCP) lokal dan open source yang menyediakan utilitas desain UI, pencarian aset, handoff FigCraft ke kode, dan QA visual berbasis browser untuk coding agent melalui satu koneksi MCP.',
    facts: [['Koneksi', 'Stdio lokal. Tidak memerlukan layanan hosting atau VPS.'], ['Isi toolkit', '23 tool bertipe, skill bawaan awsm-design, dan 21 skill spesialis opsional melalui --all-skills.'], ['Agent', supportedClients.join(', ') + '.'], ['Runtime & lisensi', 'Node.js 18+ untuk AWSM. Lisensi MIT; gratis digunakan. Pembuat: rikoarik di GitHub.']],
    faqHeading: 'Jawaban yang perlu kamu tahu.',
    sourceLabel: 'Baca sumbernya',
    sourceLinks: ['README produk', 'Panduan instalasi', 'Lisensi MIT', 'Aplikasi FigCraft'],
    faqs: [
      { question: 'Apa fungsi MCP di AWSM?', answer: 'Model Context Protocol memungkinkan coding agent memanggil tool melalui koneksi standar. AWSM menyediakan satu koneksi MCP stdio lokal untuk utilitas desain, pencarian aset, persiapan handoff, dan QA browser. AWSM berjalan di komputermu, bukan pada layanan hosting wajib.', source: sources.readme },
      { question: 'Coding agent apa saja yang didukung AWSM?', answer: 'AWSM menyediakan setup untuk OpenCode, Claude Code, Codex, Google Antigravity, GitHub Copilot CLI, dan Zed. Zed memakai konfigurasi tingkat pengguna dan memerlukan --global; client lain yang didokumentasikan memakai setup lokal proyek secara default.', source: sources.install },
      { question: 'Apa isinya, dan apa syarat menjalankannya?', answer: 'AWSM berisi 23 tool bertipe dan skill bawaan awsm-design. Opsi --all-skills memasang 21 skill spesialis tambahan. AWSM memerlukan Node.js 18 atau lebih baru dan berjalan lokal melalui stdio; tidak perlu VPS.', source: sources.readme },
      { question: 'Apakah AWSM mengedit kanvas FigCraft?', answer: 'Tidak. AWSM menyiapkan konteks handoff FigCraft ke kode, bukan mengedit kanvas. Pengeditan melalui MCP native FigCraft memerlukan koneksi terpisah yang dikonfigurasi di aplikasi FigCraft. Handoff bukan janji ekspor pixel-perfect sekali klik.', source: sources.figcraft },
      { question: 'Apa yang diperiksa oleh QA browser?', answer: 'QA browser memakai Playwright dan Chromium yang terpasang lokal untuk memeriksa antarmuka yang dirender serta mengumpulkan screenshot, pemeriksaan DOM, dan bukti perbandingan visual. Ini bukan sertifikasi WCAG atau jaminan bahwa semua masalah aksesibilitas ditemukan.', source: sources.readme },
      { question: 'Dari mana asal perintah instalasinya?', answer: 'Perintah di halaman ini memakai entry point setup dari repositori GitHub publik rikoarik/figcraft-mcp-awsm. Tinjau panduan instalasi dan lisensi MIT sebelum menjalankannya. Situs ini tidak pernah mengeksekusi perintah untukmu.', source: sources.install },
    ],
  },
} as const;
