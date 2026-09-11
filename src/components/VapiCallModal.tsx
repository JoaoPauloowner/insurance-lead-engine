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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity">
      <div className="bg-[#10121a] border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#090a0f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">Chamada de Voz com IA (Vapi)</h3>
              <p className="text-[11px] text-zinc-500">
                Discagem outbound ativa com síntese de voz
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="p-3.5 rounded-lg bg-[#090a0f] border border-zinc-800 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Proponente:</span>
              <span className="font-medium text-zinc-200">{lead.nome}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Telefone:</span>
              <span className="font-mono text-zinc-200">{phoneInfo.formatted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Ramo solicitado:</span>
              <span className="text-zinc-300 font-medium">{lead.ramoDesejado}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Lead Score:</span>
              <span className="font-mono font-medium text-amber-400">{lead.score}/100</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200 space-y-1">
            <span className="font-medium text-purple-300">Roteiro programado do assistente:</span>
            <p className="text-purple-300/80 leading-relaxed text-[11px] mt-0.5">
              &quot;Olá {lead.nome}, aqui é da equipe de atendimento da corretora. Recebemos sua solicitação de cotação para {lead.ramoDesejado} e estamos prontos para apresentar as melhores opções.&quot;
            </p>
          </div>

          {callResult && (
            <div className={`p-3 rounded-lg border text-xs ${callResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <div className="font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{callResult.success ? 'Chamada enviada para a fila de discagem!' : 'Falha ao disparar chamada'}</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Status: {callResult.status} {callResult.isMock ? '(Modo de Simulação Ativo)' : ''}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-[#090a0f] border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors active-press"
          >
            Fechar
          </button>
          <button
            onClick={handleTriggerCall}
            disabled={calling}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50 active-press flex items-center gap-1.5"
          >
            {calling ? 'Iniciando chamada...' : 'Disparar Chamada'}
          </button>
        </div>
      </div>
    </div>
  );
}
