import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: session.organizationId,
      },
      include: {
        interacoes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Erro ao buscar lead:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar lead' }, { status: 500 });
  }
}
