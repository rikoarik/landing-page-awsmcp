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
```

Set `QA_URL` if the site runs on another origin. The test suite uses localhost:3001 by default. No backend, environment variables, API credentials, deployment, or AWSM installation is needed. **The AWSM setup command displayed by this website is never automatically executed.**

## Structure

- `app/layout.tsx`: root document, metadata, local fonts
- `app/page.tsx`: route entry
- `app/globals.css`: brand tokens, all responsive compositions and interaction states
- `app/icon.svg`: original vector favicon
- `components/awsm-site.tsx`: section composition, header, bilingual state, mobile menu, hero circuit, handoff, agent choice, support/footer
- `components/playground.tsx`: keyboard-operable tabs and animated specimens
- `components/installer.tsx`: selected-client command and asynchronous clipboard/error states
- `components/motion-system.tsx`: scoped GSAP, ScrollTrigger, and Lenis lifecycle
- `lib/content.ts`: typed complete EN/ID copy
- `lib/installer.ts`: exact installer command generator, supported client/config map, official destinations
- `tests/installer.test.ts`: pure command-generation regression tests
- `tests/browser.mjs`: Playwright responsive and interaction regression suite
- `qa/`: local QA screenshots and JSON results (ignored from version control)

## Behavior and motion ownership

- Default language is English. `?lang=id` or `?lang=en` takes precedence over localStorage. Choosing a language persists it, updates the URL and `html[lang]`, and does not remount the page or reset scroll. Initial server markup is complete English; the saved/query language is applied after hydration.
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

## Verification and limits

Automated browser coverage: 1440×1000, 1280×800, 768×1024, 375×812 and 320×812, each EN/ID; no page overflow or broken images; SSR content; six client commands; clipboard success/denial; tab keyboard; language reload/localStorage/URL/document language; same page DOM on toggle; menu/Escape/anchor; official links; full-aspect local reference; dynamic reduced-motion/Lenis teardown; no browser console/page/hydration errors. Section screenshots cover workflow, playground, handoff, install and support, not just the hero. Agent-browser was also used to inspect real accessible controls and capture desktop/mobile visuals.

The live FigCraft document was inspected **read-only** and remains untouched. No deployment or actual donation was made. Outbound CTA destinations are verified from DOM values; payment submissions/download installation flows are intentionally not exercised. QA is Chromium-based, not a complete Safari/Firefox or assistive-technology certification. The website makes no WCAG certification or one-click pixel-perfect export claims.
