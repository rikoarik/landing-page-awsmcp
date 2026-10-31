import Image from 'next/image';
import type { CopyV2 } from '@/lib/content-v2';
import { DisplayHeading } from './display';
import { PlanDrawing } from './plan-drawing';

export function Plan({ t }: { t: CopyV2 }) {
  return (
    <section className="plan" id="plan" aria-labelledby="plan-heading">
      <div className="wrap">
        <p className="kicker">{t.plan.kicker}</p>
        <div className="plan-grid">
          <DisplayHeading id="plan-heading" fit="fit-plan" className="h-sm" lines={t.plan.head} accents={[undefined, 'lime']} />
          <div>
            <p className="lede">{t.plan.lede}</p>
            <p className="plan-lede-note">{t.plan.ledeNote}</p>
          </div>
        </div>

        <div className="plan-figures">
          <figure>
            <div className="plan-figure-head">
              <span className="label">{t.plan.planLabel}</span>
              <span className="meta">{t.plan.planMeta}</span>
            </div>
            <PlanDrawing t={t} />
          </figure>

          <figure>
            <div className="plan-figure-head">
              <span className="label">{t.plan.renderLabel}</span>
              <span className="meta">{t.plan.renderMeta}</span>
            </div>
            <Image
              className="plan-render"
              src="/assets/v2/plan-render.webp"
              alt={t.plan.renderAlt}
              width={992}
              height={744}
              sizes="(max-width: 1080px) 92vw, 34vw"
            />
            <figcaption className="plan-render-note">
              <span className="meta">{t.plan.renderFoot}</span>
              <span className="link">{t.plan.linkNote}</span>
            </figcaption>
          </figure>
        </div>

        <div className="plan-steps">
          <div className="wrap">
            <ol>
              {t.plan.steps.map(([name, note], index) => (
                <li key={name}>
                  <span className="num">{`0${index + 1}`}</span>
                  <span className="name" style={{ display: 'block' }}>
                    {name}
                  </span>
                  <span className="note" style={{ display: 'block' }}>
                    {note}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="assume">
          <div>
            <p className="assume-label">{t.plan.assumeLabel}</p>
            <p className="assume-list">{t.plan.assumeList}</p>
            <p className="assume-note">{t.plan.assumeNote}</p>
          </div>
          <p className="assume-right">{t.plan.assumeRight}</p>
        </div>

        <div className="plan-foot">
          <p className="fine">{t.plan.foot}</p>
        </div>
      </div>
    </section>
  );
}
