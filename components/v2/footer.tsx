import type { CopyV2, Lang } from '@/lib/content-v2';
import { links } from '@/lib/installer';
import { DisplayHeading } from './display';

const hrefs = [links.github, links.readme, links.issues];

export function Footer({ t, lang }: { t: CopyV2; lang: Lang }) {
  return (
    <footer className="footer on-dark">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <DisplayHeading fit="fit-footer" className="h-xs" lines={t.footer.line} accents={[undefined, 'lime']} />
            <p className="footer-sub">{t.footer.sub}</p>
            <div className="footer-cmd">
              <code>{t.footer.cmd}</code>
              <span className="fine">{t.footer.cmdNote}</span>
            </div>
          </div>

          <nav className="footer-links" aria-label={lang === 'en' ? t.footer.linksLabel : t.footer.linksLabel}>
            {t.footer.links.map(([term, value], index) => (
              <div key={term}>
                <p className="k">{term}</p>
                <a href={hrefs[index]}>{value}</a>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <span>{t.footer.left}</span>
          <span>{t.footer.right}</span>
        </div>
      </div>
    </footer>
  );
}
