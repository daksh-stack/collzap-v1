import { useReducedMotion } from '../lib/motion';

/**
 * One empty chair, breathing slowly. Used for the waiting/idle state —
 * inline SVG, no Lottie, no looping gradient.
 */
export default function EmptyChair({ className = '' }) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 120 130"
      className={className}
      fill="none"
      role="img"
      aria-label="An empty chair"
    >
      <style>{`
        @keyframes chair-breathe {
          0%, 100% { opacity: 0.42; }
          50%      { opacity: 0.85; }
        }
        .chair-line { animation: chair-breathe 3.6s ease-in-out infinite; }
      `}</style>

      <g
        className={reduced ? undefined : 'chair-line'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={reduced ? 0.6 : undefined}
      >
        {/* backrest */}
        <path d="M38 20h44a5 5 0 0 1 5 5v34H33V25a5 5 0 0 1 5-5z" />
        <path d="M46 32h28M46 43h28" opacity="0.5" />
        {/* seat */}
        <path d="M27 60h66l-4 14H31z" />
        {/* legs */}
        <path d="M35 74l-5 34M85 74l5 34M40 96h40" />
      </g>

      {/* floor line, static so the whole thing does not throb */}
      <path d="M14 112h92" stroke="currentColor" strokeWidth="1" opacity="0.18" strokeLinecap="round" />
    </svg>
  );
}
