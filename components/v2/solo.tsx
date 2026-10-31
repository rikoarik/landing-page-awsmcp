import Image from 'next/image';
import type { CopyV2 } from '@/lib/content-v2';
import { DisplayHeading } from './display';
import { ArrowRight } from './icons';

export function Solo({ t }: { t: CopyV2 }) {
  return (
    <section className="solo on-dark" id="three-d" aria-labelledby="solo-heading">
      <div className="wrap">
        <div className="solo-grid">
          <div className="solo-copy">
            <p className="kicker">{t.solo.kicker}</p>
            <DisplayHeading id="solo-heading" fit="fit-solo" className="h-lg" lines={t.solo.head} accents={[undefined, undefined, 'lime']} />
            <p className="solo-body">{t.solo.body}</p>
            <dl className="solo-specs">
              {t.solo.specs.map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <a className="solo-cta" href="#plan">
              {t.solo.cta}
              <ArrowRight />
              <i aria-hidden="true" />
            </a>
          </div>

          <div className="solo-plate">
            <p className="plate-label">{t.solo.plateLabel}</p>
            <figure className="solo-render">
              <Image
                src="/assets/v2/router-body.webp"
                alt={t.solo.alt}
                width={1320}
                height={772}
                sizes="(max-width: 1080px) 92vw, 46vw"
              />
            </figure>
            <div className="solo-dim" aria-hidden="true">
              <i />
              <span>{t.solo.widthLabel}</span>
              <i />
            </div>
            <figure className="solo-macro">
              <Image
                src="/assets/v2/macro-dial.webp"
                alt={t.solo.macroAlt}
                width={752}
                height={392}
                sizes="(max-width: 1080px) 80vw, 22vw"
              />
              <figcaption>
                <span>{t.solo.macroCap}</span>
                <span>{t.solo.macroCap2}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      <div className="solo-steps">
        <div className="wrap">
          <ol>
            {t.solo.steps.map(([name, note], index) => (
              <li key={name}>
                <span className="num">{`0${index + 1}`}</span>
                <span className="name">{name}</span>
                <span className="note">{note}</span>
                {index < t.solo.steps.length - 1 && (
                  <span className="arw" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div className="wrap solo-foot">
          <p className="fine">{t.solo.railFoot}</p>
        </div>
      </div>
    </section>
  );
}
