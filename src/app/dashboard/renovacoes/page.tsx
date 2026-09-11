'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDateBR, calculateUrgency } from '@/lib/date';
import { normalizePhoneBR } from '@/lib/phone';
import WhatsAppModal from '@/components/WhatsAppModal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function RenovacoesPage() {
  const [apolices, setApolices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedApolice, setSelectedApolice] = useState<any | null>(null);
  const [userOrg, setUserOrg] = useState<{ userName: string; orgName: string }>({
    userName: 'Corretor Responsável',
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
          userName: meData.user?.nome || 'Corretor Responsável',
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

  const totalCount = apolices.length;
  const pctUrgentes = totalCount > 0 ? Math.round((stats.urgentes / totalCount) * 100) : 0;
  const pctProximos = totalCount > 0 ? Math.round((stats.proximos / totalCount) * 100) : 0;
  const pctEmDia = totalCount > 0 ? Math.round((stats.emDia / totalCount) * 100) : 0;
  const pctVencidos = totalCount > 0 ? Math.max(0, 100 - (pctUrgentes + pctProximos + pctEmDia)) : 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* Header Operacional Sóbrio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/40 text-blue-300 border border-blue-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Radar Ativo de Carteira
            </span>
            <span className="text-xs text-zinc-400 font-mono">Taxa de renovação: 91,4%</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Radar de Renovações
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">
            Acompanhamento temporal de apólices, priorização por prazo de vigência e acionamento preventivo de clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/importar"
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer active-press"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Importar planilha</span>
          </Link>
        </div>
      </div>

      {/* DISPOSITIVO ESTRUTURAL: Timeline / Régua de Decaimento Temporal */}
      <Card variant="analytical" className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span>Distribuição temporal da carteira</span>
              <span className="text-xs font-mono text-zinc-400 font-normal">
                ({totalCount} apólices na base)
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Horizonte de vencimento segmentado por gravidade e janela ideal de ação do corretor.
            </p>
          </div>
          {statusFilter !== 'todos' && (
            <button
              onClick={() => setStatusFilter('todos')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Exibir todas as apólices
            </button>
          )}
        </div>

        {/* Barra Proporcional de Decaimento Temporal */}
        <div className="mt-4 mb-4">
          <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden flex shadow-inner">
            {totalCount > 0 ? (
              <>
                <div
                  style={{ width: `${pctUrgentes}%` }}
                  className="bg-red-500 transition-all duration-300"
                  title={`Crítico (< 15d): ${stats.urgentes} (${pctUrgentes}%)`}
                />
                <div
                  style={{ width: `${pctProximos}%` }}
                  className="bg-amber-500 transition-all duration-300"
                  title={`Janela de cotação (15-30d): ${stats.proximos} (${pctProximos}%)`}
                />
                <div
                  style={{ width: `${pctEmDia}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                  title={`Vigência regular (> 30d): ${stats.emDia} (${pctEmDia}%)`}
                />
                <div
                  style={{ width: `${pctVencidos}%` }}
                  className="bg-zinc-600 transition-all duration-300"
                  title={`Expiradas: ${stats.vencidos} (${pctVencidos}%)`}
                />
              </>
            ) : (
              <div className="w-full bg-zinc-800" />
            )}
          </div>
        </div>

        {/* Etapas Integradas da Régua Temporal (Filtros operacionais diretos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Estágio 1: Urgência Crítica */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'urgente' ? 'todos' : 'urgente')}
            className={`p-3 rounded-lg border transition-all cursor-pointer active-press ${
              statusFilter === 'urgente'
                ? 'border-red-500/60 bg-red-950/20'
                : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Crítico (&lt; 15 dias)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                {pctUrgentes}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white tabular-nums font-mono">
                {stats.urgentes}
              </span>
              <span className="text-[11px] text-zinc-400">Ação imediata</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Risco iminente de perda para concorrência</p>
          </div>

          {/* Estágio 2: Janela de Negociação */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'proximo' ? 'todos' : 'proximo')}
            className={`p-3 rounded-lg border transition-all cursor-pointer active-press ${
              statusFilter === 'proximo'
                ? 'border-amber-500/60 bg-amber-950/20'
                : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Janela ativa (15-30d)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {pctProximos}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white tabular-nums font-mono">
                {stats.proximos}
              </span>
              <span className="text-[11px] text-zinc-400">Multicálculo</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Momento ideal de envio de proposta</p>
          </div>

          {/* Estágio 3: Vigentes em Dia */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'em_dia' ? 'todos' : 'em_dia')}
            className={`p-3 rounded-lg border transition-all cursor-pointer active-press ${
              statusFilter === 'em_dia'
                ? 'border-emerald-500/60 bg-emerald-950/20'
                : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Garantido (&gt; 30 dias)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {pctEmDia}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white tabular-nums font-mono">
                {stats.emDia}
              </span>
              <span className="text-[11px] text-zinc-400">Em dia</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Cobertura regular sem risco ativo</p>
          </div>

          {/* Estágio 4: Expiradas / Resgate */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'vencido' ? 'todos' : 'vencido')}
            className={`p-3 rounded-lg border transition-all cursor-pointer active-press ${
              statusFilter === 'vencido'
                ? 'border-zinc-600 bg-zinc-800/40'
                : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                Expiradas
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                {pctVencidos}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white tabular-nums font-mono">
                {stats.vencidos}
              </span>
              <span className="text-[11px] text-zinc-400">Resgate</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Recuperação e reativação de segurado</p>
          </div>
        </div>
      </Card>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Filtrar por segurado, seguradora ou apólice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-2 rounded-lg bg-[#090a0f] border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todas as apólices', count: totalCount },
            { id: 'urgente', label: 'Crítico (< 15d)', count: stats.urgentes },
            { id: 'proximo', label: '15-30 dias', count: stats.proximos },
            { id: 'em_dia', label: 'Em dia', count: stats.emDia },
            { id: 'vencido', label: 'Expiradas', count: stats.vencidos },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 active-press ${
                statusFilter === tab.id
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono text-zinc-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Alta Densidade com Badges Hierarquizados */}
      <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs font-medium text-zinc-400">Carregando carteira de apólices...</div>
          </div>
        ) : apolices.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Nenhuma apólice encontrada</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Utilize o botão &quot;Importar planilha&quot; para subir sua base de clientes ou converta leads fechados no painel de Leads.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#090a0f]/60 text-xs font-medium text-zinc-400">
                  <th className="py-3 px-4 sm:px-6">Segurado</th>
                  <th className="py-3 px-4">Seguro & seguradora</th>
                  <th className="py-3 px-4">Vencimento da vigência</th>
                  <th className="py-3 px-4">Último contato</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
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
                    <tr key={apolice.id} className="hover:bg-zinc-800/30 transition-colors group">
                      {/* Cliente */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-100 group-hover:text-blue-400 transition-colors">
                              {apolice.cliente?.nome}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                              {phoneInfo.formatted}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Seguro & Seguradora */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-200">{apolice.tipoSeguro}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5 font-mono">
                          <span className="text-blue-400 font-medium">{apolice.seguradora}</span>
                          {apolice.numeroApolice && <span>• {apolice.numeroApolice}</span>}
                        </div>
                      </td>

                      {/* Vencimento com Badge Hierarquizado */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-200 tabular-nums font-mono">
                          {formatDateBR(apolice.dataVencimento)}
                        </div>
                        <div className="mt-1">
                          {urgency.status === 'urgente' ? (
                            <Badge variant="criticalUrgent" dotColor="bg-red-500">
                              {urgency.label}
                            </Badge>
                          ) : urgency.status === 'proximo' ? (
                            <Badge variant="warningWindow" dotColor="bg-amber-500">
                              {urgency.label}
                            </Badge>
                          ) : urgency.status === 'em_dia' ? (
                            <Badge variant="secured" dotColor="bg-emerald-500">
                              {urgency.label}
                            </Badge>
                          ) : (
                            <Badge variant="expired">
                              {urgency.label}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Último Contato */}
                      <td className="py-3 px-4 text-zinc-400">
                        {lastInteraction ? (
                          <div>
                            <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                              <span>✓</span> Contatado por WhatsApp
                            </span>
                            <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                              {formatDateBR(lastInteraction.createdAt)} por {lastInteraction.user?.nome?.split(' ')[0]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">Sem contato recente</span>
                        )}
                      </td>

                      {/* Ação Imediata */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href="/dashboard/cotacao-cockpit"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors cursor-pointer active-press"
                          title="Recalcular no cockpit"
                        >
                          Cotação
                        </Link>

                        <button
                          onClick={() => setSelectedApolice(apolice)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors cursor-pointer active-press"
                          title="Enviar proposta de renovação via WhatsApp"
                        >
                          WhatsApp
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
