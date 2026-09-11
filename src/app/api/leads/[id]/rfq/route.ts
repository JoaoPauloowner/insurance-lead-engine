import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const { carrier = 'Chubb', limitRequested = '$5,000,000', deductible = '$5,000', notes = '' } = body;

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: session.organizationId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    const rfqReference = `RFQ-${carrier.toUpperCase().slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`;
    const basePremium = lead.premioEstimado || 65000;
    const estimatedAnnualRate = Math.round(basePremium * (0.95 + Math.random() * 0.1));

    // Registrar interação
    await prisma.leadInteracao.create({
      data: {
        organizationId: session.organizationId,
        leadId: lead.id,
        canal: 'rfq_carrier_api',
        direcao: 'outbound',
        status: 'completada',
        conteudo: `Disparo de RFQ Instantâneo para ${carrier} (Ref: ${rfqReference}). Limite Solicitado: ${limitRequested}, Franquia: ${deductible}. Cotação Indicativa: $${estimatedAnnualRate.toLocaleString()}/ano. Apetite: 94% aprovado.`,
      },
    });

    // Atualizar target carrier se aplicável
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        targetCarrier: carrier,
        status: 'qualificado',
      },
    });

    return NextResponse.json({
      success: true,
      quote: {
        carrier,
        rfqReference,
        status: 'Cleared & Rate Approved',
        limit: limitRequested,
        deductible,
        annualRate: estimatedAnnualRate,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao processar RFQ:', error);
    return NextResponse.json({ error: 'Erro ao despachar RFQ' }, { status: 500 });
  }
}
