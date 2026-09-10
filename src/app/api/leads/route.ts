import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const priority = searchParams.get('priority') || 'todos';

    const where: any = {
      organizationId: session.organizationId,
    };

    if (priority !== 'todos') {
      where.prioridade = priority.toLowerCase();
    }

    if (search.trim()) {
      where.OR = [
        { nome: { contains: search.trim() } },
        { telefone: { contains: search.trim() } },
        { email: { contains: search.trim() } },
        { ramoDesejado: { contains: search.trim() } },
        { origem: { contains: search.trim() } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        interacoes: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Erro ao listar leads:', error);
    return NextResponse.json({ error: 'Erro ao buscar leads' }, { status: 500 });
  }
}
