/**
 * Cliente de Integração com Vapi.ai para Ligações Telefônicas Ativas com IA
 */

export interface VapiCallParams {
  phoneNumber: string;
  leadName: string;
  insuranceBranch: string;
  brokerOrgName: string;
}

export interface VapiCallResult {
  success: boolean;
  callId?: string;
  status: string;
  isMock: boolean;
  error?: string;
}

export async function triggerVapiVoiceCall(params: VapiCallParams): Promise<VapiCallResult> {
  const apiKey = process.env.VAPI_API_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID;

  // Se não houver chave real configurada, simula o disparo com sucesso para desenvolvimento/testes
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: true,
      callId: `vapi_sim_${Date.now()}`,
      status: 'call_queued_simulation',
      isMock: true,
    };
  }

  try {
    const res = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        assistantId: assistantId || undefined,
        customer: {
          number: params.phoneNumber,
          name: params.leadName,
        },
        assistantOverrides: {
          variableValues: {
            NOME_CLIENTE: params.leadName,
            RAMO_SEGURO: params.insuranceBranch,
            NOME_CORRETORA: params.brokerOrgName,
          },
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro na API Vapi.ai');
    }

    return {
      success: true,
      callId: data.id,
      status: data.status || 'in_progress',
      isMock: false,
    };
  } catch (err: any) {
    console.error('Falha ao disparar chamada no Vapi:', err);
    return {
      success: false,
      status: 'failed',
      isMock: false,
      error: err.message,
    };
  }
}
