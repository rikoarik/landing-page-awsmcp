'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function MotionSystem({ root }: { root: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ autoRaf: false, anchors: true, duration: 0.85, smoothWheel: true });
      const update = () => ScrollTrigger.update();
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      gsap.from('.circuit-item', { y: 18, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'translate' });
      root.current?.querySelectorAll<SVGPathElement>('.cable').forEach((path) => {
        const length = path.getTotalLength();
        gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' });
      });
      const ports = root.current?.querySelectorAll('.stage-port');
      if (ports) ScrollTrigger.create({ trigger: '.signal-path', start: 'top 85%', end: 'bottom 40%', onUpdate: ({ progress }) => {
        ports.forEach((port, index) => port.classList.toggle('is-lit', index <= Math.floor(progress * ports.length)));
      }});
      return () => {
        lenis.off('scroll', update);
        gsap.ticker.remove(tick);
        lenis.destroy();
        ports?.forEach(port => port.classList.remove('is-lit'));
      };
    }, root);
    media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.to('.hub-assembly', { y: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.plane-layer', { x: 26, y: 20, rotate: -2, ease: 'none', scrollTrigger: { trigger: '.handoff-art', start: 'top 85%', end: 'bottom 30%', scrub: 1 } });
      gsap.to('.plane-code', { x: 12, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.handoff-art', start: 'top 85%', end: 'bottom 30%', scrub: 1 } });
      gsap.to('.plane-browser', { x: -22, y: -18, rotate: -3, ease: 'none', scrollTrigger: { trigger: '.handoff-art', start: 'top 85%', end: 'bottom 30%', scrub: 1 } });
    }, root);
    let active = true;
    let frame = 0;
    const refresh = () => { if (active) ScrollTrigger.refresh(); };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    });
    if (root.current) observer.observe(root.current);
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('load', refresh);
      media.revert();
    };
  }, [root]);
  return null;
}
