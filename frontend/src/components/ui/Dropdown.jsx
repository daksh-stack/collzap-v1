import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../lib/motion';

/**
 * `placement="top"` opens the menu upward — needed by triggers that sit near
 * the bottom of the viewport, such as the mobile nav capsule, where the
 * default downward menu would fall off-screen.
 */
export default function Dropdown({
  trigger,
  items,
  align = 'right',
  placement = 'bottom',
  className,
  label = 'Open menu',
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleItemClick = (onClick) => {
    setOpen(false);
    if (onClick) onClick();
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {/* A real button so the menu is keyboard reachable. */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: placement === 'top' ? 4 : -4, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: placement === 'top' ? 4 : -4, scale: 0.98 }}
            transition={transition(snappy, reduced)}
            className={cn(
              'absolute z-20 w-52 rounded-lg border border-line bg-surface py-1 shadow-lg',
              placement === 'top' ? 'bottom-full mb-2 origin-bottom' : 'mt-2 origin-top',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item, index) => (
              <button
                key={index}
                role="menuitem"
                onClick={() => handleItemClick(item.onClick)}
                className={cn(
                  'block w-full px-4 py-2 text-left text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:bg-ink/[0.05]',
                  item.danger
                    ? 'text-bad hover:bg-bad/[0.07]'
                    : 'text-ink hover:bg-ink/[0.05]'
                )}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
