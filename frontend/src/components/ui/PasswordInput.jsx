import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';

const PasswordInput = forwardRef(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={className ? `pr-10 ${className}` : 'pr-10'}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
