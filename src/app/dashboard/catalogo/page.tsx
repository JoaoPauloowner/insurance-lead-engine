'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import WhatsAppModal from '@/components/WhatsAppModal';
import VapiCallModal from '@/components/VapiCallModal';

export default function CatalogoShowcasePage() {
  // Estados para testes interativos de modais e gavetas
  const [testWaModal, setTestWaModal] = useState(false);
  const [testVapiModal, setTestVapiModal] = useState(false);
  const [inspectingLead, setInspectingLead] = useState<any | null>(null);

  // Estados dinâmicos para a régua interativa de teste
  const [riskCrítico, setRiskCrítico] = useState(45);
  const [riskJanela, setRiskJanela] = useState(30);
  const [riskEmDia, setRiskEmDia] = useState(20);
  const [riskExpirado, setRiskExpirado] = useState(5);

  const sampleLead = {
    id: 'lead-test-99',
    nome: 'Dra. Beatriz Helena Vasconcellos',
    telefone: '11987654321',
    email: 'beatriz.vasconcellos@clinica.med.br',
    ramoDesejado: 'Seguro Saúde Coletivo PME (18 vidas)',
    origem: 'Google Ads (Search Institucional)',
    score: 95,
    prioridade: 'hot',
    status: 'qualificado',
    resumoIa: 'Proponente PJ médica buscando portabilidade com carência zero. Decisão imediata.',
    urgencia: 'alta',
    notas: 'Interesse imediato em SulAmérica Saúde ou Bradesco Top Nacional. CNPJ ativo há 8 anos.',
  };

  const sampleApolice = {
    id: 'apolice-test-42',
    numeroApolice: 'APO-2026-BRAD-9912',
    tipoSeguro: 'Frota Comercial (7 Caminhões)',
    seguradora: 'Bradesco Seguros',
    dataVencimento: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    cliente: {
      nome: 'Transportadora TransLogística Ltda',
      telefone: '11998877665',
    },
  };

  const screensCatalog = [
    {
      title: 'Esteira de Ingestão de Leads',
      route: '/dashboard/leads',
      file: 'src/app/dashboard/leads/page.tsx',
      role: 'Entrada omnicanal com SLA < 45s, funil de prioridade (80+, 50-79, < 50), scoring com IA e gaveta de inspeção.',
      tag: 'Aquisição / Entrada',
      badgeVariant: 'criticalUrgent' as const,
    },
    {
      title: 'Radar de Renovações & Churn',
      route: '/dashboard/renovacoes',
      file: 'src/app/dashboard/renovacoes/page.tsx',
      role: 'Régua de decaimento temporal, distribuição de vigência por horizonte de risco e disparo preventivo via WhatsApp.',
      tag: 'Retenção / Carteira',
      badgeVariant: 'warningWindow' as const,
    },
    {
      title: 'Cockpit de Cotação Multicálculo',
      route: '/dashboard/cotacao-cockpit',
      file: 'src/app/dashboard/cotacao-cockpit/page.tsx',
      role: 'Comparativo simultâneo de 8 seguradoras, detalhamento de IOF, prêmio líquido, coberturas e proposta comercial.',
      tag: 'Subscrição & Venda',
      badgeVariant: 'secured' as const,
    },
    {
      title: 'Simulador Interativo de Seguro',
      route: '/dashboard/simulador',
      file: 'src/app/dashboard/simulador/page.tsx',
      role: 'Motor interativo com sliders de cobertura, perfil do segurado, cálculo dinâmico de comissão e franquia.',
      tag: 'Cálculo Técnico',
      badgeVariant: 'default' as const,
    },
    {
      title: 'Importador Inteligente de Planilhas',
      route: '/dashboard/importar',
      file: 'src/app/dashboard/importar/page.tsx',
      role: 'Upload de planilhas Excel/CSV com mapeamento semântico automático de colunas para ingestão de carteira.',
      tag: 'Operações em Lote',
      badgeVariant: 'secondary' as const,
    },
    {
      title: 'Modelos & Réguas de Templates',
      route: '/dashboard/templates',
      file: 'src/app/dashboard/templates/page.tsx',
      role: 'Editor de réguas de mensagens WhatsApp e scripts de voz IA com interpolação de tags dinâmicas ({nome}, {veiculo}).',
      tag: 'Comunicação',
      badgeVariant: 'default' as const,
    },
    {
      title: 'Configurações da Corretora',
      route: '/dashboard/configuracoes',
      file: 'src/app/dashboard/configuracoes/page.tsx',
      role: 'Gerenciamento de credenciais, chaves Vapi, OpenAI, Evolution WhatsApp e console de teste cURL.',
      tag: 'Administração',
      badgeVariant: 'secondary' as const,
    },
    {
      title: 'Login & Autenticação Segura',
      route: '/login',
      file: 'src/app/login/page.tsx',
      role: 'Portal de acesso com iron-session, proteção de cookies HTTP-only e botão de demonstração rápida com 1 clique.',
      tag: 'Segurança & Sessão',
      badgeVariant: 'default' as const,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      {/* Header do Catálogo */}
      <div className="border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/40 text-blue-300 border border-blue-500/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Engenharia Reversa • Living Styleguide & Showcase
          </span>
          <span className="text-xs text-zinc-400 font-mono">Next.js 16 + Tailwind v4 + Prisma</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Catálogo de Telas, Componentes & Engenharia Reversa
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
          Visão desacoplada de todas as 8 telas, componentes atômicos, hierarquia de badges, variantes de cards,
          dispositivos estruturais e modais operacionais do Insurance Lead Engine para inspeção isolada.
        </p>
      </div>

      {/* SEÇÃO 1: DIRETÓRIO DE TODAS AS 8 TELAS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              1. Diretório de Telas do Sistema (Rotas Isoladas)
            </h2>
            <p className="text-xs text-zinc-400">
              Cada tela é um módulo independente no App Router. Clique para navegar diretamente para a interface real.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">8 telas mapeadas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {screensCatalog.map((screen) => (
            <Card key={screen.route} variant="analytical" className="p-4 flex flex-col justify-between group hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={screen.badgeVariant} size="sm">
                    {screen.tag}
                  </Badge>
                  <span className="text-[10px] font-mono text-zinc-500">{screen.route}</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                  {screen.title}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-3 leading-snug">
                  {screen.role}
                </p>
                <div className="mt-2 text-[10px] font-mono text-zinc-500 truncate">
                  {screen.file}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <Link
                  href={screen.route}
                  className="w-full py-1.5 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium text-center transition-colors active-press block"
                >
                  Abrir tela →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SEÇÃO 2: PALETA DE DOMÍNIO INSURTECH */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            2. Paleta de Domínio InsurTech (Design Tokens de Cor)
          </h2>
          <p className="text-xs text-zinc-400">
            Substituição da paleta genérica de semáforo por tons institucionais calibrados para corretagem e finanças.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-[#10121a] border border-zinc-800 space-y-2">
            <div className="h-10 rounded-lg bg-[#2563eb] shadow-sm flex items-center justify-center text-white font-mono text-xs font-bold">
              #2563eb
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Cobalt Institucional</div>
              <div className="text-[10px] text-zinc-500 font-mono">--accent-primary</div>
              <div className="text-[10px] text-zinc-400 mt-1">Ações primárias, navegação ativa e cockpits.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#10121a] border border-zinc-800 space-y-2">
            <div className="h-10 rounded-lg bg-[#dc2626] shadow-sm flex items-center justify-center text-white font-mono text-xs font-bold">
              #dc2626
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Rubi de Risco Crítico</div>
              <div className="text-[10px] text-zinc-500 font-mono">--accent-danger</div>
              <div className="text-[10px] text-zinc-400 mt-1">Vencimento &lt; 15 dias, SLA estourado, risco de churn.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#10121a] border border-zinc-800 space-y-2">
            <div className="h-10 rounded-lg bg-[#d97706] shadow-sm flex items-center justify-center text-white font-mono text-xs font-bold">
              #d97706
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Conhaque de Negociação</div>
              <div className="text-[10px] text-zinc-500 font-mono">--accent-warning</div>
              <div className="text-[10px] text-zinc-400 mt-1">Janela 15-30d, propostas em trânsito, cotação ativa.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#10121a] border border-zinc-800 space-y-2">
            <div className="h-10 rounded-lg bg-[#059669] shadow-sm flex items-center justify-center text-white font-mono text-xs font-bold">
              #059669
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Jade Cobertura Ativa</div>
              <div className="text-[10px] text-zinc-500 font-mono">--accent-success</div>
              <div className="text-[10px] text-zinc-400 mt-1">Apólices vigentes &gt; 30d, leads convertidos com sucesso.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#10121a] border border-zinc-800 space-y-2">
            <div className="h-10 rounded-lg bg-[#71717a] shadow-sm flex items-center justify-center text-white font-mono text-xs font-bold">
              #71717a
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Zinco de Metadados</div>
              <div className="text-[10px] text-zinc-500 font-mono">--accent-neutral</div>
              <div className="text-[10px] text-zinc-400 mt-1">Canais de origem, contratos expirados, timestamps.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: SISTEMA HIERÁRQUICO DE BADGES */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            3. Sistema Hierárquico de Badges (Fim do Badge-Kit Genérico)
          </h2>
          <p className="text-xs text-zinc-400">
            Badges desenhadas com pesos visuais drasticamente diferentes de acordo com a gravidade cognitiva do dado.
          </p>
        </div>

        <Card variant="analytical" className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 block">1. Urgência Crítica (&lt; 15 dias)</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="criticalUrgent" dotColor="bg-red-500">
                  Vence em 3 dias
                </Badge>
                <Badge variant="criticalUrgent" size="sm" dotColor="bg-red-500">
                  Alta prioridade
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-500">Destaque forte com pulso para atrair foco imediato.</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 block">2. Janela de Negociação (15-30 dias)</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="warningWindow" dotColor="bg-amber-500">
                  Vence em 24 dias
                </Badge>
                <Badge variant="warningWindow" size="sm" dotColor="bg-amber-500">
                  Multicálculo
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-500">Tom equilibrado para oportunidades abertas.</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 block">3. Cobertura Garantida (&gt; 30 dias)</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secured" dotColor="bg-emerald-500">
                  Vence em 45 dias
                </Badge>
                <Badge variant="secured" size="sm" dotColor="bg-emerald-500">
                  Garantido
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-500">Confirmação serena de apólice em vigência regular.</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 block">4. Contrato Expirado / Resgate</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="expired">
                  Venceu há 12 dias
                </Badge>
                <Badge variant="expired" size="sm">
                  Resgate
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-500">Tom atenuado neutro para reativação de cliente.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 block">5. Canais de Aquisição (Micro-tag)</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="channel">Meta Lead Ads</Badge>
                <Badge variant="channel">Google Search</Badge>
                <Badge variant="channel">WhatsApp Inbound</Badge>
                <Badge variant="channel">Planilha CSV</Badge>
              </div>
              <p className="text-[10px] text-zinc-500">Monospace discreto para metadados de mídia.</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 block">6. Score de Qualificação</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="score">100/100</Badge>
                <Badge variant="score">85/100</Badge>
                <Badge variant="score">42/100</Badge>
              </div>
              <p className="text-[10px] text-zinc-500">Tabular-nums mono para evitar oscilação visual.</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 block">7. Status com Ponto Luminoso</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="statusDot" dotColor="bg-blue-400">
                  Em atendimento
                </Badge>
                <Badge variant="statusDot" dotColor="bg-emerald-400">
                  Convertido
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-500">Marcador tátil de esteira operacional.</p>
            </div>
          </div>
        </Card>
      </section>

      {/* SEÇÃO 4: SISTEMA MULTI-PESO DE CARDS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            4. Sistema de Cards com Pesos Visuais Distintos
          </h2>
          <p className="text-xs text-zinc-400">
            Diferenciação clara entre contêineres padrão, painéis de dados analíticos, cards táteis e alertas críticos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card variant="default">
            <CardHeader className="p-4 pb-2">
              <span className="text-[10px] font-mono text-zinc-500">variant=&quot;default&quot;</span>
              <CardTitle className="text-sm">Painel de Superfície Padrão</CardTitle>
              <CardDescription>Borda sutil e sombra discreta para agrupamentos gerais.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-xs text-zinc-400">
              Superfície balanceada para formulários e layouts comuns.
            </CardContent>
          </Card>

          <Card variant="analytical">
            <CardHeader className="p-4 pb-2">
              <span className="text-[10px] font-mono text-zinc-500">variant=&quot;analytical&quot;</span>
              <CardTitle className="text-sm">Contêiner Analítico Nítido</CardTitle>
              <CardDescription>Borda firme de 1px, sem desfoque, máxima densidade.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-xs text-zinc-400">
              Ideal para cockpits de métricas e tabelas de alta intensidade.
            </CardContent>
          </Card>

          <Card variant="interactive" onClick={() => alert('Card interativo clicado!')}>
            <CardHeader className="p-4 pb-2">
              <span className="text-[10px] font-mono text-zinc-500">variant=&quot;interactive&quot;</span>
              <CardTitle className="text-sm text-blue-400">Card Tátil Interativo</CardTitle>
              <CardDescription>Resposta :active com mola do Emil Kowalski.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-xs text-zinc-400">
              Clique para testar o feedback táctil de pressionamento.
            </CardContent>
          </Card>

          <Card variant="critical">
            <CardHeader className="p-4 pb-2">
              <span className="text-[10px] font-mono text-zinc-500">variant=&quot;critical&quot;</span>
              <CardTitle className="text-sm text-red-400">Alerta Operacional Crítico</CardTitle>
              <CardDescription>Contorno rubi de advertência imediata.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-xs text-zinc-400">
              Utilizado para apólices vencendo hoje e quebra de SLA.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SEÇÃO 5: DISPOSITIVOS ESTRUTURAIS AO VIVO (SIMULADOR INTERATIVO) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            5. Dispositivos Estruturais de Domínio (Simulador Interativo)
          </h2>
          <p className="text-xs text-zinc-400">
            Altere os sliders abaixo para ver a <strong>Régua Proporcional de Decaimento Temporal</strong> reagir em tempo real.
          </p>
        </div>

        <Card variant="analytical" className="p-5 space-y-5">
          {/* Sliders de ajuste dinâmico */}
          <div className="p-3.5 rounded-lg bg-[#090a0f] border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Crítico (&lt; 15d): <strong className="text-red-400 font-mono">{riskCrítico}%</strong></label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskCrítico}
                onChange={(e) => setRiskCrítico(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Janela (15-30d): <strong className="text-amber-400 font-mono">{riskJanela}%</strong></label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskJanela}
                onChange={(e) => setRiskJanela(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Garantido (&gt; 30d): <strong className="text-emerald-400 font-mono">{riskEmDia}%</strong></label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskEmDia}
                onChange={(e) => setRiskEmDia(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Expiradas: <strong className="text-zinc-300 font-mono">{riskExpirado}%</strong></label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskExpirado}
                onChange={(e) => setRiskExpirado(Number(e.target.value))}
                className="w-full accent-zinc-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Barra Proporcional Reativa */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span>Proporção calculada da carteira</span>
              <span className="font-mono text-zinc-200">Total: {riskCrítico + riskJanela + riskEmDia + riskExpirado} unidades</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-900 overflow-hidden flex shadow-inner">
              <div style={{ width: `${riskCrítico}%` }} className="bg-red-500 transition-all duration-300" title="Crítico" />
              <div style={{ width: `${riskJanela}%` }} className="bg-amber-500 transition-all duration-300" title="Janela de Cotação" />
              <div style={{ width: `${riskEmDia}%` }} className="bg-emerald-500 transition-all duration-300" title="Em Dia" />
              <div style={{ width: `${riskExpirado}%` }} className="bg-zinc-600 transition-all duration-300" title="Expiradas" />
            </div>
          </div>

          {/* Fases integradas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/20">
              <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Ação imediata
              </span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">{riskCrítico}</div>
              <p className="text-[10px] text-zinc-500">Risco iminente de perda</p>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/20">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Janela ativa
              </span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">{riskJanela}</div>
              <p className="text-[10px] text-zinc-500">Momento ideal de cotação</p>
            </div>

            <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Garantido
              </span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">{riskEmDia}</div>
              <p className="text-[10px] text-zinc-500">Cobertura regular ativa</p>
            </div>

            <div className="p-3 rounded-lg border border-zinc-700 bg-zinc-800/40">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                Expiradas
              </span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">{riskExpirado}</div>
              <p className="text-[10px] text-zinc-500">Resgate e recuperação</p>
            </div>
          </div>
        </Card>
      </section>

      {/* SEÇÃO 6: TESTE DE MODAIS E GAVETA LATERAL */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            6. Modais e Microinterações Operacionais
          </h2>
          <p className="text-xs text-zinc-400">
            Acione diretamente os modais de atendimento com dados reais de teste para inspecionar a interface e o comportamento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTestWaModal(true)}
            className="p-4 rounded-xl bg-[#10121a] hover:bg-[#141824] border border-emerald-500/30 text-left transition-colors cursor-pointer active-press group"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
              <span>💬 Testar Modal de WhatsApp</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Abre o gerador de mensagens e links diretos com variáveis personalizadas de corretagem.
            </p>
            <span className="text-[10px] text-emerald-400 mt-3 inline-block font-mono group-hover:underline">
              Abrir WhatsAppModal →
            </span>
          </button>

          <button
            onClick={() => setTestVapiModal(true)}
            className="p-4 rounded-xl bg-[#10121a] hover:bg-[#141824] border border-purple-500/30 text-left transition-colors cursor-pointer active-press group"
          >
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs mb-1">
              <span>🎙️ Testar Modal de Voz AI (Vapi)</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Abre a interface de disparo e monitoramento da chamada telefônica automática com agente de IA.
            </p>
            <span className="text-[10px] text-purple-300 mt-3 inline-block font-mono group-hover:underline">
              Abrir VapiCallModal →
            </span>
          </button>

          <button
            onClick={() => setInspectingLead(sampleLead)}
            className="p-4 rounded-xl bg-[#10121a] hover:bg-[#141824] border border-blue-500/30 text-left transition-colors cursor-pointer active-press group"
          >
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1">
              <span>📂 Testar Gaveta de Inspeção (Drawer)</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Abre a gaveta lateral com transição tátil de mola (spring-drawer) para inspeção profunda de lead.
            </p>
            <span className="text-[10px] text-blue-400 mt-3 inline-block font-mono group-hover:underline">
              Abrir LeadDrawer →
            </span>
          </button>
        </div>
      </section>

      {/* Modal WhatsApp de Teste */}
      <WhatsAppModal
        isOpen={testWaModal}
        onClose={() => setTestWaModal(false)}
        targetData={sampleApolice}
        isLead={false}
        templates={[]}
        brokerName="Corretor Demonstrativo"
        brokerOrgName="Prime Seguros PJ"
        onSuccess={() => setTestWaModal(false)}
      />

      {/* Modal Vapi de Teste */}
      <VapiCallModal
        isOpen={testVapiModal}
        onClose={() => setTestVapiModal(false)}
        lead={sampleLead}
        onSuccess={() => setTestVapiModal(false)}
      />

      {/* Gaveta Lateral de Teste */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setInspectingLead(null)}
          />

          <div className="relative w-full max-w-lg bg-[#10121a] border-l border-zinc-800 h-full overflow-y-auto shadow-2xl p-6 sm:p-7 flex flex-col justify-between z-10 spring-drawer">
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-400">
                      Score: <strong className="text-white font-mono">{inspectingLead.score}/100</strong>
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-500 font-mono">Ref #DEMO-99</span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {inspectingLead.nome}
                  </h2>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    (11) 98765-4321 • {inspectingLead.email}
                  </div>
                </div>

                <button
                  onClick={() => setInspectingLead(null)}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer active-press"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[#090a0f] border border-zinc-800 space-y-2">
                <span className="text-xs font-medium text-zinc-300 block">
                  Diagnóstico da análise técnica
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {inspectingLead.resumoIa}
                </p>
                <div className="text-xs text-blue-400 font-medium pt-1">
                  Nível de urgência: <span className="capitalize">{inspectingLead.urgencia}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-500 block mb-1">Ramo pretendido</span>
                  <span className="text-xs font-semibold text-zinc-200">{inspectingLead.ramoDesejado}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-500 block mb-1">Origem da ingestão</span>
                  <span className="text-xs font-semibold text-zinc-200">{inspectingLead.origem}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#090a0f] border border-zinc-800">
                <span className="text-[11px] font-medium text-zinc-500 block mb-1">Histórico & parâmetros</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{inspectingLead.notas}</p>
              </div>

              <button
                onClick={() => setInspectingLead(null)}
                className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors cursor-pointer active-press"
              >
                Fechar gaveta de demonstração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
