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
    { name: 'Azul Corporativo', hex: '#2563EB' },
    { name: 'Índigo Moderno', hex: '#4F46E5' },
    { name: 'Esmeralda', hex: '#059669' },
    { name: 'Ciano Técnico', hex: '#0891B2' },
    { name: 'Violeta Real', hex: '#7C3AED' },
    { name: 'Âmbar Dourado', hex: '#D97706' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-xs">Carregando parâmetros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-emerald-400 text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
              Ambiente ID: {org.id}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Configurações & Webhook de Ingestão
          </h1>
          <p className="text-zinc-400 text-xs mt-0.5 max-w-xl">
            Personalização de marca da corretora e conectores de entrada para tráfego pago (Meta Ads, Google Ads, formulários externos).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Tenant Branding Settings */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-semibold text-white">Identidade da Corretora</h2>
                <p className="text-[11px] text-zinc-400">Personalização de nome e cores institucionais</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nome da Corretora
                </label>
                <input
                  type="text"
                  required
                  value={org.nome}
                  onChange={(e) => setOrg({ ...org, nome: e.target.value })}
                  className="w-full bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                  placeholder="Ex: Prime Corretora de Seguros"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  URL do Logotipo (Opcional)
                </label>
                <input
                  type="url"
                  value={org.logoUrl}
                  onChange={(e) => setOrg({ ...org, logoUrl: e.target.value })}
                  className="w-full bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                  placeholder="https://suacorretora.com.br/logo.png"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Deixe vazio para utilizar a sigla padrão no cabeçalho.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Cor Primária Institucional
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={org.corPrimaria}
                    onChange={(e) => setOrg({ ...org, corPrimaria: e.target.value })}
                    className="w-10 h-8 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={org.corPrimaria}
                    onChange={(e) => setOrg({ ...org, corPrimaria: e.target.value })}
                    className="w-28 bg-[#090a0f] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono text-center"
                    placeholder="#2563EB"
                  />
                  <div
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-sm"
                    style={{ backgroundColor: org.corPrimaria }}
                  >
                    Amostra
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setOrg({ ...org, corPrimaria: preset.hex })}
                      className="text-xs px-2 py-1 rounded-md border border-zinc-800 bg-[#090a0f] hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer active-press"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-zinc-300 text-[11px]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg font-medium text-xs text-white shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 active-press"
                  style={{ backgroundColor: org.corPrimaria }}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>

          {/* Connectors Status */}
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-white mb-2">
              Conexões & Serviços Ativos
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-[10px] font-mono">
                    VOZ
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Vapi.ai Voice Agent</div>
                    <div className="text-[11px] text-zinc-500">Chamada outbound automática para leads com Score ≥ 80</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ativo
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-[10px] font-mono">
                    WA
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">WhatsApp Conversacional</div>
                    <div className="text-[11px] text-zinc-500">Geração de links E.164 com templates dinâmicos</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ativo
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-[10px] font-mono">
                    IA
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Motor de Pontuação & Triagem</div>
                    <div className="text-[11px] text-zinc-500">Cálculo de score de 0 a 100 com classificação técnica</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Calibrado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inbound Webhook Configuration & Test Bench */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#10121a] border border-zinc-800/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-semibold text-white">Webhook de Ingestão Instantânea</h2>
                <p className="text-[11px] text-zinc-400">Endpoint HTTP para receber leads em tempo real</p>
              </div>
            </div>

            {/* Webhook URL Box */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Endpoint URL (POST)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#090a0f] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono select-all overflow-x-auto whitespace-nowrap">
                  {webhookUrl || 'http://localhost:3000/api/leads/intake'}
                </div>
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer whitespace-nowrap active-press"
                >
                  {copied ? 'Copiado' : 'Copiar URL'}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Insira este endereço na configuração de webhook do Meta Ads, Google Ads ou formulários externos.
              </p>
            </div>

            {/* JSON Schema & cURL Example */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-zinc-300 block mb-1">
                  Estrutura JSON esperada
                </span>
                <pre className="bg-[#090a0f] p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`{
  "nome": "Carlos Silva",
  "telefone": "11987654321",
  "email": "carlos@gmail.com",
  "ramoDesejado": "Auto",
  "origem": "Meta Lead Ads",
  "urgencia": "alta",
  "notas": "Renovação urgente antes de sexta-feira"
}`}
                </pre>
              </div>

              <div>
                <span className="text-xs font-medium text-zinc-300 block mb-1">
                  Exemplo de comando cURL
                </span>
                <pre className="bg-[#090a0f] p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap">
{`curl -X POST ${webhookUrl || 'http://localhost:3000/api/leads/intake'} \\
  -H "Content-Type: application/json" \\
  -d '{"nome":"Carlos Silva","telefone":"11987654321","ramoDesejado":"Auto","urgencia":"alta"}'`}
                </pre>
              </div>

              {/* Live Webhook Test Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={sendTestLead}
                  disabled={testLeadSending}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active-press"
                >
                  {testLeadSending ? 'Disparando teste...' : 'Simular Disparo de Webhook'}
                </button>
              </div>

              {/* Test Response Console */}
              {testResult && (
                <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          testResult.ok ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      Resposta do Webhook (Status {testResult.status})
                    </span>
                    <button
                      onClick={() => setTestResult(null)}
                      className="text-zinc-500 hover:text-zinc-300 text-[10px]"
                    >
                      Limpar
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-zinc-400 overflow-x-auto bg-black/40 p-2 rounded">
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
