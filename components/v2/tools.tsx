import type { CopyV2 } from '@/lib/content-v2';
import { toolGroups } from '@/lib/content-v2';
import { DisplayHeading } from './display';

export function Tools({ t }: { t: CopyV2 }) {
  const groups = toolGroups.map((group) => ({
    key: group.key,
    label: t.tools.groupLabels[group.key],
    purpose: t.tools.groups[group.key],
    tools: group.tools,
    count: String(group.tools.length).padStart(2, '0'),
  }));
  const total = groups.reduce((sum, group) => sum + group.tools.length, 0);

  return (
    <section className="tools" id="tools" aria-labelledby="tools-heading">
      <div className="wrap">
        <p className="kicker">{t.tools.kicker}</p>
        <div className="tools-top">
          <DisplayHeading id="tools-heading" fit="fit-tools" className="h-lg" lines={[t.tools.head]} />
          <div>
            <p className="lede">{t.tools.lede}</p>
            <p className="tools-lede-note">{t.tools.ledeNote}</p>
          </div>
        </div>

        <div className="tool-table">
          <div className="tool-cols" aria-hidden="true">
            {t.tools.columns.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>
          {groups.map((group) => (
            <div className="tool-row" key={group.key}>
              <p className="tool-group">{group.label}</p>
              <p className="tool-purpose">{group.purpose}</p>
              <div className="tool-names">
                {group.tools.map((tool) => (
                  <code key={tool}>{tool}</code>
                ))}
              </div>
              <p className="tool-count">
                <span className="sr-only">{`${group.tools.length} ${t.tools.countLabel}: `}</span>
                <span className="num">{group.count}</span>
              </p>
            </div>
          ))}
          <div className="tool-total">
            <span className="sum">{t.tools.total}</span>
            <p>{t.tools.footNote}</p>
            <span className="big">
              <span className="sr-only">{`${total} + 1`}</span>
              <span aria-hidden="true">{t.tools.footRight}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
