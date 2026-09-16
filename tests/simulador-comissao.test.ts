import { describe, it, expect } from 'vitest';
import { calcularComissaoItem, compararCotacoes, parseTabelaComissao } from '@/lib/comissao';

describe('Motor de Cálculo Determinístico de Comissões e Cotações', () => {
  it('Calcula comissão determinística com precisão de duas casas decimais', () => {
    const res = calcularComissaoItem(
      'seg-porto',
      'Porto Seguro',
      3000,
      'auto',
      JSON.stringify({ auto: 0.15, vida: 0.25 })
    );

    expect(res.valorComissao).toBe(450); // 3000 * 0.15 = 450
    expect(res.repasseLiquidoEstimado).toBe(427.5); // 450 * 0.95 = 427.5
  });

  it('Ranqueia seguradoras da maior comissão para a menor comissão', () => {
    const seguradoras = [
      { id: '1', nome: 'Seguradora A', tabelaComissao: JSON.stringify({ auto: 0.14 }) },
      { id: '2', nome: 'Seguradora B', tabelaComissao: JSON.stringify({ auto: 0.18 }) },
      { id: '3', nome: 'Seguradora C', tabelaComissao: JSON.stringify({ auto: 0.16 }) },
    ];

    const ranking = compararCotacoes(5000, 'auto', seguradoras);
    expect(ranking[0]?.seguradoraNome).toBe('Seguradora B'); // 18% = 900
    expect(ranking[0]?.valorComissao).toBe(900);
    expect(ranking[1]?.seguradoraNome).toBe('Seguradora C'); // 16% = 800
    expect(ranking[2]?.seguradoraNome).toBe('Seguradora A'); // 14% = 700
  });

  it('Aplica fallback padrão de 15% caso o ramo não esteja especificado na tabela', () => {
    const tabela = parseTabelaComissao('{}');
    expect(tabela.auto).toBeUndefined();

    const res = calcularComissaoItem('seg-fallback', 'Seguradora X', 2000, 'garantia', '{}');
    expect(res.percentualComissao).toBe(0.15);
    expect(res.valorComissao).toBe(300);
  });
});
