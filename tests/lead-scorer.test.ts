import { describe, it, expect } from 'vitest';
import { scoreLeadHeuristic } from '@/lib/lead-scorer';

describe('Motor Heurístico de Speed-to-Lead Scoring (0 a 100)', () => {
  it('Classifica lead B2B / Frota com urgência como HOT (Score >= 80) e sugere VOICE_CALL_VAPI', () => {
    const result = scoreLeadHeuristic({
      nome: 'Transportadora Falcão',
      telefone: '11999998888',
      email: 'contato@falcao.com.br',
      ramoDesejado: 'frota empresarial',
      urgencia: 'urgente',
      notas: 'Preciso fechar apólice para 15 caminhões hoje porque o contrato vence amanha',
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.priority).toBe('HOT');
    expect(result.recommendedAction).toBe('VOICE_CALL_VAPI');
    expect(result.blueprint.urgenciaDetectada).toBe('Alta');
  });

  it('Classifica lead de seguro auto padrão como WARM (Score 50 a 79) e sugere WHATSAPP_ARIA', () => {
    const result = scoreLeadHeuristic({
      nome: 'Mariana Lima',
      telefone: '11988887777',
      email: 'mariana@gmail.com',
      ramoDesejado: 'auto',
      notas: 'Cotação para Civic 2022',
    });

    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThan(80);
    expect(result.priority).toBe('WARM');
    expect(result.recommendedAction).toBe('WHATSAPP_ARIA');
  });

  it('Classifica lead incompleto sem urgência como COLD', () => {
    const result = scoreLeadHeuristic({
      nome: 'Lead Frio',
      telefone: '1199', // Telefone incompleto
      ramoDesejado: 'outro',
    });

    expect(result.score).toBeLessThan(50);
    expect(result.priority).toBe('COLD');
    expect(result.recommendedAction).toBe('SMS_NURTURE');
  });
});
