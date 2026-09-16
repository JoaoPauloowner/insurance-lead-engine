# ROADMAP_IMPLEMENTATION.md — Insurance Lead Engine

## Fase 0 — Decisões antes de codar (esta rodada de documentos)
- Fechar ADR-001 a ADR-004 (02-ARCHITECTURE.md)
- Validar PRD e regras de negócio críticas com pelo menos um corretor real (não assumir sozinho)
- Definir provedor de Postgres, WhatsApp Business API e SMS

## Fase 1 — Fundação (sem IA ainda)
- Setup Next.js 16 + Tailwind + Prisma + Postgres
- Schema do banco (03-DATA_MODEL.md) e migrations iniciais
- Autenticação e multi-tenancy básica (broker_id em tudo)
- CRUD manual de Lead, Apolice — sem automação ainda
- `/dashboard/configuracoes` mínimo (parâmetros da corretora)

## Fase 2 — Ingestão e scoring
- Webhook Gateway único (`/api/webhooks/lead-intake`) com dedup 24h
- Agente de Scoring (determinístico primeiro — regras simples; IA depois de validar as regras)
- `/dashboard/leads` com esteira priorizada por score

## Fase 3 — Cascata de canais
- Integração Vapi (voz ativa) com guardrails de compliance (07-SECURITY_COMPLIANCE.md)
- Integração WhatsApp Business API (agente "Aria")
- Fallback automático voz → WhatsApp → SMS
- Camada de validação determinística bloqueando menção a preço/franquia

## Fase 4 — Cotação e cockpit
- `/dashboard/cotacao-cockpit` com as 8 seguradoras
- `/dashboard/simulador` (cálculo de comissão — regra de negócio, não LLM)
- Blueprint comercial (resumo executivo para o corretor)

## Fase 5 — Renovação e importação
- `/dashboard/importar` (CSV/XLSX de carteira)
- Radar de renovação com janela de 15-30 dias e risco de churn
- `/dashboard/templates` (réguas de comunicação)

## Fase 6 — Migração dos sistemas legados
- Seguir ordem de unificação do 06-WORKFLOWS_INTEGRATION.md
- Migrar dados históricos se decidido na Fase 0
- Rollout gradual, descomissionar legado só após paridade validada

## Fase 7 — Piloto e métricas
- Rodar com 1-2 corretoras piloto
- Validar as 3 métricas do PRD (Speed-to-Lead, conversão, retenção de renovação)
- Só então avançar para multi-filial/Enterprise

## Regra de ouro entre fases
Nenhuma fase que envolva IA gerando conteúdo para o cliente final (voz/WhatsApp) vai para produção sem os guardrails de compliance (Fase 3) testados — mesmo que isso atrase o cronograma.
