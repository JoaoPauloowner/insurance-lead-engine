'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  user: {
    nome: string;
    email: string;
    role: string;
  };
  organization: {
    nome: string;
    corPrimaria?: string | null;
    logoUrl?: string | null;
  };
}

export default function Header({ user, organization }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navLinks = [
    { href: '/dashboard/leads', label: 'Leads em Tempo Real', icon: '⚡' },
    { href: '/dashboard/simulador', label: 'Simulador com IA', icon: '🎯' },
    { href: '/dashboard/renovacoes', label: 'Radar de Renovações', icon: '📊' },
    { href: '/dashboard/importar', label: 'Importar Planilha', icon: '📁' },
    { href: '/dashboard/templates', label: 'Modelos de Mensagens', icon: '💬' },
    { href: '/dashboard/configuracoes', label: 'Configurações & Webhook', icon: '⚙️' },
  ];

  const primaryColor = organization.corPrimaria || '#2563EB';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard/leads" className="flex items-center gap-3 group">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.nome}
                className="h-9 w-auto max-w-[140px] object-contain rounded"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-xs group-hover:scale-105 transition-transform"
                style={{ backgroundColor: primaryColor }}
              >
                {organization.nome.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 text-sm sm:text-base leading-tight tracking-tight group-hover:text-blue-400 transition-colors">
                {organization.nome}
              </span>
              <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Insurance Lead Engine
              </span>
            </div>
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 border-l border-slate-800/80 pl-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/dashboard/leads' && pathname === '/dashboard');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  style={isActive ? { borderLeft: `2px solid ${primaryColor}` } : {}}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{user.nome}</span>
            <span className="text-[10px] text-slate-400">{user.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/60 bg-slate-950/95 py-2 px-1 overflow-x-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2 py-1 rounded-md text-[10px] font-medium flex flex-col items-center gap-0.5 whitespace-nowrap ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-sm">{link.icon}</span>
              <span>{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
