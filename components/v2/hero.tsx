import Image from 'next/image';
import type { CopyV2 } from '@/lib/content-v2';
import { DisplayHeading } from './display';
import { ArrowRight } from './icons';

export function Hero({ t }: { t: CopyV2 }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-heading">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">
            <span className="sq" aria-hidden="true" />
            <span>{t.hero.kicker}</span>
          </p>
          <DisplayHeading as="h1" id="hero-heading" fit="fit-hero" className="h-hero" lines={t.hero.headline} accents={[undefined, undefined, 'orange']} />
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-actions">
            <a className="btn" href="#install">
              {t.hero.cta}
              <ArrowRight />
            </a>
            <a className="link-underline" href="#intent">
              {t.hero.ctaAlt}
            </a>
          </div>
          <p className="hero-meta fine">{t.hero.meta}</p>
        </div>

        <div className="hero-plate">
          <p className="plate-label">{t.hero.plateLabel}</p>
          <span className="plate-marks" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="hero-contact" aria-hidden="true" />
          <Image
            className="hero-render"
            src="/assets/v2/router-hero.webp"
            alt={t.hero.alt}
            width={1440}
            height={842}
            sizes="(max-width: 1080px) 100vw, 54vw"
            priority
          />
          <p className="dial-note" aria-hidden="true">
            <span>{t.hero.dialNote}</span>
            <i />
          </p>
          <div className="hero-caption">
            <p className="meta">{t.hero.captionMeta}</p>
            <h2>{t.hero.captionTitle}</h2>
            <p>{t.hero.captionBody}</p>
          </div>
          <div className="hero-plate-foot">
            <div className="rule" />
            <span>{t.hero.spec}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
