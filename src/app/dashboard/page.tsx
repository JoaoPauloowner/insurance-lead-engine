'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VapiCallModal from '@/components/VapiCallModal';
import WhatsAppModal from '@/components/WhatsAppModal';

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
}

export default function ExecutiveCockpitPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<LeadItem | null>(null);
  const [selectedLeadForWa, setSelectedLeadForWa] = useState<LeadItem | null>(null);
  const [routedSuccess, setRoutedSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'fleet' | 'cyber'>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFastRoute = (lead: LeadItem) => {
    setRoutedSuccess(`Lead ${lead.empresa || lead.nome} despachado com sucesso para subscrição sênior (${lead.targetCarrier || 'Chubb'}).`);
    setTimeout(() => setRoutedSuccess(null), 4000);
  };

  // Telemetria do PRD 5.1
  const pipelineValue = 1482500; // $1.48M
  const closedPremiumToday = 428000; // $428k
  const closedTarget = 500000; // $500k
  const closedPercent = Math.round((closedPremiumToday / closedTarget) * 100);

  // Appetite Matrix do PRD
  const carriers = [
    {
      name: 'Chubb',
      lobFocus: 'Cyber & Tech / D&O',
      appetite: 94,
      trend: '+4%',
      status: 'Aggressive',
      color: 'from-blue-600 to-indigo-500',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      capacity: '$12.5M',
    },
    {
      name: 'Progressive',
      lobFocus: 'Commercial Fleet Auto',
      appetite: 91,
      trend: '+7%',
      status: 'Open Capacity',
      color: 'from-emerald-600 to-teal-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      capacity: '$8.2M',
    },
    {
      name: 'Travelers',
      lobFocus: 'General Liability & Property',
      appetite: 88,
      trend: 'Estável',
      status: 'Open Capacity',
      color: 'from-amber-600 to-orange-500',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      capacity: '$15.0M',
    },
    {
      name: 'Liberty Mutual',
      lobFocus: 'Inland Marine & Cargo',
      appetite: 76,
      trend: '-2%',
      status: 'Selective',
      color: 'from-purple-600 to-pink-500',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      capacity: '$6.4M',
    },
  ];

  // Filtro para os Hot Deals
  const hotDeals = leads.filter((l) => {
    if (activeTab === 'hot') return l.score >= 90;
    if (activeTab === 'fleet') return l.lob === 'Fleet Auto' || l.ramoDesejado?.includes('Auto');
    if (activeTab === 'cyber') return l.lob === 'Cyber & Tech';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Executivo & Status do Underwriting Floor */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Insurance Lead Engine
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-sunken)] text-slate-400 border border-[var(--border-subtle)] font-normal">
                v2.4 Pro Cockpit
              </span>
            </h1>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Underwriting operacional em tempo real, distribuição inteligente de cotações corporativas ($10k–$250k+) e monitoramento instantâneo do apetite de risco das seguradoras parceiras.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/leads">
            <Button variant="outline" size="sm" className="h-9 text-xs border-[var(--border-subtle)] bg-[var(--surface-card)] text-slate-300 hover:text-white">
              <svg className="w-3.5 h-3.5 mr-1.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Fila de Triagem (142)
            </Button>
          </Link>
          <Link href="/dashboard/cotacao-cockpit">
            <Button size="sm" className="h-9 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm shadow-blue-500/20">
              <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Cockpit de Cotação
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerta de Despacho Rápido */}
      {routedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center justify-between text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{routedSuccess}</span>
          </div>
          <button onClick={() => setRoutedSuccess(null)} className="text-emerald-400/60 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* 5.1 Telemetry Grid: 4 Métricas Principais do PRD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Pipeline Value */}
        <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Pipeline em Jogo</span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20">
              ▲ +21.4% 7D
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ${(pipelineValue / 1000000).toFixed(2)}M
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Prêmio não-emitido sob análise</span>
            <span className="text-slate-300 font-mono font-medium">38 apólices</span>
          </p>
        </Card>

        {/* Card 2: Total Ingested Leads */}
        <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Leads Ingeridos Hoje</span>
            <span className="text-[10px] font-mono text-blue-400 font-semibold px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/20">
              +18 última hora
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            142 <span className="text-xs text-slate-400 font-normal font-sans">leads</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Velocidade de contato SLA</span>
            <span className="text-emerald-400 font-mono font-semibold">avg 38s (&lt; 5m)</span>
          </p>
        </Card>

        {/* Card 3: Conversion Rate & Bind Velocity */}
        <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Bind Velocity</span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/20">
              18.6% Hot Intent
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            14.7% <span className="text-xs text-slate-400 font-normal font-sans">throughput</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Meta de subscrição QTD</span>
            <span className="text-slate-300 font-mono font-medium">Target 15.0%</span>
          </p>
        </Card>

        {/* Card 4: Closed Premium Today */}
        <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Prêmio Emitido Hoje</span>
            <span className="text-[10px] font-mono text-slate-300 font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
              {closedPercent}% da Meta
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ${(closedPremiumToday / 1000).toFixed(0)}k <span className="text-xs text-slate-400 font-normal font-mono">/ $500k</span>
          </div>
          <div className="w-full bg-[var(--surface-sunken)] rounded-full h-1.5 mt-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${closedPercent}%` }}
            />
          </div>
        </Card>
      </div>

      {/* 5.1 Throughput Pipeline Funnel: 4 Segmentos */}
      <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Funil de Throughput Operacional (Ingestão ➔ Emissão)
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Passagem contínua de webhook com triagem de inteligência artificial e matching de apetite
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Enriquecimento &lt; 45s
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> 1º Toque &lt; 3.1m
            </span>
          </div>
        </div>

        {/* Barra Segmentada Visual */}
        <div className="grid grid-cols-4 gap-2">
          {/* Estágio 1: Ingest */}
          <div className="p-3 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-subtle)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">1. Inbound Ingest</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">142</span>
              <span className="text-[10px] font-mono text-slate-400">100%</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-blue-400 font-medium">APIs & Webhooks</span>
            </div>
          </div>

          {/* Estágio 2: Scored */}
          <div className="p-3 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-subtle)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">2. AI Scored & Validated</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">98</span>
              <span className="text-[10px] font-mono text-indigo-400 font-semibold">69.0%</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              DOT & SOC2 Aprovados
            </div>
          </div>

          {/* Estágio 3: Engaged */}
          <div className="p-3 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-subtle)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">3. Engaged Underwriting</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">64</span>
              <span className="text-[10px] font-mono text-amber-400 font-semibold">45.1%</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Voz Vapi & WhatsApp
            </div>
          </div>

          {/* Estágio 4: Bound */}
          <div className="p-3 rounded-lg bg-[var(--surface-sunken)] border border-emerald-500/20 bg-emerald-950/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/80 mb-0.5">4. Policy Bound</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-400">21</span>
              <span className="text-[10px] font-mono text-emerald-300 font-semibold">14.7%</span>
            </div>
            <div className="text-[10px] text-emerald-400/90 font-mono font-medium mt-1">
              $428k fechados hoje
            </div>
          </div>
        </div>
      </Card>

      {/* 5.1 Live Carrier Appetite Bar: Capacidade por Seguradora Parceira */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Live Carrier Appetite Bar (Capacidade das Seguradoras)
            </h2>
            <p className="text-[11px] text-slate-400">
              Taxa de aceitação em tempo real conectada aos critérios de subscrição dos sindicatos de risco
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 bg-[var(--surface-sunken)] rounded border border-[var(--border-subtle)]">
            Atualizado a cada 60s
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {carriers.map((c) => (
            <Card key={c.name} variant="default" className="p-3.5 bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{c.name}</h3>
                  <p className="text-[10px] text-slate-400 truncate">{c.lobFocus}</p>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${c.badgeBg}`}>
                  {c.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-1.5">
                <div className="text-xl font-bold font-mono text-white">
                  {c.appetite}%
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Cap: <span className="text-slate-200 font-medium">{c.capacity}</span>
                </div>
              </div>

              {/* Barra de Progresso do Apetite */}
              <div className="w-full bg-[var(--surface-sunken)] rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${c.color} transition-all duration-700`}
                  style={{ width: `${c.appetite}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                <span>Variação 24h</span>
                <span className={c.trend.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}>
                  {c.trend}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5.1 Priority Hot Deals Feed */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-base">🔥</span>
              Priority Hot Deals Feed ($10k–$250k+)
            </h2>
            <p className="text-[11px] text-slate-400">
              Oportunidades de alto prêmio com apetite confirmado e SLA de resposta em contagem regressiva
            </p>
          </div>

          {/* Filtros em Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                activeTab === 'all' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Todos os Deals ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('hot')}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                activeTab === 'hot' ? 'bg-red-950/80 text-red-300 border border-red-500/40 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              🔥 90%+ Intent ({leads.filter((l) => l.score >= 90).length})
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                activeTab === 'fleet' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Fleet Auto ({leads.filter((l) => l.lob === 'Fleet Auto' || l.ramoDesejado?.includes('Auto')).length})
            </button>
            <button
              onClick={() => setActiveTab('cyber')}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                activeTab === 'cyber' ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Cyber & Tech ({leads.filter((l) => l.lob === 'Cyber & Tech').length})
            </button>
          </div>
        </div>

        {/* Lista de Cards de Hot Deals */}
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Carregando telemetria de leads...</div>
        ) : hotDeals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">Nenhum deal encontrado no filtro selecionado.</div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {hotDeals.map((lead) => {
              // Parse risk tags se for JSON
              let parsedTags: string[] = [];
              if (lead.riskTags) {
                try {
                  parsedTags = JSON.parse(lead.riskTags);
                } catch {
                  parsedTags = [lead.riskTags];
                }
              }

              const formattedPremium = lead.premioEstimado
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.premioEstimado)
                : '$45,000';

              return (
                <Card
                  key={lead.id}
                  variant="interactive"
                  className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Informações da Empresa & Contato */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {lead.empresa || lead.nome}
                      </h3>
                      {lead.empresa && (
                        <span className="text-xs text-slate-400 font-normal">
                          · {lead.nome}
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                        {lead.lob || lead.ramoDesejado || 'Commercial'}
                      </span>
                      {lead.score >= 90 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/50 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                          {lead.score}% Intent
                        </span>
                      )}
                      {lead.targetCarrier && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          {lead.targetCarrier} · {lead.carrierAppetite || 90}% Match
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {lead.resumoIa || 'Lead corporativo em triagem ativa no underwriting engine.'}
                    </p>

                    {/* Risk Tags de Compliance & SLA */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {parsedTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-sunken)] text-slate-300 border border-[var(--border-subtle)]"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 ml-1">
                        <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        SLA: &lt; 2m 45s restantes
                      </span>
                    </div>
                  </div>

                  {/* Prêmio Anual & CTAs Imediatos */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Prêmio Estimado</div>
                      <div className="text-lg font-bold font-mono text-white tracking-tight">
                        {formattedPremium} <span className="text-[10px] font-normal text-slate-400 font-sans">/ano</span>
                      </div>
                    </div>

                    {/* Botões de Ação de 1 Toque */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setSelectedLeadForCall(lead)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Call Lead
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFastRoute(lead)}
                        className="h-8 text-xs border-[var(--border-subtle)] bg-[var(--surface-sunken)] hover:bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <svg className="w-3.5 h-3.5 mr-1 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="13 17 18 12 13 7" />
                          <polyline points="6 17 11 12 6 7" />
                        </svg>
                        Fast Route
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLeadForWa(lead)}
                        className="h-8 px-2 text-slate-400 hover:text-emerald-400"
                        title="WhatsApp Instantâneo"
                      >
                        <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modais de Comunicação (Vapi Voice & WhatsApp) */}
      <VapiCallModal
        isOpen={!!selectedLeadForCall}
        onClose={() => setSelectedLeadForCall(null)}
        lead={selectedLeadForCall}
        onSuccess={() => {
          fetchLeads();
          setSelectedLeadForCall(null);
        }}
      />

      <WhatsAppModal
        isOpen={!!selectedLeadForWa}
        onClose={() => setSelectedLeadForWa(null)}
        targetData={selectedLeadForWa}
        isLead={true}
        templates={[]}
        brokerName="Sarah Vance"
        brokerOrgName="LeadEngine Brokerage"
        onSuccess={() => {
          fetchLeads();
          setSelectedLeadForWa(null);
        }}
      />
    </div>
  );
}
