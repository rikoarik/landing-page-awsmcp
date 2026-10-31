import type { CopyV2 } from '@/lib/content-v2';
import { links } from '@/lib/installer';
import { DisplayHeading } from './display';
import { ArrowUpRight } from './icons';

export function Support({ t }: { t: CopyV2 }) {
  const [railUrl, railPays] = t.support.rails;

  return (
    <section className="support" id="support" aria-labelledby="support-heading">
      <div className="wrap">
        <div className="support-grid">
          <div>
            <p className="kicker">{t.support.kicker}</p>
            <DisplayHeading id="support-heading" fit="fit-support" className="h-xs" lines={t.support.head} accents={[undefined, 'orange']} />
            <p className="support-body">{t.support.body}</p>
          </div>

          <div>
            <p className="support-rails-label">{t.support.railsLabel}</p>
            <a className="support-rail" href={links.saweria} aria-label={`${t.support.cta} — ${railUrl[1]}`}>
              <span className="label-sm">{railUrl[0]}</span>
              <span className="url">
                {railUrl[1]}
                <ArrowUpRight />
              </span>
              <span className="note" style={{ display: 'block' }}>
                {railUrl[2]}
              </span>
            </a>
            <div className="support-rail is-paper">
              <p className="label-sm">{railPays[0]}</p>
              <p className="note">{railPays[1]}</p>
              <p className="fine">{railPays[2]}</p>
            </div>
            <p className="support-note">{t.support.ctaNote}</p>
          </div>
        </div>

        <div className="support-foot">
          <p className="fine">{t.support.disclaimer}</p>
          <p className="sign">{t.support.sign}</p>
        </div>
      </div>
    </section>
  );
}
