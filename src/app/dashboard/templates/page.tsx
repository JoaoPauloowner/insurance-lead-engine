'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Template {
  id: string;
  nome: string;
  corpo: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formCorpo, setFormCorpo] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleStartCreate = () => {
    setEditingId(null);
    setFormNome('');
    setFormCorpo('Olá {cliente}! Aqui é da {corretora}. Recebemos sua solicitação de cotação de seguro {tipo_seguro}. Podemos conversar?');
    setIsCreating(true);
  };

  const handleStartEdit = (tpl: Template) => {
    setIsCreating(false);
    setEditingId(tpl.id);
    setFormNome(tpl.nome);
    setFormCorpo(tpl.corpo);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isCreating) {
        await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: formNome, corpo: formCorpo }),
        });
      } else if (editingId) {
        await fetch(`/api/templates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: formNome, corpo: formCorpo }),
        });
      }
      setIsCreating(false);
      setEditingId(null);
      fetchTemplates();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este modelo de mensagem?')) return;
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    fetchTemplates();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-mute)] mb-1.5 font-medium">
            <Link href="/dashboard/leads" className="hover:text-[var(--purple)] transition-colors">
              Leads
            </Link>
            <span>/</span>
            <span className="text-[var(--text)] font-semibold">Templates</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            Modelos de Mensagem WhatsApp
          </h1>
          <p className="text-sm text-[var(--text-mute)] mt-0.5 max-w-xl">
            Roteiros de primeiro contato e renovação com substituição automática de dados do cliente.
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 rounded-lg bg-[var(--purple)] hover:bg-[#1a4784] text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Novo Modelo</span>
          </button>
        )}
      </div>

      {/* Variables Chip Bar */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2 flex-wrap text-xs text-[var(--text-mute)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <span className="font-semibold text-[var(--text)]">Variáveis disponíveis:</span>
        <code className="bg-[var(--surface)] text-[var(--text)] px-2 py-0.5 rounded font-mono text-[11px] border border-[var(--border)]">{`{cliente}`}</code>
        <code className="bg-[var(--surface)] text-[var(--text)] px-2 py-0.5 rounded font-mono text-[11px] border border-[var(--border)]">{`{corretora}`}</code>
        <code className="bg-[var(--surface)] text-[var(--text)] px-2 py-0.5 rounded font-mono text-[11px] border border-[var(--border)]">{`{corretor}`}</code>
        <code className="bg-[var(--surface)] text-[var(--text)] px-2 py-0.5 rounded font-mono text-[11px] border border-[var(--border)]">{`{tipo_seguro}`}</code>
        <code className="bg-[var(--surface)] text-[var(--text)] px-2 py-0.5 rounded font-mono text-[11px] border border-[var(--border)]">{`{seguradora}`}</code>
        <code className="bg-[var(--surface)] text-[var(--text)] px-2 py-0.5 rounded font-mono text-[11px] border border-[var(--border)]">{`{dias_vencimento}`}</code>
      </div>

      {(isCreating || editingId) && (
        <div className="p-6 rounded-xl bg-[var(--surface-2)] border border-[#275ba5] shadow-md space-y-4">
          <h2 className="text-sm font-bold text-[var(--text)]">
            {isCreating ? 'Cadastrar Novo Modelo' : 'Editar Modelo Existente'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Nome do Modelo
              </label>
              <input
                type="text"
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Abordagem Inicial Seguro Auto"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs focus:bg-[var(--surface-2)] focus:outline-none focus:border-[#275ba5] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Conteúdo da Mensagem
              </label>
              <textarea
                rows={4}
                required
                value={formCorpo}
                onChange={(e) => setFormCorpo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs leading-relaxed focus:bg-[var(--surface-2)] focus:outline-none focus:border-[#275ba5] transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="px-3.5 py-2 rounded-lg border border-[var(--border)] text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--surface)] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[var(--purple)] hover:bg-[#1a4784] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Modelo'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs text-[var(--text-mute)]">Carregando modelos...</div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-[var(--surface-2)] border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[var(--border)] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 border-b border-[var(--border)] pb-2.5">
                  <h3 className="font-bold text-[var(--text)] text-xs">
                    {tpl.nome}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(tpl)}
                      className="p-1 rounded-md text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer text-xs"
                      title="Editar"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-1 rounded-md text-[var(--text-mute)] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-xs"
                      title="Excluir"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-mute)] leading-relaxed bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] whitespace-pre-wrap font-sans">
                  {tpl.corpo}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
