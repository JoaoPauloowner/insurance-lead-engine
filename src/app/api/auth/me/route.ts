import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session.userId || !session.organizationId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: {
        id: true,
        nome: true,
        slug: true,
        corPrimaria: true,
        logoUrl: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        nome: session.nome,
        email: session.email,
        role: session.role,
      },
      organization: org,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
