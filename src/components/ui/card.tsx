import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl text-zinc-100 transition-colors',
  {
    variants: {
      variant: {
        // 1. Padrão: Painel de superfície padrão com borda discreta
        default:
          'border border-zinc-800/80 bg-[#10121a] shadow-xs',
        // 2. Analítico: Alta densidade de dados e tabelas, sem desfoque pesado, borda nítida de 1px
        analytical:
          'border border-zinc-800 bg-[#0e1017] shadow-none',
        // 3. Interativo: Superfície tátil para cards selecionáveis com resposta :active (Emil Kowalski)
        interactive:
          'border border-zinc-800/80 bg-[#10121a] hover:bg-[#131622] hover:border-zinc-700/80 cursor-pointer active-press shadow-xs',
        // 4. Crítico / Urgência Operacional: Contorno sutil com advertência de SLA ou vencimento iminente
        critical:
          'border border-red-500/30 bg-[#140f12] shadow-xs shadow-red-950/20',
        // 5. Destacado / Cockpit Primário
        elevated:
          'border border-zinc-700/70 bg-[#131622] shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
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
    className={cn('flex flex-col space-y-1.5 p-4 sm:p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-sm sm:text-base font-semibold text-zinc-100 leading-tight tracking-tight',
      className
    )}
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
    className={cn('text-xs text-zinc-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4 sm:p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-4 sm:p-5 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
