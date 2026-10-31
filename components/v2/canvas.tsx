import Image from 'next/image';
import type { CopyV2 } from '@/lib/content-v2';
import { DisplayHeading } from './display';

export function Canvas({ t }: { t: CopyV2 }) {
  return (
    <section className="canvas" id="canvas" aria-labelledby="canvas-heading">
      <div className="wrap">
        <p className="kicker">{t.canvas.kicker}</p>
        <div className="canvas-grid">
          <div>
            <DisplayHeading id="canvas-heading" fit="fit-canvas" className="h-md" lines={t.canvas.head} accents={[undefined, undefined, 'orange']} />
            <p className="lede canvas-lede">{t.canvas.lede}</p>
            <dl className="canvas-facts">
              {t.canvas.facts.map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <figure className="canvas-plate">
              <Image
                src="/assets/v2/figcraft-window.webp"
                alt={t.canvas.alt}
                width={1528}
                height={836}
                sizes="(max-width: 1080px) 92vw, 54vw"
              />
              <figcaption>
                <span className="label">{t.canvas.plateCap}</span>
                <span className="fine">{t.canvas.plateCap2}</span>
              </figcaption>
            </figure>
            <p className="canvas-anno">
              <i aria-hidden="true" />
              <span>{t.canvas.annoLabel}</span>
            </p>
          </div>
        </div>

        <dl className="canvas-rails">
          {t.canvas.rails.map(([term, value]) => (
            <div key={term}>
              <dt className="k">{term}</dt>
              <dd className="v">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="canvas-foot">
          <p className="fine">{t.canvas.railFoot}</p>
        </div>
      </div>
    </section>
  );
}
