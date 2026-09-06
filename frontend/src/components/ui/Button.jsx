import { forwardRef, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { snappy, useReducedMotion } from '../../lib/motion';
import Spinner from './Spinner';

const MAGNET_STRENGTH = 0.28;
const MAGNET_MAX = 4; // px — a shift, never enough to look like a bug

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  children,
  onMouseMove,
  onMouseLeave,
  ...props
}, ref) => {
  const reduced = useReducedMotion();
  const localRef = useRef(null);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });

  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm',
    secondary: 'bg-transparent text-ink border border-line hover:border-ink/40 hover:bg-ink/[0.03]',
    ghost: 'bg-transparent text-mute hover:text-ink hover:bg-ink/[0.04]',
    danger: 'bg-bad text-white hover:brightness-110 shadow-sm',
  };
  // Prompt 1 alias — pages pass variant="outline".
  variants.outline = variants.secondary;

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-7 text-base gap-2.5',
  };

  // Magnetic hover: pointer-driven transform, never layout.
  const handleMouseMove = useCallback((e) => {
    onMouseMove?.(e);
    if (reduced || disabled || loading) return;
    // Coarse pointers (touch) get no magnet.
    if (window.matchMedia?.('(pointer: coarse)').matches) return;
    const el = localRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * MAGNET_STRENGTH;
    const dy = (e.clientY - (r.top + r.height / 2)) * MAGNET_STRENGTH;
    setMagnet({
      x: Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx)),
      y: Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy)),
    });
  }, [onMouseMove, reduced, disabled, loading]);

  const handleMouseLeave = useCallback((e) => {
    onMouseLeave?.(e);
    setMagnet({ x: 0, y: 0 });
  }, [onMouseLeave]);

  return (
    <motion.button
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      disabled={disabled || loading}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={reduced ? undefined : { x: magnet.x, y: magnet.y }}
      transition={snappy}
      whileTap={reduced || disabled || loading ? undefined : { scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded font-medium tracking-tight',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        'disabled:opacity-45 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0 items-center">{icon}</span>
      )}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
