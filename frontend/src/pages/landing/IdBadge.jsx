import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { LogoMark } from '../../components/brand/Logo';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../lib/motion';
import Stamp from './Stamp';

/**
 * The brand object: a campus ID hanging from a lanyard.
 *
 * Built in CSS/SVG rather than WebGL — the three.js badge this replaces cost
 * ~600 KB of dependencies for a marketing image, and a spring does the job.
 *
 * The whole assembly pivots about the hook at the top, which is how a real
 * lanyard behaves, so the cord stays attached without being redrawn. Pointer
 * position feeds one spring; the card adds a little `rotateY` for depth.
 *
 * Deliberately carries no name or photo — redacted bars instead. Inventing a
 * student identity on the marketing page is exactly the fake-persona thing the
 * brief rules out.
 */

const SWING_MAX = 7;   // deg — a sway, never a spin
const TILT_MAX = 10;   // deg of rotateY

export default function IdBadge({ className }) {
  const reduced = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const swing = useSpring(useTransform(pointerX, [-1, 1], [SWING_MAX, -SWING_MAX]), {
    stiffness: 60,
    damping: 12,
    mass: 1.1,
  });
  const tiltY = useSpring(useTransform(pointerX, [-1, 1], [-TILT_MAX, TILT_MAX]), {
    stiffness: 90,
    damping: 15,
  });
  const tiltX = useSpring(useTransform(pointerY, [-1, 1], [TILT_MAX * 0.5, -TILT_MAX * 0.5]), {
    stiffness: 90,
    damping: 15,
  });

  useEffect(() => {
    if (reduced) return;
    // Same guard Button.jsx uses for its magnet: touch gets no pointer physics.
    if (window.matchMedia?.('(pointer: coarse)').matches) return;

    const onMove = (e) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, pointerX, pointerY]);

  const motionStyle = reduced ? undefined : { rotate: swing, transformOrigin: 'top center' };
  const cardStyle = reduced ? undefined : { rotateY: tiltY, rotateX: tiltX };

  return (
    <div className={cn('relative mx-auto w-[15rem] sm:w-[17rem]', className)}>
      <motion.div style={motionStyle} className="flex flex-col items-center">
        {/* Lanyard cord. Pivots with the assembly, so it never detaches. */}
        <svg
          viewBox="0 0 120 90"
          className="h-[5.5rem] w-[7.5rem] shrink-0 overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cz-cord" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B3D91" />
              <stop offset="100%" stopColor="#00BCD4" />
            </linearGradient>
          </defs>
          <path
            d="M6 2 C 26 34, 48 62, 60 86"
            fill="none"
            stroke="url(#cz-cord)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M114 2 C 94 34, 72 62, 60 86"
            fill="none"
            stroke="url(#cz-cord)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>

        {/* Metal clip — carries the one line it needs to. */}
        <div className="relative -mt-3 w-[11rem] rounded-full border border-white/25 bg-gradient-to-b from-[#E7EDF5] via-[#B9C6D6] to-[#8FA0B6] px-3 py-1.5 shadow-lg">
          <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#5C6C80]/70" />
          <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#5C6C80]/70" />
          <p className="text-center font-mono text-[8px] font-bold uppercase leading-none tracking-[0.14em] text-[#31425A]">
            Verified students only
          </p>
        </div>

        {/* The card. Fixed ratio so nothing reflows when it mounts. */}
        <div className="mt-3 w-full [perspective:1000px]">
          <motion.div
            style={cardStyle}
            className="relative aspect-[2/3] w-full rounded-xl border border-white/20 bg-[#F5F8FC] p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <LogoMark className="h-4" />
              <span className="font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-[#5A6B85]">
                Campus ID
              </span>
            </div>

            <div className="mt-3 flex gap-3">
              {/* Photo well — a silhouette, never a fabricated face. */}
              <div className="relative h-[3.75rem] w-[3rem] shrink-0 overflow-hidden rounded-md border border-[#0A1F44]/12 bg-[#DFE7F1]">
                <span className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full bg-[#A9B8CC]" />
                <span className="absolute left-1/2 top-8 h-6 w-9 -translate-x-1/2 rounded-t-full bg-[#A9B8CC]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                <span className="block h-1.5 w-full rounded-full bg-[#0A1F44]/15" />
                <span className="block h-1.5 w-4/5 rounded-full bg-[#0A1F44]/10" />
                <span className="block h-1.5 w-3/5 rounded-full bg-[#0A1F44]/10" />
              </div>
            </div>

            <p className="mt-3 border-l-2 border-[#0B63C9]/35 pl-2.5 text-[10px] font-medium leading-snug text-[#22364F]">
              Find a ML lab partner in your hostel, not on LinkedIn.
            </p>

            <div className="absolute inset-x-4 bottom-3.5">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-[#7C8CA3]">
                    Member ID
                  </p>
                  <div className="mt-1 flex gap-1" aria-hidden="true">
                    {[10, 14, 8, 12].map((w, i) => (
                      <span
                        key={i}
                        style={{ width: `${w}px` }}
                        className="block h-1.5 rounded-sm bg-[#0A1F44]/20"
                      />
                    ))}
                  </div>
                </div>
                <Stamp
                  tone="accent"
                  rotate={-9}
                  className="border-[#0B63C9]/55 px-2 py-1 text-[8px] tracking-[0.14em] text-[#0B63C9]"
                >
                  VALID — SAME CAMPUS
                </Stamp>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
