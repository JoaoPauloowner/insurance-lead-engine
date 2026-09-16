import { describe, it, expect } from 'vitest';
import { calculateUrgency, parseDateFlexible, formatDateBR } from '@/lib/date';

describe('Radar de Renovações e Decaimento Temporal de Apólices', () => {
  it('Identifica apólice vencendo em menos de 15 dias como URGENTE', () => {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 7); // 7 dias

    const urg = calculateUrgency(dataFutura);
    expect(urg.status).toBe('urgente');
    expect(urg.daysRemaining).toBeLessThanOrEqual(15);
  });

  it('Identifica apólice vencendo entre 16 e 30 dias como PRÓXIMO', () => {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 25); // 25 dias

    const urg = calculateUrgency(dataFutura);
    expect(urg.status).toBe('proximo');
  });

  it('Identifica apólice com mais de 30 dias como EM DIA', () => {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 60); // 60 dias

    const urg = calculateUrgency(dataFutura);
    expect(urg.status).toBe('em_dia');
  });

  it('Converte datas no padrão brasileiro (DD/MM/YYYY) com segurança', () => {
    const d = parseDateFlexible('25/12/2026');
    expect(d).not.toBeNull();
    expect(d?.getDate()).toBe(25);
    expect(d?.getMonth()).toBe(11); // Dezembro = 11
    expect(d?.getFullYear()).toBe(2026);
    expect(formatDateBR(d)).toBe('25/12/2026');
  });
});
