import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-[16px] text-[var(--text)] transition-all',
  {
    variants: {
      variant: {
        // 1. Padrão: Card CentralFlow Dark com borda sutil #232326
        default:
          'border border-[var(--border)] bg-[var(--surface-2)] shadow-sm hover:border-[var(--border-hover)]',
        // 2. Analítico / Superfície Elevada
        analytical:
          'border border-[var(--border)] bg-[var(--surface)] shadow-xs',
        // 3. Interativo: Superfície tátil com active state e hover sutil
        interactive:
          'border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--purple-border)] hover:bg-[#1E1E24] cursor-pointer active:scale-[0.99] shadow-xs',
        // 4. Crítico / Urgência Operacional
        critical:
          'border border-red-500/30 bg-red-950/20 text-red-200 shadow-xs',
        // 5. Destacado / Gradiente Sutil SynAIpses
        elevated:
          'border border-[var(--purple-border)] bg-[var(--surface-2)] shadow-[0_0_24px_rgba(139,92,246,0.08)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  active?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, active, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant }),
        active && 'card-cf-active',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-sora text-sm font-semibold tracking-tight text-[var(--text)]', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-jakarta text-xs text-[var(--text-mute)]', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
