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

  // 5. Leads do Dia a Dia da Corretora de Seguros (Pequenas e Médias)
  const everydayLeads = [
    {
      nome: 'Beatriz Vasconcelos Prado',
      empresa: 'Pessoa Física',
      telefone: '5521987654321',
      email: 'beatriz.prado@email.com',
      origem: 'Meta Ads (Instagram)',
      ramoDesejado: 'Seguro Auto (BMW 320i 2024)',
      lob: 'Seguro Auto',
      premioEstimado: 3850,
      carrierAppetite: 96,
      targetCarrier: 'Porto Seguro',
      riskTags: JSON.stringify(['100% FIPE', 'Franquia Reduzida', 'Carro Reserva 30d']),
      score: 94,
      prioridade: 'hot',
      status: 'novo',
      canalAtual: 'voz_vapi',
      slaExpiresAt: new Date(now.getTime() + 2.5 * 60 * 1000),
      resumoIa: '🔥 Lead Quente de Seguro Auto: BMW 320i M Sport 2024 0km. Apólice atual vence em 5 dias na Porto Seguro. Deseja manter bônus classe 7 e incluir vidros completos.',
      dadosColetados: JSON.stringify({
        veiculo: 'BMW 320i M Sport 2024',
        classeBonus: 7,
        seguradoraAtual: 'Porto Seguro',
        franquiaDesejada: 'Reduzida',
        condutores: 'Apenas a titular',
      }),
    },
    {
      nome: 'Guilherme Antunes Fontes',
      empresa: 'Fontes Tech Solutions Eireli',
      telefone: '5511998811223',
      email: 'guilherme.fontes@techsolutions.com.br',
      origem: 'Google Ads (Pesquisa)',
      ramoDesejado: 'Empresarial PME',
      lob: 'Empresarial PME',
      premioEstimado: 8900,
      carrierAppetite: 92,
      targetCarrier: 'Allianz',
      riskTags: JSON.stringify(['Incêndio/Raio', 'Equip. Eletrônicos', 'RC Operações']),
      score: 91,
      prioridade: 'hot',
      status: 'em_contato',
      canalAtual: 'whatsapp',
      slaExpiresAt: new Date(now.getTime() + 4.0 * 60 * 1000),
      resumoIa: '🏢 Escritório de Tecnologia com 35 colaboradores. Galpão comercial próprio de 450m². Deseja cobertura para servidores, computadores e responsabilidade civil.',
      dadosColetados: JSON.stringify({
        tipoImovel: 'Escritório Comercial Próprio',
        funcionarios: 35,
        valorEquipamentos: 'R$ 450.000',
      }),
    },
    {
      nome: 'Marcio Henrique Oliveira',
      empresa: 'Pessoa Física',
      telefone: '5531991234567',
      email: 'marcio.oliveira@email.com',
      origem: 'Landing Page (Site)',
      ramoDesejado: 'Seguro Residencial',
      lob: 'Residencial',
      premioEstimado: 1420,
      carrierAppetite: 90,
      targetCarrier: 'Tokio Marine',
      riskTags: JSON.stringify(['Casa Condomínio', 'Danos Elétricos', 'Assistência 24h']),
      score: 78,
      prioridade: 'warm',
      status: 'novo',
      canalAtual: 'whatsapp',
      slaExpiresAt: new Date(now.getTime() + 6.0 * 60 * 1000),
      resumoIa: '🏡 Casa em condomínio fechado em Nova Lima - MG. Área construída 320m². Solicitou cotação incluindo vendaval e roubo de bens.',
      dadosColetados: JSON.stringify({
        cidade: 'Nova Lima - MG',
        tipoConstrucao: 'Alvenaria',
        valorReconstrucao: 'R$ 800.000',
      }),
    },
    {
      nome: 'Dra. Camila Nogueira',
      empresa: 'Drogaria e Farmácia Central PME',
      telefone: '5511997788990',
      email: 'camila@farmaciacentral.com.br',
      origem: 'Indicação / WhatsApp',
      ramoDesejado: 'Saúde Coletivo PME',
      lob: 'Saúde PME',
      premioEstimado: 14800,
      carrierAppetite: 95,
      targetCarrier: 'Bradesco Saúde',
      riskTags: JSON.stringify(['16 Vidas', 'Coparticipação 20%', 'Quarto Coletivo']),
      score: 95,
      prioridade: 'hot',
      status: 'novo',
      canalAtual: 'voz_vapi',
      slaExpiresAt: new Date(now.getTime() + 1.5 * 60 * 1000),
      resumoIa: '🏥 Plano de Saúde para empresa de 16 funcionários (farmacêuticos e balconistas). Contrato atual na Notredame com reajuste alto. Quer migrar para Bradesco ou SulAmérica.',
      dadosColetados: JSON.stringify({
        totalVidas: 16,
        operadoraAtual: 'GNDI / Notredame',
        faixaEtariaMedia: '29 anos',
      }),
    },
    {
      nome: 'Carlos Eduardo Ramos',
      empresa: 'Pessoa Física',
      telefone: '5541991230011',
      email: 'carlos.ramos@curitiba.com.br',
      origem: 'Meta Ads (Facebook)',
      ramoDesejado: 'Seguro Auto (Jeep Compass)',
      lob: 'Seguro Auto',
      premioEstimado: 2980,
      carrierAppetite: 88,
      targetCarrier: 'Azul Seguros',
      riskTags: JSON.stringify(['100% FIPE', 'RCF R$ 150k', 'Vidros VIP']),
      score: 86,
      prioridade: 'hot',
      status: 'em_contato',
      canalAtual: 'whatsapp',
      slaExpiresAt: new Date(now.getTime() + 3.2 * 60 * 1000),
      resumoIa: '🚗 Jeep Compass Limited 2023. Uso para trabalho em Curitiba e viagens de fim de semana. Garagem coberta em casa e no trabalho.',
      dadosColetados: JSON.stringify({
        modelo: 'Jeep Compass Limited 2.0 Flex 2023',
        cepPernoite: '80240-000',
        kmMensal: '1.200 km',
      }),
    },
    {
      nome: 'Renata Silveira Dias',
      empresa: 'Pessoa Física',
      telefone: '5541988990011',
      email: 'renata.silveira@email.com',
      origem: 'Meta Ads (Instagram)',
      ramoDesejado: 'Vida Individual com DIT',
      lob: 'Vida',
      premioEstimado: 1150,
      carrierAppetite: 89,
      targetCarrier: 'Tokio Marine',
      riskTags: JSON.stringify(['Morte/IPA R$ 300k', 'DIT R$ 5k/mês', 'Doenças Graves']),
      score: 82,
      prioridade: 'warm',
      status: 'novo',
      canalAtual: 'whatsapp',
      slaExpiresAt: new Date(now.getTime() + 5.5 * 60 * 1000),
      resumoIa: '🩺 Médica autônoma de 34 anos. Busca seguro de vida com cobertura de Diária por Incapacidade Temporária (DIT) de R$ 5.000/mês caso não possa trabalhar.',
      dadosColetados: JSON.stringify({
        profissao: 'Médica Anestesista',
        rendaMensal: 'R$ 22.000',
        fumante: 'Não',
      }),
    },
    {
      nome: 'Rodrigo Mendonça',
      empresa: 'Transportes Rápidos Paulista Ltda',
      telefone: '5511993344556',
      email: 'rodrigo@rapidossp.com.br',
      origem: 'Google Ads (Pesquisa)',
      ramoDesejado: 'Frota Leve / VUCs (8 Vans)',
      lob: 'Frota Leve',
      premioEstimado: 16400,
      carrierAppetite: 91,
      targetCarrier: 'Porto Seguro',
      riskTags: JSON.stringify(['8 Furgões Renault Master', 'Rastreador Sascar', 'Carga Seca']),
      score: 93,
      prioridade: 'hot',
      status: 'qualificado',
      canalAtual: 'corretor',
      slaExpiresAt: new Date(now.getTime() + 2.0 * 60 * 1000),
      resumoIa: '🚚 Empresa de entregas e-commerce com 8 furgões Renault Master 2022/2023. Seguro compreensivo colisão, incêndio, roubo e terceiros de R$ 300k.',
      dadosColetados: JSON.stringify({
        frotaQtd: 8,
        veiculos: 'Renault Master Furgão',
        regiao: 'Grande São Paulo e Campinas',
      }),
    },
  ];

  for (const lead of everydayLeads) {
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
