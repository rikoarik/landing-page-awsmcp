# AWSM website

A working implementation of the completed **AWSM — The creative circuit** FigCraft design. Next.js App Router + TypeScript, self-hosted Montserrat and Source Sans 3, exact flat brand palette, editable semantic sections, and local artwork.

## Run

Website development requires **Node.js 20.9+** (Node 22 recommended). This differs from AWSM's own advertised Node 18+ requirement.

```sh
npm ci
npm run dev -- --port 3001
```

Open <http://localhost:3001>. Port 3000 was already occupied by an unrelated app during implementation; it was left untouched.

```sh
npm run build
npm run start -- --port 3001
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run test:seo
npm run test:a11y
# Only needed when intentionally regenerating the committed social PNGs:
npm run generate:social
```

Set `QA_URL` if the site runs on another origin. The test suite uses localhost:3001 by default. No backend, environment variables, API credentials, deployment, or AWSM installation is needed. **The AWSM setup command displayed by this website is never automatically executed.**

## Structure

- `app/(english)/{layout,page}.tsx`: static English `/`, initial `html[lang=en]`
- `app/(indonesian)/layout.tsx`, `app/(indonesian)/id/page.tsx`: static Indonesian `/id`, initial `html[lang=id]`
- `components/site-document.tsx`: shared document, local fonts, theme viewport and ARD discovery link
- `components/localized-page.tsx`: server JSON-LD and localized page composition
- `components/product-answers.tsx`: server-rendered facts, sources and six native FAQs
- `lib/site-config.ts`, `lib/seo.ts`, `lib/seo-content.ts`: validated origin/indexing configuration, metadata/schema builders and bilingual source-backed data
- `proxy.ts`: narrow permanent legacy language-query redirects
- `app/{robots,sitemap}.ts`, `app/llms.txt/route.ts`: static discovery routes
- `app/.well-known/ard.json/route.ts`, `lib/agent-discovery.ts`: ARD v0.91 skill reference
- `app/global-not-found.tsx`: real 404 with automatic noindex (multi-root support)
- `public/social/awsm-{en,id}.png`, `scripts/generate-social.mjs`: branded social previews and reproducible local rendering
- `app/globals.css`: brand tokens, all responsive compositions and interaction states
- `app/icon.svg`: original vector favicon
- `components/awsm-site.tsx`: section composition, header, authoritative locale prop, mobile menu, hero circuit, handoff, agent choice, support/footer
- `components/playground.tsx`: keyboard-operable tabs and animated specimens
- `components/installer.tsx`: selected-client command and asynchronous clipboard/error states
- `components/motion-system.tsx`: scoped GSAP, ScrollTrigger, and Lenis lifecycle
- `lib/content.ts`: typed complete EN/ID copy
- `lib/installer.ts`: exact installer command generator, supported client/config map, official destinations
- `tests/installer.test.ts`: pure command-generation regression tests
- `tests/browser.mjs`: Playwright responsive and interaction regression suite
- `qa/`: local QA screenshots and JSON results (ignored from version control)

## Behavior and motion ownership

- `/` is English and `/id` is Indonesian, including initial server HTML, `html[lang]`, title, description, FAQ and JSON-LD. Both work with JavaScript disabled. The explicit URL is authoritative: old localStorage preferences never switch it. Crawlable EN/ID anchors perform real full-document navigation between separate root layouts, so metadata cannot go stale. With JS, the current section hash is copied to the destination. `/?lang=id` permanently redirects (308) to `/id`, and `/?lang=en` to `/`; `/id?lang=en|id` is supported too. Redirects remove all `lang` parameters, preserve other query parameters and browser-inherited fragments, and do not loop. Unknown lang values are removed while retaining the current route.
- Capability tabs support arrows, Home/End, click, roving tab focus, and linked `tabpanel` semantics. Framer Motion `AnimatePresence` handles specimen swaps; `MotionConfig reducedMotion="user"` and `useReducedMotion` make menu/tab changes instant for reduced-motion users.
- Agent buttons use `aria-pressed`; choosing one updates the visible and copied command. Zed alone appends `--global`.
- Clipboard success appears only after `navigator.clipboard.writeText` resolves. Denial/unavailability shows localized manual-select instructions. The command remains keyboard focusable and selectable. Changing the client clears the previous copy state; stale clipboard promises cannot overwrite it.
- Mobile menu has expansion/control attributes, Escape focus return, and closes after real anchor navigation.
- GSAP owns only circuit assembly/cable stroke, modest desktop hub parallax, workflow port progression, and handoff-plane convergence. `gsap.matchMedia` scopes and reverts all its animations/triggers. No global trigger destruction, no pinning, no long spacer, no whole-page fade/hidden primary content.
- Lenis is the sole smooth-scroll RAF owner through GSAP's ticker (`time * 1000`), uses real anchors, and forwards scroll to ScrollTrigger. Its listener/ticker are removed and instance destroyed during cleanup or a dynamic reduced-motion preference change. Reduced motion uses native scrolling, visible/static content, and no scrub/parallax.

