import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import Input from './Input';

const PasswordInput = forwardRef(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className={cn(
          // Anchored to the input row, not the wrapper: Input renders its hint
          // and error text below the field, so centring on the whole wrapper
          // pushes the eye down whenever a hint is present.
          'absolute right-3 top-0 inline-flex items-center text-mute',
          'transition-colors hover:text-ink rounded-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
          props.label ? 'h-14' : 'h-11'
        )}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
