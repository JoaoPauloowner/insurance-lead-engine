'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [nomeCorretora, setNomeCorretora] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          nomeCorretora,
          email,
          password,
          telefone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar conta.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-[#e9e8e7] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              LE
            </div>
            <div>
              <span className="text-base font-bold text-[#1b1c1c] tracking-tight block">LeadEngine Pro</span>
              <span className="text-[11px] text-secondary">Fintech Core & Insurance Underwriting</span>
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1b1c1c]">
            Comece seu Teste Grátis de 7 Dias
          </h1>
          <p className="text-xs text-secondary mt-1">
            Acesso completo ao Cockpit de Cotação, Radar de Renovações e Speed-to-Lead com WhatsApp.
          </p>
        </div>

        {/* Benefits Banner */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs text-secondary">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Sem fidelidade • Sem cartão de crédito para testar</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Templates de WhatsApp pré-configurados prontos para uso</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">
              Seu Nome Completo
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Carlos Eduardo Silva"
              className="w-full bg-[#fbf9f9] border border-[#e9e8e7] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">
              Nome da sua Corretora de Seguros
            </label>
            <input
              type="text"
              required
              value={nomeCorretora}
              onChange={(e) => setNomeCorretora(e.target.value)}
              placeholder="Ex: Valle Corretora de Seguros"
              className="w-full bg-[#fbf9f9] border border-[#e9e8e7] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">
                E-mail Comercial
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@valle.com.br"
                className="w-full bg-[#fbf9f9] border border-[#e9e8e7] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">
                WhatsApp / Celular
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full bg-[#fbf9f9] border border-[#e9e8e7] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">
              Senha de Acesso (Mínimo 6 dígitos)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#fbf9f9] border border-[#e9e8e7] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Configurando sua Corretora...</span>
                </>
              ) : (
                <>
                  <span>Criar Conta e Iniciar Teste Grátis</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="pt-4 border-t border-[#e9e8e7] text-center text-xs text-secondary">
          <span>Já tem uma conta cadastrada? </span>
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
