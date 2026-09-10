import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Pagination({ page: pageProp, currentPage, totalPages, onPageChange, className }) {
  // Callers use either `page` or `currentPage` for the same zero-based index.
  const page = pageProp ?? currentPage ?? 0;

  if (totalPages <= 1) return null;

  const stepBtn = cn(
    'relative inline-flex items-center px-2 py-2 text-mute',
    'ring-1 ring-inset ring-line hover:bg-accent-50 hover:text-accent-700',
    'transition-colors duration-150 focus:z-20 focus-visible:outline-none',
    'disabled:opacity-40 disabled:pointer-events-none'
  );

  const edgeBtn = cn(
    'relative inline-flex items-center rounded border border-line bg-surface',
    'px-4 py-2 text-sm font-medium text-ink hover:border-accent-400 hover:bg-accent-50',
    'transition-colors duration-150',
    'disabled:opacity-40 disabled:pointer-events-none'
  );

  return (
    <div className={cn('flex items-center justify-between border-t border-line px-4 py-3 sm:px-6', className)}>
      <div className="flex flex-1 justify-between sm:hidden">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 0} className={edgeBtn}>
          Previous
        </button>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} className={cn(edgeBtn, 'ml-3')}>
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-mute">
          Page <span className="font-semibold tnum text-ink">{page + 1}</span> of{' '}
          <span className="font-semibold tnum text-ink">{totalPages}</span>
        </p>

        <nav className="isolate inline-flex -space-x-px rounded shadow-sm" aria-label="Pagination">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className={cn(stepBtn, 'rounded-l')}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className={cn(stepBtn, 'rounded-r')}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
}
