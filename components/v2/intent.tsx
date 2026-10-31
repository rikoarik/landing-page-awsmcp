import type { CopyV2 } from '@/lib/content-v2';
import { intentRoutes } from '@/lib/content-v2';
import { DisplayHeading } from './display';

export function Intent({ t }: { t: CopyV2 }) {
  return (
    <section className="intent" id="intent" aria-labelledby="intent-heading">
      <div className="wrap">
        <p className="kicker">{t.intent.kicker}</p>
        <div className="section-head intent-head">
          <DisplayHeading id="intent-heading" fit="fit-intent" className="h-xl" lines={t.intent.head} accents={[undefined, 'orange']} />
          <div>
            <p className="lede">{t.intent.lede}</p>
            <p className="intent-lede-note">{t.intent.ledeNote}</p>
          </div>
        </div>
      </div>

      <div className="intent-table">
        <div className="intent-columns" aria-hidden="true">
          <span>Nº</span>
          <span>{t.intent.columns[0]}</span>
          <span>{t.intent.columns[1]}</span>
          <span>{t.intent.columns[2]}</span>
          <span className="col-mode">{t.intent.columns[3]}</span>
        </div>
        <ul>
          {t.intent.rows.map((row, index) => (
            <li key={row.name} className={`intent-row${index === 2 ? ' is-hot' : ''}`}>
              <a className="intent-link" href={intentRoutes[index]} aria-label={`${t.intent.rowLabel}: ${row.name}`}>
                <span className="intent-row-inner">
                  <span className="intent-num">{row.number}</span>
                  <span>
                    <span className="intent-name">{row.name}</span>
                    <span className="intent-line-text" style={{ display: 'block' }}>
                      {row.line}
                    </span>
                  </span>
                  <span className="intent-route">{row.route}</span>
                  <span className="intent-deliverable">{row.deliverable}</span>
                  <span className="intent-mode">{row.mode}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="wrap">
        <div className="intent-foot">
          <p className="fine">{t.intent.footnote}</p>
          <p className="quote">{t.intent.footnoteRight}</p>
        </div>
      </div>
    </section>
  );
}
