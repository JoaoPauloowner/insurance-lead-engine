import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#275ba5] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#275ba5] text-white shadow-xs hover:bg-[#1e4a87]',
        destructive:
          'bg-[#ba1a1a] text-white shadow-xs hover:bg-[#93000a]',
        outline:
          'border border-[#c3c6d3] bg-white text-[#1b1c1c] hover:bg-[#f5f3f3] hover:border-[#737782]',
        secondary:
          'bg-[#efeded] text-[#1b1c1c] shadow-2xs hover:bg-[#e9e8e7]',
        ghost:
          'text-[#565f71] hover:bg-[#f5f3f3] hover:text-[#1b1c1c]',
        link:
          'text-[#275ba5] underline-offset-4 hover:underline',
        emerald:
          'bg-emerald-600 text-white font-medium shadow-xs hover:bg-emerald-500',
        blue:
          'bg-[#275ba5] text-white font-medium shadow-xs hover:bg-[#1e4a87]',
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
