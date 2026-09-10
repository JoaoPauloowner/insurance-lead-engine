'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      router.push('/dashboard/leads');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao tentar entrar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@corretora.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 shadow-inner">
            ⚡
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Insurance Lead Engine</h1>
          <p className="text-xs text-slate-400 mt-1">Plataforma Omnichannel de Aquisição & Renovação de Seguros</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="corretor@suaempresa.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? 'Entrando...' : 'Acessar Plataforma'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800/60 rounded-xl p-3.5 text-xs text-slate-400">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300">Acesso Rápido Demo:</span>
              <button
                type="button"
                onClick={fillDemo}
                className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 cursor-pointer"
              >
                Preencher dados
              </button>
            </div>
            <div className="font-mono text-slate-400 space-y-0.5 text-[11px]">
              <p>Email: admin@corretora.com</p>
              <p>Senha: admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
