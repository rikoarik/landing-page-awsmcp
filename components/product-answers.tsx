import { seoCopy, sources } from '@/lib/seo-content';
import type { Locale } from '@/lib/site-config';

/** Server-rendered content is passed through the interactive page as a slot. */
export function ProductAnswers({ locale }: { locale: Locale }) {
  const copy = seoCopy[locale];
  return <section id="faq" className="product-answers section" aria-labelledby="answers-heading"><div className="wrap">
    <div className="answers-intro"><h2 id="answers-heading">{copy.heading}</h2><div><p className="answer-definition">{copy.definition}</p><nav className="answer-sources" aria-label={copy.sourceLabel}>{[sources.readme, sources.install, sources.license, sources.figcraft].map((href, i) => <a href={href} key={href}>{copy.sourceLinks[i]}<span aria-hidden="true"> ↗</span></a>)}</nav></div></div>
    <dl className="product-facts">{copy.facts.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl>
    <div className="faq-layout"><h3>{copy.faqHeading}</h3><div className="faq-list">{copy.faqs.map((item, i) => <details key={item.question}><summary><span className="faq-number" aria-hidden="true">0{i + 1}</span><span>{item.question}</span></summary><div className="faq-answer"><p>{item.answer}</p><a href={item.source}>{copy.sourceLabel}<span aria-hidden="true"> ↗</span></a></div></details>)}</div></div>
  </div></section>;
}
