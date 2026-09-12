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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity font-sans">
      <div className="bg-white border border-[#e9e8e7] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#e9e8e7] flex items-center justify-between bg-[#f5f3f3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-[#275ba5]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1b1c1c]">Chamada Rápida ao Lead</h3>
              <p className="text-xs text-[#565f71]">
                Discagem direta com assistente ou corretor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#737782] hover:text-[#1b1c1c] p-1.5 rounded-lg hover:bg-[#efeded] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#f5f3f3] border border-[#e9e8e7] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#565f71]">Contato:</span>
              <span className="font-semibold text-[#1b1c1c]">{lead.nome}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#565f71]">Telefone:</span>
              <span className="font-mono text-[#1b1c1c] font-medium">{phoneInfo.formatted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#565f71]">Interesse:</span>
              <span className="font-medium text-[#275ba5]">{lead.ramoDesejado || lead.lob}</span>
            </div>
          </div>

          {callResult && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                callResult.success !== false
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {callResult.success !== false ? (
                <div>
                  <div className="font-semibold">Chamada iniciada com sucesso!</div>
                  <div className="text-[11px] mt-0.5 opacity-80">
                    O número está sendo discado.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-semibold">Não foi possível completar a chamada</div>
                  <div className="text-[11px] mt-0.5 opacity-80">
                    {callResult.error || 'Verifique o número ou as credenciais de telefonia.'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-[#f5f3f3] border-t border-[#e9e8e7] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-[#c3c6d3] bg-white text-[#565f71] text-xs font-medium hover:text-[#1b1c1c] hover:bg-[#efeded] transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleTriggerCall}
            disabled={calling}
            className="px-4 py-2 rounded-lg bg-[#275ba5] hover:bg-[#1a4784] text-white text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>{calling ? 'Discando...' : 'Iniciar Chamada'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
