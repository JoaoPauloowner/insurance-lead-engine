import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const { nome, corpo } = await req.json();

    const existing = await prisma.template.findFirst({
      where: { id, organizationId: session.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    const updated = await prisma.template.update({
      where: { id },
      data: {
        nome: nome?.trim() || existing.nome,
        corpo: corpo?.trim() || existing.corpo,
      },
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar template' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.template.findFirst({
      where: { id, organizationId: session.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    await prisma.template.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir template' }, { status: 500 });
  }
}
