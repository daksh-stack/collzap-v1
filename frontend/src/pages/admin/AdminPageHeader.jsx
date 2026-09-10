/**
 * Ops register: modest headings (never larger than 24px), dense meta line.
 */
export default function AdminPageHeader({ title, count, children }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        {count != null && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mute tnum">
            {count} total
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
    </header>
  );
}
