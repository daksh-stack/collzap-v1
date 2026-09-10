import { AnimatePresence, motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { snappy, transition, useReducedMotion } from '../../lib/motion';
import { useThemeStore } from '../../store/useThemeStore';

/** Sun/moon switch. The icon rotates through instead of blinking. */
export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useThemeStore();
  const reduced = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className={cn(
        'relative grid h-8 w-8 place-items-center overflow-hidden rounded',
        'text-mute transition-colors duration-150 hover:bg-accent-50 hover:text-accent-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -70, scale: 0.7 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 70, scale: 0.7 }}
          transition={transition(snappy, reduced)}
          className="absolute inline-flex"
        >
          {isDark
            ? <Moon className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
            : <Sun className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
