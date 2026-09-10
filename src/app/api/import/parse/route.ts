import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { guessColumnMapping } from '@/lib/matcher';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    await requireAuth();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json({ error: 'A planilha está vazia.' }, { status: 400 });
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: '',
      raw: false,
    });

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado encontrado na primeira aba.' }, { status: 400 });
    }

    const headers = Object.keys(rawData[0]);
    const suggestedMapping = guessColumnMapping(headers);
    const previewRows = rawData.slice(0, 5);

    return NextResponse.json({
      success: true,
      filename: file.name,
      sheetName: firstSheetName,
      totalRows: rawData.length,
      headers,
      suggestedMapping,
      previewRows,
      allRows: rawData,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao processar arquivo Excel/CSV.' }, { status: 500 });
  }
}
