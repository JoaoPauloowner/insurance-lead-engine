'use client';

import React, { useState, useEffect } from 'react';

export default function PlanosAssinaturaPage() {
  const [org, setOrg] = useState<{
    id: string;
    nome: string;
    plano: string;
    statusPlano: string;
    trialAte: string | null;
  }>({
    id: '',
    nome: 'LeadEngine Prime Corretora',
    plano: 'pro',
    statusPlano: 'trial',
    trialAte: null,
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json();
          if (data.organization) {
            setOrg({
              id: data.organization.id,
              nome: data.organization.nome || 'LeadEngine Prime Corretora',
              plano: data.organization.plano || 'pro',
              statusPlano: data.organization.statusPlano || 'trial',
              trialAte: data.organization.trialAte,
            });
          }
        }
      } catch (e) {
        console.error('Erro ao carregar dados da organização:', e);
      }
    }
    loadOrg();
  }, []);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal para corretores individuais e pequenas corretoras iniciando a prospecção digital.',
      monthlyPrice: 297,
      annualPrice: 247,
      features: [
        'Até 100 leads ingeridos/mês',
        'Radar de Renovações com régua temporal (< 15d, 15-30d)',
        'Disparo de WhatsApp manual via Web/Desktop',
        'Cockpit de Cotação Multisseguradoras',
        'Importador de carteiras Excel/CSV',
        '1 operador de atendimento',
        'Suporte por e-mail e chamados',
      ],
      isPopular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Para corretoras em crescimento que investem em tráfego pago (Meta Ads e Google Ads).',
      monthlyPrice: 597,
      annualPrice: 497,
      features: [
        'Até 500 leads ingeridos/mês',
        'Automação de WhatsApp via API (Speed-to-Lead < 30s)',
        'Propostas Comerciais em PDF Timbradas com a sua logo',
        'Webhook Universal para Meta Leads e Google Forms',
        'Templates dinâmicos de WhatsApp com tags de apólice',
        'Radar de Renovações com histórico de interações',
        'Até 3 corretores/operadores simultâneos',
        'Suporte prioritário via WhatsApp direto',
      ],
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Para grandes corretoras, MGAs e assessorias que demandam alta volumetria e IA por voz.',
      monthlyPrice: 1290,
      annualPrice: 1090,
      features: [
        'Volume de leads ilimitado',
        'Agente de Voz Ativo com IA (Vapi.ai Outbound Calling)',
        'SLA de Speed-to-Lead sub-10 segundos garantido',
        'Múltiplos operadores e filiais ilimitadas',
        'Acesso direto à API e exportações automáticas para BI',
        'Onboarding assistido e migração de carteira com especialista',
        'Gerente de sucesso de conta dedicado',
      ],
      isPopular: false,
    },
  ];

  const handleSimulatePayment = () => {
    setProcessingPayment(true);
    setTimeout(() => {
      setProcessingPayment(false);
      setOrg((prev) => ({
        ...prev,
        plano: selectedPlanForCheckout || 'pro',
        statusPlano: 'ativo',
      }));
      setSuccessNotice(`Assinatura do Plano ${selectedPlanForCheckout?.toUpperCase()} ativada com sucesso via ${paymentMethod.toUpperCase()}!`);
      setSelectedPlanForCheckout(null);
      setTimeout(() => setSuccessNotice(null), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-sans">
      {/* Toast Notification */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="font-bold opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e9e8e7] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-primary bg-primary/10">
              Assinatura & Faturamento
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              Nota Fiscal Automática
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1b1c1c] tracking-tight">
            Planos & Assinatura da Corretora
          </h1>
          <p className="text-secondary text-xs mt-0.5 max-w-2xl">
            Escolha o plano ideal para a capacidade da sua corretora. Atualize a qualquer momento sem taxa de cancelamento.
          </p>
        </div>

        {/* Annual / Monthly Toggle */}
        <div className="flex items-center bg-[#f5f3f3] border border-[#e9e8e7] p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              billingCycle === 'monthly' ? 'bg-white text-[#1b1c1c] shadow-2xs' : 'text-secondary hover:text-[#1b1c1c]'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'annual' ? 'bg-white text-[#1b1c1c] shadow-2xs' : 'text-secondary hover:text-[#1b1c1c]'
            }`}
          >
            <span>Anual</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              -17% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Current Subscription Status Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#e9e8e7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#1b1c1c]">
                Plano {org.plano.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {org.statusPlano === 'trial' ? 'Período de Degustação (Trial)' : 'Assinatura Ativa'}
              </span>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Corretora: <strong className="text-[#1b1c1c] font-medium">{org.nome}</strong> • 
              {org.statusPlano === 'trial' ? ' Você tem 7 dias de acesso liberado a todas as ferramentas Pro.' : ' Renovação mensal automática.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedPlanForCheckout('pro')}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">credit_card</span>
            <span>Efetivar Assinatura Definitiva</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          const isCurrent = org.plano === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 bg-white border flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'border-2 border-primary shadow-lg ring-4 ring-primary/5'
                  : 'border-[#e9e8e7] shadow-xs hover:border-[#c3c6d3]'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  Mais Escolhido pelas Corretoras
                </div>
              )}

              <div>
                <div className="pb-4 border-b border-[#e9e8e7]">
                  <h3 className="text-lg font-bold text-[#1b1c1c]">{plan.name}</h3>
                  <p className="text-xs text-secondary mt-1 min-h-[36px]">{plan.description}</p>
                </div>

                <div className="py-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-secondary font-medium">R$</span>
                    <span className="text-3xl font-extrabold text-[#1b1c1c] font-mono tracking-tight">
                      {price}
                    </span>
                    <span className="text-xs text-secondary font-medium">/mês</span>
                  </div>
                  <span className="text-[11px] text-secondary block mt-1">
                    {billingCycle === 'annual' ? 'Faturado anualmente (R$ ' + price * 12 + '/ano)' : 'Cobrança mensal no cartão ou PIX'}
                  </span>
                </div>

                <div className="space-y-2.5 pb-6">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                    O que está incluso:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#1b1c1c]">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0 mt-0.5">
                        check
                      </span>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => setSelectedPlanForCheckout(plan.id)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                    plan.isPopular
                      ? 'bg-primary hover:bg-primary-container text-white shadow-primary/20'
                      : 'bg-[#f5f3f3] hover:bg-[#ebe8e8] text-[#1b1c1c] border border-[#e9e8e7]'
                  }`}
                >
                  <span>{isCurrent ? 'Plano Atual (Renovar)' : `Escolher Plano ${plan.name}`}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e9e8e7] p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e9e8e7] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1b1c1c]">
                  Contratar Plano {selectedPlanForCheckout.toUpperCase()}
                </h3>
                <p className="text-xs text-secondary">
                  Corretora: {org.nome}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="p-1.5 rounded-lg text-secondary hover:text-[#1b1c1c] hover:bg-[#f5f3f3]"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1b1c1c]">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold'
                      : 'border-[#e9e8e7] bg-[#fbf9f9] text-secondary'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">qr_code_2</span>
                    PIX Instantâneo
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">Liberação Imediata</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'cartao'
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-[#e9e8e7] bg-[#fbf9f9] text-secondary'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">credit_card</span>
                    Cartão de Crédito
                  </span>
                  <span className="text-[10px] text-secondary">Até 12x no ano</span>
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-3.5 rounded-xl bg-[#fbf9f9] border border-[#e9e8e7] space-y-1.5 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Subtotal Mensal:</span>
                <span className="font-mono text-[#1b1c1c]">
                  R$ {selectedPlanForCheckout === 'starter' ? '297,00' : selectedPlanForCheckout === 'pro' ? '597,00' : '1.290,00'}
                </span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Desconto Especial PIX:</span>
                <span className="font-mono text-emerald-700 font-medium">- 10% (Primeiro Mês)</span>
              </div>
              <div className="pt-2 border-t border-[#e9e8e7] flex justify-between font-bold text-[#1b1c1c]">
                <span>Total a Pagar:</span>
                <span className="font-mono text-base text-primary">
                  R$ {selectedPlanForCheckout === 'starter' ? '267,30' : selectedPlanForCheckout === 'pro' ? '537,30' : '1.161,00'}
                </span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleSimulatePayment}
              disabled={processingPayment}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processingPayment ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Confirmando transação segura...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Assinatura Agora</span>
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
