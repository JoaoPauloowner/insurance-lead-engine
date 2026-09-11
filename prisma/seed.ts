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

  // 5. Leads Comerciais & Corporativos de Alta Velocidade (PRD LeadEngine Pro)
  const commercialLeads = [
    {
      nome: 'Marcus Brody',
      empresa: 'Apex Logistics Corp',
      telefone: '5511991230001',
      email: 'm.brody@apexlogistics.com',
      origem: 'Inbound API (Fleet Webhook)',
      ramoDesejado: 'Fleet Auto',
      lob: 'Fleet Auto',
      premioEstimado: 142000,
      carrierAppetite: 94,
      targetCarrier: 'Progressive',
      riskTags: JSON.stringify(['DOT Tier A', 'FIPE Matched', 'OSHA Clear']),
      score: 96,
      prioridade: 'hot',
      status: 'novo',
      canalAtual: 'voz_vapi',
      slaExpiresAt: new Date(now.getTime() + 2.5 * 60 * 1000), // 2m 30s restantes
      resumoIa: '🔥 Lead Enterprise Fleet Auto: 85 cavalos mecânicos Scania/Volvo 2023-2024. Histórico de sinistro limpo (3 anos). Verificação DOT Tier A concluída.',
      dadosColetados: JSON.stringify({
        frotaTotal: 85,
        rotas: 'Interestadual (SP-RJ-PR-SC)',
        dotStatus: 'Tier A Approved',
        apoliceAtualVencimento: '14 dias',
      }),
    },
    {
      nome: 'Elena Rostova',
      empresa: 'Vanguard Cloud Systems',
      telefone: '5511991230002',
      email: 'elena@vanguardcloud.io',
      origem: 'Broker Portal Ingest',
      ramoDesejado: 'Cyber & Tech',
      lob: 'Cyber & Tech',
      premioEstimado: 68500,
      carrierAppetite: 98,
      targetCarrier: 'Chubb',
      riskTags: JSON.stringify(['SOC2 Type II', 'ISO 27001', 'Cloud Vault']),
      score: 93,
      prioridade: 'hot',
      status: 'em_contato',
      canalAtual: 'whatsapp',
      slaExpiresAt: new Date(now.getTime() + 4.0 * 60 * 1000), // 4m restantes
      resumoIa: '🔥 Cyber Risk E&O: Provedor SaaS B2B com 140 colaboradores e custódia de dados financeiros. Auditoria SOC2 Type II validada.',
      dadosColetados: JSON.stringify({
        limiteApolice: '$5,000,000 Limit',
        ransomwareCoverage: 'Full $5M',
        soc2Auditor: 'PwC 2025',
      }),
    },
    {
      nome: 'David K. Miller',
      empresa: 'Titan Freight & Hauling',
      telefone: '5521998810003',
      email: 'dmiller@titanfreight.com',
      origem: 'Meta Ads Commercial',
      ramoDesejado: 'Inland Marine',
      lob: 'Inland Marine',
      premioEstimado: 84000,
      carrierAppetite: 89,
      targetCarrier: 'Liberty Mutual',
      riskTags: JSON.stringify(['DOT Tier A', 'Cargo Safe', 'OSHA Clear']),
      score: 91,
      prioridade: 'hot',
      status: 'qualificado',
      canalAtual: 'corretor',
      slaExpiresAt: new Date(now.getTime() + 1.2 * 60 * 1000), // 1m 12s restantes (urgente)
      resumoIa: '⚡ Carga e Transporte Rodoviário: Rastreamento satelital Sascar + telemetria. Risco de roubo controlado.',
      dadosColetados: JSON.stringify({
        tipoCarga: 'Eletrônicos e Peças Automotivas',
        seguroDesejado: 'RCTR-C + RC-DC',
      }),
    },
    {
      nome: 'Sarah Vance',
      empresa: 'Meridian Precision Robotics',
      telefone: '5531998820004',
      email: 'svance@meridianrobotics.ai',
      origem: 'Google Ads Search',
      ramoDesejado: 'General Liability',
      lob: 'General Liability',
      premioEstimado: 115000,
      carrierAppetite: 92,
      targetCarrier: 'Travelers',
      riskTags: JSON.stringify(['SOC2 Type II', 'OSHA Clear', 'UL Certified']),
      score: 89,
      prioridade: 'hot',
      status: 'novo',
      canalAtual: 'voz_vapi',
      slaExpiresAt: new Date(now.getTime() + 3.1 * 60 * 1000),
      resumoIa: '🏭 Manufatura Avançada e Robótica: Galpão industrial 12.000m² com sprinklers NFPA e brigada própria.',
      dadosColetados: JSON.stringify({
        isencaoFranquia: 'Preferencia franquia reduzida',
        responsabilidadeCivil: 'Danos a terceiros e recall',
      }),
    },
    {
      nome: 'Carlos Drummond',
      empresa: 'Cascade Cold Chain Express',
      telefone: '5541998830005',
      email: 'carlos@cascadechain.com.br',
      origem: 'Inbound Webhook API',
      ramoDesejado: 'Fleet Auto',
      lob: 'Fleet Auto',
      premioEstimado: 94000,
      carrierAppetite: 90,
      targetCarrier: 'Chubb',
      riskTags: JSON.stringify(['DOT Tier A', 'FIPE Matched']),
      score: 94,
      prioridade: 'hot',
      status: 'em_contato',
      canalAtual: 'voz_vapi',
      slaExpiresAt: new Date(now.getTime() + 0.8 * 60 * 1000), // < 1m (crítico)
      resumoIa: '🚛 Transporte Frigorífico de Alta Precisão: 42 carretas térmicas Thermo King. Monitoramento térmico em tempo real.',
      dadosColetados: JSON.stringify({
        itensTransportados: 'Vacinas e Farmacêuticos',
        certificacoes: 'Anvisa + DOT',
      }),
    },
    {
      nome: 'Patricia Albuquerque',
      empresa: 'Beacon Health Tech Partners',
      telefone: '5511998840006',
      email: 'patricia@beaconhealth.med.br',
      origem: 'LinkedIn Inbound',
      ramoDesejado: 'Cyber & Tech',
      lob: 'Cyber & Tech',
      premioEstimado: 175000,
      carrierAppetite: 96,
      targetCarrier: 'Chubb',
      riskTags: JSON.stringify(['HIPAA Ready', 'SOC2 Type II', 'ISO 27701']),
      score: 95,
      prioridade: 'hot',
      status: 'qualificado',
      canalAtual: 'whatsapp',
      slaExpiresAt: new Date(now.getTime() + 5.0 * 60 * 1000),
      resumoIa: '🏥 Telemedicina & Gestão Hospitalar: 3 milhões de vidas em prontuário eletrônico. Risco cibernético e E&O médico institucional.',
      dadosColetados: JSON.stringify({
        faturamentoAnual: 'R$ 48M',
        auditoriaExterna: 'KPMG',
      }),
    },
    {
      nome: 'Rodrigo Mendonça Prado',
      empresa: 'Atlas Heavy Infrastructure',
      telefone: '5521998850007',
      email: 'rmendonca@atlasinfra.com',
      origem: 'Direct Broker Referral',
      ramoDesejado: 'General Liability',
      lob: 'General Liability',
      premioEstimado: 210000,
      carrierAppetite: 85,
      targetCarrier: 'Travelers',
      riskTags: JSON.stringify(['OSHA Clear', 'CREA Master', 'All-Risk']),
      score: 88,
      prioridade: 'hot',
      status: 'novo',
      canalAtual: 'corretor',
      slaExpiresAt: new Date(now.getTime() + 3.8 * 60 * 1000),
      resumoIa: '🏗️ Obras Civis Pesadas & Túneis: Apólice All-Risk de Engenharia + RC Cruzada para concessões rodoviárias.',
      dadosColetados: JSON.stringify({
        prazoObra: '24 meses',
        garantiaExecutante: 'Sim requerida',
      }),
    },
    {
      nome: 'Arthur Vianna',
      empresa: 'Starlight Freightways',
      telefone: '5531998860008',
      email: 'arthur@starlightfreight.com',
      origem: 'Meta Ads Commercial',
      ramoDesejado: 'Inland Marine',
      lob: 'Inland Marine',
      premioEstimado: 76000,
      carrierAppetite: 88,
      targetCarrier: 'Progressive',
      riskTags: JSON.stringify(['DOT Tier A', 'FIPE Matched']),
      score: 84,
      prioridade: 'warm',
      status: 'novo',
      canalAtual: 'whatsapp',
      slaExpiresAt: new Date(now.getTime() + 8.5 * 60 * 1000),
      resumoIa: '📦 Distribuição Urbana e E-commerce: 35 caminhões 3/4 e VUCs. Operação 24/7 na Grande SP e Campinas.',
      dadosColetados: JSON.stringify({
        frotaVuc: 35,
        gerenciadoraRisco: 'Buonny',
      }),
    },
  ];

  for (const lead of commercialLeads) {
    const existingLead = await prisma.lead.findFirst({
      where: { organizationId: org.id, telefone: lead.telefone },
    });

    if (existingLead) {
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          empresa: lead.empresa,
          premioEstimado: lead.premioEstimado,
          lob: lead.lob,
          carrierAppetite: lead.carrierAppetite,
          targetCarrier: lead.targetCarrier,
          riskTags: lead.riskTags,
          slaExpiresAt: lead.slaExpiresAt,
          score: lead.score,
          prioridade: lead.prioridade,
          status: lead.status,
          canalAtual: lead.canalAtual,
          resumoIa: lead.resumoIa,
          dadosColetados: lead.dadosColetados,
        },
      });
    } else {
      const created = await prisma.lead.create({
        data: {
          organizationId: org.id,
          nome: lead.nome,
          empresa: lead.empresa,
          telefone: lead.telefone,
          email: lead.email,
          origem: lead.origem,
          ramoDesejado: lead.ramoDesejado,
          lob: lead.lob,
          premioEstimado: lead.premioEstimado,
          carrierAppetite: lead.carrierAppetite,
          targetCarrier: lead.targetCarrier,
          riskTags: lead.riskTags,
          slaExpiresAt: lead.slaExpiresAt,
          score: lead.score,
          prioridade: lead.prioridade,
          status: lead.status,
          canalAtual: lead.canalAtual,
          resumoIa: lead.resumoIa,
          dadosColetados: lead.dadosColetados,
        },
      });

      if (lead.score >= 90) {
        await prisma.leadInteracao.create({
          data: {
            organizationId: org.id,
            leadId: created.id,
            canal: 'voz_vapi',
            direcao: 'outbound',
            status: 'completada',
            conteudo: `Speed-to-lead ativo sob SLA < 5m: Contato com ${lead.nome} (${lead.empresa}). Apetite validado em ${lead.carrierAppetite}% com ${lead.targetCarrier}.`,
            duracaoSeg: 112,
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
