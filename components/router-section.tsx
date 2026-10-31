'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { Copy } from '@/lib/content';

/** The viewer is a separate client bundle; the spec panel renders on the server. */
const RouterScene = dynamic(() => import('./router-scene').then((module) => module.RouterScene), {
  ssr: false,
  loading: () => (
    <div className="router-stage router-skeleton" aria-hidden="true">
      <Image src="/assets/3d/awsm-router/poster.webp" alt="" width={1100} height={1100} sizes="(max-width: 900px) 92vw, 44vw" />
    </div>
  ),
});

export function RouterSection({ t }: { t: Copy }) {
  return (
    <section id="router" className="router section" aria-labelledby="router-heading">
      <div className="wrap">
        <div className="router-head">
          <div>
            <span className="micro-label">{t.routerLabel}</span>
            <h2 id="router-heading">{t.routerTitle}</h2>
          </div>
          <p className="section-intro">{t.routerIntro}</p>
        </div>

        <div className="router-grid">
          <RouterScene t={t} />

          <div className="router-side">
            <dl className="router-specs">
              {t.routerSpecs.map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <figure className="router-detail">
              <Image
                src="/assets/3d/awsm-router/detail-ports.webp"
                alt={t.routerSpecs[0][0]}
                width={1200}
                height={565}
                sizes="(max-width: 900px) 90vw, 22vw"
              />
              <figcaption>{t.pipelineNumbersTitle}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
