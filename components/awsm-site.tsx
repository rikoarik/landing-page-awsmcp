'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { content, type Copy, type Language } from '@/lib/content';
import { clients, links, type Client } from '@/lib/installer';
import { MotionSystem } from './motion-system';
import { Playground } from './playground';
import { Installer } from './installer';

function Arrow() { return <svg className="arrow-icon" aria-hidden="true" width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 16 16 4M5 4h11v11" stroke="currentColor" strokeWidth="1.7" /></svg>; }
function Wordmark({ className = '' }: { className?: string }) { return <span className={`wordmark ${className}`}>awsm</span>; }
function Circuit({ t }: { t: Copy }) {
  return <div className="circuit" role="group" aria-label={t.intelligence}>
    <svg className="circuit-cables" viewBox="0 0 1328 430" preserveAspectRatio="none" aria-hidden="true"><path className="cable" d="M295 175 C370 175 336 255 468 255"/><path className="cable" d="M815 255 C910 255 865 120 968 120"/><path className="cable" d="M815 275 C915 275 868 350 968 350"/></svg>
    <div className="orbit-lines" aria-hidden="true">{Array.from({length: 15}, (_,i) => <i key={i} style={{ transform: `rotate(${i * 2.8 - 20}deg)` }} />)}</div>
    <div className="request-paper circuit-item"><div className="paper-bar">{t.agent}</div><p className="request-text"><span aria-hidden="true">&gt; </span><span className="desktop-request">{t.request}</span><span className="mobile-request">{t.requestMobile}</span></p><small>{t.contextOut}</small></div>
    <div className="hub-assembly"><div className="hub circuit-item"><div className="hub-label">{t.entry}</div><Wordmark /><p>{t.hub}</p><i className="port input-port" aria-hidden="true"/><i className="port output-port" aria-hidden="true"/></div><p className="hub-caption">{t.intelligence}</p></div>
    <div className="hero-specimen circuit-item"><span>{t.panelLabels[1]}</span><strong>Aa / Bb</strong><div className="hero-swatches" aria-hidden="true"><i/><i/><i/><i/></div></div>
    <div className="browser-paper circuit-item"><div className="browser-bar">localhost / {t.evidence}</div><div className="browser-layout"><div><i/><i/><i/></div><span/></div></div>
    <div className="mobile-output circuit-item">{t.circuitMobile}</div>
  </div>;
}

export function AwsmSite({ lang, answers }: { lang: Language; answers: React.ReactNode }) {
  const [client, setClient] = useState<Client>('opencode');
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const t = content[lang];
  useEffect(() => {
    if (!menu) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [menu]);
  function preserveSection(event: React.MouseEvent<HTMLAnchorElement>) {
    // Keep native document navigation and modifier keys; enhance only the anchor.
    event.currentTarget.hash = window.location.hash;
  }
  return <MotionConfig reducedMotion="user"><div ref={root} data-language={lang}>
    <MotionSystem root={root}/><a className="skip-link" href="#main">{t.skip}</a>
    <main id="main">
      <section className="hero" aria-labelledby="hero-heading"><div className="wrap">
        <header className="site-header"><a href={lang === 'id' ? '/id' : '/'} className="brand-link" aria-label="AWSM"><Wordmark /></a><p className="descriptor">{t.descriptor}</p>
          <nav className="desktop-nav" aria-label={lang === 'en' ? 'Main navigation' : 'Navigasi utama'}>{t.nav.map((item,i) => <a key={item} href={['#workflow','#playground','#install'][i]}>{item}</a>)}<a href={links.github}>GitHub<Arrow /></a></nav>
          <div className="language-switch" role="group" aria-label={lang === 'en' ? 'Language' : 'Bahasa'}>{(['en','id'] as const).map(value => <a key={value} lang={value} hrefLang={value} href={value === 'id' ? '/id' : '/'} aria-current={lang === value ? 'page' : undefined} onClick={preserveSection}>{value.toUpperCase()}</a>)}</div>
          <button className="menu-toggle" ref={menuButton} aria-label={menu ? t.close : t.menu} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu(!menu)}>{t.menu} <span aria-hidden="true">{menu ? '−' : '+'}</span></button>
          <AnimatePresence>{menu && <motion.nav id="mobile-menu" className="mobile-menu" aria-label={t.menu} initial={reduced ? false : { opacity: 0, y: -8 }} animate={{opacity: 1,y:0}} exit={reduced ? undefined : {opacity:0,y:-8}} transition={{duration:reduced ? 0 : 0.15}}>{t.nav.map((item,i) => <a key={i} href={['#workflow','#playground','#install'][i]} onClick={() => setMenu(false)}>{item}<span aria-hidden="true">↗</span></a>)}<a href={links.github} onClick={() => setMenu(false)}>GitHub<Arrow /></a></motion.nav>}</AnimatePresence>
        </header>
        <div className="hero-top"><h1 id="hero-heading">{t.hero.map(line => <span key={line}>{line}</span>)}</h1><div className="hero-intro"><p>{t.intro}</p><a href="#install" className="button button-dark">{t.install}<Arrow /></a></div></div>
        <Circuit t={t}/>
        <div className="hero-bottom"><div><span>{t.local}</span><b aria-hidden="true">/</b><span>{t.open}</span><b className="host-label" aria-hidden="true">/</b><span className="host-label">{t.noHost}</span></div><a href="#workflow">{t.follow} <span aria-hidden="true">↓</span></a></div>
      </div></section>
      <section id="workflow" className="workflow section" aria-labelledby="workflow-heading"><div className="wrap"><h2 id="workflow-heading" className="line-breaks">{t.workflow}</h2><p className="section-intro">{t.workflowIntro}</p>
        <ol className="signal-path">{t.stages.map((stage,i) => <li className={`stage stage-${i}`} key={i}><span className="stage-port" aria-hidden="true"/><span className="stage-number">0{i+1}</span><h3>{stage}</h3><p>{t.stageNotes[i]}</p></li>)}</ol><p className="fineprint native-note">{t.nativeNote}</p>
        <div className="workflow-note"><div><span className="micro-label">{t.taskLabel}</span><p className="task-text">{t.task}</p><code>inspect_ui_project(&#123; root: "." &#125;)</code></div><div><h3>{t.useful}</h3><p>{t.usefulBody}</p><small>{t.usefulFoot}</small></div></div>
      </div></section>
      <Playground t={t}/>
      <section id="handoff" className="handoff section" aria-labelledby="handoff-heading"><div className="wrap"><h2 id="handoff-heading">{t.canvas}</h2><p className="section-intro">{t.canvasIntro}</p>
        <div className="handoff-grid"><div className="handoff-art"><div className="grid-lines" aria-hidden="true"/><div className="plane plane-layer"><div className="plane-bar">{t.layers}</div><div className="layer-tree">Frame<br/><span>{lang === 'en' ? 'Text' : 'Teks'}</span><br/><span>{lang === 'en' ? 'Component' : 'Komponen'}</span><br/><span>{lang === 'en' ? 'Artwork' : 'Aset visual'}</span></div></div><div className="plane plane-code"><div className="plane-bar">{t.component}</div><pre><code>{'<main>\n  <Hero />\n  <Workflow />\n</main>'}</code></pre></div><div className="plane plane-browser"><div className="plane-bar">{t.review}</div><h3>{t.check}</h3><p>375 × 812 <span>1440 × 900</span></p><small>{lang === 'en' ? 'DOM audit + screenshots + diff' : 'Audit DOM + screenshot + perbandingan'}</small></div></div>
          <ol className="handoff-steps">{t.steps.map((step,i) => <li key={i}><h3><span>0{i+1} / </span>{step}</h3><p>{t.stepBodies[i]}</p></li>)}</ol></div>
        <p className="handoff-caveat">{t.caveat}</p><div className="figcraft-link"><a href={links.figcraft} className="button button-dark">{t.figcraft}<Arrow /></a><p>{t.figcraftNote}</p></div>
      </div></section>
      <section className="agents section" aria-labelledby="agents-heading"><div className="wrap"><h2 id="agents-heading">{t.agents}</h2><p className="section-intro">{t.agentsIntro}</p><div className="client-selector" role="group" aria-label={t.agentLabel}>{clients.map(item => <motion.button tabIndex={0} whileTap={reduced ? undefined : { y: 2 }} key={item.value} data-client={item.value} aria-pressed={item.value === client} onClick={() => setClient(item.value)}>{item.name}<span aria-hidden="true">{item.value === client ? ' ↗' : ''}</span></motion.button>)}</div><div className="client-notes"><code>--client opencode | claude | codex | antigravity | copilot | zed</code><p>{t.zedNote}</p></div></div></section>
      <Installer t={t} client={client}/>
      {answers}
      <section className="open-source section" aria-labelledby="source-heading"><div className="wrap"><h2 id="source-heading">{t.sourceTitle.map(line => <span key={line}>{line}</span>)}</h2><div className="source-bottom"><div><p>{t.sourceBody}</p><a className="button button-dark" href={links.github}>{t.github}<Arrow /></a></div><div className="circuit-seal" aria-hidden="true">{Array.from({length:7},(_,i) => <i key={i} style={{inset: `${i*10}px`}}/>)}<span>&lt;/&gt;</span></div></div><div className="source-rule"><a href={links.github}>github.com/rikoarik/figcraft-mcp-awsm</a><a href={links.license}>MIT<Arrow /></a></div></div></section>
      <section className="support section" aria-labelledby="coffee-heading"><div className="wrap support-grid"><div><h2 id="coffee-heading">{t.coffee.map(line => <span key={line}>{line}</span>)}</h2><p>{t.coffeeBody}</p></div><div className="support-actions"><a className="button button-dark" href={links.saweria}>{t.coffeeCta}<Arrow /></a></div><p className="fineprint support-optional">{t.optional}</p></div></section>
    </main>
    <footer className="site-footer"><div className="wrap"><Wordmark/><p>{t.footer}</p><nav aria-label={lang === 'en' ? 'Project links' : 'Tautan proyek'}><a href={links.readme}>README</a><span aria-hidden="true">/</span><a href={links.issues}>{t.issues}</a><span aria-hidden="true">/</span><a href={links.license}>{t.license}</a></nav></div></footer>
  </div></MotionConfig>;
}
