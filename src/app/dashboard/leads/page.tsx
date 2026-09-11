'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { normalizePhoneBR } from '@/lib/phone';
import WhatsAppModal from '@/components/WhatsAppModal';
import VapiCallModal from '@/components/VapiCallModal';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LeadItem {
  id: string;
  nome: string;
  empresa?: string | null;
  telefone: string;
  email?: string | null;
  origem: string;
  ramoDesejado: string;
  lob?: string | null;
  premioEstimado?: number;
  carrierAppetite?: number;
  targetCarrier?: string | null;
  riskTags?: string | null;
  score: number;
  prioridade: string;
  status: string;
  canalAtual?: string | null;
  slaExpiresAt?: string | null;
  resumoIa?: string | null;
  dadosColetados?: string | null;
  notas?: string | null;
  urgencia?: string | null;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('todos');
  const [lobFilter, setLobFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'sla' | 'score' | 'premium'>('sla');

  // Seleção e Ações em Lote (PRD 5.2 Sticky Batch Processing)
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  // Modais & Drawer states
  const [selectedLeadForWa, setSelectedLeadForWa] = useState<any | null>(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<any | null>(null);
  const [inspectingLead, setInspectingLead] = useState<any | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Timer tick for dynamic countdown
  const [nowTime, setNowTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [userOrg, setUserOrg] = useState<{ userName: string; orgName: string }>({
    userName: 'Sarah Vance',
    orgName: 'Prime Corretora & Syndicate',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (priorityFilter !== 'todos') queryParams.set('priority', priorityFilter);
      if (lobFilter !== 'all') queryParams.set('lob', lobFilter);

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
          userName: meData.user?.nome || 'Sarah Vance',
          orgName: meData.organization?.nome || 'Prime Corretora & Syndicate',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, priorityFilter, lobFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtragem e Ordenação no Frontend
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        if (premiumFilter === '25k') return (lead.premioEstimado || 0) >= 25000;
        if (premiumFilter === '50k') return (lead.premioEstimado || 0) >= 50000;
        if (premiumFilter === '100k') return (lead.premioEstimado || 0) >= 100000;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'premium') return (b.premioEstimado || 0) - (a.premioEstimado || 0);
        // Default: SLA critical countdown
        const timeA = a.slaExpiresAt ? new Date(a.slaExpiresAt).getTime() : new Date(a.createdAt).getTime() + 5 * 60 * 1000;
        const timeB = b.slaExpiresAt ? new Date(b.slaExpiresAt).getTime() : new Date(b.createdAt).getTime() + 5 * 60 * 1000;
        return timeA - timeB;
      });
  }, [leads, premiumFilter, sortBy]);

  // Total Premium de Leads Selecionados
  const totalSelectedPremium = useMemo(() => {
    return leads
      .filter((l) => selectedLeadIds.includes(l.id))
      .reduce((acc, curr) => acc + (curr.premioEstimado || 45000), 0);
  }, [leads, selectedLeadIds]);

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Exportar CSV Binder (PRD 5.2)
  const handleExportCsvBinder = () => {
    const selected = leads.filter((l) => selectedLeadIds.includes(l.id));
    if (selected.length === 0) return;

    const headers = ['ID', 'Empresa', 'Contato', 'Telefone', 'Email', 'LOB', 'PremioEstimado', 'TargetCarrier', 'AppetiteScore', 'IntentScore', 'RiskTags', 'Status'];
    const rows = selected.map((l) => [
      l.id,
      `"${l.empresa || l.nome}"`,
      `"${l.nome}"`,
      l.telefone,
      l.email || '',
      l.lob || l.ramoDesejado,
      l.premioEstimado || 0,
      l.targetCarrier || 'Chubb',
      l.carrierAppetite || 90,
      l.score,
      `"${l.riskTags || ''}"`,
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadEngine_Binder_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBatchNotice(`Exportados ${selected.length} leads corporativos para o CSV Binder.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleBulkFastRoute = () => {
    setBatchNotice(`⚡ ${selectedLeadIds.length} leads despachados em lote para a mesa sênior de subscrição.`);
    setSelectedLeadIds([]);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleSimulateLead = async () => {
    setSimulating(true);
    try {
      const mockLead = {
        nome: 'Fernando Silveira ' + Math.floor(Math.random() * 1000),
        empresa: 'LogTech Transportes SA',
        telefone: '11987' + Math.floor(100000 + Math.random() * 900000),
        email: 'fernando.novo@logtech.com.br',
        origem: 'Meta Lead Ads (Instagram)',
        ramoDesejado: 'Fleet Auto',
        lob: 'Fleet Auto',
        premioEstimado: 89000,
        carrierAppetite: 92,
        targetCarrier: 'Progressive',
        riskTags: JSON.stringify(['DOT Tier A', 'FIPE Matched']),
        urgencia: 'alta',
        notas: 'Frota de 25 caminhões pesados. Seguro vence em 6 dias.',
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
    if (!confirm(`Deseja converter ${lead.empresa || lead.nome} em cliente e criar a apólice no Radar de Renovações?`)) {
      return;
    }

    setConvertingId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seguradora: lead.targetCarrier || 'Chubb',
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
    hot: leads.filter((l) => l.score >= 90).length,
    fleet: leads.filter((l) => l.lob === 'Fleet Auto' || l.ramoDesejado?.includes('Auto')).length,
    cyber: leads.filter((l) => l.lob === 'Cyber & Tech').length,
    inland: leads.filter((l) => l.lob === 'Inland Marine').length,
    gl: leads.filter((l) => l.lob === 'General Liability').length,
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-24">
      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Dynamic Triage Engine Active
            </span>
            <span className="text-xs text-zinc-400 font-mono">SLA Sub-5m Mandate (&lt; 300s)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Fila de Triagem & Underwriting Queue
            <span className="text-xs font-mono font-normal px-2 py-0.5 bg-blue-950/80 text-blue-300 border border-blue-500/30 rounded">
              SCREEN_12
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">
            Priorização por propensão de bind, validação de compliance de risco (DOT, EIN, SOC-2, FIPE) e distribuição com 1-toque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="h-9 text-xs border-zinc-800 bg-[#10121a] text-zinc-300 hover:text-white">
              <svg className="w-3.5 h-3.5 mr-1.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Cockpit Executivo
            </Button>
          </Link>

          <Button
            onClick={fetchData}
            title="Atualizar lista"
            variant="outline"
            size="sm"
            className="h-9 px-2.5 bg-[#10121a] border-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>

          <Button
            onClick={handleSimulateLead}
            disabled={simulating}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{simulating ? 'Ingerindo...' : '+ Simular Inbound Webhook'}</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Operação em Lote */}
      {batchNotice && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-lg flex items-center justify-between text-xs text-blue-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>{batchNotice}</span>
          </div>
          <button onClick={() => setBatchNotice(null)} className="text-blue-400/60 hover:text-blue-200">
            ✕
          </button>
        </div>
      )}

      {/* 5.2 Multi-Level Filters: Segment Pills por LOB e Intent */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `Todos os Leads (${stats.total})`, icon: null },
          { id: 'hot_pill', label: `🔥 90%+ Intent (${stats.hot})`, icon: null, isHot: true },
          { id: 'Fleet Auto', label: `Fleet Auto (${stats.fleet})`, icon: '🚛' },
          { id: 'Cyber & Tech', label: `Cyber & Tech (${stats.cyber})`, icon: '🛡️' },
          { id: 'Inland Marine', label: `Inland Marine (${stats.inland})`, icon: '📦' },
          { id: 'General Liability', label: `General Liability (${stats.gl})`, icon: '🏭' },
        ].map((pill) => {
          const isActive =
            pill.id === 'hot_pill'
              ? priorityFilter === 'hot'
              : lobFilter === pill.id && priorityFilter === 'todos';

          return (
            <button
              key={pill.id}
              onClick={() => {
                if (pill.id === 'hot_pill') {
                  setPriorityFilter('hot');
                  setLobFilter('all');
                } else {
                  setPriorityFilter('todos');
                  setLobFilter(pill.id);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? pill.isHot
                    ? 'bg-red-950 border border-red-500/50 text-red-200 shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#10121a] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {pill.icon && <span>{pill.icon}</span>}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Barra Secundária de Busca, Faixa de Prêmio e Ordenação */}
      <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Busca */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar empresa, contato, DOT, EIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-2 rounded-lg bg-[#090a0f] border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
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

        {/* Filtros Secundários */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0 text-xs">
          {/* Faixa de Prêmio */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px]">Prêmio:</span>
            <select
              value={premiumFilter}
              onChange={(e) => setPremiumFilter(e.target.value)}
              className="bg-[#090a0f] border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-zinc-700"
            >
              <option value="all">Qualquer valor</option>
              <option value="25k">&gt; $25,000 / ano</option>
              <option value="50k">&gt; $50,000 / ano</option>
              <option value="100k">&gt; $100,000 / ano</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px]">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#090a0f] border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-zinc-700"
            >
              <option value="sla">SLA Crítico (&lt; 5m)</option>
              <option value="score">Maior Score (90%+)</option>
              <option value="premium">Maior Prêmio ($$)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Leads com Risk Tags e SLA Countdown */}
      <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs font-medium text-zinc-400">Carregando fila de triagem...</div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Nenhum lead corporativo encontrado</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Ajuste os filtros de LOB ou prêmio ou simule um novo webhook de entrada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#090a0f]/80 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                      onChange={toggleSelectAll}
                      className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Insured / Razão Social</th>
                  <th className="py-3 px-4">Ramo (LOB) & Compliance</th>
                  <th className="py-3 px-4">SLA Speed-to-Lead</th>
                  <th className="py-3 px-4">Prêmio Estimado</th>
                  <th className="py-3 px-4">Apetite Seguradora</th>
                  <th className="py-3 px-4 text-right">Ações Imediatas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const isHot = lead.score >= 90;

                  // Parse tags de risco
                  let parsedTags: string[] = [];
                  if (lead.riskTags) {
                    try {
                      parsedTags = JSON.parse(lead.riskTags);
                    } catch {
                      parsedTags = [lead.riskTags];
                    }
                  }

                  // Cálculo do SLA restante
                  const slaExpiry = lead.slaExpiresAt
                    ? new Date(lead.slaExpiresAt).getTime()
                    : new Date(lead.createdAt).getTime() + 5 * 60 * 1000;
                  const msRemaining = slaExpiry - nowTime;
                  const secondsRemaining = Math.max(0, Math.floor(msRemaining / 1000));
                  const minutes = Math.floor(secondsRemaining / 60);
                  const seconds = secondsRemaining % 60;
                  const isCritical = secondsRemaining < 60;
                  const isExpired = secondsRemaining === 0;

                  const formattedPremium = lead.premioEstimado
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.premioEstimado)
                    : '$45,000';

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-zinc-800/30 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-blue-950/20' : ''
                      }`}
                      onClick={() => setInspectingLead(lead)}
                    >
                      {/* Checkbox de Seleção */}
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectLead(lead.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>

                      {/* Insured / Empresa & Contato */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          <span>{lead.empresa || lead.nome}</span>
                          {isHot && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" title="🔥 Hot Intent" />
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5 font-mono">
                          <span>{lead.nome}</span>
                          <span>•</span>
                          <span>{normalizePhoneBR(lead.telefone).formatted}</span>
                        </div>
                      </td>

                      {/* LOB & Risk Compliance Tags */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-200">{lead.lob || lead.ramoDesejado}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedTags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* SLA Speed-to-Lead Countdown */}
                      <td className="py-3 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800">
                            SLA Ultrapassado
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40 font-bold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} restante!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                            <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                          </span>
                        )}
                      </td>

                      {/* Prêmio Estimado */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-white tracking-tight">{formattedPremium}</div>
                        <span className="text-[10px] text-zinc-500 font-sans">anual</span>
                      </td>

                      {/* Apetite Seguradora */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-zinc-200">
                            {lead.targetCarrier || 'Chubb'}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold">
                            {lead.carrierAppetite || 90}% Match
                          </span>
                        </div>
                        <div className="w-20 bg-zinc-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${lead.carrierAppetite || 90}%` }}
                          />
                        </div>
                      </td>

                      {/* Ações */}
                      <td
                        className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          title="Abrir Dossier & Submission Packet"
                          className="px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          Dossier
                        </Link>

                        <button
                          onClick={() => setSelectedLeadForCall(lead)}
                          title="Iniciar chamada assistida por IA"
                          className="px-2.5 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors cursor-pointer active-press"
                        >
                          Ligar
                        </button>

                        <button
                          onClick={() => setSelectedLeadForWa(lead)}
                          title="Enviar mensagem WhatsApp"
                          className="px-2.5 py-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs font-medium transition-colors cursor-pointer active-press"
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
                            Bound
                          </span>
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

      {/* 5.2 STICKY BATCH PROCESSING BAR (Aparece ao selecionar leads) */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#0d121f] border border-blue-500/50 rounded-xl p-3.5 shadow-2xl shadow-blue-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <div>
                <span className="font-bold text-white text-sm">
                  {selectedLeadIds.length} leads corporativos selecionados
                </span>
                <div className="text-[11px] text-slate-300 font-mono">
                  ${(totalSelectedPremium / 1000).toFixed(0)}k de prêmio anual sob análise
                </div>
              </div>
            </div>

            {/* CTAs em Lote */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleBulkFastRoute}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Fast Route em Lote
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCsvBinder}
                className="h-8 text-xs border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800"
              >
                <svg className="w-3.5 h-3.5 mr-1.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exportar CSV Binder
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedLeadIds([])}
                className="h-8 text-xs text-zinc-400 hover:text-white"
              >
                ✕ Desmarcar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer for Lead Deep Inspection */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setInspectingLead(null)}
          />

          <div className="relative w-full max-w-lg bg-[#10121a] border-l border-zinc-800 h-full overflow-y-auto shadow-2xl p-6 sm:p-7 flex flex-col justify-between z-10 spring-drawer">
            <div className="space-y-5">
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
                    {inspectingLead.empresa || inspectingLead.nome}
                  </h2>
                  {inspectingLead.empresa && (
                    <div className="text-xs text-zinc-400">
                      Contato: {inspectingLead.nome}
                    </div>
                  )}
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

              {/* Box de Análise Técnica de Risco */}
              <div className="p-4 rounded-lg bg-[#090a0f] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    Diagnóstico de Risco & Underwriting
                  </span>
                  <span className="text-[11px] text-zinc-500">IA Clearance</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {inspectingLead.resumoIa || 'Lead qualificado com sucesso pelos parâmetros de apetite da corretora.'}
                </p>
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Prêmio Estimado:</span>
                  <span className="font-mono font-bold text-white">
                    {inspectingLead.premioEstimado
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inspectingLead.premioEstimado)
                      : '$45,000'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Seguradora Recomendada:</span>
                  <span className="font-semibold text-emerald-400">
                    {inspectingLead.targetCarrier || 'Chubb'} ({inspectingLead.carrierAppetite || 90}% Apetite)
                  </span>
                </div>
              </div>

              {/* Ramo e Origem */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-500 block mb-1">
                    Linha de Negócio (LOB)
                  </span>
                  <span className="text-xs font-semibold text-zinc-200">
                    {inspectingLead.lob || inspectingLead.ramoDesejado}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-500 block mb-1">
                    Origem do Ingest
                  </span>
                  <span className="text-xs font-semibold text-zinc-200">
                    {inspectingLead.origem}
                  </span>
                </div>
              </div>

              {/* Ações Operacionais */}
              <div className="border-t border-zinc-800 pt-4 space-y-2.5">
                <span className="text-xs font-medium text-zinc-400 block">
                  Ações de Despacho & Fechamento
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedLeadForCall(inspectingLead)}
                    className="p-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer active-press"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Ligar com IA</span>
                  </button>

                  <button
                    onClick={() => setSelectedLeadForWa(inspectingLead)}
                    className="p-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer active-press"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                </div>

                <Link
                  href={`/dashboard/leads/${inspectingLead.id}`}
                  className="w-full p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer block text-center shadow-sm active-press"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Abrir Dossier & Submission Packet Completo</span>
                </Link>

                <Link
                  href="/dashboard/cotacao-cockpit"
                  className="w-full p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer block text-center active-press"
                >
                  <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Abrir cockpit de cotação</span>
                </Link>

                {inspectingLead.status !== 'convertido' && (
                  <button
                    onClick={() => handleConvertLead(inspectingLead)}
                    disabled={convertingId === inspectingLead.id}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active-press"
                  >
                    <span>Converter em apólice no radar</span>
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 mt-6 text-center">
              <span className="text-[11px] text-zinc-500">
                Operação sob compliance SOC-2 • {userOrg.orgName}
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
