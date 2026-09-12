import React from 'react';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: {
      nome: true,
    },
  });

  return (
    <DashboardShell
      user={{
        nome: session.nome,
        email: session.email,
        role: session.role,
      }}
      organization={{
        nome: org?.nome || 'LeadEngine Corretora',
      }}
    >
      {children}
    </DashboardShell>
  );
}
