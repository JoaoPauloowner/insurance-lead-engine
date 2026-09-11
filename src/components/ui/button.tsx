import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow-sm hover:bg-blue-500',
        destructive:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-500',
        outline:
          'border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white',
        secondary:
          'bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700',
        ghost:
          'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
        link:
          'text-blue-400 underline-offset-4 hover:underline',
        emerald:
          'bg-emerald-500 text-emerald-950 font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/30',
        blue:
          'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-500',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-[11px]',
        lg: 'h-10 px-6 text-sm',
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
