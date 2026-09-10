'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDateBR, calculateUrgency } from '@/lib/date';
import { normalizePhoneBR } from '@/lib/phone';
import WhatsAppModal from '@/components/WhatsAppModal';

export default function RenovacoesPage() {
  const [apolices, setApolices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedApolice, setSelectedApolice] = useState<any | null>(null);
  const [userOrg, setUserOrg] = useState<{ userName: string; orgName: string }>({
    userName: 'Corretor Sênior',
    orgName: 'Prime Corretora',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (statusFilter !== 'todos') queryParams.set('status', statusFilter);

      const [apolicesRes, templatesRes, meRes] = await Promise.all([
        fetch(`/api/apolices?${queryParams.toString()}`),
        fetch('/api/templates'),
        fetch('/api/auth/me'),
      ]);

      if (apolicesRes.ok) {
        const apolicesData = await apolicesRes.json();
        setApolices(apolicesData.apolices || []);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        setUserOrg({
          userName: meData.user?.nome || 'Corretor Sênior',
          orgName: meData.organization?.nome || 'Prime Corretora',
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    urgentes: apolices.filter((a) => calculateUrgency(a.dataVencimento).status === 'urgente').length,
    proximos: apolices.filter((a) => calculateUrgency(a.dataVencimento).status === 'proximo').length,
    emDia: apolices.filter((a) => calculateUrgency(a.dataVencimento).status === 'em_dia').length,
    vencidos: apolices.filter((a) => calculateUrgency(a.dataVencimento).status === 'vencido').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              PORTFOLIO RADAR ACTIVE
            </span>
            <span className="text-xs text-slate-400 font-mono">Taxa de Retenção: 91.4%</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Radar Preditivo de Renovações
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Monitoramento de apólices com algoritmo de priorização temporal, prevenção de churn e disparo em 1 clique de propostas de renovação via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/importar"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>📥</span>
            <span>Importar Planilha de Apólices</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (Shopify Polaris + Stripe Benchmark) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Urgentes */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'urgente' ? 'todos' : 'urgente')}
          className={`glass-card-interactive p-4 sm:p-5 rounded-2xl cursor-pointer ${
            statusFilter === 'urgente'
              ? 'ring-2 ring-rose-500/80 bg-rose-950/20 border-rose-500/50'
              : 'hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              🚨 Urgentes (&lt; 15 dias)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-semibold">
              CRÍTICO
            </span>
          </div>
          <p className="text-3xl font-black text-rose-400 mt-2 tabular-nums">{stats.urgentes}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Contato Imediato</span>
            <span className="text-[10px] text-rose-400 font-medium">Filtrar urgentes</span>
          </div>
        </div>

        {/* 15-30 dias */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'proximo' ? 'todos' : 'proximo')}
          className={`glass-card-interactive p-4 sm:p-5 rounded-2xl cursor-pointer ${
            statusFilter === 'proximo'
              ? 'ring-2 ring-amber-500/80 bg-amber-950/20 border-amber-500/50'
              : 'hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              ⏳ 15 a 30 dias
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold">
              MULTICÁLCULO
            </span>
          </div>
          <p className="text-3xl font-black text-amber-300 mt-2 tabular-nums">{stats.proximos}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Janela Ideal de Cotação</span>
            <span className="text-[10px] text-amber-400 font-medium">Filtrar janela</span>
          </div>
        </div>

        {/* Em Dia */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'em_dia' ? 'todos' : 'em_dia')}
          className={`glass-card-interactive p-4 sm:p-5 rounded-2xl cursor-pointer ${
            statusFilter === 'em_dia'
              ? 'ring-2 ring-emerald-500/80 bg-emerald-950/20 border-emerald-500/50'
              : 'hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              🛡️ Em dia (&gt; 30 dias)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
              GARANTIDO
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2 tabular-nums">{stats.emDia}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Apólices Cobertas</span>
            <span className="text-[10px] text-emerald-400 font-medium">Filtrar em dia</span>
          </div>
        </div>

        {/* Vencidos */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'vencido' ? 'todos' : 'vencido')}
          className={`glass-card-interactive p-4 sm:p-5 rounded-2xl cursor-pointer ${
            statusFilter === 'vencido'
              ? 'ring-2 ring-slate-500/80 bg-slate-900 border-slate-600'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              ⚠️ Vencidos
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-semibold">
              RESGATE
            </span>
          </div>
          <p className="text-3xl font-black text-slate-400 mt-2 tabular-nums">{stats.vencidos}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Risco de Churn</span>
            <span className="text-[10px] text-slate-400 font-medium">Filtrar vencidos</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Buscar por cliente, seguradora ou apólice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#030712] border border-white/[0.08] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todas', count: apolices.length },
            { id: 'urgente', label: '🚨 Urgentes', count: stats.urgentes },
            { id: 'proximo', label: '⏳ 15-30 dias', count: stats.proximos },
            { id: 'em_dia', label: '🛡️ Em dia', count: stats.emDia },
            { id: 'vencido', label: '⚠️ Vencidas', count: stats.vencidos },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Tabular Display (AWS Cloudscape Benchmark) */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-xs font-semibold text-slate-300">Carregando carteira de apólices...</div>
            <div className="text-[11px] text-slate-500 mt-1">Calculando janelas de renovação</div>
          </div>
        ) : apolices.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mx-auto mb-3">
              📋
            </div>
            <h3 className="text-sm font-bold text-white">Nenhuma apólice encontrada</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Importe sua base de clientes via planilha Excel/CSV ou converta leads fechados no painel de Leads para alimentar o radar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-black/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Cliente & Segurado</th>
                  <th className="py-3.5 px-4">Seguro & Seguradora</th>
                  <th className="py-3.5 px-4">Data de Vencimento</th>
                  <th className="py-3.5 px-4">Status do Relacionamento</th>
                  <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {apolices.map((apolice) => {
                  const urgency = calculateUrgency(apolice.dataVencimento);
                  const phoneInfo = normalizePhoneBR(apolice.cliente?.telefone);
                  const lastInteraction = apolice.interacoes?.[0];

                  const initials = (apolice.cliente?.nome || 'C')
                    .split(' ')
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={apolice.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Cliente Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs shadow">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                              {apolice.cliente?.nome}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                              <span>📞 {phoneInfo.formatted}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Seguro & Seguradora */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{apolice.tipoSeguro}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                          <span className="text-blue-400 font-bold">{apolice.seguradora}</span>
                          {apolice.numeroApolice && <span>• {apolice.numeroApolice}</span>}
                        </div>
                      </td>

                      {/* Vencimento */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 tabular-nums font-mono">
                          {formatDateBR(apolice.dataVencimento)}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${urgency.badgeClass}`}>
                            {urgency.label}
                          </span>
                        </div>
                      </td>

                      {/* Último Contato */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {lastInteraction ? (
                          <div>
                            <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                              <span>✓</span> WhatsApp enviado
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                              {formatDateBR(lastInteraction.createdAt)} por {lastInteraction.user?.nome?.split(' ')[0]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Sem contato registrado</span>
                        )}
                      </td>

                      {/* Ação Imediata */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href="/dashboard/cotacao-cockpit"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                          title="Recalcular no Cockpit"
                        >
                          📈 Cockpit
                        </Link>

                        <button
                          onClick={() => setSelectedApolice(apolice)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                          title="Enviar proposta de renovação via WhatsApp"
                        >
                          💬 WhatsApp
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WhatsAppModal
        isOpen={!!selectedApolice}
        onClose={() => setSelectedApolice(null)}
        targetData={selectedApolice}
        isLead={false}
        templates={templates}
        brokerName={userOrg.userName}
        brokerOrgName={userOrg.orgName}
        onSuccess={fetchData}
      />
    </div>
  );
}

