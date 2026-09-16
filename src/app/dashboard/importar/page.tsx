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
    <div className="space-y-6 max-w-4xl mx-auto pb-20 font-sans">
      <div className="border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-2 text-xs text-[var(--text-mute)] mb-1.5 font-medium">
          <Link href="/dashboard/renovacoes" className="hover:text-[var(--purple)] transition-colors">
            Radar de Renovações
          </Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Importação</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
          Importar Carteira de Clientes & Apólices
        </h1>
        <p className="text-sm text-[var(--text-mute)] mt-0.5 max-w-xl">
          Envie sua planilha em formato Excel (.xlsx) ou CSV. O sistema detecta automaticamente os dados de contato e vigência.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {report && (
        <div className="p-6 rounded-xl bg-[var(--surface-2)] border border-emerald-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center font-bold text-base shrink-0">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Importação Concluída com Sucesso</h3>
                <p className="text-xs text-[var(--text-mute)]">As apólices foram inseridas no Radar de Renovações.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/renovacoes')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Acessar Radar de Renovações
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <span className="text-xs text-[var(--text-mute)] block">Registros Importados</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">{report.importedCount}</p>
            </div>
            <div className="p-3.5 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <span className="text-xs text-[var(--text-mute)] block">Ignorados / Duplicados</span>
              <p className="text-2xl font-bold text-[var(--text)] mt-1 tabular-nums">{report.skippedCount}</p>
            </div>
            <div className="p-3.5 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <span className="text-xs text-[var(--text-mute)] block">Alertas de Formatação</span>
              <p className="text-2xl font-bold text-amber-700 mt-1 tabular-nums">{report.errors?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {!report && (
        <div className="p-6 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-xs font-bold text-[var(--text)] flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[var(--purple)] font-semibold">Passo 1</span>
            <span>Selecione o arquivo (.xlsx, .csv ou .xls)</span>
          </h2>

          <div className="border-2 border-dashed border-[var(--border)] hover:border-[#275ba5] rounded-xl p-8 text-center transition-colors bg-[#fbf9f9] group">
            <input
              type="file"
              id="fileInput"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer block space-y-2.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[var(--purple)] mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--purple)] transition-colors">
                  {file ? file.name : 'Clique para selecionar ou arraste o arquivo aqui'}
                </p>
                <p className="text-xs text-[var(--text-mute)] mt-0.5">Formatos suportados: Planilha Excel (.xlsx) ou CSV com cabeçalhos</p>
              </div>
            </label>
          </div>

          {loadingParse && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-[var(--purple)]">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#275ba5] border-t-transparent" />
              <span>Lendo cabeçalhos e mapeando colunas...</span>
            </div>
          )}
        </div>
      )}

      {parseResult && !report && (
        <div className="p-6 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-sm font-bold text-[var(--text)]">
              Passo 2: Mapeamento de Colunas ({parseResult.totalRows} linhas identificadas)
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Mapeamento Inteligente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_FIELDS.map((field) => (
              <div
                key={field.key}
                className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-1.5"
              >
                <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.required ? (
                    <span className="text-rose-700 text-[10px] font-bold">*Obrigatório</span>
                  ) : (
                    <span className="text-[var(--text-mute)] text-[10px]">Opcional</span>
                  )}
                </label>
                <select
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[#275ba5] transition-colors"
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

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              onClick={() => {
                setParseResult(null);
                setFile(null);
              }}
              className="px-3.5 py-2 rounded-lg border border-[var(--border)] text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--surface)] text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={loadingExecute}
              className="px-4 py-2 rounded-lg bg-[var(--purple)] hover:bg-[#1a4784] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingExecute ? 'Importando...' : `Confirmar Importação de ${parseResult.totalRows} Apólices`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
