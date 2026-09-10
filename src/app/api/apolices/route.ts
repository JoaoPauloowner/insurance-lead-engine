import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'todos';

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const where: any = {
      organizationId: session.organizationId,
    };

    if (search.trim()) {
      where.OR = [
        { cliente: { nome: { contains: search.trim() } } },
        { seguradora: { contains: search.trim() } },
        { tipoSeguro: { contains: search.trim() } },
        { numeroApolice: { contains: search.trim() } },
      ];
    }

    if (status === 'urgente') {
      const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      where.dataVencimento = { gte: now, lte: in15Days };
    } else if (status === 'proximo') {
      const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      where.dataVencimento = { gt: in15Days, lte: in30Days };
    } else if (status === 'em_dia') {
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      where.dataVencimento = { gt: in30Days };
    } else if (status === 'vencido') {
      where.dataVencimento = { lt: now };
    }

    const apolices = await prisma.apolice.findMany({
      where,
      include: {
        cliente: true,
        interacoes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: { select: { nome: true } },
          },
        },
      },
      orderBy: { dataVencimento: 'asc' },
    });

    return NextResponse.json({ apolices });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar apólices' }, { status: 500 });
  }
}
