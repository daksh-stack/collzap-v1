import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

const TextArea = forwardRef(({
  className,
  label,
  error,
  rows = 3,
  ...props
}, ref) => {
  const id = useId();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={id}
        aria-invalid={!!error}
        className={cn(
          'block w-full rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink',
          'placeholder:text-mute/55 resize-y',
          'focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-[border-color,box-shadow] duration-150',
          error && 'border-bad focus:border-bad focus:ring-bad/25',
          className
        )}
        ref={ref}
        rows={rows}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-bad">{error}</p>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
