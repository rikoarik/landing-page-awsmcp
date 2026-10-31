import type { CopyV2 } from '@/lib/content-v2';
import { specialists } from '@/lib/content-v2';
import { DisplayHeading } from './display';

export function Skills({ t }: { t: CopyV2 }) {
  return (
    <section className="skills" id="skills" aria-labelledby="skills-heading">
      <div className="wrap">
        <p className="kicker">{t.skills.kicker}</p>
        <div className="skills-head">
          <DisplayHeading id="skills-heading" fit="fit-skills" className="h-md" lines={t.skills.head} accents={[undefined, 'orange']} />
          <div>
            <p className="lede">{t.skills.lede}</p>
            <p className="skills-lede-note">{t.skills.ledeNote}</p>
          </div>
        </div>

        <div className="core">
          <p className="tag">{t.skills.coreTag}</p>
          <p className="name">{t.skills.coreName}</p>
          <p className="desc">{t.skills.coreDesc}</p>
          <p className="count">{t.skills.coreCount}</p>
        </div>

        <div className="specials">
          <p className="specials-label">{t.skills.gridLabel}</p>
          <ul>
            {specialists.map(([name, note]) => (
              <li key={name}>
                <p className="name">{name}</p>
                <p className="note">{note}</p>
              </li>
            ))}
          </ul>
        </div>

        <dl className="skill-rules">
          {t.skills.rules.map(([term, value]) => (
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
