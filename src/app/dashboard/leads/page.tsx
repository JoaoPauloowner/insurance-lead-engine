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
    userName: 'Corretor Sênior',
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
          userName: meData.user?.nome || 'Corretor Sênior',
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
        alert('🎉 Lead convertido com sucesso! A apólice foi inserida no Radar de Renovações.');
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner / Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE INTAKE ACTIVE
            </span>
            <span className="text-xs text-slate-400 font-mono">SLA Médio: 38s</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Esteira de Ingestão de Leads
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Recepção omnicanal com inteligência preditiva, scoring automático por IA e acionamento instantâneo via Voz AI e WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Atualizar lista"
            className="p-2.5 rounded-xl bg-[#0b0f19] border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={handleSimulateLead}
            disabled={simulating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>⚡</span>
            <span>{simulating ? 'Simulando Ingestão...' : 'Simular Lead de Tráfego'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Shopify Polaris + Stripe Dashboard Benchmark) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div
          onClick={() => setPriorityFilter('todos')}
          className={`glass-card-interactive p-4 sm:p-5 rounded-2xl cursor-pointer ${
            priorityFilter === 'todos'
              ? 'ring-2 ring-blue-500/60 bg-blue-950/20'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Leads</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono font-semibold">
              +14.2%
            </span>
          </div>
          <p className="text-3xl font-black text-white mt-2 tabular-nums">{stats.total}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Esteira Omnicanal</span>
            <span className="text-[10px] text-blue-400 font-medium">Ver todos →</span>
          </div>
        </div>

        {/* Hot Leads */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'hot' ? 'todos' : 'hot')}
          className={`glass-card-interactive p-4 sm:p-5 rounded-2xl cursor-pointer ${
            priorityFilter === 'hot'
              ? 'ring-2 ring-rose-500/80 bg-rose-950/20 border-rose-500/50'
              : 'hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              🔥 Hot Leads (80+)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-semibold">
              VOZ AI
            </span>
          </div>
          <p className="text-3xl font-black text-rose-400 mt-2 tabular-nums">{stats.hot}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Acionamento &lt; 45s</span>
            <span className="text-[10px] text-rose-400 font-medium">Prioridade máxima</span>
          </div>
        </div>

        {/* Warm Leads */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'warm' ? 'todos' : 'warm')}
          className={`glass-card-interactive p-4 sm:p-5 rounded-2xl cursor-pointer ${
            priorityFilter === 'warm'
              ? 'ring-2 ring-amber-500/80 bg-amber-950/20 border-amber-500/50'
              : 'hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              ⚡ Warm (50-79)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold">
              WHATSAPP
            </span>
          </div>
          <p className="text-3xl font-black text-amber-300 mt-2 tabular-nums">{stats.warm}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Conversação Ativa</span>
            <span className="text-[10px] text-amber-400 font-medium">Filtrar warm</span>
          </div>
        </div>

        {/* Cold Leads */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'cold' ? 'todos' : 'cold')}
          className={`glass-card-interactive p-4 sm:p-5 rounded-2xl cursor-pointer ${
            priorityFilter === 'cold'
              ? 'ring-2 ring-slate-500/80 bg-slate-900 border-slate-600'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              ❄️ Cold (&lt; 50)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-semibold">
              NUTRIÇÃO
            </span>
          </div>
          <p className="text-3xl font-black text-slate-400 mt-2 tabular-nums">{stats.cold}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Régua de E-mail / SMS</span>
            <span className="text-[10px] text-slate-400 font-medium">Filtrar cold</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Buscar por nome, telefone E.164, veículo ou origem..."
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
            { id: 'todos', label: 'Todos', count: stats.total },
            { id: 'hot', label: '🔥 Hot', count: stats.hot },
            { id: 'warm', label: '⚡ Warm', count: stats.warm },
            { id: 'cold', label: '❄️ Cold', count: stats.cold },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPriorityFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                priorityFilter === tab.id
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
            <div className="text-xs font-semibold text-slate-300">Carregando esteira com IA...</div>
            <div className="text-[11px] text-slate-500 mt-1">Conectando aos canais de recepção</div>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mx-auto mb-3">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-white">Nenhum lead encontrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Nenhum lead corresponde aos filtros atuais. Clique em &quot;Simular Lead de Tráfego&quot; acima para simular uma entrada via Meta/Google Ads.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-black/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Lead & Proponente</th>
                  <th className="py-3.5 px-4">Interesse & Canal</th>
                  <th className="py-3.5 px-4">Scoring & Inteligência IA</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações Imediatas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
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
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setInspectingLead(lead)}
                    >
                      {/* Proponente Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow ${
                              isHot
                                ? 'bg-gradient-to-br from-rose-500 to-orange-600 text-white ring-1 ring-rose-500/40'
                                : isWarm
                                ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {initials}
                          </div>

                          <div>
                            <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                              <span>{lead.nome}</span>
                              {isHot && (
                                <span className="text-[10px] text-rose-400 font-mono" title="Hot Lead">
                                  🔥
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                              <span>📞 {phoneInfo.formatted}</span>
                              {lead.email && <span className="hidden xl:inline text-slate-500">• {lead.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Interesse & Canal */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{lead.ramoDesejado}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span>{lead.origem}</span>
                        </div>
                      </td>

                      {/* Scoring & IA Insights */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border tabular-nums ${
                              isHot
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : isWarm
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            Score: {lead.score}/100
                          </div>

                          <span
                            className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded tracking-wider ${
                              isHot
                                ? 'bg-rose-500/30 text-rose-300'
                                : isWarm
                                ? 'bg-amber-500/30 text-amber-200'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {lead.prioridade}
                          </span>
                        </div>

                        {lead.resumoIa && (
                          <div className="text-[11px] text-slate-300 mt-1 line-clamp-1 leading-snug">
                            {lead.resumoIa}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              lead.status === 'convertido'
                                ? 'bg-blue-400'
                                : lead.status === 'qualificado'
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          <span className="capitalize text-slate-200 font-medium">{lead.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          Canal: {lead.canalAtual || 'Automático'}
                        </div>
                      </td>

                      {/* Ações Imediatas */}
                      <td
                        className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedLeadForCall(lead)}
                          title="Ligar com Agente de Voz (Vapi.ai)"
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                        >
                          📞 Vapi
                        </button>

                        <button
                          onClick={() => setSelectedLeadForWa(lead)}
                          title="Enviar mensagem WhatsApp"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                        >
                          💬 WhatsApp
                        </button>

                        {lead.status !== 'convertido' ? (
                          <button
                            onClick={() => handleConvertLead(lead)}
                            disabled={convertingId === lead.id}
                            title="Converter em Apólice para o Radar de Renovação"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow cursor-pointer disabled:opacity-50"
                          >
                            {convertingId === lead.id ? '...' : '🏆 Converter'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono font-semibold px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                            ✓ Apólice Criada
                          </span>
                        )}

                        <button
                          onClick={() => setInspectingLead(lead)}
                          title="Abrir Painel de Inteligência"
                          className="px-2 py-1.5 rounded-lg bg-[#0b0f19] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-[11px] transition-all cursor-pointer"
                        >
                          👁️
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

      {/* Stripe-Style Slide-Over Drawer for Lead Deep Inspection */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setInspectingLead(null)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xl bg-[#0b0f19] border-l border-white/[0.1] h-full overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col justify-between z-10">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                        inspectingLead.prioridade === 'hot'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : inspectingLead.prioridade === 'warm'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {inspectingLead.prioridade} • Score {inspectingLead.score}/100
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ID: #{inspectingLead.id?.slice(-6)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {inspectingLead.nome}
                  </h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    📞 {normalizePhoneBR(inspectingLead.telefone).formatted}
                    {inspectingLead.email && ` • ${inspectingLead.email}`}
                  </div>
                </div>

                <button
                  onClick={() => setInspectingLead(null)}
                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Intelligence Summary Box */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🧠</span> Análise e Scoring da IA
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Tempo de Resposta: 12s</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {inspectingLead.resumoIa || 'Lead qualificado automaticamente pelo motor de pontuação da corretora.'}
                </p>
                {inspectingLead.urgencia && (
                  <div className="text-[11px] text-blue-400 font-medium">
                    Urgência declarada: <strong className="uppercase">{inspectingLead.urgencia}</strong>
                  </div>
                )}
              </div>

              {/* Interest & Channel Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Ramo Pretendido
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {inspectingLead.ramoDesejado}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Origem do Tráfego
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {inspectingLead.origem}
                  </span>
                </div>
              </div>

              {/* Operational Notes */}
              {inspectingLead.notas && (
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Notas do Proponente / Parâmetros
                  </span>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {inspectingLead.notas}
                  </p>
                </div>
              )}

              {/* Fast Forward Links */}
              <div className="border-t border-white/[0.08] pt-5 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Ações Rápidas de Fechamento
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedLeadForCall(inspectingLead);
                    }}
                    className="p-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🎙️</span>
                    <span>Disparar Ligação IA</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLeadForWa(inspectingLead);
                    }}
                    className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>💬</span>
                    <span>Abrir WhatsApp</span>
                  </button>
                </div>

                <Link
                  href="/dashboard/cotacao-cockpit"
                  className="w-full p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer block text-center"
                >
                  <span>📈</span>
                  <span>Abrir Cockpit de Cotação Multi-Seguradora</span>
                </Link>

                {inspectingLead.status !== 'convertido' && (
                  <button
                    onClick={() => handleConvertLead(inspectingLead)}
                    disabled={convertingId === inspectingLead.id}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>🏆</span>
                    <span>Converter em Apólice (Salvar no Radar de Renovações)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-white/[0.08] pt-4 mt-6 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Insurance Lead Engine • Underwriting & Speed-to-Lead Suite
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

