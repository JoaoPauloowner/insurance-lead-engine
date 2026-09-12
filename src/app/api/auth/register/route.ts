import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { nome, nomeCorretora, email, password, telefone } = await req.json();

    if (!nome || !nomeCorretora || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado. Faça login ou utilize outro e-mail.' },
        { status: 409 }
      );
    }

    // Gera slug amigável e único para o tenant
    const baseSlug = nomeCorretora
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${baseSlug || 'corretora'}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Cria a Organização com 7 dias de trial no Plano Pro
    const trialAte = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const org = await prisma.organization.create({
      data: {
        nome: String(nomeCorretora).trim(),
        slug: uniqueSlug,
        corPrimaria: '#275ba5',
        plano: 'pro',
        statusPlano: 'trial',
        trialAte,
      },
    });

    // Cria o Usuário Administrador da Corretora
    const senhaHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        nome: String(nome).trim(),
        email: cleanEmail,
        senhaHash,
        role: 'admin',
      },
    });

    // Inicializa os Templates padrão de WhatsApp para o novo tenant
    const defaultTemplates = [
      {
        nome: 'Lead Quente - Boas-vindas Anúncio',
        corpo: 'Olá {cliente}! Aqui é da {corretora}. Recebemos sua solicitação de cotação de seguro {tipo_seguro}. Já estamos com as tabelas das principais seguradoras abertas para você. Podemos validar os dados para eu te enviar a melhor proposta agora?',
      },
      {
        nome: 'Primeiro Contato Renovação (30 dias)',
        corpo: 'Olá {cliente}, tudo bem? Aqui é da {corretora}. Sua apólice de {tipo_seguro} ({seguradora}) vence em {dias_para_vencer} dias ({data_vencimento}). Já estamos preparando o estudo de renovação para você não perder bônus nem ficar desprotegido. Podemos conversar?',
      },
      {
        nome: 'Alerta Urgente de Vencimento (15 dias)',
        corpo: 'Oi {cliente}! Faltam apenas {dias_para_vencer} dias para o vencimento do seu seguro {tipo_seguro} ({seguradora}, apólice {numero_apolice}). Temos condições especiais de renovação com desconto no PIX. Como prefere receber a cotação?',
      },
      {
        nome: 'Cotação Multisseguradoras Pronta',
        corpo: 'Olá {cliente}! Seu estudo comparativo de seguro {tipo_seguro} está pronto na {corretora}. Conseguimos condições diferenciadas na Porto Seguro e Allianz. Deseja que eu te envie o PDF completo?',
      },
    ];

    for (const tpl of defaultTemplates) {
      await prisma.template.create({
        data: {
          organizationId: org.id,
          nome: tpl.nome,
          corpo: tpl.corpo,
        },
      });
    }

    // Inicializa a sessão com iron-session
    const session = await getSession();
    session.userId = user.id;
    session.organizationId = org.id;
    session.nome = user.nome;
    session.email = user.email;
    session.role = user.role;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
      organization: {
        id: org.id,
        nome: org.nome,
        slug: org.slug,
        plano: org.plano,
        statusPlano: org.statusPlano,
        trialAte: org.trialAte,
      },
    });
  } catch (error: any) {
    console.error('Erro no auto-cadastro:', error);
    return NextResponse.json(
      { error: 'Falha interna ao criar conta.', details: error.message },
      { status: 500 }
    );
  }
}
