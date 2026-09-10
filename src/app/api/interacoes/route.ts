import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { apoliceId, templateId } = await req.json();

    if (!apoliceId) {
      return NextResponse.json({ error: 'apoliceId é obrigatório' }, { status: 400 });
    }

    const apolice = await prisma.apolice.findFirst({
      where: { id: apoliceId, organizationId: session.organizationId },
    });

    if (!apolice) {
      return NextResponse.json({ error: 'Apólice não encontrada' }, { status: 404 });
    }

    const interacao = await prisma.interacao.create({
      data: {
        organizationId: session.organizationId,
        apoliceId,
        templateId: templateId || null,
        userId: session.userId,
        status: 'link_aberto',
      },
    });

    return NextResponse.json({ success: true, interacao });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar interação' }, { status: 500 });
  }
}
