import type { CopyV2 } from '@/lib/content-v2';
import { DisplayHeading } from './display';

export function Connection({ t }: { t: CopyV2 }) {
  return (
    <section className="connection" id="connection" aria-labelledby="connection-heading">
      <div className="wrap">
        <p className="kicker">{t.connection.kicker}</p>
        <div className="connection-top">
          <div className="connection-copy">
            <DisplayHeading id="connection-heading" fit="fit-connection" className="h-xl" lines={t.connection.head} accents={[undefined, 'orange']} />
            <p className="lede">{t.connection.lede}</p>
          </div>

          <figure className="wiring" aria-label={t.connection.plateLabel}>
            <figcaption className="wiring-label">{t.connection.plateLabel}</figcaption>
            <div className="wiring-rows">
              <div className="wiring-pair">
                <div className="wiring-box">
                  <p className="k">{t.connection.agentKey}</p>
                  <p className="v">{t.connection.agentValue}</p>
                  <p className="n">{t.connection.agentNote}</p>
                </div>
                <div className="wiring-link" aria-hidden="true">
                  <span>{t.connection.linkLabel}</span>
                  <i />
                </div>
                <div className="wiring-box is-hot">
                  <p className="k">{t.connection.awsmKey}</p>
                  <p className="v">{t.connection.awsmValue}</p>
                  <p className="n">{t.connection.awsmNote}</p>
                </div>
                <span aria-hidden="true" />
              </div>

              <div className="wiring-down">
                {t.connection.downstream.map((item) => (
                  <div key={item.key} className={item.declared ? 'declared' : undefined}>
                    <p className="k">{item.key}</p>
                    <p className="v">{item.value}</p>
                    <p className="tag">{item.tag}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="wiring-foot">
              <span>{t.connection.plateFoot2}</span>
              <span>{t.connection.plateFoot}</span>
            </div>
          </figure>
        </div>

        <div className="connection-bottom">
          <div>
            <p className="code-label">{t.connection.codeLabel}</p>
            <pre className="code-block" tabIndex={0} role="region" aria-label={t.connection.codeLabel}>
              <code>{t.connection.code.join('\n')}</code>
            </pre>
          </div>
          <div>
            <p className="code-note">{t.connection.codeNote}</p>
            <p className="code-note">{t.connection.codeNote2}</p>
          </div>
        </div>

        <dl className="connection-facts">
          {t.connection.facts.map(([term, value]) => (
            <div key={term}>
              <dt className="k">{term}</dt>
              <dd className="v">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
