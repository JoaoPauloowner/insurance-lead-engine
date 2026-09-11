'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';

export default function CotacaoCockpitPage() {
  const [selectedInsurer, setSelectedInsurer] = useState('Porto Seguro');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emissionSuccess, setEmissionSuccess] = useState<string | null>(null);

  // Coberturas toggles
  const [coberturaFipe, setCoberturaFipe] = useState(true);
  const [rcfTerceiros, setRcfTerceiros] = useState(true);
  const [carroReserva30d, setCarroReserva30d] = useState(true);
  const [vidrosVip, setVidrosVip] = useState(true);
  const [guinchoIlimitado, setGuinchoIlimitado] = useState(true);

  const insurers = [
    {
      id: 'porto',
      name: 'Porto Seguro',
      susep: '05886',
      match: '98%',
      isBest: true,
      casco: '100% FIPE (R$ 168.450)',
      rcf: 'R$ 500k Terceiros',
      franquia: 'R$ 2.850,00',
      franquiaTipo: 'Reduzida 50%',
      assistencia: 'Guincho Sem Limite de KM + Carro 30d SUV',
      mensal: 'R$ 247,90',
      total: 'R$ 2.677,32',
      descontoPix: '-10% PIX',
    },
    {
      id: 'tokio',
      name: 'Tokio Marine',
      susep: '06190',
      match: '94%',
      isBest: false,
      casco: '100% FIPE',
      rcf: 'R$ 300k Terceiros',
      franquia: 'R$ 3.920,00',
      franquiaTipo: 'Normal',
      assistencia: 'Guincho até 500 km + Carro 7d',
      mensal: 'R$ 229,15',
      total: 'R$ 2.474,80',
      descontoPix: '-8% PIX',
    },
    {
      id: 'allianz',
      name: 'Allianz Seguros',
      susep: '05177',
      match: '91%',
      isBest: false,
      casco: '100% FIPE',
      rcf: 'R$ 400k Terceiros',
      franquia: 'R$ 2.990,00',
      franquiaTipo: 'Reduzida',
      assistencia: 'Guincho 1.000 km + Carro 15d SUV',
      mensal: 'R$ 265,40',
      total: 'R$ 2.866,32',
      descontoPix: '-5% PIX',
    },
    {
      id: 'bradesco',
      name: 'Bradesco Auto',
      susep: '05312',
      match: '89%',
      isBest: false,
      casco: '100% FIPE',
      rcf: 'R$ 350k Terceiros',
      franquia: 'R$ 3.450,00',
      franquiaTipo: 'Normal',
      assistencia: 'Guincho até 400 km + Carro 15d',
      mensal: 'R$ 252,10',
      total: 'R$ 2.722,68',
      descontoPix: '-7% PIX',
    },
    {
      id: 'hdi',
      name: 'HDI Seguros',
      susep: '06572',
      match: '87%',
      isBest: false,
      casco: '100% FIPE',
      rcf: 'R$ 300k Terceiros',
      franquia: 'R$ 3.680,00',
      franquiaTipo: 'Normal',
      assistencia: 'Guincho até 300 km + Carro 7d',
      mensal: 'R$ 238,80',
      total: 'R$ 2.579,00',
      descontoPix: '-6% PIX',
    },
  ];

  const currentInsurer = insurers.find((i) => i.name === selectedInsurer) || insurers[0];

  const copyPropostaId = () => {
    navigator.clipboard.writeText('COT-2026-8941');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEmitirProposta = async () => {
    setSubmitting(true);
    setEmissionSuccess(null);

    try {
      const res = await fetch('/api/leads/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: 'Rodrigo Silveira Mendonça',
          telefone: '11984521920',
          email: 'rodrigo.mendonca@engenharia.com.br',
          origem: `Cockpit de Cotação - ${currentInsurer.name}`,
          ramoDesejado: 'Auto',
          urgencia: 'alta',
          notas: `Emissão de proposta vinculada: ${currentInsurer.name} (${currentInsurer.total} à vista). FIPE: 100%, RCF: ${currentInsurer.rcf}, Franquia: ${currentInsurer.franquia}.`,
        }),
      });

      if (res.ok) {
        setEmissionSuccess(`Proposta transmitida com sucesso para ${currentInsurer.name}! Apólice digital em geração.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* Top Header & Telemetry Bar */}
      <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-3.5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  Cockpit de Cotação & Subscrição
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Pré-aprovado
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Multicálculo técnico e análise de risco veicular
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-2 border-l border-zinc-800 pl-3">
              <button
                type="button"
                onClick={copyPropostaId}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#090a0f] border border-zinc-700/80 text-[11px] font-mono text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer active-press"
                title="Copiar ID da Proposta"
              >
                <span>#COT-2026-8941</span>
                <span className="text-[10px] text-zinc-400">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#090a0f] border border-zinc-800 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>SUSEP Gateway: <strong className="text-emerald-400 font-medium">Online</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#090a0f] border border-zinc-800 text-zinc-300">
              <span>Tabela FIPE: <strong className="text-zinc-100 font-medium">Jan/2025</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#090a0f] border border-zinc-800 text-zinc-300">
              <span>Sinistralidade: <strong className="text-emerald-400 font-medium">12% (Baixa)</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#090a0f] border border-zinc-800 text-zinc-300">
              <span>Serasa Score: <strong className="text-white font-mono">920</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {emissionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{emissionSuccess}</span>
          </div>
          <Button
            size="sm"
            variant="emerald"
            onClick={() => (window.location.href = '/dashboard/leads')}
          >
            Acompanhar na esteira de leads
          </Button>
        </div>
      )}

      {/* 3-Column Analytical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Underwriting & Driver Risk (3 cols) */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card 1: Perfil do Proponente */}
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-white">Perfil do Proponente</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
                Classe 07
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-zinc-500 block">Nome completo</span>
                <span className="text-zinc-200 font-medium">Rodrigo Silveira Mendonça</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-zinc-500 block">CPF</span>
                  <span className="text-zinc-300 font-mono text-[11px]">***.482.918-**</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 block">Idade / Perfil</span>
                  <span className="text-zinc-300 text-[11px]">38 anos, Casado</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 block">CEP Pernoite</span>
                <span className="text-zinc-300 text-[11px]">04578-000 (Brooklin, SP)</span>
                <span className="block text-[11px] text-emerald-400 mt-0.5">Zona A — Baixo índice de furto</span>
              </div>
            </div>
          </div>

          {/* Card 2: Veículo & Dispositivos */}
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-white">Veículo & Telemetria</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                Rastreador Ativo
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-zinc-500 block">Modelo / Ano</span>
                <span className="text-zinc-200 font-medium">Jeep Compass Longitude 1.3</span>
                <span className="text-zinc-400 text-[11px] block">2024 Turbo Flex</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-zinc-500 block">Valor FIPE</span>
                  <span className="text-white font-mono font-bold text-xs">R$ 168.450</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 block">Placa</span>
                  <span className="text-zinc-300 font-mono text-xs">BRA2E19</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Coberturas Rápidas */}
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-4 shadow-sm space-y-3">
            <div className="pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-white">Cláusulas de Cobertura</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">100% FIPE (Casco)</span>
                <Switch checked={coberturaFipe} onCheckedChange={setCoberturaFipe} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">RCF-V Terceiros R$ 500k</span>
                <Switch checked={rcfTerceiros} onCheckedChange={setRcfTerceiros} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Carro Reserva 30d SUV</span>
                <Switch checked={carroReserva30d} onCheckedChange={setCarroReserva30d} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Vidros VIP & Faróis</span>
                <Switch checked={vidrosVip} onCheckedChange={setVidrosVip} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Guincho 24h Ilimitado</span>
                <Switch checked={guinchoIlimitado} onCheckedChange={setGuinchoIlimitado} />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Multi-Insurer Rate Matrix (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white">Matriz Comparativa Multicálculo</h3>
                <p className="text-[11px] text-zinc-400">5 seguradoras homologadas com cotação em tempo real</p>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Circular SUSEP 621
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#090a0f]/60 text-xs font-medium text-zinc-400">
                    <th className="py-2.5 px-3">Seguradora</th>
                    <th className="py-2.5 px-3">Franquia</th>
                    <th className="py-2.5 px-3">Assistência</th>
                    <th className="py-2.5 px-3 text-right">Mensalidade</th>
                    <th className="py-2.5 px-3 text-right">À Vista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {insurers.map((item) => {
                    const isSelected = selectedInsurer === item.name;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedInsurer(item.name)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-950/20 border-l-2 border-l-blue-500'
                            : 'hover:bg-zinc-800/30'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-zinc-100">{item.name}</span>
                              {item.isBest && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                  Recomendada
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              SUSEP {item.susep} • Match {item.match}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-zinc-200 text-[11px] block">{item.franquia}</span>
                          <span className="text-[10px] text-zinc-500">{item.franquiaTipo}</span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-zinc-400 max-w-[130px] truncate">
                          {item.assistencia}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-zinc-200 text-xs">
                          12x {item.mensal}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-white text-xs block">
                            {item.total}
                          </span>
                          <span className="text-[10px] text-emerald-400">{item.descontoPix}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validated SLA Callout */}
          <div className="p-3 rounded-lg bg-[#10121a] border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Validade de proposta: 48 horas com certificação digital ICP-Brasil.</span>
            </div>
            <span className="font-mono text-zinc-300">SLA: 15 min</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Proposal Summary & Binding (3 cols) */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-4 shadow-sm space-y-3.5">
            <div className="pb-3 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Opção Selecionada</span>
                <span className="text-xs text-zinc-400 font-mono">{currentInsurer.match} compatibilidade</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">{currentInsurer.name}</h4>
              <p className="text-xs text-zinc-400">Plano Compreensivo Completo</p>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Prêmio Líquido:</span>
                <span className="font-mono text-zinc-200">R$ 2.540,15</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>IOF (7,38%):</span>
                <span className="font-mono text-zinc-200">R$ 187,46</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Desconto Comercial:</span>
                <span className="font-mono text-emerald-400">- R$ 200,00</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="font-semibold text-zinc-200">Total à Vista (PIX):</span>
                <span className="font-mono font-bold text-white text-base">
                  {currentInsurer.total}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Parcelamento:</span>
                <span className="font-mono text-zinc-300">12x de {currentInsurer.mensal}</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 space-y-1.5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>CPF Regular na Receita Federal</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Vistoria Prévia Dispensada</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Aceitação Automática SUSEP 100%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Button
                variant="emerald"
                size="default"
                className="w-full active-press font-semibold"
                disabled={submitting}
                onClick={handleEmitirProposta}
              >
                {submitting ? 'Transmitindo...' : 'Transmitir Proposta'}
              </Button>

              <Button
                variant="blue"
                size="default"
                className="w-full active-press"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá Rodrigo! Segue a cotação aprovada da ${currentInsurer.name}: 12x de ${currentInsurer.mensal} ou ${currentInsurer.total} à vista. Deseja que eu emita a apólice?`
                  );
                  window.open(`https://wa.me/5511984521920?text=${msg}`, '_blank');
                }}
              >
                Enviar por WhatsApp
              </Button>

              <Button
                variant="outline"
                size="default"
                className="w-full active-press text-zinc-300 border-zinc-700"
                onClick={() => {
                  alert('Agendamento de chamada assistida para Rodrigo Silveira Mendonça.');
                }}
              >
                Atendimento por Voz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
