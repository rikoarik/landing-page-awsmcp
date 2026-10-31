import type { CopyV2, Lang } from '@/lib/content-v2';
import { seoCopy, sources } from '@/lib/seo-content';
import { DisplayHeading } from './display';

export function Answers({ t, lang }: { t: CopyV2; lang: Lang }) {
  const copy = seoCopy[lang];

  return (
    <section className="answers" id="faq" aria-labelledby="answers-heading">
      <div className="wrap">
        <p className="kicker">{t.answers.kicker}</p>
        <div className="answers-grid">
          <div>
            <DisplayHeading id="answers-heading" fit="fit-answers" className="h-md" lines={t.answers.head} accents={[undefined, 'orange']} />
            <p className="answers-definition">{copy.definition}</p>
            <nav className="answer-sources" aria-label={copy.sourceLabel}>
              {[sources.readme, sources.install, sources.license, sources.figcraft].map((href, index) => (
                <a key={href} href={href}>
                  {copy.sourceLinks[index]}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="facts-label">{t.answers.factsLabel}</p>
            <dl className="facts-dl">
              {copy.facts.map(([term, description]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>

            <div className="faq">
              {copy.faqs.map((item, index) => (
                <details key={item.question}>
                  <summary>
                    <span className="n" aria-hidden="true">{`0${index + 1}`}</span>
                    <span>{item.question}</span>
                  </summary>
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                    <a href={item.source}>{copy.sourceLabel}</a>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
        <div className="answers-end" />
      </div>
    </section>
  );
}
