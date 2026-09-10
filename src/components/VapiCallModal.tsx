'use client';

import React, { useState } from 'react';
import { normalizePhoneBR } from '@/lib/phone';

interface VapiCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any | null;
  onSuccess: () => void;
}

export default function VapiCallModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: VapiCallModalProps) {
  const [calling, setCalling] = useState(false);
  const [callResult, setCallResult] = useState<any | null>(null);

  if (!isOpen || !lead) return null;

  const phoneInfo = normalizePhoneBR(lead.telefone);

  const handleTriggerCall = async () => {
    setCalling(true);
    setCallResult(null);

    try {
      const res = await fetch(`/api/leads/${lead.id}/call`, {
        method: 'POST',
      });
      const data = await res.json();
      setCallResult(data.vapiResult || data);
      onSuccess();
    } catch (err: any) {
      setCallResult({ success: false, error: err.message });
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xl">
              📞
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Disparar Ligação com IA (Vapi)</h3>
              <p className="text-xs text-slate-400">
                Agente de Voz Ativo em tempo real
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Lead:</span>
              <span className="font-bold text-slate-200">{lead.nome}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Telefone:</span>
              <span className="font-mono text-emerald-400 font-semibold">{phoneInfo.formatted}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Ramo Solicitado:</span>
              <span className="text-blue-400 font-semibold">{lead.ramoDesejado}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Lead Score:</span>
              <span className="font-bold text-amber-400">{lead.score}/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200 space-y-1">
            <span className="font-semibold text-purple-300">Roteiro do Agente de Voz (Sophia):</span>
            <p className="text-purple-300/80 leading-relaxed text-[11px] mt-1">
              &quot;Olá {lead.nome}, aqui é a Sophia da corretora. Vi que você acabou de pedir uma cotação de seguro {lead.ramoDesejado}. Estou ligando para confirmar se é o momento certo e avisar que o nosso corretor já está gerando as melhores propostas!&quot;
            </p>
          </div>

          {callResult && (
            <div className={`p-3 rounded-xl border text-xs ${callResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <div className="font-semibold">
                {callResult.success ? '✓ Chamada enviada para a fila de discagem!' : '⚠️ Erro ao disparar chamada'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Status: {callResult.status} {callResult.isMock ? '(Modo de Simulação Ativo)' : ''}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-800"
          >
            Fechar
          </button>
          <button
            onClick={handleTriggerCall}
            disabled={calling}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
          >
            {calling ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                <span>Discando...</span>
              </>
            ) : (
              <span>Ligar Agora com IA</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
