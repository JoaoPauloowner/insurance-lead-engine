'use client';

import React from 'react';
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

export default function DashboardShell({
  children,
  user,
  organization,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: 'dashboard',
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Leads Queue',
      href: '/dashboard/leads',
      icon: 'inbox_customize',
      isActive: pathname.startsWith('/dashboard/leads'),
    },
    {
      label: 'Pipeline & Funnel',
      href: '/dashboard/renovacoes',
      icon: 'filter_alt',
      isActive: pathname.startsWith('/dashboard/renovacoes'),
    },
    {
      label: 'Cotação Cockpit',
      href: '/dashboard/cotacao-cockpit',
      icon: 'monitoring',
      isActive: pathname.startsWith('/dashboard/cotacao-cockpit'),
    },
    {
      label: 'Simulador',
      href: '/dashboard/simulador',
      icon: 'account_balance',
      isActive: pathname.startsWith('/dashboard/simulador'),
    },
    {
      label: 'Importar Planilha',
      href: '/dashboard/importar',
      icon: 'upload_file',
      isActive: pathname.startsWith('/dashboard/importar'),
    },
    {
      label: 'Templates WhatsApp',
      href: '/dashboard/templates',
      icon: 'chat',
      isActive: pathname.startsWith('/dashboard/templates'),
    },
    {
      label: 'Planos & Assinatura',
      href: '/dashboard/planos',
      icon: 'workspace_premium',
      isActive: pathname.startsWith('/dashboard/planos'),
    },
    {
      label: 'Settings',
      href: '/dashboard/configuracoes',
      icon: 'tune',
      isActive: pathname.startsWith('/dashboard/configuracoes'),
    },
  ];

  const userInitials = (user.nome || 'SV')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased">
      {/* Fixed Left Sidebar (Stitch Design System) */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-surface-container-high">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-space-md flex items-center gap-space-sm border-b border-surface-container-high/60">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-lg text-label-md font-bold tracking-tight text-on-surface leading-tight">
                LeadEngine
              </span>
              <span className="font-label-md text-[11px] text-secondary leading-tight tracking-wider uppercase">
                Fintech Core
              </span>
            </div>
          </div>

          {/* Nav Section Label */}
          <div className="px-space-md mt-space-sm mb-space-xs">
            <span className="font-label-md text-[11px] font-semibold uppercase tracking-wider text-secondary">
              Underwriting Hub
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-space-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-all ${
                  item.isActive
                    ? 'bg-secondary-container text-on-secondary-fixed font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md truncate">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom API Gateway Status Card */}
        <div className="p-space-sm m-space-sm rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-[11px] font-medium text-secondary uppercase">
              API Gateway
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <p className="font-label-md text-[12px] text-on-surface-variant leading-normal">
            Direct broker integration synced 1m ago
          </p>
        </div>
      </aside>

      {/* Main Content Area (offset by 64 = 16rem for sidebar) */}
      <div className="pl-64">
        {/* Fixed Top Header (Stitch Design System) */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high z-40 flex items-center justify-between px-space-lg">
          <div className="flex items-center gap-space-md flex-1 max-w-xl">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                className="w-full pl-9 pr-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-label-md text-label-md focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all border border-surface-container-high"
                placeholder="Search carriers, EIN, broker, policy ID..."
                type="text"
              />
            </div>
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-label-md text-[11px] font-medium">
                38ms Engine SLA • Real-time active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <button
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
              type="button"
              title="Notificações"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
            </button>

            <div className="flex items-center gap-space-sm pl-space-sm border-l border-surface-container-high">
              <div className="hidden md:flex flex-col text-right">
                <span className="font-label-md text-label-md font-semibold text-on-surface leading-snug">
                  {user.nome || 'Sarah Vance'}
                </span>
                <span className="font-label-md text-[12px] text-secondary leading-none">
                  {user.role === 'admin' ? 'Principal Underwriter' : 'Broker Specialist'}
                </span>
              </div>
              <div
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-[0_1px_4px_rgba(0,0,0,0.08)] shrink-0"
                title={user.email}
              >
                {userInitials}
              </div>
              <button
                onClick={handleLogout}
                title="Encerrar Sessão"
                className="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error-container/20 transition-colors ml-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="w-full pt-16 bg-background min-h-screen px-space-lg py-space-md">
          {children}
        </main>
      </div>
    </div>
  );
}