## Assets and provenance

- `public/assets/Hero.png`: copied without alteration from the project owner's `/Users/macbookm2/Documents/Hero.png` (1440 × 840). Displayed at its complete aspect ratio as an honestly captioned **supplied design reference**, not as AWSM output. Original ownership/permission remains with the project owner.
- `app/fonts/Montserrat.woff2`: official Google Fonts Latin variable file, <https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2>.
- `app/fonts/SourceSans3.woff2`: official Google Fonts Latin variable file, <https://fonts.gstatic.com/s/sourcesans3/v20/nwpStKy2OAdR1K-IwhWudF-R3w8aZQ.woff2>.
- Font licenses are included in `app/fonts/Montserrat-OFL.txt` and `app/fonts/SourceSans3-OFL.txt` (SIL OFL 1.1), retrieved from the official `google/fonts` repository.
- Existing root **`fonts/` and `fonts.css` remain preserved and are not imported or rewritten**. No font/image requests are made to third-party servers at runtime or build time.
- Hero circuit, browser/layer planes, arrows, favicon, and source seal are original DOM/CSS/simple SVG implementations, not screenshots of the website. FigCraft reference exports/manifest are not shipped in the site.
- Product facts and commands were checked against <https://github.com/rikoarik/figcraft-mcp-awsm#readme>. External FigCraft CTA goes to <https://getartcraft.com/apps/figcraft>. The single coffee support CTA goes to <https://saweria.co/arkids>. No QRIS CTA, visible payment URL, payment-method helper, or direct QR/payment payload is shown.

## SEO, GEO and agent discovery

The confirmed canonical origin is **https://useawsm.web.id** (no `www`). `lib/site-config.ts` is the single source for generated URLs. `SITE_URL` may override it with a public HTTP(S) origin; credentials, non-root paths, query strings, fragments and localhost are rejected. No incoming Host header determines a canonical URL. `.env.example` is explicitly allowed through `.gitignore`.

- Both locale pages have localized static titles/descriptions, self-canonicals, reciprocal `en`/`id`/`x-default` alternates, Open Graph locale/alternate locale/URL, PNG image dimensions/alt, Twitter large-image metadata, accessible viewport and acid theme color. Next normalizes the root origin with or without its equivalent trailing slash in some HTML metadata.
- `public/social/awsm-en.png` and `awsm-id.png` are actual 1200×630 PNGs with original circuit artwork and local Montserrat/Source Sans 3. `npm run generate:social` reproduces them with Chromium and data-embedded WOFF2 fonts, not Satori's unsupported WOFF2 path. No network fetch is needed to build or serve them.
- Server JSON-LD connects WebSite, WebPage, SoftwareSourceCode, SoftwareApplication (linked via source `targetProduct`), the verified GitHub handle `rikoarik`, and FAQPage using stable IDs. Product identity points to `rikoarik/figcraft-mcp-awsm`, not the landing-page repository. `<` is escaped before serialization into the script. No invented reviews, ratings, company, search action, hosted endpoint or offers.
- Visible product facts and six native bilingual FAQs cite the product README, installation guide, license and official FigCraft app. FAQ structured answers use the exact same data as the visible answers. No FAQ rich-result eligibility or AI citation is promised.
- `/sitemap.xml` lists only the two canonical page URLs with reciprocal alternates, no fabricated last-modified dates. `/robots.txt` allows public crawlers and advertises the production sitemap when indexable.
- `/llms.txt` is Markdown with an H1, blockquote summary, details and H2 link lists. It is an **optional emerging inference discovery convention**, not a Google indexing requirement, training/crawl permission policy, ranking instruction or visibility guarantee. It is generated from shared product data, the verified 23-tool inventory in `lib/llms.ts`, and the same six client command helpers used by the installer UI (including Zed-only `--global`). The owner-supplied `llms.txt` was incorporated with corrections: local stdio is not an offline/privacy guarantee, third-party operations may use the network, and commands remain examples rather than automatic execution.
- `/.well-known/ard.json` and a server-head `rel=ard` link publish one ARD v0.91 entry pointing to the **real upstream awsm-design SKILL.md** (`application/agent-skills+md`). Its domain-anchored URN is `urn:air:useawsm.web.id:skill:awsm-design`. It advertises a Markdown guide, not a hosted MCP server, registry, API, certification, or trust signature. No remote calls run in the visitor's browser. Official conformance CLI + Draft 2020-12 schema validation passed locally with **zero errors and zero warnings**; evidence: `qa/seo-ard-conformance.txt`. ARD v0.91 is a proposal and may change.
- WebMCP form coverage is **not applicable**: this marketing site has no forms or hosted tool-execution backend. No WebMCP tools/polyfill or misleading exposure of AWSM's 23 local tools was added just for an informational Lighthouse audit. Native WebMCP registration was not tested or claimed; it is not needed for the current site interactions.

