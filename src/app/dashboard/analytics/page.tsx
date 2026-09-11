'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AnalyticsEnginePage() {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | 'qtd'>('30d');

  // PRD 5.3: Pipeline Conversion Waterfall (6-stage funnel)
  const waterfallStages = [
    {
      stage: '1. Webhook Ingest',
      count: 1240,
      percentOfTotal: '100%',
      dropoff: null,
      desc: 'Entrada via APIs, Meta Lead Ads e portais de corretores',
      slaBenchmark: 'Tempo real (< 50ms)',
      color: 'bg-blue-500',
    },
    {
      stage: '2. Enriched & Scored',
      count: 1090,
      percentOfTotal: '87.9%',
      dropoff: '-12.1%',
      desc: 'Validação de DOT Tier A, EIN, SOC-2 e FIPE concluída',
      slaBenchmark: 'Média 34s',
      color: 'bg-indigo-500',
    },
    {
      stage: '3. Dispatched to Floor',
      count: 842,
      percentOfTotal: '67.9%',
      dropoff: '-22.7%',
      desc: 'Filtragem por apetite de seguradora e alocação por fila',
      slaBenchmark: 'Automático (< 1s)',
      color: 'bg-purple-500',
    },
    {
      stage: '4. 1st Contact (< 5m SLA)',
      count: 614,
      percentOfTotal: '49.5%',
      dropoff: '-27.1%',
      desc: 'Contato ativo via Vapi Voice AI ou WhatsApp wa.me',
      slaBenchmark: 'Média 2m 38s (Meta < 5m)',
      color: 'bg-amber-500',
    },
    {
      stage: '5. Quote Assembled',
      count: 386,
      percentOfTotal: '31.1%',
      dropoff: '-37.1%',
      desc: 'Cotação multisseguradora gerada no cockpit de subscrição',
      slaBenchmark: 'Média 18m',
      color: 'bg-teal-500',
    },
    {
      stage: '6. Policy Bound & Cleared',
      count: 182,
      percentOfTotal: '14.7%',
      dropoff: '-52.8%',
      desc: 'Apólice emitida e comissão faturada no radar',
      slaBenchmark: 'Ciclo 4.2 dias',
      color: 'bg-emerald-500',
    },
  ];

  // PRD 5.3: Line of Business (LOB) Yield Matrix
  const lobMatrix = [
    {
      lob: 'Commercial Fleet Auto',
      icon: '🚛',
      volume: 342,
      avgPremium: '$48,200',
      pipeline: '$1,648,440',
      avgSla: '2m 14s',
      winRate: '16.4%',
      carrierTop: 'Progressive (91%)',
      efficiency: 'Alta Eficiência',
      efficiencyColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    },
    {
      lob: 'Cyber & Tech E&O',
      icon: '🛡️',
      volume: 218,
      avgPremium: '$72,400',
      pipeline: '$1,578,320',
      avgSla: '3m 05s',
      winRate: '21.1%',
      carrierTop: 'Chubb (98%)',
      efficiency: 'Excepcional',
      efficiencyColor: 'text-blue-400 bg-blue-950/60 border-blue-500/30',
    },
    {
      lob: 'Inland Marine & Cargo',
      icon: '📦',
      volume: 184,
      avgPremium: '$64,100',
      pipeline: '$1,179,440',
      avgSla: '2m 48s',
      winRate: '15.2%',
      carrierTop: 'Liberty Mutual (89%)',
      efficiency: 'Estável',
      efficiencyColor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    },
    {
      lob: 'General Liability & Property',
      icon: '🏭',
      volume: 286,
      avgPremium: '$95,000',
      pipeline: '$2,717,000',
      avgSla: '3m 42s',
      winRate: '13.8%',
      carrierTop: 'Travelers (92%)',
      efficiency: 'Alta Eficiência',
      efficiencyColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    },
  ];

  // PRD 5.3: Broker & Underwriter Leaderboard
  const brokers = [
    {
      name: 'Sarah Vance',
      role: 'Principal Underwriter / Lead',
      avatar: 'SV',
      volume: 142,
      avgSla: '2.4m',
      winRate: '22.4%',
      boundPremium: '$640,000',
      slaCompliance: '98.2%',
    },
    {
      name: 'Elena Rostova',
      role: 'Cyber Risk & Tech Specialist',
      avatar: 'ER',
      volume: 84,
      avgSla: '2.1m',
      winRate: '24.2%',
      boundPremium: '$580,000',
      slaCompliance: '99.1%',
    },
    {
      name: 'Dave Miller',
      role: 'Senior Commercial Account Exec',
      avatar: 'DM',
      volume: 128,
      avgSla: '2.9m',
      winRate: '19.5%',
      boundPremium: '$512,000',
      slaCompliance: '94.6%',
    },
    {
      name: 'Marcus Brody',
      role: 'Commercial Fleet Specialist',
      avatar: 'MB',
      volume: 96,
      avgSla: '3.2m',
      winRate: '16.8%',
      boundPremium: '$384,000',
      slaCompliance: '91.8%',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Executivo de Analytics */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Analytics & SLA Velocity Engine
              <span className="text-xs font-mono font-normal px-2 py-0.5 bg-blue-950/80 text-blue-300 border border-blue-500/30 rounded">
                SCREEN_10
              </span>
            </h1>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Telemetria analítica de conversão de ponta a ponta, matriz de rendimento por Linha de Negócio (LOB) e velocidade de atendimento operacional com mandato sub-5-minutos.
          </p>
        </div>

        {/* Timeframe Selectors (PRD 5.3) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#090a0f] border border-zinc-800 rounded-lg p-1 text-xs">
            {[
              { id: 'today', label: 'Hoje' },
              { id: '7d', label: '7 Dias' },
              { id: '30d', label: '30 Dias' },
              { id: 'qtd', label: 'QTD' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3 py-1 rounded transition-colors ${
                  timeframe === tf.id
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="h-8 text-xs border-zinc-800 bg-[#10121a] text-zinc-300 hover:text-white">
              Cockpit
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principais de Conversão & SLA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">SLA Sub-5m Compliance</span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20">
              ▲ +5.2% vs mês ant.
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            89.4% <span className="text-xs text-slate-400 font-normal font-sans">dos leads</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Tempo Médio 1º Toque</span>
            <span className="text-emerald-400 font-mono font-semibold">2m 38s (Meta &lt; 5m)</span>
          </p>
        </Card>

        <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Speed-to-Lead Lift</span>
            <span className="text-[10px] font-mono text-blue-400 font-semibold px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/20">
              Impacto Direto
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            +34.2% <span className="text-xs text-slate-400 font-normal font-sans">bind spike</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Contatos em &lt; 5 minutos</span>
            <span className="text-slate-300 font-mono font-medium">18.6% Win Rate</span>
          </p>
        </Card>

        <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Prêmio Médio Emitido</span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/20">
              Corporate LOB
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            $71,200 <span className="text-xs text-slate-400 font-normal font-sans">/ apólice</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Total Bound no Período</span>
            <span className="text-slate-200 font-mono font-semibold">$2.11M</span>
          </p>
        </Card>

        <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Throughput Global</span>
            <span className="text-[10px] font-mono text-slate-300 font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
              182 de 1,240
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            14.7% <span className="text-xs text-slate-400 font-normal font-sans">conversão bind</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Ciclo médio de cotação</span>
            <span className="text-emerald-400 font-mono font-medium">4.2 dias</span>
          </p>
        </Card>
      </div>

      {/* 5.3 PIPELINE CONVERSION WATERFALL (6 Estágios) */}
      <Card variant="analytical" className="p-5 bg-[var(--surface-card)] border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Pipeline Conversion Waterfall (Atrito de 6 Estágios)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Mapeamento contínuo da perda de leads entre o webhook de ingestão e a apólice efetivamente emitida
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 px-2.5 py-1 bg-zinc-900 rounded border border-zinc-800">
            Amostra: 1,240 leads ingeridos
          </span>
        </div>

        <div className="space-y-3">
          {waterfallStages.map((stg, idx) => {
            const widthPct = Math.max(12, (stg.count / 1240) * 100);

            return (
              <div key={stg.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{stg.stage}</span>
                    <span className="text-zinc-400 text-[11px] hidden sm:inline">— {stg.desc}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    {stg.dropoff && (
                      <span className="text-red-400 text-[11px] font-medium bg-red-950/40 px-1.5 py-0.2 rounded border border-red-500/20">
                        Drop: {stg.dropoff}
                      </span>
                    )}
                    <span className="font-bold text-white text-sm">{stg.count}</span>
                    <span className="text-slate-400 text-xs w-12 text-right">{stg.percentOfTotal}</span>
                  </div>
                </div>

                {/* Barra do Waterfall */}
                <div className="w-full bg-zinc-900/80 rounded-lg h-3 overflow-hidden border border-zinc-800 flex items-center">
                  <div
                    className={`h-3 rounded-lg ${stg.color} transition-all duration-700`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
                  <span>Benchmark SLA: {stg.slaBenchmark}</span>
                  <span>Retenção residual: {stg.percentOfTotal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5.3 LINE OF BUSINESS (LOB) YIELD MATRIX */}
      <Card variant="analytical" className="p-5 bg-[var(--surface-card)] border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-base">📊</span>
              Line of Business (LOB) Yield Matrix
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Rentabilidade, tíquete médio de prêmio e velocidade de fechamento por ramo corporativo
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Total Pipeline: $7.12M</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#090a0f]/80 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Linha de Negócio (LOB)</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Prêmio Médio</th>
                <th className="py-3 px-4">Pipeline Total</th>
                <th className="py-3 px-4">SLA Médio</th>
                <th className="py-3 px-4">Win Rate</th>
                <th className="py-3 px-4">Seguradora Parceira</th>
                <th className="py-3 px-4 text-right">Eficiência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {lobMatrix.map((item) => (
                <tr key={item.lob} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-semibold text-zinc-100 flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.lob}</span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-200">{item.volume} leads</td>
                  <td className="py-3.5 px-4 text-white font-bold">{item.avgPremium}</td>
                  <td className="py-3.5 px-4 text-zinc-300">{item.pipeline}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{item.avgSla}</td>
                  <td className="py-3.5 px-4 text-amber-300 font-bold">{item.winRate}</td>
                  <td className="py-3.5 px-4 font-sans text-zinc-300">{item.carrierTop}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.efficiencyColor}`}>
                      {item.efficiency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5.3 BROKER & UNDERWRITER LEADERBOARD */}
      <Card variant="analytical" className="p-5 bg-[var(--surface-card)] border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-base">🏆</span>
              Underwriting Team & Broker Leaderboard
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Performance individual de resposta ao SLA (&lt; 3.1m benchmark), taxa de bind e volume de prêmio emitido
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            Floor Efficiency: 96.2%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {brokers.map((broker, idx) => (
            <div
              key={broker.name}
              className="p-4 rounded-xl bg-[#090a0f] border border-zinc-800/80 hover:border-blue-500/40 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center justify-center font-mono">
                    {broker.avatar}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-tight">{broker.name}</h3>
                    <p className="text-[10px] text-zinc-400 truncate">{broker.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">#{idx + 1}</span>
              </div>

              <div className="space-y-2 border-t border-zinc-800/80 pt-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans text-[11px]">SLA Médio de Contato:</span>
                  <span className="text-emerald-400 font-bold">{broker.avgSla}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans text-[11px]">Taxa de Bind:</span>
                  <span className="text-amber-300 font-bold">{broker.winRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans text-[11px]">Volume Atendido:</span>
                  <span className="text-zinc-200">{broker.volume} leads</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                  <span className="text-zinc-400 font-sans text-[11px]">Prêmio Emitido:</span>
                  <span className="text-white font-bold text-sm">{broker.boundPremium}</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500">Compliance &lt; 5m</span>
                <span className="text-emerald-400 font-semibold">{broker.slaCompliance}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
