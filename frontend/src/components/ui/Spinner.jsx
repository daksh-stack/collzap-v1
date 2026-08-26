import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Spinner({ size = 'md', className, ...props }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={cn('flex justify-center items-center', className)} {...props}>
      <Loader2 className={cn('animate-spin text-brand-500', sizes[size])} />
    </div>
  );
}
