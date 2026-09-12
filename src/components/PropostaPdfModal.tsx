'use client';

import React, { useRef } from 'react';

interface InsurerOption {
  id: string;
  name: string;
  susep: string;
  match: string;
  isBest?: boolean;
  casco: string;
  rcf: string;
  franquia: string;
  franquiaTipo: string;
  assistencia: string;
  mensal: string;
  total: string;
  descontoPix: string;
}

interface PropostaPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInsurer: InsurerOption;
  allInsurers: InsurerOption[];
  proponente: {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    cep: string;
    veiculo: string;
    anoModelo: string;
    fipeValor: string;
    placa: string;
  };
  coberturas: {
    fipe: boolean;
    rcf: boolean;
    carroReserva: boolean;
    vidros: boolean;
    guincho: boolean;
  };
  brokerInfo?: {
    nome: string;
    orgName: string;
    susep?: string;
    telefone?: string;
    email?: string;
  };
}

export default function PropostaPdfModal({
  isOpen,
  onClose,
  selectedInsurer,
  allInsurers,
  proponente,
  coberturas,
  brokerInfo = {
    nome: 'Carlos Silva / Corretor Responsável',
    orgName: 'LeadEngine Prime Corretora de Seguros',
    susep: 'SUSEP 10.204.819-2',
    telefone: '(11) 98765-4321',
    email: 'contato@primecorretora.com.br',
  },
}: PropostaPdfModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const propostaId = `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  const dataValidade = new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `📋 *ESTUDO DE SEGURO AUTO — ${brokerInfo.orgName}*\n\n` +
      `👤 *Segurado:* ${proponente.nome}\n` +
      `🚗 *Veículo:* ${proponente.veiculo} (${proponente.anoModelo}) | FIPE: ${proponente.fipeValor}\n` +
      `🛡️ *Seguradora Recomendada:* ${selectedInsurer.name}\n` +
      `💵 *Condição Especial PIX:* ${selectedInsurer.total} à vista\n` +
      `💳 *Parcelado sem juros:* 12x de ${selectedInsurer.mensal}\n` +
      `📍 *Franquia:* ${selectedInsurer.franquia} (${selectedInsurer.franquiaTipo})\n` +
      `🚨 *Assistência 24h:* ${selectedInsurer.assistencia}\n\n` +
      `⏳ *Proposta nº ${propostaId} válida até ${dataValidade}*.\n` +
      `Deseja que eu transmita a proposta para emissão da apólice digital?`;

    navigator.clipboard.writeText(text);
    alert('Texto formatado da proposta copiado para a área de transferência!');
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá ${proponente.nome}! Preparei o estudo de cotação para o seu ${proponente.veiculo}. A melhor opção técnica e financeira foi a *${selectedInsurer.name}*: 12x de ${selectedInsurer.mensal} ou ${selectedInsurer.total} no PIX. Franquia: ${selectedInsurer.franquia}. Proposta formal nº ${propostaId} com congelamento de taxa até ${dataValidade}. Podemos fechar?`
    );
    const cleanPhone = proponente.telefone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container Modal */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e9e8e7] my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Actions Bar (Não impresso) */}
        <div className="p-4 border-b border-[#e9e8e7] bg-[#fbf9f9] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">description</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#1b1c1c]">Proposta Comercial Timbrada</h3>
              <p className="text-xs text-[#565f71]">Pronta para impressão, geração de PDF e compartilhamento</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#c3c6d3] text-xs font-semibold text-[#1b1c1c] hover:bg-[#f5f3f3] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copiar Pitch
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              WhatsApp
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Imprimir / PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#565f71] hover:text-[#1b1c1c] hover:bg-[#f5f3f3] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Proposal Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-white text-[#1b1c1c] font-sans print:p-0" ref={printRef}>
          {/* Document Header Timbrado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                LE
              </div>
              <div>
                <h1 className="text-base font-bold text-primary tracking-tight">{brokerInfo.orgName}</h1>
                <p className="text-xs text-[#565f71]">{brokerInfo.susep} • {brokerInfo.email}</p>
                <p className="text-xs text-[#565f71]">Atendimento Especializado: {brokerInfo.telefone}</p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold font-mono text-[11px]">
                {propostaId}
              </span>
              <p className="text-[#565f71] mt-1">Emissão: <strong className="text-[#1b1c1c]">{dataEmissao}</strong></p>
              <p className="text-emerald-700 font-semibold">Validade: {dataValidade} (48 horas)</p>
            </div>
          </div>

          {/* Dados do Proponente e Veículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 p-4 rounded-xl bg-[#fbf9f9] border border-[#e9e8e7]">
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Dados do Segurado</span>
              <p><strong className="text-[#1b1c1c]">Nome:</strong> {proponente.nome}</p>
              <p><strong className="text-[#1b1c1c]">CPF:</strong> {proponente.cpf}</p>
              <p><strong className="text-[#1b1c1c]">Telefone:</strong> {proponente.telefone}</p>
              <p><strong className="text-[#1b1c1c]">CEP Pernoite:</strong> {proponente.cep}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Veículo Segurado</span>
              <p><strong className="text-[#1b1c1c]">Modelo:</strong> {proponente.veiculo}</p>
              <p><strong className="text-[#1b1c1c]">Ano/Modelo:</strong> {proponente.anoModelo}</p>
              <p><strong className="text-[#1b1c1c]">Valor FIPE:</strong> <span className="font-mono font-bold text-primary">{proponente.fipeValor}</span></p>
              <p><strong className="text-[#1b1c1c]">Placa:</strong> <span className="font-mono font-semibold">{proponente.placa}</span></p>
            </div>
          </div>

          {/* Opção Recomendada / Destaque */}
          <div className="my-6 p-5 rounded-xl border-2 border-primary bg-primary/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-primary/20">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-primary block">Opção Recomendada pela Corretora</span>
                <h2 className="text-xl font-bold text-[#1b1c1c] flex items-center gap-2">
                  {selectedInsurer.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-semibold">
                    {selectedInsurer.match} de Aderência
                  </span>
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-[#565f71]">Investimento à Vista (PIX):</span>
                <p className="text-2xl font-bold text-primary font-mono">{selectedInsurer.total}</p>
                <p className="text-xs text-emerald-700 font-semibold">{selectedInsurer.descontoPix}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-[11px] text-[#565f71] block">Franquia Seguradora:</span>
                <p className="font-bold text-[#1b1c1c] font-mono text-sm">{selectedInsurer.franquia}</p>
                <p className="text-[#565f71] text-[11px]">{selectedInsurer.franquiaTipo}</p>
              </div>
              <div>
                <span className="text-[11px] text-[#565f71] block">Parcelamento sem Juros:</span>
                <p className="font-bold text-[#1b1c1c] font-mono text-sm">12x de {selectedInsurer.mensal}</p>
                <p className="text-[#565f71] text-[11px]">Cartão de crédito ou débito em conta</p>
              </div>
              <div>
                <span className="text-[11px] text-[#565f71] block">Assistência 24 Horas:</span>
                <p className="font-medium text-[#1b1c1c]">{selectedInsurer.assistencia}</p>
              </div>
            </div>
          </div>

          {/* Comparativo Multisseguradoras Tabular */}
          <div className="my-6 space-y-2">
            <h3 className="text-xs font-bold text-[#1b1c1c] uppercase tracking-wider">
              Quadro Comparativo de Mercado
            </h3>
            <div className="border border-[#e9e8e7] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f5f3f3] text-[#565f71] font-semibold border-b border-[#e9e8e7]">
                    <th className="py-2.5 px-3">Seguradora</th>
                    <th className="py-2.5 px-3">Franquia</th>
                    <th className="py-2.5 px-3">Assistência 24h</th>
                    <th className="py-2.5 px-3 text-right">Parcelamento</th>
                    <th className="py-2.5 px-3 text-right">Total à Vista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9e8e7]">
                  {allInsurers.map((item) => {
                    const isRec = item.id === selectedInsurer.id;
                    return (
                      <tr key={item.id} className={isRec ? 'bg-primary/5 font-semibold' : ''}>
                        <td className="py-2.5 px-3">
                          <span className="text-[#1b1c1c] font-medium">{item.name}</span>
                          {isRec && <span className="ml-1.5 text-[10px] text-primary font-bold">(Selecionada)</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{item.franquia}</td>
                        <td className="py-2.5 px-3 text-[#565f71]">{item.assistencia}</td>
                        <td className="py-2.5 px-3 text-right font-mono">12x {item.mensal}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1b1c1c]">{item.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coberturas e Cláusulas Contratadas */}
          <div className="my-6 space-y-2">
            <h3 className="text-xs font-bold text-[#1b1c1c] uppercase tracking-wider">
              Garantias e Coberturas Inclusas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#fbf9f9] border border-[#e9e8e7] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>100% Tabela FIPE (Casco)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#fbf9f9] border border-[#e9e8e7] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>RCF Terceiros R$ 500.000</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#fbf9f9] border border-[#e9e8e7] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>Guincho 24h Ilimitado</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#fbf9f9] border border-[#e9e8e7] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>Carro Reserva 30 Dias SUV</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#fbf9f9] border border-[#e9e8e7] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>Vidros VIP + Faróis e Lanternas</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#fbf9f9] border border-[#e9e8e7] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>Danos Corporais R$ 200.000</span>
              </div>
            </div>
          </div>

          {/* Rodapé e Assinatura */}
          <div className="mt-8 pt-4 border-t border-[#e9e8e7] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#565f71]">
            <p>Documento gerado automaticamente por {brokerInfo.orgName} via LeadEngine Pro.</p>
            <p className="font-mono">Chave de Validação: {propostaId}-SEC9</p>
          </div>
        </div>
      </div>
    </div>
  );
}
