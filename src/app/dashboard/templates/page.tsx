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
    if (!confirm('Deseja excluir este modelo?')) return;
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    fetchTemplates();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
            <Link href="/dashboard/leads" className="hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">Modelos de Mensagem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Modelos de Mensagens WhatsApp
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure templates conversacionais com interpolação dinâmica de variáveis para envio instantâneo em 1 clique.
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            <span>Novo Modelo</span>
          </button>
        )}
      </div>

      {/* Helpful Variables Chip Bar */}
      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
        <span className="font-mono font-bold text-slate-300">Variáveis disponíveis:</span>
        <code className="bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/20">{`{cliente}`}</code>
        <code className="bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/20">{`{corretora}`}</code>
        <code className="bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/20">{`{corretor}`}</code>
        <code className="bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/20">{`{tipo_seguro}`}</code>
        <code className="bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/20">{`{seguradora}`}</code>
        <code className="bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/20">{`{dias_vencimento}`}</code>
      </div>

      {(isCreating || editingId) && (
        <div className="p-6 rounded-2xl glass-panel border border-blue-500/50 shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>📝</span>
            <span>{isCreating ? 'Novo Modelo de Mensagem' : 'Editar Modelo'}</span>
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Nome de Identificação
              </label>
              <input
                type="text"
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Abordagem Inicial Tráfego Pago"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/[0.1] text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Corpo da Mensagem (suporta emojis e quebra de linha)
              </label>
              <textarea
                rows={4}
                required
                value={formCorpo}
                onChange={(e) => setFormCorpo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/[0.1] text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors font-mono leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Modelo'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">Carregando modelos...</div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="glass-card-interactive p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 border-b border-white/[0.06] pb-2.5">
                  <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>💬</span>
                    <span>{tpl.nome}</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(tpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/[0.05] transition-colors cursor-pointer text-xs"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-xs"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/[0.04] whitespace-pre-wrap font-mono">
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
