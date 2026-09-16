import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-xs font-jakarta font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#FAFAFA] text-[#0A0A0B] hover:bg-white shadow-xs',
        gradient:
          'text-white bg-[var(--gradient)] hover:opacity-90 shadow-sm',
        primary:
          'bg-[var(--purple)] text-white hover:bg-[#7C3AED] shadow-xs',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-xs',
        outline:
          'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface)] hover:border-[var(--border-hover)]',
        secondary:
          'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-3)]',
        ghost:
          'bg-transparent border border-transparent text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--border)]',
        link:
          'text-[var(--purple)] underline-offset-4 hover:underline',
        emerald:
          'bg-[var(--success)] text-[#0A0A0B] font-semibold hover:opacity-90',
        blue:
          'bg-[var(--purple)] text-white hover:opacity-90',
      },
      size: {
        default: 'h-9 px-4 py-2 text-xs',
        sm: 'h-8 px-3 text-[11px]',
        lg: 'h-11 px-5 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
