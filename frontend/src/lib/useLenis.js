import { useEffect } from 'react';
import Lenis from 'lenis';
import { prefersReducedMotion } from './motion';

/**
 * Smooth scroll for public + onboarding pages only.
 * Deliberately not used inside AppShell — chat needs native scroll anchoring.
 */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch keeps native behaviour; hijacking it feels broken on mobile.
      smoothTouch: false,
    });

    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);
}

export default useLenis;
