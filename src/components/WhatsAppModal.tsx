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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white border border-[#e9e8e7] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
        <div className="px-5 py-4 border-b border-[#e9e8e7] flex items-center justify-between bg-[#f5f3f3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1b1c1c]">Mensagem de Contato Rápido WhatsApp</h3>
              <p className="text-xs text-[#565f71]">
                Abertura nativa via wa.me com modelo pré-configurado
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

        <div className="px-5 py-2.5 bg-[#fbf9f9] border-b border-[#e9e8e7] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#565f71]">Destinatário: </span>
            <span className="font-semibold text-[#1b1c1c]">{targetData.cliente?.nome || targetData.nome}</span>
            <span className="text-[#565f71] ml-1.5 font-mono">({phoneInfo.formatted})</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#275ba5] text-xs font-medium border border-blue-200">
            {targetData.tipoSeguro || targetData.ramoDesejado}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1b1c1c] mb-1.5">
              Modelo de Mensagem
            </label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              className="w-full px-3 py-2 rounded-lg bg-[#f5f3f3] border border-[#e9e8e7] text-[#1b1c1c] text-xs focus:bg-white focus:outline-none focus:border-[#275ba5] transition-colors"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1b1c1c]">
                Texto da Mensagem
              </label>
              <span className="text-[11px] text-[#737782]">Você pode personalizar antes de abrir</span>
            </div>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#f5f3f3] border border-[#e9e8e7] text-[#1b1c1c] text-xs leading-relaxed focus:bg-white focus:outline-none focus:border-[#275ba5] transition-colors"
            />
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#f5f3f3] border-t border-[#e9e8e7] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-[#c3c6d3] bg-white text-[#565f71] text-xs font-medium hover:text-[#1b1c1c] hover:bg-[#efeded] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleOpenWhatsApp}
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>{sending ? 'Abrindo...' : 'Abrir WhatsApp Web'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
