import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 transition-colors select-none font-jakarta font-medium text-xs rounded-[8px]',
  {
    variants: {
      variant: {
        // 1. Urgência Crítica (< 15 dias / SLA estourado)
        criticalUrgent:
          'border border-red-500/30 bg-red-500/15 text-red-400 font-semibold',
        // 2. Janela de Negociação (15-30 dias)
        warningWindow:
          'border border-[#FF7A4533] bg-[#FF7A451A] text-[#FF7A45] font-semibold',
        // 3. Cobertura Garantida / Sucesso
        secured:
          'border border-[#0AFF9233] bg-[#0AFF921A] text-[#0AFF92] font-semibold',
        // 4. Apólice Expirada / Neutro
        expired:
          'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-mute)]',
        // 5. Canal de Origem
        channel:
          'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-mute)] font-mono text-[10px]',
        // 6. Indicador de Status com Ponto Luminoso
        statusDot:
          'rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] pl-1.5 pr-2.5',
        // 7. Pontuação de Qualificação (Score Numérico)
        score:
          'border border-[var(--purple-border)] bg-[#1E1B2E] text-[var(--purple)] font-mono tabular-nums font-semibold',

        // --- Variantes Utilitárias ---
        default:
          'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]',
        secondary:
          'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-mute)]',
        destructive:
          'border border-red-500/30 bg-red-500/15 text-red-400',
        outline:
          'border border-[var(--border)] text-[var(--text-mute)]',
        emerald:
          'border border-[#0AFF9233] bg-[#0AFF921A] text-[#0AFF92]',
        blue:
          'border border-[#8B5CF633] bg-[#8B5CF61A] text-[#8B5CF6]',
        cyan:
          'border border-cyan-500/30 bg-cyan-500/15 text-cyan-400',
        amber:
          'border border-[#FF7A4533] bg-[#FF7A451A] text-[#FF7A45]',
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
          className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
