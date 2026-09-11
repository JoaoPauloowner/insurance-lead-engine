'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SYSTEM_FIELDS } from '@/lib/matcher';

export default function ImportarPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingExecute, setLoadingExecute] = useState(false);
  const [parseResult, setParseResult] = useState<any | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [report, setReport] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setParseResult(null);
    setReport(null);
    setErrorMessage('');
    setLoadingParse(true);

    try {
      const formData = new FormData();
      formData.append('file', selected);

      const res = await fetch('/api/import/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar planilha.');

      setParseResult(data);
      setMapping(data.suggestedMapping || {});
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao ler arquivo.');
    } finally {
      setLoadingParse(false);
    }
  };

  const handleMappingChange = (fieldKey: string, columnHeader: string) => {
    setMapping((prev) => ({ ...prev, [fieldKey]: columnHeader }));
  };

  const handleExecuteImport = async () => {
    if (!parseResult || !parseResult.allRows) return;

    const requiredFields = SYSTEM_FIELDS.filter((f) => f.required);
    for (const req of requiredFields) {
      if (!mapping[req.key]) {
        setErrorMessage(`Selecione a coluna para o campo obrigatório: ${req.label}`);
        return;
      }
    }

    setLoadingExecute(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapping,
          rows: parseResult.allRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro durante a importação.');
      setReport(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao importar dados.');
    } finally {
      setLoadingExecute(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
          <Link href="/dashboard/renovacoes" className="hover:text-blue-400 transition-colors">
            Radar de Renovações
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Importação em Massa</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Importar Carteira de Apólices
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Faça upload da base legada de clientes da sua corretora em Excel ou CSV. O motor inteligente faz o mapeamento semântico de colunas e valida telefones em E.164.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {report && (
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/40 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Importação Concluída com Sucesso!</h3>
                <p className="text-xs text-slate-400">As apólices foram inseridas no Radar de Renovações com cálculo de urgência.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/renovacoes')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-black text-xs transition-all shadow-md cursor-pointer"
            >
              Ver Radar de Renovações →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-black/40 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Importadas</span>
              <p className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">{report.importedCount}</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Ignoradas</span>
              <p className="text-2xl font-black text-slate-300 mt-1 tabular-nums">{report.skippedCount}</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Alertas</span>
              <p className="text-2xl font-black text-amber-400 mt-1 tabular-nums">{report.errors?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {!report && (
        <div className="p-6 rounded-2xl glass-panel space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>1.</span> Selecione o Arquivo (.xlsx, .csv ou .xls)
          </h2>

          <div className="border-2 border-dashed border-white/[0.1] hover:border-blue-500/50 rounded-2xl p-10 text-center transition-colors bg-black/20 group">
            <input
              type="file"
              id="fileInput"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer block space-y-3">
              <div className="text-4xl group-hover:scale-110 transition-transform">📥</div>
              <div>
                <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {file ? file.name : 'Clique para selecionar ou arraste sua planilha aqui'}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">Suporta formatos Excel (.xlsx, .xls) ou CSV delimitado por vírgula/ponto-e-vírgula</p>
              </div>
            </label>
          </div>

          {loadingParse && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-blue-400 font-mono">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              <span>Analisando cabeçalhos e inferindo campos da apólice...</span>
            </div>
          )}
        </div>
      )}

      {parseResult && !report && (
        <div className="p-6 rounded-2xl glass-panel space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Mapeamento Semântico de Colunas ({parseResult.totalRows} linhas detectadas)
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Auto-Mapping Ativo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_FIELDS.map((field) => (
              <div
                key={field.key}
                className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col gap-2"
              >
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.required ? (
                    <span className="text-rose-400 text-[10px] font-mono font-bold">*Obrigatório</span>
                  ) : (
                    <span className="text-slate-500 text-[10px] font-mono">Opcional</span>
                  )}
                </label>
                <select
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">-- Ignorar campo --</option>
                  {parseResult.headers.map((h: string) => (
                    <option key={h} value={h}>
                      Coluna: {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              onClick={() => {
                setParseResult(null);
                setFile(null);
              }}
              className="px-4 py-2 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={loadingExecute}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingExecute ? 'Processando e Gravando...' : `Confirmar Importação de ${parseResult.totalRows} Apólices`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
