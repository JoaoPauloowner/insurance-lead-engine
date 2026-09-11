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
    {
      href: '/dashboard/leads',
      label: 'Leads & Ingestão',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      href: '/dashboard/cotacao-cockpit',
      label: 'Cockpit de Cotação',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/simulador',
      label: 'Simulador',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
        </svg>
      ),
    },
    {
      href: '/dashboard/renovacoes',
      label: 'Radar de Renovações',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
      ),
    },
    {
      href: '/dashboard/importar',
      label: 'Importação',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      href: '/dashboard/templates',
      label: 'Templates',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/configuracoes',
      label: 'Configurações',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const primaryColor = organization.corPrimaria || '#2563EB';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#090a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand & Organization */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/leads" className="flex items-center gap-2.5 group active-press">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.nome}
                className="h-7 w-auto max-w-[120px] object-contain rounded"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {organization.nome.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-zinc-100 text-sm tracking-tight group-hover:text-white transition-colors">
                {organization.nome}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sistema de Operação
              </span>
            </div>
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-4 pl-4 border-l border-zinc-800">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/dashboard/leads' && pathname === '/dashboard');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer active-press ${
                    isActive
                      ? 'bg-zinc-800/80 text-zinc-100 shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-blue-400' : 'text-zinc-400'}>{link.icon}</span>
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
              <span className="text-xs font-medium text-zinc-200">{user.nome}</span>
              <span className="text-[10px] font-medium bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                {user.role === 'admin' ? 'Corretor Responsável' : user.role}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">{user.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sair do Sistema"
            className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors text-xs flex items-center gap-1.5 cursor-pointer active-press"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden flex items-center justify-start gap-1 border-t border-zinc-800 bg-[#090a0f] py-1.5 px-3 overflow-x-auto no-scrollbar">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
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
