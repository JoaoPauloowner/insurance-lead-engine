import { describe, it, expect } from 'vitest';
import { normalizePhoneBR, sanitizePhone, buildWaMeUrl } from '@/lib/phone';

describe('Normalização de Telefones E.164 Brasileiros e wa.me', () => {
  it('Sanitiza caracteres especiais e pontuação de telefones', () => {
    expect(sanitizePhone('(11) 98765-4321')).toBe('11987654321');
    expect(sanitizePhone('+55 11 98765-4321')).toBe('5511987654321');
  });

  it('Normaliza número celular de SP adicionando DDI 55 e formatação visual', () => {
    const res = normalizePhoneBR('11987654321');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('5511987654321');
    expect(res.formatted).toBe('(11) 98765-4321');
  });

  it('Monta link wa.me válido com texto encodado', () => {
    const url = buildWaMeUrl('11987654321', 'Olá, tudo bem?');
    expect(url).toBe('https://wa.me/5511987654321?text=Ol%C3%A1%2C%20tudo%20bem%3F');
  });

  it('Identifica números inválidos', () => {
    const res = normalizePhoneBR('12345');
    expect(res.isValid).toBe(false);
  });
});
