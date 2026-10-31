import type { Lang } from '@/lib/content-v2';
import { v2 } from '@/lib/content-v2';
import { SiteHeader } from './v2/site-header';
import { Hero } from './v2/hero';
import { Intent } from './v2/intent';
import { Solo } from './v2/solo';
import { Plan } from './v2/plan';
import { Connection } from './v2/connection';
import { Tools } from './v2/tools';
import { Canvas } from './v2/canvas';
import { Install } from './v2/install';
import { Skills } from './v2/skills';
import { Support } from './v2/support';
import { Answers } from './v2/answers';
import { Footer } from './v2/footer';
import { MotionSystem } from './motion-system';

/**
 * V2 "Intent, not pipeline" — the page transcribed from the FigCraft design
 * document. Section order, numbering and copy follow that frame; the install,
 * answers and upgrade blocks reuse the existing client logic and source facts.
 */
export function AwsmSite({ lang }: { lang: Lang }) {
  const t = v2[lang];

  return (
    <div data-language={lang} data-design="v2">
      <MotionSystem />
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <SiteHeader t={t} lang={lang} />
      <main id="main">
        <Hero t={t} />
        <Intent t={t} />
        <Solo t={t} />
        <Plan t={t} />
        <Connection t={t} />
        <Tools t={t} />
        <Canvas t={t} />
        <Install t={t} />
        <Skills t={t} />
        <Support t={t} />
        <Answers t={t} lang={lang} />
      </main>
      <Footer t={t} lang={lang} />
    </div>
  );
}
