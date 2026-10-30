'use client';
import Image from 'next/image';
import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Copy } from '@/lib/content';

const snippets = [
  'inspect_ui_project({ root: "." })',
  'google_font / find_icons / palette / check_contrast',
  'prepare_web_handoff / sync_figcraft_assets',
  'review_ui / capture_ui_screenshots / compare_ui_screenshots',
];
export function Playground({ t }: { t: Copy }) {
  const [active, setActive] = useState(1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % 4;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + 3) % 4;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 3;
    else return;
    event.preventDefault(); setActive(next); refs.current[next]?.focus();
  }
  const rows = active === 0 ? t.projectRows : active === 2 ? t.handoffRows : t.qaRows;
  return <section className="playground section" id="playground" aria-labelledby="playground-heading">
    <div className="wrap">
      <h2 id="playground-heading">{t.playground}</h2><p className="section-intro">{t.playgroundIntro}</p>
      <div className="playground-grid">
        <div className="tool-tabs" role="tablist" aria-label={t.playground}>
          {t.tabs.map((tab, i) => <button key={i} id={`tool-tab-${i}`} role="tab" aria-selected={active === i} aria-controls={`tool-panel-${i}`} tabIndex={active === i ? 0 : -1} ref={node => { refs.current[i] = node; }} onKeyDown={e => onKey(e, i)} onClick={() => setActive(i)}><span className="tab-number">0{i + 1}</span><span><strong>{tab}</strong><small>{t.tabNotes[i]}</small></span></button>)}
        </div>
        <div className="specimen-shell">
          <AnimatePresence initial={false} mode="wait">
            <motion.div key={active} role="tabpanel" tabIndex={0} id={`tool-panel-${active}`} aria-labelledby={`tool-tab-${active}`} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ duration: reduced ? 0 : 0.16 }} className={`specimen panel-${active}`}>
              <div className="panel-label">0{active + 1} / {t.panelLabels[active]}</div>
              <div className="specimen-body">
                <div className="specimen-copy"><div className="specimen-mark" aria-hidden="true">{active === 0 ? '{ }' : active === 1 ? 'Aa' : active === 2 ? '</>' : '↗'}</div><h3>{t.panelTitles[active]}</h3><p>{t.panelBodies[active]}</p>{active === 1 && <div className="swatches" aria-label="#202320, #FF6B42, #F6A7CA, #F4F34C, #B9ECF0">{['ink','coral','pink','acid','cyan'].map(color => <span key={color} className={color} />)}</div>}</div>
                {active === 1 ? <figure className="reference-figure"><Image src="/assets/Hero.png" width={1440} height={840} alt={t.reference} sizes="(max-width: 700px) 80vw, 35vw" /><figcaption>{t.reference}</figcaption></figure> : <div className="tool-evidence" aria-label={t.panelLabels[active]}><div className="evidence-bar"><span /><span /><span /></div><strong>{active === 0 ? './your-project' : active === 2 ? 'FigCraft → web' : 'localhost / UI'}</strong>{rows.map((row, i) => <div className="evidence-row" key={row}><span>0{i + 1}</span>{row}<span aria-hidden="true">↗</span></div>)}<span className="evidence-foot">{snippets[active].split(' / ')[0]}</span></div>}
              </div>
              <div className="panel-code"><code>{snippets[active]}</code></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <p className="tool-note">{t.toolsNote}</p><p className="fineprint">{t.referenceNote}</p>
    </div>
  </section>;
}
