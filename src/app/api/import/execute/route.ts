import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { normalizePhoneBR } from '@/lib/phone';
import { parseDateFlexible } from '@/lib/date';

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { mapping, rows } = await req.json();

    if (!mapping || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Parâmetros inválidos para importação.' }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      const rawNome = mapping.nome ? row[mapping.nome] : null;
      const rawTelefone = mapping.telefone ? row[mapping.telefone] : null;
      const rawEmail = mapping.email ? row[mapping.email] : null;
      const rawSeguradora = mapping.seguradora ? row[mapping.seguradora] : null;
      const rawTipoSeguro = mapping.tipoSeguro ? row[mapping.tipoSeguro] : null;
      const rawNumeroApolice = mapping.numeroApolice ? row[mapping.numeroApolice] : null;
      const rawDataVencimento = mapping.dataVencimento ? row[mapping.dataVencimento] : null;
      const rawDataInicio = mapping.dataInicio ? row[mapping.dataInicio] : null;

      if (!rawNome || !rawTelefone || !rawSeguradora || !rawTipoSeguro || !rawDataVencimento) {
        errors.push({
          row: rowNum,
          error: 'Campos obrigatórios ausentes (nome, telefone, seguradora, tipo ou vencimento).',
        });
        skippedCount++;
        continue;
      }

      const phoneNorm = normalizePhoneBR(rawTelefone);
      if (!phoneNorm.isValid) {
        errors.push({ row: rowNum, error: `Telefone inválido: "${rawTelefone}"` });
        skippedCount++;
        continue;
      }

      const dataVencimento = parseDateFlexible(rawDataVencimento);
      if (!dataVencimento) {
        errors.push({ row: rowNum, error: `Data de vencimento inválida: "${rawDataVencimento}"` });
        skippedCount++;
        continue;
      }

      const dataInicio = rawDataInicio ? parseDateFlexible(rawDataInicio) : null;

      try {
        const cliente = await prisma.cliente.upsert({
          where: {
            organizationId_telefone: {
              organizationId: session.organizationId,
              telefone: phoneNorm.normalized,
            },
          },
          update: {
            nome: String(rawNome).trim(),
            ...(rawEmail ? { email: String(rawEmail).trim().toLowerCase() } : {}),
          },
          create: {
            organizationId: session.organizationId,
            nome: String(rawNome).trim(),
            telefone: phoneNorm.normalized,
            email: rawEmail ? String(rawEmail).trim().toLowerCase() : null,
          },
        });

        await prisma.apolice.create({
          data: {
            organizationId: session.organizationId,
            clienteId: cliente.id,
            seguradora: String(rawSeguradora).trim(),
            tipoSeguro: String(rawTipoSeguro).trim(),
            numeroApolice: rawNumeroApolice ? String(rawNumeroApolice).trim() : null,
            dataVencimento,
            dataInicio,
            status: dataVencimento < new Date() ? 'vencida' : 'ativa',
          },
        });

        importedCount++;
      } catch (err: any) {
        errors.push({ row: rowNum, error: err.message || 'Erro de gravação' });
        skippedCount++;
      }
    }

    return NextResponse.json({ success: true, importedCount, skippedCount, errors });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao executar importação.' }, { status: 500 });
  }
}
