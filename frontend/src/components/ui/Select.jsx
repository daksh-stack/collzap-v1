import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef(({
  className,
  label,
  error,
  options = [],
  children,
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
      <select
        id={id}
        aria-invalid={!!error}
        className={cn(
          'block h-11 w-full rounded border border-line bg-[#FBF8F2] px-3 text-sm text-ink',
          'focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-[border-color,box-shadow] duration-150',
          error && 'border-bad focus:border-bad focus:ring-bad/25',
          className
        )}
        ref={ref}
        {...props}
      >
        {children || options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-bad">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
