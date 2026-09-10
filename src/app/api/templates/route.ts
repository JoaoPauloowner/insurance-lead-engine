import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireAuth();

    const templates = await prisma.template.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { nome, corpo } = await req.json();

    if (!nome || !corpo) {
      return NextResponse.json({ error: 'Nome e corpo são obrigatórios' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        organizationId: session.organizationId,
        nome: nome.trim(),
        corpo: corpo.trim(),
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar template' }, { status: 500 });
  }
}
