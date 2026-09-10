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
    { href: '/dashboard/leads', label: 'Leads & Ingestão', icon: '⚡' },
    { href: '/dashboard/cotacao-cockpit', label: 'Cockpit de Cotação', icon: '📈' },
    { href: '/dashboard/simulador', label: 'Simulador IA', icon: '🎯' },
    { href: '/dashboard/renovacoes', label: 'Radar de Renovações', icon: '📊' },
    { href: '/dashboard/importar', label: 'Importar', icon: '📥' },
    { href: '/dashboard/templates', label: 'Templates', icon: '💬' },
    { href: '/dashboard/configuracoes', label: 'Webhook & IA', icon: '⚙️' },
  ];

  const primaryColor = organization.corPrimaria || '#2563EB';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Organization */}
        <div className="flex items-center gap-5">
          <Link href="/dashboard/leads" className="flex items-center gap-3 group">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.nome}
                className="h-8 w-auto max-w-[130px] object-contain rounded"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md group-hover:scale-105 transition-transform"
                style={{ backgroundColor: primaryColor }}
              >
                {organization.nome.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors">
                {organization.nome}
              </span>
              <span className="text-[10px] font-mono font-medium text-emerald-400 flex items-center gap-1.5 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                LEAD ENGINE • PRO
              </span>
            </div>
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 ml-3 pl-4 border-l border-white/[0.08]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/dashboard/leads' && pathname === '/dashboard');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span className="text-xs opacity-80">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile, Underwriter Role & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-semibold text-slate-200">{user.nome}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-blue-400 px-1.5 py-0.2 rounded border border-slate-700">
                {user.role === 'admin' ? 'Broker / Underwriter' : user.role}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{user.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sair do Sistema"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden flex items-center justify-start gap-1 border-t border-white/[0.06] bg-[#030712]/95 py-2 px-3 overflow-x-auto no-scrollbar">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
