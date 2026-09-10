'use client';

import React, { useState, useEffect } from 'react';

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [org, setOrg] = useState<{
    id: string;
    nome: string;
    corPrimaria: string;
    logoUrl: string;
    slug: string;
  }>({
    id: '',
    nome: '',
    corPrimaria: '#2563EB',
    logoUrl: '',
    slug: '',
  });

  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [testLeadSending, setTestLeadSending] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/leads/intake`);
    }

    async function loadOrg() {
      try {
        setLoading(true);
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json();
          if (data.organization) {
            setOrg({
              id: data.organization.id,
              nome: data.organization.nome || '',
              corPrimaria: data.organization.corPrimaria || '#2563EB',
              logoUrl: data.organization.logoUrl || '',
              slug: data.organization.slug || '',
            });
          }
        }
      } catch (err) {
        console.error('Erro ao carregar organização:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrg();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: org.nome,
          corPrimaria: org.corPrimaria,
          logoUrl: org.logoUrl || null,
        }),
      });

      if (res.ok) {
        showToast('Configurações salvas com sucesso!');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        showToast('Erro ao salvar configurações.');
      }
    } catch (error) {
      console.error(error);
      showToast('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    if (navigator.clipboard && webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const sendTestLead = async () => {
    try {
      setTestLeadSending(true);
      setTestResult(null);

      const testPayload = {
        organizationId: org.id,
        nome: 'Lead Teste Webhook Meta',
        telefone: '11998765432',
        email: 'lead.meta.ads@exemplo.com.br',
        origem: 'Meta Ads Webhook Direct',
        ramoDesejado: 'Auto',
        urgencia: 'alta',
        notas: 'Simulação disparada diretamente do console de configurações.',
      };

      const res = await fetch('/api/leads/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      const data = await res.json();
      setTestResult({ status: res.status, ok: res.ok, data });
      if (res.ok) {
        showToast('Lead de teste processado com sucesso pelo Scoring & Engine!');
      } else {
        showToast('Erro no teste de webhook: ' + (data.error || 'Verifique'));
      }
    } catch (err: any) {
      setTestResult({ status: 500, ok: false, error: err.message });
      showToast('Falha na requisição de teste.');
    } finally {
      setTestLeadSending(false);
    }
  };

  const colorPresets = [
    { name: 'Azul Elétrico', hex: '#2563EB' },
    { name: 'Índigo Moderno', hex: '#4F46E5' },
    { name: 'Esmeralda', hex: '#059669' },
    { name: 'Ciano Cyber', hex: '#0891B2' },
    { name: 'Violeta Real', hex: '#7C3AED' },
    { name: 'Âmbar Dourado', hex: '#D97706' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-in fade-in duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              TENANT ENGINE CONFIG
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {org.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configurações & Webhook de Ingestão
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Personalize a identidade da sua corretora e conecte fontes de tráfego pago (Meta Ads, Google Ads, formulários externos).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tenant Branding Settings */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5 border-b border-white/[0.08] pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg">
                🎨
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Identidade Visual da Corretora</h2>
                <p className="text-xs text-slate-400">White-label personalizado para seu time e clientes</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nome da Corretora / Organização
                </label>
                <input
                  type="text"
                  required
                  value={org.nome}
                  onChange={(e) => setOrg({ ...org, nome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Ex: Prime Corretora de Seguros"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  URL da Logo (Opcional)
                </label>
                <input
                  type="url"
                  value={org.logoUrl}
                  onChange={(e) => setOrg({ ...org, logoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="https://suacorretora.com.br/logo.png"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Deixe em branco para usar o avatar estilizado padrão.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Cor Primária de Destaque
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="color"
                    value={org.corPrimaria}
                    onChange={(e) => setOrg({ ...org, corPrimaria: e.target.value })}
                    className="w-12 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={org.corPrimaria}
                    onChange={(e) => setOrg({ ...org, corPrimaria: e.target.value })}
                    className="w-32 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono text-center"
                    placeholder="#2563EB"
                  />
                  <div
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md"
                    style={{ backgroundColor: org.corPrimaria }}
                  >
                    Preview
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setOrg({ ...org, corPrimaria: preset.hex })}
                      className="text-xs px-2.5 py-1 rounded-lg border border-slate-700/60 bg-slate-950/80 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-slate-300">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: org.corPrimaria }}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <span>💾</span> Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Engine Status & Integrations Card */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🔌</span> Motores & Conectores Ativos
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                    VAPI
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Vapi.ai Voice Agent</div>
                    <div className="text-[10px] text-slate-400">Ligação ativa outbound para Leads HOT (Score ≥ 80)</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ATIVO
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                    WA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">WhatsApp Conversacional</div>
                    <div className="text-[10px] text-slate-400">Geração de links E.164 e disparo com templates dinâmicos</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ATIVO
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
                    AI
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Motor de Lead Scoring (GPT-4o / Heurística)</div>
                    <div className="text-[10px] text-slate-400">Calcula score de 0 a 100, classifica HOT/WARM/COLD e gera blueprint</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  CALIBRADO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inbound Webhook Configuration & Test Bench */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5 border-b border-white/[0.08] pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-lg">
                ⚡
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Webhook de Ingestão Instantânea</h2>
                <p className="text-xs text-slate-400">Endpoint HTTP para receber leads em tempo real de qualquer fonte</p>
              </div>
            </div>

            {/* Webhook URL Box */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                URL do Webhook (POST)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-mono select-all overflow-x-auto whitespace-nowrap">
                  {webhookUrl || 'http://localhost:3000/api/leads/intake'}
                </div>
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <span className="text-emerald-400">✓</span> Copiado!
                    </>
                  ) : (
                    <>
                      <span>📋</span> Copiar
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Configure este URL no webhook do seu Meta Lead Ads, formulário Elementor, Typeform ou Google Ads.
              </p>
            </div>

            {/* JSON Schema & cURL Example */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Payload JSON Esperado
                </span>
                <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "nome": "Carlos Silva",
  "telefone": "11987654321",
  "email": "carlos@gmail.com",
  "ramoDesejado": "Auto",
  "origem": "Meta Lead Ads",
  "urgencia": "alta",
  "notas": "Preciso renovar urgente antes de sexta-feira"
}`}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Exemplo cURL para Teste Terminal
                </span>
                <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
{`curl -X POST ${webhookUrl || 'http://localhost:3000/api/leads/intake'} \\
  -H "Content-Type: application/json" \\
  -d '{"nome":"Carlos Silva","telefone":"11987654321","ramoDesejado":"Auto","urgencia":"alta"}'`}
                </pre>
              </div>

              {/* Live Webhook Test Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={sendTestLead}
                  disabled={testLeadSending}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {testLeadSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Disparando Webhook de Teste...
                    </>
                  ) : (
                    <>
                      <span>🚀</span> Disparar Lead de Teste via Webhook Agora
                    </>
                  )}
                </button>
              </div>

              {/* Test Response Console */}
              {testResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          testResult.ok ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      Resposta do Webhook (Status {testResult.status})
                    </span>
                    <button
                      onClick={() => setTestResult(null)}
                      className="text-slate-500 hover:text-slate-300 text-[10px]"
                    >
                      Limpar
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto bg-slate-900/60 p-2.5 rounded-lg">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
