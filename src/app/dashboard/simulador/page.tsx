'use client';

import React, { useState } from 'react';

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

      const notasSimulacao = `Cotação Online Direta: ${veiculo} (${ano}), Placa: ${placa}, Seguradora Preferida: ${seguradoraEscolhida}. FIPE: ${coberturaFipe ? 'Sim' : 'Não'}, Terceiros R$300k: ${danosTerceiros ? 'Sim' : 'Não'}, Carro Reserva: ${carroReserva ? 'Sim' : 'Não'}`;

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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">

      {/* Header & Badges */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                IA SIMULATION RADAR
              </span>
              <span className="text-xs text-slate-400">Tempo Médio de Resposta: 45s</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Simulador Inteligente de Cotações com IA
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure os parâmetros do seguro, compare coberturas em tempo real e dispare atendimento automático via Voz AI & WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="text-emerald-400">🛡️</span>
              <span>Certificado SUSEP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="text-blue-400">🔒</span>
              <span>Criptografia 256-bit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Alert if Triggered */}
      {leadResult && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                Lead Ingerido com Sucesso no Lead Engine!
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-extrabold">
                  SCORE {leadResult.lead?.score || 100} — HOT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Seguradora escolhida: <strong>{selectedSeguradora}</strong> | Telefone: <strong>{leadResult.lead?.telefone}</strong>
              </p>
              <p className="text-[11px] text-emerald-400/90 mt-1">
                {leadResult.lead?.vapiCallTriggered
                  ? '🎙️ Chamada de Voz com Agente de IA Vapi.ai disparada automaticamente!'
                  : '💬 WhatsApp conversacional pronto para envio.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard/leads"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Ver no Painel de Leads →
            </a>
          </div>
        </div>
      )}

      {/* Two-Column Grid: Configurator Left, Comparison Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configurator Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>⚙️</span> Parâmetros da Cotação
              </h2>
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                FIPE Jan/2025
              </span>
            </div>

            {/* Segment Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/[0.06] mb-6">
              {[
                { id: 'auto', label: 'Auto', icon: '🚗' },
                { id: 'frota', label: 'Frota', icon: '🚛' },
                { id: 'residencial', label: 'Imóvel', icon: '🏠' },
                { id: 'vida', label: 'Vida', icon: '❤️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSegmento(tab.id)}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                    segmento === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nome do Proponente
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[#030712] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    WhatsApp (E.164)
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-[#030712] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    CEP Pernoite
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full bg-[#030712] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Modelo do Veículo
                </label>
                <input
                  type="text"
                  value={veiculo}
                  onChange={(e) => setVeiculo(e.target.value)}
                  className="w-full bg-[#030712] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Ano / Modelo
                  </label>
                  <input
                    type="text"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="w-full bg-[#030712] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Placa (Mercosul)
                  </label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="w-full bg-[#030712] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Coverage Toggles */}
              <div className="pt-3 border-t border-white/[0.08] space-y-3">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Coberturas & Cláusulas
                </span>

                <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] cursor-pointer hover:border-white/[0.14] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200">100% Tabela FIPE (Compreensiva)</span>
                    <span className="text-[10px] text-slate-400">Colisão, Incêndio, Roubo e Alagamento</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={coberturaFipe}
                    onChange={(e) => setCoberturaFipe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-black border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] cursor-pointer hover:border-white/[0.14] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200">Danos Terceiros (RCF R$ 300.000)</span>
                    <span className="text-[10px] text-slate-400">Danos materiais e corporais</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={danosTerceiros}
                    onChange={(e) => setDanosTerceiros(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-black border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] cursor-pointer hover:border-white/[0.14] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200">Carro Reserva Plus (15 dias)</span>
                    <span className="text-[10px] text-slate-400">Categoria Sedã Médio com Ar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={carroReserva}
                    onChange={(e) => setCarroReserva(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-black border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] cursor-pointer hover:border-white/[0.14] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200">Vidros, Faróis e Retrovisores</span>
                    <span className="text-[10px] text-slate-400">Inclui película protetora</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={vidrosFarois}
                    onChange={(e) => setVidrosFarois(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-black border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] cursor-pointer hover:border-white/[0.14] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200">Assistência 24h Guincho Ilimitado</span>
                    <span className="text-[10px] text-slate-400">Território nacional sem limite de km</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={guinchoIlimitado}
                    onChange={(e) => setGuinchoIlimitado(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-black border-slate-700"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Insurer Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Melhores Opções Encontradas em Tempo Real
            </h2>
            <span className="text-xs text-slate-400 font-mono">3 seguradoras compatíveis</span>
          </div>

          {/* Card 1: Porto Seguro (Featured / Best Value) */}
          <div className="relative bg-gradient-to-b from-[#0b0f19] to-[#030712] border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow">
              ⭐ Mais Recomendada pela IA (98% Match)
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">Porto Seguro</span>
                  <span className="text-[10px] text-slate-400 font-mono">SUSEP 05886</span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                  Franquia Reduzida: R$ 2.850,00
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                  12x R$ 247,90
                </span>
                <span className="block text-[11px] text-slate-400 font-mono">ou R$ 2.677,32 à vista (-10% PIX)</span>
              </div>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Guincho ilimitado e socorro 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Carro Reserva categoria Sedã Médio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Até 25% desc. Centro Automotivo Porto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Vidros completos inclusive teto solar</span>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitSimulacao('Porto Seguro')}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting && selectedSeguradora === 'Porto Seguro' ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Acionando Corretor & Disparando Voz AI...
                </>
              ) : (
                <>
                  <span>🚀</span> Falar com Corretor Agora (Ligação em 30s ou WhatsApp)
                </>
              )}
            </button>
          </div>

          {/* Card 2: Tokio Marine */}
          <div className="glass-panel rounded-2xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">Tokio Marine Seguradora</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                    94% Match
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Franquia Normal: R$ 3.920,00
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold text-slate-200 tabular-nums">12x R$ 229,15</span>
                <span className="block text-[10px] text-slate-400 font-mono">R$ 2.474,80 à vista</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Assistência VIP 24h até 500 km • Carro reserva 7 dias
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitSimulacao('Tokio Marine')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                Selecionar Tokio Marine
              </button>
            </div>
          </div>

          {/* Card 3: Allianz */}
          <div className="glass-panel rounded-2xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">Allianz Seguros</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-bold">
                    91% Match
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Franquia Reduzida: R$ 2.990,00
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold text-slate-200 tabular-nums">12x R$ 265,40</span>
                <span className="block text-[10px] text-slate-400 font-mono">R$ 2.866,32 à vista</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Atendimento Premier • Carro reserva 15 dias SUV • Guincho 1.000 km
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitSimulacao('Allianz')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                Selecionar Allianz
              </button>
            </div>
          </div>

          {/* Speed-to-Lead Guarantee Box */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-slate-400 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <strong className="text-slate-200 block font-semibold">Garantia Speed-to-Lead Prime</strong>
              <span>
                Ao clicar em qualquer cotação, nosso Agente de IA valida suas condições em 15 segundos e aciona um corretor especialista credenciado para atendimento humano imediato via WhatsApp ou ligação de voz.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
