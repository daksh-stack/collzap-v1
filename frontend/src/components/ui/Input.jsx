import { forwardRef, useId, useState } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({
  className,
  label,
  error,
  hint,
  icon,
  type = 'text',
  value,
  defaultValue,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const id = useId();
  const [focused, setFocused] = useState(false);

  // The label floats up when the field is focused or holds anything.
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const floated = focused || hasValue || !!defaultValue || !!props.placeholder;

  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mute">
            {icon}
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className={cn(
            'peer w-full rounded border bg-[#FBF8F2] text-ink',
            'px-3 text-sm placeholder:text-mute/55',
            label ? 'h-14 pt-6 pb-1.5' : 'h-11 py-2',
            'border-line',
            'focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-[border-color,box-shadow] duration-150',
            icon && 'pl-10',
            error && 'border-bad focus:border-bad focus:ring-bad/25',
            className
          )}
          ref={ref}
          {...props}
        />

        {label && (
          <label
            htmlFor={id}
            className={cn(
              'pointer-events-none absolute left-3 origin-left text-mute',
              'transition-all duration-150 ease-out',
              icon && 'left-10',
              floated
                ? 'top-2 text-[11px] font-medium tracking-wide uppercase'
                : 'top-1/2 -translate-y-1/2 text-sm',
              focused && 'text-accent-700',
              error && 'text-bad'
            )}
          >
            {label}
          </label>
        )}
      </div>

      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-bad">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-mute">{hint}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
