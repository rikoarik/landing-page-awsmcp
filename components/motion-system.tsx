'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Two restrained behaviours, both optional:
 * - smooth scrolling on fine pointers, torn down the moment the user asks for
 *   reduced motion (the media query listener is live, not sampled once);
 * - a single fade-up when a section header first enters the viewport.
 * No pinning, no scrubbed transforms, no motion that survives reduced-motion.
 */
export function MotionSystem() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({ autoRaf: true, anchors: true, duration: 0.8, smoothWheel: true });
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
    };
    const sync = () => (reduced.matches ? stop() : start());

    sync();
    reduced.addEventListener('change', sync);

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('.section-head, .plan-grid, .solo-grid, .wiring, .terminal, .core'),
    );
    let observer: IntersectionObserver | null = null;
    if (!reduced.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('is-in');
            observer?.unobserve(entry.target);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
      );
      for (const target of targets) {
        target.classList.add('reveal');
        observer.observe(target);
      }
    }

    return () => {
      reduced.removeEventListener('change', sync);
      observer?.disconnect();
      for (const target of targets) target.classList.remove('reveal', 'is-in');
      stop();
    };
  }, []);

  return null;
}
