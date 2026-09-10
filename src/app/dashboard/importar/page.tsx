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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/dashboard/renovacoes" className="hover:text-slate-200">
            Radar
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Importar Planilha</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Importar Apólices via Excel ou CSV
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Faça upload da base de clientes da sua corretora. O sistema identifica as colunas automaticamente.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {report && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Importação Concluída com Sucesso!</h3>
                <p className="text-xs text-slate-400">As apólices foram inseridas no Radar de Renovações.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/renovacoes')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all"
            >
              Ver Radar de Renovações
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Importadas</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{report.importedCount}</p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Ignoradas</span>
              <p className="text-xl font-bold text-slate-300 mt-1">{report.skippedCount}</p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Alertas</span>
              <p className="text-xl font-bold text-amber-400 mt-1">{report.errors?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {!report && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            1. Selecione o Arquivo (.xlsx, .csv ou .xls)
          </h2>

          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors bg-slate-950/40">
            <input
              type="file"
              id="fileInput"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer block space-y-3">
              <div className="text-3xl">📥</div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {file ? file.name : 'Clique para selecionar ou arraste sua planilha aqui'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Excel (.xlsx, .xls) ou CSV (.csv)</p>
              </div>
            </label>
          </div>

          {loadingParse && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              <span>Analisando cabeçalhos da planilha...</span>
            </div>
          )}
        </div>
      )}

      {parseResult && !report && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Mapeamento de Colunas ({parseResult.totalRows} linhas)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_FIELDS.map((field) => (
              <div
                key={field.key}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2"
              >
                <label className="text-xs font-semibold text-slate-200">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>
                <select
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Não mapear --</option>
                  {parseResult.headers.map((h: string) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setParseResult(null);
                setFile(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={loadingExecute}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow disabled:opacity-50"
            >
              {loadingExecute ? 'Importando...' : `Confirmar Importação de ${parseResult.totalRows} Apólices`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
