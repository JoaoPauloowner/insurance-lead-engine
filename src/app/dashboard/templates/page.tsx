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
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5 font-mono">
            <Link href="/dashboard/leads" className="hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-zinc-200 font-medium">Comunicação</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Modelos de Mensagem WhatsApp
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
            Gerenciamento de roteiros pré-configurados com substituição dinâmica de dados do cliente.
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            onClick={handleStartCreate}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer active-press"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Novo Modelo</span>
          </button>
        )}
      </div>

      {/* Variables Chip Bar */}
      <div className="p-3 rounded-lg bg-[#10121a] border border-zinc-800 flex items-center gap-2 flex-wrap text-xs text-zinc-400">
        <span className="font-medium text-zinc-300">Variáveis dinâmicas:</span>
        <code className="bg-[#090a0f] text-zinc-300 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-800">{`{cliente}`}</code>
        <code className="bg-[#090a0f] text-zinc-300 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-800">{`{corretora}`}</code>
        <code className="bg-[#090a0f] text-zinc-300 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-800">{`{corretor}`}</code>
        <code className="bg-[#090a0f] text-zinc-300 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-800">{`{tipo_seguro}`}</code>
        <code className="bg-[#090a0f] text-zinc-300 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-800">{`{seguradora}`}</code>
        <code className="bg-[#090a0f] text-zinc-300 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-800">{`{dias_vencimento}`}</code>
      </div>

      {(isCreating || editingId) && (
        <div className="p-5 rounded-xl bg-[#10121a] border border-zinc-700 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold text-white">
            {isCreating ? 'Cadastrar Novo Modelo' : 'Editar Modelo Existente'}
          </h2>
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Título do modelo
              </label>
              <input
                type="text"
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Abordagem Inicial Tráfego Pago"
                className="w-full px-3 py-2 rounded-lg bg-[#090a0f] border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Texto da mensagem
              </label>
              <textarea
                rows={4}
                required
                value={formCorpo}
                onChange={(e) => setFormCorpo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#090a0f] border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-600 transition-colors leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer active-press"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer disabled:opacity-50 active-press"
              >
                {saving ? 'Salvando...' : 'Salvar Modelo'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs text-zinc-400">Carregando modelos...</div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-[#10121a] border border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 border-b border-zinc-800 pb-2.5">
                  <h3 className="font-semibold text-white text-xs">
                    {tpl.nome}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(tpl)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer text-xs active-press"
                      title="Editar"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-xs active-press"
                      title="Excluir"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#090a0f] p-3 rounded-lg border border-zinc-800 whitespace-pre-wrap font-sans">
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
