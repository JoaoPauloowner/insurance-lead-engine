import { describe, it, expect } from 'vitest';
import { validateAndSanitizeAiMessage, isPriceMentionBlocked } from '@/lib/compliance';

describe('Camada de Compliance SUSEP (Norma Regulamentadora #1)', () => {
  it('Bloqueia menção direta a valores monetários de prêmio ou franquia gerados por IA/automação', () => {
    const msgComPreco = 'O seu seguro vai custar R$ 2.450,00 por ano com franquia de R$ 3.000,00.';
    expect(isPriceMentionBlocked(msgComPreco)).toBe(true);

    const resultado = validateAndSanitizeAiMessage(msgComPreco, 'Carlos Corretor');
    expect(resultado.valid).toBe(false);
    expect(resultado.blockedReason).toContain('Bloqueio de Compliance SUSEP');
    expect(resultado.sanitizedMessage).toContain('Carlos Corretor');
    expect(resultado.sanitizedMessage).not.toContain('2.450');
  });

  it('Bloqueia referências a parcelamento e mensalidades sem cotação assinada', () => {
    const msgParcela = 'A sua mensalidade ser R$ 210 por mês.';
    expect(isPriceMentionBlocked(msgParcela)).toBe(true);

    const resultado = validateAndSanitizeAiMessage(msgParcela);
    expect(resultado.valid).toBe(false);
    expect(resultado.sanitizedMessage).toContain('seu corretor de seguros');
  });

  it('Permite mensagens de qualificação e agendamento sem citação de valores monetários', () => {
    const msgValida = 'Olá! Gostaria de confirmar se o uso do seu veículo é particular ou comercial para agendarmos o cálculo.';
    expect(isPriceMentionBlocked(msgValida)).toBe(false);

    const resultado = validateAndSanitizeAiMessage(msgValida);
    expect(resultado.valid).toBe(true);
    expect(resultado.sanitizedMessage).toBe(msgValida);
  });
});
