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
  targetData: any | null; // pode ser uma Apólice ou um Lead
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
              💬
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Disparar WhatsApp (wa.me)</h3>
              <p className="text-xs text-slate-400">
                Sem custos de API da Meta — abre direto no seu WhatsApp
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800">
            ✕
          </button>
        </div>

        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Destinatário: </span>
            <span className="font-semibold text-slate-200">{targetData.cliente?.nome || targetData.nome}</span>
            <span className="text-slate-400 ml-2">({phoneInfo.formatted})</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium border border-blue-500/20">
            {targetData.tipoSeguro || targetData.ramoDesejado}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Selecione o Modelo de Mensagem:
            </label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Texto da Mensagem:
              </label>
              <span className="text-[11px] text-slate-400">Edite antes de enviar se desejar</span>
            </div>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs leading-relaxed focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleOpenWhatsApp}
            disabled={sending}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2"
          >
            <span>{sending ? 'Abrindo...' : 'Abrir no WhatsApp Web'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
