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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/dashboard/leads" className="hover:text-slate-200">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">Modelos de Mensagem</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Modelos de Mensagens WhatsApp
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure templates com variáveis para disparar contatos com 1 clique.
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            <span>Novo Modelo</span>
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-blue-500/40 shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            {isCreating ? 'Novo Modelo' : 'Editar Modelo'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nome</label>
              <input
                type="text"
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Texto</label>
              <textarea
                rows={4}
                required
                value={formCorpo}
                onChange={(e) => setFormCorpo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400">Carregando modelos...</div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-100 text-xs">{tpl.nome}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStartEdit(tpl)} className="text-slate-400 hover:text-blue-400 text-xs">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(tpl.id)} className="text-slate-400 hover:text-rose-400 text-xs">
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
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
