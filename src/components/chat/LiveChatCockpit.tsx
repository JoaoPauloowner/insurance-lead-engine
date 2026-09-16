'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'lead' | 'ia' | 'corretor' | 'sistema';
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  nome: string;
  telefone: string;
  ramo: string;
  canal: 'whatsapp' | 'voz';
  score: number;
  statusAtendimento: 'ia_respondendo' | 'aguardando_corretor' | 'finalizado';
  speedToLead: string;
  ultimaMensagem: string;
  horario: string;
  audioDuration?: string;
  mensagens: ChatMessage[];
  blueprintResumo?: {
    perfil: string;
    cobertura: string;
    urgencia: string;
  };
}

export default function LiveChatCockpit({ initialLeadId }: { initialLeadId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [isTakeoverActive, setIsTakeoverActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [complianceNotice, setComplianceNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/chat/conversations');
        if (res.ok) {
          const data = await res.json();
          if (data.conversations && data.conversations.length > 0) {
            setConversations(data.conversations);
            if (initialLeadId) {
              const matched = data.conversations.find((c: Conversation) => c.leadId === initialLeadId);
              if (matched) {
                setSelectedId(matched.id);
                return;
              }
            }
            setSelectedId(data.conversations[0].id);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar conversas:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, [initialLeadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, conversations]);

  const activeConversation =
    conversations.find((c) => c.id === selectedId) || conversations[0];

  const filteredConversations = conversations.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.ramo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.telefone.includes(searchFilter)
  );

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConversation || isSending) return;

    const currentText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    setComplianceNotice(null);

    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: tempId,
      sender: 'corretor',
      text: currentText,
      time: timeFormatted,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            statusAtendimento: 'aguardando_corretor',
            ultimaMensagem: currentText,
            horario: timeFormatted,
            mensagens: [...c.mensagens, newMsg],
          };
        }
        return c;
      })
    );

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: activeConversation.leadId,
          text: currentText,
          sender: 'corretor',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.compliance?.wasSanitized) {
          setComplianceNotice(data.compliance.blockedReason || 'Mensagem ajustada conforme SUSEP.');
        }

        if (data.message) {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConversation.id) {
                return {
                  ...c,
                  mensagens: c.mensagens.map((m) => (m.id === tempId ? data.message : m)),
                };
              }
              return c;
            })
          );
        }
      }
    } catch (err) {
      console.error('Falha ao enviar mensagem:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleTakeover = () => {
    setIsTakeoverActive(!isTakeoverActive);
    if (!isTakeoverActive && activeConversation) {
      const timeFormatted = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;
      const systemNotice: ChatMessage = {
        id: `takeover-${Date.now()}`,
        sender: 'sistema',
        text: '👤 O corretor assumiu o controle deste atendimento (IA em modo espectador).',
        time: timeFormatted,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              statusAtendimento: 'aguardando_corretor',
              mensagens: [...c.mensagens, systemNotice],
            };
          }
          return c;
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center bg-[var(--surface-2)] rounded-[16px] border border-[var(--border)]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-[var(--purple)] animate-spin">
            progress_activity
          </span>
          <p className="text-xs font-mono text-[var(--text-mute)]">
            Carregando Live Chat Cockpit...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner: Status da Esteira Speed-to-Lead — CentralFlow Design */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-2)] p-4 rounded-[16px] border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[var(--purple)] to-[var(--orange)] text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">forum</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-sora font-bold text-white tracking-tight">
                Live Chat Cockpit & Speed-to-Lead
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0AFF921A] text-[#0AFF92] border border-[#0AFF9233]">
                ● Ativo (&lt; 45s SLA)
              </span>
            </div>
            <p className="text-xs text-[var(--text-mute)] font-jakarta">
              Central omnicanal de WhatsApp e Voz Ativa com motor de qualificação e compliance SUSEP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-faint)]">Conversas no Radar</p>
            <p className="text-sm font-mono font-bold text-white">{conversations.length} Atendimentos</p>
          </div>
        </div>
      </div>

      {/* Compliance Warning Toast if triggered */}
      {complianceNotice && (
        <div className="flex items-center justify-between bg-[#FF7A451A] border border-[#FF7A4533] text-[#FF7A45] px-4 py-3 rounded-[12px] text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>
              <strong>Compliance SUSEP:</strong> {complianceNotice}
            </span>
          </div>
          <button
            onClick={() => setComplianceNotice(null)}
            className="hover:opacity-80 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Cockpit Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Left Column: Conversation List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-[var(--surface-2)] rounded-[16px] border border-[var(--border)] overflow-hidden shadow-xs">
          {/* Search Box */}
          <div className="p-3 border-b border-[var(--border)]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[var(--text-mute)] text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar cliente, ramo ou fone..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--purple-border)]"
              />
            </div>
          </div>

          {/* Conversation List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-mute)] font-mono">
                Nenhuma conversa encontrada.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConversation?.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedId(conv.id);
                      setIsTakeoverActive(false);
                      setComplianceNotice(null);
                    }}
                    className={`w-full text-left p-3.5 transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#1E1B2E] border-l-4 border-l-[var(--purple)]'
                        : 'hover:bg-[var(--surface)] border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            conv.canal === 'voz' ? 'text-[var(--purple)]' : 'text-[var(--orange)]'
                          }`}
                        >
                          {conv.canal === 'voz' ? 'phone_in_talk' : 'chat'}
                        </span>
                        <span className="text-xs font-jakarta font-bold text-white truncate">
                          {conv.nome}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-mute)] font-mono">{conv.horario}</span>
                    </div>

                    <p className="text-[11px] text-[var(--text-mute)] line-clamp-1">
                      {conv.ultimaMensagem}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--surface-3)] text-[var(--text-mute)] border border-[var(--border)] capitalize">
                          {conv.ramo}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            conv.score >= 80
                              ? 'bg-[#0AFF921A] text-[#0AFF92] border border-[#0AFF9233]'
                              : conv.score >= 50
                              ? 'bg-[#FF7A451A] text-[#FF7A45] border border-[#FF7A4533]'
                              : 'bg-[#8B5CF61A] text-[#8B5CF6] border border-[#8B5CF633]'
                          }`}
                        >
                          Score {conv.score}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-[var(--text-faint)]">
                        ⚡ {conv.speedToLead}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation & Dossier (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-[var(--surface-2)] rounded-[16px] border border-[var(--border)] overflow-hidden shadow-xs">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--border)] bg-[#0E0E10] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-white shadow-xs ${
                      activeConversation.canal === 'voz' ? 'bg-[var(--purple)]' : 'bg-[var(--orange)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {activeConversation.canal === 'voz' ? 'mic' : 'forum'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-sora font-bold text-white">
                        {activeConversation.nome}
                      </h3>
                      <span className="text-xs text-[var(--text-mute)] font-mono">
                        {activeConversation.telefone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-[var(--text-mute)] capitalize">
                        Ramo: {activeConversation.ramo}
                      </span>
                      <span className="text-[10px] text-[var(--text-faint)]">•</span>
                      <span className="text-[10px] font-mono text-[#0AFF92]">
                        Speed-to-Lead: {activeConversation.speedToLead}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Handover & Takeover Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleTakeover}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-jakarta font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                      isTakeoverActive
                        ? 'bg-[var(--orange)] text-white hover:opacity-90'
                        : 'bg-[var(--surface)] hover:bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isTakeoverActive ? 'lock' : 'pan_tool'}
                    </span>
                    {isTakeoverActive ? 'Em Atendimento Humano' : 'Assumir Atendimento'}
                  </button>

                  <a
                    href={`/dashboard/leads/${activeConversation.leadId}`}
                    className="px-3 py-1.5 rounded-[10px] text-xs font-jakarta font-semibold bg-[var(--purple)] text-white hover:opacity-90 flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">badge</span>
                    Ver Lead
                  </a>
                </div>
              </div>

              {/* Lead Underwriting Blueprint Bar */}
              {activeConversation.blueprintResumo && (
                <div className="bg-[var(--surface-3)] border-b border-[var(--border)] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap font-jakarta">
                    <div>
                      <span className="text-[var(--text-mute)] mr-1 text-[11px]">Perfil:</span>
                      <span className="font-semibold text-white text-[11px]">
                        {activeConversation.blueprintResumo.perfil}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-mute)] mr-1 text-[11px]">Cobertura:</span>
                      <span className="font-semibold text-white text-[11px]">
                        {activeConversation.blueprintResumo.cobertura}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-mute)] mr-1 text-[11px]">Urgência:</span>
                      <span className="font-semibold text-[var(--orange)] text-[11px]">
                        {activeConversation.blueprintResumo.urgencia}
                      </span>
                    </div>
                  </div>

                  {activeConversation.canal === 'voz' && (
                    <div className="flex items-center gap-2 bg-[#1E1B2E] border border-[#8B5CF633] px-2 py-0.5 rounded-[8px]">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="text-[var(--purple)] hover:text-white flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isPlayingAudio ? 'pause_circle' : 'play_circle'}
                        </span>
                        {isPlayingAudio ? 'Pausar Áudio' : 'Ouvir Vapi'}
                      </button>
                      <span className="text-[10px] text-[var(--text-mute)] font-mono">
                        ({activeConversation.audioDuration || '01:42'})
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Messages Flow */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--surface)]">
                {activeConversation.mensagens.map((msg) => {
                  if (msg.sender === 'sistema') {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="bg-[#1E1B2E] border border-[#8B5CF633] text-[var(--text-mute)] text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs font-mono">
                          <span className="material-symbols-outlined text-[14px] text-[var(--purple)]">bolt</span>
                          {msg.text}
                          <span className="text-[9px] opacity-70 ml-1">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const isMe = msg.sender === 'corretor';
                  const isIa = msg.sender === 'ia';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMe ? 'items-end' : isIa ? 'items-start' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-faint)]">
                          {isMe
                            ? 'Você (Corretor)'
                            : isIa
                            ? 'Aria (Assistente IA)'
                            : activeConversation.nome}
                        </span>
                        <span className="text-[9px] text-[var(--text-mute)] font-mono">{msg.time}</span>
                      </div>

                      <div
                        className={`max-w-[75%] rounded-[14px] px-4 py-2.5 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[var(--purple)] text-white rounded-br-none shadow-sm'
                            : isIa
                            ? 'bg-[#1E1B2E] text-[var(--text)] border border-[#8B5CF633] rounded-bl-none'
                            : 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-bl-none'
                        }`}
                      >
                        <p className="font-jakarta">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[var(--border)] bg-[var(--surface-2)] flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      isTakeoverActive
                        ? 'Digite sua resposta como Corretor...'
                        : 'Enviar mensagem direta no WhatsApp do lead...'
                    }
                    disabled={isSending}
                    className="flex-1 px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--purple-border)]"
                  />

                  <button
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className="px-4 py-2 rounded-[10px] bg-[var(--purple)] text-white text-xs font-jakarta font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>{isSending ? 'Enviando...' : 'Enviar'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-mute)] px-1">
                  <div className="flex items-center gap-1 text-[#0AFF92]">
                    <span className="material-symbols-outlined text-[13px]">
                      verified
                    </span>
                    <span>Disparo via WhatsApp API • Proteção SUSEP Ativa</span>
                  </div>
                  <span className="hidden sm:inline text-[var(--text-faint)]">
                    Enter para enviar
                  </span>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-mute)] font-mono text-xs">
              Selecione uma conversa para abrir o cockpit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
