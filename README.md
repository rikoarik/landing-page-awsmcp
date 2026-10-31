# AWSM website

The landing page for **AWSM**, built from the FigCraft design document
*"AWSM — The creative circuit"* page 02, frame **"V2 / Desktop — 1440"**
(*Intent, not pipeline*). Next.js App Router + TypeScript, self-hosted fonts, and
artwork exported from that same document.

The page's argument: AWSM is one local MCP server with **four routes** through it
— MODEL (SolidCraft), DRAFT (CADCraft), RECONSTRUCT (CADCraft + SolidCraft),
PRESENT (FigCraft). Nothing is staged for you and no route is mandatory.

## Run

Website development requires **Node.js 20.9+** (Node 22 recommended). This differs
from AWSM's own advertised Node 18+ requirement.

```sh
npm ci
npm run dev -- --port 3001
```

Open <http://localhost:3001>. Port 3000 was already occupied by an unrelated app
during implementation; it was left untouched.

```sh
npm run build
npm run start -- --port 3001
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run test:seo
npm run test:a11y
# Regenerate the committed social PNGs (never part of a normal build):
npm run generate:social
```

The Playwright suites read `QA_URL` (default `http://localhost:3001`).

## Structure

- `app/(english)/{layout,page}.tsx`: static English `/`, initial `html[lang=en]`
- `app/(indonesian)/layout.tsx`, `app/(indonesian)/id/page.tsx`: static Indonesian `/id`, initial `html[lang=id]`
- `components/site-document.tsx`: shared document, self-hosted Archivo + IBM Plex Mono, theme viewport and ARD discovery link
- `components/localized-page.tsx`: server JSON-LD and localized page composition
- `components/awsm-site.tsx`: the section order (00 nav → 11 answers → footer)
- `components/v2/display.tsx`: `DisplayHeading` — each designed line is a fixed span sized against its own column via `cqi`
- `components/v2/site-header.tsx`: nav, language switch, mobile menu (Escape returns focus)
- `components/v2/hero.tsx`, `intent.tsx`, `solo.tsx`, `plan.tsx`, `connection.tsx`, `tools.tsx`, `canvas.tsx`, `install.tsx`, `skills.tsx`, `support.tsx`, `answers.tsx`, `footer.tsx`: one component per numbered section
- `components/v2/plan-drawing.tsx`: the courtyard study as vector, transcribed from the frame (walls, glazing, door swings, dimensions, north point, scale)
- `components/v2/icons.tsx`: inline arrows, because the font subsets omit U+2192/U+2197
- `components/motion-system.tsx`: live reduced-motion switch for Lenis, plus one intersection-triggered fade-up
- `lib/content-v2.ts`: typed EN/ID copy, the eight tool families and the 21 specialists
- `lib/installer.ts`: exact installer/upgrade command generators, client/config map, official destinations
- `lib/site-config.ts`, `lib/seo.ts`, `lib/seo-content.ts`, `lib/llms.ts`, `lib/agent-discovery.ts`: origin validation, metadata/schema, bilingual facts and FAQs, `llms.txt`, ARD
- `proxy.ts`: narrow permanent legacy language-query redirects
- `app/{robots,sitemap}.ts`, `app/llms.txt/route.ts`, `app/.well-known/ard.json/route.ts`: static discovery routes
- `app/global-not-found.tsx`: real 404 with automatic noindex (multi-root support)
- `app/globals.css`: V2 tokens, type scale, every section, responsive states, reduced motion, print
- `public/assets/v2/`: the five images exported from the design document (see *Assets*)
- `public/social/awsm-{en,id}.png`, `scripts/generate-social.mjs`: branded social previews, rendered locally from the shipped fonts and render
- `scripts/build-3d.mjs`, `render-3d.mjs`, `three-scene.mjs`, `figcraft-*.mjs`, `place-in-figcraft.mjs`, `build-figcraft-board.mjs`: the 3D asset pipeline and FigCraft helpers kept from the previous page
- `tests/*.test.ts`: pure regression tests; `tests/{browser,accessibility,seo-http}.mjs`: Playwright suites
- `qa/`: local QA screenshots and JSON results (ignored from version control)

## The design source

The page is transcribed from the live FigCraft document, not invented:

