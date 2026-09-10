import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../lib/motion';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, children, className, layoutId, size }) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);
  const restoreRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => { setMounted(true); }, []);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    restoreRef.current = document.activeElement;

    // Move focus into the dialog once it exists.
    const raf = requestAnimationFrame(() => {
      const node = panelRef.current;
      if (!node) return;
      const first = node.querySelector(FOCUSABLE);
      // Only focus if focus is not already inside the modal
      if (!node.contains(document.activeElement)) {
        (first || node).focus?.();
      }
    });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      // Trap: cycle focus inside the panel.
      const node = panelRef.current;
      if (!node) return;
      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = 'unset';
      // Return focus to whatever opened the dialog.
      restoreRef.current?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition({ duration: 0.2 }, reduced)}
            className="fixed inset-0 bg-ink/40 backdrop-blur-[8px]"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            layoutId={reduced ? undefined : layoutId}
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 4 }}
            transition={transition(snappy, reduced)}
            className={cn(
              // dvh, not vh: a phone's collapsing address bar otherwise pushes
              // the footer buttons of a tall dialog below the fold.
              'relative w-full flex flex-col max-h-[88dvh]',
              'bg-surface border border-line rounded-lg shadow-lg',
              widths[size] || widths.md,
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-line sm:px-6">
                <h2 className="font-display text-lg font-semibold text-ink tracking-tight">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-mute hover:text-ink rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="p-5 overflow-y-auto sm:p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
