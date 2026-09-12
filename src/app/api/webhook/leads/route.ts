import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneBR } from '@/lib/phone';
import { scoreLead } from '@/lib/lead-scorer';
import { triggerVapiVoiceCall } from '@/lib/vapi';
import { sendAutomatedWhatsApp } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryToken = searchParams.get('token');
    const headerToken = req.headers.get('x-webhook-token');
    const body = await req.json().catch(() => ({}));

    // Resolve o token da organização
    const token = queryToken || headerToken || body.token || body.organizationId;

    // Busca a organização
    let org = null;
    if (token) {
      org = await prisma.organization.findFirst({
        where: {
          OR: [
            { id: token },
            { slug: token },
          ],
        },
      });
    }

    if (!org) {
      // Fallback para a primeira organização cadastrada (corretora padrão)
      org = await prisma.organization.findFirst();
    }

    if (!org) {
      return NextResponse.json(
        { error: 'Organização não identificada para este webhook.' },
        { status: 400 }
      );
    }

    // Extrai os campos do lead (suporta múltiplos formatos: Meta Ads, Google Ads, n8n)
    const nome = body.nome || body.full_name || body.name || body.first_name || 'Lead Anônimo';
    const rawTelefone = body.telefone || body.phone_number || body.phone || body.celular || '';
    const email = body.email || body.mail || null;
    const origem = body.origem || body.source || body.ad_name || 'Meta Ads (Instagram)';
    const ramoDesejado = body.ramoDesejado || body.ramo || body.insurance_type || 'Auto';
    const empresa = body.empresa || body.company || null;
    const premioEstimado = body.premioEstimado ? Number(body.premioEstimado) : 0;
    const urgencia = body.urgencia || 'alta';
    const notas = body.notas || body.custom_questions || `Capturado via Webhook Universal em ${new Date().toLocaleString('pt-BR')}`;

    if (!rawTelefone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório para processamento do lead.' },
        { status: 400 }
      );
    }

    // 1. Normalização E.164 brasileira
    const phoneNorm = normalizePhoneBR(rawTelefone);
    if (!phoneNorm.isValid) {
      return NextResponse.json(
        { error: `Número de telefone inválido: "${rawTelefone}". Informe DDD válido.` },
        { status: 400 }
      );
    }

    // 2. Guarda contra Duplicidade em Janela de 24h (Deduplicação)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingLead = await prisma.lead.findFirst({
      where: {
        organizationId: org.id,
        telefone: phoneNorm.normalized,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (existingLead) {
      return NextResponse.json({
        success: true,
        status: 'deduplicated',
        message: 'Lead já recebido nas últimas 24 horas. Registro preservado sem duplicidade.',
        leadId: existingLead.id,
      });
    }

    // 3. Execução do Cérebro de Scoring com IA
    const scoringResult = await scoreLead({
      nome: String(nome).trim(),
      telefone: phoneNorm.normalized,
      email: email ? String(email).trim() : null,
      origem,
      ramoDesejado,
      notas,
      urgencia,
    });

    // 4. Gravação do Lead
    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        nome: String(nome).trim(),
        empresa: empresa ? String(empresa).trim() : null,
        telefone: phoneNorm.normalized,
        email: email ? String(email).trim().toLowerCase() : null,
        origem,
        ramoDesejado,
        lob: ramoDesejado,
        premioEstimado: premioEstimado || (ramoDesejado.toLowerCase().includes('auto') ? 3500 : 8500),
        score: scoringResult.score,
        prioridade: scoringResult.priority.toLowerCase(),
        status: scoringResult.priority === 'HOT' ? 'em_contato' : 'novo',
        canalAtual: 'whatsapp',
        resumoIa: scoringResult.resumo,
        dadosColetados: JSON.stringify(scoringResult.blueprint),
        carrierAppetite: scoringResult.score >= 80 ? 94 : 85,
        targetCarrier: ramoDesejado.toLowerCase().includes('auto') ? 'Porto Seguro' : 'Allianz',
        slaExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // SLA de 5 minutos
      },
    });

    // 5. Disparo Automático Instantâneo do WhatsApp (Speed-to-Lead < 30s)
    const waResult = await sendAutomatedWhatsApp({
      phoneNumber: phoneNorm.normalized,
      leadName: lead.nome,
      insuranceBranch: lead.ramoDesejado,
      brokerOrgName: org.nome,
    });

    await prisma.leadInteracao.create({
      data: {
        organizationId: org.id,
        leadId: lead.id,
        canal: 'whatsapp',
        direcao: 'outbound',
        status: waResult.success ? 'mensagem_enviada' : 'falha_envio',
        conteudo: `Disparo automático Speed-to-Lead via WhatsApp (${waResult.isMock ? 'Modo Simulado' : 'API Oficial'}). ID: ${waResult.messageId}.`,
      },
    });

    // 6. Se for Lead HOT (Score >= 80), também prepara chamada de voz Vapi
    let vapiResult = null;
    if (scoringResult.priority === 'HOT') {
      vapiResult = await triggerVapiVoiceCall({
        phoneNumber: phoneNorm.normalized,
        leadName: lead.nome,
        insuranceBranch: lead.ramoDesejado,
        brokerOrgName: org.nome,
      });

      await prisma.leadInteracao.create({
        data: {
          organizationId: org.id,
          leadId: lead.id,
          canal: 'voz_vapi',
          direcao: 'outbound',
          status: vapiResult.success ? 'chamada_disparada' : 'falha_chamada',
          conteudo: `Disparo automático de voz Vapi.ai (ID: ${vapiResult.callId || 'N/A'}). Status: ${vapiResult.status}.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        nome: lead.nome,
        telefone: lead.telefone,
        score: lead.score,
        prioridade: lead.prioridade,
        status: lead.status,
      },
      speedToLead: {
        whatsappDispatched: waResult.success,
        whatsappMode: waResult.isMock ? 'simulation' : 'production',
        vapiDispatched: vapiResult?.success || false,
      },
      scoring: scoringResult,
    });
  } catch (error: any) {
    console.error('Erro no processamento do Webhook de Leads:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook.', details: error.message },
      { status: 500 }
    );
  }
}
