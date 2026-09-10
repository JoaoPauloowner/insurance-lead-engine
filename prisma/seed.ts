import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed do Insurance Lead Engine...');

  // 1. Organização
  let org = await prisma.organization.findUnique({
    where: { slug: 'prime-demo' },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        nome: 'Prime Corretora & Lead Engine',
        slug: 'prime-demo',
        corPrimaria: '#2563EB',
      },
    });
    console.log('✅ Organização criada:', org.nome);
  }

  // 2. Usuário Admin
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@corretora.com' },
  });

  let user = existingUser;
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: {
        organizationId: org.id,
        nome: 'Corretor Sênior',
        email: 'admin@corretora.com',
        senhaHash: passwordHash,
        role: 'admin',
      },
    });
    console.log('✅ Usuário admin criado:', user.email);
  }

  // 3. Templates padrão de WhatsApp
  const defaultTemplates = [
    {
      nome: 'Primeiro Contato (30 dias)',
      corpo: 'Olá {cliente}, tudo bem? Aqui é da {corretora}. Sua apólice de {tipo_seguro} ({seguradora}) vence em {dias_para_vencer} dias ({data_vencimento}). Já estamos preparando o estudo de renovação para você não ficar desprotegido. Podemos conversar?',
    },
    {
      nome: 'Alerta de Renovação Urgente (15 dias)',
      corpo: 'Oi {cliente}! Faltam apenas {dias_para_vencer} dias para o vencimento do seu seguro {tipo_seguro} ({seguradora}, apólice {numero_apolice}). Temos condições especiais para a renovação com bônus acumulado. Como prefere receber a cotação?',
    },
    {
      nome: 'Lead Quente - Boas-vindas Anúncio',
      corpo: 'Olá {cliente}! Aqui é da {corretora}. Recebemos sua solicitação de cotação de seguro {tipo_seguro}. Já estamos com as tabelas das principais seguradoras abertas para você. Podemos validar os dados para eu te enviar a melhor proposta agora?',
    },
    {
      nome: 'Fallback Ligação não Atendida',
      corpo: 'Olá {cliente}! Tentei te ligar agora sobre a sua solicitação de cotação de seguro {tipo_seguro}, mas caiu na caixa postal. Vamos conversar por aqui para eu te passar os valores?',
    },
  ];

  for (const t of defaultTemplates) {
    const exists = await prisma.template.findFirst({
      where: { organizationId: org.id, nome: t.nome },
    });
    if (!exists) {
      await prisma.template.create({
        data: {
          organizationId: org.id,
          nome: t.nome,
          corpo: t.corpo,
        },
      });
    }
  }

  // 4. Apólices para o Radar de Renovação
  const now = new Date();
  const demoPolicies = [
    { nome: 'Carlos Eduardo Silva', tel: '5511987654321', ramo: 'Auto', cia: 'Porto Seguro', num: 'PORTO-8891', dias: 3 },
    { nome: 'Mariana Costa Ferreira', tel: '5511976543210', ramo: 'Residencial', cia: 'Azul Seguros', num: 'AZUL-4412', dias: 8 },
    { nome: 'Roberto Albuquerque', tel: '5521998877665', ramo: 'Saúde PME', cia: 'Bradesco Seguros', num: 'BRAD-9912', dias: 14 },
    { nome: 'Fernanda Lima Santos', tel: '5531988776655', ramo: 'Vida Individual', cia: 'Tokio Marine', num: 'TM-3310', dias: 24 },
    { nome: 'Lucas Mendes Ramos', tel: '5541991234567', ramo: 'Empresarial', cia: 'Allianz', num: 'ALL-6652', dias: 45 },
  ];

  for (const item of demoPolicies) {
    const cliente = await prisma.cliente.upsert({
      where: {
        organizationId_telefone: {
          organizationId: org.id,
          telefone: item.tel,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        nome: item.nome,
        telefone: item.tel,
      },
    });

    const dataVencimento = new Date(now.getTime() + item.dias * 24 * 60 * 60 * 1000);
    const existingPolicy = await prisma.apolice.findFirst({
      where: { organizationId: org.id, clienteId: cliente.id },
    });

    if (!existingPolicy) {
      await prisma.apolice.create({
        data: {
          organizationId: org.id,
          clienteId: cliente.id,
          seguradora: item.cia,
          tipoSeguro: item.ramo,
          numeroApolice: item.num,
          dataVencimento,
          status: 'ativa',
        },
      });
    }
  }

  // 5. Leads em Tempo Real (Speed-to-Lead com IA)
  const demoLeads = [
    {
      nome: 'Guilherme Antunes Fontes',
      telefone: '5511998811223',
      email: 'guilherme.fontes@tech.com.br',
      origem: 'Meta Lead Ads (Instagram)',
      ramoDesejado: 'Empresarial Multirisco',
      score: 95,
      prioridade: 'hot',
      status: 'qualificado',
      canalAtual: 'voz_vapi',
      resumoIa: '🔥 Lead B2B de Alta Prioridade: Empresa de TI com 40 funcionários, faturamento R$ 5M/ano. Deseja seguro patrimonial + responsabilidade civil.',
      dadosColetados: JSON.stringify({
        empresa: 'Fontes Tech Solutions',
        coberturasDesejadas: ['Incêndio', 'Danos Elétricos', 'RC Profissional'],
        orcamentoEstimado: 'Até R$ 12.000/ano',
        decisor: 'Guilherme (Sócio-Fundador)',
      }),
    },
    {
      nome: 'Beatriz Vasconcelos Prado',
      telefone: '5521987654321',
      email: 'beatriz.prado@email.com',
      origem: 'Google Ads (Pesquisa)',
      ramoDesejado: 'Seguro Auto Premium',
      score: 88,
      prioridade: 'hot',
      status: 'em_contato',
      canalAtual: 'voz_vapi',
      resumoIa: '🔥 Lead Quente: BMW 320i M Sport 2024. Seguro atual na Porto vence em 7 dias.',
      dadosColetados: JSON.stringify({
        veiculo: 'BMW 320i M Sport 2024',
        seguradoraAtual: 'Porto Seguro',
        vencimento: '7 dias',
        uso: 'Particular / Garagem fechada',
      }),
    },
    {
      nome: 'Marcio Henrique Oliveira',
      telefone: '5531991234567',
      email: 'marcio.oliveira@email.com',
      origem: 'Landing Page (Site)',
      ramoDesejado: 'Residencial',
      score: 65,
      prioridade: 'warm',
      status: 'novo',
      canalAtual: 'whatsapp',
      resumoIa: '⚡ Lead Padrão: Casa em condomínio fechado em Nova Lima - MG. Pesquisando cotações.',
      dadosColetados: JSON.stringify({
        tipoImovel: 'Casa em Condomínio',
        cidade: 'Nova Lima - MG',
      }),
    },
    {
      nome: 'Renata Silveira Dias',
      telefone: '5541988990011',
      email: 'renata@email.com',
      origem: 'Facebook Ads',
      ramoDesejado: 'Vida Individual',
      score: 45,
      prioridade: 'cold',
      status: 'novo',
      canalAtual: 'sms',
      resumoIa: '❄️ Lead Frio: Preencheu dados básicos mas não informou renda ou capital segurado desejado.',
      dadosColetados: null,
    },
  ];

  for (const lead of demoLeads) {
    const existingLead = await prisma.lead.findFirst({
      where: { organizationId: org.id, telefone: lead.telefone },
    });

    if (!existingLead) {
      const created = await prisma.lead.create({
        data: {
          organizationId: org.id,
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email,
          origem: lead.origem,
          ramoDesejado: lead.ramoDesejado,
          score: lead.score,
          prioridade: lead.prioridade,
          status: lead.status,
          canalAtual: lead.canalAtual,
          resumoIa: lead.resumoIa,
          dadosColetados: lead.dadosColetados,
        },
      });

      // Interação de exemplo
      if (lead.score >= 80) {
        await prisma.leadInteracao.create({
          data: {
            organizationId: org.id,
            leadId: created.id,
            canal: 'voz_vapi',
            direcao: 'outbound',
            status: 'completada',
            conteudo: 'Chamada ativa completada. Cliente atendeu, confirmou dados do bem e solicitou cotação imediata no WhatsApp.',
            duracaoSeg: 84,
          },
        });
      }
    }
  }

  console.log('🎉 Seed do Insurance Lead Engine concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
