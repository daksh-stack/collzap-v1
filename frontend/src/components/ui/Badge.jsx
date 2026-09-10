import { cn } from '../../lib/utils';

export default function Badge({ variant = 'default', className, children, ...props }) {
  const variants = {
    default: 'bg-ink/[0.05] text-mute border-line',
    primary: 'bg-accent-50 text-accent-700 border-accent-200',
    success: 'bg-teal-50 text-teal-700 border-teal-200',
    warning: 'bg-wait/10 text-wait border-wait/30',
    danger: 'bg-bad/10 text-bad border-bad/25',
    info: 'bg-ink/[0.05] text-ink/70 border-line',
  };
  // Prompt 1 aliases.
  variants.secondary = variants.default;
  variants.destructive = variants.danger;

  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-sm px-2 py-0.5',
        'text-[11px] font-medium uppercase tracking-wide leading-4',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
