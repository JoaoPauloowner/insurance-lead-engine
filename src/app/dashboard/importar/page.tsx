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
      setErrorMessage(err.message || 'Erro ao processar arquivo.');
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
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5 font-mono">
          <Link href="/dashboard/renovacoes" className="hover:text-blue-400 transition-colors">
            Radar de Renovações
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">Importação</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Importar Carteira de Clientes
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
          Envie sua planilha em formato Excel ou CSV. O sistema realiza a identificação automática de colunas e valida os dados de contato.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {report && (
        <div className="p-5 rounded-xl bg-[#10121a] border border-emerald-500/30 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Importação Concluída com Sucesso</h3>
                <p className="text-xs text-zinc-400">As apólices foram inseridas no Radar de Renovações.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/renovacoes')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm cursor-pointer active-press"
            >
              Acessar Radar de Renovações
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-[#090a0f] rounded-lg border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">Registros Importados</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{report.importedCount}</p>
            </div>
            <div className="p-3.5 bg-[#090a0f] rounded-lg border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">Ignorados / Duplicados</span>
              <p className="text-2xl font-bold text-zinc-300 mt-1 tabular-nums">{report.skippedCount}</p>
            </div>
            <div className="p-3.5 bg-[#090a0f] rounded-lg border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">Alertas de Formatação</span>
              <p className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">{report.errors?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {!report && (
        <div className="p-5 rounded-xl bg-[#10121a] border border-zinc-800/80 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <span>Passo 1:</span> Selecione o arquivo (.xlsx, .csv ou .xls)
          </h2>

          <div className="border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-8 text-center transition-colors bg-[#090a0f] group">
            <input
              type="file"
              id="fileInput"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer block space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 mx-auto">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">
                  {file ? file.name : 'Clique para selecionar ou arraste o arquivo aqui'}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Formatos suportados: Excel (.xlsx, .xls) ou CSV delimitado por vírgula</p>
              </div>
            </label>
          </div>

          {loadingParse && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-blue-400">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent" />
              <span>Lendo cabeçalhos e mapeando colunas...</span>
            </div>
          )}
        </div>
      )}

      {parseResult && !report && (
        <div className="p-5 rounded-xl bg-[#10121a] border border-zinc-800/80 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-xs font-semibold text-zinc-200">
              Passo 2: Mapeamento de Colunas ({parseResult.totalRows} linhas identificadas)
            </h2>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
              Mapeamento Automático
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SYSTEM_FIELDS.map((field) => (
              <div
                key={field.key}
                className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800 flex flex-col gap-1.5"
              >
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.required ? (
                    <span className="text-rose-400 text-[10px]">*Obrigatório</span>
                  ) : (
                    <span className="text-zinc-500 text-[10px]">Opcional</span>
                  )}
                </label>
                <select
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#10121a] border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
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

          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              onClick={() => {
                setParseResult(null);
                setFile(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer active-press"
            >
              Cancelar
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={loadingExecute}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer disabled:opacity-50 active-press"
            >
              {loadingExecute ? 'Gravando...' : `Confirmar Importação de ${parseResult.totalRows} Apólices`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
