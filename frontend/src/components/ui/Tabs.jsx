import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../lib/motion';

export default function Tabs({ tabs, active, onChange, className }) {
  const reduced = useReducedMotion();
  const groupId = useId();

  return (
    <div className={className}>
      <div className="sm:hidden">
        <label htmlFor={`${groupId}-select`} className="sr-only">Select a tab</label>
        <select
          id={`${groupId}-select`}
          className="block w-full rounded border border-line bg-surface py-2 pl-3 pr-10 text-sm text-ink focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25"
          value={active}
          onChange={(e) => onChange(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.key} value={tab.key}>{tab.label}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <div className="border-b border-line">
          <nav className="-mb-px flex gap-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onChange(tab.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative whitespace-nowrap py-3 text-sm transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm',
                    isActive ? 'text-ink font-semibold' : 'text-mute hover:text-ink font-medium'
                  )}
                >
                  {tab.label}
                  {isActive && (
                    // Shared layout: the rule slides between tabs instead of blinking.
                    <motion.span
                      layoutId={`${groupId}-underline`}
                      transition={transition(snappy, reduced)}
                      className="grad-brand absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
