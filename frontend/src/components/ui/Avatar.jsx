import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

export default function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-24 w-24 text-3xl'
  };

  const initials = name 
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : null;

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-brand-100 overflow-hidden shrink-0',
        sizes[size],
        className
      )}
      title={name}
    >
      {src ? (
        <img 
          src={src} 
          alt={name || 'Avatar'} 
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : initials ? (
        <span className="font-semibold text-brand-700 leading-none">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-brand-400" />
      )}
    </div>
  );
}
