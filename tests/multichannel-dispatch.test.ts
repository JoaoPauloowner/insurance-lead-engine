import { describe, it, expect } from 'vitest';
import { triggerVapiVoiceCall } from '@/lib/vapi';
import { sendAutomatedWhatsApp } from '@/lib/whatsapp';

describe('Disparo Multicanal (Voz Vapi & WhatsApp) com Graceful Fallback', () => {
  it('Simula chamada telefônica ativa no Vapi com sucesso sem travar ambiente local', async () => {
    const result = await triggerVapiVoiceCall({
      phoneNumber: '5511999998888',
      leadName: 'Carlos Silva',
      insuranceBranch: 'Auto Frota',
      brokerOrgName: 'Seguros Prime',
    });

    expect(result.success).toBe(true);
    expect(result.callId).toBeDefined();
    expect(result.isMock).toBe(true);
    expect(result.status).toBe('call_queued_simulation');
  });

  it('Simula disparo de WhatsApp automático com formatação e status enviado', async () => {
    const result = await sendAutomatedWhatsApp({
      phoneNumber: '11988887777',
      leadName: 'Beatriz Advogados',
      insuranceBranch: 'Saúde Empresarial',
      brokerOrgName: 'Seguros Prime',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(result.isMock).toBe(true);
    expect(result.status).toBe('dispatched_simulation');
    expect(result.dispatchedAt).toBeDefined();
  });
});
