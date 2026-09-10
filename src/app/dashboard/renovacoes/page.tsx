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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Radar de Renovações</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Carteira Ativa
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Apólices monitoradas e ordenadas por urgência de vencimento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/importar"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <span>+</span>
            <span>Importar Apólices</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter(statusFilter === 'urgente' ? 'todos' : 'urgente')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'urgente'
              ? 'bg-rose-500/15 border-rose-500/50 shadow-lg'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Urgentes (&lt; 15 dias)</span>
            <span className="text-lg">🚨</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.urgentes}</p>
          <span className="text-[11px] text-slate-400">Ação imediata necessária</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'proximo' ? 'todos' : 'proximo')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'proximo'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-lg'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">15 a 30 dias</span>
            <span className="text-lg">⏳</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.proximos}</p>
          <span className="text-[11px] text-slate-400">Em janela de cálculo</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'em_dia' ? 'todos' : 'em_dia')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'em_dia'
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Em dia (&gt; 30 dias)</span>
            <span className="text-lg">🛡️</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.emDia}</p>
          <span className="text-[11px] text-slate-400">Cobertura garantida</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'vencido' ? 'todos' : 'vencido')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'vencido'
              ? 'bg-zinc-800 border-zinc-600 shadow-lg'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Vencidos</span>
            <span className="text-lg">⚠️</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.vencidos}</p>
          <span className="text-[11px] text-slate-400">Resgatar cliente</span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar por cliente, seguradora, apólice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <span className="absolute left-3 top-2 text-slate-500 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'urgente', label: 'Urgentes' },
            { id: 'proximo', label: '15-30 dias' },
            { id: 'em_dia', label: 'Em dia' },
            { id: 'vencido', label: 'Vencidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Carregando apólices...</div>
        ) : apolices.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-sm font-semibold text-slate-200">Nenhuma apólice encontrada</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Importe sua planilha de apólices ou converta leads fechados para alimentar o radar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Cliente / Segurado</th>
                  <th className="py-3.5 px-4">Seguro & Seguradora</th>
                  <th className="py-3.5 px-4">Vencimento</th>
                  <th className="py-3.5 px-4">Último Contato</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {apolices.map((apolice) => {
                  const urgency = calculateUrgency(apolice.dataVencimento);
                  const phoneInfo = normalizePhoneBR(apolice.cliente?.telefone);
                  const lastInteraction = apolice.interacoes?.[0];

                  return (
                    <tr key={apolice.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-100 group-hover:text-blue-300">
                          {apolice.cliente?.nome}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>📞 {phoneInfo.formatted}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-200">{apolice.tipoSeguro}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {apolice.seguradora} {apolice.numeroApolice && `• ${apolice.numeroApolice}`}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-200">{formatDateBR(apolice.dataVencimento)}</div>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${urgency.badgeClass}`}>
                            {urgency.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-400">
                        {lastInteraction ? (
                          <div>
                            <span className="text-emerald-400 font-medium text-[11px]">✓ WhatsApp aberto</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {formatDateBR(lastInteraction.createdAt)} por {lastInteraction.user?.nome?.split(' ')[0]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Sem contato ainda</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedApolice(apolice)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md cursor-pointer transition-all"
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
