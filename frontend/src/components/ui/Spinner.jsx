import { cn } from '../../lib/utils';

/**
 * A thin sweeping arc — reads like an instrument LED rather than a
 * bootstrap donut. Pure SVG + CSS so it costs nothing.
 */
export default function Spinner({ size = 'md', className, ...props }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn('animate-spin', sizes[size])}
        style={{ animationDuration: '0.7s' }}
      >
        {/* track */}
        <circle
          cx="12" cy="12" r="9"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.16"
        />
        {/* sweep — a short arc, flat caps, so it looks machined */}
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
