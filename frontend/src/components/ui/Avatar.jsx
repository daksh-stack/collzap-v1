import { useState } from 'react';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

export default function Avatar({ src, name, size = 'md', className }) {
  const [failed, setFailed] = useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-24 w-24 text-2xl',
  };

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : null;

  const showImage = src && !failed;

  return (
    <div
      className={cn(
        // Square-ish with a small radius reads more like an ID photo than a bubble.
        'relative inline-flex items-center justify-center rounded overflow-hidden shrink-0',
        'bg-accent-50 border border-line',
        sizes[size],
        className
      )}
      title={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : initials ? (
        <span className="font-display font-semibold text-accent-700 leading-none">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-accent-300" strokeWidth={1.5} />
      )}
    </div>
  );
}
