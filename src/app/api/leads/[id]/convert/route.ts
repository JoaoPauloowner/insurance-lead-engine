import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const { seguradora, numeroApolice, valorPremio } = await req.json().catch(() => ({}));

    const lead = await prisma.lead.findFirst({
      where: { id, organizationId: session.organizationId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    // 1. Cria ou recupera o Cliente na carteira
    const cliente = await prisma.cliente.upsert({
      where: {
        organizationId_telefone: {
          organizationId: session.organizationId,
          telefone: lead.telefone,
        },
      },
      update: {
        nome: lead.nome,
        ...(lead.email ? { email: lead.email } : {}),
      },
      create: {
        organizationId: session.organizationId,
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email,
      },
    });

    // 2. Cria a nova Apólice com vigência padrão de 1 ano
    const dataInicio = new Date();
    const dataVencimento = new Date();
    dataVencimento.setFullYear(dataVencimento.getFullYear() + 1);

    const apolice = await prisma.apolice.create({
      data: {
        organizationId: session.organizationId,
        clienteId: cliente.id,
        seguradora: seguradora || 'Porto Seguro',
        tipoSeguro: lead.ramoDesejado || 'Auto',
        numeroApolice: numeroApolice || `APO-${Date.now().toString().slice(-6)}`,
        dataInicio,
        dataVencimento,
        status: 'ativa',
      },
    });

    // 3. Atualiza o status do Lead para convertido
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: 'convertido',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead convertido com sucesso em cliente e nova apólice inserida no Radar de Renovação!',
      clienteId: cliente.id,
      apoliceId: apolice.id,
    });
  } catch (error: any) {
    console.error('Erro ao converter lead:', error);
    return NextResponse.json({ error: error.message || 'Erro ao converter lead' }, { status: 500 });
  }
}
