import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { validateAndSanitizeAiMessage } from '@/lib/compliance';
import { sendAutomatedWhatsApp } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { leadId, text, sender = 'corretor' } = body;

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
    }

    // 1. Camada de Compliance SUSEP: higieniza e valida se há menções proibidas de preço sem validação
    const complianceResult = validateAndSanitizeAiMessage(
      text,
      session.nome || 'Corretor Responsável'
    );
    const textToSend = complianceResult.sanitizedMessage;

    // 2. Busca o Lead no Prisma
    let lead = null;
    if (leadId && !leadId.startsWith('demo-')) {
      lead = await prisma.lead.findFirst({
        where: { id: leadId, organizationId: session.organizationId },
        include: { organization: true },
      });
    }

    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let savedInteractionId = `msg-${Date.now()}`;

    // 3. Se for um lead real do banco, grava na tabela LeadInteracao e atualiza status
    if (lead) {
      const interaction = await prisma.leadInteracao.create({
        data: {
          organizationId: session.organizationId,
          leadId: lead.id,
          canal: sender === 'corretor' ? 'humano' : 'whatsapp_aria',
          direcao: 'outbound',
          status: 'enviada',
          conteudo: textToSend,
        },
      });
      savedInteractionId = interaction.id;

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'em_contato',
          updatedAt: now,
        },
      });

      // 4. Dispara WhatsApp real ou simulação de alta fidelidade
      await sendAutomatedWhatsApp({
        phoneNumber: lead.telefone,
        leadName: lead.nome,
        insuranceBranch: lead.ramoDesejado || 'Seguro',
        brokerOrgName: lead.organization?.nome || 'LeadEngine Seguros',
        customMessage: textToSend,
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: savedInteractionId,
        sender,
        text: textToSend,
        time: timeFormatted,
      },
      compliance: {
        wasSanitized: !complianceResult.valid,
        blockedReason: complianceResult.blockedReason || null,
      },
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
