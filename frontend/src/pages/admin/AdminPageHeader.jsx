/**
 * Ops register: modest headings (never larger than 24px), dense meta line.
 *
 * The action slot wraps rather than staying on one line — Questions puts a
 * filter and three buttons in here, which cannot fit a phone's width and used
 * to run off the right edge unreachable.
 */
export default function AdminPageHeader({ title, count, children }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {title}
        </h1>
        {count != null && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mute tnum">
            {count} total
          </p>
        )}
      </div>
      {children && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:gap-3">
          {children}
        </div>
      )}
    </header>
  );
}
