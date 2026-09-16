'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import PropostaPdfModal from '@/components/PropostaPdfModal';

export default function CotacaoCockpitPage() {
  const [selectedInsurer, setSelectedInsurer] = useState('Porto Seguro');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emissionSuccess, setEmissionSuccess] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

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
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Top Header & Telemetry Bar */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[var(--text)] tracking-tight">
                  Cockpit de Cotação Multisseguradoras
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Cotação Ativa
                </span>
              </div>
              <span className="text-xs text-[var(--text-mute)]">
                Cálculo comparativo instantâneo entre as principais seguradoras do mercado brasileiro
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-2 border-l border-[var(--border)] pl-3">
              <button
                type="button"
                onClick={copyPropostaId}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--text)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                title="Copiar ID da Proposta"
              >
                <span>#COT-2026-8941</span>
                <span className="text-[10px] text-[var(--text-mute)]">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Gateway Seguradoras: <strong className="text-emerald-700 font-semibold">Online</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]">
              <span>Tabela FIPE: <strong className="text-[var(--text)] font-semibold">Vigente</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]">
              <span>Sinistralidade: <strong className="text-emerald-700 font-semibold">Baixa (Bônus 7)</strong></span>
            </div>
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold transition-colors shadow-2xs cursor-pointer ml-auto"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Visualizar Proposta em PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {emissionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{emissionSuccess}</span>
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            onClick={() => (window.location.href = '/dashboard/leads')}
          >
            Ver na esteira de leads
          </Button>
        </div>
      )}

      {/* 3-Column Analytical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Proponente & Veículo (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Perfil do Proponente */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text)]">Proponente</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[var(--purple)] font-semibold border border-blue-200">
                Classe Bônus 7
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-[var(--text-mute)] block">Nome</span>
                <span className="text-[var(--text)] font-semibold">Rodrigo Silveira Mendonça</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-[var(--text-mute)] block">CPF</span>
                  <span className="text-[var(--text)] font-mono text-[11px]">***.482.918-**</span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--text-mute)] block">Idade</span>
                  <span className="text-[var(--text)] text-[11px]">38 anos, Casado</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-[var(--text-mute)] block">CEP Pernoite</span>
                <span className="text-[var(--text)] text-[11px]">04578-000 (Brooklin, SP)</span>
                <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">Garagem fechada em condomínio</span>
              </div>
            </div>
          </div>

          {/* Card 2: Veículo */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text)]">Veículo Segurado</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Rastreador Ativo
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-[var(--text-mute)] block">Modelo / Ano</span>
                <span className="text-[var(--text)] font-semibold">Jeep Compass Longitude 1.3</span>
                <span className="text-[var(--text-mute)] text-[11px] block">2024 Turbo Flex</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-[var(--text-mute)] block">Valor FIPE</span>
                  <span className="text-[var(--text)] font-mono font-bold text-xs">R$ 168.450</span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--text-mute)] block">Placa</span>
                  <span className="text-[var(--text)] font-mono text-xs">BRA2E19</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Coberturas Selecionadas */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <div className="pb-2 border-b border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text)]">Cláusulas & Coberturas</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text)]">100% FIPE (Casco)</span>
                <Switch checked={coberturaFipe} onCheckedChange={setCoberturaFipe} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text)]">RCF-V Danos Materiais R$ 500k</span>
                <Switch checked={rcfTerceiros} onCheckedChange={setRcfTerceiros} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text)]">Carro Reserva 30d SUV</span>
                <Switch checked={carroReserva30d} onCheckedChange={setCarroReserva30d} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text)]">Vidros VIP + Faróis</span>
                <Switch checked={vidrosVip} onCheckedChange={setVidrosVip} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text)]">Guincho 24h Ilimitado</span>
                <Switch checked={guinchoIlimitado} onCheckedChange={setGuinchoIlimitado} />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Multi-Insurer Rate Matrix (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
              <div>
                <h3 className="text-xs font-bold text-[var(--text)]">Comparativo Multisseguradoras</h3>
                <p className="text-xs text-[var(--text-mute)]">Porto Seguro, Tokio Marine, Allianz, Bradesco e HDI</p>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-mute)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                Tabela Oficial
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[#fbf9f9] text-xs font-semibold text-[var(--text-mute)]">
                    <th className="py-3 px-3">Seguradora</th>
                    <th className="py-3 px-3">Franquia</th>
                    <th className="py-3 px-3">Assistência</th>
                    <th className="py-3 px-3 text-right">Mensalidade</th>
                    <th className="py-3 px-3 text-right">À Vista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9e8e7]">
                  {insurers.map((item) => {
                    const isSelected = selectedInsurer === item.name;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedInsurer(item.name)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/60 border-l-4 border-l-[#275ba5]'
                            : 'hover:bg-[var(--surface)]'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[var(--text)]">{item.name}</span>
                              {item.isBest && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                  Mais Vendida
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--text-mute)] font-mono">
                              SUSEP {item.susep} • Match {item.match}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[var(--text)] text-xs block font-medium">{item.franquia}</span>
                          <span className="text-[10px] text-[var(--text-mute)]">{item.franquiaTipo}</span>
                        </td>
                        <td className="py-3 px-3 text-xs text-[var(--text-mute)] max-w-[130px] truncate">
                          {item.assistencia}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[var(--text)] text-xs">
                          12x {item.mensal}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-[var(--text)] text-xs block">
                            {item.total}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">{item.descontoPix}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validated SLA Callout */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-mute)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Proposta válida por 48 horas com congelamento de taxa garantido.</span>
            </div>
            <span className="font-medium text-[var(--text)]">Emissão Imediata</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Proposal Summary & Binding (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3.5">
            <div className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-mute)]">Opção Escolhida</span>
                <span className="text-xs text-[var(--purple)] font-semibold">{currentInsurer.match} Fit</span>
              </div>
              <h4 className="text-base font-bold text-[var(--text)] mt-1">{currentInsurer.name}</h4>
              <p className="text-xs text-[var(--text-mute)]">Plano Compreensivo Completo</p>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[var(--text-mute)]">
                <span>Prêmio Líquido:</span>
                <span className="font-mono text-[var(--text)]">R$ 2.540,15</span>
              </div>
              <div className="flex justify-between text-[var(--text-mute)]">
                <span>IOF (7,38%):</span>
                <span className="font-mono text-[var(--text)]">R$ 187,46</span>
              </div>
              <div className="flex justify-between text-[var(--text-mute)]">
                <span>Desconto Comercial:</span>
                <span className="font-mono text-emerald-700 font-medium">- R$ 200,00</span>
              </div>
              <div className="pt-2 border-t border-[var(--border)] flex justify-between items-baseline">
                <span className="font-bold text-[var(--text)]">Total à Vista (PIX):</span>
                <span className="font-mono font-bold text-[var(--text)] text-base">
                  {currentInsurer.total}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-mute)]">
                <span>Cartão de Crédito:</span>
                <span className="font-mono text-[var(--text)]">12x de {currentInsurer.mensal}</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5 text-xs text-[var(--text-mute)]">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>CPF Regular na Receita Federal</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Vistoria Prévia Dispensada</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Aceitação Automática</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                <span>Visualizar Proposta em PDF</span>
              </button>

              <button
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá Rodrigo! Segue a cotação aprovada da ${currentInsurer.name}: 12x de ${currentInsurer.mensal} sem juros ou ${currentInsurer.total} com desconto no PIX. Deseja que eu formalize a apólice agora?`
                  );
                  window.open(`https://wa.me/5511984521920?text=${msg}`, '_blank');
                }}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Enviar Cotação por WhatsApp</span>
              </button>

              <button
                disabled={submitting}
                onClick={handleEmitirProposta}
                className="w-full py-2.5 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[var(--border)] disabled:opacity-50"
              >
                <span>{submitting ? 'Emitindo...' : 'Emitir Proposta Formal'}</span>
              </button>

              <button
                onClick={() => {
                  alert('Agendamento de ligação para Rodrigo Silveira Mendonça.');
                }}
                className="w-full py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-xs font-medium transition-colors cursor-pointer"
              >
                Ligar para o Cliente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Proposta Comercial PDF Modal */}
      <PropostaPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        selectedInsurer={currentInsurer}
        allInsurers={insurers}
        proponente={{
          nome: 'Rodrigo Silveira Mendonça',
          cpf: '***.482.918-**',
          telefone: '(11) 98452-1920',
          email: 'rodrigo.mendonca@engenharia.com.br',
          cep: '04578-000 (Brooklin, SP)',
          veiculo: 'Jeep Compass Longitude 1.3 Turbo Flex',
          anoModelo: '2024 / 2024',
          fipeValor: 'R$ 168.450',
          placa: 'BRA2E19',
        }}
        coberturas={{
          fipe: coberturaFipe,
          rcf: rcfTerceiros,
          carroReserva: carroReserva30d,
          vidros: vidrosVip,
          guincho: guinchoIlimitado,
        }}
      />
    </div>
  );
}
