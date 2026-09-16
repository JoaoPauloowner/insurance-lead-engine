'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    nome: string;
    email: string;
    role: string;
  };
  organization: {
    nome: string;
  };
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeType?: 'orange' | 'success' | 'purple';
}

export default function DashboardShell({
  children,
  user,
  organization,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const navGroups: { [group: string]: NavItem[] } = {
    GERAL: [
      {
        id: 'overview',
        label: 'Overview',
        href: '/dashboard',
        icon: 'dashboard',
      },
      {
        id: 'leads',
        label: 'Leads Queue',
        href: '/dashboard/leads',
        icon: 'inbox_customize',
        badge: 'SLA < 45s',
        badgeType: 'orange',
      },
      {
        id: 'renovacoes',
        label: 'Pipeline & Radar',
        href: '/dashboard/renovacoes',
        icon: 'filter_alt',
      },
    ],
    OPERAÇÃO: [
      {
        id: 'chat',
        label: 'Chat ao Vivo',
        href: '/dashboard/chat',
        icon: 'forum',
        badge: 'Ao vivo',
        badgeType: 'orange',
      },
      {
        id: 'cotacao',
        label: 'Cotação Cockpit',
        href: '/dashboard/cotacao-cockpit',
        icon: 'monitoring',
      },
      {
        id: 'simulador',
        label: 'Simulador',
        href: '/dashboard/simulador',
        icon: 'account_balance',
      },
      {
        id: 'importar',
        label: 'Importar Planilha',
        href: '/dashboard/importar',
        icon: 'upload_file',
      },
    ],
    'INTELIGÊNCIA & CONFIG': [
      {
        id: 'catalogo',
        label: 'Catálogo de Seguradoras',
        href: '/dashboard/catalogo',
        icon: 'layers',
      },
      {
        id: 'templates',
        label: 'Templates WhatsApp',
        href: '/dashboard/templates',
        icon: 'chat',
      },
      {
        id: 'planos',
        label: 'Planos & Assinatura',
        href: '/dashboard/planos',
        icon: 'workspace_premium',
      },
      {
        id: 'configuracoes',
        label: 'Configurações',
        href: '/dashboard/configuracoes',
        icon: 'tune',
      },
    ],
  };

  const userInitials = (user.nome || 'SV')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-[var(--purple-soft)] selection:text-[var(--text)]">
      {/* Fixed Left Sidebar — SynAIpses CentralFlow Edition (280px) */}
      <aside
        style={{ width: 'var(--sidebar-w)', background: '#0E0E10', borderColor: 'var(--border)' }}
        className="fixed left-0 top-0 h-full border-r z-50 flex flex-col justify-between select-none"
      >
        <div className="flex flex-col min-h-0">
          {/* Brand Header */}
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--purple)] to-[var(--orange)] text-white rounded-[8px] flex items-center justify-center font-sora font-bold text-[14px] shadow-sm">
                ⚡
              </div>
              <div>
                <div className="font-sora font-bold text-[14px] tracking-tight text-[var(--text)]">
                  LeadEngine
                </div>
                <div className="font-mono text-[10px] text-[var(--text-mute)] tracking-wider uppercase">
                  CentralFlow DS
                </div>
              </div>
            </div>

            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#0AFF921A] text-[#0AFF92] border border-[#0AFF9233]">
              ● Online
            </span>
          </div>

          {/* Quick Search */}
          <div className="p-3">
            <div className="h-9 bg-[var(--surface-2)] border border-[var(--border)] rounded-[10px] flex items-center px-3 gap-2 text-[13px] text-[var(--text-mute)]">
              <span className="material-symbols-outlined text-[16px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar atalhos..."
                className="bg-transparent border-none outline-none text-xs text-[var(--text)] placeholder:text-[var(--text-faint)] w-full"
              />
              <span className="ml-auto font-mono text-[10px] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-faint)]">
                ⌘K
              </span>
            </div>
          </div>

          {/* Nav Grouped List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-5 py-2">
            {Object.entries(navGroups).map(([group, items]) => (
              <div key={group}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-faint)] px-2 mb-1.5">
                  {group}
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive =
                      item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`h-9 flex items-center gap-3 px-2.5 rounded-[10px] text-[13px] transition-all ${
                          isActive
                            ? 'bg-[#1E1B2E] text-white border border-[#8B5CF633] font-semibold shadow-xs'
                            : 'text-[var(--text-mute)] hover:bg-[var(--surface-2)] hover:text-white border border-transparent'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] shrink-0 ${
                            isActive ? 'text-[var(--purple)]' : 'text-[var(--text-mute)]'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="font-jakarta flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                              item.badgeType === 'orange'
                                ? 'bg-[#FF7A451A] text-[#FF7A45] border border-[#FF7A4533]'
                                : item.badgeType === 'success'
                                ? 'bg-[#0AFF921A] text-[#0AFF92] border border-[#0AFF9233]'
                                : 'bg-[#8B5CF61A] text-[#8B5CF6] border border-[#8B5CF633]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Card — CentralFlow Signature Gradient Widget */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="rounded-[16px] p-3.5 border border-[#8B5CF633] bg-gradient-to-br from-[#8B5CF61A] to-[#FF7A451A] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sora font-semibold text-[12px] text-white">
                Speed-to-Lead IA
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#0AFF921A] text-[#0AFF92] font-semibold">
                81% veloz
              </span>
            </div>
            <p className="font-jakarta text-[11px] text-[var(--text-mute)] leading-tight">
              Vapi e WhatsApp Aria ativos em menos de 45 segundos.
            </p>
            <div className="pt-1">
              <span className="font-mono text-[10px] text-[var(--text-faint)]">
                Corretora: <strong className="text-[var(--text)]">{organization.nome}</strong>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Offset by 280px) */}
      <div className="pl-[280px]">
        {/* Fixed Top Header (56px) */}
        <header
          style={{ height: 'var(--header-h)', background: 'rgba(14, 14, 16, 0.95)', borderColor: 'var(--border)' }}
          className="fixed top-0 left-[280px] right-0 backdrop-blur-xl border-b z-40 flex items-center justify-between px-6"
        >
          {/* Breadcrumb / Current Location */}
          <div className="flex items-center gap-3">
            <span className="font-sora text-sm font-semibold text-white">
              {pathname === '/dashboard'
                ? 'Cockpit Executivo'
                : pathname.includes('/chat')
                ? 'Live Chat Cockpit'
                : pathname.includes('/leads')
                ? 'Esteira de Leads & Speed-to-Lead'
                : pathname.includes('/renovacoes')
                ? 'Pipeline & Radar de Renovações'
                : pathname.includes('/cotacao')
                ? 'Cotação Multisseguradoras'
                : pathname.includes('/catalogo')
                ? 'Catálogo de Seguradoras'
                : pathname.includes('/simulador')
                ? 'Simulador de Apólices'
                : pathname.includes('/importar')
                ? 'Importação de Planilhas'
                : pathname.includes('/templates')
                ? 'Templates WhatsApp'
                : pathname.includes('/planos')
                ? 'Planos & Assinatura'
                : 'Configurações'}
            </span>
            <span className="text-[var(--text-faint)]">•</span>
            <span className="font-mono text-[11px] text-[var(--text-mute)]">
              {organization.nome}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--purple)] flex items-center justify-center font-mono font-bold text-xs">
                {userInitials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-jakarta text-xs font-semibold text-[var(--text)] leading-tight">
                  {user.nome}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-mute)] leading-tight">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="h-4 w-px bg-[var(--border)] mx-1" />

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-[8px] text-[var(--text-mute)] hover:text-red-400 hover:bg-[var(--surface-2)] transition-colors flex items-center gap-1 text-xs"
              title="Sair do sistema"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline font-jakarta text-xs">Sair</span>
            </button>
          </div>
        </header>

        {/* Page Body (Padding top for 56px header) */}
        <main className="pt-[56px] min-h-[calc(100vh-56px)] bg-[var(--bg)]">
          {children}
        </main>
      </div>
    </div>
  );
}
