/**
 * Motor de Pontuação e Qualificação de Leads (Lead Scorer)
 * Suporta modo Heurístico de Alta Precisão e modo IA (OpenAI / Gemini).
 */

export interface LeadScoringInput {
  nome: string;
  telefone: string;
  email?: string | null;
  origem?: string;
  ramoDesejado?: string;
  notas?: string | null;
  urgencia?: string | null;
}

export interface LeadScoringResult {
  score: number; // 0 a 100
  priority: 'HOT' | 'WARM' | 'COLD';
  recommendedAction: 'VOICE_CALL_VAPI' | 'WHATSAPP_ARIA' | 'SMS_NURTURE';
  resumo: string;
  blueprint: Record<string, any>;
}

export function scoreLeadHeuristic(input: LeadScoringInput): LeadScoringResult {
  let score = 30; // Pontuação base por ter preenchido form

  const ramo = (input.ramoDesejado || '').toLowerCase();
  const notas = (input.notas || '').toLowerCase();
  const urgencia = (input.urgencia || '').toLowerCase();

  // 1. Avaliação do Ramo (Tickets maiores pontuam mais)
  if (
    ramo.includes('empresarial') ||
    ramo.includes('frota') ||
    ramo.includes('saude pme') ||
    ramo.includes('pme') ||
    ramo.includes('condominio')
  ) {
    score += 30; // B2B / Ticket Alto
  } else if (ramo.includes('auto') || ramo.includes('carro') || ramo.includes('veiculo')) {
    score += 20; // Auto é volume e conversão rápida
  } else if (ramo.includes('vida') || ramo.includes('residencial')) {
    score += 15;
  } else {
    score += 10;
  }

  // 2. Avaliação de Urgência
  const urgentKeywords = ['urgente', 'asap', 'hoje', 'imediato', 'vencendo', 'vence', 'amanha', 'agora', 'rapido'];
  const hasUrgentKeyword = urgentKeywords.some((w) => notas.includes(w) || urgencia.includes(w));
  if (hasUrgentKeyword || urgencia === 'alta' || urgencia === 'urgente') {
    score += 25;
  } else if (urgencia === 'media') {
    score += 15;
  }

  // 3. Completude dos dados de contato
  if (input.email && input.email.includes('@')) {
    score += 10;
  }
  if (input.telefone && input.telefone.replace(/\D/g, '').length >= 10) {
    score += 10;
  }

  // 4. Detalhes qualitativos na mensagem
  if (notas.length > 20) {
    score += 5;
  }

  // Cap em 0 - 100
  score = Math.min(100, Math.max(0, score));

  // Classificação
  let priority: 'HOT' | 'WARM' | 'COLD' = 'WARM';
  let recommendedAction: 'VOICE_CALL_VAPI' | 'WHATSAPP_ARIA' | 'SMS_NURTURE' = 'WHATSAPP_ARIA';

  if (score >= 80) {
    priority = 'HOT';
    recommendedAction = 'VOICE_CALL_VAPI';
  } else if (score >= 50) {
    priority = 'WARM';
    recommendedAction = 'WHATSAPP_ARIA';
  } else {
    priority = 'COLD';
    recommendedAction = 'SMS_NURTURE';
  }

  const resumo = `${priority === 'HOT' ? 'Alta Prioridade' : priority === 'WARM' ? 'Prioridade Média' : 'Nutrição'}: Interesse em seguro ${input.ramoDesejado || 'Geral'}. ${
    hasUrgentKeyword ? 'Declarou urgência na contratação.' : 'Em fase de pesquisa e comparação.'
  }`;

  const blueprint = {
    nome: input.nome,
    telefone: input.telefone,
    email: input.email || null,
    ramo: input.ramoDesejado || 'Auto',
    urgenciaDetectada: hasUrgentKeyword ? 'Alta' : 'Normal',
    origem: input.origem || 'anuncio',
    observacoes: input.notas || null,
  };

  return {
    score,
    priority,
    recommendedAction,
    resumo,
    blueprint,
  };
}

export async function scoreLead(input: LeadScoringInput): Promise<LeadScoringResult> {
  // Se houver chave da OpenAI configurada, podemos enriquecer via LLM; senão usa heurística avançada
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return scoreLeadHeuristic(input);
  }

  try {
    const prompt = `Analise este lead de corretora de seguros:
Nome: ${input.nome}
Telefone: ${input.telefone}
Email: ${input.email || 'Não informado'}
Ramo: ${input.ramoDesejado || 'Auto'}
Urgência: ${input.urgencia || 'Não informado'}
Notas: ${input.notas || 'Nenhuma'}

Responda em JSON puro:
{
  "score": número de 0 a 100,
  "priority": "HOT" | "WARM" | "COLD",
  "recommendedAction": "VOICE_CALL_VAPI" | "WHATSAPP_ARIA" | "SMS_NURTURE",
  "resumo": "frase resumida do perfil para o corretor",
  "blueprint": {
    "ramo": "ramo identificado",
    "urgencia": "alta | media | baixa",
    "detalhes": "resumo dos dados fornecidos"
  }
}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = JSON.parse(data.choices[0].message.content);
      return {
        score: typeof content.score === 'number' ? content.score : 70,
        priority: content.priority || 'WARM',
        recommendedAction: content.recommendedAction || 'WHATSAPP_ARIA',
        resumo: content.resumo || 'Lead qualificado via IA.',
        blueprint: content.blueprint || {},
      };
    }
  } catch (err) {
    console.error('Erro ao pontuar lead com OpenAI, usando heurística:', err);
  }

  return scoreLeadHeuristic(input);
}
