'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SimuladorPage() {
  const [segmento, setSegmento] = useState('auto');
  const [nome, setNome] = useState('Rodrigo Silveira Mendonça');
  const [telefone, setTelefone] = useState('(11) 98452-1920');
  const [veiculo, setVeiculo] = useState('Jeep Compass Longitude 1.3 T270');
  const [ano, setAno] = useState('2023 / 2024');
  const [placa, setPlaca] = useState('BRA2E19');
  const [cep, setCep] = useState('04578-000');

  // Coberturas
  const [coberturaFipe, setCoberturaFipe] = useState(true);
  const [danosTerceiros, setDanosTerceiros] = useState(true);
  const [carroReserva, setCarroReserva] = useState(true);
  const [vidrosFarois, setVidrosFarois] = useState(true);
  const [guinchoIlimitado, setGuinchoIlimitado] = useState(true);

  // Status de Envio
  const [submitting, setSubmitting] = useState(false);
  const [leadResult, setLeadResult] = useState<any | null>(null);
  const [selectedSeguradora, setSelectedSeguradora] = useState('Porto Seguro');

  const handleSubmitSimulacao = async (seguradoraEscolhida: string) => {
    try {
      setSubmitting(true);
      setSelectedSeguradora(seguradoraEscolhida);

      const notasSimulacao = `Cotação Simulada: ${veiculo} (${ano}), Placa: ${placa}, Seguradora: ${seguradoraEscolhida}. FIPE: ${coberturaFipe ? 'Sim' : 'Não'}, Terceiros R$300k: ${danosTerceiros ? 'Sim' : 'Não'}, Carro Reserva: ${carroReserva ? 'Sim' : 'Não'}`;

      const res = await fetch('/api/leads/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          telefone,
          origem: `Simulador Web - ${seguradoraEscolhida}`,
          ramoDesejado: segmento === 'auto' ? 'Auto' : 'Empresarial',
          urgencia: 'alta',
          notas: notasSimulacao,
        }),
      });

      const data = await res.json();
      setLeadResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Simulador Multicálculo
              </span>
              <span className="text-xs text-zinc-400">Tempo de resposta da esteira: &lt; 45s</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Simulador Técnico de Cotações
            </h1>
            <p className="text-zinc-400 text-xs mt-0.5">
              Parametrização veicular, comparação de coberturas homologadas e disparo para a esteira de atendimento.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10121a] border border-zinc-800 text-xs text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Conformidade SUSEP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10121a] border border-zinc-800 text-xs text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Criptografia 256-bit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Alert if Triggered */}
      {leadResult && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
              ✓
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                Lead Ingerido com Sucesso no Sistema
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500 text-emerald-950 font-bold">
                  Score {leadResult.lead?.score || 100}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Seguradora selecionada: <strong>{selectedSeguradora}</strong> | Telefone: <strong>{leadResult.lead?.telefone}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/leads"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm active-press"
            >
              Ver na Esteira de Leads
            </Link>
          </div>
        </div>
      )}

      {/* Two-Column Grid: Configurator Left, Comparison Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Configurator Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h2 className="text-xs font-semibold text-white">
                Parâmetros da Simulação
              </h2>
              <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                FIPE Jan/2025
              </span>
            </div>

            {/* Segment Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#090a0f] p-1 rounded-lg border border-zinc-800 mb-5">
              {[
                { id: 'auto', label: 'Automóvel' },
                { id: 'frota', label: 'Frota' },
                { id: 'residencial', label: 'Imóvel' },
                { id: 'vida', label: 'Vida' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSegmento(tab.id)}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer active-press text-center ${
                    segmento === tab.id
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Nome do proponente
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Telefone de contato
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    CEP Pernoite
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Modelo do veículo
                </label>
                <input
                  type="text"
                  value={veiculo}
                  onChange={(e) => setVeiculo(e.target.value)}
                  className="w-full bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Ano / Fabricação
                  </label>
                  <input
                    type="text"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="w-full bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Placa do veículo
                  </label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="w-full bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono uppercase focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              </div>

              {/* Coverage Toggles */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <span className="block text-xs font-medium text-zinc-400 mb-2">
                  Coberturas adicionais
                </span>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">100% Tabela FIPE (Compreensiva)</span>
                    <span className="text-[11px] text-zinc-500">Colisão, Incêndio, Roubo e Alagamento</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={coberturaFipe}
                    onChange={(e) => setCoberturaFipe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">Danos Terceiros (RCF R$ 300.000)</span>
                    <span className="text-[11px] text-zinc-500">Danos materiais e corporais</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={danosTerceiros}
                    onChange={(e) => setDanosTerceiros(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">Carro Reserva Plus (15 dias)</span>
                    <span className="text-[11px] text-zinc-500">Categoria Sedã Médio com Ar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={carroReserva}
                    onChange={(e) => setCarroReserva(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">Vidros, Faróis e Retrovisores</span>
                    <span className="text-[11px] text-zinc-500">Inclui película protetora</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={vidrosFarois}
                    onChange={(e) => setVidrosFarois(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">Assistência 24h Guincho Ilimitado</span>
                    <span className="text-[11px] text-zinc-500">Território nacional sem limite de km</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={guinchoIlimitado}
                    onChange={(e) => setGuinchoIlimitado(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-zinc-900 border-zinc-700"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Insurer Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white">
              Cotações Disponíveis
            </h2>
            <span className="text-xs text-zinc-500 font-mono">3 seguradoras compatíveis</span>
          </div>

          {/* Card 1: Porto Seguro (Featured) */}
          <div className="relative bg-[#10121a] border border-zinc-700 rounded-xl p-5 shadow-sm">
            <div className="absolute top-0 right-0 bg-emerald-500 text-emerald-950 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              Recomendação Técnica
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">Porto Seguro</span>
                  <span className="text-[10px] text-zinc-500 font-mono">SUSEP 05886</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Franquia Reduzida: <strong className="text-zinc-200">R$ 2.850,00</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-400 tabular-nums">
                  12x R$ 247,90
                </span>
                <span className="block text-[11px] text-zinc-500 font-mono">ou R$ 2.677,32 à vista</span>
              </div>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 mb-5">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Guincho ilimitado e socorro 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Carro Reserva categoria Sedã Médio</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Desconto Centro Automotivo Porto</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Vidros completos e retrovisores</span>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitSimulacao('Porto Seguro')}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors active-press cursor-pointer disabled:opacity-50"
            >
              {submitting && selectedSeguradora === 'Porto Seguro' ? 'Enviando para esteira...' : 'Selecionar Porto Seguro e Contatar'}
            </button>
          </div>

          {/* Card 2: Tokio Marine */}
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Tokio Marine Seguradora</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    94% compatibilidade
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Franquia Normal: R$ 3.920,00
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-zinc-200 tabular-nums">12x R$ 229,15</span>
                <span className="block text-[11px] text-zinc-500 font-mono">R$ 2.474,80 à vista</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-zinc-400">
                Assistência 24h até 500 km • Carro reserva 7 dias
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitSimulacao('Tokio Marine')}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700 cursor-pointer active-press"
              >
                Selecionar Tokio Marine
              </button>
            </div>
          </div>

          {/* Card 3: Allianz */}
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Allianz Seguros</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    91% compatibilidade
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Franquia Reduzida: R$ 2.990,00
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-zinc-200 tabular-nums">12x R$ 265,40</span>
                <span className="block text-[11px] text-zinc-500 font-mono">R$ 2.866,32 à vista</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-zinc-400">
                Atendimento Premier • Carro reserva 15 dias SUV • Guincho 1.000 km
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitSimulacao('Allianz')}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700 cursor-pointer active-press"
              >
                Selecionar Allianz
              </button>
            </div>
          </div>

          {/* Standard SLA Notice */}
          <div className="p-3 rounded-lg bg-[#10121a] border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
            <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <strong className="text-zinc-200 block font-medium">Atendimento Integrado</strong>
              <span>
                Ao selecionar qualquer opção, as condições são enviadas para a esteira e o corretor responsável é notificado para prosseguir com a emissão.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
