'use client';

import { useState } from 'react';
import { upgradeCommand, type Client } from '@/lib/installer';
import type { Copy } from '@/lib/content';

/**
 * Existing-installation path: the repository moved from figcraft-mcp-awsm to
 * artcraft-mcp-awsm, so an old entry needs --upgrade-config to receive the 3D work.
 */
export function UpdateNotice({ t, client }: { t: Copy; client: Client }) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const command = upgradeCommand(client);

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(command);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="upgrade" className="upgrade section" aria-labelledby="upgrade-heading">
      <div className="wrap">
        <div className="upgrade-head">
          <span className="micro-label">{t.updateLabel}</span>
          <h2 id="upgrade-heading">{t.updateTitle}</h2>
          <p className="section-intro">{t.updateIntro}</p>
        </div>

        <div className="upgrade-grid">
          <div className="command-box upgrade-command">
            <div className="command-toolbar">
              <span>{t.updateCommandLabel}</span>
              <button onClick={copy} className="copy-button" type="button">
                {status === 'success' ? t.copied : t.copy}
                <span aria-hidden="true">{status === 'success' ? ' ✓' : ' ⧉'}</span>
              </button>
            </div>
            <pre tabIndex={0} role="region" aria-label={t.updateCommandLabel}><code>{command}</code></pre>
            <p className={`copy-status ${status === 'error' ? 'has-error' : ''}`} aria-live="polite" role="status">
              {status === 'success' ? t.copySuccess : status === 'error' ? t.copyFailure : '\u00a0'}
            </p>
          </div>

          <dl className="upgrade-rows">
            {t.updateRows.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
