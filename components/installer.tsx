'use client';
import { useEffect, useRef, useState } from 'react';
import { clients, installCommand, type Client } from '@/lib/installer';
import type { Copy } from '@/lib/content';

export function Installer({ t, client }: { t: Copy; client: Client }) {
  const [status, setStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const version = useRef(0);
  const command = installCommand(client);
  const selected = clients.find(c => c.value === client)!;
  useEffect(() => { version.current++; setStatus('idle'); }, [client]);
  async function copy() {
    const attempt = version.current;
    setStatus('copying');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(command);
      if (version.current === attempt) setStatus('success');
    } catch { if (version.current === attempt) setStatus('error'); }
  }
  return <section id="install" className="installation section" aria-labelledby="install-heading"><div className="wrap">
    <h2 id="install-heading">{t.setup}</h2><p className="section-intro">{t.requirements}</p>
    <div className="command-box">
      <div className="command-toolbar"><span>{t.projectSetup}<span className="toolbar-divider">/</span>{selected.name} {t.selected}</span><button onClick={copy} disabled={status === 'copying'} className="copy-button">{status === 'success' ? t.copied : status === 'copying' ? t.copyBusy : t.copy}<span aria-hidden="true">{status === 'success' ? ' ✓' : ' ⧉'}</span></button></div>
      <pre tabIndex={0} aria-label={t.copy}><code data-testid="install-command">{command}</code></pre>
      <div className="command-details"><p>{t.restart}</p><p className="config-path">{t.config}: <code>{client === 'zed' ? t.zedConfig : selected.config}</code></p></div>
      <p className={`copy-status ${status === 'error' ? 'has-error' : ''}`} aria-live="polite" role="status">{status === 'success' ? t.copySuccess : status === 'error' ? t.copyFailure : '\u00a0'}</p>
    </div>
    <div className="setup-facts">{t.facts.map((fact, i) => <div key={i}><h3>{fact}</h3><p>{t.factBodies[i]}</p></div>)}</div>
    <div className="install-caveats"><p><strong>{t.sourceWarning}</strong></p><p>{t.qaRequirement}</p></div>
  </div></section>;
}
