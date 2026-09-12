import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 transition-colors select-none font-medium text-xs',
  {
    variants: {
      variant: {
        // --- Variantes de Domínio Claras e Legíveis ---
        // 1. Urgência Crítica (< 15 dias de vigência ou SLA prioritário)
        criticalUrgent:
          'rounded-md border border-red-200 bg-red-50 text-red-700 font-semibold shadow-2xs',
        // 2. Janela de Negociação (15-30 dias para renovação / cotação ativa)
        warningWindow:
          'rounded-md border border-amber-200 bg-amber-50 text-amber-800 shadow-2xs',
        // 3. Cobertura Garantida (> 30 dias de vigência / apólice ativa / lead convertido)
        secured:
          'rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-2xs',
        // 4. Apólice Expirada / Em Resgate
        expired:
          'rounded-md border border-slate-200 bg-slate-100 text-slate-600',
        // 5. Canal de Origem (Metadados neutros, tipografia mono compacta)
        channel:
          'rounded border border-slate-200 bg-slate-100 text-slate-700 font-mono text-[10px]',
        // 6. Indicador de Status com Ponto Luminoso
        statusDot:
          'rounded-full border border-slate-200 bg-white text-slate-700 pl-1.5 pr-2.5',
        // 7. Pontuação de Qualificação (Score Numérico)
        score:
          'rounded border border-slate-300 bg-white text-slate-800 font-mono tabular-nums font-semibold',

        // --- Variantes Utilitárias ---
        default:
          'rounded-md border border-slate-200 bg-slate-100 text-slate-800',
        secondary:
          'rounded-md border border-[#e9e8e7] bg-[#f5f3f3] text-[#565f71]',
        destructive:
          'rounded-md border border-red-200 bg-red-50 text-red-700',
        outline:
          'rounded-md border border-slate-200 text-slate-700',
        emerald:
          'rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700',
        blue:
          'rounded-md border border-[#d7e0f5] bg-[#d7e0f5]/60 text-[#275ba5]',
        cyan:
          'rounded-md border border-cyan-200 bg-cyan-50 text-cyan-800',
        amber:
          'rounded-md border border-amber-200 bg-amber-50 text-amber-800',
      },
      size: {
        default: 'px-2 py-0.5 text-[11px] leading-tight',
        sm: 'px-1.5 py-0.5 text-[10px] leading-tight',
        lg: 'px-2.5 py-1 text-xs leading-normal',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

function Badge({ className, variant, size, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dotColor && (
        <span
          className={cn(
            'inline-block w-1.5 h-1.5 rounded-full shrink-0',
            dotColor
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