### Indexing and preview safety

`VERCEL_ENV=preview` **or** `SITE_INDEXABLE=false` sets page robots `noindex,nofollow`, adds an `X-Robots-Tag` response header, disallows all in robots, and emits an empty sitemap. Vercel preview cannot be made indexable with `SITE_INDEXABLE=true`. Generic staging hosts must explicitly set `SITE_INDEXABLE=false`. The default is indexable, including local development, so production metadata can be inspected locally. These settings are read at build/config evaluation time: **rebuild after changing SEO environment variables**, and run with matching configuration. Canonicals remain the configured production URLs even in previews. Noindex/robots are crawler signals, not access controls; protect genuinely private staging separately.

### Google and Bing verification (no analytics)

The owner's exact Google HTML-tag token is configured by default in server metadata on **both** language pages:

```html
<meta name="google-site-verification" content="SkWS9P140S5JIylgkVzrSNzP3s4OgZo-XN8DSd0OZAY" />
```

`GOOGLE_SITE_VERIFICATION` optionally overrides this token. The earlier supplied HTML verification file is also preserved byte-for-byte at `public/googled18487ecc4f9648a.html`; its expected public URL after publishing is <https://useawsm.web.id/googled18487ecc4f9648a.html>. Both methods have been checked locally, **not remotely verified in Search Console**. `BING_SITE_VERIFICATION` emits `msvalidate.01` only when configured. These are public ownership tokens, not Analytics IDs: no `analytics.js`, `gtag.js`, trackers, cookies or analytics dependency was added.

### External launch checklist (not performed here)

1. Publish the changes only after review; confirm the host serves `/id`, discovery routes and the verification file, and uses HTTPS for the apex domain. Configure an intentional permanent `www` → apex redirect at the host if needed. DNS/TLS/host configuration is outside this code change.
2. Ensure the production build is indexable, the canonical origin is `https://useawsm.web.id`, and no CDN/WAF or deployment password blocks intended crawlers. Preview hosts should remain noindex.
3. In the owner's Search Console, choose HTML tag or HTML file verification and press Verify after the artifact is actually public. Configure Bing verification if desired. Submit <https://useawsm.web.id/sitemap.xml> in Search Console/Bing; inspect both locale URLs.
4. Run public Schema Markup Validator / Google Rich Results Test and share-preview checks. Valid FAQ markup does not promise Google FAQ rich results. Inspect PageSpeed Insights and, after enough real traffic, field Core Web Vitals; local Chromium QA is not field performance data.
5. Recheck product claims/discovery references when the upstream toolkit changes. Search crawling, indexing, rankings, AI answers and citations are never guaranteed by metadata, schema, llms.txt or ARD.

## Verification and limits

Automated browser coverage: 1440×1000, 1280×800, 768×1024, 375×812 and 320×812, each EN/ID; no page overflow or broken images; SSR content; six client commands; clipboard success/denial; tab keyboard; real language-route navigation/hash preservation and URL authority over localStorage; native keyboard FAQs; persistent valid tab ARIA target; menu/Escape/anchor; official links; full-aspect local reference; dynamic reduced-motion/Lenis teardown; no browser console/page/hydration errors. Section screenshots cover workflow, playground, handoff, install and support, not just the hero. Agent-browser was also used to inspect real accessible controls and capture desktop/mobile visuals.

SEO verification additionally covers nine unit tests; initial HTTP HTML/head and JSON-LD for both locales with JavaScript disabled; canonical/hreflang/OG/Twitter/Google tag; legacy 308 redirects without loops; robots/sitemap/llms/ARD; actual PNG signatures and dimensions; native FAQ keyboard toggles; real noindex 404; exact verification-file bytes. The normal production build was served and passed both SEO and interaction suites on local port 3002. A separate temporary preview production build (`SITE_INDEXABLE=false`) passed the same SEO HTTP checks on port 3003, including noindex headers/meta, disallow robots and empty sitemap; the main development server on 3001 was not restarted. Evidence: `qa/seo-http-results.json`, `qa/seo-preview-results.json`, `qa/results.json`, `qa/seo-ard-conformance.txt`, and `qa/seo-{facts,faq}-{desktop,mobile}-{en,id}.png`. Next's documented experimental `globalNotFound` option is used for a real 404 with multiple root layouts and should be rechecked when upgrading Next.

The live FigCraft document was inspected **read-only** and remains untouched. No deployment or actual donation was made. Outbound CTA destinations are verified from DOM values; payment submissions/download installation flows are intentionally not exercised. QA is Chromium-based, not a complete Safari/Firefox or assistive-technology certification. The website makes no WCAG certification or one-click pixel-perfect export claims.
