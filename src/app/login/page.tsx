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
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#10121a] border border-zinc-800/80 rounded-xl p-7 shadow-xl">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 mb-3 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Insurance Lead Engine</h1>
          <p className="text-xs text-zinc-400 mt-1">Plataforma de Operação & Inteligência de Sinistros</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">E-mail corporativo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="corretor@corretora.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Senha de acesso</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors active-press shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-5 cursor-pointer"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <div className="bg-[#090a0f] border border-zinc-800/80 rounded-lg p-3 text-xs text-zinc-400">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-zinc-300">Ambiente de Demonstração</span>
              <button
                type="button"
                onClick={fillDemo}
                className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer active-press"
              >
                Preencher
              </button>
            </div>
            <div className="font-mono text-zinc-500 space-y-0.5 text-[11px]">
              <p>Usuário: admin@corretora.com</p>
              <p>Senha: admin123</p>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-zinc-400">
            <span>Não tem uma conta? </span>
            <a href="/cadastro" className="text-blue-400 hover:text-blue-300 font-semibold underline">
              Criar conta (7 dias grátis)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
