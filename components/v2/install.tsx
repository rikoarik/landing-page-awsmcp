'use client';

import { useEffect, useRef, useState } from 'react';
import type { CopyV2 } from '@/lib/content-v2';
import { clients, installCommand, links, type Client, upgradeCommand } from '@/lib/installer';
import { DisplayHeading } from './display';
import { ArrowRight, ArrowText, ArrowUpRight } from './icons';

type Status = 'idle' | 'copying' | 'success' | 'error';

export function Install({ t }: { t: CopyV2 }) {
  const [client, setClient] = useState<Client>('opencode');
  const [status, setStatus] = useState<Status>('idle');
  const [upgradeStatus, setUpgradeStatus] = useState<Status>('idle');
  const version = useRef(0);
  const command = installCommand(client);
  const upgrade = upgradeCommand(client);
  const selected = clients.find((entry) => entry.value === client)!;

  useEffect(() => {
    version.current += 1;
    setStatus('idle');
  }, [client]);

  async function copy(target: string, apply: (value: Status) => void, attempt = version.current) {
    apply('copying');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(target);
      apply(attempt === version.current ? 'success' : 'idle');
    } catch {
      apply('error');
    }
  }

  const statusText = status === 'success' ? t.install.copySuccess : status === 'error' ? t.install.copyFailure : '';
  const upgradeStatusText = upgradeStatus === 'success' ? t.install.copySuccess : upgradeStatus === 'error' ? t.install.copyFailure : '';

  return (
    <section className="install on-dark" id="install" aria-labelledby="install-heading">
      <div className="wrap">
        <p className="kicker">{t.install.kicker}</p>
        <div className="install-top">
          <div className="install-copy">
            <DisplayHeading id="install-heading" fit="fit-install" className="h-lg" lines={t.install.head} accents={[undefined, 'lime']} />
            <p className="lede">{t.install.lede}</p>

            <div className="install-s1">
              <p className="tag">{t.install.s1Tag}</p>
              <p className="meta">{t.install.s1Meta}</p>
              <div className="rule" />
              <div className="clients" role="group" aria-label={t.install.clientLabel}>
                {clients.map((entry) => (
                  <button
                    key={entry.value}
                    type="button"
                    data-client={entry.value}
                    aria-pressed={entry.value === client}
                    onClick={() => setClient(entry.value)}
                  >
                    {entry.name}
                    {entry.value === client && <span className="sr-only">{` — ${t.install.selected}`}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="terminal">
              <div className="terminal-bar">
                <span>{t.install.termTitle}</span>
                <span>{`${selected.name} · ${selected.config}`}</span>
              </div>
              <div className="terminal-body">
                <pre tabIndex={0} role="region" aria-label={t.install.copy}>
                  <span className="prompt">$ </span>
                  <code className="cmd" data-testid="install-command">
                    {command}
                  </code>
                </pre>
                <pre className="ok">
                  {`${t.install.termWrote}\n${t.install.termSkill}\n${t.install.termServer}`}
                </pre>
                <pre className="warn">{t.install.termPending}</pre>
              </div>
              <div className="terminal-foot">
                <span className="fine">{t.install.termFoot}</span>
                <a className="fine link-fine" href={links.quickstart}>
                  {t.install.s1Meta}
                  <ArrowUpRight className="arw-inline" />
                </a>
              </div>
            </div>

            <div className="copy-row">
              <button
                type="button"
                className="copy-btn"
                onClick={() => copy(command, setStatus)}
                disabled={status === 'copying'}
              >
                {status === 'success' ? t.install.copied : status === 'copying' ? t.install.copyBusy : t.install.copy}
                <span aria-hidden="true">{status === 'success' ? '✓' : '⧉'}</span>
              </button>
              <p className={`copy-status${status === 'error' ? ' has-error' : ''}`} aria-live="polite" role="status">
                {statusText || '\u00a0'}
              </p>
            </div>
          </div>
        </div>

        <div className="install-s2">
          <p className="tag">{t.install.s2Tag}</p>
          <div className="install-s2-head">
            <h3>{t.install.s2Head}</h3>
            <a className="note" href={links.figcraft}>
              <ArrowText text={`${t.install.s2Note} ↗`} />
            </a>
          </div>
          <div className="apps">
            {t.install.cards.map(([name, cap, detail, how], index) => (
              <a className="app-card" key={name} href={index === 2 ? links.figcraft : links.github}>
                <p className="name">{name}</p>
                <p className="cap">{cap}</p>
                <p className="detail">{detail}</p>
                <p className="how">{how}</p>
              </a>
            ))}
          </div>
          <div className="install-warn">
            <p className="fine">{t.install.s2Warn}</p>
            <p className="aside">{t.install.s2Aside}</p>
          </div>
        </div>

        <div className="install-cta">
          <a className="btn btn-lime" href="#tools">
            {t.install.cta}
            <ArrowRight />
          </a>
          <p className="fine">{t.install.ctaNote}</p>
        </div>

        <div className="upgrade" id="upgrade">
          <div>
            <p className="kicker">{t.install.upgradeLabel}</p>
            <h3>{t.install.upgradeTitle}</h3>
            <p>{t.install.upgradeBody}</p>
          </div>
          <div>
            <p className="code-label">{t.install.upgradeCommandLabel}</p>
            <pre tabIndex={0} role="region" aria-label={t.install.upgradeCommandLabel}>
              <code>{upgrade}</code>
            </pre>
            <div className="copy-row">
              <button
                type="button"
                className="copy-btn"
                onClick={() => copy(upgrade, setUpgradeStatus, version.current)}
              >
                {upgradeStatus === 'success' ? t.install.copied : t.install.copy}
                <span aria-hidden="true">{upgradeStatus === 'success' ? '✓' : '⧉'}</span>
              </button>
              <p className={`copy-status${upgradeStatus === 'error' ? ' has-error' : ''}`} aria-live="polite" role="status">
                {upgradeStatusText || '\u00a0'}
              </p>
            </div>
            <dl>
              {t.install.upgradeRows.map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <div className="install-end" />
    </section>
  );
}
