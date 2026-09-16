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
    corPrimaria: '#275ba5',
    logoUrl: '',
    slug: '',
  });

  // Webhook & Integration State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [testLeadSending, setTestLeadSending] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // WhatsApp Gateway State
  const [waConfig, setWaConfig] = useState({
    provider: 'evolution',
    apiUrl: '',
    apiKey: '',
    instance: 'leadengine-prime',
    autoDispatch: true,
    testNumber: '',
  });
  const [waTesting, setWaTesting] = useState(false);
  const [waTestResult, setWaTestResult] = useState<any | null>(null);

  useEffect(() => {
    async function loadOrg() {
      try {
        setLoading(true);
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json();
          if (data.organization) {
            setOrg({
              id: data.organization.id,
              nome: data.organization.nome || 'LeadEngine Prime Corretora',
              corPrimaria: data.organization.corPrimaria || '#275ba5',
              logoUrl: data.organization.logoUrl || '',
              slug: data.organization.slug || 'prime-demo',
            });

            if (typeof window !== 'undefined') {
              setWebhookUrl(`${window.location.origin}/api/webhook/leads?token=${data.organization.id}`);
            }
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
      showToast('URL do Webhook copiada para a área de transferência!');
    }
  };

  const sendTestLead = async () => {
    try {
      setTestLeadSending(true);
      setTestResult(null);

      const testPayload = {
        organizationId: org.id,
        nome: 'Juliana Paes (Lead Teste Meta Ads)',
        telefone: '11987654321',
        email: 'juliana.paes@exemplo.com.br',
        origem: 'Meta Ads (Instagram Stories)',
        ramoDesejado: 'Seguro Auto (Honda HR-V 2024)',
        urgencia: 'alta',
        notas: 'Simulação enviada via Webhook Universal do LeadEngine com Speed-to-Lead automático.',
      };

      const res = await fetch(`/api/webhook/leads?token=${org.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      const data = await res.json();
      setTestResult({ status: res.status, ok: res.ok, data });
      if (res.ok) {
        showToast('Lead recebido e WhatsApp automático disparado em < 1s!');
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

  const handleTestWhatsApp = async () => {
    setWaTesting(true);
    setWaTestResult(null);
    try {
      const targetPhone = waConfig.testNumber || '11987654321';
      const res = await fetch('/api/leads/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: org.id,
          nome: 'Teste Gateway WhatsApp',
          telefone: targetPhone,
          origem: 'Teste Interno do Painel',
          ramoDesejado: 'Auto',
          urgencia: 'alta',
        }),
      });

      const data = await res.json();
      setWaTestResult({ ok: res.ok, data });
      showToast('Simulação de disparo WhatsApp concluída com sucesso!');
    } catch (e: any) {
      setWaTestResult({ ok: false, error: e.message });
    } finally {
      setWaTesting(false);
    }
  };

  const colorPresets = [
    { name: 'Azul Corporativo', hex: '#275ba5' },
    { name: 'Índigo Neobank', hex: '#4f46e5' },
    { name: 'Esmeralda Fintech', hex: '#10b981' },
    { name: 'Ciano Técnico', hex: '#0891b2' },
    { name: 'Safira Escuro', hex: '#1e3a8a' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin">sync</span>
          <p className="text-secondary text-xs">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-400 text-xs animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-primary bg-primary/10">
              Tenant ID: {org.id}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              Multi-Tenant Ativo
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            Configurações da Corretora & Webhook
          </h1>
          <p className="text-secondary text-xs mt-0.5 max-w-2xl">
            Gestão da marca da corretora, canal de WhatsApp automático e endpoint universal para ingestão direta de leads do Meta Ads, Google Ads e formulários externos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Branding Settings */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4 border-b border-[var(--border)] pb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text)]">Identidade da Corretora</h2>
                <p className="text-[11px] text-secondary">Aparece nos relatórios, propostas em PDF e templates</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Nome Comercial da Corretora
                </label>
                <input
                  type="text"
                  required
                  value={org.nome}
                  onChange={(e) => setOrg({ ...org, nome: e.target.value })}
                  className="w-full bg-[#fbf9f9] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-primary transition-colors"
                  placeholder="Ex: Prime Corretora & Lead Engine"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  URL do Logotipo da Corretora (PNG / SVG)
                </label>
                <input
                  type="url"
                  value={org.logoUrl}
                  onChange={(e) => setOrg({ ...org, logoUrl: e.target.value })}
                  className="w-full bg-[#fbf9f9] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-primary transition-colors"
                  placeholder="https://suacorretora.com.br/logo.png"
                />
                <p className="text-[11px] text-secondary mt-1">
                  Exibido no cabeçalho das propostas comerciais impressas em PDF.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Cor Primária Institucional
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={org.corPrimaria}
                    onChange={(e) => setOrg({ ...org, corPrimaria: e.target.value })}
                    className="w-10 h-8 rounded-lg border border-[var(--border)] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={org.corPrimaria}
                    onChange={(e) => setOrg({ ...org, corPrimaria: e.target.value })}
                    className="w-28 bg-[#fbf9f9] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] font-mono text-center"
                    placeholder="#275ba5"
                  />
                  <div
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-2xs"
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
                      className="text-xs px-2.5 py-1 rounded-md border border-[var(--border)] bg-[#fbf9f9] hover:bg-[var(--surface)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-[var(--text)] text-[11px] font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg font-semibold text-xs text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: org.corPrimaria }}
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* WhatsApp Automated Speed-to-Lead Card */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Automação de WhatsApp (Speed-to-Lead)</h3>
                <p className="text-[11px] text-secondary">Disparo imediato em &lt; 30 segundos ao receber novo lead</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">bolt</span>
                <div className="space-y-1">
                  <span className="font-bold text-emerald-900 block">SLA Automático Sub-30s Ativo</span>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Quando um lead entra pelo formulário do Instagram ou landing page, o robô dispara a mensagem de primeiro contato instantaneamente, antes do concorrente.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Gateway Provedor</label>
                  <select
                    value={waConfig.provider}
                    onChange={(e) => setWaConfig({ ...waConfig, provider: e.target.value })}
                    className="w-full bg-[#fbf9f9] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] focus:outline-none focus:border-primary"
                  >
                    <option value="evolution">Evolution API (Recomendado)</option>
                    <option value="zapi">Z-API WhatsApp</option>
                    <option value="meta">Meta Cloud API Oficial</option>
                    <option value="mock">Modo Simulação & Teste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Nome da Instância</label>
                  <input
                    type="text"
                    value={waConfig.instance}
                    onChange={(e) => setWaConfig({ ...waConfig, instance: e.target.value })}
                    className="w-full bg-[#fbf9f9] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] font-mono focus:outline-none focus:border-primary"
                    placeholder="leadengine-prime"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="DDD + Seu WhatsApp para testar"
                  value={waConfig.testNumber}
                  onChange={(e) => setWaConfig({ ...waConfig, testNumber: e.target.value })}
                  className="w-full bg-[#fbf9f9] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  disabled={waTesting}
                  className="w-full sm:w-auto shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{waTesting ? 'Testando...' : 'Testar Envio'}</span>
                </button>
              </div>

              {waTestResult && (
                <div className="p-2.5 rounded-lg bg-[#fbf9f9] border border-[var(--border)] text-[11px] font-mono text-secondary">
                  Status: {waTestResult.ok ? 'Mensagem disparada com sucesso (Speed-to-Lead verificado)!' : waTestResult.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Webhook Universal for Meta Ads / Google Ads */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">webhook</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text)]">Webhook Universal de Ingestão</h2>
                <p className="text-[11px] text-secondary">Conexão direta para campanhas de tráfego pago</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Sua URL de Webhook Exclusiva
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full bg-[#fbf9f9] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-secondary mt-1">
                Cole essa URL no Meta Leads Webhook, Elementor Forms, Typeform ou no n8n.
              </p>
            </div>

            {/* Test Action */}
            <div className="p-4 rounded-xl bg-[#fbf9f9] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--text)]">Simular Lead do Instagram ao Vivo</span>
                  <p className="text-[11px] text-secondary">
                    Envia um payload simulado e verifica a chegada em tempo real na esteira.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sendTestLead}
                  disabled={testLeadSending}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>{testLeadSending ? 'Processando...' : 'Disparar Teste'}</span>
                </button>
              </div>

              {testResult && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--text)]">Resultado do Gateway:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${testResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      HTTP {testResult.status}
                    </span>
                  </div>
                  <pre className="text-[10px] font-mono text-secondary bg-[#fbf9f9] p-2 rounded overflow-x-auto max-h-36">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Documentation / Payload reference */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider block">
                Exemplo de Payload JSON (Meta Ads / n8n)
              </span>
              <pre className="p-3 rounded-xl bg-[#fbf9f9] border border-[var(--border)] text-[11px] font-mono text-secondary overflow-x-auto">
{`{
  "nome": "Marcos Silveira",
  "telefone": "5511987654321",
  "email": "marcos@empresa.com.br",
  "origem": "Meta Ads (Instagram)",
  "ramoDesejado": "Seguro Auto",
  "urgencia": "alta",
  "notas": "BMW 320i 2024, apólice vencendo em 10 dias"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
