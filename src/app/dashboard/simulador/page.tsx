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
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Header */}
      <div className="border-b border-[var(--border)] pb-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Simulador Multicálculo
              </span>
              <span className="text-xs text-[var(--text-mute)]">Cálculo instantâneo em &lt; 30s</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
              Simulador de Cotação de Seguros
            </h1>
            <p className="text-[var(--text-mute)] text-sm mt-0.5">
              Preencha os dados básicos do veículo ou imóvel e compare as opções recomendadas para o cliente.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Conformidade SUSEP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[var(--purple)]" />
              <span>Tabela FIPE Vigente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Alert if Triggered */}
      {leadResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center font-bold text-base shrink-0">
              ✓
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                Cotação Registrada na Esteira de Leads!
                <span className="px-2 py-0.5 rounded-md text-xs bg-emerald-200 text-emerald-900 font-bold">
                  Score {leadResult.lead?.score || 100}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Seguradora selecionada: <strong>{selectedSeguradora}</strong> | Telefone: <strong>{leadResult.lead?.telefone}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/leads"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
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
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <h2 className="text-sm font-bold text-[var(--text)]">
                Parâmetros da Cotação
              </h2>
              <span className="text-xs text-[var(--text-mute)] font-mono bg-[var(--surface)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                FIPE Jan/2025
              </span>
            </div>

            {/* Segment Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)] mb-5">
              {[
                { id: 'auto', label: 'Automóvel' },
                { id: 'frota', label: 'Frota' },
                { id: 'residencial', label: 'Residencial' },
                { id: 'vida', label: 'Vida' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSegmento(tab.id)}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer text-center ${
                    segmento === tab.id
                      ? 'bg-[var(--surface-2)] text-[var(--text)] font-semibold shadow-xs'
                      : 'text-[var(--text-mute)] hover:text-[var(--text)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Nome do Proponente
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:bg-[var(--surface-2)] focus:outline-none focus:border-[#275ba5] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] font-mono focus:bg-[var(--surface-2)] focus:outline-none focus:border-[#275ba5] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    CEP Pernoite
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] font-mono focus:bg-[var(--surface-2)] focus:outline-none focus:border-[#275ba5] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Modelo do Veículo
                </label>
                <input
                  type="text"
                  value={veiculo}
                  onChange={(e) => setVeiculo(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:bg-[var(--surface-2)] focus:outline-none focus:border-[#275ba5] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Ano / Fabricação
                  </label>
                  <input
                    type="text"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:bg-[var(--surface-2)] focus:outline-none focus:border-[#275ba5] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Placa
                  </label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] font-mono uppercase focus:bg-[var(--surface-2)] focus:outline-none focus:border-[#275ba5] transition-colors"
                  />
                </div>
              </div>

              {/* Coverage Toggles */}
              <div className="pt-3 border-t border-[var(--border)] space-y-2">
                <span className="block text-xs font-bold text-[var(--text)] mb-2">
                  Coberturas Adicionais
                </span>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:border-[var(--border)] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--text)]">100% Tabela FIPE (Compreensiva)</span>
                    <span className="text-[11px] text-[var(--text-mute)]">Colisão, Incêndio, Roubo e Alagamento</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={coberturaFipe}
                    onChange={(e) => setCoberturaFipe(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--purple)] border-[var(--border)]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:border-[var(--border)] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--text)]">Danos Terceiros (RCF R$ 300.000)</span>
                    <span className="text-[11px] text-[var(--text-mute)]">Danos materiais e corporais</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={danosTerceiros}
                    onChange={(e) => setDanosTerceiros(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--purple)] border-[var(--border)]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:border-[var(--border)] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--text)]">Carro Reserva Plus (15 dias)</span>
                    <span className="text-[11px] text-[var(--text-mute)]">Categoria Sedã com Ar Condicionado</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={carroReserva}
                    onChange={(e) => setCarroReserva(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--purple)] border-[var(--border)]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:border-[var(--border)] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--text)]">Vidros, Faróis e Retrovisores</span>
                    <span className="text-[11px] text-[var(--text-mute)]">Cobertura integral para troca de cristais</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={vidrosFarois}
                    onChange={(e) => setVidrosFarois(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--purple)] border-[var(--border)]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:border-[var(--border)] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--text)]">Assistência 24h Guincho Ilimitado</span>
                    <span className="text-[11px] text-[var(--text-mute)]">Território nacional sem limite de km</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={guinchoIlimitado}
                    onChange={(e) => setGuinchoIlimitado(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--purple)] border-[var(--border)]"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Insurer Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text)]">
              Cotações Recomendadas
            </h2>
            <span className="text-xs text-[var(--text-mute)]">3 seguradoras compatíveis com o perfil</span>
          </div>

          {/* Card 1: Porto Seguro (Featured) */}
          <div className="relative bg-[var(--surface-2)] border-2 border-[#275ba5] rounded-xl p-5 shadow-[0_2px_8px_rgba(39,91,165,0.08)]">
            <div className="absolute top-0 right-0 bg-[var(--purple)] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              Recomendação Técnica
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[var(--text)]">Porto Seguro</span>
                  <span className="text-[10px] text-[var(--text-mute)] font-mono">SUSEP 05886</span>
                </div>
                <p className="text-xs text-[var(--text-mute)] mt-0.5">
                  Franquia Reduzida: <strong className="text-[var(--text)]">R$ 2.850,00</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-[var(--purple)] tabular-nums">
                  12x R$ 247,90
                </span>
                <span className="block text-xs text-[var(--text-mute)] font-mono">ou R$ 2.677,32 à vista</span>
              </div>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-mute)] mb-5">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Guincho ilimitado e socorro 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Carro Reserva Sedã com Ar</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Desconto Centro Automotivo Porto</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--purple)] hover:bg-[#1a4784] text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {submitting && selectedSeguradora === 'Porto Seguro' ? 'Enviando para esteira...' : 'Selecionar Porto Seguro e Contatar'}
            </button>
          </div>

          {/* Card 2: Tokio Marine */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text)]">Tokio Marine Seguradora</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                    94% fit
                  </span>
                </div>
                <p className="text-xs text-[var(--text-mute)] mt-0.5">
                  Franquia Normal: R$ 3.920,00
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-[var(--text)] tabular-nums">12x R$ 229,15</span>
                <span className="block text-xs text-[var(--text-mute)] font-mono">R$ 2.474,80 à vista</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-mute)]">
                Assistência 24h até 500 km • Carro reserva 7 dias
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitSimulacao('Tokio Marine')}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-semibold transition-colors border border-[var(--border)] cursor-pointer"
              >
                Selecionar Tokio Marine
              </button>
            </div>
          </div>

          {/* Card 3: Allianz */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text)]">Allianz Seguros</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                    91% fit
                  </span>
                </div>
                <p className="text-xs text-[var(--text-mute)] mt-0.5">
                  Franquia Reduzida: R$ 2.990,00
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-[var(--text)] tabular-nums">12x R$ 265,40</span>
                <span className="block text-xs text-[var(--text-mute)] font-mono">R$ 2.866,32 à vista</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-mute)]">
                Atendimento Premier • Carro reserva 15 dias SUV • Guincho 1.000 km
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitSimulacao('Allianz')}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-semibold transition-colors border border-[var(--border)] cursor-pointer"
              >
                Selecionar Allianz
              </button>
            </div>
          </div>

          {/* Standard SLA Notice */}
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-mute)] flex items-center gap-3">
            <svg className="w-4 h-4 text-[var(--purple)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <strong className="text-[var(--text)] block font-medium">Fluxo Integrado com a Corretora</strong>
              <span>
                Ao selecionar qualquer seguradora, o lead é registrado instantaneamente na fila com prioridade para contato imediato via WhatsApp.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
