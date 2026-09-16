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

  // Seleção e Ações em Lote
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
    userName: 'Carlos Silva',
    orgName: 'Valor Corretora de Seguros',
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
          userName: meData.user?.nome || 'Carlos Silva',
          orgName: meData.organization?.nome || 'Valor Corretora de Seguros',
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
        if (premiumFilter === '3k') return (lead.premioEstimado || 0) >= 3000;
        if (premiumFilter === '5k') return (lead.premioEstimado || 0) >= 5000;
        if (premiumFilter === '10k') return (lead.premioEstimado || 0) >= 10000;
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

  // Total Premium de Leads Selecionados (BRL)
  const totalSelectedPremium = useMemo(() => {
    return leads
      .filter((l) => selectedLeadIds.includes(l.id))
      .reduce((acc, curr) => acc + (curr.premioEstimado || 3500), 0);
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

  // Exportar Planilha / CSV
  const handleExportCsv = () => {
    const selected = leads.filter((l) => selectedLeadIds.includes(l.id));
    if (selected.length === 0) return;

    const headers = ['ID', 'Cliente/Empresa', 'Contato', 'Telefone', 'Email', 'Ramo', 'PremioEstimado', 'Seguradora', 'Score', 'Status'];
    const rows = selected.map((l) => [
      l.id,
      `"${l.empresa || l.nome}"`,
      `"${l.nome}"`,
      l.telefone,
      l.email || '',
      l.lob || l.ramoDesejado,
      l.premioEstimado || 0,
      l.targetCarrier || 'Porto Seguro',
      l.score,
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leads_Corretora_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBatchNotice(`Exportados ${selected.length} leads para planilha CSV.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleBulkFastRoute = () => {
    setBatchNotice(`⚡ ${selectedLeadIds.length} leads distribuídos para atendimento prioritário.`);
    setSelectedLeadIds([]);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleSimulateLead = async () => {
    setSimulating(true);
    try {
      const mockLead = {
        nome: 'Renata Vasconcelos ' + Math.floor(Math.random() * 1000),
        empresa: null,
        telefone: '11985' + Math.floor(100000 + Math.random() * 900000),
        email: 'renata.v@gmail.com',
        origem: 'Meta Ads (Instagram)',
        ramoDesejado: 'Seguro Auto',
        lob: 'Seguro Auto',
        premioEstimado: 3850,
        carrierAppetite: 96,
        targetCarrier: 'Porto Seguro',
        riskTags: JSON.stringify(['Jeep Compass 2024', 'Zero Km', 'Classe Bônus 5']),
        urgencia: 'alta',
        notas: 'Cotação de Seguro Auto novo para Jeep Compass 2024. Carro retirado na concessionária na quinta-feira.',
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
    if (!confirm(`Deseja converter ${lead.empresa || lead.nome} em apólice e salvar no Radar de Renovações?`)) {
      return;
    }

    setConvertingId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seguradora: lead.targetCarrier || 'Porto Seguro',
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
    auto: leads.filter((l) => l.ramoDesejado?.includes('Auto') || l.lob?.includes('Auto')).length,
    residencial: leads.filter((l) => l.ramoDesejado?.includes('Residencial') || l.lob?.includes('Residencial')).length,
    saude: leads.filter((l) => l.ramoDesejado?.includes('Saúde') || l.lob?.includes('Saúde')).length,
    vida: leads.filter((l) => l.ramoDesejado?.includes('Vida') || l.lob?.includes('Vida')).length,
    empresarial: leads.filter((l) => l.ramoDesejado?.includes('Empresarial') || l.lob?.includes('Empresarial') || l.ramoDesejado?.includes('Frota')).length,
  };

  const formatBRL = (val?: number | null) => {
    if (!val) return 'R$ 3.500';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans">
      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Speed-to-Lead Ativo • Meta & Google Ads
            </span>
            <span className="text-xs text-[var(--text-mute)]">Meta de 1º Contato: &lt; 5 min</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            Fila de Leads & Speed-to-Lead
          </h1>
          <p className="text-sm text-[var(--text-mute)] mt-0.5">
            Novas cotações recebidas em tempo real. Priorize por intenção de compra e acione pelo WhatsApp em 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchData}
            title="Atualizar lista"
            variant="outline"
            size="sm"
            className="h-9 px-3 bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </Button>

          <Button
            onClick={handleSimulateLead}
            disabled={simulating}
            size="sm"
            className="h-9 bg-[var(--purple)] hover:bg-[#1a4784] text-white font-medium text-xs shadow-sm flex items-center gap-1.5 px-4"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{simulating ? 'Recebendo...' : '+ Simular Inbound Lead'}</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Operação em Lote */}
      {batchNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-[var(--purple)] shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-4 h-4 text-[var(--purple)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>{batchNotice}</span>
          </div>
          <button onClick={() => setBatchNotice(null)} className="text-[var(--purple)]/70 hover:text-[var(--purple)] font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Filtros em Pílulas: Ramos PME de Seguros do Brasil */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `Todos os Leads (${stats.total})`, icon: null },
          { id: 'hot_pill', label: `🔥 Alta Intenção (${stats.hot})`, icon: null, isHot: true },
          { id: 'Auto', label: `🚗 Seguro Auto (${stats.auto})`, icon: null },
          { id: 'Residencial', label: `🏠 Residencial (${stats.residencial})`, icon: null },
          { id: 'Saúde PME', label: `🏥 Saúde PME (${stats.saude})`, icon: null },
          { id: 'Vida', label: `🛡️ Vida (${stats.vida})`, icon: null },
          { id: 'Empresarial', label: `🏢 Empresarial PME (${stats.empresarial})`, icon: null },
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
                    ? 'bg-rose-50 border border-rose-300 text-rose-700 shadow-sm font-semibold'
                    : 'bg-[var(--purple)] text-white shadow-sm font-semibold'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-mute)] hover:text-[var(--text)] hover:border-[var(--border)]'
              }`}
            >
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Barra Secundária de Busca, Faixa de Prêmio e Ordenação */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Busca */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar por nome, telefone, veículo ou empresa..."
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

        {/* Filtros Secundários */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0 text-xs">
          {/* Faixa de Prêmio Estimado */}
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-mute)] text-xs font-medium">Prêmio Estimado:</span>
            <select
              value={premiumFilter}
              onChange={(e) => setPremiumFilter(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text)] text-xs focus:outline-none focus:border-[#275ba5]"
            >
              <option value="all">Qualquer valor</option>
              <option value="3k">&gt; R$ 3.000 / ano</option>
              <option value="5k">&gt; R$ 5.000 / ano</option>
              <option value="10k">&gt; R$ 10.000 / ano</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-mute)] text-xs font-medium">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text)] text-xs focus:outline-none focus:border-[#275ba5]"
            >
              <option value="sla">SLA Crítico (&lt; 5m)</option>
              <option value="score">Maior Intenção (Score)</option>
              <option value="premium">Maior Prêmio (R$)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Leads */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-7 h-7 border-2 border-[#275ba5] border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
            <div className="text-xs font-medium text-[var(--text-mute)]">Carregando leads da corretora...</div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-mute)] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">Nenhum lead encontrado</h3>
            <p className="text-xs text-[var(--text-mute)] mt-1 max-w-sm mx-auto">
              Ajuste os filtros de ramo acima ou simule um novo lead recebido via anúncio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--text-mute)] uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                      onChange={toggleSelectAll}
                      className="rounded border-[var(--border)] text-[var(--purple)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Cliente / Proponente</th>
                  <th className="py-3 px-4">Ramo & Detalhes</th>
                  <th className="py-3 px-4">Speed-to-Lead</th>
                  <th className="py-3 px-4">Prêmio Estimado</th>
                  <th className="py-3 px-4">Seguradora Recomendada</th>
                  <th className="py-3 px-4 text-right">Ação Imediata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e8e7]">
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

                  // Cálculo do SLA restante (5 minutos)
                  const slaExpiry = lead.slaExpiresAt
                    ? new Date(lead.slaExpiresAt).getTime()
                    : new Date(lead.createdAt).getTime() + 5 * 60 * 1000;
                  const msRemaining = slaExpiry - nowTime;
                  const secondsRemaining = Math.max(0, Math.floor(msRemaining / 1000));
                  const minutes = Math.floor(secondsRemaining / 60);
                  const seconds = secondsRemaining % 60;
                  const isCritical = secondsRemaining < 60;
                  const isExpired = secondsRemaining === 0;

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-[var(--surface)] transition-colors group cursor-pointer ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => setInspectingLead(lead)}
                    >
                      {/* Checkbox de Seleção */}
                      <td
                        className="py-3.5 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectLead(lead.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-[var(--border)] text-[var(--purple)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>

                      {/* Cliente / Contato */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--text)] group-hover:text-[var(--purple)] transition-colors flex items-center gap-1.5">
                          <span>{lead.empresa || lead.nome}</span>
                          {isHot && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" title="🔥 Alta Intenção de Fechamento" />
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-mute)] flex items-center gap-1.5 mt-0.5 font-mono">
                          {lead.empresa && <span>{lead.nome} •</span>}
                          <span>{normalizePhoneBR(lead.telefone).formatted}</span>
                          <span className="text-[10px] text-[var(--text-faint)]">({lead.origem})</span>
                        </div>
                      </td>

                      {/* Ramo e Detalhes */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[var(--text)]">{lead.ramoDesejado || lead.lob}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedTags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--text-mute)] border border-[var(--border)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* SLA Speed-to-Lead Countdown */}
                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-faint)] bg-[var(--surface)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                            SLA Ultrapassado
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 font-bold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} restante!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            <svg className="w-3 h-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                          </span>
                        )}
                      </td>

                      {/* Prêmio Estimado */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-[var(--text)] tracking-tight">{formatBRL(lead.premioEstimado)}</div>
                        <span className="text-[10px] text-[var(--text-mute)] font-sans">estimativa anual</span>
                      </td>

                      {/* Seguradora Recomendada */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[var(--text)]">
                            {lead.targetCarrier || 'Porto Seguro'}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                            {lead.carrierAppetite || 95}% Fit
                          </span>
                        </div>
                        <div className="w-24 bg-[var(--border)] rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className="bg-[var(--purple)] h-1.5 rounded-full"
                            style={{ width: `${lead.carrierAppetite || 95}%` }}
                          />
                        </div>
                      </td>

                      {/* Ações */}
                      <td
                        className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedLeadForWa(lead)}
                          title="Enviar mensagem WhatsApp com template"
                          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm inline-flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => setSelectedLeadForCall(lead)}
                          title="Iniciar chamada assistida"
                          className="px-2.5 py-1.5 rounded-md bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-xs font-medium transition-colors cursor-pointer"
                        >
                          Ligar
                        </button>

                        {lead.status !== 'convertido' ? (
                          <button
                            onClick={() => handleConvertLead(lead)}
                            disabled={convertingId === lead.id}
                            title="Salvar apólice fechada no Radar de Renovações"
                            className="px-2.5 py-1.5 rounded-md bg-[var(--purple)] hover:bg-[#1a4784] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {convertingId === lead.id ? 'Salvando...' : 'Fechar'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                            Fechado
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

      {/* Barra de Ações em Lote */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--purple)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--purple)]"></span>
              </span>
              <div>
                <span className="font-bold text-[var(--text)] text-sm">
                  {selectedLeadIds.length} leads selecionados
                </span>
                <div className="text-xs text-[var(--text-mute)]">
                  Total estimado: <strong className="text-[var(--text)]">{formatBRL(totalSelectedPremium)}</strong>
                </div>
              </div>
            </div>

            {/* CTAs em Lote */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleBulkFastRoute}
                className="h-8 text-xs bg-[var(--purple)] hover:bg-[#1a4784] text-white font-medium"
              >
                Atendimento Prioritário
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCsv}
                className="h-8 text-xs border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface)]"
              >
                <svg className="w-3.5 h-3.5 mr-1.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exportar CSV
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedLeadIds([])}
                className="h-8 text-xs text-[var(--text-mute)] hover:text-[var(--text)]"
              >
                ✕ Desmarcar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Lateral para Detalhes do Lead */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setInspectingLead(null)}
          />

          <div className="relative w-full max-w-lg bg-[var(--surface-2)] border-l border-[var(--border)] h-full overflow-y-auto shadow-2xl p-6 sm:p-7 flex flex-col justify-between z-10">
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[var(--purple)] border border-blue-200">
                      Score: {inspectingLead.score}/100
                    </span>
                    <span className="text-xs text-[var(--text-faint)]">•</span>
                    <span className="text-xs text-[var(--text-faint)]">
                      Ref #{inspectingLead.id?.slice(-6)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">
                    {inspectingLead.empresa || inspectingLead.nome}
                  </h2>
                  {inspectingLead.empresa && (
                    <div className="text-xs text-[var(--text-mute)]">
                      Contato: {inspectingLead.nome}
                    </div>
                  )}
                  <div className="text-xs text-[var(--text-mute)] font-mono mt-0.5">
                    {normalizePhoneBR(inspectingLead.telefone).formatted}
                    {inspectingLead.email && ` • ${inspectingLead.email}`}
                  </div>
                </div>

                <button
                  onClick={() => setInspectingLead(null)}
                  className="p-1.5 rounded-lg text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Box de Análise de Risco & Notas */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    Diagnóstico de Perfil
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">Qualificado</span>
                </div>
                <p className="text-xs text-[var(--text-mute)] leading-relaxed">
                  {inspectingLead.resumoIa || inspectingLead.notas || 'Lead qualificado com interesse imediato no produto.'}
                </p>
                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-mute)]">Prêmio Anual Estimado:</span>
                  <span className="font-bold text-[var(--text)]">
                    {formatBRL(inspectingLead.premioEstimado)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-mute)]">Seguradora Recomendada:</span>
                  <span className="font-semibold text-[var(--purple)]">
                    {inspectingLead.targetCarrier || 'Porto Seguro'} ({inspectingLead.carrierAppetite || 95}% Fit)
                  </span>
                </div>
              </div>

              {/* Ramo e Origem */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <span className="text-[11px] font-medium text-[var(--text-mute)] block mb-1">
                    Ramo Desejado
                  </span>
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {inspectingLead.ramoDesejado || inspectingLead.lob}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <span className="text-[11px] font-medium text-[var(--text-mute)] block mb-1">
                    Canal de Origem
                  </span>
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {inspectingLead.origem}
                  </span>
                </div>
              </div>

              {/* Ações Operacionais da Corretora */}
              <div className="border-t border-[var(--border)] pt-4 space-y-2.5">
                <span className="text-xs font-semibold text-[var(--text)] block">
                  Ações Rápidas de Fechamento
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedLeadForWa(inspectingLead)}
                    className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Chamar no WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setSelectedLeadForCall(inspectingLead)}
                    className="p-2.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Ligar</span>
                  </button>
                </div>

                <Link
                  href="/dashboard/cotacao-cockpit"
                  className="w-full p-2.5 rounded-lg bg-[var(--purple)] hover:bg-[#1a4784] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer block text-center shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Calcular Cotação Multisseguradoras</span>
                </Link>

                {inspectingLead.status !== 'convertido' && (
                  <button
                    onClick={() => handleConvertLead(inspectingLead)}
                    disabled={convertingId === inspectingLead.id}
                    className="w-full py-2.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Registrar Fechamento & Apólice</span>
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4 mt-6 text-center">
              <span className="text-xs text-[var(--text-faint)]">
                {userOrg.orgName} • Atendimento ao Cliente
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
