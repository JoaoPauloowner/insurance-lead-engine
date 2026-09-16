/**
 * Motor de Cálculo Determinístico de Comissão de Seguros
 * 
 * Regra Crítica:
 * - O cálculo de comissão e prêmio é 100% determinístico baseado nas tabelas comerciais oficiais.
 * - NENHUM cálculo é realizado por LLM/IA.
 * - Todos os valores numéricos financeiros usam precisão monetária de 2 casas decimais.
 */

export interface TabelaComissao {
  auto?: number;
  vida?: number;
  saude?: number;
  residencial?: number;
  empresarial?: number;
  [key: string]: number | undefined;
}

export interface CalculoComissaoItem {
  seguradoraId: string;
  seguradoraNome: string;
  ramo: string;
  valorPremio: number;
  percentualComissao: number; // Ex: 0.15 = 15%
  valorComissao: number; // Prêmio * percentual
  repasseLiquidoEstimado: number;
}

export function parseTabelaComissao(rawTabela: string | Record<string, unknown>): TabelaComissao {
  if (typeof rawTabela === "string") {
    try {
      return JSON.parse(rawTabela);
    } catch {
      return {};
    }
  }
  return (rawTabela || {}) as TabelaComissao;
}

export function calcularComissaoItem(
  seguradoraId: string,
  seguradoraNome: string,
  valorPremio: number,
  ramo: string,
  tabelaComissao: string | Record<string, unknown>
): CalculoComissaoItem {
  const tabela = parseTabelaComissao(tabelaComissao);
  const percentual = tabela[ramo.toLowerCase()] ?? 0.15; // 15% fallback padrão de mercado

  const valorComissaoBruta = Math.round(valorPremio * percentual * 100) / 100;
  // Estimativa de repasse líquido (deduzindo 5% de ISS/impostos operacionais da corretora)
  const repasseLiquido = Math.round(valorComissaoBruta * 0.95 * 100) / 100;

  return {
    seguradoraId,
    seguradoraNome,
    ramo,
    valorPremio,
    percentualComissao: percentual,
    valorComissao: valorComissaoBruta,
    repasseLiquidoEstimado: repasseLiquido,
  };
}

export function compararCotacoes(
  valorPremio: number,
  ramo: string,
  seguradoras: Array<{ id: string; nome: string; tabelaComissao: string }>
): CalculoComissaoItem[] {
  const comparativo = seguradoras.map((s) =>
    calcularComissaoItem(s.id, s.nome, valorPremio, ramo, s.tabelaComissao)
  );

  // Ordena por maior comissão do corretor (melhor retorno comercial)
  return comparativo.sort((a, b) => b.valorComissao - a.valorComissao);
}
