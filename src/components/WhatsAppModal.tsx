'use client';

import React, { useState, useEffect } from 'react';
import { formatDateBR, calculateUrgency } from '@/lib/date';
import { buildWaMeUrl, normalizePhoneBR } from '@/lib/phone';

interface Template {
  id: string;
  nome: string;
  corpo: string;
}

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetData: any | null;
  isLead?: boolean;
  templates: Template[];
  brokerName: string;
  brokerOrgName: string;
  onSuccess?: () => void;
}

export default function WhatsAppModal({
  isOpen,
  onClose,
  targetData,
  isLead = false,
  templates,
  brokerName,
  brokerOrgName,
  onSuccess,
}: WhatsAppModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  const interpolate = (templateText: string) => {
    if (!targetData) return templateText;

    const nomeCliente = targetData.cliente?.nome || targetData.nome || '';
    const tipoSeguro = targetData.tipoSeguro || targetData.ramoDesejado || 'Auto';
    const seguradora = targetData.seguradora || 'Porto Seguro / Allianz';
    const numeroApolice = targetData.numeroApolice || 'S/N';
    const dataVenc = targetData.dataVencimento ? formatDateBR(targetData.dataVencimento) : 'em breve';
    const urgency = targetData.dataVencimento ? calculateUrgency(targetData.dataVencimento) : { daysRemaining: 15 };

    return templateText
      .replace(/{cliente}/g, nomeCliente)
      .replace(/{corretor}/g, brokerName)
      .replace(/{corretora}/g, brokerOrgName)
      .replace(/{tipo_seguro}/g, tipoSeguro)
      .replace(/{seguradora}/g, seguradora)
      .replace(/{numero_apolice}/g, numeroApolice)
      .replace(/{data_vencimento}/g, dataVenc)
      .replace(/{dias_para_vencer}/g, String(Math.max(0, urgency.daysRemaining)));
  };

  useEffect(() => {
    if (isOpen && targetData && templates.length > 0) {
      const defaultTpl = templates[0];
      setSelectedTemplateId(defaultTpl.id);
      setMessageText(interpolate(defaultTpl.corpo));
    }
  }, [isOpen, targetData, templates]);

  if (!isOpen || !targetData) return null;

  const phone = targetData.cliente?.telefone || targetData.telefone;
  const phoneInfo = normalizePhoneBR(phone);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) setMessageText(interpolate(tpl.corpo));
  };

  const handleOpenWhatsApp = async () => {
    setSending(true);
    try {
      if (!isLead && targetData.id) {
        await fetch('/api/interacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apoliceId: targetData.id,
            templateId: selectedTemplateId || null,
          }),
        });
      }

      const waUrl = buildWaMeUrl(phone, messageText);
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const waUrl = buildWaMeUrl(phone, messageText);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity">
      <div className="bg-[#10121a] border border-zinc-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#090a0f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">Disparo Direto WhatsApp</h3>
              <p className="text-[11px] text-zinc-500">
                Abertura nativa via protocolo wa.me com número validado
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

        <div className="px-5 py-2 bg-[#090a0f]/60 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-500">Destinatário: </span>
            <span className="font-medium text-zinc-200">{targetData.cliente?.nome || targetData.nome}</span>
            <span className="text-zinc-500 ml-1.5 font-mono">({phoneInfo.formatted})</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] border border-zinc-700">
            {targetData.tipoSeguro || targetData.ramoDesejado}
          </span>
        </div>

        <div className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Modelo pré-definido
            </label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              className="w-full px-3 py-2 rounded-lg bg-[#090a0f] border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-600 transition-colors"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-300">
                Mensagem a enviar
              </label>
              <span className="text-[11px] text-zinc-500">Você pode ajustar o texto antes de abrir</span>
            </div>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 text-zinc-200 text-xs leading-relaxed focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
        </div>

        <div className="px-5 py-3 bg-[#090a0f] border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors active-press"
          >
            Cancelar
          </button>
          <button
            onClick={handleOpenWhatsApp}
            disabled={sending}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm active-press flex items-center gap-1.5"
          >
            <span>{sending ? 'Abrindo...' : 'Abrir WhatsApp Web'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
