'use client';

import { useEffect, useRef, useState } from 'react';
import type { CopyV2, Lang } from '@/lib/content-v2';
import { links } from '@/lib/installer';
import { ArrowText, ArrowUpRight } from './icons';

export function SiteHeader({ t, lang }: { t: CopyV2; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = [
    ['#intent', t.nav.intent],
    ['#three-d', t.nav.threeD],
    ['#plan', t.nav.plan],
    ['#tools', t.nav.tools],
    ['#install', t.nav.install],
    ['#support', t.nav.support],
  ] as const;

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);

  function preserveSection(event: React.MouseEvent<HTMLAnchorElement>) {
    // Keep native document navigation and modifier keys; only carry the hash across locales.
    event.currentTarget.hash = window.location.hash;
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href={lang === 'id' ? '/id' : '/'} aria-label="AWSM">
          <span className="brand-mark" aria-hidden="true" />
          <span className="wordmark">AWSM</span>
        </a>

        <nav className="nav-links" aria-label={t.nav.label}>
          {nav.map(([href, label]) => (
            <a key={href} href={href}>
              {label.includes('→') ? <ArrowText text={label} /> : label}
            </a>
          ))}
        </nav>

        <div className="nav-end">
          <div className="lang" role="group" aria-label={t.nav.language}>
            {(['en', 'id'] as const).map((value) => (
              <a
                key={value}
                lang={value}
                hrefLang={value}
                href={value === 'id' ? '/id' : '/'}
                aria-current={lang === value ? 'page' : undefined}
                onClick={preserveSection}
              >
                {value.toUpperCase()}
              </a>
            ))}
          </div>
          <span className="nav-version">{t.nav.version}</span>
          <a className="nav-github" href={links.github}>
            {t.nav.github}
            <ArrowUpRight />
          </a>
          <button
            className="menu-toggle"
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t.close : t.menu}
            <span aria-hidden="true">{open ? '−' : '+'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label={t.menu}>
          {nav.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              <ArrowText text={label} />
              <span aria-hidden="true">↗</span>
            </a>
          ))}
          <a href={links.github} onClick={() => setOpen(false)}>
            {t.nav.github}
            <ArrowUpRight />
          </a>
        </nav>
      )}
    </header>
  );
}
