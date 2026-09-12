# SITE.md — LeadEngine (Insurance Lead Engine & Underwriting Hub)

## 1. Core Identity
- **Project Name**: LeadEngine (Insurance Lead Engine & Underwriting Hub)
- **Stitch Project**: `stitch_insurance_lead_design_system`
- **Mission**: Plataforma executiva de alta velocidade voltada para corretoras de seguros, unindo fila de triagem de leads (Speed-to-Lead < 5 min), cotação multisseguradoras em tempo real e radar preventivo de renovação de apólices.
- **Target Audience**: Corretores de seguros, subscritores e operadores de atendimento PME.
- **Voice**: Clean executive, sóbrio, neobank ágil, preciso e operacional.

## 2. Visual Language
- **Vibe**: Clean Executive Neobank / Precision Financial UI.
- **Paleta Base**:
  - Background: `#fbf9f9`
  - Cards & Painéis: `#ffffff`
  - Bordas e Divisões: `#e9e8e7` / `#c3c6d3`
  - Cor Primária: `#275ba5` (Azul corporativo)
  - Cores de Ação: `#10b981` (WhatsApp / Bound) e `#d7e0f5` (Secondary Container)
- **Tipografia**: Inter (Google Fonts) e Material Symbols Outlined.
- **Layout Rhythm**: Sidebar lateral esquerda fixa (`w-64`) + Top Header fixo (`h-16`) + Área de canvas fluida.

## 3. Architecture & File Structure
```
insurance-lead-engine/
├── .stitch/
│   ├── DESIGN.md           # Design System oficial (Light Neobank)
│   ├── SITE.md             # Memória contínua e constituição do Loop
│   ├── next-prompt.md      # Bastão de execução da próxima iteraçao
│   └── code.html           # Mockup estrutural exportado do Stitch
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Fontes globais (Inter, Material Symbols)
│   │   ├── globals.css     # Tokens Tailwind v4 @theme
│   │   └── dashboard/
│   │       ├── layout.tsx  # DashboardShell persistente
│   │       ├── page.tsx    # Overview / Insurtech Cockpit
│   │       ├── leads/      # Leads Queue & Speed-to-Lead
│   │       ├── renovacoes/ # Radar de Renovações & Régua Temporal
│   │       ├── cotacao-cockpit/ # Cotação Multisseguradoras
│   │       ├── simulador/  # Simulador FIPE & Propostas
│   │       ├── importar/   # Ingestão de Planilhas Excel/CSV
│   │       ├── templates/  # Templates de WhatsApp
│   │       └── configuracoes/ # Configurações da Corretora & Webhook
│   └── components/
│       ├── DashboardShell.tsx  # Sidebar + Header do Stitch
│       ├── WhatsAppModal.tsx   # Disparo rápido com templates
│       └── VapiCallModal.tsx   # Chamadas de voz
```

## 4. Live Sitemap
- [x] `/dashboard` — Overview & Insurtech Cockpit (4 KPIs, Deals, Funnel, Executive Actions, Carrier Appetite, Underwriters)
- [x] `/dashboard/leads` — Fila de Leads & Speed-to-Lead (< 5 min SLA, filtros por ramo, WhatsApp 1-clique)
- [x] `/dashboard/renovacoes` — Radar de Renovações (Timeline proporcional < 15d, 15-30d, em dia, vencidas)
- [x] `/dashboard/cotacao-cockpit` — Cockpit de Cotação Multisseguradoras (Porto, Tokio, Allianz, Bradesco, HDI)
- [x] `/dashboard/simulador` — Simulador de Cotações com Tabela FIPE
- [x] `/dashboard/importar` — Importador de Carteira Excel/CSV com mapeamento de colunas
- [x] `/dashboard/templates` — Gerenciador de Templates dinâmicos de WhatsApp
- [x] `/dashboard/configuracoes` — Configuração de Organização e URL de Webhook

## 5. The Roadmap (Backlog de Iterações & Comercialização)
- [x] **Etapa 1: O Fechador (Pilar 4)**: Emissão de Proposta Comercial em PDF timbrado com quadro comparativo multisseguradoras e blindagem do importador de planilhas.
- [x] **Etapa 2: A Esteira Viva (Pilar 1)**: Webhook universal tokenizado para Meta Ads/Google Ads + Disparo de WhatsApp automático em < 30s.
- [x] **Etapa 3: A Base Sólida (Pilar 2)**: Suporte a PostgreSQL multi-tenant em nuvem (`prisma/schema.postgresql.prisma`), isolamento estrito por `organizationId` e manual `DEPLOYMENT.md`.
- [x] **Etapa 4: A Máquina de Vendas (Pilar 3)**: Auto-cadastro self-service (`/cadastro`), inicialização automática de templates, módulo de planos e faturamento (`/dashboard/planos`) com checkout PIX/Cartão.

## 6. Creative Freedom Guidelines
- Priorizar sempre estética clara `#fbf9f9` com cartões brancos e bordas `#e9e8e7`.
- Manter ícones em Material Symbols Outlined.
- Priorizar velocidade de ação do corretor (1 clique para abrir conversa no WhatsApp).
