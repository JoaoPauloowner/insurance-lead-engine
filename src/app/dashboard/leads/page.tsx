'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { normalizePhoneBR } from '@/lib/phone';
import WhatsAppModal from '@/components/WhatsAppModal';
import VapiCallModal from '@/components/VapiCallModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('todos');

  const [selectedLeadForWa, setSelectedLeadForWa] = useState<any | null>(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<any | null>(null);
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
        notas: 'Seguro atual vence em 5 dias na Tokio Marine. Desejo proposta urgente.',
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Leads em Tempo Real</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recepção de tráfego pago com Speed-to-Lead, IA de Voz e WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateLead}
            disabled={simulating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>⚡</span>
            <span>{simulating ? 'Simulando...' : 'Simular Lead de Anúncio'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setPriorityFilter('todos')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            priorityFilter === 'todos'
              ? 'bg-blue-600/15 border-blue-500/50 shadow-lg'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total de Leads</span>
            <span className="text-lg">📥</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400">Recebidos via Webhook</span>
        </div>

        <div
          onClick={() => setPriorityFilter(priorityFilter === 'hot' ? 'todos' : 'hot')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            priorityFilter === 'hot'
              ? 'bg-rose-500/15 border-rose-500/50 shadow-lg'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">🔥 Hot Leads (80+)</span>
            <span className="text-lg">🚨</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.hot}</p>
          <span className="text-[11px] text-slate-400">Ligação Vapi recomendada</span>
        </div>

        <div
          onClick={() => setPriorityFilter(priorityFilter === 'warm' ? 'todos' : 'warm')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            priorityFilter === 'warm'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-lg'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">⚡ Warm (50-79)</span>
            <span className="text-lg">💬</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.warm}</p>
          <span className="text-[11px] text-slate-400">WhatsApp Conversacional</span>
        </div>

        <div
          onClick={() => setPriorityFilter(priorityFilter === 'cold' ? 'todos' : 'cold')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            priorityFilter === 'cold'
              ? 'bg-zinc-800 border-zinc-600 shadow-lg'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">❄️ Cold (&lt; 50)</span>
            <span className="text-lg">📩</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.cold}</p>
          <span className="text-[11px] text-slate-400">Régua de SMS</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar por nome, telefone, ramo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <span className="absolute left-3 top-2 text-slate-500 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'hot', label: '🔥 Hot' },
            { id: 'warm', label: '⚡ Warm' },
            { id: 'cold', label: '❄️ Cold' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPriorityFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                priorityFilter === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Carregando leads da esteira...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-sm font-semibold text-slate-200">Nenhum lead encontrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Clique em &quot;Simular Lead de Anúncio&quot; no topo da página para testar a chegada de um lead com IA.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Lead / Contato</th>
                  <th className="py-3.5 px-4">Ramo & Origem</th>
                  <th className="py-3.5 px-4">Score & Análise IA</th>
                  <th className="py-3.5 px-4">Status & Canal</th>
                  <th className="py-3.5 px-4 text-right">Ações Imediatas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leads.map((lead) => {
                  const phoneInfo = normalizePhoneBR(lead.telefone);
                  const isHot = lead.prioridade === 'hot';
                  const isWarm = lead.prioridade === 'warm';

                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-100 group-hover:text-blue-300">
                          {lead.nome}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>📞 {phoneInfo.formatted}</span>
                          {lead.email && <span className="hidden sm:inline">• {lead.email}</span>}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-200">{lead.ramoDesejado}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{lead.origem}</div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                              isHot
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : isWarm
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            Score: {lead.score}/100
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {lead.prioridade}
                          </span>
                        </div>
                        {lead.resumoIa && (
                          <div className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {lead.resumoIa}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
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
                          <span className="capitalize text-slate-200">{lead.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Canal: {lead.canalAtual || 'Nenhum'}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedLeadForCall(lead)}
                          title="Ligar com Agente de Voz (Vapi.ai)"
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          📞 Ligar Vapi
                        </button>

                        <button
                          onClick={() => setSelectedLeadForWa(lead)}
                          title="Abrir WhatsApp com o Lead"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          💬 WhatsApp
                        </button>

                        {lead.status !== 'convertido' && (
                          <button
                            onClick={() => handleConvertLead(lead)}
                            disabled={convertingId === lead.id}
                            title="Converter em Apólice para o Radar de Renovação"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow cursor-pointer disabled:opacity-50"
                          >
                            {convertingId === lead.id ? '...' : '🏆 Converter'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
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

      <VapiCallModal
        isOpen={!!selectedLeadForCall}
        onClose={() => setSelectedLeadForCall(null)}
        lead={selectedLeadForCall}
        onSuccess={fetchData}
      />
    </div>
  );
}
