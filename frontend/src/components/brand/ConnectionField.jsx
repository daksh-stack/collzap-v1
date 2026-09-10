import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { prefersReducedMotion } from '../../lib/motion';
import { BRAND } from '../../lib/palette';

/**
 * The brand's own geometry, in motion: the logo's wave repeated as slow
 * drifting ribbons, over a field of nodes that periodically find each other
 * and draw a link. Peer-matching, rendered.
 *
 * Used in two places so it reads as brand rather than decoration: the auth
 * aside, and the "finding your people" state on /matches.
 *
 * Pure 2D canvas — no WebGL, no fallback path needed. Under reduced motion it
 * paints a single static frame and stops.
 */

const NODE_COUNT = 16;
const MAX_LINKS = 3;
const LINK_INTERVAL = 2000; // ms between link attempts

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export default function ConnectionField({ className, intensity = 1, ...props }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      const nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: rand(0.08, 0.92) * width,
          y: rand(0.1, 0.9) * height,
          vx: rand(-0.08, 0.08),
          vy: rand(-0.06, 0.06),
          r: rand(2.2, 4.4),
          phase: rand(0, Math.PI * 2),
        });
      }
      stateRef.current = { nodes, links: [], lastLink: 0 };
    };

    const gradient = () => {
      const g = ctx.createLinearGradient(0, 0, width, height * 0.35);
      g.addColorStop(0, BRAND.gradient[0]);
      g.addColorStop(0.46, BRAND.gradient[1]);
      g.addColorStop(0.74, BRAND.gradient[2]);
      g.addColorStop(1, BRAND.gradient[3]);
      return g;
    };

    // One ribbon: the logo's wave, scaled across the full width.
    const ribbon = (t, offsetY, amp, wavelength, thickness, alpha) => {
      ctx.beginPath();
      const step = Math.max(6, width / 90);
      for (let x = -20; x <= width + 20; x += step) {
        const y =
          offsetY +
          Math.sin((x / wavelength) + t) * amp +
          Math.sin((x / (wavelength * 0.47)) + t * 1.3) * (amp * 0.28);
        if (x <= -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.globalAlpha = alpha * intensity;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const draw = (elapsed) => {
      const state = stateRef.current;
      if (!state || !width || !height) return;
      const t = elapsed / 1000;

      ctx.clearRect(0, 0, width, height);
      const g = gradient();
      ctx.strokeStyle = g;
      ctx.fillStyle = g;

      // Ribbons, back to front.
      ribbon(t * 0.16, height * 0.62, height * 0.075, width * 0.42, 34, 0.07);
      ribbon(t * 0.21 + 1.4, height * 0.5, height * 0.09, width * 0.36, 22, 0.1);
      ribbon(t * 0.27 + 3.1, height * 0.42, height * 0.06, width * 0.3, 10, 0.14);

      // Links first so nodes sit on top of them.
      for (const link of state.links) {
        const a = state.nodes[link.a];
        const b = state.nodes[link.b];
        if (!a || !b) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.22;

        // Quadratic curve, revealed by progress via de Casteljau subdivision.
        const p = link.progress;
        const ax = a.x + (mx - a.x) * p;
        const ay = a.y + (my - a.y) * p;
        const bx = mx + (b.x - mx) * p;
        const by = my + (b.y - my) * p;
        const ex = ax + (bx - ax) * p;
        const ey = ay + (by - ay) * p;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(ax, ay, ex, ey);
        ctx.globalAlpha = link.alpha * 0.85 * intensity;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Nodes.
      for (const n of state.nodes) {
        const pulse = 1 + Math.sin(t * 1.1 + n.phase) * 0.14;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.globalAlpha = 0.85 * intensity;
        ctx.fill();
        ctx.globalAlpha = 0.14 * intensity;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    const step = (state, dt, now) => {
      for (const n of state.nodes) {
        n.x += n.vx * dt * 0.06;
        n.y += n.vy * dt * 0.06;
        if (n.x < width * 0.05 || n.x > width * 0.95) n.vx *= -1;
        if (n.y < height * 0.06 || n.y > height * 0.94) n.vy *= -1;
        n.x = Math.max(width * 0.04, Math.min(width * 0.96, n.x));
        n.y = Math.max(height * 0.05, Math.min(height * 0.95, n.y));
      }

      for (const link of state.links) {
        link.age += dt;
        if (link.age < 700) link.progress = Math.min(1, link.age / 700);
        link.alpha =
          link.age < 400
            ? link.age / 400
            : link.age > link.life - 500
              ? Math.max(0, (link.life - link.age) / 500)
              : 1;
      }
      state.links = state.links.filter((l) => l.age < l.life);

      if (now - state.lastLink > LINK_INTERVAL && state.links.length < MAX_LINKS) {
        state.lastLink = now;
        const a = Math.floor(Math.random() * state.nodes.length);
        let best = -1;
        let bestD = Infinity;
        for (let i = 0; i < state.nodes.length; i++) {
          if (i === a) continue;
          if (state.links.some((l) => l.a === i || l.b === i || l.a === a || l.b === a)) continue;
          const d = Math.hypot(state.nodes[i].x - state.nodes[a].x, state.nodes[i].y - state.nodes[a].y);
          if (d < bestD && d > width * 0.12) {
            bestD = d;
            best = i;
          }
        }
        if (best >= 0) {
          state.links.push({ a, b: best, age: 0, progress: 0, alpha: 0, life: rand(3200, 5200) });
        }
      }
    };

    let frame = null;
    let last = 0;
    let elapsed = 0;

    const loop = (now) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      elapsed += dt;
      const state = stateRef.current;
      if (state) {
        step(state, dt, elapsed);
        draw(elapsed);
      }
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame != null || reduced) return;
      last = 0;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (frame != null) cancelAnimationFrame(frame);
      frame = null;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (reduced) {
      // One static frame: links already drawn, nodes at rest.
      const state = stateRef.current;
      if (state) {
        state.links = [
          { a: 0, b: 4, age: 1000, progress: 1, alpha: 1, life: Infinity },
          { a: 7, b: 11, age: 1000, progress: 1, alpha: 1, life: Infinity },
        ];
        draw(0);
      }
    } else {
      start();
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('h-full w-full', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
