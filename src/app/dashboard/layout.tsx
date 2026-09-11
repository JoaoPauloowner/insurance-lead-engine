import React from 'react';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';

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
      corPrimaria: true,
      logoUrl: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col">
      <Header
        user={{
          nome: session.nome,
          email: session.email,
          role: session.role,
        }}
        organization={{
          nome: org?.nome || 'Prime Corretora',
          corPrimaria: org?.corPrimaria || '#2563EB',
          logoUrl: org?.logoUrl,
        }}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
