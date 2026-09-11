# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Corretor de Seguros PJ e operadores de corretora de seguros independente/médio porte.
- Operam o sistema durante toda a jornada de trabalho em desktop/notebook.
- Tomam decisões rápidas sob forte pressão de prazo: SLA de contato de novos leads (meta < 45 segundos) e vencimento de apólices com risco iminente de perda para a concorrência.
- Valorizam densidade de informação, visibilidade temporal clara e precisão de cálculos sobre ornamentos visuais.

## Product Purpose

Plataforma operacional de ponta a ponta (SaaS Next.js 16 + Tailwind CSS + Prisma + SQLite/Postgres) voltada para gestão de esteira de leads, orquestração de multicálculo de seguros e radar preditivo de renovações com prevenção ativa de churn.

O sucesso do produto é medido por:
1. Redução do tempo de primeiro contato com o lead (*Speed-to-Lead* < 45s).
2. Taxa de conversão de cotações em apólices emitidas.
3. Retenção de carteira com renovações antecipadas em janelas seguras de 15 a 30 dias antes do vencimento.

## Positioning

Diferente de CRMs genéricos ou planilhas estáticas de corretora, o Insurance Lead Engine combina triagem inteligente de leads com cálculo estruturado de apólices e uma régua temporal ativa de risco de cancelamento, permitindo que a corretora execute ações no momento exato de maior propensão de compra ou renovação.

## Operating Context

- **Cockpit Operacional B2B de Uso Contínuo**: Alta densidade de dados, leitura rápida de tabelas, identificação imediata de prioridades através de códigos temporais e status semânticos.
- **Módulos Principais**:
  - `/dashboard/leads`: Esteira unificada de triagem, pontuação e contato rápido via WhatsApp/Voz AI.
  - `/dashboard/renovacoes`: Radar de renovações com régua de decaimento temporal e risco de churn.
  - `/dashboard/cotacao-cockpit`: Matriz comparativa de seguradoras (Porto Seguro, Tokio Marine, Allianz, Bradesco, Azul, HDI, Zurich, Suhai).
  - `/dashboard/simulador`: Motor interativo de cálculo de prêmio, comissão e perfil do segurado.
  - `/dashboard/importar`: Ingestão de planilhas CSV/XLSX de carteiras de apólices.
  - `/dashboard/templates`: Gestão de réguas de comunicação e mensagens estruturadas.
  - `/dashboard/configuracoes`: Parâmetros da corretora e integrações de canais.

## Capabilities and Constraints

- Respostas e feedback instantâneos: microinterações táteis de alta precisão (`active-press`, física de gaveta suave com `spring-drawer`).
- Dados tabulares e métricas com fontes mono-numéricas (`JetBrains Mono`, `tabular-nums`) para evitar oscilações visuais e fadiga ocular.
- Urgência temporal (dias até vencimento, SLA de atendimento) é a dimensão hierárquica mais importante de todo o design do produto.
- Rejeição expressa a clichês de IA: sem gradientes flutuantes de fundo, sem emojis em menus operacionais, sem badges indistinguíveis com todas as cores em caixa-alta e sem cartões estatísticos monótonos repetidos.

## Brand Commitments

- **Nome**: Insurance Lead Engine — Speed-to-Lead & Renewal Radar.
- **Tom de Voz**: Sóbrio, técnico, financeiro, assertivo e focado em produtividade operacional.
- **Padrão Estético (Taste Dials)**:
  - `DENSITY`: 8-9 (alta densidade de informação sem poluição visual).
  - `MOTION`: 2-3 (mínimo, propositado, sem animações decorativas lentas).
  - `VARIANCE`: 5-6 (identidade marcante de software financeiro institucional, sem cair em padrões genéricos).

## Product Principles

1. **Urgência Temporal com Dispositivo Estrutural**: A proximidade do vencimento e o SLA de atendimento devem ser evidentes na estrutura do layout (linhas de tempo, réguas de janelas, barras proporcionais), e não apenas em pequenas etiquetas de texto.
2. **Densidade e Eficiência de Varredura**: Priorizar a quantidade de informação útil visível acima da dobra para que o corretor visualize status e tome decisões sem scroll desnecessário.
3. **Precisão Numérica Financeira**: Valores de prêmios, comissões, pontuações e prazos devem ser apresentados em tipografia tabular monospaçada limpa.
4. **Hierarquia Cognitiva Real**: Badges e alertas devem ter pesos visuais drasticamente diferentes dependendo da gravidade (um risco iminente de < 15 dias deve saltar aos olhos muito antes de um canal de marketing de origem).
5. **Física de Interação Tátil**: Respostas de clique rápidas e molas sutis que transmitam a sensação de um software nativo e veloz.
