'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { normalizePhoneBR } from '@/lib/phone';
import WhatsAppModal from '@/components/WhatsAppModal';
import VapiCallModal from '@/components/VapiCallModal';
import Link from 'next/link';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('todos');

  // Modais & Drawer states
  const [selectedLeadForWa, setSelectedLeadForWa] = useState<any | null>(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<any | null>(null);
  const [inspectingLead, setInspectingLead] = useState<any | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const [userOrg, setUserOrg] = useState<{ userName: string; orgName: string }>({
    userName: 'Corretor Responsável',
    orgName: 'Prime Corretora',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (priorityFilter !== 'todos') queryParams.set('priority', priorityFilter);

      const [leadsRes, templatesRes, meRes] = await Promise.all([
        fetch(`/api/leads?${queryParams.toString()}`),
        fetch('/api/templates'),
        fetch('/api/auth/me'),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }

      if (templatesRes.ok) {
        const tplData = await templatesRes.json();
        setTemplates(tplData.templates || []);
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        setUserOrg({
          userName: meData.user?.nome || 'Corretor Responsável',
          orgName: meData.organization?.nome || 'Prime Corretora',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSimulateLead = async () => {
    setSimulating(true);
    try {
      const mockLead = {
        nome: 'Fernando Silveira ' + Math.floor(Math.random() * 1000),
        telefone: '11987' + Math.floor(100000 + Math.random() * 900000),
        email: 'fernando.novo@email.com',
        origem: 'Meta Lead Ads (Instagram)',
        ramoDesejado: 'Seguro Auto Premium (Audi Q5)',
        urgencia: 'alta',
        notas: 'Seguro atual vence em 5 dias na Tokio Marine. Desejo proposta com franquia reduzida e carro reserva.',
      };

      const res = await fetch('/api/leads/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockLead),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleConvertLead = async (lead: any) => {
    if (!confirm(`Deseja converter ${lead.nome} em cliente e criar a apólice no Radar de Renovações?`)) {
      return;
    }

    setConvertingId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seguradora: 'Porto Seguro',
          numeroApolice: `APO-${Date.now().toString().slice(-6)}`,
        }),
      });

      if (res.ok) {
        fetchData();
        if (inspectingLead?.id === lead.id) {
          setInspectingLead(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConvertingId(null);
    }
  };

  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.prioridade === 'hot').length,
    warm: leads.filter((l) => l.prioridade === 'warm').length,
    cold: leads.filter((l) => l.prioridade === 'cold').length,
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Recepção em Tempo Real
            </span>
            <span className="text-xs text-zinc-400">Tempo de resposta: &lt; 45s</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Esteira de Ingestão de Leads
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">
            Entrada omnicanal com pontuação preditiva, qualificação técnica e integração direta com canais de atendimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            title="Atualizar lista"
            className="p-2 rounded-lg bg-[#10121a] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer active-press"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={handleSimulateLead}
            disabled={simulating}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 active-press"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{simulating ? 'Simulando...' : 'Simular Entrada de Lead'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Leads */}
        <div
          onClick={() => setPriorityFilter('todos')}
          className={`surface-card-hover p-4 rounded-xl cursor-pointer active-press ${
            priorityFilter === 'todos'
              ? 'border-blue-500/60 bg-blue-950/10'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Recebido</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
              Geral
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{stats.total}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Esteira unificada</p>
        </div>

        {/* Hot Leads */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'hot' ? 'todos' : 'hot')}
          className={`surface-card-hover p-4 rounded-xl cursor-pointer active-press ${
            priorityFilter === 'hot'
              ? 'border-rose-500/60 bg-rose-950/10'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Alta Prioridade (80+)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-medium">
              Voz AI
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{stats.hot}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Contato prioritário</p>
        </div>

        {/* Warm Leads */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'warm' ? 'todos' : 'warm')}
          className={`surface-card-hover p-4 rounded-xl cursor-pointer active-press ${
            priorityFilter === 'warm'
              ? 'border-amber-500/60 bg-amber-950/10'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Média Prioridade (50-79)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
              WhatsApp
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{stats.warm}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Fluxo conversacional</p>
        </div>

        {/* Cold Leads */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'cold' ? 'todos' : 'cold')}
          className={`surface-card-hover p-4 rounded-xl cursor-pointer active-press ${
            priorityFilter === 'cold'
              ? 'border-zinc-500/60 bg-zinc-900/30'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              Baixa Prioridade (&lt; 50)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
              Nutrição
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{stats.cold}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Régua automatizada</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Filtrar por nome, telefone, veículo ou origem..."
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
            { id: 'todos', label: 'Todos', count: stats.total },
            { id: 'hot', label: 'Alta prioridade', count: stats.hot },
            { id: 'warm', label: 'Média prioridade', count: stats.warm },
            { id: 'cold', label: 'Nutrição', count: stats.cold },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPriorityFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 active-press ${
                priorityFilter === tab.id
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

      {/* Tabular Display */}
      <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs font-medium text-zinc-400">Carregando dados da esteira...</div>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Nenhum lead encontrado</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Nenhum registro coincide com o filtro atual. Utilize o botão acima para simular a entrada de um novo lead.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#090a0f]/60 text-xs font-medium text-zinc-400">
                  <th className="py-3 px-4 sm:px-6">Proponente</th>
                  <th className="py-3 px-4">Interesse & Canal</th>
                  <th className="py-3 px-4">Pontuação & Diagnóstico</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {leads.map((lead) => {
                  const phoneInfo = normalizePhoneBR(lead.telefone);
                  const isHot = lead.prioridade === 'hot';
                  const isWarm = lead.prioridade === 'warm';

                  const initials = lead.nome
                    .split(' ')
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                      onClick={() => setInspectingLead(lead)}
                    >
                      {/* Proponente */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-200 text-xs shrink-0">
                            {initials}
                          </div>

                          <div>
                            <div className="font-medium text-zinc-100 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                              <span>{lead.nome}</span>
                              {isHot && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" title="Alta prioridade" />
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5 font-mono">
                              <span>{phoneInfo.formatted}</span>
                              {lead.email && <span className="hidden xl:inline text-zinc-500">• {lead.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Interesse & Origem */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-200">{lead.ramoDesejado}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-zinc-500" />
                          <span>{lead.origem}</span>
                        </div>
                      </td>

                      {/* Pontuação */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 rounded text-[11px] font-mono font-medium border border-zinc-700 bg-zinc-800 text-zinc-200 tabular-nums">
                            {lead.score}/100
                          </div>

                          {isHot ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Alta
                            </span>
                          ) : isWarm ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Média
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                              Nutrição
                            </span>
                          )}
                        </div>

                        {lead.resumoIa && (
                          <div className="text-[11px] text-zinc-400 mt-1 line-clamp-1 leading-snug">
                            {lead.resumoIa}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lead.status === 'convertido'
                                ? 'bg-blue-400'
                                : lead.status === 'qualificado'
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          <span className="capitalize text-zinc-300">{lead.status}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {lead.canalAtual || 'Automático'}
                        </div>
                      </td>

                      {/* Ações */}
                      <td
                        className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedLeadForCall(lead)}
                          title="Iniciar chamada assistida por IA"
                          className="px-2.5 py-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium transition-colors cursor-pointer active-press"
                        >
                          Chamada Voz
                        </button>

                        <button
                          onClick={() => setSelectedLeadForWa(lead)}
                          title="Enviar mensagem WhatsApp"
                          className="px-2.5 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors cursor-pointer active-press"
                        >
                          WhatsApp
                        </button>

                        {lead.status !== 'convertido' ? (
                          <button
                            onClick={() => handleConvertLead(lead)}
                            disabled={convertingId === lead.id}
                            title="Converter em apólice de renovação"
                            className="px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 active-press"
                          >
                            {convertingId === lead.id ? 'Convertendo...' : 'Converter'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                            Apólice Criada
                          </span>
                        )}

                        <button
                          onClick={() => setInspectingLead(lead)}
                          title="Detalhes do Lead"
                          className="p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs transition-colors cursor-pointer active-press inline-flex items-center justify-center align-middle"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
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

      {/* Drawer for Lead Deep Inspection */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setInspectingLead(null)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-lg bg-[#10121a] border-l border-zinc-800 h-full overflow-y-auto shadow-2xl p-6 sm:p-7 flex flex-col justify-between z-10 spring-drawer">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-400">
                      Score: <strong className="text-white font-mono">{inspectingLead.score}/100</strong>
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Ref #{inspectingLead.id?.slice(-6)}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {inspectingLead.nome}
                  </h2>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    {normalizePhoneBR(inspectingLead.telefone).formatted}
                    {inspectingLead.email && ` • ${inspectingLead.email}`}
                  </div>
                </div>

                <button
                  onClick={() => setInspectingLead(null)}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer active-press"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Intelligence Summary Box */}
              <div className="p-4 rounded-lg bg-[#090a0f] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    Diagnóstico da Análise Técnica
                  </span>
                  <span className="text-[11px] text-zinc-500">Qualificação automática</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {inspectingLead.resumoIa || 'Lead qualificado com sucesso pelos parâmetros da corretora.'}
                </p>
                {inspectingLead.urgencia && (
                  <div className="text-xs text-blue-400 font-medium pt-1">
                    Nível de urgência informado: <span className="capitalize">{inspectingLead.urgencia}</span>
                  </div>
                )}
              </div>

              {/* Interest & Channel Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-500 block mb-1">
                    Ramo Pretendido
                  </span>
                  <span className="text-xs font-semibold text-zinc-200">
                    {inspectingLead.ramoDesejado}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-500 block mb-1">
                    Origem da Ingestão
                  </span>
                  <span className="text-xs font-semibold text-zinc-200">
                    {inspectingLead.origem}
                  </span>
                </div>
              </div>

              {/* Operational Notes */}
              {inspectingLead.notas && (
                <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-500 block mb-1">
                    Histórico & Parâmetros do Proponente
                  </span>
                  <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {inspectingLead.notas}
                  </p>
                </div>
              )}

              {/* Fast Forward Links */}
              <div className="border-t border-zinc-800 pt-4 space-y-2.5">
                <span className="text-xs font-medium text-zinc-400 block">
                  Ações Operacionais
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedLeadForCall(inspectingLead)}
                    className="p-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer active-press"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Ligar com IA</span>
                  </button>

                  <button
                    onClick={() => setSelectedLeadForWa(inspectingLead)}
                    className="p-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer active-press"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                </div>

                <Link
                  href="/dashboard/cotacao-cockpit"
                  className="w-full p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer block text-center active-press"
                >
                  <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Abrir Cockpit de Cotação</span>
                </Link>

                {inspectingLead.status !== 'convertido' && (
                  <button
                    onClick={() => handleConvertLead(inspectingLead)}
                    disabled={convertingId === inspectingLead.id}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active-press"
                  >
                    <span>Converter em Apólice no Radar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-zinc-800 pt-4 mt-6 text-center">
              <span className="text-[11px] text-zinc-500">
                Operação Segura • {userOrg.orgName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={!!selectedLeadForWa}
        onClose={() => setSelectedLeadForWa(null)}
        targetData={selectedLeadForWa}
        isLead={true}
        templates={templates}
        brokerName={userOrg.userName}
        brokerOrgName={userOrg.orgName}
        onSuccess={fetchData}
      />

      {/* Vapi Call Modal */}
      <VapiCallModal
        isOpen={!!selectedLeadForCall}
        onClose={() => setSelectedLeadForCall(null)}
        lead={selectedLeadForCall}
        onSuccess={fetchData}
      />
    </div>
  );
}
