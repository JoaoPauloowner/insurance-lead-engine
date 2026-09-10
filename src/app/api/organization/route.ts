import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireAuth();

    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
    });

    return NextResponse.json({ organization: org });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const { nome, corPrimaria, logoUrl } = await req.json();

    const updated = await prisma.organization.update({
      where: { id: session.organizationId },
      data: {
        ...(nome ? { nome: nome.trim() } : {}),
        ...(corPrimaria !== undefined ? { corPrimaria } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
      },
    });

    return NextResponse.json({ success: true, organization: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}