| Section | Frame | Implementation |
|---|---|---|
| 00 Nav | `S00 / Nav` | `site-header.tsx` |
| 01 Hero | `S01 / Hero` | `hero.tsx` — coral rule at 774px, dark plate, caption block |
| 02 Intent | `S02 / Intent` | `intent.tsx` — four-row table, row 03 highlighted |
| 03 3D only | `S03 / 3D only` | `solo.tsx` — plate, dimension rule, macro detail, 4-step rail |
| 04 Plan → 3D | `S04 / Plan to 3D` | `plan.tsx` + `plan-drawing.tsx` |
| 05 Connection | `S05 / Connection` | `connection.tsx` — stdio wiring plate, `bridges.json` |
| 06 Tools | `S06 / Tools` | `tools.tsx` — eight families, 24 names, counts |
| 07 Canvas | `S07 / Canvas` | `canvas.tsx` — FigCraft window, three facts, four rails |
| 08 Install | `S08 / Install` | `install.tsx` — terminal, client choice, app cards, upgrade |
| 09 Skills | `S09 / Skills` | `skills.tsx` — core skill, 21 specialists, three rules |
| 10 Support | `S10 / Support` | `support.tsx` — one Saweria link |
| 11 Answers | *(added)* | `answers.tsx` — visible facts and six FAQs that match the JSON-LD |

Typography maps the frame's `Helvetica Neue Condensed Black / Helvetica Neue /
Menlo` onto **Archivo** (using its `wdth` axis at 70% and `wght` 900) and
**IBM Plex Mono**. Both are self-hosted from `app/fonts/` under the SIL OFL, so
the page makes no third-party font request. Because the Archivo subset's space
glyph is narrower than Helvetica Neue's, `.display` carries a small
`word-spacing` correction; the stylesheet explains why.

Display headings are set as fixed lines. Each `DisplayHeading` sits in a
`container-type: inline-size` wrapper and its size is
`min(--fit-max, 100cqi * --fit-scale)`, so a line narrows with its column instead
of re-wrapping between breakpoints. `tests/browser.mjs` asserts that no display
line wraps at 1440, 1280, 768, 375 or 320 px, in either language.

## Behavior and motion ownership

- Lenis is only for wheel smoothing and anchors. `prefers-reduced-motion` is
  treated as a **live** preference: a `change` listener destroys and rebuilds it,
  and nothing is left mid-transition.
- The only entrance animation is a single fade-up on `.section-head`,
  `.plan-grid`, `.solo-grid`, `.wiring`, `.terminal` and `.core`, added by
  `IntersectionObserver` when reduced motion is off. No pinning, no scrubbed
  transforms, no hover-only information.
- The hero render, the plate macro and the plan reconstruction are ordinary
  images with `alt` text. Nothing depends on WebGL to make the page legible.
- The intent table's four rows are links to the sections that answer them
  (`#three-d`, `#plan`, `#plan`, `#canvas`); keyboard focus outlines the row.
- Copy buttons announce success and failure through `aria-live`; a denied
  clipboard falls back to a focusable, selectable command block.

## The 3D asset: AWSM Router

The router on this page is the same SolidCraft model the previous version used:
`scripts/build-3d.mjs` converted the SolidCraft OBJ export into the GLB and
emitted socket anchors; `scripts/render-3d.mjs` verified it in headless
Chromium/WebGL. That pipeline is kept, along with `public/assets/3d/awsm-router/`
(model, poster, detail frames) and `public/assets/3d/figcraft-board.webp`.

The V2 page shows the render exported from the design document
(`public/assets/v2/router-hero.webp`, `router-body.webp`, `macro-dial.webp`), so
the page and the canvas show the same object. The interactive WebGL viewer from
the previous design is not part of this page.

### Measured, not copied

The design frame's spec table carried numbers that do not match the model — an
86 mm depth, a Ø 42 mm dial and a 12 mm port pitch. Measured from
`model.obj` (17,519 vertices) the part is:

| Dimension | Frame said | Measured |
|---|---|---|
| Envelope | 124 × 86 × 24 mm | **124 × 88.8 × 38 mm** |
| Front bores | 4 × Ø 18 mm, 12 mm pitch | **4 × Ø 12 mm bore, 24 mm pitch** |
| Dial | Ø 42 mm, 4 detents | **Ø 70.9 mm, 24 facets** |
| Mesh | — | 25,186 triangles, 10 materials |

The page prints the measured values, and `tests/three-d-asset.test.ts` derives the
envelope from the OBJ and fails if the copy drifts back to the frame's figures.

### Known limitation in the upstream publish path

