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
      // Dispara o lead correspondente com status 'em_contato'
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
          notas: `Emissão automática de proposta vinculada: ${currentInsurer.name} (${currentInsurer.total} à vista). FIPE: 100%, RCF: ${currentInsurer.rcf}, Franquia: ${currentInsurer.franquia}.`,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Stitch Design System Badge & Link */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <Badge variant="blue">STITCH DESIGN SYSTEM</Badge>
          <span className="text-slate-300 font-semibold text-[11px]">
            Prime High-Density InsurTech System
          </span>
          <span className="text-slate-500 font-mono text-[10px]">
            (Asset: assets/edbe12754c3a4c419c5e562868743e41)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cockpit Sincronizado
          </span>
          <a
            href="https://stitch.withgoogle.com"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
          >
            Ver no Stitch ↗
          </a>
        </div>
      </div>

      {/* Top Telemetry & Ribbon Bar */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <span>⚡</span> Cockpit Profissional de Cotação & Underwriting
              </span>
              <span className="text-[10px] text-slate-400">
                Multicálculo e Análise de Risco em Tempo Real
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
              <button
                type="button"
                onClick={copyPropostaId}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-700/80 text-[11px] font-mono text-emerald-400 hover:border-emerald-500 transition-colors cursor-pointer"
                title="Copiar ID da Proposta"
              >
                <span>#COT-2026-8941</span>
                <span className="text-[10px] text-slate-400">{copied ? '✓' : '📋'}</span>
              </button>
              <Badge variant="emerald">PRÉ-APROVADO</Badge>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SUSEP Gateway: <strong className="text-emerald-400">Online (42ms)</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
              <span>FIPE: <strong className="text-cyan-400">Jan/2025 v2.4</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
              <span>Sinistralidade: <strong className="text-emerald-400">12% (Baixo)</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
              <span>Score Serasa: <strong className="text-slate-100 font-mono">920/1000</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {emissionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">✓</span>
            <span>{emissionSuccess}</span>
          </div>
          <Button
            size="sm"
            variant="emerald"
            onClick={() => (window.location.href = '/dashboard/leads')}
          >
            Acompanhar no Painel de Leads →
          </Button>
        </div>
      )}

      {/* 3-Column Analytical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Underwriting & Driver Risk (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Perfil do Proponente */}
          <Card>
            <CardHeader className="p-3.5 pb-2">
              <CardTitle className="text-xs flex items-center justify-between">
                <span>👤 Perfil do Proponente</span>
                <Badge variant="blue">Classe 07</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0 space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Nome Completo</span>
                <span className="text-slate-100 font-medium">Rodrigo Silveira Mendonça</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">CPF</span>
                  <span className="text-slate-200 font-mono text-[11px]">***.482.918-**</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Idade / Est. Civil</span>
                  <span className="text-slate-200 text-[11px]">38 anos, Casado</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">CEP Pernoite</span>
                <span className="text-slate-200 text-[11px]">04578-000 (Brooklin, SP)</span>
                <span className="block text-[10px] text-emerald-400">Zona A (Baixa incidência de roubo)</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Veículo & Dispositivos */}
          <Card>
            <CardHeader className="p-3.5 pb-2">
              <CardTitle className="text-xs flex items-center justify-between">
                <span>🚗 Veículo & Telemetria</span>
                <Badge variant="emerald">-15% Rastreador</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0 space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Modelo / Ano</span>
                <span className="text-slate-100 font-medium">Jeep Compass Longitude 1.3</span>
                <span className="text-slate-400 text-[11px] block">2024 / 2024 Turbo Flex</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">FIPE</span>
                  <span className="text-emerald-400 font-mono font-bold text-[12px]">R$ 168.450</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Placa</span>
                  <span className="text-slate-200 font-mono text-[11px]">BRA2E19</span>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Garagem automática fechada (residência e trabalho)</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Coberturas Rápidas */}
          <Card>
            <CardHeader className="p-3.5 pb-2">
              <CardTitle className="text-xs">🛡️ Coberturas Contratadas</CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">100% Tabela FIPE (Casco)</span>
                <Switch checked={coberturaFipe} onCheckedChange={setCoberturaFipe} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">RCF-V Terceiros R$ 500k</span>
                <Switch checked={rcfTerceiros} onCheckedChange={setRcfTerceiros} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Carro Reserva 30d SUV</span>
                <Switch checked={carroReserva30d} onCheckedChange={setCarroReserva30d} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Vidros VIP & Faróis</span>
                <Switch checked={vidrosVip} onCheckedChange={setVidrosVip} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Guincho 24h Ilimitado</span>
                <Switch checked={guinchoIlimitado} onCheckedChange={setGuinchoIlimitado} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER COLUMN: Multi-Insurer Rate Matrix (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border-slate-800">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">📊 Matriz Comparativa Multicálculo</CardTitle>
                <CardDescription className="text-xs">
                  5 seguradoras homologadas com cotação em tempo real
                </CardDescription>
              </div>
              <Badge variant="cyan">Circular SUSEP 621</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seguradora</TableHead>
                    <TableHead>Franquia</TableHead>
                    <TableHead>Assistência</TableHead>
                    <TableHead className="text-right">Mensalidade</TableHead>
                    <TableHead className="text-right">À Vista</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insurers.map((item) => {
                    const isSelected = selectedInsurer === item.name;
                    return (
                      <TableRow
                        key={item.id}
                        onClick={() => setSelectedInsurer(item.name)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-950/40 border-l-2 border-l-blue-500 hover:bg-blue-950/50'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-100">{item.name}</span>
                              {item.isBest && (
                                <Badge variant="emerald" className="text-[9px] px-1.5 py-0">
                                  ⭐ RECOMENDADA
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">SUSEP {item.susep} • Match {item.match}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-slate-200 text-[11px] block">{item.franquia}</span>
                          <span className="text-[10px] text-slate-400">{item.franquiaTipo}</span>
                        </TableCell>
                        <TableCell className="text-[11px] text-slate-300 max-w-[140px] truncate">
                          {item.assistencia}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-slate-100 text-[12px]">
                          12x {item.mensal}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono font-bold text-emerald-400 text-[12px] block">
                            {item.total}
                          </span>
                          <span className="text-[9px] text-emerald-300 font-semibold">{item.descontoPix}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SLA & Speed-to-Lead Callout */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-base">🛡️</span>
              <span>
                Cotações válidas por <strong>48 horas</strong>. Transmissão 100% digital com certificação ICP-Brasil.
              </span>
            </div>
            <Badge variant="secondary">SLA: 15 min</Badge>
          </div>
        </div>

        {/* RIGHT COLUMN: Proposal Summary & Binding (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950">
            <CardHeader className="p-4 pb-2 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">PROPOSTA SELECIONADA</Badge>
                <span className="text-xs text-slate-400 font-mono">{currentInsurer.match} Match</span>
              </div>
              <CardTitle className="text-base text-white mt-1">{currentInsurer.name}</CardTitle>
              <CardDescription className="text-xs text-emerald-400">
                Plano Compreensivo Premium
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Financial Breakdown */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Prêmio Líquido:</span>
                  <span className="font-mono text-slate-200">R$ 2.540,15</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IOF (7,38%):</span>
                  <span className="font-mono text-slate-200">R$ 187,46</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Desconto Comercial:</span>
                  <span className="font-mono text-emerald-400">- R$ 200,00</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="font-bold text-slate-100">Total à Vista (PIX):</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    {currentInsurer.total}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Parcelado:</span>
                  <span className="font-mono text-slate-200">12x de {currentInsurer.mensal} s/ juros</span>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1 text-[10px] text-slate-300">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span>✓</span>
                  <span>CPF Regular na Receita Federal</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span>✓</span>
                  <span>Vistoria Prévia Dispensada</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span>✓</span>
                  <span>Aceitação Automática SUSEP 100%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  variant="emerald"
                  size="default"
                  className="w-full"
                  disabled={submitting}
                  onClick={handleEmitirProposta}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Transmitindo...
                    </>
                  ) : (
                    <>
                      <span>⚡</span> Emitir Proposta & Transmitir
                    </>
                  )}
                </Button>

                <Button
                  variant="blue"
                  size="default"
                  className="w-full"
                  onClick={() => {
                    const msg = encodeURIComponent(
                      `Olá Rodrigo! Segue a cotação aprovada da ${currentInsurer.name}: 12x de ${currentInsurer.mensal} ou ${currentInsurer.total} à vista. Deseja que eu emita a apólice?`
                    );
                    window.open(`https://wa.me/5511984521920?text=${msg}`, '_blank');
                  }}
                >
                  <span>💬</span> Enviar Proposta via WhatsApp
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  className="w-full"
                  onClick={() => {
                    alert('Disparo automático do agente de voz Vapi.ai acionado para Rodrigo Silveira Mendonça!');
                  }}
                >
                  <span>🎙️</span> Fechamento Assistido por Voz (Vapi)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
