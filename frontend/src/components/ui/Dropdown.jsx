import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../lib/motion';

export default function Dropdown({ trigger, items, align = 'right', className, label = 'Open menu' }) {
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
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={transition(snappy, reduced)}
            className={cn(
              'absolute z-20 mt-2 w-52 origin-top rounded-lg border border-line bg-[#FBF8F2] py-1 shadow-lg',
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