AWSM 1.0 validates a geometry-only OBJ, but SolidCraft's OBJ writer always emits a
sibling `.mtl` referenced by `mtllib`. Until one side changes, the one-call
`publish_3d_asset` path stops at that check, and the asset package here was
produced from the same export by hand. SolidCraft must be granted write access to
the target folder with `--allow-path` — never `--allow-any-path`.

## Assets and provenance

- `public/assets/v2/router-hero.webp`, `router-body.webp`, `macro-dial.webp`,
  `plan-render.webp`, `figcraft-window.webp`: exported from the FigCraft document
  with its own `export` tool at 2× and converted to WebP locally (sharp). The
  `.png` exports are kept beside them as the untouched source.
- The courtyard plan is **not** an image: `components/v2/plan-drawing.tsx` redraws
  it as SVG from the frame's own coordinates, so walls, door swings and
  dimensions scale without blurring and carry an `aria-label`.
- The FigCraft window image is a screenshot of the real open document (page 02),
  placed in the frame; the page says plainly that AWSM does not edit the canvas
  and that canvas edits belong to FigCraft's own MCP.
- Fonts: Archivo and IBM Plex Mono, both SIL OFL, with the licence files beside
  them in `app/fonts/`.
- `public/assets/3d/awsm-router/`: the SolidCraft export and its generated GLB,
  kept for provenance and for the pipeline tests.
- The V1 page's components (`router-section`, `router-scene`, `pipeline-section`,
  `playground`, `installer`, `update-notice`, `product-answers`, `lib/content.ts`,
  `fonts.css`) and its unreferenced `public/assets/Hero.png` were deleted with the
  redesign rather than left in the tree.

## SEO, GEO and agent discovery

The page is static and server-rendered in both languages, with parallel metadata.
What changed with V2:

- Titles and descriptions now lead with the four-route story
  (`lib/seo-content.ts`). The FAQ and `ProductAnswers`-style fact table are on the
  page itself in section 11, so the visible answer and the structured answer are
  the same string — `tests/seo-http.mjs` compares them, with JavaScript disabled.
- `lib/llms.ts` gained a **Routes** section and a bulleted **Boundaries** section.
  The tool inventory stays grouped and counted exactly as the page's index table
  shows it: eight families, 24 unique names, `publish_3d_asset` included.
- `lib/agent-discovery.ts` advertises five representative queries (the four routes
  plus the skill itself) and a `cadcraft-drafting-guidance` capability.
- `theme-color` is now `#F2EFE6` (the paper token); the social cards are
  regenerated from the new design at 1200 × 630.

### What the page does not claim

- No hosted service, account or API key is implied; "local-first" is qualified as
  not-offline-only, because asset discovery, fonts and GitHub checks reach out.
- No hidden intent classifier: the four routes are a way to describe which
  application answers which work, and the agent decides.
- AWSM does not edit the FigCraft canvas; FigCraft receives a PNG layer, never an
  editable 3D scene. No Figma integration is claimed.
- Browser QA is evidence, not a WCAG certificate. No ranking, citation or
  rich-result outcome is promised.

### Indexing and preview safety

`SITE_INDEXABLE=false` or a Vercel preview build emits `X-Robots-Tag: noindex,
nofollow`, a `Disallow: /` robots file and an empty sitemap. Canonicals are
configured from `SITE_URL` and never inferred from the request host.

## Verification and limits

Committed evidence lives in `qa/` for local runs; the suites are the source of
truth:

- `npm test` — installer commands, `llms.txt` shape and inventory, SEO/schema,
  ARD, and the 3D asset's geometry-vs-copy checks.
- `npm run test:browser` — 1440 × 1000, 1280 × 800, 768 × 1024, 375 × 812 and
  320 × 812, each EN/ID: section order, intent links resolving to real sections,
  24 unique tools in eight counted groups, six client commands, clipboard success
  **and** denial, locale navigation with hash preservation, mobile menu plus
  Escape, outbound destinations (asserting that no link points at the retired
  `figcraft-mcp-awsm` URL), no horizontal overflow, no wrapped display line, every
  image decoded, live reduced-motion teardown, and no console or page errors.
- `npm run test:a11y` — axe-core ARIA rules across both locales, desktop and mobile,
  with the menu open. Not a full WCAG audit.
- `npm run test:seo` — JS-disabled SSR metadata, canonical/hreflang, JSON-LD parity
  with the visible FAQ, 404, redirects, discovery files, verification tag.

Not covered: Safari and Firefox rendering, real assistive-technology testing,
deployment, and the FigCraft canvas itself (edited by hand through its MCP). No
WCAG certification or pixel-identical-export claim is made.
