import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent';
export type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:shadow-xl',
  secondary:
    'bg-dark-600 hover:bg-dark-500 active:bg-dark-700 text-slate-100 border border-white/10 hover:border-white/20',
  ghost:
    'bg-transparent hover:bg-white/5 active:bg-white/10 text-slate-300 hover:text-white',
  outline:
    'bg-transparent border border-primary-500/50 hover:border-primary-400 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10',
  accent:
    'bg-accent-500 hover:bg-accent-600 active:bg-accent-600 text-white shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:  'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md:  'px-4 py-2   text-sm font-medium rounded-xl gap-2',
  lg:  'px-6 py-3   text-base font-semibold rounded-xl gap-2.5',
  xl:  'px-8 py-4   text-lg font-semibold rounded-2xl gap-3',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'select-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
