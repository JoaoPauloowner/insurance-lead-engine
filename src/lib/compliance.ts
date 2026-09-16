/**
 * Camada determinística de validação de compliance SUSEP (Superintendência de Seguros Privados)
 * 
 * Regra Crítica: Nenhum código, webhook, assistente de IA conversacional (WhatsApp Aria ou Vapi Voz)
 * pode prometer, aprovar ou fixar valores de prêmio ou franquia de seguro de forma autônoma.
 * A fixação de valores e envio de proposta formal é prerrogativa do corretor habilitado.
 */

// Regex para detecção de menções monetárias ou referências a preço/franquia
const MONETARY_VALUE_REGEX = /R\$\s*\d+([.,]\d{1,2})?|\b\d+([.,]\d{2})\s*reais\b/i;
const PRICE_FRANCHISE_REGEX = /\b(pr[eê]mio|franquia|mensalidade|parcelas?|custo total|valor total)\s*(de|em|ser[aá]|:[ ]*)\s*(R\$|\d+)/i;

export interface ComplianceValidationResult {
  valid: boolean;
  blockedReason?: string;
  sanitizedMessage: string;
}

/**
 * Valida se uma mensagem gerada pela IA contém valores monetários que violem as normas da SUSEP.
 * Caso viole, higieniza a mensagem orientando que o corretor apresentará as propostas oficiais.
 */
export function validateAndSanitizeAiMessage(
  message: string,
  corretorNome = "seu corretor de seguros"
): ComplianceValidationResult {
  if (!message || typeof message !== "string") {
    return {
      valid: true,
      sanitizedMessage: "",
    };
  }

  // Verifica se há menção explícita de valores ou estimativas monetárias
  const hasMonetaryValue = MONETARY_VALUE_REGEX.test(message);
  const hasPriceOrFranchise = PRICE_FRANCHISE_REGEX.test(message);

  if (hasMonetaryValue || hasPriceOrFranchise) {
    return {
      valid: false,
      blockedReason: "Bloqueio de Compliance SUSEP: Tentativa de comunicação de valor de prêmio/franquia por automação.",
      sanitizedMessage: `O cálculo exato do prêmio e franquia da sua apólice é conferido pelo ${corretorNome}. Em instantes você receberá a cotação oficial comparando as seguradoras parceiras.`,
    };
  }

  return {
    valid: true,
    sanitizedMessage: message,
  };
}

export function isPriceMentionBlocked(text: string): boolean {
  return MONETARY_VALUE_REGEX.test(text) || PRICE_FRANCHISE_REGEX.test(text);
}

export interface PlanStatusResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Valida o status da assinatura / trial da corretora para controle comercial SaaS
 */
export function checkOrganizationPlanStatus(organization: {
  statusPlano?: string | null;
  trialAte?: Date | string | null;
}): PlanStatusResult {
  const status = organization.statusPlano || 'trial';

  if (status === 'cancelado' || status === 'bloqueado') {
    return { allowed: false, reason: 'Assinatura cancelada ou suspensa. Regularize o plano para continuar operando.' };
  }

  if (status === 'trial' && organization.trialAte) {
    const trialDate = new Date(organization.trialAte);
    if (Date.now() > trialDate.getTime()) {
      return { allowed: false, reason: 'Período de teste (trial de 14 dias) encerrado. Escolha um plano para continuar.' };
    }
  }

  return { allowed: true };
}
