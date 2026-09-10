import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneBR } from '@/lib/phone';
import { scoreLead } from '@/lib/lead-scorer';
import { triggerVapiVoiceCall } from '@/lib/vapi';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      organizationId: explicitOrgId,
      nome,
      telefone,
      email,
      origem,
      ramoDesejado,
      notas,
      urgencia,
    } = body;

    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são campos obrigatórios.' },
        { status: 400 }
      );
    }

    // Normaliza telefone para padrão E.164 brasileiro
    const phoneNorm = normalizePhoneBR(telefone);
    if (!phoneNorm.isValid) {
      return NextResponse.json(
        { error: `Telefone inválido: "${telefone}". Informe DDD + número válido.` },
        { status: 400 }
      );
    }

    // Resolve a organização (se não enviada via webhook, atribui à organização principal do sistema)
    let org = explicitOrgId
      ? await prisma.organization.findUnique({ where: { id: explicitOrgId } })
      : await prisma.organization.findFirst();

    if (!org) {
      return NextResponse.json(
        { error: 'Nenhuma organização configurada no sistema.' },
        { status: 400 }
      );
    }

    // 1. Executa o Motor de Lead Scoring
    const scoringResult = await scoreLead({
      nome: String(nome).trim(),
      telefone: phoneNorm.normalized,
      email: email ? String(email).trim() : null,
      origem: origem || 'Meta Lead Ads',
      ramoDesejado: ramoDesejado || 'Auto',
      notas: notas || null,
      urgencia: urgencia || null,
    });

    // 2. Grava o Lead no Banco de Dados
    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        nome: String(nome).trim(),
        telefone: phoneNorm.normalized,
        email: email ? String(email).trim().toLowerCase() : null,
        origem: origem || 'Meta Lead Ads',
        ramoDesejado: ramoDesejado || 'Auto',
        score: scoringResult.score,
        prioridade: scoringResult.priority.toLowerCase(),
        status: scoringResult.priority === 'HOT' ? 'em_contato' : 'novo',
        canalAtual: scoringResult.priority === 'HOT' ? 'voz_vapi' : 'whatsapp',
        resumoIa: scoringResult.resumo,
        dadosColetados: JSON.stringify(scoringResult.blueprint),
      },
    });

    // 3. Se for Lead HOT (Score >= 80), dispara chamada de voz via Vapi.ai
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
      message: 'Lead recebido e processado com sucesso pelo Insurance Lead Engine.',
      lead: {
        id: lead.id,
        nome: lead.nome,
        telefone: phoneNorm.formatted,
        ramo: lead.ramoDesejado,
        score: lead.score,
        prioridade: lead.prioridade,
        recommendedAction: scoringResult.recommendedAction,
        vapiCallTriggered: scoringResult.priority === 'HOT',
        vapiStatus: vapiResult?.status || null,
      },
    });
  } catch (error: any) {
    console.error('Erro na ingestão de lead:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar lead', details: error.message },
      { status: 500 }
    );
  }
}
