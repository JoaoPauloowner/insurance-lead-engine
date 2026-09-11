'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { normalizePhoneBR } from '@/lib/phone';
import VapiCallModal from '@/components/VapiCallModal';
import WhatsAppModal from '@/components/WhatsAppModal';

interface LeadDetail {
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
  interacoes?: Array<{
    id: string;
    canal: string;
    direcao: string;
    status: string;
    conteudo: string;
    createdAt: string;
  }>;
}

export default function LeadDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;
  const router = useRouter();

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [transmittingRfq, setTransmittingRfq] = useState(false);
  const [rfqResult, setRfqResult] = useState<any | null>(null);
  const [selectedCarrierRfq, setSelectedCarrierRfq] = useState('Chubb');
  const [selectedLimit, setSelectedLimit] = useState('$5,000,000');
  const [selectedDeductible, setSelectedDeductible] = useState('$5,000');

  // Modais
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        if (data.lead?.targetCarrier) {
          setSelectedCarrierRfq(data.lead.targetCarrier);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchRfq = async () => {
    setTransmittingRfq(true);
    setRfqResult(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/rfq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: selectedCarrierRfq,
          limitRequested: selectedLimit,
          deductible: selectedDeductible,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRfqResult(data.quote);
        fetchLead(); // Atualiza histórico
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTransmittingRfq(false);
    }
  };

  const handlePrintBinder = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Carregando Dossier & Submission Packet...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-24 text-center space-y-3">
        <h2 className="text-lg font-bold text-white">Lead não encontrado</h2>
        <p className="text-xs text-slate-400">O registro solicitado não existe ou foi arquivado.</p>
        <Link href="/dashboard/leads">
          <Button size="sm" variant="outline" className="text-xs">
            Voltar para Fila de Triagem
          </Button>
        </Link>
      </div>
    );
  }

  // Parse risk tags
  let parsedTags: string[] = [];
  if (lead.riskTags) {
    try {
      parsedTags = JSON.parse(lead.riskTags);
    } catch {
      parsedTags = [lead.riskTags];
    }
  }

  // Parse structured data collected
  let parsedCollected: Record<string, any> = {};
  if (lead.dadosColetados) {
    try {
      parsedCollected = JSON.parse(lead.dadosColetados);
    } catch {
      parsedCollected = { notas: lead.dadosColetados };
    }
  }

  const formattedPremium = lead.premioEstimado
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.premioEstimado)
    : '$65,000';

  const carriers = [
    { name: 'Chubb', match: 98, status: 'Aggressive Clearance', focus: 'Cyber E&O, Executive Liability' },
    { name: 'Progressive', match: 94, status: 'Direct Bind Available', focus: 'Commercial Fleet Auto' },
    { name: 'Travelers', match: 92, status: 'Survey Required', focus: 'General Liability & Property' },
    { name: 'Liberty Mutual', match: 89, status: 'Appetite Cleared', focus: 'Inland Marine & Cargo' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Breadcrumb & Actions Bar (Não impresso no PDF) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/dashboard/leads" className="hover:text-white transition-colors">
              Fila de Triagem
            </Link>
            <span>/</span>
            <span className="text-blue-400 font-mono">Dossier #{lead.id.slice(-6)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {lead.empresa || lead.nome}
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                {lead.lob || lead.ramoDesejado}
              </span>
            </h1>
            {lead.score >= 90 && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                🔥 {lead.score}% Hot Intent
              </span>
            )}
          </div>
        </div>

        {/* CTAs de Operação & Exportação */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={handlePrintBinder}
            variant="outline"
            className="h-9 text-xs border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800"
          >
            <svg className="w-3.5 h-3.5 mr-1.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Exportar Binder (PDF)
          </Button>

          <Button
            size="sm"
            onClick={() => setCallModalOpen(true)}
            className="h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Ligar com IA (Vapi)
          </Button>

          <Button
            size="sm"
            onClick={() => setWaModalOpen(true)}
            variant="outline"
            className="h-9 text-xs border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/40"
          >
            WhatsApp
          </Button>
        </div>
      </div>

      {/* CABEÇALHO INSTITUCIONAL PARA O BINDER IMPRESSO EM PDF */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
              Underwriting Submission Packet & Risk Binder
            </h1>
            <p className="text-xs text-gray-600 font-mono">
              Confidential Brokerage Submission · LeadEngine Pro Underwriting Syndicate
            </p>
          </div>
          <div className="text-right text-xs font-mono text-gray-700">
            <div>Ref Submission: <strong>SUB-{lead.id.slice(-8).toUpperCase()}</strong></div>
            <div>Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
            <div>Target Carrier: <strong>{lead.targetCarrier || 'Chubb Syndicate'}</strong></div>
          </div>
        </div>
      </div>

      {/* Grid de 3 Colunas: Bento Density */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUNA 1 (4 Colunas): Perfil da Entidade Segurada & Compliance de Risco */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card da Empresa */}
          <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 21v-4h6v4M12 3l9 4H3l9-4z" />
                </svg>
                Entidade Jurídica Segurada
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Razão Social / Legal Name</span>
                <span className="font-bold text-white text-sm">{lead.empresa || lead.nome}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">EIN / Registro Fiscal</span>
                  <span className="text-slate-200">XX-XXX4910</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">USDOT Registration</span>
                  <span className="text-slate-200">USDOT #3984102</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Origem do Inbound</span>
                  <span className="text-blue-400 font-sans">{lead.origem}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Faturamento Estimado</span>
                  <span className="text-slate-200">$48.5M / ano</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Compliance & Risk Verification Clearance */}
          <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Auditoria de Compliance de Risco
              </h2>
            </div>

            <div className="space-y-2">
              {[
                { label: 'DOT Tier A Compliance', desc: '0 violações graves em 24 meses · Frota inspecionada', status: 'Aprovado' },
                { label: 'SOC-2 Type II Certification', desc: 'Auditoria de segurança em nuvem e cofre de dados', status: 'Válido 2025' },
                { label: 'OSHA Clear Attestation', desc: '0 acidentes de trabalho com afastamento no período', status: 'Sem Autuação' },
                { label: 'Telemetria FIPE & Sascar', desc: 'Rastreadores homologados e monitoramento térmico', status: 'Ativo' },
              ].map((comp) => (
                <div key={comp.label} className="p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800/80 text-xs flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1">
                      <span className="text-emerald-400">✓</span> {comp.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{comp.desc}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30 whitespace-nowrap shrink-0">
                    {comp.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Decisor & Contato */}
          <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)] space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Decisor Comercial / Broker Contact
            </h2>
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-white text-sm">{lead.nome}</div>
              <div className="text-slate-400 font-mono text-[11px]">
                Tel: <span className="text-slate-200">{normalizePhoneBR(lead.telefone).formatted}</span>
              </div>
              {lead.email && (
                <div className="text-slate-400 font-mono text-[11px]">
                  Email: <span className="text-slate-200">{lead.email}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* COLUNA 2 (5 Colunas): Pacote Técnico de Subscrição (RFQ Specs & Loss Runs) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card de Parâmetros da Apólice Solicitada */}
          <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)] space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Especificações do Submission Packet
                </h2>
                <p className="text-[11px] text-slate-400">Termos de cobertura e limites para cotação formal</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block font-medium">Prêmio Alvo</span>
                <span className="text-base font-bold font-mono text-white">{formattedPremium}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Ramo Principal (LOB)</span>
                <span className="font-bold text-white">{lead.lob || lead.ramoDesejado}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Vigência Proposta</span>
                <span className="font-bold text-white">12 Meses (Anual)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Limite por Ocorrência</span>
                <span className="font-bold font-mono text-emerald-400">$2,000,000</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Limite Agregado Geral</span>
                <span className="font-bold font-mono text-emerald-400">$5,000,000</span>
              </div>
            </div>

            {/* Diagnóstico da IA */}
            <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="font-semibold text-slate-300">Diagnóstico da Subscrição com IA</span>
                <span className="font-mono text-blue-400">{lead.score}/100 Propensão</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                {lead.resumoIa || 'Lead qualificado com apetite positivo para subscrição imediata.'}
              </p>
            </div>
          </Card>

          {/* Loss Runs (Histórico de Sinistros de 3 Anos) */}
          <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Loss Runs (Histórico de Sinistralidade 36 Meses)
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                Loss Ratio: 0.0% Clean
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-slate-400 font-medium">
                    <th className="py-2 px-2">Ano Base</th>
                    <th className="py-2 px-2">Seguradora</th>
                    <th className="py-2 px-2">Sinistros</th>
                    <th className="py-2 px-2">Total Pago</th>
                    <th className="py-2 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-slate-200">
                  <tr>
                    <td className="py-2 px-2 font-bold text-white">2025/2026</td>
                    <td className="py-2 px-2">Porto Seguro / Chubb</td>
                    <td className="py-2 px-2">0</td>
                    <td className="py-2 px-2">$0.00</td>
                    <td className="py-2 px-2 text-right text-emerald-400">Zero Claims</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-bold text-white">2024/2025</td>
                    <td className="py-2 px-2">Allianz Corporate</td>
                    <td className="py-2 px-2">0</td>
                    <td className="py-2 px-2">$0.00</td>
                    <td className="py-2 px-2 text-right text-emerald-400">Zero Claims</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-bold text-white">2023/2024</td>
                    <td className="py-2 px-2">Tokio Marine</td>
                    <td className="py-2 px-2">1 (Vidro Leve)</td>
                    <td className="py-2 px-2">$420.00</td>
                    <td className="py-2 px-2 text-right text-slate-400">Fechado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Matriz de Apetite em Tempo Real das Seguradoras */}
          <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)] space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Apetite das Seguradoras Parceiras para este Risco
            </h2>
            <div className="space-y-2">
              {carriers.map((car) => (
                <div key={car.name} className="p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{car.name}</span>
                    <span className="text-[10px] text-slate-400 block">{car.focus}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">{car.match}% Match</span>
                    <span className="text-[10px] text-slate-400 block">{car.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* COLUNA 3 (3 Colunas): Transmissor RFQ Automatizado & Histórico de Interações */}
        <div className="lg:col-span-3 space-y-4">
          {/* Painel de Transmissão de RFQ */}
          <Card variant="analytical" className="p-4 bg-[#0d121f] border border-blue-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Motor de Disparo de RFQ
              </h2>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-500/30">
                Carrier API
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase block mb-1">
                  Seguradora Alvo
                </label>
                <select
                  value={selectedCarrierRfq}
                  onChange={(e) => setSelectedCarrierRfq(e.target.value)}
                  className="w-full bg-[#090a0f] border border-zinc-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Chubb">Chubb (98% Apetite)</option>
                  <option value="Progressive">Progressive (94% Apetite)</option>
                  <option value="Travelers">Travelers (92% Apetite)</option>
                  <option value="Liberty Mutual">Liberty Mutual (89% Apetite)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase block mb-1">
                  Limite Solicitado
                </label>
                <select
                  value={selectedLimit}
                  onChange={(e) => setSelectedLimit(e.target.value)}
                  className="w-full bg-[#090a0f] border border-zinc-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="$2,000,000">$2,000,000 Aggregate</option>
                  <option value="$5,000,000">$5,000,000 Aggregate</option>
                  <option value="$10,000,000">$10,000,000 High-Limit</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase block mb-1">
                  Franquia / Retenção
                </label>
                <select
                  value={selectedDeductible}
                  onChange={(e) => setSelectedDeductible(e.target.value)}
                  className="w-full bg-[#090a0f] border border-zinc-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="$2,500">$2,500 Franquia Mínima</option>
                  <option value="$5,000">$5,000 Franquia Reduzida</option>
                  <option value="$10,000">$10,000 Franquia Padrão</option>
                </select>
              </div>

              <Button
                onClick={handleDispatchRfq}
                disabled={transmittingRfq}
                className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md mt-2"
              >
                {transmittingRfq ? 'Transmitindo RFQ...' : `⚡ Disparar RFQ para ${selectedCarrierRfq}`}
              </Button>
            </div>

            {/* Resultado da Cotação Retornada */}
            {rfqResult && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-300 font-bold">✓ Cotação Aprovada</span>
                  <span className="text-slate-400">{rfqResult.rfqReference}</span>
                </div>
                <div className="text-base font-bold font-mono text-white">
                  ${rfqResult.annualRate?.toLocaleString()}/ano
                </div>
                <div className="text-[10px] text-slate-300">
                  Taxa aprovada pela esteira automática de {rfqResult.carrier} sob limite {rfqResult.limit}.
                </div>
              </div>
            )}
          </Card>

          {/* Histórico & Trilha de Auditoria */}
          <Card variant="analytical" className="p-4 bg-[var(--surface-card)] border-[var(--border-subtle)] space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Trilha de Auditoria & Interações
            </h2>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {lead.interacoes && lead.interacoes.length > 0 ? (
                lead.interacoes.map((item) => (
                  <div key={item.id} className="p-2 rounded bg-[#090a0f] border border-zinc-800/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span className="uppercase font-semibold text-blue-400">{item.canal}</span>
                      <span>{new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300 text-xs line-clamp-3">{item.conteudo}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">Nenhuma interação registrada ainda.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modais de Comunicação */}
      <VapiCallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        lead={lead}
        onSuccess={() => {
          fetchLead();
          setCallModalOpen(false);
        }}
      />

      <WhatsAppModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        targetData={lead}
        isLead={true}
        templates={[]}
        brokerName="Sarah Vance"
        brokerOrgName="LeadEngine Brokerage"
        onSuccess={() => {
          fetchLead();
          setWaModalOpen(false);
        }}
      />
    </div>
  );
}
