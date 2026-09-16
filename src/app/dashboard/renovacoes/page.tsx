'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDateBR, calculateUrgency } from '@/lib/date';
import { normalizePhoneBR } from '@/lib/phone';
import WhatsAppModal from '@/components/WhatsAppModal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RenovacoesPage() {
  const [apolices, setApolices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedApolice, setSelectedApolice] = useState<any | null>(null);
  const [userOrg, setUserOrg] = useState<{ userName: string; orgName: string }>({
    userName: 'Carlos Silva',
    orgName: 'Valor Corretora de Seguros',
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
          userName: meData.user?.nome || 'Carlos Silva',
          orgName: meData.organization?.nome || 'Valor Corretora de Seguros',
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
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Header Operacional Sóbrio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[var(--purple)] border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-[var(--purple)]" />
              Radar Ativo de Carteira
            </span>
            <span className="text-xs text-[var(--text-mute)]">Taxa de retenção média: 92%</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            Radar de Renovações de Apólices
          </h1>
          <p className="text-sm text-[var(--text-mute)] mt-0.5">
            Acompanhe o vencimento de vigência dos clientes da corretora e previna cancelamentos com acionamento antecipado.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/importar">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] text-xs font-medium"
            >
              <svg className="w-4 h-4 mr-1.5 text-[var(--text-mute)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Importar Planilha</span>
            </Button>
          </Link>

          <Button
            onClick={fetchData}
            title="Atualizar lista"
            variant="outline"
            size="sm"
            className="h-9 px-2.5 bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>

      {/* DISPOSITIVO ESTRUTURAL: Timeline / Régua de Decaimento Temporal */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
              <span>Distribuição Temporal da Carteira</span>
              <span className="text-xs text-[var(--text-mute)] font-normal">
                ({totalCount} apólices monitoradas)
              </span>
            </h2>
            <p className="text-xs text-[var(--text-mute)] mt-0.5">
              Segmentação por proximidade de vencimento e janela ideal de cálculo.
            </p>
          </div>
          {statusFilter !== 'todos' && (
            <button
              onClick={() => setStatusFilter('todos')}
              className="text-xs text-[var(--purple)] hover:underline transition-colors self-start sm:self-auto cursor-pointer font-medium"
            >
              Exibir todas as apólices
            </button>
          )}
        </div>

        {/* Barra Proporcional de Decaimento Temporal */}
        <div className="mt-4 mb-4">
          <div className="w-full h-2.5 rounded-full bg-[var(--border)] overflow-hidden flex">
            {totalCount > 0 ? (
              <>
                <div
                  style={{ width: `${pctUrgentes}%` }}
                  className="bg-rose-500 transition-all duration-300"
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
                  className="bg-slate-400 transition-all duration-300"
                  title={`Expiradas: ${stats.vencidos} (${pctVencidos}%)`}
                />
              </>
            ) : (
              <div className="w-full bg-[var(--border)]" />
            )}
          </div>
        </div>

        {/* Etapas Integradas da Régua Temporal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Estágio 1: Urgência Crítica */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'urgente' ? 'todos' : 'urgente')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'urgente'
                ? 'border-rose-400 bg-rose-50 shadow-xs'
                : 'border-[var(--border)] bg-[#fbf9f9] hover:bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Crítico (&lt; 15 dias)
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                {pctUrgentes}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text)] tabular-nums font-mono">
                {stats.urgentes}
              </span>
              <span className="text-xs text-rose-700 font-medium">Ação Imediata</span>
            </div>
            <p className="text-[11px] text-[var(--text-mute)] mt-1">Risco iminente de perda para concorrência</p>
          </div>

          {/* Estágio 2: Janela de Negociação */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'proximo' ? 'todos' : 'proximo')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'proximo'
                ? 'border-amber-400 bg-amber-50 shadow-xs'
                : 'border-[var(--border)] bg-[#fbf9f9] hover:bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Janela Ideal (15-30d)
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                {pctProximos}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text)] tabular-nums font-mono">
                {stats.proximos}
              </span>
              <span className="text-xs text-amber-800 font-medium">Enviar Cotação</span>
            </div>
            <p className="text-[11px] text-[var(--text-mute)] mt-1">Momento ideal para envio da renovação</p>
          </div>

          {/* Estágio 3: Vigentes em Dia */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'em_dia' ? 'todos' : 'em_dia')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'em_dia'
                ? 'border-emerald-400 bg-emerald-50 shadow-xs'
                : 'border-[var(--border)] bg-[#fbf9f9] hover:bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Vigência Regular (&gt; 30d)
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                {pctEmDia}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text)] tabular-nums font-mono">
                {stats.emDia}
              </span>
              <span className="text-xs text-emerald-800 font-medium">Em Dia</span>
            </div>
            <p className="text-[11px] text-[var(--text-mute)] mt-1">Cobertura regular sem risco no curto prazo</p>
          </div>

          {/* Estágio 4: Expiradas / Resgate */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'vencido' ? 'todos' : 'vencido')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'vencido'
                ? 'border-slate-400 bg-slate-100 shadow-xs'
                : 'border-[var(--border)] bg-[#fbf9f9] hover:bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Vencidas / Resgate
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                {pctVencidos}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text)] tabular-nums font-mono">
                {stats.vencidos}
              </span>
              <span className="text-xs text-slate-600 font-medium">Recuperar</span>
            </div>
            <p className="text-[11px] text-[var(--text-mute)] mt-1">Reativação e recuperação de segurado</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Filtrar por segurado, seguradora ou apólice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[#737782] focus:bg-[var(--surface-2)] focus:border-[#275ba5] focus:outline-none transition-colors"
          />
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-faint)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-[var(--text-faint)] hover:text-[var(--text)] text-xs cursor-pointer"
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
            { id: 'vencido', label: 'Vencidas', count: stats.vencidos },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[var(--purple)] text-white shadow-sm'
                  : 'text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                statusFilter === tab.id ? 'bg-[var(--surface-2)]/20 text-white' : 'bg-[var(--border)] text-[var(--text-mute)]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Apólices */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-7 h-7 border-2 border-[#275ba5] border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
            <div className="text-xs font-medium text-[var(--text-mute)]">Carregando carteira de apólices...</div>
          </div>
        ) : apolices.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-mute)] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">Nenhuma apólice encontrada</h3>
            <p className="text-xs text-[var(--text-mute)] mt-1 max-w-sm mx-auto">
              Utilize o botão &quot;Importar Planilha&quot; para subir sua base de clientes ou converta leads fechados no painel de Leads.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--text-mute)] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Segurado</th>
                  <th className="py-3 px-4">Seguro & Seguradora</th>
                  <th className="py-3 px-4">Vencimento da Vigência</th>
                  <th className="py-3 px-4">Último Contato</th>
                  <th className="py-3 px-4 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e8e7]">
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
                    <tr key={apolice.id} className="hover:bg-[var(--surface)] transition-colors group">
                      {/* Cliente */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[var(--purple)] flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text)] group-hover:text-[var(--purple)] transition-colors">
                              {apolice.cliente?.nome}
                            </div>
                            <div className="text-xs text-[var(--text-mute)] mt-0.5 font-mono">
                              {phoneInfo.formatted}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Seguro & Seguradora */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[var(--text)]">{apolice.tipoSeguro}</div>
                        <div className="text-xs text-[var(--text-mute)] mt-0.5 flex items-center gap-1.5 font-mono">
                          <span className="text-[var(--purple)] font-semibold">{apolice.seguradora}</span>
                          {apolice.numeroApolice && <span>• {apolice.numeroApolice}</span>}
                        </div>
                      </td>

                      {/* Vencimento */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[var(--text)] tabular-nums font-mono">
                          {formatDateBR(apolice.dataVencimento)}
                        </div>
                        <div className="mt-1">
                          {urgency.status === 'urgente' ? (
                            <Badge variant="criticalUrgent">
                              {urgency.label}
                            </Badge>
                          ) : urgency.status === 'proximo' ? (
                            <Badge variant="warningWindow">
                              {urgency.label}
                            </Badge>
                          ) : urgency.status === 'em_dia' ? (
                            <Badge variant="secured">
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
                      <td className="py-3.5 px-4 text-[var(--text-mute)]">
                        {lastInteraction ? (
                          <div>
                            <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                              <span>✓</span> Contatado por WhatsApp
                            </span>
                            <div className="text-[11px] text-[var(--text-faint)] mt-0.5 font-mono">
                              {formatDateBR(lastInteraction.createdAt)} por {lastInteraction.user?.nome?.split(' ')[0]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-faint)] italic">Sem contato recente</span>
                        )}
                      </td>

                      {/* Ação Imediata */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href="/dashboard/cotacao-cockpit"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-xs font-medium transition-colors cursor-pointer"
                          title="Recalcular no cockpit"
                        >
                          Cotação
                        </Link>

                        <button
                          onClick={() => setSelectedApolice(apolice)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
                          title="Enviar proposta de renovação via WhatsApp"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
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
