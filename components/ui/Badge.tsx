import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'custom';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
  accent:  'bg-accent-500/20  text-accent-300  border border-accent-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  warning: 'bg-amber-500/20   text-amber-300   border border-amber-500/30',
  error:   'bg-red-500/20     text-red-300     border border-red-500/30',
  custom:  '',
};

export default function Badge({
  children,
  variant = 'primary',
  className,
  dot,
  icon,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 flex-shrink-0" />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
