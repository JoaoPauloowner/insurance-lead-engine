import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 transition-colors select-none font-medium',
  {
    variants: {
      variant: {
        // --- Variantes de Domínio com Hierarquia Real ---
        // 1. Urgência Crítica (< 15 dias de vigência ou SLA prioritário)
        criticalUrgent:
          'rounded-md border border-red-500/40 bg-red-950/40 text-red-300 font-semibold shadow-xs shadow-red-950/50',
        // 2. Janela de Negociação (15-30 dias para renovação / cotação ativa)
        warningWindow:
          'rounded-md border border-amber-600/35 bg-amber-950/30 text-amber-300 shadow-xs shadow-amber-950/40',
        // 3. Cobertura Garantida (> 30 dias de vigência / apólice ativa / lead convertido)
        secured:
          'rounded-md border border-emerald-600/35 bg-emerald-950/30 text-emerald-300 shadow-xs shadow-emerald-950/40',
        // 4. Apólice Expirada / Em Resgate
        expired:
          'rounded-md border border-zinc-700/60 bg-zinc-900/80 text-zinc-400',
        // 5. Canal de Origem (Metadados neutros, tipografia mono compacta)
        channel:
          'rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 font-mono text-[10px]',
        // 6. Indicador de Status com Ponto Luminoso
        statusDot:
          'rounded-full border border-zinc-800 bg-zinc-900/70 text-zinc-300 pl-1.5 pr-2.5',
        // 7. Pontuação de Qualificação (Score Numérico)
        score:
          'rounded border border-zinc-700 bg-zinc-800/80 text-zinc-200 font-mono tabular-nums font-semibold',

        // --- Variantes Utilitárias Retrô-compatíveis (sem ALL CAPS forçado) ---
        default:
          'rounded-md border border-zinc-700 bg-zinc-800 text-zinc-200',
        secondary:
          'rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400',
        destructive:
          'rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-400',
        outline:
          'rounded-md border border-zinc-700 text-zinc-300',
        emerald:
          'rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        blue:
          'rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-300',
        cyan:
          'rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        amber:
          'rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300',
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
