import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { triggerVapiVoiceCall } from '@/lib/vapi';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const lead = await prisma.lead.findFirst({
      where: { id, organizationId: session.organizationId },
      include: { organization: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    const vapiResult = await triggerVapiVoiceCall({
      phoneNumber: lead.telefone,
      leadName: lead.nome,
      insuranceBranch: lead.ramoDesejado,
      brokerOrgName: lead.organization.nome,
    });

    await prisma.leadInteracao.create({
      data: {
        organizationId: session.organizationId,
        leadId: lead.id,
        canal: 'voz_vapi',
        direcao: 'outbound',
        status: vapiResult.success ? 'chamada_disparada' : 'falha_chamada',
        conteudo: `Disparo manual de voz Vapi.ai (ID: ${vapiResult.callId || 'N/A'}). Status: ${vapiResult.status}.`,
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        tentativasVoz: { increment: 1 },
        canalAtual: 'voz_vapi',
        status: 'em_contato',
      },
    });

    return NextResponse.json({ success: true, vapiResult });
  } catch (error: any) {
    console.error('Erro ao disparar ligação:', error);
    return NextResponse.json({ error: error.message || 'Erro ao disparar chamada' }, { status: 500 });
  }
}
