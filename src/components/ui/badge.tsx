import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'border border-slate-700 bg-slate-800/80 text-slate-200',
        secondary:
          'border border-slate-700/60 bg-slate-900 text-slate-400',
        destructive:
          'border border-rose-500/30 bg-rose-500/10 text-rose-400',
        outline:
          'border border-slate-700 text-slate-300',
        emerald:
          'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        blue:
          'border border-blue-500/30 bg-blue-500/10 text-blue-400',
        cyan:
          'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        amber:
          'border border-amber-500/30 bg-amber-500/10 text-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
