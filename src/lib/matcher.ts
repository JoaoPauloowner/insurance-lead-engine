export interface SystemField {
  key: string;
  label: string;
  required: boolean;
  synonyms: string[];
}

export const SYSTEM_FIELDS: SystemField[] = [
  {
    key: 'nome',
    label: 'Nome do Cliente / Segurado',
    required: true,
    synonyms: ['nome', 'cliente', 'segurado', 'titular', 'nome cliente', 'nome do cliente', 'razao social', 'contato'],
  },
  {
    key: 'telefone',
    label: 'Telefone / WhatsApp',
    required: true,
    synonyms: ['telefone', 'celular', 'whatsapp', 'wpp', 'fone', 'tel', 'cel', 'contato telefone'],
  },
  {
    key: 'email',
    label: 'E-mail',
    required: false,
    synonyms: ['email', 'e-mail', 'mail', 'correio'],
  },
  {
    key: 'seguradora',
    label: 'Seguradora / Cia',
    required: true,
    synonyms: ['seguradora', 'cia', 'companhia', 'empresa', 'operadora'],
  },
  {
    key: 'tipoSeguro',
    label: 'Tipo de Seguro / Ramo',
    required: true,
    synonyms: ['tipo', 'ramo', 'produto', 'tipo seguro', 'tipo de seguro', 'modalidade', 'cobertura'],
  },
  {
    key: 'numeroApolice',
    label: 'Número da Apólice / Proposta',
    required: false,
    synonyms: ['apolice', 'numero apolice', 'nº apolice', 'proposta', 'num apolice', 'contrato'],
  },
  {
    key: 'dataVencimento',
    label: 'Data de Vencimento / Fim de Vigência',
    required: true,
    synonyms: ['vencimento', 'termino', 'fim vigencia', 'data vencimento', 'vigencia final', 'data final', 'renovacao', 'validade'],
  },
  {
    key: 'dataInicio',
    label: 'Data de Início / Início de Vigência',
    required: false,
    synonyms: ['inicio', 'data inicio', 'vigencia inicial', 'data vigencia', 'emissao'],
  },
];

function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

export function guessColumnMapping(headers: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    normalized: normalizeHeader(h),
  }));

  for (const field of SYSTEM_FIELDS) {
    for (const syn of field.synonyms) {
      const match = normalizedHeaders.find((h) => h.normalized === syn);
      if (match) {
        result[field.key] = match.original;
        break;
      }
    }

    if (!result[field.key]) {
      for (const syn of field.synonyms) {
        const match = normalizedHeaders.find((h) => h.normalized.includes(syn) || syn.includes(h.normalized));
        if (match) {
          result[field.key] = match.original;
          break;
        }
      }
    }
  }

  return result;
}
